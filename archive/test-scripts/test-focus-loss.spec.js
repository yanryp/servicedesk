const { test, expect } = require('@playwright/test');

test.describe('BSG Field Focus Loss Investigation', () => {
  let consoleLogs = [];
  let consoleErrors = [];
  let networkRequests = [];

  test.beforeEach(async ({ page }) => {
    // Reset arrays for each test
    consoleLogs = [];
    consoleErrors = [];
    networkRequests = [];

    // Monitor console messages
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push(`[${new Date().toISOString()}] ERROR: ${text}`);
      } else if (type === 'warning') {
        consoleLogs.push(`[${new Date().toISOString()}] WARNING: ${text}`);
      } else if (type === 'log') {
        consoleLogs.push(`[${new Date().toISOString()}] LOG: ${text}`);
      }
    });

    // Monitor network requests
    page.on('request', (request) => {
      networkRequests.push({
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        postData: request.postData()
      });
    });

    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('Login and Navigate to Service Catalog', async ({ page }) => {
    console.log('🔍 Starting login process...');
    
    // Check if already logged in
    const loginButton = await page.locator('button[type="submit"]').first();
    if (await loginButton.isVisible()) {
      console.log('📝 Logging in...');
      
      // Fill login form
      await page.fill('input[type="email"]', 'admin@company.com');
      await page.fill('input[type="password"]', 'admin123');
      
      // Take screenshot before login
      await page.screenshot({ path: 'test-results/01-login-form.png', fullPage: true });
      
      // Click login button
      await loginButton.click();
      
      // Wait for navigation after login
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    console.log('✅ Login completed');
    
    // Take screenshot after login
    await page.screenshot({ path: 'test-results/02-after-login.png', fullPage: true });
    
    // Navigate to Service Catalog
    console.log('🔍 Navigating to Service Catalog...');
    
    // Look for Service Catalog link or button
    const serviceCatalogLink = await page.locator('text=Service Catalog').first();
    if (await serviceCatalogLink.isVisible()) {
      await serviceCatalogLink.click();
    } else {
      // Try alternative navigation
      const navButton = await page.locator('[data-testid="service-catalog"], a[href*="service-catalog"], a[href*="catalog"]').first();
      if (await navButton.isVisible()) {
        await navButton.click();
      } else {
        // Manual navigation
        await page.goto('http://localhost:3000/service-catalog');
      }
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('✅ Service Catalog page loaded');
    await page.screenshot({ path: 'test-results/03-service-catalog.png', fullPage: true });
  });

  test('Deep Focus Loss Investigation on BSG Template', async ({ page }) => {
    console.log('🔍 Starting comprehensive focus loss investigation...');
    
    // Login first
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to Service Catalog
    await page.goto('http://localhost:3000/service-catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('📋 Looking for BSG template services...');
    
    // Look for BSG-related services
    const bsgServices = await page.locator('text=/BSG|Bank|Cabang|ATM|Terminal/i').all();
    
    if (bsgServices.length === 0) {
      console.log('⚠️ No BSG services found, looking for any service with dynamic fields...');
      
      // Click on any service that might have dynamic fields
      const anyService = await page.locator('button, .service-card, [data-testid*="service"]').first();
      if (await anyService.isVisible()) {
        await anyService.click();
      }
    } else {
      console.log(`✅ Found ${bsgServices.length} BSG-related services`);
      await bsgServices[0].click();
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    console.log('🔍 Looking for dynamic fields...');
    await page.screenshot({ path: 'test-results/04-selected-service.png', fullPage: true });
    
    // Look for text input fields (BSG dynamic fields)
    const textInputs = await page.locator('input[type="text"]').all();
    const textareas = await page.locator('textarea').all();
    const selects = await page.locator('select').all();
    
    console.log(`📝 Found ${textInputs.length} text inputs, ${textareas.length} textareas, ${selects.length} selects`);
    
    if (textInputs.length === 0 && textareas.length === 0) {
      console.log('⚠️ No dynamic fields found, checking for form fields...');
      const allInputs = await page.locator('input, textarea, select').all();
      console.log(`Found ${allInputs.length} total form fields`);
      
      // Take screenshot of current state
      await page.screenshot({ path: 'test-results/05-no-dynamic-fields.png', fullPage: true });
    }
    
    // Test focus behavior on the first available text input
    if (textInputs.length > 0) {
      console.log('🎯 Testing focus behavior on first text input...');
      
      const firstInput = textInputs[0];
      const fieldLabel = await firstInput.getAttribute('placeholder') || await firstInput.getAttribute('id') || 'Unknown Field';
      
      console.log(`📝 Testing field: ${fieldLabel}`);
      
      // Clear network requests before test
      networkRequests = [];
      
      // Focus the input
      await firstInput.focus();
      await page.waitForTimeout(100);
      
      console.log('⌨️ Starting typing test...');
      
      // Type characters one by one and check focus after each
      const testString = 'testing123';
      for (let i = 0; i < testString.length; i++) {
        const char = testString[i];
        
        console.log(`Typing character ${i + 1}: "${char}"`);
        
        // Check if field is still focused before typing
        const isFocusedBefore = await firstInput.evaluate((el) => document.activeElement === el);
        console.log(`  - Focus before typing "${char}": ${isFocusedBefore}`);
        
        // Type the character
        await firstInput.type(char);
        
        // Short wait to see if focus is lost
        await page.waitForTimeout(200);
        
        // Check if field is still focused after typing
        const isFocusedAfter = await firstInput.evaluate((el) => document.activeElement === el);
        console.log(`  - Focus after typing "${char}": ${isFocusedAfter}`);
        
        // Check current value
        const currentValue = await firstInput.inputValue();
        console.log(`  - Current value: "${currentValue}"`);
        
        // Take screenshot if focus is lost
        if (!isFocusedAfter) {
          console.log(`❌ FOCUS LOST after typing "${char}" (character ${i + 1})`);
          await page.screenshot({ 
            path: `test-results/06-focus-lost-after-char-${i + 1}.png`, 
            fullPage: true 
          });
          
          // Try to refocus and continue
          await firstInput.focus();
          await page.waitForTimeout(100);
          
          const refocused = await firstInput.evaluate((el) => document.activeElement === el);
          console.log(`  - Refocused successfully: ${refocused}`);
        }
        
        // Log any network requests that happened during typing
        const recentRequests = networkRequests.filter(req => {
          const requestTime = new Date(req.timestamp).getTime();
          const now = new Date().getTime();
          return now - requestTime < 500; // Requests in last 500ms
        });
        
        if (recentRequests.length > 0) {
          console.log(`  - Network requests during typing:`, recentRequests);
        }
      }
      
      console.log('✅ Typing test completed');
      await page.screenshot({ path: 'test-results/07-after-typing-test.png', fullPage: true });
    }
    
    // Test dropdown focus behavior
    if (selects.length > 0) {
      console.log('🎯 Testing dropdown focus behavior...');
      
      const firstSelect = selects[0];
      
      // Focus the select
      await firstSelect.focus();
      await page.waitForTimeout(100);
      
      // Check if focused
      const isFocused = await firstSelect.evaluate((el) => document.activeElement === el);
      console.log(`Dropdown focused: ${isFocused}`);
      
      // Get options
      const options = await firstSelect.locator('option').all();
      console.log(`Found ${options.length} options`);
      
      if (options.length > 1) {
        // Select different option
        const optionValue = await options[1].getAttribute('value');
        await firstSelect.selectOption(optionValue);
        
        await page.waitForTimeout(200);
        
        // Check if still focused
        const stillFocused = await firstSelect.evaluate((el) => document.activeElement === el);
        console.log(`Dropdown still focused after selection: ${stillFocused}`);
      }
      
      await page.screenshot({ path: 'test-results/08-dropdown-test.png', fullPage: true });
    }
    
    // Log all console messages and network requests
    console.log('\n📊 CONSOLE MESSAGES DURING TEST:');
    consoleLogs.forEach(log => console.log(log));
    
    console.log('\n❌ CONSOLE ERRORS DURING TEST:');
    consoleErrors.forEach(error => console.log(error));
    
    console.log('\n🌐 NETWORK REQUESTS DURING TEST:');
    networkRequests.forEach(req => {
      if (req.url.includes('localhost:3001')) {
        console.log(`${req.timestamp} - ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`  Data: ${req.postData.substring(0, 200)}...`);
        }
      }
    });
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/09-final-state.png', fullPage: true });
    
    console.log('🎉 Focus loss investigation completed');
  });

  test('Rapid Typing Test - Simulate Real User Behavior', async ({ page }) => {
    console.log('🔍 Starting rapid typing test...');
    
    // Login
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Navigate to Service Catalog
    await page.goto('http://localhost:3000/service-catalog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Find and click on a service
    const serviceButton = await page.locator('button, .service-card, [data-testid*="service"]').first();
    if (await serviceButton.isVisible()) {
      await serviceButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // Find text input
    const textInput = await page.locator('input[type="text"]').first();
    if (await textInput.isVisible()) {
      console.log('📝 Found text input, starting rapid typing test...');
      
      // Clear network requests
      networkRequests = [];
      
      await textInput.focus();
      await page.waitForTimeout(100);
      
      // Rapid typing - like a real user typing quickly
      const rapidText = 'Testing rapid typing behavior';
      
      console.log('⌨️ Typing rapidly...');
      await textInput.type(rapidText, { delay: 50 }); // 50ms between characters
      
      await page.waitForTimeout(500);
      
      // Check final state
      const finalValue = await textInput.inputValue();
      const isFocused = await textInput.evaluate((el) => document.activeElement === el);
      
      console.log(`Final value: "${finalValue}"`);
      console.log(`Still focused: ${isFocused}`);
      console.log(`Expected: "${rapidText}"`);
      console.log(`Values match: ${finalValue === rapidText}`);
      
      await page.screenshot({ path: 'test-results/10-rapid-typing-result.png', fullPage: true });
      
      // Log network activity during rapid typing
      const typingRequests = networkRequests.filter(req => req.url.includes('localhost:3001'));
      console.log(`Network requests during rapid typing: ${typingRequests.length}`);
      typingRequests.forEach(req => {
        console.log(`  ${req.timestamp} - ${req.method} ${req.url}`);
      });
    }
  });

  test.afterEach(async ({ page }) => {
    // Ensure test-results directory exists
    await page.evaluate(() => {
      // This will be executed in browser context
      console.log('Test completed');
    });
  });
});