// Simple Playwright configuration
module.exports = {
  testDir: '.', 
  testMatch: ['bsg-workflow.spec.js'],
  testIgnore: ['**/backend/**', '**/frontend/**', '**/node_modules/**'],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3005',
    headless: true,
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