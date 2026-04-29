import * as SecureStore from 'expo-secure-store';

const memoryStorage = new Map<string, string>();

function getWebStorage(): Storage | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

export const secureSessionStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      const webStorage = getWebStorage();
      if (webStorage) {
        return webStorage.getItem(key);
      }
      return memoryStorage.get(key) ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.setItem(key, value);
        return;
      }
      memoryStorage.set(key, value);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      const webStorage = getWebStorage();
      if (webStorage) {
        webStorage.removeItem(key);
        return;
      }
      memoryStorage.delete(key);
    }
  },
};

// Backward-compatible alias for existing imports/tests.
export const safeSessionStorage = secureSessionStorage;

export class SecureStoreAdapter {
  async getItem(key: string): Promise<string | null> {
    return secureSessionStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    await secureSessionStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await secureSessionStorage.removeItem(key);
  }
}
