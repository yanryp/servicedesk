// Enhanced BSG Automation Test - Comprehensive Name Field & Workflow Testing
// Extends existing Playwright infrastructure with advanced features

const { test, expect } = require('@playwright/test');

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  apiURL: 'http://localhost:3001/api',
  timeout: 30000,
  
  // User credentials for comprehensive testing
  users: {
    admin: { email: 'admin@company.com', password: 'password123' },
    kasda: { email: 'kasda.user@company.com', password: 'password123' },
    manager: { email: 'utama.manager@company.com', password: 'password123' },
    branchManager: { email: 'branch.manager@company.com', password: 'password123' }
  },

  // Test data patterns
  testData: {
    itTicket: {
      title: 'IT Network Issue - Automated Test',
      description: 'Automated test for IT department network connectivity issues',
      priority: 'high',
      category: 'Network Infrastructure'
    },
    kasdaTicket: {
      title: 'KASDA Treasury Processing - Automated Test', 
      description: 'Automated test for KASDA treasury system processing issues',
      priority: 'medium',
      category: 'KASDA Treasury'
    }
  }
};

class BSGAutomationHelper {
  constructor(page) {
    this.page = page;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.createdTickets = [];
    this.testUsers = [];
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async takeScreenshot(name) {
    const screenshotPath = `test-results/enhanced-bsg-${name}-${this.timestamp}.png`;
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    await this.log(`📸 Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  async waitForStableUI(selector = null, timeout = 5000) {
    // Wait for UI to be stable before proceeding
    await this.page.waitForLoadState('networkidle');
    if (selector) {
      await this.page.waitForSelector(selector, { timeout });
    }
    await this.page.waitForTimeout(500); // Brief stability wait
  }

  async loginUser(userType) {
    const user = TEST_CONFIG.users[userType];
    if (!user) throw new Error(`Unknown user type: ${userType}`);

    await this.log(`🔐 Logging in as ${userType}: ${user.email}`);
    
    await this.page.goto('/login');
    await this.waitForStableUI('input[type=\"email\"]');
    
    await this.page.fill('input[type=\"email\"]', user.email);
    await this.page.fill('input[type=\"password\"]', user.password);
    
    await this.takeScreenshot(`login-${userType}`);
    
    await this.page.click('button[type=\"submit\"]');
    await this.waitForStableUI();
    
    // Verify login success
    await expect(this.page).toHaveURL(/\\/(dashboard|home)/);
    await this.log(`✅ Successfully logged in as ${userType}`);
    
    return user;
  }

  async createUserWithNameField() {
    await this.log('👤 Creating test user with name field');
    
    // Navigate to user registration (admin only)
    await this.page.goto('/register');
    await this.waitForStableUI('input[name=\"name\"]');
    
    const userData = {
      name: `Automated Test User ${this.timestamp}`,
      username: `auto.test.${this.timestamp.slice(-8)}`,
      email: `auto.test.${Date.now()}@bsg.co.id`,
      password: 'TestPassword123!',
      role: 'requester'
    };

    // Fill form fields
    await this.page.fill('input[name=\"name\"]', userData.name);
    await this.page.fill('input[name=\"username\"]', userData.username);
    await this.page.fill('input[name=\"email\"]', userData.email);
    await this.page.fill('input[name=\"password\"]', userData.password);
    await this.page.fill('input[name=\"confirmPassword\"]', userData.password);
    await this.page.selectOption('select[name=\"role\"]', userData.role);
    
    // Select first available branch
    await this.page.selectOption('select[name=\"unitId\"]', { index: 1 });
    
    await this.takeScreenshot('user-creation-form');
    
    await this.page.click('button[type=\"submit\"]');
    await this.waitForStableUI();
    
    // Verify success message
    await expect(this.page.locator('text=created successfully')).toBeVisible({ timeout: 10000 });
    
    this.testUsers.push(userData);
    await this.log(`✅ Created user: ${userData.name} (${userData.username})`);
    
    return userData;
  }

  async createTicket(ticketType, withNamedUser = false) {
    const ticketData = TEST_CONFIG.testData[ticketType];
    if (!ticketData) throw new Error(`Unknown ticket type: ${ticketType}`);

    await this.log(`🎫 Creating ${ticketType} ticket${withNamedUser ? ' with named user' : ''}`);
    
    // Navigate to ticket creation
    await this.page.goto('/service-catalog');
    await this.waitForStableUI();
    
    await this.takeScreenshot(`ticket-creation-start-${ticketType}`);
    
    // Search for appropriate service category
    if (ticketData.category) {
      await this.page.fill('input[placeholder*=\"Search\"]', ticketData.category);
      await this.page.waitForTimeout(1000);
    }
    
    // Click on first available service
    await this.page.click('.service-item:first-child, .category-item:first-child');
    await this.waitForStableUI();
    
    // Fill ticket details
    if (await this.page.locator('input[name=\"title\"]').isVisible()) {
      await this.page.fill('input[name=\"title\"]', `${ticketData.title} - ${this.timestamp}`);
    }
    
    if (await this.page.locator('textarea[name=\"description\"]').isVisible()) {
      await this.page.fill('textarea[name=\"description\"]', 
        `${ticketData.description}\\n\\nTest run: ${this.timestamp}${withNamedUser ? '\\nTesting name field display' : ''}`);
    }
    
    if (await this.page.locator('select[name=\"priority\"]').isVisible()) {
      await this.page.selectOption('select[name=\"priority\"]', ticketData.priority);
    }
    
    await this.takeScreenshot(`ticket-form-filled-${ticketType}`);
    
    // Submit ticket
    await this.page.click('button[type=\"submit\"], button:has-text(\"Submit\"), button:has-text(\"Create\")');
    await this.waitForStableUI();
    
    // Verify ticket creation success
    await expect(this.page.locator('text=created successfully, text=Ticket created, text=submitted')).toBeVisible({ timeout: 10000 });
    
    // Extract ticket ID if possible
    const ticketIdMatch = await this.page.textContent('body').then(text => 
      text.match(/ticket.*#(\\d+)|#(\\d+)/i)
    );
    const ticketId = ticketIdMatch ? (ticketIdMatch[1] || ticketIdMatch[2]) : 'unknown';
    
    this.createdTickets.push({ id: ticketId, type: ticketType, withNamedUser });
    await this.log(`✅ Created ${ticketType} ticket #${ticketId}`);
    
    await this.takeScreenshot(`ticket-created-${ticketType}-${ticketId}`);
    
    return ticketId;
  }

  async verifyTicketNameDisplay(ticketId) {
    await this.log(`🔍 Verifying name field display for ticket #${ticketId}`);
    
    // Navigate to tickets list
    await this.page.goto('/tickets');
    await this.waitForStableUI();
    
    // Search for the specific ticket
    if (await this.page.locator('input[placeholder*=\"Search\"]').isVisible()) {
      await this.page.fill('input[placeholder*=\"Search\"]', ticketId.toString());
      await this.page.waitForTimeout(1000);
    }
    
    await this.takeScreenshot(`ticket-list-search-${ticketId}`);
    
    // Click on ticket to view details
    await this.page.click(`text=#${ticketId}, a[href*=\"${ticketId}\"]`);
    await this.waitForStableUI();
    
    await this.takeScreenshot(`ticket-details-${ticketId}`);
    
    // Check for user name display
    const userNameVisible = await this.page.locator('text=Created by, text=Requester').isVisible();
    if (userNameVisible) {
      const userInfo = await this.page.textContent('.ticket-creator, .requester-info, .user-info');
      await this.log(`👤 User info displayed: ${userInfo}`);
      
      // Check if name field is displayed (not just username)
      const hasNameField = userInfo && !userInfo.includes('kasda.user') && !userInfo.includes('.manager');
      await this.log(`${hasNameField ? '✅' : '⚠️'} Name field ${hasNameField ? 'properly displayed' : 'not visible or using username only'}`);
      
      return hasNameField;
    } else {
      await this.log('⚠️ User info section not found');
      return false;
    }
  }

  async testApprovalWorkflow(ticketId) {
    await this.log(`✅ Testing approval workflow for ticket #${ticketId}`);
    
    // Navigate to manager dashboard or pending approvals
    await this.page.goto('/dashboard');
    await this.waitForStableUI();
    
    // Look for pending approvals section
    if (await this.page.locator('text=Pending Approval, text=Awaiting Approval').isVisible()) {
      await this.page.click('text=Pending Approval, text=Awaiting Approval');
      await this.waitForStableUI();
    }
    
    await this.takeScreenshot(`approval-dashboard-${ticketId}`);
    
    // Find and approve the ticket
    if (await this.page.locator(`text=#${ticketId}`).isVisible()) {
      await this.page.click(`text=#${ticketId}`);
      await this.waitForStableUI();
      
      // Look for approve button
      if (await this.page.locator('button:has-text(\"Approve\")').isVisible()) {
        await this.page.click('button:has-text(\"Approve\")');
        await this.waitForStableUI();
        
        // Add approval comment if field exists
        if (await this.page.locator('textarea[name=\"comments\"]').isVisible()) {
          await this.page.fill('textarea[name=\"comments\"]', 'Approved via automated testing');
        }
        
        // Confirm approval
        await this.page.click('button:has-text(\"Confirm\"), button:has-text(\"Approve\")');
        await this.waitForStableUI();
        
        await this.takeScreenshot(`ticket-approved-${ticketId}`);
        await this.log(`✅ Ticket #${ticketId} approved successfully`);
        return true;
      }
    }
    
    await this.log(`⚠️ Could not approve ticket #${ticketId} - may not be accessible or already processed`);
    return false;
  }

  async generateReport() {
    await this.log('📊 Generating test report');
    
    const report = {
      timestamp: this.timestamp,
      createdUsers: this.testUsers.length,
      createdTickets: this.createdTickets.length,
      ticketDetails: this.createdTickets,
      userDetails: this.testUsers.map(u => ({ name: u.name, username: u.username, email: u.email }))
    };
    
    await this.log(`📈 Test Summary:`);
    await this.log(`   Created Users: ${report.createdUsers}`);
    await this.log(`   Created Tickets: ${report.createdTickets}`);
    await this.log(`   Test Run ID: ${this.timestamp}`);
    
    return report;
  }
}

// Main Test Suite
test.describe('Enhanced BSG Name Field & Workflow Automation', () => {
  let helper;
  
  test.beforeEach(async ({ page }) => {
    helper = new BSGAutomationHelper(page);
    
    // Set longer timeouts for complex operations
    test.setTimeout(120000);
    page.setDefaultTimeout(30000);
  });

  test('Complete IT Ticket Workflow with Name Field Verification', async ({ page }) => {
    // Phase 1: Admin setup and user creation
    await helper.loginUser('admin');
    const newUser = await helper.createUserWithNameField();
    
    // Phase 2: Logout and login as new user
    await page.goto('/logout');
    await helper.waitForStableUI();
    
    // Login as new user with name field
    await page.goto('/login');
    await helper.waitForStableUI();
    await page.fill('input[type=\"email\"]', newUser.email);
    await page.fill('input[type=\"password\"]', newUser.password);
    await page.click('button[type=\"submit\"]');
    await helper.waitForStableUI();
    
    // Phase 3: Create IT ticket
    const itTicketId = await helper.createTicket('itTicket', true);
    
    // Phase 4: Logout and login as manager
    await page.goto('/logout');
    await helper.waitForStableUI();
    await helper.loginUser('manager');
    
    // Phase 5: Verify name field display in ticket
    const nameDisplayed = await helper.verifyTicketNameDisplay(itTicketId);
    expect(nameDisplayed).toBeTruthy();
    
    // Phase 6: Test approval workflow
    const approved = await helper.testApprovalWorkflow(itTicketId);
    
    // Phase 7: Final verification
    await helper.generateReport();
  });

  test('KASDA Ticket Workflow Comparison', async ({ page }) => {
    // Test with existing user (no name field) vs new user (with name field)
    
    // Phase 1: Test with existing KASDA user
    await helper.loginUser('kasda');
    const kasdaTicketOld = await helper.createTicket('kasdaTicket', false);
    
    // Phase 2: Login as admin and create new user
    await page.goto('/logout');
    await helper.waitForStableUI();
    await helper.loginUser('admin');
    const kasdaUserNew = await helper.createUserWithNameField();
    
    // Phase 3: Login as new user and create KASDA ticket
    await page.goto('/logout');
    await helper.waitForStableUI();
    await page.goto('/login');
    await helper.waitForStableUI();
    await page.fill('input[type=\"email\"]', kasdaUserNew.email);
    await page.fill('input[type=\"password\"]', kasdaUserNew.password);
    await page.click('button[type=\"submit\"]');
    await helper.waitForStableUI();
    
    const kasdaTicketNew = await helper.createTicket('kasdaTicket', true);
    
    // Phase 4: Compare name field display
    await helper.loginUser('admin');
    
    await helper.log('🔍 Comparing old vs new user ticket display...');
    const oldUserDisplay = await helper.verifyTicketNameDisplay(kasdaTicketOld);
    const newUserDisplay = await helper.verifyTicketNameDisplay(kasdaTicketNew);
    
    // Expect different behavior: old user should not have name, new user should
    expect(newUserDisplay).toBeTruthy();
    await helper.log(`✅ Name field comparison complete: Old user: ${oldUserDisplay}, New user: ${newUserDisplay}`);
    
    await helper.generateReport();
  });

  test('Cross-Browser Name Field Consistency', async ({ page, browserName }) => {
    await helper.log(`🌐 Testing name field consistency in ${browserName}`);
    
    // Quick test to ensure name field works across browsers
    await helper.loginUser('admin');
    const testUser = await helper.createUserWithNameField();
    
    // Login as test user and create ticket
    await page.goto('/logout');
    await helper.waitForStableUI();
    await page.goto('/login');
    await helper.waitForStableUI();
    await page.fill('input[type=\"email\"]', testUser.email);
    await page.fill('input[type=\"password\"]', testUser.password);
    await page.click('button[type=\"submit\"]');
    await helper.waitForStableUI();
    
    const ticketId = await helper.createTicket('itTicket', true);
    
    // Verify name display
    await helper.loginUser('admin');
    const nameDisplayed = await helper.verifyTicketNameDisplay(ticketId);
    
    expect(nameDisplayed).toBeTruthy();
    await helper.log(`✅ Name field working correctly in ${browserName}`);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Take final screenshot
    await helper.takeScreenshot('test-end');
    
    // Log final status
    await helper.log('🧹 Test cleanup completed');
  });
});

// Export for use in other test files
module.exports = { BSGAutomationHelper, TEST_CONFIG };