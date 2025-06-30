const { chromium } = require('playwright');

async function testBSGManual() {
  console.log('🚀 Starting BSG Template Manual Test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const page = await browser.newPage();
  
  try {
    // Navigate to the frontend
    console.log('📍 Navigating to frontend...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // If we're on login page, login
    const isLoginPage = await page.locator('input[type="email"]').isVisible();
    if (isLoginPage) {
      console.log('🔐 Logging in as BSG test user...');
      await page.fill('input[type="email"]', 'cabang.utama.user@bsg.co.id');
      await page.fill('input[type="password"]', 'CabangUtama123!');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Navigate to BSG create page
    console.log('📄 Navigating to BSG Create page...');
    await page.goto('http://localhost:3000/bsg-create', { waitUntil: 'networkidle' });
    
    // Check if page loads
    const pageTitle = await page.locator('h1').textContent();
    console.log(`✅ Page loaded: ${pageTitle}`);
    
    // Check for template selector component
    const templateSelectorExists = await page.locator('[data-testid*="template"], .template, [class*="template"]').count();
    console.log(`📋 Template-related elements found: ${templateSelectorExists}`);
    
    // Wait a bit for components to load
    console.log('⏳ Waiting for components to load...');
    await page.waitForTimeout(5000);
    
    // Check what's actually on the page
    console.log('📊 Page content analysis:');
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const selects = await page.locator('select').count();
    console.log(`   - Buttons: ${buttons}`);
    console.log(`   - Inputs: ${inputs}`);
    console.log(`   - Selects: ${selects}`);
    
    // Look for specific BSG components
    const bsgComponents = [
      'BSGTemplateSelector',
      'BSGDynamicFieldRenderer', 
      'template-card',
      'template-category',
      'bsg-template'
    ];
    
    for (const component of bsgComponents) {
      const exists = await page.locator(`[data-testid="${component}"], .${component}, [class*="${component}"]`).count();
      console.log(`   - ${component}: ${exists > 0 ? '✅ Found' : '❌ Not found'}`);
    }
    
    // Check network requests
    console.log('\n🌐 Checking network activity...');
    await page.reload({ waitUntil: 'networkidle' });
    
    // Get all network requests
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('bsg') || response.url().includes('template')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    await page.waitForTimeout(3000);
    
    console.log('📡 BSG-related network requests:');
    responses.forEach(resp => {
      console.log(`   ${resp.status} ${resp.statusText} - ${resp.url}`);
    });
    
    if (responses.length === 0) {
      console.log('   ❌ No BSG-related requests found');
    }
    
    console.log('\n✅ Manual test completed - browser kept open for inspection');
    console.log('🔍 Please manually inspect the page to see what components are loaded');
    
  } catch (error) {
    console.error('❌ Error during manual test:', error);
  }
  
  // Keep browser open for manual inspection
  console.log('\n⏸️  Press Ctrl+C to close when done inspecting...');
}

testBSGManual();