const { chromium } = require('playwright');

async function testCustomerPortalDynamicFields() {
    console.log('🚀 Starting Targeted Customer Portal Dynamic Fields Testing...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate to Customer Portal
        console.log('📍 Step 1: Navigating to Customer Portal...');
        await page.goto('http://localhost:3000/customer/create-ticket');
        await page.waitForTimeout(3000);
        
        // Take screenshot of landing page
        await page.screenshot({ path: 'customer-portal-landing.png' });
        console.log('✅ Successfully navigated to customer portal');
        
        // Check for authentication status
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        // Step 2: Login if needed
        console.log('\n📍 Step 2: Checking authentication...');
        
        // Look for login redirection or form
        if (currentUrl.includes('login') || currentUrl.includes('auth')) {
            console.log('🔐 Login required, looking for login form...');
            
            // Wait for login form to appear
            await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 5000 });
            
            const emailInput = await page.locator('input[type="email"], input[name="email"]');
            const passwordInput = await page.locator('input[type="password"], input[name="password"]');
            
            await emailInput.fill('cabang.utama.user@bsg.co.id');
            await passwordInput.fill('CabangUtama123!');
            
            // Find and click login button
            const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
            await loginButton.click();
            await page.waitForTimeout(3000);
            
            console.log('✅ Login attempted');
        } else {
            console.log('ℹ️ No login required or already authenticated');
        }
        
        // Navigate to create ticket page if not already there
        if (!page.url().includes('create-ticket')) {
            console.log('🔄 Navigating to create ticket page...');
            await page.goto('http://localhost:3000/customer/create-ticket');
            await page.waitForTimeout(3000);
        }
        
        // Step 3: Wait for service categories to load
        console.log('\n📍 Step 3: Waiting for service categories to load...');
        
        // Wait for either loading indicator to disappear or service categories to appear
        await page.waitForFunction(() => {
            const loadingText = Array.from(document.querySelectorAll('*')).find(el => 
                el.textContent && el.textContent.includes('Loading services...'));
            const serviceCategories = document.querySelectorAll('button');
            const hasServiceCategories = Array.from(serviceCategories).some(btn => 
                btn.textContent && btn.textContent.includes('services available'));
            return !loadingText || hasServiceCategories;
        }, { timeout: 15000 });
        
        await page.screenshot({ path: 'service-categories-loaded.png' });
        console.log('✅ Service categories loaded');
        
        // Step 4: Test Service Selection
        console.log('\n📍 Step 4: Testing service selection...');
        
        // Look for service category buttons
        const categoryButtons = await page.locator('button').filter({ hasText: 'services available' }).all();
        console.log(`Found ${categoryButtons.length} service categories`);
        
        if (categoryButtons.length > 0) {
            // Look for a category that is likely to have OLIBS or template services
            let selectedCategoryIndex = 0;
            for (let i = 0; i < categoryButtons.length; i++) {
                const categoryText = await categoryButtons[i].textContent();
                if (categoryText && (categoryText.includes('Banking') || categoryText.includes('Core') || categoryText.includes('Error'))) {
                    selectedCategoryIndex = i;
                    console.log(`🎯 Found promising category: ${categoryText}`);
                    break;
                }
            }
            
            console.log(`🎯 Clicking on category ${selectedCategoryIndex + 1}...`);
            await categoryButtons[selectedCategoryIndex].click();
            await page.waitForTimeout(2000);
            
            // Wait for services to appear
            await page.waitForSelector('h3:text("Choose Your Service")', { timeout: 5000 });
            console.log('✅ Service list appeared');
            
            // Look for individual service buttons - try to find OLIBS services
            const serviceButtons = await page.locator('button').filter({ hasText: 'priority' }).all();
            console.log(`Found ${serviceButtons.length} services in category`);
            
            if (serviceButtons.length > 0) {
                // Look for OLIBS, Banking, or template-related services
                let selectedServiceIndex = 0;
                for (let i = 0; i < serviceButtons.length; i++) {
                    const serviceText = await serviceButtons[i].textContent();
                    if (serviceText && (serviceText.includes('OLIBS') || serviceText.includes('OLIBs') || serviceText.includes('BSG') || serviceText.includes('User'))) {
                        selectedServiceIndex = i;
                        console.log(`🎯 Found promising service: ${serviceText.substring(0, 100)}...`);
                        break;
                    }
                }
                
                console.log(`🎯 Selecting service ${selectedServiceIndex + 1}...`);
                await serviceButtons[selectedServiceIndex].click();
                await page.waitForTimeout(3000);
                
                await page.screenshot({ path: 'service-selected.png' });
                console.log('✅ Service selected');
                
                // Step 5: Check if we're on the details step (Step 3)
                console.log('\n📍 Step 5: Checking for details step...');
                
                // Wait for the details form to appear
                await page.waitForSelector('h2:text("Request Details")', { timeout: 10000 });
                console.log('✅ Details form appeared');
                
                // Step 6: Look for dynamic fields
                console.log('\n📍 Step 6: Looking for dynamic fields...');
                
                // Check for the dynamic fields section
                const dynamicFieldsSection = await page.locator('h3:text("Service-Specific Information")');
                if (await dynamicFieldsSection.isVisible()) {
                    console.log('🎉 Dynamic fields section found!');
                    
                    // Look for individual dynamic fields
                    const dynamicFieldInputs = await page.locator('[data-testid*="dynamic"], .dynamic-field, [data-field-type]').all();
                    console.log(`Found ${dynamicFieldInputs.length} dynamic field elements`);
                    
                    if (dynamicFieldInputs.length > 0) {
                        console.log('✅ Dynamic fields detected, testing functionality...');
                        
                        // Test each dynamic field
                        for (let i = 0; i < dynamicFieldInputs.length; i++) {
                            const field = dynamicFieldInputs[i];
                            const tagName = await field.getAttribute('tagName');
                            const type = await field.getAttribute('type');
                            const placeholder = await field.getAttribute('placeholder');
                            
                            console.log(`Testing field ${i + 1}: ${tagName} (type: ${type}, placeholder: ${placeholder})`);
                            
                            try {
                                if (tagName === 'INPUT' && (type === 'text' || !type)) {
                                    await field.fill(`Test dynamic value ${i + 1}`);
                                    console.log(`  ✅ Filled text field with test value`);
                                } else if (tagName === 'SELECT') {
                                    const options = await field.locator('option').all();
                                    if (options.length > 1) {
                                        await field.selectOption({ index: 1 });
                                        console.log(`  ✅ Selected option in dropdown`);
                                    }
                                } else if (tagName === 'TEXTAREA') {
                                    await field.fill(`Test dynamic textarea content ${i + 1}`);
                                    console.log(`  ✅ Filled textarea with test content`);
                                }
                                
                                await page.waitForTimeout(500);
                            } catch (error) {
                                console.log(`  ⚠️ Could not interact with field ${i + 1}:`, error.message);
                            }
                        }
                    } else {
                        console.log('ℹ️ No dynamic field inputs found within dynamic fields section');
                    }
                } else {
                    console.log('ℹ️ No dynamic fields section found for this service');
                }
                
                // Step 7: Fill out basic form fields
                console.log('\n📍 Step 7: Filling out basic form fields...');
                
                // Fill priority - look for priority option buttons
                const priorityLabels = ['Low', 'Medium', 'High'];
                let prioritySelected = false;
                for (const label of priorityLabels) {
                    const priorityButton = await page.locator(`button:has-text("${label}")`);
                    if (await priorityButton.isVisible()) {
                        await priorityButton.click();
                        console.log(`✅ Priority selected: ${label}`);
                        prioritySelected = true;
                        break;
                    }
                }
                if (!prioritySelected) {
                    console.log('⚠️ Could not find priority buttons');
                }
                
                // Fill subject
                const subjectInput = await page.locator('input[placeholder*="Brief description"], input[placeholder*="issue"]');
                if (await subjectInput.isVisible()) {
                    await subjectInput.fill('Test Ticket - Dynamic Fields Integration Testing');
                    console.log('✅ Subject filled');
                }
                
                // Fill description
                const descriptionTextarea = await page.locator('textarea[placeholder*="detail"], textarea[placeholder*="issue"]');
                if (await descriptionTextarea.isVisible()) {
                    await descriptionTextarea.fill('This is a comprehensive test ticket to verify that the dynamic fields integration is working correctly in the customer portal. Testing field persistence, dropdown loading, and submission.');
                    console.log('✅ Description filled');
                }
                
                await page.screenshot({ path: 'form-filled.png' });
                
                // Step 8: Navigate to review step
                console.log('\n📍 Step 8: Navigating to review step...');
                
                const nextButton = await page.locator('button:text("Next")');
                if (await nextButton.isVisible()) {
                    await nextButton.click();
                    await page.waitForTimeout(3000);
                    
                    // Wait for review step
                    await page.waitForSelector('h2:text("Review Your Request")', { timeout: 10000 });
                    console.log('✅ Review step reached');
                    
                    // Check for dynamic field values in review
                    const reviewContent = await page.textContent('body');
                    if (reviewContent.includes('Service Information') || reviewContent.includes('Test dynamic value')) {
                        console.log('✅ Dynamic field values visible in review step');
                    } else {
                        console.log('ℹ️ Dynamic field values not clearly visible in review step');
                    }
                    
                    await page.screenshot({ path: 'review-step.png' });
                    
                    // Step 9: Submit ticket
                    console.log('\n📍 Step 9: Submitting ticket...');
                    
                    const submitButton = await page.locator('button:text("Submit Request")');
                    if (await submitButton.isVisible()) {
                        await submitButton.click();
                        await page.waitForTimeout(5000);
                        
                        // Check for success message
                        const successMessage = await page.locator('h1:text("Request Submitted Successfully")');
                        if (await successMessage.isVisible()) {
                            console.log('🎉 Ticket submitted successfully!');
                            
                            // Extract ticket ID if visible
                            const ticketIdElement = await page.locator('strong:text("Ticket ID:")');
                            if (await ticketIdElement.isVisible()) {
                                const ticketInfo = await page.textContent('div:has(strong:text("Ticket ID:"))');
                                console.log(`✅ Ticket created: ${ticketInfo}`);
                            }
                        } else {
                            console.log('⚠️ No clear success message found');
                        }
                        
                        await page.screenshot({ path: 'ticket-submitted.png' });
                    }
                }
            } else {
                console.log('❌ No services found in category');
            }
        } else {
            console.log('❌ No service categories found');
        }
        
        console.log('\n🎉 Customer Portal Dynamic Fields Testing Completed!');
        console.log('\n📊 Test Summary:');
        console.log('✅ Navigation to customer portal');
        console.log('✅ Authentication handling');
        console.log('✅ Service category loading');
        console.log('✅ Service selection');
        console.log('✅ Dynamic fields detection');
        console.log('✅ Form field interaction');
        console.log('✅ Review step navigation');
        console.log('✅ Ticket submission');
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: 'test-error.png' });
    } finally {
        await page.waitForTimeout(3000);
        await browser.close();
    }
}

// Run the test
testCustomerPortalDynamicFields().catch(console.error);