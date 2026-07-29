/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react', esModuleInterop: true } }],
  },
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-reports',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    }],
  ],
  coverageDirectory: 'test-reports/coverage',
  collectCoverageFrom: [
    'store/**/*.ts',
    'constants/**/*.ts',
    'types/**/*.ts',
    '!**/*.d.ts',
  ],
  // Each suite runs in isolation and writes its own JSON report
  globalSetup: undefined,
  testTimeout: 15000,
};
