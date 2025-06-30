// Enhanced BSG Automation - Playwright Configuration
// Optimized for comprehensive name field and workflow testing

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: '**/enhanced-bsg-automation.spec.js',
  
  // Longer timeouts for complex workflows
  timeout: 120 * 1000, // 2 minutes per test
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },
  
  // Parallel execution settings
  fullyParallel: false, // Sequential to avoid conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : 2,
  
  // Reporter configuration for detailed output
  reporter: [
    ['html', { 
      outputFolder: 'test-results/enhanced-bsg-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/enhanced-bsg-results.json' 
    }],
    ['list'],
    ['junit', { 
      outputFile: 'test-results/enhanced-bsg-junit.xml' 
    }]
  ],
  
  use: {
    // Base URL for the application
    baseURL: 'http://localhost:3000',
    
    // Browser settings
    headless: false, // Run in headed mode for debugging
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Capture settings for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Action settings
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'Asia/Jakarta', // BSG is in Indonesia
  },

  // Test output directory
  outputDir: 'test-results/enhanced-bsg-artifacts',

  // Project configurations for different browsers and devices
  projects: [
    {
      name: 'chromium-desktop',
      use: { 
        ...devices['Desktop Chrome'],
        // Additional Chrome flags for better automation
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox'
          ]
        }
      },
    },
    
    {
      name: 'firefox-desktop', 
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox specific settings
        launchOptions: {
          firefoxUserPrefs: {
            'dom.webnotifications.enabled': false,
            'media.navigator.permission.disabled': true
          }
        }
      },
    },
    
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile testing for responsive verification
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile specific timeouts
        actionTimeout: 20000,
        navigationTimeout: 40000
      },
    },

    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro'],
        // Tablet specific settings
        viewport: { width: 1024, height: 768 }
      },
    }
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./test-setup/enhanced-bsg-global-setup.js'),
  globalTeardown: require.resolve('./test-setup/enhanced-bsg-global-teardown.js'),

  // Web server configuration
  webServer: [
    {
      command: 'npm run dev:backend',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: true,
      timeout: 30 * 1000,
      cwd: './backend'
    },
    {
      command: 'npm run dev:frontend', 
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 30 * 1000,
      cwd: './frontend'
    }
  ]
});

// Export configuration for external use
module.exports.config = {
  browsers: ['chromium', 'firefox', 'webkit'],
  devices: ['desktop', 'mobile', 'tablet'],
  testTypes: ['nameField', 'workflow', 'crossBrowser', 'responsive'],
  environments: ['development', 'staging', 'production']
};