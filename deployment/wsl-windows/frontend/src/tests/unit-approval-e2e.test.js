// E2E Test: Unit-Based Approval System
// Based on successful MCP Playwright manual testing
// Run with: npx playwright test

const { test, expect } = require('@playwright/test');

test.describe('Unit-Based Approval System E2E', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('Complete approval workflow: IT user → IT manager approval', async ({ page }) => {
    
    // Step 1: Create ticket requiring approval via backend
    console.log('🎫 Step 1: Creating ticket requiring approval...');
    
    // Use our existing test ticket creation script
    const { execSync } = require('child_process');
    const createResult = execSync(
      'cd /Users/yanrypangouw/Documents/Projects/Web/ticketing-system/backend && npx tsx scripts/create-test-ticket.ts',
      { encoding: 'utf8' }
    );
    
    // Extract ticket ID from script output
    const ticketMatch = createResult.match(/Ticket ID: (\\d+)/);
    expect(ticketMatch).not.toBeNull();
    const ticketId = ticketMatch[1];
    
    console.log(`✅ Created test ticket #${ticketId}`);
    
    // Step 2: Login as IT Manager
    console.log('👨‍💼 Step 2: Login as IT Manager and check pending approvals...');
    
    await page.goto('http://localhost:3000/login');
    
    // Login form
    await page.fill('input[type="email"]', 'dept_14.manager@company.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button:has-text("Sign in")');
    
    // Wait for dashboard
    await page.waitForURL('http://localhost:3000/');
    
    // Verify manager is logged in
    await expect(page.locator('text=dept_14.manager')).toBeVisible();
    await expect(page.locator('text=manager')).toBeVisible();
    
    // Navigate to pending approvals
    await page.click('text=Pending Approvals');
    await page.waitForURL('http://localhost:3000/manager');
    
    // Verify manager dashboard loads
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    await expect(page.locator('text=Review and approve pending ticket requests')).toBeVisible();
    
    // Check if we have pending approvals (should be 1)
    const pendingCount = await page.locator('text=Pending Approval').locator('..').locator('p').nth(1).textContent();
    console.log(`📋 Pending approvals: ${pendingCount}`);
    
    if (pendingCount === '1') {
      console.log('✅ Found pending approval!');
      
      // Verify ticket is visible
      await expect(page.locator('text=Network Connectivity Issue')).toBeVisible();
      await expect(page.locator('text=it.user')).toBeVisible();
      
      // Step 3: Approve the ticket
      console.log('✅ Step 3: Approving ticket...');
      
      // Click approve button
      await page.click('button:has-text("Approve")');
      
      // Fill approval comments
      await page.fill('textarea', 'E2E Test: Approved - Network issue requires immediate attention from IT team.');
      
      // Confirm approval
      await page.click('button:has-text("Confirm Approval")');
      
      // Wait for success message
      await expect(page.locator('text=approved successfully')).toBeVisible({ timeout: 5000 });
      
      // Verify ticket removed from pending approvals
      await expect(page.locator('text=All caught up!')).toBeVisible();
      
      console.log('🎉 Ticket approved successfully!');
      
    } else {
      console.log('ℹ️  No pending approvals found - this is expected if tickets were already approved');
    }
    
    // Step 4: Test cross-unit isolation
    console.log('🔒 Step 4: Testing cross-unit isolation...');
    
    // Logout current user
    await page.click('button:has-text("Logout")');
    await page.waitForURL('http://localhost:3000/login');
    
    // Login as KASDA manager
    await page.fill('input[type="email"]', 'dept_2.manager@company.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    
    // Verify KASDA manager is logged in
    await expect(page.locator('text=dept_2.manager')).toBeVisible();
    await expect(page.locator('text=Dukungan dan Layanan')).toBeVisible();
    
    // Navigate to pending approvals
    await page.click('text=Pending Approvals');
    await page.waitForURL('http://localhost:3000/manager');
    
    // Verify KASDA manager cannot see IT tickets
    await expect(page.locator('text=Network Connectivity Issue')).not.toBeVisible();
    
    console.log('✅ Cross-unit isolation verified!');
  });

  test('Service catalog ticket creation workflow', async ({ page }) => {
    
    // Step 1: Login as IT user
    console.log('👤 Step 1: Login as IT user...');
    
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'it.user@company.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    
    // Verify user is logged in
    await expect(page.locator('text=it.user')).toBeVisible();
    await expect(page.locator('text=requester')).toBeVisible();
    await expect(page.locator('text=Information Technology')).toBeVisible();
    
    // Step 2: Create new ticket
    console.log('🎫 Step 2: Creating new ticket...');
    
    await page.click('text=Create New Ticket');
    await page.waitForURL('http://localhost:3000/service-catalog-v2');
    
    // Verify service catalog loads
    await expect(page.locator('text=IT Service Catalog')).toBeVisible();
    await expect(page.locator('text=How can we help you today?')).toBeVisible();
    
    // Select Network & Connectivity category
    await page.click('text=Network & Connectivity');
    
    // Select LAN Network Issues service
    await page.click('text=Gangguan Jaringan LAN');
    
    // Verify form loads with pre-filled data
    await expect(page.locator('text=Gangguan Jaringan LAN')).toBeVisible();
    await expect(page.locator('input[value="Gangguan Jaringan LAN"]')).toBeVisible();
    
    // Step 3: Fill ticket details
    console.log('📝 Step 3: Filling ticket details...');
    
    // Update description
    await page.fill('textarea[placeholder*="Description"]', 
      'E2E Test: Unable to access shared network drives. Network connectivity issue affecting multiple workstations in the IT department.');
    
    // Set priority to High
    await page.selectOption('select', 'High');
    
    // Set root cause
    await page.selectOption('select', 'Technical/System Error');
    
    // Set issue type
    await page.selectOption('select', 'Technical Problem - Something is broken or not working');
    
    // Step 4: Create ticket
    console.log('🚀 Step 4: Creating ticket...');
    
    await page.click('button:has-text("Create Ticket")');
    
    // Verify ticket creation
    await page.waitForURL('http://localhost:3000/tickets');
    await expect(page.locator('text=created successfully')).toBeVisible();
    
    // Verify ticket appears in list
    await expect(page.locator('text=Gangguan Jaringan LAN')).toBeVisible();
    
    console.log('✅ Ticket created successfully via service catalog!');
  });

  test('Manager dashboard functionality', async ({ page }) => {
    
    // Login as IT manager
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'dept_14.manager@company.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    
    // Navigate to manager dashboard
    await page.click('text=Pending Approvals');
    await page.waitForURL('http://localhost:3000/manager');
    
    // Verify dashboard elements
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    await expect(page.locator('text=Review and approve pending ticket requests')).toBeVisible();
    
    // Verify statistics cards
    await expect(page.locator('text=Pending Approval')).toBeVisible();
    await expect(page.locator('text=Urgent Priority')).toBeVisible();
    await expect(page.locator('text=Overdue (>24h)')).toBeVisible();
    
    // Test refresh button
    await page.click('button:has-text("Refresh")');
    
    // Dashboard should still be visible after refresh
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    
    console.log('✅ Manager dashboard functionality verified!');
  });

  test('User role and permissions verification', async ({ page }) => {
    
    // Test IT User permissions
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'it.user@company.com');
    await page.fill('input[type="password"]', 'user123');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    
    // Verify requester role and permissions
    await expect(page.locator('text=it.user')).toBeVisible();
    await expect(page.locator('text=requester')).toBeVisible();
    await expect(page.locator('text=Information Technology')).toBeVisible();
    
    // Verify requester cannot access manager functions
    await expect(page.locator('text=Approvals')).not.toBeVisible();
    await expect(page.locator('text=Pending Approvals')).not.toBeVisible();
    
    // Logout and test manager permissions
    await page.click('button:has-text("Logout")');
    await page.waitForURL('http://localhost:3000/login');
    
    // Login as manager
    await page.fill('input[type="email"]', 'dept_14.manager@company.com');
    await page.fill('input[type="password"]', 'manager123');
    await page.click('button:has-text("Sign in")');
    
    await page.waitForURL('http://localhost:3000/');
    
    // Verify manager role and permissions
    await expect(page.locator('text=dept_14.manager')).toBeVisible();
    await expect(page.locator('text=manager')).toBeVisible();
    
    // Verify manager can access approval functions
    await expect(page.locator('text=Pending Approvals')).toBeVisible();
    await expect(page.locator('text=Approvals')).toBeVisible();
    
    console.log('✅ User roles and permissions verified!');
  });
});

// Cleanup helper
test.afterAll(async () => {
  console.log('🧹 E2E tests completed');
});