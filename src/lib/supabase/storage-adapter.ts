import * as SecureStore from 'expo-secure-store';

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    const webStorage = getWebStorage();
    if (webStorage) {
      return webStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const webStorage = getWebStorage();
    if (webStorage) {
      webStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }
}
