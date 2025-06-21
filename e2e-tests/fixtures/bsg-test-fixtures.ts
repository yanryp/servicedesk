import { test as baseTest, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Extend Playwright test with BSG-specific fixtures
export const test = baseTest.extend<{
  authenticatedAdmin: any;
  authenticatedManager: any;
  authenticatedRequester: any;
  authenticatedTechnician: any;
  bsgTestData: any;
  apiHelper: any;
}>({
  // Admin user context
  authenticatedAdmin: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e-tests/auth-states/admin-auth.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Manager user context
  authenticatedManager: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e-tests/auth-states/manager-auth.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Requester user context (BSG Banking)
  authenticatedRequester: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e-tests/auth-states/requester-auth.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Technician user context
  authenticatedTechnician: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e-tests/auth-states/technician-auth.json'
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // BSG test data fixture
  bsgTestData: async ({}, use) => {
    const testData = {
      // Sample BSG template data
      templates: {
        olibsTransfer: {
          name: 'Perubahan Menu & Limit Transaksi',
          category: 'olibs_core_banking',
          fields: [
            { name: 'Cabang/Capem', type: 'dropdown_branch', required: true },
            { name: 'Kode User', type: 'text_short', required: true },
            { name: 'Nama User', type: 'text', required: true },
            { name: 'Nominal Transaksi', type: 'currency', required: true }
          ]
        },
        bsgTouchMobile: {
          name: 'Registrasi BSG Touch',
          category: 'bsgtouch_mobile',
          fields: [
            { name: 'Nomor HP', type: 'phone', required: true },
            { name: 'Nomor Rekening', type: 'account_number', required: true },
            { name: 'PIN BSG Touch', type: 'password', required: true }
          ]
        }
      },

      // Sample ticket data
      tickets: {
        olibsIssue: {
          title: 'E2E Test: OLIBS Transfer Limit Issue',
          description: 'Testing OLIBS transfer limit configuration through E2E automation',
          priority: 'medium',
          templateData: {
            'Cabang/Capem': '101',
            'Kode User': 'U001',
            'Nama User': 'Test User BSG',
            'Nominal Transaksi': 5000000
          }
        },
        mobileRegistration: {
          title: 'E2E Test: BSG Touch Mobile Registration',
          description: 'Testing mobile banking registration workflow',
          priority: 'high',
          templateData: {
            'Nomor HP': '081234567890',
            'Nomor Rekening': '1234567890123456',
            'PIN BSG Touch': '123456'
          }
        }
      },

      // Master data samples
      masterData: {
        branches: [
          { code: '001', name: 'Kantor Pusat', level: 'pusat' },
          { code: '101', name: 'Cabang Manado', level: 'cabang' },
          { code: '201', name: 'Capem Tondano', level: 'capem' }
        ],
        terminals: [
          { code: 'ATM001', name: 'ATM Kantor Pusat', type: 'atm' },
          { code: 'CDM001', name: 'CDM Mall Manado', type: 'cdm' }
        ]
      },

      // Test scenarios
      scenarios: {
        fieldOptimization: {
          description: 'Test the 70.6% field optimization achievement',
          metrics: {
            expectedOptimizationRate: 70.6,
            totalTemplates: 24,
            totalUniqueFields: 119
          }
        },
        templateWorkflow: {
          description: 'Complete BSG template selection and ticket creation workflow',
          steps: [
            'Login as BSG requester',
            'Navigate to BSG ticket creation',
            'Select template category',
            'Choose specific template',
            'Fill dynamic fields',
            'Submit ticket',
            'Verify creation'
          ]
        }
      }
    };

    await use(testData);
  },

  // API helper fixture for backend interactions
  apiHelper: async ({ request }, use) => {
    const helper = {
      // Get authentication token
      async getAuthToken(email: string, password: string = 'test123456') {
        const response = await request.post('/api/auth/login', {
          data: { email, password }
        });
        const data = await response.json();
        return data.token;
      },

      // Create test ticket via API
      async createTestTicket(ticketData: any, authToken: string) {
        const response = await request.post('/api/tickets', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          data: ticketData
        });
        return response.json();
      },

      // Get BSG templates
      async getBSGTemplates(authToken: string, query?: string) {
        const url = query 
          ? `/api/bsg-templates/search?query=${encodeURIComponent(query)}`
          : '/api/bsg-templates/search';
        
        const response = await request.get(url, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.json();
      },

      // Get template fields
      async getTemplateFields(templateId: number, authToken: string) {
        const response = await request.get(`/api/bsg-templates/${templateId}/fields`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.json();
      },

      // Get master data
      async getMasterData(type: string, authToken: string) {
        const response = await request.get(`/api/bsg-templates/master-data/${type}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.json();
      },

      // Verify field optimization metrics
      async getOptimizationMetrics(authToken: string) {
        const response = await request.get('/api/bsg-templates/analytics', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.json();
      },

      // Clean up test data
      async cleanupTestTickets(authToken: string) {
        const response = await request.delete('/api/test/cleanup/tickets', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        return response.json();
      }
    };

    await use(helper);
  }
});

// Custom expect matchers for BSG-specific assertions
export const bsgExpect = {
  // Verify BSG template structure
  toBeValidBSGTemplate: (template: any) => {
    expect(template).toHaveProperty('id');
    expect(template).toHaveProperty('template_number');
    expect(template).toHaveProperty('name');
    expect(template).toHaveProperty('category_name');
    expect(template).toHaveProperty('popularity_score');
    expect(typeof template.popularity_score).toBe('number');
    expect(template.popularity_score).toBeGreaterThanOrEqual(0);
  },

  // Verify field optimization metrics
  toMeetOptimizationTarget: (metrics: any, targetRate: number = 70.6) => {
    expect(metrics).toHaveProperty('optimizationRate');
    expect(metrics.optimizationRate).toBeGreaterThanOrEqual(targetRate);
    expect(metrics).toHaveProperty('totalTemplates');
    expect(metrics).toHaveProperty('totalFields');
  },

  // Verify BSG ticket structure
  toBeValidBSGTicket: (ticket: any) => {
    expect(ticket).toHaveProperty('id');
    expect(ticket).toHaveProperty('title');
    expect(ticket).toHaveProperty('description');
    expect(ticket).toHaveProperty('status');
    expect(ticket).toHaveProperty('template_id');
    expect(ticket).toHaveProperty('template_fields');
  },

  // Verify field categorization
  toHaveProperFieldCategories: (fields: any[]) => {
    const categories = ['location', 'user_identity', 'timing', 'transaction', 'customer', 'reference'];
    const fieldCategories = fields.map(f => f.category).filter(c => c);
    
    expect(fieldCategories.length).toBeGreaterThan(0);
    fieldCategories.forEach(category => {
      expect(categories).toContain(category);
    });
  }
};

export { expect };