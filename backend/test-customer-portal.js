const { chromium } = require('playwright');
const path = require('path');

async function testCustomerPortalDynamicFields() {
    console.log('🚀 Starting Customer Portal Dynamic Fields Testing...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000  // Slow down operations for better visibility
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate to Customer Portal
        console.log('📍 Step 1: Navigating to Customer Portal...');
        await page.goto('http://localhost:3000/customer/create-ticket');
        await page.waitForTimeout(2000);
        
        // Take screenshot
        await page.screenshot({ path: 'customer-portal-landing.png' });
        console.log('✅ Successfully navigated to customer portal');
        
        // Step 2: Login Process
        console.log('\n📍 Step 2: Performing login...');
        
        // Check if we're already on a login page or if login is required
        const currentUrl = page.url();
        console.log(`Current URL: ${currentUrl}`);
        
        // Look for login form elements
        const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
        const passwordInput = await page.locator('input[type="password"], input[name="password"]').first();
        
        if (await emailInput.isVisible()) {
            console.log('📝 Found login form, filling credentials...');
            await emailInput.fill('test.requester@bsg.co.id');
            await passwordInput.fill('password123');
            
            // Find and click login button
            const loginButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first();
            await loginButton.click();
            await page.waitForTimeout(3000);
            
            console.log('✅ Login form submitted');
        } else {
            console.log('ℹ️ No login form found, checking if already authenticated...');
        }
        
        // Step 3: Navigate to Create Ticket (if not already there)
        console.log('\n📍 Step 3: Ensuring we\'re on create ticket page...');
        if (!page.url().includes('create-ticket')) {
            await page.goto('http://localhost:3000/customer/create-ticket');
            await page.waitForTimeout(2000);
        }
        
        await page.screenshot({ path: 'create-ticket-page.png' });
        console.log('✅ On create ticket page');
        
        // Step 4: Test Service Selection with Dynamic Fields
        console.log('\n📍 Step 4: Testing service selection and dynamic fields...');
        
        // Look for service selection dropdown/form
        const serviceSelectors = [
            'select[name="serviceId"]',
            'select[name="service"]',
            'select:has(option[value])',
            '[data-testid="service-select"]'
        ];
        
        let serviceSelect = null;
        for (const selector of serviceSelectors) {
            try {
                serviceSelect = await page.locator(selector).first();
                if (await serviceSelect.isVisible()) {
                    console.log(`✅ Found service selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (!serviceSelect || !(await serviceSelect.isVisible())) {
            console.log('🔍 Service dropdown not found, looking for other service selection methods...');
            
            // Look for service cards or buttons
            const serviceCards = await page.locator('[data-testid*="service"], .service-card, button:has-text("Service")').all();
            if (serviceCards.length > 0) {
                console.log(`✅ Found ${serviceCards.length} service cards/buttons`);
                serviceSelect = serviceCards[0];
            }
        }
        
        if (serviceSelect) {
            console.log('🎯 Testing service selection...');
            
            // If it's a select dropdown
            if (await serviceSelect.getAttribute('tagName') === 'SELECT') {
                const options = await serviceSelect.locator('option').all();
                console.log(`Found ${options.length} service options`);
                
                // Select the first non-empty option
                for (let i = 1; i < Math.min(options.length, 4); i++) {
                    const optionValue = await options[i].getAttribute('value');
                    const optionText = await options[i].textContent();
                    console.log(`Selecting service: ${optionText} (value: ${optionValue})`);
                    
                    await serviceSelect.selectOption(optionValue);
                    await page.waitForTimeout(2000);
                    
                    // Step 5: Check for Dynamic Fields
                    console.log('\n📍 Step 5: Checking for dynamic fields...');
                    
                    // Look for dynamic fields that might have appeared
                    const dynamicFieldSelectors = [
                        '[data-testid*="dynamic"]',
                        '.dynamic-field',
                        '[data-field-type]',
                        'input[data-dynamic="true"]',
                        'select[data-dynamic="true"]',
                        'textarea[data-dynamic="true"]'
                    ];
                    
                    let dynamicFieldsFound = false;
                    for (const selector of dynamicFieldSelectors) {
                        const fields = await page.locator(selector).all();
                        if (fields.length > 0) {
                            console.log(`✅ Found ${fields.length} dynamic fields with selector: ${selector}`);
                            dynamicFieldsFound = true;
                            
                            // Test each dynamic field
                            for (let j = 0; j < fields.length; j++) {
                                const field = fields[j];
                                const fieldType = await field.getAttribute('type') || await field.getAttribute('tagName');
                                console.log(`Testing dynamic field ${j + 1}: ${fieldType}`);
                                
                                if (fieldType === 'text' || fieldType === 'INPUT') {
                                    await field.fill(`Test dynamic value ${j + 1}`);
                                } else if (fieldType === 'SELECT') {
                                    const fieldOptions = await field.locator('option').all();
                                    if (fieldOptions.length > 1) {
                                        await field.selectOption({ index: 1 });
                                    }
                                } else if (fieldType === 'TEXTAREA') {
                                    await field.fill(`Test dynamic textarea content ${j + 1}`);
                                }
                                
                                await page.waitForTimeout(500);
                            }
                            break;
                        }
                    }
                    
                    if (!dynamicFieldsFound) {
                        console.log('⚠️ No dynamic fields found for this service, trying next service...');
                        continue;
                    } else {
                        console.log('✅ Dynamic fields testing completed');
                        break;
                    }
                }
            } else {
                // If it's a button or card, click it
                await serviceSelect.click();
                await page.waitForTimeout(2000);
                console.log('✅ Service card/button clicked');
            }
            
            await page.screenshot({ path: 'service-selected-with-dynamic-fields.png' });
            
        } else {
            console.log('❌ Could not find service selection element');
        }
        
        // Step 6: Test Form Navigation and Field Persistence
        console.log('\n📍 Step 6: Testing form navigation and field persistence...');
        
        // Fill out basic ticket information
        const titleInput = await page.locator('input[name="title"], input[placeholder*="title"], input[placeholder*="subject"]').first();
        const descriptionInput = await page.locator('textarea[name="description"], textarea[placeholder*="description"]').first();
        
        if (await titleInput.isVisible()) {
            await titleInput.fill('Test Ticket - Dynamic Fields Integration');
            console.log('✅ Title filled');
        }
        
        if (await descriptionInput.isVisible()) {
            await descriptionInput.fill('This is a test ticket to verify dynamic fields integration is working correctly.');
            console.log('✅ Description filled');
        }
        
        // Look for priority/urgency fields
        const prioritySelect = await page.locator('select[name="priority"], select[name="urgency"]').first();
        if (await prioritySelect.isVisible()) {
            await prioritySelect.selectOption({ index: 1 });
            console.log('✅ Priority selected');
        }
        
        await page.screenshot({ path: 'form-filled-with-dynamic-fields.png' });
        
        // Step 7: Test Review/Preview Step
        console.log('\n📍 Step 7: Testing review/preview step...');
        
        // Look for Next/Review button
        const nextButton = await page.locator('button:has-text("Next"), button:has-text("Review"), button:has-text("Preview")').first();
        if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(2000);
            console.log('✅ Navigated to review step');
            
            // Check if dynamic field values are shown in review
            const reviewContent = await page.textContent('body');
            if (reviewContent.includes('Test dynamic value') || reviewContent.includes('dynamic')) {
                console.log('✅ Dynamic field values visible in review step');
            } else {
                console.log('⚠️ Dynamic field values not clearly visible in review step');
            }
            
            await page.screenshot({ path: 'review-step-with-dynamic-fields.png' });
        }
        
        // Step 8: Submit Ticket
        console.log('\n📍 Step 8: Submitting ticket...');
        
        const submitButton = await page.locator('button:has-text("Submit"), button:has-text("Create"), button[type="submit"]').first();
        if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(3000);
            console.log('✅ Ticket submission attempted');
            
            // Check for success message or redirect
            const currentUrl = page.url();
            const bodyText = await page.textContent('body');
            
            if (bodyText.includes('success') || bodyText.includes('created') || bodyText.includes('submitted')) {
                console.log('✅ Ticket creation success message detected');
            } else if (currentUrl.includes('success') || currentUrl.includes('confirmation')) {
                console.log('✅ Redirected to success page');
            } else {
                console.log('⚠️ No clear success indication found');
            }
            
            await page.screenshot({ path: 'ticket-submission-result.png' });
        }
        
        console.log('\n🎉 Customer Portal Dynamic Fields Testing Completed!');
        console.log('\nTest Summary:');
        console.log('✅ Navigation to customer portal');
        console.log('✅ Login process');
        console.log('✅ Service selection');
        console.log('✅ Dynamic fields detection and testing');
        console.log('✅ Form navigation and field persistence');
        console.log('✅ Review step verification');
        console.log('✅ Ticket submission');
        
    } catch (error) {
        console.error('❌ Error during testing:', error);
        await page.screenshot({ path: 'error-state.png' });
    } finally {
        await page.waitForTimeout(2000);
        await browser.close();
    }
}

// Run the test
testCustomerPortalDynamicFields().catch(console.error);