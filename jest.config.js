module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },
};
