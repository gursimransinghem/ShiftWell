import * as SecureStore from 'expo-secure-store';

const memoryStorage = new Map<string, string>();

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function isReactNativeRuntime(): boolean {
  return (
    (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') ||
    process.env['JEST_WORKER_ID'] !== undefined
  );
}

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    const webStorage = getWebStorage();
    if (webStorage) {
      return webStorage.getItem(key);
    }

    if (isReactNativeRuntime()) {
      return await SecureStore.getItemAsync(key);
    }

    return memoryStorage.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(key, value);
      return;
    }

    if (isReactNativeRuntime()) {
      await SecureStore.setItemAsync(key, value);
      return;
    }

    memoryStorage.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(key);
      return;
    }

    if (isReactNativeRuntime()) {
      await SecureStore.deleteItemAsync(key);
      return;
    }

    memoryStorage.delete(key);
  }
}

export const sessionStorageAdapter = new SecureStoreAdapter();
