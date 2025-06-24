const { test, expect } = require('@playwright/test');

test.describe('Service Catalog Dynamic Fields Focus Test', () => {
  let consoleLogs = [];
  let networkRequests = [];
  let errors = [];

  test.beforeEach(async ({ page }) => {
    // Clear arrays for each test
    consoleLogs = [];
    networkRequests = [];
    errors = [];

    // Listen to console messages
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // Listen to network requests
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
    });

    // Listen to page errors
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Navigate to the Service Catalog page
    await page.goto('http://localhost:3002/service-catalog');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('Test focus loss in dynamic text input fields', async ({ page }) => {
    console.log('=== Starting Service Catalog Focus Test ===');
    
    // Wait for service catalog to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Look for BSG template services - they have "BSG Template" badge
    const bsgServices = await page.locator('div').filter({ hasText: 'BSG Template' }).locator('..').first();
    
    if (await bsgServices.count() > 0) {
      console.log('Found BSG service, clicking...');
      await bsgServices.click();
      
      // Wait for dynamic fields to appear
      await page.waitForTimeout(2000);
      
      // Look for dynamic input fields
      const dynamicFields = await page.locator('input[type="text"], textarea, select').all();
      
      console.log(`Found ${dynamicFields.length} dynamic fields`);
      
      if (dynamicFields.length > 0) {
        const firstField = dynamicFields[0];
        
        // Take screenshot before interaction
        await page.screenshot({ path: 'before-focus-test.png', fullPage: true });
        
        console.log('Testing focus behavior on first dynamic field...');
        
        // Click on the field to focus it
        await firstField.click();
        await page.waitForTimeout(500);
        
        // Type characters one by one to detect focus loss
        const testText = 'testing123focus';
        let focusLostAt = -1;
        
        for (let i = 0; i < testText.length; i++) {
          const char = testText[i];
          
          // Check if field is still focused before typing
          const isFocused = await firstField.evaluate(el => document.activeElement === el);
          
          if (!isFocused) {
            focusLostAt = i;
            console.log(`Focus lost after typing ${i} characters`);
            break;
          }
          
          // Type the character
          await page.keyboard.type(char);
          
          // Small delay to simulate real typing
          await page.waitForTimeout(100);
          
          // Log current value
          const currentValue = await firstField.inputValue();
          console.log(`After typing '${char}': field value = '${currentValue}'`);
        }
        
        // Take screenshot after typing
        await page.screenshot({ path: 'after-focus-test.png', fullPage: true });
        
        // Get final field value
        const finalValue = await firstField.inputValue();
        console.log(`Final field value: '${finalValue}'`);
        console.log(`Expected: '${testText}'`);
        console.log(`Characters lost: ${testText.length - finalValue.length}`);
        
        if (focusLostAt >= 0) {
          console.log(`❌ FOCUS LOST DETECTED at character ${focusLostAt}`);
        } else {
          console.log(`✅ No focus loss detected`);
        }
        
        // Test dropdown fields if available
        const dropdownFields = await page.locator('select').all();
        if (dropdownFields.length > 0) {
          console.log(`Testing ${dropdownFields.length} dropdown fields...`);
          
          for (let i = 0; i < Math.min(dropdownFields.length, 2); i++) {
            const dropdown = dropdownFields[i];
            await dropdown.click();
            await page.waitForTimeout(500);
            
            const isFocused = await dropdown.evaluate(el => document.activeElement === el);
            console.log(`Dropdown ${i} focus state: ${isFocused}`);
          }
        }
        
      } else {
        console.log('❌ No dynamic fields found');
      }
      
    } else {
      console.log('❌ No BSG services found');
    }
    
    // Log all console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. [${log.type.toUpperCase()}] ${log.timestamp}: ${log.text}`);
    });
    
    // Log network requests
    console.log('\n=== NETWORK REQUESTS ===');
    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
    apiRequests.forEach((req, index) => {
      console.log(`${index + 1}. ${req.method} ${req.url} at ${req.timestamp}`);
    });
    
    // Log errors
    if (errors.length > 0) {
      console.log('\n=== PAGE ERRORS ===');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.timestamp}: ${error.message}`);
        if (error.stack) {
          console.log(`   Stack: ${error.stack}`);
        }
      });
    }
    
    // Analyze timing patterns
    console.log('\n=== TIMING ANALYSIS ===');
    const rapidRequests = [];
    for (let i = 1; i < apiRequests.length; i++) {
      const prev = new Date(apiRequests[i-1].timestamp);
      const curr = new Date(apiRequests[i].timestamp);
      const diff = curr - prev;
      
      if (diff < 500) { // Less than 500ms between requests
        rapidRequests.push({
          request1: apiRequests[i-1],
          request2: apiRequests[i],
          timeDiff: diff
        });
      }
    }
    
    if (rapidRequests.length > 0) {
      console.log('⚠️  RAPID API REQUESTS DETECTED:');
      rapidRequests.forEach((rapid, index) => {
        console.log(`${index + 1}. ${rapid.timeDiff}ms between:`);
        console.log(`   ${rapid.request1.method} ${rapid.request1.url}`);
        console.log(`   ${rapid.request2.method} ${rapid.request2.url}`);
      });
    }
    
    console.log('\n=== TEST COMPLETE ===');
  });

  test('Test React re-render patterns', async ({ page }) => {
    console.log('=== Testing React Re-render Patterns ===');
    
    // Enable React DevTools if available
    await page.addInitScript(() => {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {
        onCommitFiberRoot: () => {},
        onCommitFiberUnmount: () => {},
      };
    });
    
    // Wait for service catalog to load
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Click on first service with BSG Template badge
    const firstService = await page.locator('div').filter({ hasText: 'BSG Template' }).locator('..').first();
    if (await firstService.count() > 0) {
      await firstService.click();
      await page.waitForTimeout(2000);
      
      // Look for input fields
      const inputField = await page.locator('input[type="text"]').first();
      
      if (await inputField.count() > 0) {
        // Monitor DOM changes
        await page.evaluate(() => {
          window.domChanges = [];
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              window.domChanges.push({
                type: mutation.type,
                target: mutation.target.tagName,
                timestamp: Date.now()
              });
            });
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
          });
        });
        
        // Focus and type
        await inputField.click();
        await page.keyboard.type('test');
        await page.waitForTimeout(1000);
        
        // Get DOM changes
        const domChanges = await page.evaluate(() => window.domChanges || []);
        
        console.log(`DOM changes detected: ${domChanges.length}`);
        if (domChanges.length > 20) {
          console.log('⚠️  HIGH DOM MUTATION RATE - Possible excessive re-renders');
          console.log('Recent changes:', domChanges.slice(-10));
        }
      }
    }
  });
});