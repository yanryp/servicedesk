const { chromium } = require('playwright');

async function testBSGTemplates() {
  console.log('🚀 Starting BSG Template System Test...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Login as BSG test user
    console.log('🔐 Logging in as BSG test user...');
    await page.fill('input[type="email"]', 'cabang.utama.user@bsg.co.id');
    await page.fill('input[type="password"]', 'CabangUtama123!');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForTimeout(2000);
    
    // Navigate to BSG Create Ticket page
    console.log('📄 Navigating to BSG Create Ticket page...');
    await page.goto('http://localhost:3000/bsg-create');
    await page.waitForLoadState('networkidle');
    
    // Check if BSG page loads
    const bsgTitle = await page.locator('h1').textContent();
    console.log(`✅ BSG Page Title: ${bsgTitle}`);
    
    // Wait for template selector to load
    console.log('⏳ Waiting for BSG template selector...');
    await page.waitForTimeout(3000);
    
    // Check if any templates are loaded
    const templateCount = await page.locator('[data-testid="template-card"]').count();
    console.log(`📋 Templates loaded: ${templateCount}`);
    
    if (templateCount > 0) {
      console.log('✅ Templates found! Testing template selection...');
      
      // Click on first template
      await page.click('[data-testid="template-card"]:first-child');
      
      // Wait for template to be selected
      await page.waitForTimeout(2000);
      
      // Check for dynamic fields
      const dynamicFieldsVisible = await page.isVisible('[data-testid="bsg-dynamic-fields"]');
      console.log(`📝 Dynamic fields visible: ${dynamicFieldsVisible}`);
      
      // Fill in basic information
      await page.fill('input[name="title"]', 'Test BSG OLIBS Request');
      await page.fill('textarea[name="description"]', 'Testing BSG template system with dynamic fields');
      
      console.log('✅ Basic ticket information filled');
      
      // Try to fill dynamic fields if they exist
      const fieldInputs = await page.locator('input, select, textarea').count();
      console.log(`📊 Total form fields: ${fieldInputs}`);
      
    } else {
      console.log('⚠️  No templates found - checking API endpoints...');
      
      // Test template API directly
      const response = await page.goto('http://localhost:3001/api/bsg-templates');
      const apiData = await response.json();
      console.log(`📡 API Response: ${JSON.stringify(apiData, null, 2)}`);
    }
    
    console.log('\n🎉 BSG Template test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during BSG template test:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser kept open for manual inspection...');
    // await browser.close();
  }
}

testBSGTemplates();