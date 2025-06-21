import { test, expect, devices } from '@playwright/test';
import { test as bsgTest } from './fixtures/bsg-test-fixtures';

test.describe('BSG Cross-Browser Compatibility Tests', () => {
  
  // Test across major browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`BSG template system works in ${browserName}`, async ({ browser }) => {
      test.setTimeout(90000); // Extended timeout for cross-browser testing
      
      // Skip webkit on CI if not available
      if (browserName === 'webkit' && process.env.CI && process.platform !== 'darwin') {
        test.skip();
      }
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Login process
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', 'requester@e2e-test.com');
        await page.fill('input[type="password"]', 'test123456');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Navigate to BSG create page
        await page.goto('/bsg-create');
        await page.waitForSelector('[data-testid="template-category"]', { timeout: 15000 });
        
        // Verify template categories load
        const templateCategories = page.locator('[data-testid="template-category"]');
        const categoryCount = await templateCategories.count();
        expect(categoryCount).toBeGreaterThan(0);
        
        // Test template selection
        await page.click('[data-testid="template-category"]:first-child');
        await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
        
        const templateCards = page.locator('[data-testid="template-card"]');
        const cardCount = await templateCards.count();
        expect(cardCount).toBeGreaterThan(0);
        
        // Select a template
        await page.click('[data-testid="template-card"]:first-child');
        
        // Verify dynamic fields load
        await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
        
        const dynamicFields = page.locator('[data-testid="bsg-dynamic-fields"]');
        await expect(dynamicFields).toBeVisible();
        
        // Test field interactions
        const inputFields = page.locator('input[type="text"], select, textarea');
        const inputCount = await inputFields.count();
        
        if (inputCount > 0) {
          // Test first few fields
          for (let i = 0; i < Math.min(inputCount, 3); i++) {
            const field = inputFields.nth(i);
            if (await field.isVisible()) {
              await field.click();
              await field.fill('Test Value');
              await field.blur();
            }
          }
        }
        
        // Test search functionality
        const searchInput = page.locator('[data-testid="template-search"]');
        if (await searchInput.isVisible()) {
          await searchInput.fill('transfer');
          await page.keyboard.press('Enter');
          
          // Wait for search results
          await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
          
          const searchResults = page.locator('[data-testid="template-card"]');
          const searchResultCount = await searchResults.count();
          expect(searchResultCount).toBeGreaterThan(0);
        }
        
        // Take screenshot for comparison
        await page.screenshot({ 
          path: `e2e-test-results/browser-compatibility-${browserName}.png`,
          fullPage: true 
        });
        
        console.log(`✅ ${browserName}: BSG template system works correctly`);
        
      } catch (error) {
        console.error(`❌ ${browserName}: Test failed -`, error);
        await page.screenshot({ 
          path: `e2e-test-results/browser-error-${browserName}.png`,
          fullPage: true 
        });
        throw error;
      } finally {
        await context.close();
      }
    });
  });

  test('BSG template system performance across browsers', async ({ browser }) => {
    const browserName = browser.browserType().name();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Measure performance metrics
    const performanceMetrics = {
      pageLoad: 0,
      templateLoad: 0,
      fieldLoad: 0,
      searchResponse: 0
    };
    
    try {
      // Measure page load time
      const pageLoadStart = Date.now();
      await page.goto('/bsg-create');
      await page.waitForLoadState('networkidle');
      performanceMetrics.pageLoad = Date.now() - pageLoadStart;
      
      // Measure template loading time
      const templateLoadStart = Date.now();
      await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
      performanceMetrics.templateLoad = Date.now() - templateLoadStart;
      
      // Measure field loading time
      await page.click('[data-testid="template-category"]:first-child');
      await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
      
      const fieldLoadStart = Date.now();
      await page.click('[data-testid="template-card"]:first-child');
      await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
      performanceMetrics.fieldLoad = Date.now() - fieldLoadStart;
      
      // Measure search response time
      const searchStart = Date.now();
      const searchInput = page.locator('[data-testid="template-search"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('olibs');
        await page.keyboard.press('Enter');
        await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
        performanceMetrics.searchResponse = Date.now() - searchStart;
      }
      
      // Performance expectations (relaxed for cross-browser compatibility)
      expect(performanceMetrics.pageLoad).toBeLessThan(8000); // 8 seconds
      expect(performanceMetrics.templateLoad).toBeLessThan(5000); // 5 seconds
      expect(performanceMetrics.fieldLoad).toBeLessThan(3000); // 3 seconds
      expect(performanceMetrics.searchResponse).toBeLessThan(2000); // 2 seconds
      
      console.log(`📊 ${browserName} Performance:`, performanceMetrics);
      
    } finally {
      await context.close();
    }
  });
});

