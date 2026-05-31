// app.js — Drivy. UI, navigazione, form, render.
import { initStore, Store, subscribe, getSettings, saveSettings, isFirebase } from './store.js';
import * as S from './stats.js';
import * as Charts from './charts.js';

/* ---------------- Icone (Material) ---------------- */
const P = {
  fuel:'M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z',
  build:'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
  car:'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
  list:'M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z',
  chart:'M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z',
  settings:'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z',
  add:'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
  edit:'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z',
  del:'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z',
  close:'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  check:'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  speed:'M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z',
  place:'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z',
  cal:'M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z',
  euro:'M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1s.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z',
  route:'M19 15.18V7c0-2.21-1.79-4-4-4s-4 1.79-4 4v10c0 1.1-.9 2-2 2s-2-.9-2-2V8.82C8.16 8.4 9 7.3 9 6c0-1.66-1.34-3-3-3S3 4.34 3 6c0 1.3.84 2.4 2 2.82V17c0 2.21 1.79 4 4 4s4-1.79 4-4V7c0-1.1.9-2 2-2s2 .9 2 2v8.18c-1.16.42-2 1.52-2 2.82 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82z',
  drop:'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z',
  swap:'M6.99 11 3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z',
  back:'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
  schedule:'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
  dark:'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z',
  dl:'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
  up:'M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z',
  info:'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  trend:'M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z',
  cam:'M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z',
  chev:'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
  expand:'M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z',
  tune:'M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z',
  calc:'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm5 8h-2v-6h2v6zm0-8h-2V7h2v2z',
};
const icon = (n, cls='') => `<svg viewBox="0 0 24 24" fill="currentColor" class="${cls}" aria-hidden="true"><path d="${P[n]||''}"/></svg>`;
const logoMark = `<svg viewBox="0 0 120 120" width="28" height="28" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFA62B"/><stop offset="1" stop-color="#F2641B"/></linearGradient></defs><rect width="120" height="120" rx="28" fill="url(#lg)"/><polygon points="32,52 54,52 62,64 26,64" fill="#fff"/><rect x="16" y="62" width="72" height="16" rx="8" fill="#fff"/><circle cx="33" cy="79" r="9" fill="#0B1733"/><circle cx="33" cy="79" r="3.8" fill="#fff"/><circle cx="72" cy="79" r="9" fill="#0B1733"/><circle cx="72" cy="79" r="3.8" fill="#fff"/><circle cx="88" cy="40" r="19" fill="#fff"/><g transform="translate(76,28)" fill="#F2641B"><path d="M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1s.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z"/></g></svg>`;

/* ---------------- Format ---------------- */
const settings0 = getSettings();
const eur = (n, dp=2) => '€ ' + (n||0).toLocaleString('it-IT', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const eur0 = (n) => '€ ' + Math.round(n||0).toLocaleString('it-IT');
const numf = (n, dp=0) => (n||0).toLocaleString('it-IT', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const km = (n) => numf(Math.round(n)) + ' km';
const dShort = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
const dFull = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const monthLabel = (iso) => new Date(iso).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
const parseNum = (v) => { const x = parseFloat(String(v).replace(/\./g,'').replace(',', '.')); return Number.isFinite(x) ? x : (parseFloat(String(v).replace(',','.'))||0); };
const pNum = (v) => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) ? x : 0; };

/* ---------------- Stato app ---------------- */
let route = 'home';
let expandedId = null;
let reportTab = 'generale';
let settings = getSettings();

applyTheme();

/* ---------------- Helpers DOM ---------------- */
const $ = (s, r=document) => r.querySelector(s);
const app = () => document.getElementById('app');

function activeVehicle() {
  const vs = Store.vehicles();
  if (!vs.length) return null;
  let v = vs.find((x) => x.id === settings.activeVehicleId);
  if (!v) { v = vs[0]; settings = saveSettings({ activeVehicleId: v.id }); }
  return v;
}
function activeEntries() {
  const v = activeVehicle();
  return v ? Store.entriesFor(v.id) : [];
}

function applyTheme() {
  const t = settings.theme;
  const sys = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = t === 'dark' || (t === 'system' && sys);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { applyTheme(); render(); });

/* ---------------- Snackbar ---------------- */
let snackT;
function snack(msg) {
  let el = $('#snackbar');
  if (!el) { el = document.createElement('div'); el.id = 'snackbar'; el.className = 'snackbar'; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(snackT); snackT = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------------- Sheet ---------------- */
function openSheet(html, onMount) {
  closeSheet(true);
  const scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.id = 'scrim';
  const sheet = document.createElement('div'); sheet.className = 'sheet'; sheet.id = 'sheet';
  sheet.innerHTML = `<div class="grab"></div><button class="icon-btn close" data-close="1">${icon('close')}</button>${html}`;
  document.body.appendChild(scrim); document.body.appendChild(sheet);
  requestAnimationFrame(() => { scrim.classList.add('show'); sheet.classList.add('show'); });
  scrim.addEventListener('click', () => closeSheet());
  sheet.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeSheet(); });
  if (onMount) onMount(sheet);
}
function closeSheet(instant) {
  const scrim = $('#scrim'), sheet = $('#sheet');
  if (!scrim && !sheet) return;
  if (instant) { scrim&&scrim.remove(); sheet&&sheet.remove(); return; }
  scrim&&scrim.classList.remove('show'); sheet&&sheet.classList.remove('show');
  setTimeout(() => { scrim&&scrim.remove(); sheet&&sheet.remove(); }, 300);
}
function confirmSheet(title, msg, danger=true) {
  return new Promise((res) => {
    openSheet(`<h2>${title}</h2><p class="muted" style="margin:0 4px 20px;font-weight:500">${msg}</p>
      <div style="display:flex;gap:10px"><button class="btn tonal full" data-no>Annulla</button>
      <button class="btn ${danger?'danger':'filled'} full" data-yes>Conferma</button></div>`);
    const sh = $('#sheet');
    sh.addEventListener('click', (e) => {
      if (e.target.closest('[data-yes]')) { closeSheet(); res(true); }
      if (e.target.closest('[data-no]')) { closeSheet(); res(false); }
    });
  });
}

