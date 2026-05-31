// store.js — Livello dati di Drivy.
// Usa Firebase Firestore se configurato (config.js), altrimenti localStorage.
// Espone un'API asincrona uniforme + sottoscrizione ai cambiamenti.

import { buildSeed } from './seed.js';

const cfg = (window.DRIVY_CONFIG || {});
const USE_FIREBASE = !!(cfg.projectId && cfg.apiKey);

const LS = {
  vehicles: 'drivy_vehicles_v1',
  entries: 'drivy_entries_v1',
  settings: 'drivy_settings_v1',
  seeded: 'drivy_seeded_v1',
};

const state = {
  vehicles: [],
  entries: [],
  ready: false,
};

const listeners = new Set();
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach((fn) => { try { fn(state); } catch (e) { console.error(e); } }); }

// ---------- Impostazioni (sempre locali) ----------
const defaultSettings = {
  consumptionUnit: 'l100', // 'l100' (L/100km) | 'kml' (km/L)
  currency: 'EUR',
  theme: 'system', // 'system' | 'light' | 'dark'
  activeVehicleId: null,
};
export function getSettings() {
  try { return { ...defaultSettings, ...(JSON.parse(localStorage.getItem(LS.settings)) || {}) }; }
  catch { return { ...defaultSettings }; }
}
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  localStorage.setItem(LS.settings, JSON.stringify(next));
  return next;
}

// ---------- Util ----------
const uid = () => 'e_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export function getState() { return state; }
export function isFirebase() { return USE_FIREBASE; }

// ======================================================
//  Backend localStorage
// ======================================================
const local = {
  load() {
    try { state.vehicles = JSON.parse(localStorage.getItem(LS.vehicles)) || []; } catch { state.vehicles = []; }
    try { state.entries = JSON.parse(localStorage.getItem(LS.entries)) || []; } catch { state.entries = []; }
  },
  persist() {
    localStorage.setItem(LS.vehicles, JSON.stringify(state.vehicles));
    localStorage.setItem(LS.entries, JSON.stringify(state.entries));
  },
  async init() {
    this.load();
    if (!localStorage.getItem(LS.seeded) && state.vehicles.length === 0) {
      const seed = buildSeed();
      state.vehicles = [seed.vehicle];
      state.entries = seed.entries;
      localStorage.setItem(LS.seeded, '1');
      this.persist();
    }
    state.ready = true;
    emit();
  },
  async addVehicle(v) { state.vehicles.push(v); this.persist(); emit(); },
  async updateVehicle(id, patch) {
    state.vehicles = state.vehicles.map((v) => v.id === id ? { ...v, ...patch } : v);
    this.persist(); emit();
  },
  async deleteVehicle(id) {
    state.vehicles = state.vehicles.filter((v) => v.id !== id);
    state.entries = state.entries.filter((e) => e.vehicleId !== id);
    this.persist(); emit();
  },
  async addEntry(e) { state.entries.unshift(e); this.persist(); emit(); },
  async updateEntry(id, patch) {
    state.entries = state.entries.map((e) => e.id === id ? { ...e, ...patch } : e);
    this.persist(); emit();
  },
  async deleteEntry(id) {
    state.entries = state.entries.filter((e) => e.id !== id);
    this.persist(); emit();
  },
};

// ======================================================
//  Backend Firebase Firestore
// ======================================================
let fb = null;
const remote = {
  async init() {
    const appMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const fsMod = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const app = appMod.initializeApp(cfg);
    const db = fsMod.getFirestore(app);
    try { await fsMod.enableIndexedDbPersistence(db); } catch (_) {}
    fb = { ...fsMod, db };

    const vCol = fb.collection(db, 'vehicles');
    const eCol = fb.collection(db, 'entries');

    // Seed alla prima esecuzione (se vuoto)
    const vSnap = await fb.getDocs(vCol);
    if (vSnap.empty) {
      const seed = buildSeed();
      await fb.setDoc(fb.doc(db, 'vehicles', seed.vehicle.id), seed.vehicle);
      // batch a gruppi
      let batch = fb.writeBatch(db); let n = 0;
      for (const e of seed.entries) {
        batch.set(fb.doc(db, 'entries', e.id), e); n++;
        if (n % 400 === 0) { await batch.commit(); batch = fb.writeBatch(db); }
      }
      await batch.commit();
    }

    // Listener realtime
    fb.onSnapshot(vCol, (snap) => {
      state.vehicles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      state.ready = true; emit();
    });
    fb.onSnapshot(eCol, (snap) => {
      state.entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.date < b.date ? 1 : -1));
      state.ready = true; emit();
    });
  },
  async addVehicle(v) { await fb.setDoc(fb.doc(fb.db, 'vehicles', v.id), v); },
  async updateVehicle(id, patch) { await fb.updateDoc(fb.doc(fb.db, 'vehicles', id), patch); },
  async deleteVehicle(id) {
    await fb.deleteDoc(fb.doc(fb.db, 'vehicles', id));
    const q = fb.query(fb.collection(fb.db, 'entries'), fb.where('vehicleId', '==', id));
    const snap = await fb.getDocs(q);
    let batch = fb.writeBatch(fb.db); let n = 0;
    for (const d of snap.docs) { batch.delete(d.ref); if (++n % 400 === 0) { await batch.commit(); batch = fb.writeBatch(fb.db); } }
    await batch.commit();
  },
  async addEntry(e) { await fb.setDoc(fb.doc(fb.db, 'entries', e.id), e); },
  async updateEntry(id, patch) { await fb.updateDoc(fb.doc(fb.db, 'entries', id), patch); },
  async deleteEntry(id) { await fb.deleteDoc(fb.doc(fb.db, 'entries', id)); },
};

// ======================================================
//  API pubblica
// ======================================================
const backend = USE_FIREBASE ? remote : local;

export async function initStore() {
  try { await backend.init(); }
  catch (err) {
    console.error('Init backend fallita, uso localStorage:', err);
    await local.init();
  }
}

export const Store = {
  isFirebase: () => USE_FIREBASE,
  vehicles: () => state.vehicles,
  entries: () => state.entries,
  entriesFor: (vehicleId) => state.entries.filter((e) => e.vehicleId === vehicleId),
  addVehicle: (v) => backend.addVehicle({ id: 'v_' + uid(), createdAt: new Date().toISOString(), ...v }),
  updateVehicle: (id, patch) => backend.updateVehicle(id, patch),
  deleteVehicle: (id) => backend.deleteVehicle(id),
  addEntry: (e) => backend.addEntry({ id: uid(), createdAt: new Date().toISOString(), ...e }),
  updateEntry: (id, patch) => backend.updateEntry(id, patch),
  deleteEntry: (id) => backend.deleteEntry(id),
};
