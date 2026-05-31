const mockCreateClient = jest.fn(() => ({ mocked: true }));
const mockSecureStoreAdapter = jest.fn();

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

jest.mock('../../../src/lib/supabase/storage-adapter', () => ({
  SecureStoreAdapter: mockSecureStoreAdapter,
}));

describe('supabase client module', () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    jest.resetModules();
    mockCreateClient.mockClear();
    mockSecureStoreAdapter.mockClear();
  });

  afterEach(() => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
  });

  it('creates a Supabase client with SecureStore auth persistence enabled', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://shiftwell.test';
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { supabase } = require('../../../src/lib/supabase/client');

    expect(supabase).toEqual({ mocked: true });
    expect(mockSecureStoreAdapter).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(
      'https://shiftwell.test',
      'anon-key',
      {
        auth: {
          storage: expect.any(mockSecureStoreAdapter),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      },
    );
  });

  it('falls back to empty strings when Supabase env vars are missing', () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    delete process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../../../src/lib/supabase/client');

    expect(mockCreateClient).toHaveBeenCalledWith(
      '',
      '',
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        }),
      }),
    );
  });
});