/* ============================================================
   RENDER PRINCIPALE
   ============================================================ */
function render() {
  const vehicles = Store.vehicles();
  const titles = { home:'Drivy', report:'Report', garage:'Garage', settings:'Impostazioni' };
  const showFab = (route === 'home' || route === 'report') && vehicles.length > 0;

  let body = '';
  if (!vehicles.length && route !== 'garage' && route !== 'settings') body = viewNoVehicle();
  else if (route === 'home') body = viewHome();
  else if (route === 'report') body = viewReport();
  else if (route === 'garage') body = viewGarage();
  else if (route === 'settings') body = viewSettings();

  const appbar = route === 'home'
    ? `<div class="appbar" id="appbar"><span style="display:flex;align-items:center">${logoMark}</span>
        <h1 style="margin-left:10px">Drivy</h1>
        <button class="icon-btn" data-act="toggle-theme" title="Tema">${icon('dark')}</button></div>`
    : `<div class="appbar" id="appbar"><h1>${titles[route]}</h1>
        ${route==='report'?`<button class="icon-btn" data-act="toggle-theme">${icon('dark')}</button>`:''}</div>`;

  app().innerHTML = `${appbar}<div class="view view-enter" id="view">${body}</div>
    ${showFab ? `<button class="fab" data-act="add">${icon('add')} Aggiungi</button>` : ''}
    <nav class="bottomnav"><div class="inner">
      ${navItem('home','list','Storico')}
      ${navItem('report','chart','Report')}
      ${navItem('garage','car','Garage')}
      ${navItem('settings','settings','Impostazioni')}
    </div></nav>`;

  // charts dopo il mount
  if (route === 'report') requestAnimationFrame(drawReportCharts);
  // scroll shadow appbar
  const view = $('#view');
  const bar = $('#appbar');
  const onScroll = () => bar && bar.classList.toggle('scrolled', window.scrollY > 6);
  window.onscroll = onScroll; onScroll();
}
function navItem(r, ic, label) {
  return `<button class="navitem ${route===r?'active':''}" data-nav="${r}">
    <span class="pill">${icon(ic)}</span><span>${label}</span></button>`;
}

/* ============================================================
   VIEW: Nessun veicolo
   ============================================================ */
function viewNoVehicle() {
  return `<div class="empty" style="margin-top:40px">${icon('car')}
    <p>Nessun veicolo</p>
    <p class="muted" style="font-weight:500;margin-top:-6px">Aggiungi la tua auto per iniziare a monitorare costi e consumi.</p>
    <button class="btn filled" data-act="add-vehicle" style="margin-top:16px">${icon('add')} Aggiungi veicolo</button></div>`;
}

/* ============================================================
   VIEW: HOME / Storico
   ============================================================ */
