module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '.',
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/backend/node_modules/',
    '/frontend/node_modules/',
    '/deployment/',
    '/tests/legacy-files/'
  ],
  
  // Module paths
  modulePaths: [
    '<rootDir>',
    '<rootDir>/backend',
    '<rootDir>/backend/node_modules'
  ],
  
  // Setup files
  setupFilesAfterEnv: [],
  
  // Coverage settings
  collectCoverageFrom: [
    'backend/src/**/*.{js,ts}',
    '!backend/src/**/*.d.ts',
    '!backend/node_modules/**'
  ],
  
  // Verbose output
  verbose: true,
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks
  clearMocks: true
};