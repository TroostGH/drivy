// charts.js — wrapper Chart.js con stile Material 3, theme-aware.
const reg = {};
const cssVar = (n) => getComputedStyle(document.body).getPropertyValue(n).trim();

function destroy(id) { if (reg[id]) { reg[id].destroy(); delete reg[id]; } }
export function destroyAll() { Object.keys(reg).forEach(destroy); }

const fontFamily = "Inter, Roboto, sans-serif";
function baseOpts() {
  const grid = cssVar('--outline-variant');
  const text = cssVar('--on-surface-variant');
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: cssVar('--inverse-surface'),
        titleColor: cssVar('--inverse-on-surface'),
        bodyColor: cssVar('--inverse-on-surface'),
        padding: 10, cornerRadius: 10, displayColors: true, boxPadding: 4,
        titleFont: { family: fontFamily, weight: '700' },
        bodyFont: { family: fontFamily },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { display: false },
        ticks: { color: text, font: { family: fontFamily, size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
      y: { grid: { color: grid, drawTicks: false }, border: { display: false },
        ticks: { color: text, font: { family: fontFamily, size: 11 }, padding: 8 } },
    },
  };
}

export function monthlyBars(id, data) {
  destroy(id);
  const el = document.getElementById(id); if (!el) return;
  const labels = data.map((d) => {
    const [y, m] = d.month.split('-'); return `${m}/${y.slice(2)}`;
  });
  const o = baseOpts();
  o.scales.x.stacked = true; o.scales.y.stacked = true;
  o.plugins.tooltip.callbacks = { label: (c) => `${c.dataset.label}: € ${c.raw.toFixed(0)}` };
  reg[id] = new Chart(el, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Rifornimento', data: data.map((d) => d.fuel), backgroundColor: cssVar('--fuel'), borderRadius: 4, maxBarThickness: 22, stack: 's' },
      { label: 'Manutenzione', data: data.map((d) => d.maintenance), backgroundColor: cssVar('--maint'), borderRadius: 4, maxBarThickness: 22, stack: 's' },
    ] }, options: o,
  });
}

export function donut(id, items) {
  destroy(id);
  const el = document.getElementById(id); if (!el) return;
  reg[id] = new Chart(el, {
    type: 'doughnut',
    data: { labels: items.map((i) => i.label),
      datasets: [{ data: items.map((i) => i.value), backgroundColor: items.map((i) => i.color),
        borderWidth: 0, hoverOffset: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: { legend: { display: false },
        tooltip: { backgroundColor: cssVar('--inverse-surface'), titleColor: cssVar('--inverse-on-surface'),
          bodyColor: cssVar('--inverse-on-surface'), padding: 10, cornerRadius: 10,
          callbacks: { label: (c) => ` € ${c.raw.toFixed(0)}` } } } },
  });
}

export function line(id, points, opts = {}) {
  destroy(id);
  const el = document.getElementById(id); if (!el) return;
  const color = opts.color || cssVar('--primary');
  const o = baseOpts();
  if (opts.yFmt) o.scales.y.ticks.callback = (v) => opts.yFmt(v);
  o.plugins.tooltip.callbacks = { label: (c) => (opts.tipFmt ? opts.tipFmt(c.raw) : c.raw) };
  const fill = opts.fill !== false;
  const grad = (() => {
    const ctx = el.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, el.height || 220);
    g.addColorStop(0, color + '44'); g.addColorStop(1, color + '00'); return g;
  })();
  reg[id] = new Chart(el, {
    type: 'line',
    data: { labels: points.map((p) => p.x),
      datasets: [{ data: points.map((p) => p.y), borderColor: color, backgroundColor: fill ? grad : 'transparent',
        fill, tension: .35, borderWidth: 2.5, pointRadius: 0, pointHoverRadius: 5,
        pointHoverBackgroundColor: color, pointBackgroundColor: color }] },
    options: o,
  });
}
