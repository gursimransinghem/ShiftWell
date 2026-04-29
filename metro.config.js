const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const path = require('path');

const config = getSentryExpoConfig(__dirname);

// Mock native modules that aren't available in Expo Go
const nativeMocks = {
  '@react-native-google-signin/google-signin': path.resolve(__dirname, '__mocks__/google-signin.js'),
  '@kingstinct/react-native-healthkit': path.resolve(__dirname, '__mocks__/healthkit.js'),
  'react-native-nitro-modules': path.resolve(__dirname, '__mocks__/nitro-modules.js'),
  '@react-native-async-storage/async-storage': path.resolve(__dirname, '__mocks__/async-storage.js'),
  'react-native-purchases': path.resolve(__dirname, '__mocks__/revenue-cat.js'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/'))) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName),
    };
  }
  if (nativeMocks[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: nativeMocks[moduleName],
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
