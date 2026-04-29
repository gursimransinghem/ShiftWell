import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// `expo-secure-store` is a native module and does not work on web (or during
// expo-router static SSR rendering on Node). Fall back to localStorage on web,
// or a no-op in-memory map elsewhere where the native module is unavailable.
const memoryStore = new Map<string, string>();

function getWebItem(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem(key);
  }
  return memoryStore.get(key) ?? null;
}

function setWebItem(key: string, value: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(key, value);
    return;
  }
  memoryStore.set(key, value);
}

function removeWebItem(key: string) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(key);
    return;
  }
  memoryStore.delete(key);
}

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return getWebItem(key);
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      setWebItem(key, value);
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // ignore — best effort persistence
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
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
