const { test, expect } = require('@playwright/test');

test.describe('BSG Template System Tests', () => {
  
  test('BSG Template System End-to-End Test', async ({ page }) => {
    console.log('🚀 Starting BSG Template System Test...');
    
    // Navigate to the login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Login as BSG test user
    console.log('🔐 Logging in as BSG test user...');
    await page.fill('input[name="email"]', 'cabang.utama.user@bsg.co.id');
    await page.fill('input[name="password"]', 'CabangUtama123!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login and redirect
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ Login successful');
    
    // Navigate to BSG Create Ticket page using the navigation menu
    console.log('📄 Navigating to BSG Create Ticket page...');
    await page.click('text=BSG Support');
    await page.waitForURL('http://localhost:3000/bsg-create', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    // Check if BSG page loads properly
    const bsgTitle = await page.locator('h1').textContent();
    console.log(`✅ BSG Page Title: ${bsgTitle}`);
    expect(bsgTitle).toContain('BSG Banking System Support');
    
    // Wait for BSG template discovery component
    console.log('⏳ Waiting for BSG template discovery component...');
    await page.waitForSelector('[data-testid="bsg-template-discovery"]', { timeout: 10000 });
    
    // Check if template categories are loaded
    console.log('🔍 Checking for template categories...');
    const categoryElements = page.locator('[data-testid="template-category"]');
    const categoryCount = await categoryElements.count();
    console.log(`📋 Template categories found: ${categoryCount}`);
    
    if (categoryCount > 0) {
      console.log('✅ Template categories loaded successfully!');
      
      // Click on the first category
      console.log('🖱️  Clicking on first template category...');
      await categoryElements.first().click();
      
      // Wait for templates to load
      await page.waitForTimeout(2000);
      
      // Check for template cards
      const templateElements = page.locator('[data-testid="template-card"]');
      const templateCount = await templateElements.count();
      console.log(`📄 Templates found in category: ${templateCount}`);
      
      if (templateCount > 0) {
        console.log('✅ Templates loaded successfully!');
        
        // Click on the first template
        console.log('🖱️  Selecting first template...');
        await templateElements.first().click();
        
        // Wait for template selection
        await page.waitForTimeout(1000);
        
        // Check if selected template display appears
        const selectedTemplateVisible = await page.isVisible('[data-testid="selected-template"]');
        console.log(`📋 Selected template display: ${selectedTemplateVisible ? 'Visible' : 'Not visible'}`);
        
        if (selectedTemplateVisible) {
          console.log('✅ Template selection working properly!');
          
          // Check if dynamic fields are loaded
          const dynamicFieldsVisible = await page.isVisible('[data-testid="bsg-dynamic-fields"]');
          console.log(`📝 Dynamic fields visible: ${dynamicFieldsVisible}`);
          
          // Fill in basic ticket information
          console.log('📝 Filling in basic ticket information...');
          await page.fill('input[name="title"]', 'Test BSG OLIBS Request - Automated Test');
          await page.fill('textarea[name="description"]', 'Testing BSG template system with dynamic fields via Playwright automation');
          
          // Select priority
          await page.selectOption('select[name="priority"]', 'medium');
          
          console.log('✅ Basic ticket information filled successfully');
          
          // Check form validation
          const submitButton = page.locator('button[type="submit"]');
          const isSubmitEnabled = await submitButton.isEnabled();
          console.log(`🔘 Submit button enabled: ${isSubmitEnabled}`);
          
          // Test form validation by trying to submit (but don't actually submit)
          if (isSubmitEnabled) {
            console.log('✅ Form validation working - submit button is enabled with required fields filled');
          }
          
        } else {
          console.log('⚠️  Template selection UI not working properly');
        }
        
      } else {
        console.log('⚠️  No templates found in selected category');
      }
      
    } else {
      console.log('⚠️  No template categories found - checking for errors...');
      
      // Check for error messages
      const errorText = await page.locator('text=Error loading').textContent().catch(() => '');
      if (errorText) {
        console.log(`❌ Error found: ${errorText}`);
      }
      
      // Check browser console for errors
      const logs = await page.evaluate(() => {
        return console.logs || [];
      });
      console.log('📊 Browser console logs:', logs);
    }
    
    // Test the regular create ticket page as well
    console.log('\n🔄 Testing regular create ticket page...');
    await page.goto('http://localhost:3000/create-ticket');
    await page.waitForLoadState('networkidle');
    
    // Check if categories are populated
    const categorySelector = page.locator('select, [data-testid="category-select"]').first();
    if (await categorySelector.isVisible()) {
      const options = await categorySelector.locator('option').count();
      console.log(`📁 Regular ticket categories available: ${options}`);
      
      if (options > 1) { // More than just the placeholder option
        console.log('✅ Regular ticket creation has populated categories');
      } else {
        console.log('⚠️  Regular ticket creation categories still empty');
      }
    }
    
    console.log('\n🎉 BSG Template System test completed!');
  });
  
});

// Export for direct execution
if (require.main === module) {
  const { chromium } = require('playwright');
  
  (async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Run the test manually
      await test.step('Run BSG Test', async () => {
        // Navigate to the login page
        console.log('📍 Navigating to login page...');
        await page.goto('http://localhost:3000/login');
        await page.waitForLoadState('networkidle');
        
        // Login as BSG test user  
        console.log('🔐 Logging in as BSG test user...');
        await page.fill('input[name="email"]', 'cabang.utama.user@bsg.co.id');
        await page.fill('input[name="password"]', 'CabangUtama123!');
        await page.click('button[type="submit"]');
        
        // Wait for successful login
        await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
        console.log('✅ Login successful');
        
        // Navigate to BSG Create Ticket page
        console.log('📄 Navigating to BSG Create Ticket page...');
        await page.click('text=BSG Support');
        await page.waitForURL('http://localhost:3000/bsg-create', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        
        // Check if BSG page loads
        const bsgTitle = await page.locator('h1').textContent();
        console.log(`✅ BSG Page Title: ${bsgTitle}`);
        
        // Wait for BSG template discovery
        console.log('⏳ Waiting for BSG template discovery...');
        await page.waitForSelector('[data-testid="bsg-template-discovery"]', { timeout: 10000 });
        
        // Check template categories
        const categoryCount = await page.locator('[data-testid="template-category"]').count();
        console.log(`📋 Template categories found: ${categoryCount}`);
        
        if (categoryCount > 0) {
          console.log('✅ Template categories loaded successfully!');
          
          // Click first category
          await page.locator('[data-testid="template-category"]').first().click();
          await page.waitForTimeout(2000);
          
          // Check templates
          const templateCount = await page.locator('[data-testid="template-card"]').count();
          console.log(`📄 Templates in category: ${templateCount}`);
          
          if (templateCount > 0) {
            console.log('✅ Templates loaded successfully!');
            
            // Select first template
            await page.locator('[data-testid="template-card"]').first().click();
            await page.waitForTimeout(1000);
            
            const selectedVisible = await page.isVisible('[data-testid="selected-template"]');
            console.log(`📋 Template selected: ${selectedVisible ? 'Yes' : 'No'}`);
            
            if (selectedVisible) {
              console.log('✅ Template selection working!');
              
              // Fill basic info
              await page.fill('input[name="title"]', 'Test BSG Template - Playwright');
              await page.fill('textarea[name="description"]', 'Testing BSG system functionality');
              
              console.log('✅ Form filled successfully');
            }
          }
        } else {
          console.log('⚠️  No categories found - checking for errors');
        }
        
        console.log('\n🎉 Test completed - browser kept open for inspection');
      });
      
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
    
    // Keep browser open for inspection
    console.log('\n⏸️  Browser kept open for manual inspection...');
  })();
}