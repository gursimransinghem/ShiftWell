import * as SecureStore from 'expo-secure-store';

function isWebRuntime(): boolean {
  return process.env.EXPO_OS === 'web' || typeof window !== 'undefined';
}

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    if (isWebRuntime()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
    return await SecureStore.getItemAsync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (isWebRuntime()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (isWebRuntime()) {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
}
