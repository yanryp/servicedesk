// src/tests/apiEndpoints.test.js
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// API base URL for testing (assuming server is running)
const API_BASE_URL = process.env.TEST_API_URL || 'http://localhost:3001';

// Test authentication token
let authToken;
let testUser;

// Helper function to create auth token
const createTestToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('BSG Template System API Tests', () => {
  beforeAll(async () => {
    try {
      // Get or create test admin user
      testUser = await prisma.user.findFirst({
        where: { role: 'admin' }
      });

      if (!testUser) {
        console.log('🔧 Creating test admin user...');
        // Create test admin user
        testUser = await prisma.user.create({
          data: {
            username: 'test-admin',
            email: 'test-admin@bsg.com',
            passwordHash: '$2b$10$dummy.hash.for.testing.purposes', // Dummy hash for testing
            role: 'admin'
          }
        });
        console.log('✅ Test admin user created');
      }

      authToken = createTestToken(testUser);
      console.log('✅ Test setup completed with admin user');
    } catch (error) {
      console.error('❌ Test setup failed:', error);
    }
  });

  afterAll(async () => {
    // Clean up test admin user if it was created by us
    if (testUser && testUser.email === 'test-admin@bsg.com') {
      try {
        await prisma.user.delete({
          where: { id: testUser.id }
        });
        console.log('🧹 Test admin user cleaned up');
      } catch (error) {
        console.warn('⚠️ Failed to clean up test user:', error.message);
      }
    }
    await prisma.$disconnect();
  });

  describe('Master Data API Endpoints', () => {
    test('GET /api/master-data/branch should return BSG branches', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/branch')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(50); // We have 83+ branches

      // Verify branch data structure
      const branch = response.body.data[0];
      expect(branch).toHaveProperty('code');
      expect(branch).toHaveProperty('name');
      expect(branch).toHaveProperty('nameIndonesian');
      expect(branch).toHaveProperty('isActive');
    }, 10000);

    test('GET /api/master-data/terminal should return terminals', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/terminal')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThan(200); // We have 295+ terminals

      // Verify terminal data structure
      const terminal = response.body.data[0];
      expect(terminal).toHaveProperty('code');
      expect(terminal).toHaveProperty('name');
      expect(terminal.metadata).toHaveProperty('terminal_type');
    }, 10000);

    test('GET /api/master-data/bank_code should return banks', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/bank_code')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.length).toBeGreaterThan(80); // We have 93+ banks

      // Verify bank data structure
      const bank = response.body.data[0];
      expect(bank).toHaveProperty('code');
      expect(bank).toHaveProperty('name');
      expect(bank.metadata).toHaveProperty('bank_type');
      expect(bank.metadata).toHaveProperty('is_atm_bersama');
    }, 10000);

    test('GET /api/master-data/branch with search should filter results', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/branch?search=CABANG')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      
      // All results should contain 'CABANG' in name
      response.body.data.forEach(branch => {
        const containsSearch = 
          branch.name.toUpperCase().includes('CABANG') ||
          (branch.nameIndonesian && branch.nameIndonesian.toUpperCase().includes('CABANG'));
        expect(containsSearch).toBe(true);
      });
    }, 10000);
  });

  describe('Field Types API Endpoints', () => {
    test('GET /api/field-types should return BSG field types', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/field-types')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('all');
      expect(response.body.data).toHaveProperty('byCategory');

      // Check for BSG-specific field types
      const fieldTypes = response.body.data.all;
      const currencyField = fieldTypes.find(f => f.name === 'currency_idr');
      const branchField = fieldTypes.find(f => f.name === 'branch_dropdown');
      
      expect(currencyField).toBeDefined();
      expect(currencyField.displayNameId).toBe('Rupiah Indonesia');
      expect(branchField).toBeDefined();
      expect(branchField.displayNameId).toBe('Pilihan Cabang Bank');
    }, 10000);

    test('GET /api/field-types/currency_idr should return specific field type', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/field-types/currency_idr')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('name', 'currency_idr');
      expect(response.body.data).toHaveProperty('category', 'banking');
      expect(response.body.data).toHaveProperty('validationRules');
      expect(response.body.data.validationRules).toHaveProperty('format', 'currency');
    }, 10000);
  });

  describe('Template Management API Endpoints', () => {
    test('GET /api/template-management/categories should return categories', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/template-management/categories?language=id')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);

      // Check for Indonesian category names
      const coreBankingCategory = response.body.data.find(c => 
        c.name === 'Core Banking System'
      );
      expect(coreBankingCategory).toBeDefined();
      expect(coreBankingCategory.displayName).toBe('Sistem Core Banking');
    }, 10000);

    test('GET /api/template-management/search with OLIBs query', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/template-management/search?query=olibs&language=id')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      // Should find OLIBs templates
      const olibsTemplate = response.body.data.find(t => 
        t.name.toLowerCase().includes('olibs')
      );
      expect(olibsTemplate).toBeDefined();
      expect(olibsTemplate).toHaveProperty('displayName');
      expect(olibsTemplate).toHaveProperty('popularityScore');
    }, 10000);

    test('GET /api/template-management/popular should return popular templates', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/template-management/popular?language=id&limit=3')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data.length).toBeLessThanOrEqual(3);

      // Check popularity score ordering
      for (let i = 1; i < response.body.data.length; i++) {
        expect(response.body.data[i-1].popularityScore).toBeGreaterThanOrEqual(
          response.body.data[i].popularityScore
        );
      }
    }, 10000);
  });

  describe('API Performance Tests', () => {
    test('Branch API should respond within 500ms', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get('/api/master-data/branch')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(1000);

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500);
    }, 5000);

    test('Search API should handle concurrent requests', async () => {
      const promises = Array(5).fill().map(() =>
        request(API_BASE_URL)
          .get('/api/template-management/search?query=atm')
          .set('Authorization', `Bearer ${authToken}`)
          .timeout(5000)
      );

      const results = await Promise.all(promises);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty('success', true);
      });
    }, 15000);
  });

  describe('Data Quality Tests', () => {
    test('Branch data should have Indonesian translations', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/branch')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      const branches = response.body.data;
      
      // At least 90% of branches should have Indonesian names
      const withIndonesianNames = branches.filter(b => 
        b.nameIndonesian && b.nameIndonesian.trim() !== ''
      );
      
      const percentage = (withIndonesianNames.length / branches.length) * 100;
      expect(percentage).toBeGreaterThan(90);
    }, 10000);

    test('Templates should have complete metadata', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/template-management/search?language=id')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      const templates = response.body.data;
      
      templates.forEach(template => {
        expect(template).toHaveProperty('displayName');
        expect(typeof template.displayName).toBe('string');
        expect(template.displayName.length).toBeGreaterThan(0);
        expect(template).toHaveProperty('popularityScore');
        expect(typeof template.popularityScore).toBe('number');
      });
    }, 10000);

    test('Banks should have ATM Bersama classification', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/master-data/bank_code')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      const banks = response.body.data;
      
      // Should have banks marked as ATM Bersama
      const atmBersamaBanks = banks.filter(b => 
        b.metadata && b.metadata.is_atm_bersama === true
      );
      
      expect(atmBersamaBanks.length).toBeGreaterThan(50); // Most banks support ATM Bersama
    }, 10000);
  });
});

  describe('BSG Template System Endpoints', () => {
    test('GET /api/bsg-templates/categories should return template categories', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should have 9 BSG categories
      expect(response.body.data.length).toBeGreaterThanOrEqual(9);
      
      // Check for specific BSG categories
      const categoryNames = response.body.data.map(cat => cat.name);
      expect(categoryNames).toContain('olibs_core_banking');
      expect(categoryNames).toContain('bsgtouch_mobile');
      expect(categoryNames).toContain('sms_banking');
    }, 10000);

    test('GET /api/bsg-templates/search should find templates', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/search?query=olibs&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      // Should find OLIBS templates
      const olibsTemplate = response.body.data.find(t => 
        t.name.toLowerCase().includes('olibs') || 
        t.category_name === 'olibs_core_banking'
      );
      expect(olibsTemplate).toBeDefined();
      expect(olibsTemplate).toHaveProperty('template_number');
      expect(olibsTemplate).toHaveProperty('popularity_score');
    }, 10000);

    test('GET /api/bsg-templates/:id/fields should return template fields', async () => {
      // First get a template
      const templatesResponse = await request(API_BASE_URL)
        .get('/api/bsg-templates/search?limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(templatesResponse.status).toBe(200);
      expect(templatesResponse.body.data.length).toBeGreaterThan(0);
      
      const templateId = templatesResponse.body.data[0].id;
      
      // Get template fields
      const fieldsResponse = await request(API_BASE_URL)
        .get(`/api/bsg-templates/${templateId}/fields`)
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(fieldsResponse.status).toBe(200);
      expect(fieldsResponse.body).toHaveProperty('success', true);
      expect(Array.isArray(fieldsResponse.body.data)).toBe(true);
      
      if (fieldsResponse.body.data.length > 0) {
        const field = fieldsResponse.body.data[0];
        expect(field).toHaveProperty('fieldName');
        expect(field).toHaveProperty('fieldLabel');
        expect(field).toHaveProperty('fieldType');
        expect(field).toHaveProperty('isRequired');
        expect(field).toHaveProperty('category');
      }
    }, 10000);

    test('GET /api/bsg-templates/analytics should return optimization metrics', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('overview');
      
      const overview = response.body.data.overview;
      expect(overview).toHaveProperty('totalTemplates');
      expect(overview).toHaveProperty('totalFields');
      expect(overview).toHaveProperty('optimizationRate');
      
      // Validate our 70.6% optimization achievement
      expect(overview.optimizationRate).toBeGreaterThan(70);
      expect(overview.totalTemplates).toBe(24);
    }, 10000);
  });

  describe('BSG Master Data API Endpoints', () => {
    test('GET /api/bsg-templates/master-data/branch should return BSG branches', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/master-data/branch')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(40); // We have 47+ branches
      
      // Check branch structure
      const branch = response.body.data[0];
      expect(branch).toHaveProperty('code');
      expect(branch).toHaveProperty('name');
      expect(branch).toHaveProperty('level');
    }, 10000);

    test('GET /api/bsg-templates/master-data/olibs_menu should return OLIBS menus', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/master-data/olibs_menu')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(20); // We have 25+ menus
      
      // Check OLIBS menu structure
      const menu = response.body.data[0];
      expect(menu).toHaveProperty('code');
      expect(menu).toHaveProperty('name');
      expect(menu).toHaveProperty('category');
    }, 10000);
  });

  describe('BSG Field Optimization Tests', () => {
    test('Common fields should be reused across templates', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/field-analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('commonFields');
      
      const commonFields = response.body.data.commonFields;
      expect(commonFields.length).toBeGreaterThan(10); // We identified 14 common fields
      
      // Check for specific common fields
      const fieldNames = commonFields.map(f => f.fieldName);
      expect(fieldNames).toContain('Cabang/Capem');
      expect(fieldNames).toContain('Kode User');
      expect(fieldNames).toContain('Nama User');
      expect(fieldNames).toContain('Jabatan');
    }, 10000);

    test('GET /api/bsg-templates/:id/fields should return categorized and structured fields', async () => {
      // Find a template to test, preferably one with a good number of fields
      const template = await prisma.bsgTemplate.findFirst({
        where: { name: 'Pembukaan Rekening Tabungan' }, // A known complex template
      });

      expect(template).toBeDefined();

      const response = await request(API_BASE_URL)
        .get(`/api/bsg-templates/${template.id}/fields`)
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      const { fields, categories } = response.body.data;

      // Validate categories structure
      expect(categories).toHaveProperty('location');
      expect(categories.location[0]).toHaveProperty('field_name', 'Cabang/Capem');

      // Validate fields structure
      expect(fields.length).toBeGreaterThan(5);
      const firstField = fields[0];
      expect(firstField).toHaveProperty('id');
      expect(firstField).toHaveProperty('field_name');
      expect(firstField).toHaveProperty('field_type');
      expect(firstField).toHaveProperty('is_required');
      expect(firstField).toHaveProperty('sort_order');
      expect(firstField).toHaveProperty('category');
      expect(firstField.bsgFieldType).toBeDefined();
      expect(firstField.bsgFieldType).toHaveProperty('display_name');
    }, 10000);

    test('Field categories should be properly organized', async () => {
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/field-categories')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('categories');
      
      const categories = response.body.data.categories;
      expect(categories).toHaveProperty('location');
      expect(categories).toHaveProperty('user_identity');
      expect(categories).toHaveProperty('timing');
      expect(categories).toHaveProperty('transaction');
      expect(categories).toHaveProperty('permissions');
    }, 10000);
  });

  describe('BSG Performance Tests', () => {
    test('Template search should be fast', async () => {
      const startTime = Date.now();
      
      const response = await request(API_BASE_URL)
        .get('/api/bsg-templates/search?query=transfer')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(2000);

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // Under 500ms
    }, 5000);

    test('Field loading should be optimized', async () => {
      // Get template with many fields
      const templatesResponse = await request(API_BASE_URL)
        .get('/api/bsg-templates/search?category=olibs_core_banking&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .timeout(5000);

      expect(templatesResponse.status).toBe(200);
      
      if (templatesResponse.body.data.length > 0) {
        const templateId = templatesResponse.body.data[0].id;
        
        const startTime = Date.now();
        const fieldsResponse = await request(API_BASE_URL)
          .get(`/api/bsg-templates/${templateId}/fields`)
          .set('Authorization', `Bearer ${authToken}`)
          .timeout(2000);

        const responseTime = Date.now() - startTime;
        
        expect(fieldsResponse.status).toBe(200);
        expect(responseTime).toBeLessThan(300); // Optimized field loading
      }
    }, 10000);

    test('Master data should handle concurrent requests', async () => {
      const promises = Array(10).fill().map(() =>
        request(API_BASE_URL)
          .get('/api/master-data/branch')
          .set('Authorization', `Bearer ${authToken}`)
          .timeout(5000)
      );

      const results = await Promise.all(promises);
      
      // All requests should succeed
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.body).toHaveProperty('success', true);
      });
    }, 15000);

    test('Optimized field loading should handle concurrent requests', async () => {
      // Find a template to test with
      const template = await prisma.bsgTemplate.findFirst({
        where: { name: 'Pembukaan Rekening Tabungan' },
      });
      
      expect(template).toBeDefined();
      
      if (template) {
        const promises = Array(10).fill().map(() =>
          request(API_BASE_URL)
            .get(`/api/bsg-templates/${template.id}/fields`)
            .set('Authorization', `Bearer ${authToken}`)
            .timeout(8000)
        );

        const results = await Promise.all(promises);
        
        results.forEach(result => {
          expect(result.status).toBe(200);
          expect(result.body).toHaveProperty('success', true);
          expect(result.body.data.fields.length).toBeGreaterThan(5);
        });
      }
    }, 20000);
  });
});