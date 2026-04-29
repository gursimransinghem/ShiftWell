import { createClient } from '@supabase/supabase-js';
import { SecureStoreAdapter } from './storage-adapter';
import type { Database } from './database.types';

export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Use inert placeholder credentials when env vars are absent so the local-first
// app can still boot for onboarding/testing without crashing at import time.
const runtimeSupabaseUrl = isSupabaseConfigured()
  ? process.env.EXPO_PUBLIC_SUPABASE_URL!.trim()
  : 'https://shiftwell-placeholder.supabase.co';
const runtimeSupabaseAnonKey = isSupabaseConfigured()
  ? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!.trim()
  : 'shiftwell-placeholder-anon-key';

export const supabase = createClient<Database>(runtimeSupabaseUrl, runtimeSupabaseAnonKey, {
  auth: {
    storage: new SecureStoreAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
