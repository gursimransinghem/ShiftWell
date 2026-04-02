/**
 * Jest global setup — runs before each test suite.
 * Sets required environment variables to prevent module-load errors.
 */

// Supabase requires a URL at module evaluation time — provide dummy values for tests
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
