// stats.js — Calcoli di Drivy: consumi reali, totali, aggregazioni.
// Funzioni pure: ricevono gli array di dati e restituiscono numeri/serie.

export const round = (n, d = 2) => {
  const f = Math.pow(10, d);
  return Math.round((n + Number.EPSILON) * f) / f;
};

export const kmlToL100 = (kml) => (kml > 0 ? 100 / kml : 0);
export const l100ToKml = (l) => (l > 0 ? 100 / l : 0);

const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);
const byOdoAsc = (a, b) => (a.odometer - b.odometer) || (a.date < b.date ? -1 : 1);

export function splitEntries(entries) {
  const fuel = entries.filter((e) => e.type === 'fuel');
  const maint = entries.filter((e) => e.type === 'maintenance');
  return { fuel, maint };
}

// ---- Consumo reale, metodo "pieno-a-pieno" ----
// Tra due rifornimenti "pieno" la distanza percorsa viene divisa per i litri
// erogati nell'intervallo (somma di tutti i rifornimenti dopo il primo pieno,
// fino al pieno di chiusura incluso).
export function consumptionSeries(fuelEntries) {
  const fuel = [...fuelEntries].filter((e) => e.odometer > 0).sort(byOdoAsc);
  const series = [];
  let openIdx = -1; // indice dell'ultimo pieno
  let litersAcc = 0;
  for (let i = 0; i < fuel.length; i++) {
    const f = fuel[i];
    if (openIdx === -1) {
      if (f.fullTank) openIdx = i;
      continue;
    }
    litersAcc += f.liters; // litri di questo rifornimento appartengono all'intervallo aperto
    if (f.fullTank) {
      const dist = fuel[i].odometer - fuel[openIdx].odometer;
      if (dist > 0 && litersAcc > 0) {
        const kml = dist / litersAcc;
        // filtro anti-anomalie evidenti (dati Drivvo con refusi)
        if (kml >= 5 && kml <= 40) {
          series.push({
            date: f.date,
            odometer: f.odometer,
            distance: dist,
            liters: round(litersAcc, 2),
            kml: round(kml, 2),
            l100: round(kmlToL100(kml), 2),
          });
        }
      }
      openIdx = i;
      litersAcc = 0;
    }
  }
  return series; // ordinata per odometro crescente
}

export function lifetimeConsumption(fuelEntries) {
  const s = consumptionSeries(fuelEntries);
  if (!s.length) return { kml: 0, l100: 0, n: 0 };
  const dist = s.reduce((a, x) => a + x.distance, 0);
  const liters = s.reduce((a, x) => a + x.liters, 0);
  const kml = liters > 0 ? dist / liters : 0;
  return { kml: round(kml, 2), l100: round(kmlToL100(kml), 2), n: s.length, dist, liters: round(liters, 1) };
}

export function avgOfLast(series, n) {
  const last = series.slice(-n);
  if (!last.length) return { kml: 0, l100: 0 };
  const dist = last.reduce((a, x) => a + x.distance, 0);
  const liters = last.reduce((a, x) => a + x.liters, 0);
  const kml = liters > 0 ? dist / liters : 0;
  return { kml: round(kml, 2), l100: round(kmlToL100(kml), 2) };
}

