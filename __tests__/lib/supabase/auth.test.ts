const mockSignInAsync = jest.fn();
const mockSignInWithIdToken = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockUnsubscribe = jest.fn();

jest.mock('expo-apple-authentication', () => ({
  signInAsync: mockSignInAsync,
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
}));

jest.mock('../../../src/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithIdToken: mockSignInWithIdToken,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

import {
  getCurrentSession,
  onAuthStateChange,
  signInWithApple,
  signInWithEmail,
  signOut,
  signUpWithEmail,
} from '../../../src/lib/supabase/auth';

const session = {
  access_token: 'access-token',
  refresh_token: 'refresh-token',
  user: {
    id: 'user-1',
    email: 'sim@example.com',
    user_metadata: {},
  },
};

describe('supabase auth module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  it('signInWithApple exchanges the Apple identity token for a Supabase session', async () => {
    mockSignInAsync.mockResolvedValueOnce({ identityToken: 'apple-token' });
    mockSignInWithIdToken.mockResolvedValueOnce({ data: { session }, error: null });

    await expect(signInWithApple()).resolves.toBe(session);

    expect(mockSignInAsync).toHaveBeenCalledWith({
      requestedScopes: ['FULL_NAME', 'EMAIL'],
    });
    expect(mockSignInWithIdToken).toHaveBeenCalledWith({
      provider: 'apple',
      token: 'apple-token',
    });
  });

  it('signInWithApple throws before Supabase exchange when Apple returns no identity token', async () => {
    mockSignInAsync.mockResolvedValueOnce({ identityToken: null });

    await expect(signInWithApple()).rejects.toThrow(
      'Apple sign-in failed: no identity token returned.',
    );
    expect(mockSignInWithIdToken).not.toHaveBeenCalled();
  });

  it('signInWithApple throws when Supabase returns no session', async () => {
    mockSignInAsync.mockResolvedValueOnce({ identityToken: 'apple-token' });
    mockSignInWithIdToken.mockResolvedValueOnce({ data: { session: null }, error: null });

    await expect(signInWithApple()).rejects.toThrow(
      'Apple sign-in succeeded but no session was created.',
    );
  });

  it('signInWithEmail returns the Supabase email session', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { session }, error: null });

    await expect(signInWithEmail('sim@example.com', 'secret')).resolves.toBe(session);
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'sim@example.com',
      password: 'secret',
    });
  });

  it('signInWithEmail throws when Supabase returns no session', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { session: null }, error: null });

    await expect(signInWithEmail('sim@example.com', 'secret')).rejects.toThrow(
      'Sign-in succeeded but no session was created.',
    );
  });

  it('signUpWithEmail returns null when email confirmation is required', async () => {
    mockSignUp.mockResolvedValueOnce({ data: { session: null }, error: null });

    await expect(signUpWithEmail('sim@example.com', 'secret')).resolves.toBeNull();
  });

  it('signOut surfaces Supabase sign-out errors', async () => {
    mockSignOut.mockResolvedValueOnce({ error: new Error('sign-out failed') });

    await expect(signOut()).rejects.toThrow('sign-out failed');
  });

  it('getCurrentSession returns the current session from Supabase', async () => {
    mockGetSession.mockResolvedValueOnce({ data: { session }, error: null });

    await expect(getCurrentSession()).resolves.toBe(session);
  });

  it('onAuthStateChange returns an unsubscribe wrapper around the Supabase subscription', () => {
    const callback = jest.fn();

    const subscription = onAuthStateChange(callback);
    subscription.unsubscribe();

    expect(mockOnAuthStateChange).toHaveBeenCalledWith(callback);
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