function viewHome() {
  const v = activeVehicle();
  const entries = activeEntries();
  const sum = S.summary(entries, v);
  const life = S.lifetimeConsumption(entries.filter((e)=>e.type==='fuel'));
  const pred = S.nextRefuel(entries.filter((e)=>e.type==='fuel'));
  const unit = settings.consumptionUnit;
  const consVal = unit === 'l100' ? `${numf(life.l100,1)} <small>L/100km</small>` : `${numf(life.kml,1)} <small>km/L</small>`;

  // spesa mese corrente
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthSpend = entries.filter((e)=>{const d=new Date(e.date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`===monthKey;}).reduce((a,e)=>a+(e.cost||0),0);

  const lastFuel = entries.filter((e)=>e.type==='fuel' && e.odometer>0).sort((a,b)=>b.odometer-a.odometer)[0];
  const kmSinceFuel = lastFuel ? Math.max(0, sum.lastOdo - lastFuel.odometer) : 0;
  const lastPrice = (entries.filter((e)=>e.type==='fuel'&&e.pricePerLiter>0).sort((a,b)=>a.date<b.date?1:-1)[0]||{}).pricePerLiter || 0;

  const multi = Store.vehicles().length > 1;

  let hero = `<div class="hero">
    ${v.photo ? `<img class="photo" src="${v.photo}" alt="" onerror="this.style.display='none'">` : ''}
    <div class="grad"></div>
    ${v.plate ? `<span class="badge">${v.plate}</span>` : ''}
    ${multi ? `<button class="switch" data-act="switch-vehicle">${icon('swap')} Cambia</button>` : ''}
    <div class="content">
      <p class="vname">${v.name||'Auto'}</p>
      <p class="vmodel">${v.model||''} ${v.fuelType?'· '+v.fuelType:''}</p>
      <div class="vodo">${icon('speed')}<b>${numf(sum.lastOdo)}</b><span>km</span></div>
    </div></div>`;

  let predBanner = '';
  if (pred) {
    const dl = pred.daysLeft;
    const when = dl <= 0 ? 'A breve' : (dl === 1 ? 'Domani' : `Tra ${dl} giorni`);
    predBanner = `<div class="predict">
      <div class="pi">${icon('schedule')}</div>
      <div><div class="t1">Prossimo rifornimento</div><div class="t2">≈ ${km(pred.odometer)} · ~${pred.avgKm} km/pieno</div></div>
      <div class="when">${when}<small>${dShort(pred.date)}</small></div></div>`;
  }

  const stats = `<div class="stats-grid">
    <div class="stat tile-fuel"><div class="lab"><span class="d">${icon('drop')}</span>Consumo reale</div>
      <div class="val">${consVal}</div><div class="sub2">media su ${life.n} pieni</div></div>
    <div class="stat tile-primary"><div class="lab"><span class="d">${icon('cal')}</span>Questo mese</div>
      <div class="val">${eur0(monthSpend)}</div><div class="sub2">${monthLabel(now.toISOString())}</div></div>
    <div class="stat tile-tert"><div class="lab"><span class="d">${icon('route')}</span>Costo / km</div>
      <div class="val">${eur(sum.costPerKm,3)}</div><div class="sub2">${km(sum.distance)} totali</div></div>
    <div class="stat tile-maint"><div class="lab"><span class="d">${icon('fuel')}</span>Ultimo pieno</div>
      <div class="val">${numf(kmSinceFuel)} <small>km fa</small></div><div class="sub2">${lastPrice?eur(lastPrice,3)+'/L':''}</div></div>
  </div>`;

  return hero + predBanner + stats + timelineHTML(entries, v);
}

function entryTitle(e) {
  if (e.type === 'fuel') return 'Rifornimento';
  return e.subtype || 'Manutenzione';
}
function timelineHTML(entries, v) {
  if (!entries.length) return `<div class="empty">${icon('list')}<p>Nessuna spesa registrata</p></div>`;
  const sorted = [...entries].sort((a,b)=>a.date<b.date?1:-1);
  let html = '<div class="tl">'; let curMonth = '';
  for (const e of sorted) {
    const mk = monthLabel(e.date);
    if (mk !== curMonth) { curMonth = mk; html += `<div class="month-h">${mk}</div>`; }
    html += entryHTML(e);
  }
  return html + '</div>';
}
function entryHTML(e) {
  const fuel = e.type === 'fuel';
  const meta = [];
  meta.push(`<span class="m">${icon('speed')}${km(e.odometer)}</span>`);
  if (fuel) {
    if (e.liters) meta.push(`<span class="m">${icon('drop')}${numf(e.liters,2)} L</span>`);
    if (e.station) meta.push(`<span class="m">${icon('place')}${e.station}</span>`);
  } else if (e.note) {
    meta.push(`<span class="m">${e.note}</span>`);
  }
  const expanded = expandedId === e.id;
  return `<div class="entry" data-entry="${e.id}">
    <div class="ic ${fuel?'ic-fuel':'ic-maint'}">${icon(fuel?'fuel':'build')}</div>
    <div class="body">
      <div class="r1"><span class="ttl">${entryTitle(e)}</span><span class="cost">${eur(e.cost)}</span></div>
      <div class="r2">${meta.join('')}<span class="date" style="margin-left:auto">${dShort(e.date)}</span></div>
    </div></div>
    ${expanded ? `<div class="entry-actions">
      <button class="btn text" data-act="edit-entry" data-id="${e.id}">${icon('edit')} Modifica</button>
      <button class="btn text" data-act="del-entry" data-id="${e.id}" style="color:var(--error)">${icon('del')} Elimina</button>
    </div>` : ''}`;
}

/* ============================================================
   VIEW: REPORT
   ============================================================ */
function viewReport() {
  const v = activeVehicle();
  const entries = activeEntries();
  const sum = S.summary(entries, v);
  const fuelE = entries.filter((e)=>e.type==='fuel');
  const life = S.lifetimeConsumption(fuelE);
  const recent = S.avgOfLast(S.consumptionSeries(fuelE), 5);
  const unit = settings.consumptionUnit;
  const cMain = unit==='l100' ? `${numf(life.l100,1)}` : `${numf(life.kml,1)}`;
  const cUnit = unit==='l100' ? 'L/100km' : 'km/L';
  const cRec = unit==='l100' ? `${numf(recent.l100,1)}` : `${numf(recent.kml,1)}`;

  const tabs = ['generale','rifornimento','manutenzione'];
  const tabLabels = { generale:'Generale', rifornimento:'Rifornimento', manutenzione:'Manutenzione' };
  let tabsHTML = `<div class="tabs">${tabs.map((t)=>`<button class="tab ${reportTab===t?'on':''}" data-tab="${t}">${tabLabels[t]}</button>`).join('')}</div>`;

  let content = '';
  if (reportTab === 'generale') {
    content = `
    <div class="stats-grid">
      <div class="stat tile-primary"><div class="lab"><span class="d">${icon('euro')}</span>Costo totale</div><div class="val">${eur0(sum.total)}</div><div class="sub2">${sum.nTotal} movimenti</div></div>
      <div class="stat tile-tert"><div class="lab"><span class="d">${icon('route')}</span>Distanza</div><div class="val">${numf(sum.distance)} <small>km</small></div><div class="sub2">${numf(Math.round(sum.distance/Math.max(1,sum.days/30.44)))} km/mese</div></div>
      <div class="stat tile-fuel"><div class="lab"><span class="d">${icon('speed')}</span>Costo / km</div><div class="val">${eur(sum.costPerKm,3)}</div><div class="sub2">carburante ${eur(sum.fuelPerKm,3)}</div></div>
      <div class="stat tile-maint"><div class="lab"><span class="d">${icon('cal')}</span>Costo / mese</div><div class="val">${eur0(sum.costPerMonth)}</div><div class="sub2">${eur(sum.costPerDay)}/giorno</div></div>
    </div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('chart')}</span>Spese mensili</div>
      <div class="chart-wrap" style="height:220px"><canvas id="ch-monthly"></canvas></div>
      <div class="legend"><span><i style="background:var(--fuel)"></i>Rifornimento</span><span><i style="background:var(--maint)"></i>Manutenzione</span></div>
    </div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('euro')}</span>Ripartizione costi</div>
      <div style="display:flex;align-items:center;gap:18px">
        <div class="chart-wrap" style="width:150px;height:150px;flex-shrink:0"><canvas id="ch-donut"></canvas></div>
        <div style="flex:1">
          ${donutLegend('Rifornimento','var(--fuel)',sum.fuelCost,sum.total)}
          ${donutLegend('Manutenzione','var(--maint)',sum.maintCost,sum.total)}
        </div>
      </div>
    </div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('trend')}</span>Contachilometri</div>
      <div class="chart-wrap" style="height:200px"><canvas id="ch-odo"></canvas></div></div>`;
  } else if (reportTab === 'rifornimento') {
    const prices = S.priceSeries(fuelE);
    const avgPrice = prices.length ? prices.reduce((a,p)=>a+p.price,0)/prices.length : 0;
    content = `
    <div class="card" style="background:var(--fuel-container);color:var(--on-fuel-container)">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><div style="font-size:13px;font-weight:700;opacity:.8">Consumo medio reale</div>
          <div style="font-size:34px;font-weight:800;letter-spacing:-1px;margin-top:2px">${cMain} <span style="font-size:16px">${cUnit}</span></div>
          <div style="font-size:12.5px;font-weight:600;opacity:.8;margin-top:2px">ultimi 5 pieni: ${cRec} ${cUnit}</div></div>
        <div style="text-align:right;font-size:13px;font-weight:600">
          <div>${numf(sum.litersTotal,0)} L totali</div><div style="opacity:.8">${sum.nFuel} rifornimenti</div>
          <div style="opacity:.8">media ${eur(avgPrice,3)}/L</div></div>
      </div></div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('drop')}</span>Andamento consumo (${cUnit})</div>
      <div class="chart-wrap" style="height:200px"><canvas id="ch-cons"></canvas></div></div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('euro')}</span>Prezzo carburante (€/L)</div>
      <div class="chart-wrap" style="height:200px"><canvas id="ch-price"></canvas></div></div>`;
  } else {
    const maintE = entries.filter((e)=>e.type==='maintenance');
    const bd = S.maintenanceBreakdown(maintE);
    const maxC = bd.length ? bd[0].cost : 1;
    const totM = maintE.reduce((a,e)=>a+(e.cost||0),0);
    content = `
    <div class="stats-grid">
      <div class="stat tile-maint"><div class="lab"><span class="d">${icon('build')}</span>Totale manutenzione</div><div class="val">${eur0(totM)}</div><div class="sub2">${maintE.length} interventi</div></div>
      <div class="stat tile-primary"><div class="lab"><span class="d">${icon('route')}</span>Costo / 1000km</div><div class="val">${eur(totM/Math.max(1,sum.distance)*1000,1)}</div><div class="sub2">solo manutenzione</div></div>
    </div>
    <div class="card elev"><div class="card-title"><span class="ti">${icon('tune')}</span>Per tipologia</div>
      ${bd.map((b)=>`<div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:13.5px;font-weight:700;margin-bottom:5px"><span>${b.subtype}</span><span>${eur0(b.cost)}</span></div>
        <div style="height:8px;border-radius:6px;background:var(--surface-container-high);overflow:hidden"><div style="height:100%;width:${Math.max(4,b.cost/maxC*100)}%;background:var(--maint);border-radius:6px"></div></div>
      </div>`).join('')}
    </div>`;
  }
  return tabsHTML + content;
}
function donutLegend(label, color, value, total) {
  const pct = total>0 ? Math.round(value/total*100) : 0;
  return `<div style="display:flex;align-items:center;gap:10px;padding:7px 0">
    <i style="width:12px;height:12px;border-radius:4px;background:${color};display:inline-block"></i>
    <span style="font-weight:700;font-size:14px;flex:1">${label}</span>
    <span style="font-weight:800">${eur0(value)}</span>
    <span class="muted" style="font-size:12px;font-weight:700;width:38px;text-align:right">${pct}%</span></div>`;
}
function drawReportCharts() {
  const entries = activeEntries();
  const fuelE = entries.filter((e)=>e.type==='fuel');
  if (reportTab === 'generale') {
    Charts.monthlyBars('ch-monthly', S.monthly(entries));
    const sum = S.summary(entries, activeVehicle());
    Charts.donut('ch-donut', [
      { label:'Rifornimento', value:sum.fuelCost, color:getComputedStyle(document.body).getPropertyValue('--fuel').trim() },
      { label:'Manutenzione', value:sum.maintCost, color:getComputedStyle(document.body).getPropertyValue('--maint').trim() },
    ]);
    const odo = S.odometerSeries(entries);
    Charts.line('ch-odo', odo.map((p)=>({ x:dShort(p.date), y:p.odometer })),
      { color:getComputedStyle(document.body).getPropertyValue('--primary').trim(), yFmt:(v)=>numf(v/1000)+'k', tipFmt:(v)=>km(v) });
  } else if (reportTab === 'rifornimento') {
    const series = S.consumptionSeries(fuelE);
    const unit = settings.consumptionUnit;
    Charts.line('ch-cons', series.map((p)=>({ x:dShort(p.date), y: unit==='l100'?p.l100:p.kml })),
      { color:getComputedStyle(document.body).getPropertyValue('--fuel').trim(), tipFmt:(v)=>numf(v,1)+(unit==='l100'?' L/100km':' km/L') });
    const prices = S.priceSeries(fuelE);
    Charts.line('ch-price', prices.map((p)=>({ x:dShort(p.date), y:p.price })),
      { color:getComputedStyle(document.body).getPropertyValue('--tertiary').trim(), tipFmt:(v)=>eur(v,3)+'/L' });
  }
}

/* ============================================================
   VIEW: GARAGE
   ============================================================ */
function viewGarage() {
  const vs = Store.vehicles();
  let cards = vs.map((v) => {
    const en = Store.entriesFor(v.id);
    const sum = S.summary(en, v);
    const active = v.id === settings.activeVehicleId;
    return `<div class="card elev" data-act="select-vehicle" data-id="${v.id}" style="padding:0;overflow:hidden;cursor:pointer">
      <div class="hero" style="margin:0;border-radius:0;min-height:150px">
        ${v.photo?`<img class="photo" src="${v.photo}" onerror="this.style.display='none'">`:''}
        <div class="grad"></div>
        ${active?`<span class="badge" style="background:var(--primary);color:#fff">ATTIVA</span>`:''}
        <button class="icon-btn" data-act="edit-vehicle" data-id="${v.id}" style="position:absolute;top:8px;right:8px;z-index:3;color:#fff;background:rgba(0,0,0,.35)">${icon('edit')}</button>
        <div class="content" style="min-height:150px">
          <p class="vname" style="font-size:20px">${v.name}</p>
          <p class="vmodel">${v.model||''}</p>
        </div></div>
      <div style="display:flex;padding:12px 16px;gap:8px">
        <div style="flex:1"><div class="muted" style="font-size:11px;font-weight:700">CONTACHILOMETRI</div><div style="font-weight:800">${km(sum.lastOdo)}</div></div>
        <div style="flex:1"><div class="muted" style="font-size:11px;font-weight:700">SPESA TOTALE</div><div style="font-weight:800">${eur0(sum.total)}</div></div>
        <div style="flex:1"><div class="muted" style="font-size:11px;font-weight:700">MOVIMENTI</div><div style="font-weight:800">${sum.nTotal}</div></div>
      </div></div>`;
  }).join('');
  return cards + `<button class="btn tonal full" data-act="add-vehicle" style="margin-top:6px;padding:16px">${icon('add')} Aggiungi veicolo</button>`;
}

/* ============================================================
   VIEW: IMPOSTAZIONI
   ============================================================ */
function viewSettings() {
  const fb = isFirebase();
  const totalEntries = Store.entries().length;
  return `
  <div class="card"><div class="card-title"><span class="ti">${icon('drop')}</span>Unità di consumo</div>
    <div class="seg">
      <button data-set="unit" data-val="l100" class="${settings.consumptionUnit==='l100'?'on':''}">L/100km</button>
      <button data-set="unit" data-val="kml" class="${settings.consumptionUnit==='kml'?'on':''}">km/L</button>
    </div></div>
  <div class="card"><div class="card-title"><span class="ti">${icon('dark')}</span>Tema</div>
    <div class="seg">
      <button data-set="theme" data-val="system" class="${settings.theme==='system'?'on':''}">Sistema</button>
      <button data-set="theme" data-val="light" class="${settings.theme==='light'?'on':''}">Chiaro</button>
      <button data-set="theme" data-val="dark" class="${settings.theme==='dark'?'on':''}">Scuro</button>
    </div></div>
  <div class="card"><div class="card-title"><span class="ti">${icon('dl')}</span>Dati</div>
    <div class="list-row" data-act="export-json"><div class="lr-ic">${icon('dl')}</div><div style="flex:1"><div style="font-weight:700">Esporta backup (JSON)</div><div class="muted" style="font-size:12.5px">Tutti i veicoli e i movimenti</div></div>${icon('chev')}</div>
    <div class="divider"></div>
    <div class="list-row" data-act="import-csv"><div class="lr-ic">${icon('up')}</div><div style="flex:1"><div style="font-weight:700">Importa CSV Drivvo</div><div class="muted" style="font-size:12.5px">Aggiungi movimenti da un export Drivvo</div></div>${icon('chev')}</div>
  </div>
  <div class="card"><div class="card-title"><span class="ti">${icon('info')}</span>Informazioni</div>
    <div style="display:flex;justify-content:space-between;padding:8px 4px;font-size:14px"><span class="muted">Archiviazione</span><span class="badge-soft">${fb?'Firebase (cloud)':'Locale (browser)'}</span></div>
    <div style="display:flex;justify-content:space-between;padding:8px 4px;font-size:14px"><span class="muted">Movimenti totali</span><b>${totalEntries}</b></div>
    <div style="display:flex;justify-content:space-between;padding:8px 4px;font-size:14px"><span class="muted">Versione</span><b>Drivy 1.0</b></div>
  </div>
  <p class="center muted" style="font-size:12px;margin-top:18px">Drivy — monitora consumi e costi della tua auto 🚗</p>`;
}

/* ============================================================
   FORM: Rifornimento
   ============================================================ */
function nowLocalISO() {
  const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0,16);
}
function openFuelForm(existing) {
  const v = activeVehicle();
  const lastOdo = S.summary(activeEntries(), v).lastOdo;
  const e = existing || {};
  const dt = e.date ? e.date.slice(0,16) : nowLocalISO();
  openSheet(`
    <h2>${existing?'Modifica rifornimento':'Rifornimento'}</h2>
    <form id="form-fuel">
      <div class="field"><label>Data e ora</label><input class="input" type="datetime-local" id="f-date" value="${dt}"></div>
      <div class="field"><label>Contachilometri (km)</label><input class="input" inputmode="numeric" id="f-odo" placeholder="${numf(lastOdo)}" value="${e.odometer||''}">
        <div class="hint">Ultima lettura: ${km(lastOdo)}</div></div>
      <div class="row3">
        <div class="field"><label>Prezzo / L</label><input class="input" inputmode="decimal" id="f-price" value="${e.pricePerLiter||''}"></div>
        <div class="field"><label>Costo totale €</label><input class="input" inputmode="decimal" id="f-cost" value="${e.cost||''}"></div>
        <div class="field"><label>Litri</label><input class="input" inputmode="decimal" id="f-liters" value="${e.liters||''}"></div>
      </div>
      <div class="calc-hint" id="f-calc"></div>
      <div class="switch-row"><span class="sl">Pieno?</span><div class="tgl ${e.fullTank!==false?'on':''}" id="f-full"></div></div>
      <div class="field"><label>Distributore</label><input class="input" id="f-station" value="${e.station||''}" placeholder="es. Q8, Eni…"></div>
      <div class="field"><label>Note</label><input class="input" id="f-note" value="${e.note||''}"></div>
      <button class="btn filled full" type="submit" style="padding:15px;margin-top:6px">${icon('check')} Salva</button>
    </form>`, (sh) => {
    const price=$('#f-price',sh), cost=$('#f-cost',sh), liters=$('#f-liters',sh), full=$('#f-full',sh), calc=$('#f-calc',sh);
    let lastEdited = 'price';
    const upd = (src) => {
      lastEdited = src;
      const p=pNum(price.value), c=pNum(cost.value), l=pNum(liters.value);
      if (src!=='cost' && p>0 && l>0) cost.value = (p*l).toFixed(2);
      else if (src==='cost' && c>0 && l>0) price.value = (c/l).toFixed(3);
      else if (src==='cost' && c>0 && p>0) liters.value = (c/p).toFixed(2);
      const pp=pNum(price.value), ll=pNum(liters.value), cc=pNum(cost.value);
      calc.textContent = (pp&&ll)?`${numf(ll,2)} L × ${eur(pp,3)} = ${eur(cc)}`:'';
    };
    price.oninput=()=>upd('price'); liters.oninput=()=>upd('liters'); cost.oninput=()=>upd('cost'); upd('price');
    full.onclick=()=>full.classList.toggle('on');
    $('#form-fuel',sh).onsubmit = async (ev) => {
      ev.preventDefault();
      const odo = pNum($('#f-odo',sh).value) || lastOdo;
      const rec = {
        vehicleId: v.id, type:'fuel',
        date: new Date($('#f-date',sh).value).toISOString(),
        odometer: odo, cost: pNum(cost.value),
        liters: pNum(liters.value), pricePerLiter: pNum(price.value),
        fullTank: full.classList.contains('on'),
        fuelType: v.fuelType||'Diesel',
        station: $('#f-station',sh).value.trim(),
        note: $('#f-note',sh).value.trim(),
      };
      if (existing) await Store.updateEntry(existing.id, rec); else await Store.addEntry(rec);
      closeSheet(); snack(existing?'Rifornimento aggiornato':'Rifornimento salvato');
    };
  });
}

/* ============================================================
   FORM: Manutenzione
   ============================================================ */
function openMaintForm(existing) {
  const v = activeVehicle();
  const lastOdo = S.summary(activeEntries(), v).lastOdo;
  const e = existing || {};
  const dt = e.date ? e.date.slice(0,16) : nowLocalISO();
  const cur = e.subtype || 'Tagliando';
  const chips = S.MAINT_SUBTYPES.map((s)=>`<button type="button" class="fchip ${s===cur?'on':''}" data-sub="${s}">${s}</button>`).join('');
  openSheet(`
    <h2>${existing?'Modifica manutenzione':'Manutenzione'}</h2>
    <form id="form-maint">
      <div class="field"><label>Tipo di intervento</label><div class="chips" id="m-chips">${chips}</div>
        <input type="hidden" id="m-sub" value="${cur}"></div>
      <div class="row2">
        <div class="field"><label>Costo totale €</label><input class="input" inputmode="decimal" id="m-cost" value="${e.cost||''}"></div>
        <div class="field"><label>Contachilometri</label><input class="input" inputmode="numeric" id="m-odo" placeholder="${numf(lastOdo)}" value="${e.odometer||''}"></div>
      </div>
      <div class="field"><label>Data e ora</label><input class="input" type="datetime-local" id="m-date" value="${dt}"></div>
      <div class="field"><label>Note</label><input class="input" id="m-note" value="${e.note||''}" placeholder="es. dettagli intervento"></div>
      <button class="btn filled full" type="submit" style="padding:15px;margin-top:6px">${icon('check')} Salva</button>
    </form>`, (sh) => {
    $('#m-chips',sh).addEventListener('click',(ev)=>{
      const b=ev.target.closest('[data-sub]'); if(!b)return;
      sh.querySelectorAll('#m-chips .fchip').forEach((x)=>x.classList.remove('on'));
      b.classList.add('on'); $('#m-sub',sh).value=b.dataset.sub;
    });
    $('#form-maint',sh).onsubmit = async (ev) => {
      ev.preventDefault();
      const rec = {
        vehicleId: v.id, type:'maintenance',
        date: new Date($('#m-date',sh).value).toISOString(),
        odometer: pNum($('#m-odo',sh).value)||lastOdo,
        cost: pNum($('#m-cost',sh).value),
        subtype: $('#m-sub',sh).value,
        note: $('#m-note',sh).value.trim(),
      };
      if (existing) await Store.updateEntry(existing.id, rec); else await Store.addEntry(rec);
      closeSheet(); snack(existing?'Manutenzione aggiornata':'Manutenzione salvata');
    };
  });
}

/* ============================================================
   FORM: Veicolo
   ============================================================ */
const FUELS = ['Diesel','Benzina','GPL','Metano','Ibrida','Elettrica'];
function openVehicleForm(existing) {
  const e = existing || {};
  openSheet(`
    <h2>${existing?'Modifica veicolo':'Nuovo veicolo'}</h2>
    <form id="form-veh">
      <div class="field" style="text-align:center">
        <div id="v-photo-wrap" style="position:relative;width:100%;height:150px;border-radius:18px;overflow:hidden;background:linear-gradient(135deg,#3a4a5a,#1f2937);cursor:pointer" data-act="pick-photo">
          ${e.photo?`<img src="${e.photo}" id="v-photo-img" style="width:100%;height:100%;object-fit:cover">`:`<div style="display:flex;height:100%;align-items:center;justify-content:center;color:#fff;opacity:.85;gap:8px;font-weight:600">${icon('cam')} Aggiungi foto</div>`}
        </div>
        <input type="file" accept="image/*" id="v-file" hidden>
        <input type="hidden" id="v-photo" value="${e.photo||''}">
      </div>
      <div class="field"><label>Nome</label><input class="input" id="v-name" value="${e.name||''}" placeholder="es. Mercedes Classe A"></div>
      <div class="row2">
        <div class="field"><label>Modello</label><input class="input" id="v-model" value="${e.model||''}" placeholder="es. A180d W177"></div>
        <div class="field"><label>Targa</label><input class="input" id="v-plate" value="${e.plate||''}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Carburante</label><select class="select" id="v-fuel">${FUELS.map((f)=>`<option ${e.fuelType===f?'selected':''}>${f}</option>`).join('')}</select></div>
        <div class="field"><label>Serbatoio (L)</label><input class="input" inputmode="numeric" id="v-tank" value="${e.tankCapacity||''}"></div>
      </div>
      <div class="row2">
        <div class="field"><label>Data acquisto</label><input class="input" type="date" id="v-pdate" value="${(e.purchaseDate||'').slice(0,10)}"></div>
        <div class="field"><label>Prezzo acquisto €</label><input class="input" inputmode="decimal" id="v-pprice" value="${e.purchasePrice||''}"></div>
      </div>
      <div class="field"><label>Km iniziali</label><input class="input" inputmode="numeric" id="v-odo" value="${e.initialOdometer||''}" placeholder="0"></div>
      <button class="btn filled full" type="submit" style="padding:15px;margin-top:6px">${icon('check')} Salva</button>
      ${existing?`<button type="button" class="btn text full" data-act="del-vehicle" data-id="${existing.id}" style="color:var(--error);margin-top:8px">${icon('del')} Elimina veicolo</button>`:''}
    </form>`, (sh) => {
    const file=$('#v-file',sh), photo=$('#v-photo',sh), wrap=$('#v-photo-wrap',sh);
    wrap.onclick=()=>file.click();
    file.onchange=()=>{
      const f=file.files[0]; if(!f)return;
      downscaleImage(f, 1280, 0.82).then((durl)=>{ photo.value=durl; wrap.innerHTML=`<img src="${durl}" style="width:100%;height:100%;object-fit:cover">`; });
    };
    $('#form-veh',sh).onsubmit = async (ev) => {
      ev.preventDefault();
      const rec = {
        name: $('#v-name',sh).value.trim()||'Auto',
        model: $('#v-model',sh).value.trim(),
        plate: $('#v-plate',sh).value.trim().toUpperCase(),
        fuelType: $('#v-fuel',sh).value,
        tankCapacity: pNum($('#v-tank',sh).value)||null,
        purchaseDate: $('#v-pdate',sh).value||null,
        purchasePrice: pNum($('#v-pprice',sh).value)||null,
        initialOdometer: pNum($('#v-odo',sh).value)||0,
        photo: photo.value||null,
      };
      if (existing) { await Store.updateVehicle(existing.id, rec); snack('Veicolo aggiornato'); }
      else { await Store.addVehicle(rec); const vs=Store.vehicles(); settings=saveSettings({activeVehicleId:vs[vs.length-1].id}); snack('Veicolo aggiunto'); }
      closeSheet();
    };
  });
}
function downscaleImage(file, maxW, q) {
  return new Promise((res) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width*scale); c.height = Math.round(img.height*scale);
      c.getContext('2d').drawImage(img,0,0,c.width,c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', q));
    };
    img.src = url;
  });
}

/* ============================================================
   Picker veicolo / Add menu
   ============================================================ */
function openVehiclePicker() {
  const vs = Store.vehicles();
  openSheet(`<h2>Cambia veicolo</h2>${vs.map((v)=>`
    <div class="menu-item" data-act="select-vehicle" data-id="${v.id}">
      <div class="mi" style="background:var(--surface-container-high);color:var(--primary)">${icon('car')}</div>
      <div style="flex:1"><div class="mt">${v.name} ${v.id===settings.activeVehicleId?'<span class="badge-soft" style="margin-left:6px">attiva</span>':''}</div><div class="ms">${v.model||''}</div></div>
      ${icon('chev')}</div>`).join('')}
    <button class="btn tonal full" data-act="add-vehicle" style="margin-top:10px">${icon('add')} Aggiungi veicolo</button>`);
}
function openAddMenu() {
  openSheet(`<h2>Aggiungi movimento</h2>
    <div class="menu-item" data-act="add-fuel"><div class="mi ic-fuel">${icon('fuel')}</div>
      <div style="flex:1"><div class="mt">Rifornimento</div><div class="ms">Carburante, litri e prezzo</div></div>${icon('chev')}</div>
    <div class="menu-item" data-act="add-maint"><div class="mi ic-maint">${icon('build')}</div>
      <div style="flex:1"><div class="mt">Manutenzione</div><div class="ms">Tagliando, gomme, bollo, assicurazione…</div></div>${icon('chev')}</div>`);
}

/* ============================================================
   Export / Import
   ============================================================ */
function exportJSON() {
  const data = { vehicles: Store.vehicles(), entries: Store.entries(), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data,null,2)], { type:'application/json' });
  const a = document.createElement('a'); a.href=URL.createObjectURL(blob);
  a.download = `drivy-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
  snack('Backup esportato');
}
function importCsv() {
  const input = document.createElement('input'); input.type='file'; input.accept='.csv,text/csv';
  input.onchange = async () => {
    const f = input.files[0]; if(!f) return;
    const text = await f.text();
    const { parseDrivvo } = await import('./seed.js');
    const v = activeVehicle();
    const recs = parseDrivvo(text, v.id);
    const ok = await confirmSheet('Importa CSV', `Trovati ${recs.length} movimenti. Aggiungerli a "${v.name}"?`, false);
    if (!ok) return;
    for (const r of recs) { const { id, ...rest } = r; await Store.addEntry(rest); }
    snack(`${recs.length} movimenti importati`);
  };
  input.click();
}

