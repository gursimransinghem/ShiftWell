/**
 * auth-store-delete-account.test.ts
 *
 * Tests for APP-01: Delete Account flow (Apple App Store requirement).
 *
 * Covers:
 * - deleteAccount clears all local AsyncStorage keys
 * - deleteAccount clears persisted SecureStore session
 * - deleteAccount resets auth state to unauthenticated
 * - deleteAccount calls supabase.rpc('delete_user')
 * - deleteAccount still clears state if remote deletion fails
 */

import { useAuthStore } from '../../src/store/auth-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { PERSISTED_LOCAL_DATA_KEYS } from '../../src/store/auth-store';

// The mock adds multiRemove but the TS type doesn't include it — cast for assertions
const MockAsyncStorage = AsyncStorage as typeof AsyncStorage & { multiRemove: jest.Mock };

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/lib/supabase/client');
jest.mock('../../src/lib/supabase/auth', () => ({
  signInWithApple: jest.fn(),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn().mockResolvedValue(undefined),
  getCurrentSession: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/lib/sync/data-migration', () => ({
  migrateLocalDataToCloud: jest.fn().mockResolvedValue(undefined),
}));

import { supabase } from '../../src/lib/supabase/client';

// ── Helpers ───────────────────────────────────────────────────────────────────

function setAuthenticatedState() {
  useAuthStore.setState({
    userId: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    isAuthenticated: true,
    isLoading: false,
    error: null,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({
    userId: null,
    email: null,
    displayName: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });
});

describe('deleteAccount', () => {
  it('calls supabase.rpc("delete_user")', async () => {
    setAuthenticatedState();
    await useAuthStore.getState().deleteAccount();
    expect(supabase.rpc).toHaveBeenCalledWith('delete_user');
  });

  it('clears all known AsyncStorage keys', async () => {
    setAuthenticatedState();
    await useAuthStore.getState().deleteAccount();

    expect(MockAsyncStorage.multiRemove).toHaveBeenCalledWith(PERSISTED_LOCAL_DATA_KEYS);
    expect(PERSISTED_LOCAL_DATA_KEYS).toEqual(
      expect.arrayContaining([
        'nightshift-user',
        'nightshift-shifts',
        'nightshift-onboarding',
        'adaptive-plan-store',
        'premium-store',
        'score-history',
        'notification-prefs',
        'pattern-store',
        'prediction-store',
        'ai-store',
        'brief-store',
        'autopilot-store',
        'hrv-store',
        'feedback-store',
        'calendar-storage',
      ]),
    );
  });

  it('clears SecureStore session', async () => {
    setAuthenticatedState();
    await useAuthStore.getState().deleteAccount();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('nightshift-session');
  });

  it('resets auth state to unauthenticated after deletion', async () => {
    setAuthenticatedState();
    await useAuthStore.getState().deleteAccount();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBeNull();
    expect(state.email).toBeNull();
    expect(state.displayName).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('still clears local data when remote RPC fails', async () => {
    setAuthenticatedState();
    // Simulate remote deletion failure
    (supabase.rpc as jest.Mock).mockResolvedValueOnce({ error: new Error('Not authorized') });

    await useAuthStore.getState().deleteAccount();

    // AsyncStorage should still have been cleared
    expect(MockAsyncStorage.multiRemove).toHaveBeenCalled();
    // Auth state should still be cleared
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('still clears local data when an exception is thrown', async () => {
    setAuthenticatedState();
    (supabase.rpc as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await useAuthStore.getState().deleteAccount();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