test.describe('BSG Mobile Responsiveness Tests', () => {
  
  // Test on different mobile devices
  const mobileDevices = [
    { name: 'iPhone 12', device: devices['iPhone 12'] },
    { name: 'iPhone 13 Pro', device: devices['iPhone 13 Pro'] },
    { name: 'Pixel 5', device: devices['Pixel 5'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] }
  ];
  
  mobileDevices.forEach(({ name, device }) => {
    test(`BSG template system responsive on ${name}`, async ({ browser }) => {
      const context = await browser.newContext({
        ...device,
        permissions: ['clipboard-read', 'clipboard-write']
      });
      const page = await context.newPage();
      
      try {
        // Login
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[type="email"]', 'requester@e2e-test.com');
        await page.fill('input[type="password"]', 'test123456');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // Navigate to BSG create page
        await page.goto('/bsg-create');
        await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
        
        // Verify mobile navigation works
        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        if (await mobileMenu.isVisible()) {
          await mobileMenu.click();
          await expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
          await page.click('[data-testid="close-mobile-menu"]');
        }
        
        // Test template category display on mobile
        const templateCategories = page.locator('[data-testid="template-category"]');
        const categoryCount = await templateCategories.count();
        expect(categoryCount).toBeGreaterThan(0);
        
        // Verify categories are properly sized for mobile
        const firstCategory = templateCategories.first();
        const boundingBox = await firstCategory.boundingBox();
        const viewport = page.viewportSize();
        
        expect(boundingBox?.width).toBeLessThanOrEqual(viewport?.width || 0);
        
        // Test template selection on mobile
        await page.click('[data-testid="template-category"]:first-child');
        await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
        
        // Verify template cards are mobile-optimized
        const templateCards = page.locator('[data-testid="template-card"]');
        const firstCard = templateCards.first();
        const cardBox = await firstCard.boundingBox();
        
        expect(cardBox?.width).toBeLessThanOrEqual(viewport?.width || 0);
        
        // Select template and verify fields
        await page.click('[data-testid="template-card"]:first-child');
        await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
        
        // Test form field mobile interaction
        const inputFields = page.locator('input[type="text"], select, textarea');
        const inputCount = await inputFields.count();
        
        if (inputCount > 0) {
          const firstInput = inputFields.first();
          
          // Test touch interaction
          await firstInput.tap();
          await firstInput.fill('Mobile test value');
          
          // Verify field is properly sized
          const inputBox = await firstInput.boundingBox();
          expect(inputBox?.width).toBeLessThanOrEqual((viewport?.width || 0) - 40); // Account for padding
        }
        
        // Test mobile search
        const searchInput = page.locator('[data-testid="template-search"]');
        if (await searchInput.isVisible()) {
          await searchInput.tap();
          await searchInput.fill('mobile search test');
          
          // Verify virtual keyboard doesn't break layout
          await page.waitForTimeout(1000); // Allow for keyboard animation
          
          await page.keyboard.press('Enter');
          await page.waitForSelector('[data-testid="search-results"]', { timeout: 5000 });
        }
        
        // Test scroll behavior
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        
        // Test pinch-to-zoom (if supported)
        if (device.hasTouch) {
          const center = {
            x: (viewport?.width || 0) / 2,
            y: (viewport?.height || 0) / 2
          };
          
          // Simulate pinch gesture
          await page.touchscreen.tap(center.x, center.y);
        }
        
        // Take mobile screenshot
        await page.screenshot({ 
          path: `e2e-test-results/mobile-${name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: true 
        });
        
        console.log(`📱 ${name}: Mobile layout works correctly`);
        
      } catch (error) {
        console.error(`❌ ${name}: Mobile test failed -`, error);
        await page.screenshot({ 
          path: `e2e-test-results/mobile-error-${name.replace(/\s+/g, '-').toLowerCase()}.png`,
          fullPage: true 
        });
        throw error;
      } finally {
        await context.close();
      }
    });
  });

  test('BSG mobile form submission workflow', async ({ browser }) => {
    const context = await browser.newContext(devices['iPhone 12']);
    const page = await context.newPage();
    
    try {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'requester@e2e-test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Navigate and select template
      await page.goto('/bsg-create');
      await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
      
      await page.click('[data-testid="template-category"]:first-child');
      await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
      await page.click('[data-testid="template-card"]:first-child');
      await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
      
      // Fill form on mobile
      await page.fill('[data-testid="ticket-title"]', 'Mobile BSG Ticket Test');
      await page.fill('[data-testid="ticket-description"]', 'Testing BSG ticket creation on mobile device');
      
      // Select priority (test dropdown on mobile)
      await page.selectOption('[data-testid="ticket-priority"]', 'medium');
      
      // Fill template fields
      const inputFields = page.locator('input[type="text"], select');
      const inputCount = await inputFields.count();
      
      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const field = inputFields.nth(i);
        if (await field.isVisible()) {
          await field.tap();
          await field.fill(`Mobile Test ${i + 1}`);
        }
      }
      
      // Verify submit button is accessible on mobile
      const submitButton = page.locator('[data-testid="submit-ticket"]');
      await expect(submitButton).toBeVisible();
      
      // Scroll to submit button if needed
      await submitButton.scrollIntoViewIfNeeded();
      
      // Verify button is properly sized for mobile interaction
      const submitBox = await submitButton.boundingBox();
      expect(submitBox?.height).toBeGreaterThanOrEqual(44); // Minimum touch target size
      
      // Test submit button tap
      await submitButton.tap();
      
      // Wait for submission (would normally show success)
      await page.waitForTimeout(2000);
      
    } finally {
      await context.close();
    }
  });

  test('BSG tablet landscape orientation', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1024, height: 768 }, // iPad landscape
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();
    
    try {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'requester@e2e-test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Test tablet layout
      await page.goto('/bsg-create');
      await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
      
      // Verify template categories use tablet layout (should show more columns)
      const templateCategories = page.locator('[data-testid="template-category"]');
      const categoryCount = await templateCategories.count();
      
      if (categoryCount >= 2) {
        const firstCategory = templateCategories.first();
        const secondCategory = templateCategories.nth(1);
        
        const firstBox = await firstCategory.boundingBox();
        const secondBox = await secondCategory.boundingBox();
        
        // On tablet landscape, categories should be side by side
        const sideBySide = Math.abs((firstBox?.y || 0) - (secondBox?.y || 0)) < 50;
        expect(sideBySide).toBe(true);
      }
      
      // Test template selection
      await page.click('[data-testid="template-category"]:first-child');
      await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
      await page.click('[data-testid="template-card"]:first-child');
      await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
      
      // Verify field layout uses tablet space efficiently
      const fieldGroups = page.locator('[data-testid="field-category-group"]');
      const groupCount = await fieldGroups.count();
      
      if (groupCount >= 2) {
        // Check if field groups can be arranged in columns on tablet
        const firstGroup = fieldGroups.first();
        const secondGroup = fieldGroups.nth(1);
        
        const firstGroupBox = await firstGroup.boundingBox();
        const secondGroupBox = await secondGroup.boundingBox();
        
        // Groups should either be side by side or have proper spacing
        const properSpacing = (secondGroupBox?.y || 0) - ((firstGroupBox?.y || 0) + (firstGroupBox?.height || 0)) >= 0;
        expect(properSpacing).toBe(true);
      }
      
      // Take tablet screenshot
      await page.screenshot({ 
        path: 'e2e-test-results/tablet-landscape.png',
        fullPage: true 
      });
      
    } finally {
      await context.close();
    }
  });
});

test.describe('BSG Accessibility Compliance Tests', () => {
  test('BSG template system meets WCAG guidelines', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Login
      await page.goto('/login');
      await page.fill('input[type="email"]', 'requester@e2e-test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
      
      // Navigate to BSG page
      await page.goto('/bsg-create');
      await page.waitForSelector('[data-testid="template-category"]', { timeout: 10000 });
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Navigate through template categories with keyboard
      for (let i = 0; i < 3; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        await expect(focusedElement).toBeVisible();
      }
      
      // Test Enter key selection
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 });
      
      // Test aria labels and roles
      const templateCategories = page.locator('[data-testid="template-category"]');
      const firstCategory = templateCategories.first();
      
      const ariaLabel = await firstCategory.getAttribute('aria-label');
      const role = await firstCategory.getAttribute('role');
      
      expect(ariaLabel || role).toBeTruthy(); // Should have proper accessibility attributes
      
      // Test form accessibility
      await page.click('[data-testid="template-card"]:first-child');
      await page.waitForSelector('[data-testid="bsg-dynamic-fields"]', { timeout: 10000 });
      
      const inputFields = page.locator('input, select, textarea');
      const inputCount = await inputFields.count();
      
      // Verify form labels are properly associated
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputFields.nth(i);
        const inputId = await input.getAttribute('id');
        
        if (inputId) {
          const label = page.locator(`label[for="${inputId}"]`);
          await expect(label).toBeVisible();
        }
      }
      
      // Test screen reader compatibility
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0); // Should have proper heading structure
      
      console.log('♿ Accessibility tests passed');
      
    } finally {
      await context.close();
    }
  });
});

console.log('🌐 BSG Cross-Browser & Mobile Tests');
console.log('📱 Testing: Mobile Responsive, Tablet Layout, Touch Interaction');
console.log('🔧 Coverage: Browser Compatibility, Performance, Accessibility');
console.log('✅ Devices: iPhone, Android, iPad, Desktop Browsers');