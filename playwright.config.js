// Simple Playwright configuration
module.exports = {
  testDir: '.', 
  testMatch: ['bsg-workflow.spec.js', 'service-catalog-focus-test.spec.js', 'test-focus-loss.spec.js', 'focus-test-simple.spec.js'],
  testIgnore: ['**/backend/**', '**/frontend/**', '**/node_modules/**'],
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:3000',
    headless: false, // Show browser for debugging
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Don't use global setup/teardown for simple test
};