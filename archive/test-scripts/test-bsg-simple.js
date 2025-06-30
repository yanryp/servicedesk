const { chromium } = require('playwright');

async function testBSGSystem() {
  console.log('🚀 Starting BSG Template System Test...');
  
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  
  try {
    // Navigate to the login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Login as BSG test user  
    console.log('🔐 Logging in as BSG test user...');
    
    // Try different selectors for email field
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]', 
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        await page.fill(selector, 'cabang.utama.user@bsg.co.id');
        emailFilled = true;
        console.log(`✅ Email filled using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️  Email selector ${selector} not found`);
      }
    }
    
    if (!emailFilled) {
      console.log('❌ Could not find email input field');
      return;
    }
    
    // Try different selectors for password field  
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="Password" i]'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, 'CabangUtama123!');
        passwordFilled = true;
        console.log(`✅ Password filled using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️  Password selector ${selector} not found`);
      }
    }
    
    if (!passwordFilled) {
      console.log('❌ Could not find password input field');
      return;
    }
    
    // Click submit button
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")'
    ];
    
    let submitClicked = false;
    for (const selector of submitSelectors) {
      try {
        await page.click(selector);
        submitClicked = true;
        console.log(`✅ Submit clicked using selector: ${selector}`);
        break;
      } catch (e) {
        console.log(`⚠️  Submit selector ${selector} not found`);
      }
    }
    
    if (!submitClicked) {
      console.log('❌ Could not find submit button');
      return;
    }
    
    // Wait for redirect after login
    console.log('⏳ Waiting for login redirect...');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log(`📍 Current URL after login: ${currentUrl}`);
    
    // Navigate to BSG Create Ticket page via URL
    console.log('📄 Navigating to BSG Create Ticket page...');
    await page.goto('http://localhost:3000/bsg-create');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads
    const bsgTitle = await page.locator('h1').textContent().catch(() => 'No title found');
    console.log(`✅ BSG Page Title: ${bsgTitle}`);
    
    // Wait for BSG template discovery component
    console.log('⏳ Waiting for BSG template discovery component...');
    await page.waitForTimeout(3000);
    
    // Check if template discovery component exists
    const discoveryExists = await page.locator('[data-testid="bsg-template-discovery"]').count();
    console.log(`📋 BSG Template Discovery Component: ${discoveryExists > 0 ? 'Found' : 'Not found'}`);
    
    if (discoveryExists > 0) {
      // Check for template categories
      await page.waitForTimeout(2000);
      const categoryCount = await page.locator('[data-testid="template-category"]').count();
      console.log(`📁 Template categories found: ${categoryCount}`);
      
      if (categoryCount > 0) {
        console.log('✅ Template categories loaded successfully!');
        
        // Get category names
        const categoryNames = await page.locator('[data-testid="template-category"] .font-medium').allTextContents();
        console.log('📋 Available categories:', categoryNames);
        
        // Click on the first category
        console.log('🖱️  Clicking on first template category...');
        await page.locator('[data-testid="template-category"]').first().click();
        
        // Wait for templates to load
        await page.waitForTimeout(3000);
        
        // Check for template cards
        const templateCount = await page.locator('[data-testid="template-card"]').count();
        console.log(`📄 Templates found in category: ${templateCount}`);
        
        if (templateCount > 0) {
          console.log('✅ Templates loaded successfully!');
          
          // Get template names
          const templateNames = await page.locator('[data-testid="template-card"] .font-medium').allTextContents();
          console.log('📋 Available templates:', templateNames);
          
          // Click on the first template
          console.log('🖱️  Selecting first template...');
          await page.locator('[data-testid="template-card"]').first().click();
          
          // Wait for template selection
          await page.waitForTimeout(2000);
          
          // Check if selected template display appears
          const selectedTemplateVisible = await page.locator('[data-testid="selected-template"]').count();
          console.log(`📋 Selected template display: ${selectedTemplateVisible > 0 ? 'Visible' : 'Not visible'}`);
          
          if (selectedTemplateVisible > 0) {
            console.log('✅ Template selection working properly!');
            
            // Check if form fields are available
            const titleField = await page.locator('input[name="title"]').count();
            const descField = await page.locator('textarea[name="description"]').count();
            console.log(`📝 Form fields - Title: ${titleField > 0 ? 'Found' : 'Not found'}, Description: ${descField > 0 ? 'Found' : 'Not found'}`);
            
            if (titleField > 0 && descField > 0) {
              // Fill in basic ticket information
              console.log('📝 Filling in basic ticket information...');
              await page.fill('input[name="title"]', 'Test BSG OLIBS Request - Playwright Test');
              await page.fill('textarea[name="description"]', 'Testing BSG template system with dynamic fields via Playwright automation');
              
              console.log('✅ Basic ticket information filled successfully');
              
              // Check if submit button is enabled
              const submitButton = page.locator('button[type="submit"]');
              const isSubmitEnabled = await submitButton.isEnabled().catch(() => false);
              console.log(`🔘 Submit button enabled: ${isSubmitEnabled}`);
            }
          }
        } else {
          console.log('⚠️  No templates found in selected category');
        }
      } else {
        console.log('⚠️  No template categories found');
        
        // Check for loading or error states
        const loadingText = await page.locator('text=Loading').count();
        const errorText = await page.locator('text=Error').count();
        console.log(`📊 Loading indicators: ${loadingText}, Error messages: ${errorText}`);
      }
    } else {
      console.log('❌ BSG Template Discovery component not found');
      
      // Check what's actually on the page
      const pageContent = await page.locator('body').textContent();
      console.log('📄 Page content preview:', pageContent.substring(0, 200) + '...');
    }
    
    console.log('\n🎉 BSG Template System test completed!');
    console.log('🔍 Browser kept open for manual inspection...');
    
    // Keep browser open for manual inspection
    // await browser.close();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBSGSystem();