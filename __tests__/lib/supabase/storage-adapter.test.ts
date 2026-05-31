import * as SecureStore from 'expo-secure-store';
import { SecureStoreAdapter } from '../../../src/lib/supabase/storage-adapter';

describe('SecureStoreAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getItem delegates to Expo SecureStore', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-value');
    const adapter = new SecureStoreAdapter();

    await expect(adapter.getItem('session-key')).resolves.toBe('stored-value');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('session-key');
  });

  it('setItem delegates to Expo SecureStore', async () => {
    const adapter = new SecureStoreAdapter();

    await adapter.setItem('session-key', 'serialized-session');

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      'session-key',
      'serialized-session',
    );
  });

  it('removeItem delegates to Expo SecureStore delete', async () => {
    const adapter = new SecureStoreAdapter();

    await adapter.removeItem('session-key');

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('session-key');
  });
});
