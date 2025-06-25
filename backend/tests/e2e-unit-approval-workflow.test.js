// E2E Test: Unit-Based Approval Workflow
// Based on successful MCP Playwright manual testing

const { test, expect } = require('@playwright/test');

// Test configuration
const config = {
  baseURL: 'http://localhost:3000',
  apiBaseURL: 'http://localhost:3001/api',
  users: {
    itUser: {
      email: 'it.user@company.com',
      password: 'user123',
      role: 'requester',
      unit: 'Information Technology'
    },
    itManager: {
      email: 'dept_14.manager@company.com', 
      password: 'manager123',
      role: 'manager',
      unit: 'Information Technology'
    },
    kasdaManager: {
      email: 'dept_2.manager@company.com',
      password: 'manager123', 
      role: 'manager',
      unit: 'Dukungan dan Layanan'
    }
  }
};

test.describe('Unit-Based Approval System E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await page.goto(config.baseURL);
  });

  test('Complete Unit-Based Approval Workflow', async ({ page }) => {
    // Step 1: Create test ticket requiring approval via API
    console.log('🎫 Step 1: Creating test ticket requiring approval...');
    
    // Login as IT user via API to get token
    const loginResponse = await page.request.post(`${config.apiBaseURL}/auth/login`, {
      data: {
        email: config.users.itUser.email,
        password: config.users.itUser.password
      }
    });
    
    const loginData = await loginResponse.json();
    expect(loginResponse.ok()).toBeTruthy();
    expect(loginData.token).toBeDefined();
    
    const userToken = loginData.token;
    
    // Create ticket requiring approval using backend script approach
    const createTicketResponse = await page.request.post(`${config.apiBaseURL}/test/create-approval-ticket`, {
      headers: { 'Authorization': `Bearer ${userToken}` },
      data: {
        title: 'E2E Test - Network Infrastructure Upgrade',
        description: 'Testing unit-based approval workflow with network infrastructure upgrade request. This ticket should require manager approval from the same unit.',
        priority: 'high',
        userRootCause: 'system_error',
        userIssueCategory: 'problem',
        requiresBusinessApproval: true
      }
    });
    
    // If the API endpoint doesn't exist, create ticket manually via database
    let ticketId;
    if (!createTicketResponse.ok()) {
      console.log('📝 Creating ticket directly via database...');
      
      // Execute backend script to create test ticket
      const { execSync } = require('child_process');
      const result = execSync('cd /Users/yanrypangouw/Documents/Projects/Web/ticketing-system/backend && npx tsx -e \"' +
        'import { PrismaClient } from \\\"@prisma/client\\\"; ' +
        'const prisma = new PrismaClient(); ' +
        'async function createTestTicket() { ' +
        '  const itUser = await prisma.user.findUnique({ where: { email: \\\"it.user@company.com\\\" } }); ' +
        '  const ticket = await prisma.ticket.create({ ' +
        '    data: { ' +
        '      title: \\\"E2E Test - Network Infrastructure Upgrade\\\", ' +
        '      description: \\\"Testing unit-based approval workflow\\\", ' +
        '      status: \\\"pending_approval\\\", ' +
        '      priority: \\\"high\\\", ' +
        '      createdByUserId: itUser.id, ' +
        '      requiresBusinessApproval: true, ' +
        '      businessImpact: \\\"high\\\", ' +
        '      requestType: \\\"incident\\\", ' +
        '      userRootCause: \\\"system_error\\\", ' +
        '      userIssueCategory: \\\"problem\\\", ' +
        '      userCategorizedAt: new Date(), ' +
        '      slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) ' +
        '    } ' +
        '  }); ' +
        '  const itManager = await prisma.user.findFirst({ ' +
        '    where: { unitId: itUser.unitId, role: \\\"manager\\\", isBusinessReviewer: true } ' +
        '  }); ' +
        '  await prisma.businessApproval.create({ ' +
        '    data: { ' +
        '      ticketId: ticket.id, ' +
        '      businessReviewerId: itManager.id, ' +
        '      approvalStatus: \\\"pending\\\" ' +
        '    } ' +
        '  }); ' +
        '  console.log(ticket.id); ' +
        '  await prisma.$disconnect(); ' +
        '} ' +
        'createTestTicket();\"', { encoding: 'utf8' });
      
      ticketId = parseInt(result.trim());
      expect(ticketId).toBeGreaterThan(0);
    } else {
      const ticketData = await createTicketResponse.json();
      ticketId = ticketData.data.id;
    }
    
    console.log(`✅ Created test ticket #${ticketId}`);
    
    // Step 2: Login as IT Manager and verify pending approval
    console.log('👨‍💼 Step 2: Testing IT Manager approval workflow...');
    
    await page.goto(`${config.baseURL}/login`);
    await page.fill('[data-testid="email-input"]', config.users.itManager.email);
    await page.fill('[data-testid="password-input"]', config.users.itManager.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard and verify login
    await page.waitForURL(`${config.baseURL}/`);
    await expect(page.locator('text=dept_14.manager')).toBeVisible();
    await expect(page.locator('text=manager')).toBeVisible();
    await expect(page.locator('text=Information Technology')).toBeVisible();
    
    // Navigate to manager dashboard
    await page.click('[data-testid="pending-approvals-button"]');
    await page.waitForURL(`${config.baseURL}/manager`);
    
    // Verify pending approval is visible
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    await expect(page.locator('[data-testid="pending-approvals-count"]:has-text("1")')).toBeVisible();
    
    // Verify ticket details in approval card
    await expect(page.locator(`text=E2E Test - Network Infrastructure Upgrade`)).toBeVisible();
    await expect(page.locator('text=it.user')).toBeVisible();
    await expect(page.locator('text=Information Technology')).toBeVisible();
    
    // Step 3: Approve the ticket
    console.log('✅ Step 3: Approving ticket...');
    
    await page.click(`[data-testid="approve-ticket-${ticketId}"]`);
    await page.fill('[data-testid="approval-comments"]', 'Approved via E2E test - Network infrastructure upgrade approved for processing');
    await page.click('[data-testid="confirm-approval"]');
    
    // Wait for success message
    await expect(page.locator('text=Ticket approved successfully')).toBeVisible();
    
    // Verify ticket removed from pending approvals
    await expect(page.locator('text=All caught up!')).toBeVisible();
    await expect(page.locator('[data-testid="pending-approvals-count"]:has-text("0")')).toBeVisible();
    
    // Step 4: Test cross-unit isolation
    console.log('🔒 Step 4: Testing cross-unit isolation...');
    
    // Logout IT manager
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL(`${config.baseURL}/login`);
    
    // Login as KASDA manager
    await page.fill('[data-testid="email-input"]', config.users.kasdaManager.email);
    await page.fill('[data-testid="password-input"]', config.users.kasdaManager.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard and verify login
    await page.waitForURL(`${config.baseURL}/`);
    await expect(page.locator('text=dept_2.manager')).toBeVisible();
    await expect(page.locator('text=Dukungan dan Layanan')).toBeVisible();
    
    // Navigate to manager dashboard
    await page.click('[data-testid="pending-approvals-button"]');
    await page.waitForURL(`${config.baseURL}/manager`);
    
    // Verify KASDA manager cannot see IT ticket
    await expect(page.locator(`text=E2E Test - Network Infrastructure Upgrade`)).not.toBeVisible();
    
    // Step 5: Verify ticket status change via API
    console.log('🔍 Step 5: Verifying ticket status via API...');
    
    const managerLoginResponse = await page.request.post(`${config.apiBaseURL}/auth/login`, {
      data: {
        email: config.users.itManager.email,
        password: config.users.itManager.password
      }
    });
    
    const managerData = await managerLoginResponse.json();
    const managerToken = managerData.token;
    
    const ticketResponse = await page.request.get(`${config.apiBaseURL}/v2/tickets/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${managerToken}` }
    });
    
    const ticketData = await ticketResponse.json();
    expect(ticketData.success).toBeTruthy();
    expect(ticketData.data.status).toBe('open');
    expect(ticketData.data.businessApproval.approvalStatus).toBe('approved');
    expect(ticketData.data.managerComments).toContain('Approved via E2E test');
    
    console.log('🎉 E2E Test completed successfully!');
  });

  test('Service Catalog Ticket Creation Workflow', async ({ page }) => {
    // Test the service catalog workflow we manually tested
    console.log('📋 Testing Service Catalog workflow...');
    
    // Login as IT user
    await page.goto(`${config.baseURL}/login`);
    await page.fill('[data-testid="email-input"]', config.users.itUser.email);
    await page.fill('[data-testid="password-input"]', config.users.itUser.password);
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL(`${config.baseURL}/`);
    
    // Navigate to create ticket
    await page.click('text=Create New Ticket');
    await page.waitForURL(`${config.baseURL}/service-catalog-v2`);
    
    // Select Network & Connectivity category
    await page.click('text=Network & Connectivity');
    
    // Select a service (e.g., LAN Network Issues)
    await page.click('text=Gangguan Jaringan LAN');
    
    // Fill ticket details
    await page.fill('[data-testid="ticket-title"]', 'E2E Test - LAN Network Issue');
    await page.fill('[data-testid="ticket-description"]', 'Automated E2E test for network connectivity issues. Testing service catalog workflow.');
    await page.selectOption('[data-testid="priority-select"]', 'High');
    await page.selectOption('[data-testid="root-cause-select"]', 'Technical/System Error');
    await page.selectOption('[data-testid="issue-type-select"]', 'Technical Problem - Something is broken or not working');
    
    // Create ticket
    await page.click('[data-testid="create-ticket-button"]');
    
    // Verify ticket creation
    await page.waitForURL(`${config.baseURL}/tickets`);
    await expect(page.locator('text=created successfully')).toBeVisible();
    await expect(page.locator('text=E2E Test - LAN Network Issue')).toBeVisible();
  });

  test('Manager Dashboard Enhancement Verification', async ({ page }) => {
    // Test the enhanced manager dashboard features
    console.log('🖥️ Testing enhanced manager dashboard...');
    
    // Login as IT manager
    await page.goto(`${config.baseURL}/login`);
    await page.fill('[data-testid="email-input"]', config.users.itManager.email);
    await page.fill('[data-testid="password-input"]', config.users.itManager.password);
    await page.click('[data-testid="login-button"]');
    
    await page.waitForURL(`${config.baseURL}/`);
    
    // Navigate to manager dashboard
    await page.click('[data-testid="pending-approvals-button"]');
    await page.waitForURL(`${config.baseURL}/manager`);
    
    // Verify dashboard elements
    await expect(page.locator('text=Manager Dashboard')).toBeVisible();
    await expect(page.locator('text=Review and approve pending ticket requests')).toBeVisible();
    await expect(page.locator('[data-testid="pending-approvals-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="urgent-priority-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="overdue-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="refresh-button"]')).toBeVisible();
    
    // Test refresh functionality
    await page.click('[data-testid="refresh-button"]');
    
    // Verify unit-based information is displayed if tickets exist
    // (This will depend on existing tickets in the system)
  });
});

// Test helpers and utilities
test.describe('Unit-Based Approval System Utilities', () => {
  
  test('Database State Verification', async ({ page }) => {
    // Verify database is in correct state for testing
    console.log('🗄️ Verifying database state...');
    
    const loginResponse = await page.request.post(`${config.apiBaseURL}/auth/login`, {
      data: {
        email: config.users.itManager.email,
        password: config.users.itManager.password
      }
    });
    
    expect(loginResponse.ok()).toBeTruthy();
    
    const loginData = await loginResponse.json();
    expect(loginData.user.unitId).toBeDefined();
    expect(loginData.user.isBusinessReviewer).toBe(true);
    expect(loginData.user.role).toBe('manager');
  });
});

module.exports = { config };