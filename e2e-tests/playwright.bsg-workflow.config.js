// Playwright configuration for BSG workflow tests
const { devices } = require('@playwright/test');

module.exports = {
  testDir: './e2e-tests',
  testMatch: ['**/bsg-ticket-workflow.spec.ts'],
  timeout: 60000,
  globalSetup: require.resolve('./global-setup.ts'),
  globalTeardown: require.resolve('./global-teardown.ts'),
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: './test-report' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: false, // Set to true for CI environments
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        browserName: 'chromium',
        ...devices['Desktop Chrome']
      },
    },
  ],
  workers: 1, // Run tests sequentially to avoid conflicts
  retries: 1, // Retry failed tests once
  fullyParallel: false, // Don't run tests in parallel
};