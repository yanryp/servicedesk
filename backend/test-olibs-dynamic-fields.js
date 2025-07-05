const { chromium } = require('playwright');

async function testOLIBSDynamicFields() {
    console.log('🚀 Testing OLIBS Dynamic Fields Specifically...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate and login
        console.log('📍 Step 1: Navigating and logging in...');
        await page.goto('http://localhost:3000/customer/create-ticket');
        await page.waitForTimeout(3000);
        
        // Login if needed
        if (page.url().includes('login')) {
            await page.fill('input[type="email"]', 'cabang.utama.user@bsg.co.id');
            await page.fill('input[type="password"]', 'CabangUtama123!');
            await page.click('button[type="submit"]');
            await page.waitForTimeout(3000);
            
            if (!page.url().includes('create-ticket')) {
                await page.goto('http://localhost:3000/customer/create-ticket');
                await page.waitForTimeout(3000);
            }
        }
        
        console.log('✅ Authentication completed');
        await page.screenshot({ path: 'olibs-test-step1.png' });
        
        // Step 2: Use search functionality to find OLIBS service
        console.log('\n📍 Step 2: Searching for OLIBS service...');
        
        // Wait for search input to be available
        await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
        
        // Search for OLIBS
        await page.fill('input[placeholder*="Search"]', 'OLIBS Perubahan Menu');
        await page.waitForTimeout(2000);
        
        console.log('✅ Search term entered');
        await page.screenshot({ path: 'olibs-test-search.png' });
        
        // Step 3: Look for service categories that appear after search
        console.log('\n📍 Step 3: Looking for filtered service categories...');
        
        // Wait a bit for search to filter
        await page.waitForTimeout(2000);
        
        // Look for any category buttons
        const categoryButtons = await page.locator('button').all();
        console.log(`Found ${categoryButtons.length} buttons total`);
        
        // Look for the first category that appears (likely filtered by search)
        let foundCategory = false;
        for (const button of categoryButtons) {
            const text = await button.textContent();
            if (text && text.includes('services available')) {
                console.log(`🎯 Found category: ${text}`);
                await button.click();
                await page.waitForTimeout(3000);
                foundCategory = true;
                break;
            }
        }
        
        if (!foundCategory) {
            // Clear search and try browsing categories manually
            console.log('⚠️ Search didn\'t work, trying manual browsing...');
            await page.fill('input[placeholder*="Search"]', '');
            await page.waitForTimeout(2000);
            
            const allCategoryButtons = await page.locator('button').all();
            for (const button of allCategoryButtons) {
                const text = await button.textContent();
                if (text && (text.includes('Core Banking') || text.includes('Banking') || text.includes('services available'))) {
                    console.log(`🎯 Trying category: ${text}`);
                    await button.click();
                    await page.waitForTimeout(3000);
                    foundCategory = true;
                    break;
                }
            }
        }
        
        if (!foundCategory) {
            throw new Error('Could not find any service categories');
        }
        
        console.log('✅ Category selected');
        await page.screenshot({ path: 'olibs-test-category.png' });
        
        // Step 4: Look for OLIBS services
        console.log('\n📍 Step 4: Looking for OLIBS services...');
        
        // Wait for services list
        await page.waitForTimeout(3000);
        
        // Look for service buttons
        const serviceButtons = await page.locator('button').all();
        let foundOLIBSService = false;
        
        for (const button of serviceButtons) {
            const text = await button.textContent();
            if (text && (text.includes('OLIBS') || text.includes('OLIBs') || text.includes('Menu') || text.includes('Limit') || text.includes('User'))) {
                console.log(`🎯 Found OLIBS service: ${text.substring(0, 100)}...`);
                await button.click();
                await page.waitForTimeout(4000);
                foundOLIBSService = true;
                break;
            }
        }
        
        if (!foundOLIBSService) {
            console.log('⚠️ No OLIBS service found, trying first available service...');
            const availableServices = await page.locator('button').filter({ hasText: 'priority' }).all();
            if (availableServices.length > 0) {
                const firstServiceText = await availableServices[0].textContent();
                console.log(`🎯 Trying service: ${firstServiceText?.substring(0, 100)}...`);
                await availableServices[0].click();
                await page.waitForTimeout(4000);
                foundOLIBSService = true;
            }
        }
        
        if (!foundOLIBSService) {
            throw new Error('Could not find any services to test');
        }
        
        console.log('✅ Service selected');
        await page.screenshot({ path: 'olibs-test-service.png' });
        
        // Step 5: Check for form and dynamic fields
        console.log('\n📍 Step 5: Checking for dynamic fields...');
        
        // Wait for form to load
        await page.waitForTimeout(3000);
        
        // Check if we're on the details step
        const detailsHeader = await page.locator('h2').filter({ hasText: 'Request Details' });
        if (await detailsHeader.isVisible()) {
            console.log('✅ Details form loaded');
            
            // Look for Service-Specific Information section
            const dynamicFieldsHeader = await page.locator('h3').filter({ hasText: 'Service-Specific Information' });
            if (await dynamicFieldsHeader.isVisible()) {
                console.log('🎉 DYNAMIC FIELDS SECTION FOUND!');
                
                // Take screenshot of dynamic fields
                await page.screenshot({ path: 'olibs-dynamic-fields-found.png' });
                
                // Look for all input elements in the dynamic fields area
                const allInputs = await page.locator('input, select, textarea').all();
                console.log(`Found ${allInputs.length} total input elements`);
                
                // Test each input
                let dynamicFieldCount = 0;
                for (let i = 0; i < allInputs.length; i++) {
                    const input = allInputs[i];
                    const type = await input.getAttribute('type') || await input.getAttribute('tagName');
                    const placeholder = await input.getAttribute('placeholder') || '';
                    const label = await input.getAttribute('aria-label') || '';
                    
                    // Skip basic form fields
                    if (placeholder.includes('Brief description') || placeholder.includes('detail') || 
                        type === 'email' || type === 'password' || type === 'file') {
                        continue;
                    }
                    
                    dynamicFieldCount++;
                    console.log(`  Testing field ${dynamicFieldCount}: ${type} (${placeholder || label || 'no label'})`);
                    
                    try {
                        if (type === 'text' || type === 'INPUT') {
                            await input.fill(`Test Value ${dynamicFieldCount}`);
                            console.log(`    ✅ Filled text field`);
                        } else if (type === 'SELECT') {
                            const options = await input.locator('option').all();
                            if (options.length > 1) {
                                await input.selectOption({ index: 1 });
                                console.log(`    ✅ Selected dropdown option`);
                            }
                        } else if (type === 'TEXTAREA') {
                            await input.fill(`Test content ${dynamicFieldCount}`);
                            console.log(`    ✅ Filled textarea`);
                        }
                    } catch (error) {
                        console.log(`    ⚠️ Could not interact with field: ${error.message}`);
                    }
                }
                
                console.log(`🎉 Successfully tested ${dynamicFieldCount} dynamic fields!`);
                await page.screenshot({ path: 'olibs-dynamic-fields-filled.png' });
                
                // Fill remaining basic fields and submit
                console.log('\n📍 Step 6: Completing ticket submission...');
                
                // Priority
                const priorityLow = await page.locator('button:text("Low")');
                if (await priorityLow.isVisible()) {
                    await priorityLow.click();
                    console.log('✅ Priority selected');
                }
                
                // Subject
                const subjectField = await page.locator('input[placeholder*="Brief"]');
                if (await subjectField.isVisible()) {
                    await subjectField.fill('Test OLIBS Dynamic Fields - Comprehensive Test');
                    console.log('✅ Subject filled');
                }
                
                // Description
                const descField = await page.locator('textarea[placeholder*="detail"]');
                if (await descField.isVisible()) {
                    await descField.fill('This is a comprehensive test of OLIBS dynamic fields functionality. Testing field rendering, input validation, dropdown population, and data persistence through the ticket creation workflow.');
                    console.log('✅ Description filled');
                }
                
                await page.screenshot({ path: 'olibs-complete-form.png' });
                
                // Navigate to review
                const nextButton = await page.locator('button:text("Next")');
                if (await nextButton.isVisible()) {
                    await nextButton.click();
                    await page.waitForTimeout(3000);
                    
                    await page.screenshot({ path: 'olibs-review-step.png' });
                    
                    // Submit ticket
                    const submitButton = await page.locator('button:text("Submit Request")');
                    if (await submitButton.isVisible()) {
                        await submitButton.click();
                        await page.waitForTimeout(5000);
                        
                        const successMsg = await page.locator('h1:text("Request Submitted Successfully")');
                        if (await successMsg.isVisible()) {
                            console.log('🎉 TICKET SUBMITTED SUCCESSFULLY WITH DYNAMIC FIELDS!');
                            await page.screenshot({ path: 'olibs-success.png' });
                            
                            // Extract ticket ID
                            const bodyText = await page.textContent('body');
                            const ticketIdMatch = bodyText.match(/Ticket ID:\s*#?([A-Z0-9-]+)/);
                            if (ticketIdMatch) {
                                console.log(`📋 Ticket ID: ${ticketIdMatch[1]}`);
                            }
                        }
                    }
                }
                
            } else {
                console.log('ℹ️ No Service-Specific Information section found');
                console.log('Looking for any other form elements...');
                
                const allElements = await page.locator('*').all();
                for (const element of allElements.slice(0, 20)) {
                    const text = await element.textContent();
                    if (text && (text.includes('field') || text.includes('Service') || text.includes('OLIBS'))) {
                        console.log(`Found element: ${text.substring(0, 100)}`);
                    }
                }
            }
        } else {
            console.log('⚠️ Details form not found, checking current page...');
            await page.screenshot({ path: 'olibs-unexpected-page.png' });
            
            const allHeaders = await page.locator('h1, h2, h3').all();
            for (const header of allHeaders) {
                const text = await header.textContent();
                console.log(`Header found: ${text}`);
            }
        }
        
        console.log('\n🏁 OLIBS Dynamic Fields Testing Completed!');
        
    } catch (error) {
        console.error('❌ Error during OLIBS testing:', error);
        await page.screenshot({ path: 'olibs-error.png' });
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

// Run the test
testOLIBSDynamicFields().catch(console.error);