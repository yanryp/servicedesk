const { chromium } = require('playwright');

async function testDynamicFieldsComprehensive() {
    console.log('🚀 Starting Comprehensive Dynamic Fields Testing...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: Navigate and login
        console.log('📍 Step 1: Navigating and logging in...');
        await page.goto('http://localhost:3000/customer/create-ticket');
        await page.waitForTimeout(2000);
        
        // Login if needed
        if (page.url().includes('login')) {
            await page.locator('input[type="email"]').fill('cabang.utama.user@bsg.co.id');
            await page.locator('input[type="password"]').fill('CabangUtama123!');
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(3000);
            
            if (!page.url().includes('create-ticket')) {
                await page.goto('http://localhost:3000/customer/create-ticket');
                await page.waitForTimeout(2000);
            }
        }
        
        console.log('✅ Authentication completed');
        
        // Step 2: Wait for categories to load
        console.log('\n📍 Step 2: Waiting for service categories...');
        await page.waitForFunction(() => {
            const buttons = document.querySelectorAll('button');
            return Array.from(buttons).some(btn => 
                btn.textContent && btn.textContent.includes('services available'));
        }, { timeout: 15000 });
        
        // Step 3: Test multiple categories to find dynamic fields
        console.log('\n📍 Step 3: Testing categories for dynamic fields...');
        const categoryButtons = await page.locator('button').filter({ hasText: 'services available' }).all();
        console.log(`Found ${categoryButtons.length} service categories`);
        
        const categoriesToTest = ['Core Banking', 'Error Resolution', 'Banking Support', 'Government Banking'];
        let dynamicFieldsFound = false;
        
        for (let categoryIndex = 0; categoryIndex < categoryButtons.length && !dynamicFieldsFound; categoryIndex++) {
            const categoryText = await categoryButtons[categoryIndex].textContent();
            console.log(`\n🔍 Testing category ${categoryIndex + 1}: ${categoryText}`);
            
            // Click on category
            await categoryButtons[categoryIndex].click();
            await page.waitForTimeout(2000);
            
            // Wait for services to appear
            try {
                await page.waitForSelector('h3:text("Choose Your Service")', { timeout: 5000 });
                
                const serviceButtons = await page.locator('button').filter({ hasText: 'priority' }).all();
                console.log(`  Found ${serviceButtons.length} services in this category`);
                
                // Test services in this category
                for (let serviceIndex = 0; serviceIndex < Math.min(serviceButtons.length, 3) && !dynamicFieldsFound; serviceIndex++) {
                    const serviceText = await serviceButtons[serviceIndex].textContent();
                    const serviceName = serviceText.split('\\n')[0] || `Service ${serviceIndex + 1}`;
                    console.log(`  🔬 Testing service: ${serviceName}`);
                    
                    await serviceButtons[serviceIndex].click();
                    await page.waitForTimeout(3000);
                    
                    // Check if we're on the details step
                    try {
                        await page.waitForSelector('h2:text("Request Details")', { timeout: 8000 });
                        
                        // Look for dynamic fields section
                        const dynamicFieldsSection = await page.locator('h3:text("Service-Specific Information")');
                        if (await dynamicFieldsSection.isVisible()) {
                            console.log(`    🎉 DYNAMIC FIELDS FOUND in ${serviceName}!`);
                            dynamicFieldsFound = true;
                            
                            // Take screenshot
                            await page.screenshot({ path: `dynamic-fields-found-${categoryIndex}-${serviceIndex}.png` });
                            
                            // Test the dynamic fields
                            console.log('    🧪 Testing dynamic field interactions...');
                            
                            const dynamicInputs = await page.locator('[data-testid*="dynamic"], input[data-field], select[data-field], textarea[data-field]').all();
                            console.log(`    Found ${dynamicInputs.length} dynamic field elements`);
                            
                            for (let i = 0; i < dynamicInputs.length; i++) {
                                const field = dynamicInputs[i];
                                const tagName = await field.getAttribute('tagName');
                                const type = await field.getAttribute('type') || tagName;
                                console.log(`      Testing field ${i + 1}: ${type}`);
                                
                                try {
                                    if (type === 'text' || type === 'INPUT') {
                                        await field.fill(`Dynamic test value ${i + 1}`);
                                    } else if (type === 'SELECT') {
                                        const options = await field.locator('option').all();
                                        if (options.length > 1) {
                                            await field.selectOption({ index: 1 });
                                        }
                                    } else if (type === 'TEXTAREA') {
                                        await field.fill(`Dynamic textarea content ${i + 1}`);
                                    }
                                    console.log(`        ✅ Successfully interacted with field ${i + 1}`);
                                } catch (error) {
                                    console.log(`        ⚠️ Could not interact with field ${i + 1}: ${error.message}`);
                                }
                            }
                            
                            // Fill basic form and continue
                            console.log('    📝 Filling basic form fields...');
                            
                            // Priority
                            const lowPriorityBtn = await page.locator('button:text("Low")');
                            if (await lowPriorityBtn.isVisible()) {
                                await lowPriorityBtn.click();
                                console.log('    ✅ Priority set to Low');
                            }
                            
                            // Subject
                            const subjectInput = await page.locator('input[placeholder*="Brief"], input[placeholder*="issue"]');
                            if (await subjectInput.isVisible()) {
                                await subjectInput.fill(`Test Dynamic Fields - ${serviceName}`);
                                console.log('    ✅ Subject filled');
                            }
                            
                            // Description
                            const descTextarea = await page.locator('textarea[placeholder*="detail"]');
                            if (await descTextarea.isVisible()) {
                                await descTextarea.fill(`Comprehensive test of dynamic fields functionality for ${serviceName}. This ticket tests field rendering, input validation, and value persistence through the submission workflow.`);
                                console.log('    ✅ Description filled');
                            }
                            
                            await page.screenshot({ path: 'dynamic-fields-form-complete.png' });
                            
                            // Navigate to review
                            console.log('    📋 Proceeding to review step...');
                            const nextBtn = await page.locator('button:text("Next")');
                            if (await nextBtn.isVisible()) {
                                await nextBtn.click();
                                await page.waitForTimeout(3000);
                                
                                await page.waitForSelector('h2:text("Review Your Request")', { timeout: 10000 });
                                console.log('    ✅ Review step reached');
                                
                                // Check for dynamic field values in review
                                const reviewContent = await page.textContent('body');
                                if (reviewContent.includes('Service Information') || reviewContent.includes('Dynamic test value')) {
                                    console.log('    🎉 Dynamic field values visible in review!');
                                } else {
                                    console.log('    ℹ️ Dynamic field values not clearly visible in review');
                                }
                                
                                await page.screenshot({ path: 'dynamic-fields-review.png' });
                                
                                // Submit ticket
                                console.log('    🚀 Submitting ticket...');
                                const submitBtn = await page.locator('button:text("Submit Request")');
                                if (await submitBtn.isVisible()) {
                                    await submitBtn.click();
                                    await page.waitForTimeout(5000);
                                    
                                    // Check for success
                                    const successMsg = await page.locator('h1:text("Request Submitted Successfully")');
                                    if (await successMsg.isVisible()) {
                                        console.log('    🎉 TICKET SUBMITTED SUCCESSFULLY WITH DYNAMIC FIELDS!');
                                        
                                        await page.screenshot({ path: 'dynamic-fields-success.png' });
                                        
                                        // Try to extract ticket ID
                                        const ticketIdText = await page.textContent('body');
                                        const ticketIdMatch = ticketIdText.match(/Ticket ID:\s*#?([A-Z0-9-]+)/);
                                        if (ticketIdMatch) {
                                            console.log(`    📋 Ticket ID: ${ticketIdMatch[1]}`);
                                        }
                                        
                                        break; // Exit all loops
                                    }
                                }
                            }
                        } else {
                            console.log(`    ℹ️ No dynamic fields found in ${serviceName}`);
                        }
                    } catch (error) {
                        console.log(`    ⚠️ Could not test service ${serviceName}: ${error.message}`);
                    }
                    
                    // Go back to category if not successful
                    if (!dynamicFieldsFound) {
                        await page.goBack();
                        await page.waitForTimeout(1000);
                    }
                }
                
                // Go back to categories if no dynamic fields found in this category
                if (!dynamicFieldsFound) {
                    await page.locator('button:text("Back to Categories")').click();
                    await page.waitForTimeout(1000);
                }
                
            } catch (error) {
                console.log(`  ⚠️ Could not test category ${categoryText}: ${error.message}`);
                // Try to go back to categories
                try {
                    await page.locator('button:text("Back to Categories")').click();
                    await page.waitForTimeout(1000);
                } catch (backError) {
                    // If back button not found, refresh page
                    await page.reload();
                    await page.waitForTimeout(3000);
                }
            }
        }
        
        if (!dynamicFieldsFound) {
            console.log('\n⚠️ No dynamic fields found in any tested services');
            console.log('📸 Taking final screenshot for debugging...');
            await page.screenshot({ path: 'no-dynamic-fields-final.png' });
        }
        
        console.log('\n🏁 Comprehensive Dynamic Fields Testing Completed!');
        console.log(`✅ Dynamic fields functionality: ${dynamicFieldsFound ? 'WORKING' : 'NOT FOUND'}`);
        
    } catch (error) {
        console.error('❌ Error during comprehensive testing:', error);
        await page.screenshot({ path: 'comprehensive-test-error.png' });
    } finally {
        await page.waitForTimeout(2000);
        await browser.close();
    }
}

// Run the comprehensive test
testDynamicFieldsComprehensive().catch(console.error);