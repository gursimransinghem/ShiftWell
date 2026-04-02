export const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({ idToken: 'mock-id-token' }),
  getTokens: jest.fn().mockResolvedValue({ accessToken: 'mock-access-token' }),
  signOut: jest.fn().mockResolvedValue(null),
  isSignedIn: jest.fn().mockResolvedValue(false),
};
