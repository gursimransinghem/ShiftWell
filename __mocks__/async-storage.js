// In-memory AsyncStorage mock for Expo Go / dev environment
const store = {};

const AsyncStorage = {
  getItem: (key) => Promise.resolve(store[key] ?? null),
  setItem: (key, value) => { store[key] = value; return Promise.resolve(); },
  removeItem: (key) => { delete store[key]; return Promise.resolve(); },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); return Promise.resolve(); },
  getAllKeys: () => Promise.resolve(Object.keys(store)),
  multiGet: (keys) => Promise.resolve(keys.map(k => [k, store[k] ?? null])),
  multiSet: (pairs) => { pairs.forEach(([k, v]) => { store[k] = v; }); return Promise.resolve(); },
  multiRemove: (keys) => { keys.forEach(k => delete store[k]); return Promise.resolve(); },
  mergeItem: (key, value) => {
    const existing = store[key] ? JSON.parse(store[key]) : {};
    const merged = { ...existing, ...JSON.parse(value) };
    store[key] = JSON.stringify(merged);
    return Promise.resolve();
  },
  flushGetRequests: () => {},
};

export default AsyncStorage;
