const { test, expect } = require('@playwright/test');

test.describe('BSG Field Focus Loss - Simple Test', () => {
  let consoleLogs = [];
  let consoleErrors = [];
  let networkRequests = [];

  test.beforeEach(async ({ page }) => {
    consoleLogs = [];
    consoleErrors = [];
    networkRequests = [];

    // Monitor console
    page.on('console', (msg) => {
      const text = msg.text();
      const type = msg.type();
      
      if (type === 'error') {
        consoleErrors.push(`${text}`);
      } else if (type === 'warning') {
        consoleLogs.push(`WARNING: ${text}`);
      }
    });

    // Monitor network requests
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('localhost:3001')) {
        networkRequests.push({
          method: request.method(),
          url: url,
          timestamp: Date.now()
        });
      }
    });
  });

  test('Focus Loss Investigation - End to End', async ({ page }) => {
    console.log('🚀 Starting focus loss investigation...');
    
    // Step 1: Navigate and login
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('📝 Attempting login...');
    await page.fill('input[placeholder*="email"], input[type="email"]', 'admin@company.com');
    await page.fill('input[placeholder*="password"], input[type="password"]', 'admin123');
    
    await page.screenshot({ path: 'test-results/simple-01-before-login.png', fullPage: true });
    
    // Click login button
    await page.click('button[type="submit"], button:has-text("Sign in")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Give time for navigation
    
    await page.screenshot({ path: 'test-results/simple-02-after-login.png', fullPage: true });
    
    // Step 2: Navigate to Service Catalog or look for it
    console.log('🔍 Looking for service options...');
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Look for navigation options
    const navItems = await page.locator('a, button').allTextContents();
    console.log('Available navigation items:', navItems.filter(text => text.trim().length > 0));
    
    // Try to find service catalog or create ticket options
    const catalogButton = await page.locator('text=/Service Catalog|Create Ticket|New Request/i').first();
    if (await catalogButton.isVisible()) {
      console.log('📋 Found catalog/ticket option, clicking...');
      await catalogButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      // Try common URLs
      console.log('🔍 Trying direct navigation...');
      await page.goto('http://localhost:3000/service-catalog');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'test-results/simple-03-catalog-page.png', fullPage: true });
    
    // Step 3: Look for form fields or services
    console.log('🔍 Looking for form fields...');
    
    // Check if there are service cards or buttons to click
    const serviceElements = await page.locator('button, .card, [data-testid*="service"], [role="button"]').all();
    console.log(`Found ${serviceElements.length} potential service elements`);
    
    if (serviceElements.length > 0) {
      // Click on first service
      console.log('🎯 Clicking on first service element...');
      await serviceElements[0].click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    await page.screenshot({ path: 'test-results/simple-04-service-selected.png', fullPage: true });
    
    // Step 4: Find and test input fields
    console.log('📝 Looking for input fields...');
    
    const allInputs = await page.locator('input, textarea, select').all();
    console.log(`Found ${allInputs.length} form fields`);
    
    // Filter for text inputs
    const textInputs = [];
    for (const input of allInputs) {
      const type = await input.getAttribute('type');
      const tagName = await input.evaluate(el => el.tagName.toLowerCase());
      
      if (tagName === 'input' && (!type || type === 'text')) {
        textInputs.push(input);
      }
    }
    
    console.log(`Found ${textInputs.length} text input fields`);
    
    if (textInputs.length > 0) {
      console.log('🎯 Testing focus behavior on text input...');
      
      const testInput = textInputs[0];
      
      // Get field info
      const placeholder = await testInput.getAttribute('placeholder') || 'Unknown';
      const id = await testInput.getAttribute('id') || 'Unknown';
      console.log(`Testing field: ID="${id}", Placeholder="${placeholder}"`);
      
      // Clear any existing network requests
      networkRequests = [];
      
      // Focus the field
      await testInput.focus();
      await page.waitForTimeout(200);
      
      console.log('⌨️ Starting character-by-character typing test...');
      
      const testText = 'Test123';
      for (let i = 0; i < testText.length; i++) {
        const char = testText[i];
        
        console.log(`[${i+1}/${testText.length}] Typing: "${char}"`);
        
        // Check focus before typing
        const focusedBefore = await testInput.evaluate(el => document.activeElement === el);
        
        // Type the character
        await testInput.type(char, { delay: 100 });
        
        // Small wait
        await page.waitForTimeout(200);
        
        // Check focus after typing
        const focusedAfter = await testInput.evaluate(el => document.activeElement === el);
        
        // Get current value
        const currentValue = await testInput.inputValue();
        
        console.log(`  Focus before: ${focusedBefore}, Focus after: ${focusedAfter}`);
        console.log(`  Current value: "${currentValue}"`);
        
        // Check for recent network requests
        const recentRequests = networkRequests.filter(req => {
          return (Date.now() - req.timestamp) < 1000; // Last 1 second
        });
        
        if (recentRequests.length > 0) {
          console.log(`  Network activity: ${recentRequests.length} requests`);
          recentRequests.forEach(req => {
            console.log(`    ${req.method} ${req.url.replace('http://localhost:3001', '')}`);
          });
        }
        
        // If focus is lost, record it
        if (!focusedAfter && focusedBefore) {
          console.log(`❌ FOCUS LOST after typing "${char}"`);
          await page.screenshot({ 
            path: `test-results/simple-05-focus-lost-${i+1}.png`, 
            fullPage: true 
          });
          
          // Try to refocus
          await testInput.focus();
          const refocused = await testInput.evaluate(el => document.activeElement === el);
          console.log(`  Refocus successful: ${refocused}`);
        }
      }
      
      console.log('✅ Character typing test completed');
      
      // Final screenshot
      await page.screenshot({ path: 'test-results/simple-06-final-state.png', fullPage: true });
        
      // Test rapid typing
      console.log('⚡ Testing rapid typing...');
      await testInput.clear();
      await testInput.focus();
      
      const rapidText = 'RapidTest';
      await testInput.type(rapidText, { delay: 50 }); // Fast typing
      
      const finalValue = await testInput.inputValue();
      const stillFocused = await testInput.evaluate(el => document.activeElement === el);
      
      console.log(`Rapid typing result: "${finalValue}" (expected: "${rapidText}")`);
      console.log(`Still focused after rapid typing: ${stillFocused}`);
      console.log(`Text matches: ${finalValue === rapidText}`);
      
    } else {
      console.log('⚠️ No text input fields found for testing');
      
      // Check what fields we do have
      for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
        const input = allInputs[i];
        const type = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        const placeholder = await input.getAttribute('placeholder');
        console.log(`Field ${i+1}: ${tagName}[type="${type}"] placeholder="${placeholder}"`);
      }
    }
    
    // Final summary
    console.log('\n📊 SUMMARY:');
    console.log(`Console errors: ${consoleErrors.length}`);
    consoleErrors.forEach(error => console.log(`  ❌ ${error}`));
    
    console.log(`Console warnings: ${consoleLogs.length}`);
    consoleLogs.forEach(log => console.log(`  ⚠️ ${log}`));
    
    console.log(`Network requests to backend: ${networkRequests.length}`);
    const uniqueEndpoints = [...new Set(networkRequests.map(req => req.url.replace('http://localhost:3001', '')))];
    uniqueEndpoints.forEach(endpoint => {
      console.log(`  🌐 ${endpoint}`);
    });
    
    console.log('🎉 Focus loss investigation completed');
  });
});