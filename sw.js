// sw.js — Service worker di Drivy (PWA offline app-shell)
const CACHE = 'drivy-v2';
const SHELL = [
  './', 'index.html', 'app.css', 'app.js', 'store.js', 'seed.js',
  'stats.js', 'charts.js', 'config.js', 'manifest.webmanifest',
  'icon.svg', 'icon-maskable.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await Promise.all(SHELL.map((u) => c.add(u).catch(() => {})));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Non intercettare Firestore/Firebase (richiede rete e long-polling)
  if (/firestore|googleapis|firebaseio|gstatic\.com\/firebasejs/.test(url.href)) return;

  // Stessa origine → cache-first con aggiornamento in background
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cached = await caches.match(req);
      const net = fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || net;
    })());
    return;
  }

  // CDN (Chart.js, font) → stale-while-revalidate
  e.respondWith((async () => {
    const cached = await caches.match(req);
    const net = fetch(req).then((res) => {
      if (res && res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => cached);
    return cached || net;
  })());
});
