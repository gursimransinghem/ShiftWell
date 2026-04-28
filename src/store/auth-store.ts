import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  signInWithApple as appleSignIn,
  signInWithEmail as emailSignIn,
  signUpWithEmail as emailSignUp,
  signOut as supabaseSignOut,
  getCurrentSession,
} from '../lib/supabase/auth';
import { supabase } from '../lib/supabase/client';
import { migrateLocalDataToCloud } from '../lib/sync/data-migration';

const SESSION_KEY = 'nightshift-session';
export const PERSISTED_LOCAL_DATA_KEYS = [
  'nightshift-user',
  'nightshift-shifts',
  // Legacy plan key from earlier app versions. Keep clearing/checking it so
  // older installs migrate and delete cleanly.
  'nightshift-plan',
  'adaptive-plan-store',
  'nightshift-onboarding',
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
];

interface AuthState {
  userId: string | null;
  email: string | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

/**
 * Check whether the device has local data that should be migrated after sign-in.
 */
async function hasLocalData(): Promise<boolean> {
  for (const key of PERSISTED_LOCAL_DATA_KEYS) {
    const value = await AsyncStorage.getItem(key);
    if (value) return true;
  }
  return false;
}

/**
 * Persist a minimal session marker in SecureStore so we can restore auth on
 * cold launch without hitting the network.
 */
async function persistSession(userId: string, email: string | null, displayName: string | null) {
  await SecureStore.setItemAsync(
    SESSION_KEY,
    JSON.stringify({ userId, email, displayName }),
  );
}

async function clearPersistedSession() {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  userId: null,
  email: null,
  displayName: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await appleSignIn();
      const user = session.user;
      const displayName = user.user_metadata?.full_name ?? user.email ?? null;

      set({
        userId: user.id,
        email: user.email ?? null,
        displayName,
        isAuthenticated: true,
        isLoading: false,
      });

      await persistSession(user.id, user.email ?? null, displayName);

      // Migrate local data if present
      if (await hasLocalData()) {
        await migrateLocalDataToCloud(user.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Apple Sign-In failed';
      set({ isLoading: false, error: message });
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await emailSignIn(email, password);
      const user = session.user;

      set({
        userId: user.id,
        email: user.email ?? null,
        displayName: user.user_metadata?.display_name ?? user.email ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      await persistSession(user.id, user.email ?? null, user.user_metadata?.display_name ?? null);

      if (await hasLocalData()) {
        await migrateLocalDataToCloud(user.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-in failed';
      set({ isLoading: false, error: message });
    }
  },

  signUpWithEmail: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await emailSignUp(email, password);

      if (!session) {
        set({
          isLoading: false,
          error: 'Check your email to confirm your account.',
        });
        return;
      }

      const user = session.user;

      set({
        userId: user.id,
        email: user.email ?? null,
        displayName: user.email ?? null,
        isAuthenticated: true,
        isLoading: false,
      });

      await persistSession(user.id, user.email ?? null, null);

      if (await hasLocalData()) {
        await migrateLocalDataToCloud(user.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-up failed';
      set({ isLoading: false, error: message });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      await supabaseSignOut();
      await clearPersistedSession();
      set({
        userId: null,
        email: null,
        displayName: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign-out failed';
      set({ isLoading: false, error: message });
    }
  },

  deleteAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      // Attempt Supabase user deletion (requires auth.admin or RLS policy on server)
      // Falls back to sign-out if deleteUser is unavailable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: deleteError } = await (supabase as any).rpc('delete_user');
      if (deleteError) {
        // deleteUser via RPC not available — sign out only
        await supabaseSignOut();
      }

      // multiRemove is part of the AsyncStorage API but missing from some type definitions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (AsyncStorage as any).multiRemove(PERSISTED_LOCAL_DATA_KEYS);
      await clearPersistedSession();

      set({
        userId: null,
        email: null,
        displayName: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (err) {
      // Even if deletion fails remotely, clear local data and sign out
      try {
        await supabaseSignOut();
      } catch {
        // ignore secondary error
      }
      await clearPersistedSession();
      set({
        userId: null,
        email: null,
        displayName: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkSession: async () => {
    set({ isLoading: true, error: null });
    try {
      // First try SecureStore for a fast local check
      const stored = await SecureStore.getItemAsync(SESSION_KEY);
      if (stored) {
        const { userId, email, displayName } = JSON.parse(stored);
        set({
          userId,
          email,
          displayName,
          isAuthenticated: true,
        });
      }

      // Then verify with Supabase in the background
      const session = await getCurrentSession();
      if (session) {
        const user = session.user;
        const displayName = user.user_metadata?.display_name ?? user.email ?? null;
        set({
          userId: user.id,
          email: user.email ?? null,
          displayName,
          isAuthenticated: true,
          isLoading: false,
        });
        await persistSession(user.id, user.email ?? null, displayName);
      } else {
        // No valid server session — clear local state
        await clearPersistedSession();
        set({
          userId: null,
          email: null,
          displayName: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      // Network error — keep SecureStore state if we had one
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export type { AuthState };
