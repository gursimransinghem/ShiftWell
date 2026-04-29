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

// Force the CommonJS build of zustand on web so its ESM `import.meta.env`
// reference (from the redux-devtools middleware) doesn't crash the browser
// runtime. Native (RN) already resolves to the CJS build via the package's
// "react-native" condition, so this only affects the web bundle.
const webModuleAliases = {
  zustand: path.resolve(__dirname, 'node_modules/zustand/index.js'),
  'zustand/middleware': path.resolve(__dirname, 'node_modules/zustand/middleware.js'),
  'zustand/shallow': path.resolve(__dirname, 'node_modules/zustand/shallow.js'),
  'zustand/react/shallow': path.resolve(__dirname, 'node_modules/zustand/react/shallow.js'),
  'zustand/vanilla': path.resolve(__dirname, 'node_modules/zustand/vanilla.js'),
  'zustand/vanilla/shallow': path.resolve(__dirname, 'node_modules/zustand/vanilla/shallow.js'),
  'zustand/traditional': path.resolve(__dirname, 'node_modules/zustand/traditional.js'),
  'zustand/react': path.resolve(__dirname, 'node_modules/zustand/react.js'),
};

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (nativeMocks[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: nativeMocks[moduleName],
    };
  }
  if (platform === 'web' && webModuleAliases[moduleName]) {
    return {
      type: 'sourceFile',
      filePath: webModuleAliases[moduleName],
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
