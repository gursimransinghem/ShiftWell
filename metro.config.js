const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Mock native modules that aren't available in Expo Go
const nativeMocks = {
  '@react-native-google-signin/google-signin': path.resolve(__dirname, '__mocks__/google-signin.js'),
  '@kingstinct/react-native-healthkit': path.resolve(__dirname, '__mocks__/healthkit.js'),
  'react-native-nitro-modules': path.resolve(__dirname, '__mocks__/nitro-modules.js'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
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
