module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
<<<<<<< HEAD
  setupFiles: ['<rootDir>/jest.setup.ts'],
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
=======
  roots: ['<rootDir>/__tests__', '<rootDir>/src/lib/enterprise/__tests__'],
>>>>>>> worktree-agent-a8e6a3d4
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
    '^expo-calendar$': '<rootDir>/__mocks__/expo-calendar.ts',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.ts',
    '^@react-native-google-signin/google-signin$':
      '<rootDir>/__mocks__/@react-native-google-signin/google-signin.ts',
    '^expo-task-manager$': '<rootDir>/__mocks__/expo-task-manager.ts',
    '^expo-background-task$': '<rootDir>/__mocks__/expo-background-task.ts',
    '^@/src/lib/supabase/client$': '<rootDir>/__mocks__/supabase-client.ts',
    '^src/lib/supabase/client$': '<rootDir>/__mocks__/supabase-client.ts',
    '^@/src/lib/sync/sync-engine$': '<rootDir>/__mocks__/sync-engine.ts',
    '^src/lib/sync/sync-engine$': '<rootDir>/__mocks__/sync-engine.ts',
    '^expo-notifications$': '<rootDir>/__mocks__/expo-notifications.ts',
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.ts',
    '^@kingstinct/react-native-healthkit$': '<rootDir>/__mocks__/healthkit.js',
  },
};
