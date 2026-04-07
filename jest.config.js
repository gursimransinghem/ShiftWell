module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src/lib/enterprise/__tests__'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
