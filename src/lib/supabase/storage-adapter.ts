import * as SecureStore from 'expo-secure-store';

// expo-secure-store is a native-only module. On web (and during expo-router
// SSR rendering on Node) calling its functions throws because the underlying
// ExpoSecureStore native binding is missing. Detect web/SSR via `typeof window`
// + `localStorage` and avoid `react-native`'s Platform module so that Jest
// (Node test env) can still import this file without ESM transform errors.
const memoryStore = new Map<string, string>();
const isWebLike =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function getWebItem(key: string): string | null {
  if (isWebLike) return window.localStorage.getItem(key);
  return memoryStore.get(key) ?? null;
}

function setWebItem(key: string, value: string) {
  if (isWebLike) {
    window.localStorage.setItem(key, value);
    return;
  }
  memoryStore.set(key, value);
}

function removeWebItem(key: string) {
  if (isWebLike) {
    window.localStorage.removeItem(key);
    return;
  }
  memoryStore.delete(key);
}

// Native vs. non-native is decided by whether the SecureStore module exposes
// the expected async APIs at runtime. On web, expo-secure-store's exports are
// stubs that throw — so we route around them.
const hasNativeSecureStore =
  typeof SecureStore.getItemAsync === 'function' && !isWebLike;

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    if (!hasNativeSecureStore) return getWebItem(key);
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!hasNativeSecureStore) {
      setWebItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore — best-effort persistence
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!hasNativeSecureStore) {
      removeWebItem(key);
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // ignore
    }
  }
}
