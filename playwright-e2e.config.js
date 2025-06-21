// E2E Test configuration for BSG workflow
module.exports = {
  testDir: '.', 
  testMatch: ['bsg-workflow.spec.js'],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3005',
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
};