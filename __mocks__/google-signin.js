// Mock for @react-native-google-signin/google-signin
// Allows app to run in Expo Go without native module
module.exports = {
  GoogleSignin: {
    configure: () => {},
    hasPlayServices: async () => true,
    signIn: async () => ({ user: { email: 'mock@example.com' } }),
    signOut: async () => {},
    getTokens: async () => ({ accessToken: '', idToken: '' }),
    isSignedIn: async () => false,
    getCurrentUser: () => null,
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
};
