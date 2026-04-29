import * as AppleAuthentication from 'expo-apple-authentication';
import { isSupabaseConfigured, supabase } from './client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

function hasSupabaseConfig(): boolean {
  return typeof isSupabaseConfigured === 'function' ? isSupabaseConfigured() : true;
}

function assertSupabaseConfigured(feature: string): void {
  if (!hasSupabaseConfig()) {
    throw new Error(`${feature} is unavailable because Supabase is not configured.`);
  }
}

/**
 * Sign in with Apple using expo-apple-authentication and Supabase Apple provider.
 * Returns the Supabase session on success.
 */
export async function signInWithApple(): Promise<Session> {
  assertSupabaseConfigured('Apple sign-in');
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple sign-in failed: no identity token returned.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) throw error;
  if (!data.session) {
    throw new Error('Apple sign-in succeeded but no session was created.');
  }

  return data.session;
}

/**
 * Sign in with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<Session> {
  assertSupabaseConfigured('Email sign-in');
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session) {
    throw new Error('Sign-in succeeded but no session was created.');
  }

  return data.session;
}

/**
 * Sign up a new user with email and password.
 * Returns null if email confirmation is required.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<Session | null> {
  assertSupabaseConfigured('Email sign-up');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data.session;
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  if (!hasSupabaseConfig()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current auth session, or null if not authenticated.
 */
export async function getCurrentSession(): Promise<Session | null> {
  if (!hasSupabaseConfig()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Subscribe to auth state changes.
 * Returns an object with an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): { unsubscribe: () => void } {
  if (!hasSupabaseConfig()) {
    return { unsubscribe: () => {} };
  }
  const { data } = supabase.auth.onAuthStateChange(callback);
  return { unsubscribe: data.subscription.unsubscribe };
}