// ---- Totali / KPI ----
export function summary(entries, vehicle) {
  const { fuel, maint } = splitEntries(entries);
  const all = [...entries].sort(byDateDesc);
  const fuelCost = fuel.reduce((a, e) => a + (e.cost || 0), 0);
  const maintCost = maint.reduce((a, e) => a + (e.cost || 0), 0);
  const total = fuelCost + maintCost;

  const odos = entries.map((e) => e.odometer).filter((x) => x > 0);
  const minOdo = vehicle?.initialOdometer ?? (odos.length ? Math.min(...odos) : 0);
  const maxOdo = odos.length ? Math.max(...odos) : minOdo;
  const distance = Math.max(0, maxOdo - minOdo);

  const dates = entries.map((e) => +new Date(e.date)).filter((x) => x);
  const first = dates.length ? Math.min(...dates) : Date.now();
  const last = dates.length ? Math.max(...dates) : Date.now();
  const days = Math.max(1, Math.round((last - first) / 86400000));

  const litersTotal = fuel.reduce((a, e) => a + (e.liters || 0), 0);

  return {
    total, fuelCost, maintCost,
    distance, minOdo, maxOdo,
    days, firstDate: first, lastDate: last,
    costPerKm: distance > 0 ? total / distance : 0,
    costPerDay: total / days,
    costPerMonth: (total / days) * 30.44,
    fuelPerKm: distance > 0 ? fuelCost / distance : 0,
    litersTotal,
    nFuel: fuel.length, nMaint: maint.length, nTotal: entries.length,
    lastOdo: maxOdo,
  };
}

// ---- Aggregazione mensile per il grafico a barre ----
export function monthly(entries) {
  const map = new Map();
  for (const e of entries) {
    const d = new Date(e.date);
    if (isNaN(d)) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, { month: key, fuel: 0, maintenance: 0, total: 0 });
    const row = map.get(key);
    const c = e.cost || 0;
    if (e.type === 'fuel') row.fuel += c; else row.maintenance += c;
    row.total += c;
  }
  return [...map.values()].sort((a, b) => (a.month < b.month ? -1 : 1));
}

// ---- Andamento prezzo carburante ----
export function priceSeries(fuelEntries) {
  return [...fuelEntries]
    .filter((e) => e.pricePerLiter > 0)
    .sort(byDateDesc).reverse()
    .map((e) => ({ date: e.date, price: e.pricePerLiter }));
}

// ---- Andamento contachilometri ----
export function odometerSeries(entries) {
  return [...entries]
    .filter((e) => e.odometer > 0)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((e) => ({ date: e.date, odometer: e.odometer }));
}

// ---- Ripartizione manutenzione per sotto-tipo ----
export function maintenanceBreakdown(maintEntries) {
  const map = new Map();
  for (const e of maintEntries) {
    const k = e.subtype || 'Altro';
    map.set(k, (map.get(k) || 0) + (e.cost || 0));
  }
  return [...map.entries()].map(([subtype, cost]) => ({ subtype, cost }))
    .sort((a, b) => b.cost - a.cost);
}

// ---- Previsione prossimo rifornimento ----
export function nextRefuel(fuelEntries) {
  const fuel = [...fuelEntries].filter((e) => e.fullTank && e.odometer > 0).sort(byOdoAsc);
  if (fuel.length < 3) return null;
  const recent = fuel.slice(-6);
  let dKm = 0, dDays = 0, n = 0;
  for (let i = 1; i < recent.length; i++) {
    const km = recent[i].odometer - recent[i - 1].odometer;
    const days = (+new Date(recent[i].date) - +new Date(recent[i - 1].date)) / 86400000;
    if (km > 0 && km < 2000 && days > 0) { dKm += km; dDays += days; n++; }
  }
  if (!n) return null;
  const avgKm = dKm / n, avgDays = dDays / n;
  const last = recent[recent.length - 1];
  const predOdo = Math.round(last.odometer + avgKm);
  const predDate = new Date(+new Date(last.date) + avgDays * 86400000);
  const daysLeft = Math.round((predDate - Date.now()) / 86400000);
  return { odometer: predOdo, date: predDate.toISOString(), daysLeft, avgKm: Math.round(avgKm) };
}

// Sotto-tipi di manutenzione proposti nei form
export const MAINT_SUBTYPES = [
  'Tagliando', 'Nuove gomme', 'Rotazione gomme', 'Gomme invernali', 'Batteria',
  'Tergicristalli', 'Freni', 'Revisione', 'Ispezione', 'Riparazione',
  'Assicurazione', 'Bollo', 'Pedaggi', 'Autolavaggio', 'AdBlue', 'Accessori', 'Altro',
];
