export { supabase } from './client';
export { SecureStoreAdapter } from './storage-adapter';
export type { Database, Json, Tables, TablesInsert, TablesUpdate } from './database.types';
export {
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentSession,
  onAuthStateChange,
} from './auth';