/* ============================================================
   Eventi globali
   ============================================================ */
document.addEventListener('click', async (ev) => {
  const navBtn = ev.target.closest('[data-nav]');
  if (navBtn) { route = navBtn.dataset.nav; expandedId=null; render(); window.scrollTo(0,0); return; }

  const tabBtn = ev.target.closest('[data-tab]');
  if (tabBtn) { reportTab = tabBtn.dataset.tab; render(); return; }

  const setBtn = ev.target.closest('[data-set]');
  if (setBtn) {
    const k = setBtn.dataset.set, val = setBtn.dataset.val;
    if (k==='unit') settings = saveSettings({ consumptionUnit: val });
    if (k==='theme') { settings = saveSettings({ theme: val }); applyTheme(); }
    render(); return;
  }

  const entryRow = ev.target.closest('[data-entry]');
  if (entryRow && !ev.target.closest('.entry-actions')) {
    const id = entryRow.dataset.entry; expandedId = expandedId===id ? null : id; render(); return;
  }

  const actEl = ev.target.closest('[data-act]');
  if (!actEl) return;
  const act = actEl.dataset.act; const id = actEl.dataset.id;

  if (act==='add') return openAddMenu();
  if (act==='add-fuel') { closeSheet(); return openFuelForm(); }
  if (act==='add-maint') { closeSheet(); return openMaintForm(); }
  if (act==='add-vehicle') { closeSheet(); return openVehicleForm(); }
  if (act==='switch-vehicle') return openVehiclePicker();
  if (act==='toggle-theme') {
    const order=['system','light','dark']; const ni=(order.indexOf(settings.theme)+1)%3;
    settings = saveSettings({ theme: order[ni] }); applyTheme(); render(); snack('Tema: '+order[ni]); return;
  }
  if (act==='select-vehicle') { settings=saveSettings({activeVehicleId:id}); closeSheet(); route='home'; render(); return; }
  if (act==='edit-vehicle') { const v=Store.vehicles().find((x)=>x.id===(id||settings.activeVehicleId)); closeSheet(true); return openVehicleForm(v); }
  if (act==='del-vehicle') {
    const ok = await confirmSheet('Eliminare veicolo?', 'Verranno eliminati anche tutti i suoi movimenti. Operazione irreversibile.');
    if (ok) { await Store.deleteVehicle(id); settings=saveSettings({activeVehicleId:null}); closeSheet(); render(); snack('Veicolo eliminato'); }
    return;
  }
  if (act==='edit-entry') { const e=Store.entries().find((x)=>x.id===id); if(!e)return; return e.type==='fuel'?openFuelForm(e):openMaintForm(e); }
  if (act==='del-entry') {
    const ok = await confirmSheet('Eliminare movimento?', 'Questa azione non può essere annullata.');
    if (ok) { await Store.deleteEntry(id); expandedId=null; snack('Movimento eliminato'); }
    return;
  }
  if (act==='export-json') return exportJSON();
  if (act==='import-csv') return importCsv();
  if (act==='pick-photo') { /* gestito nel form */ }
});

/* ============================================================
   Avvio
   ============================================================ */
let firstRender = false;
subscribe(() => { settings = getSettings(); render(); firstRender = true; });
initStore().then(() => { if (!firstRender) render(); });
