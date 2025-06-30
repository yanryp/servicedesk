// Field Optimization Unit Tests
// Tests the BSG template field optimization system achieving 70.6% efficiency

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('BSG Field Optimization System', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Get or create test admin user
    testUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          username: 'test-optimization',
          email: 'test-optimization@bsg.com',
          passwordHash: '$2b$10$dummy.hash.for.testing.purposes',
          role: 'admin'
        }
      });
    }

    authToken = jwt.sign(
      { userId: testUser.id, email: testUser.email, role: testUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test user if created by us
    if (testUser && testUser.email === 'test-optimization@bsg.com') {
      try {
        await prisma.user.delete({
          where: { id: testUser.id }
        });
      } catch (error) {
        console.warn('⚠️ Failed to clean up test user:', error.message);
      }
    }
    await prisma.$disconnect();
  });

  describe('Field Analysis and Optimization', () => {
    test('Should identify common fields across templates', async () => {
      // Query field usage statistics
      const fieldUsage = await prisma.$queryRaw`
        SELECT 
          btf.field_name,
          COUNT(*) as usage_count,
          ARRAY_AGG(DISTINCT bt.name) as template_names
        FROM bsg_template_fields btf
        JOIN bsg_templates bt ON btf.template_id = bt.id
        GROUP BY btf.field_name
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
      `;

      expect(fieldUsage.length).toBeGreaterThan(10); // Should find 14+ common fields

      // Check for specific high-usage fields
      const cabangField = fieldUsage.find(f => f.field_name === 'Cabang/Capem');
      const kodeUserField = fieldUsage.find(f => f.field_name === 'Kode User');
      const namaUserField = fieldUsage.find(f => f.field_name === 'Nama User');

      expect(cabangField).toBeDefined();
      expect(kodeUserField).toBeDefined();
      expect(namaUserField).toBeDefined();

      // These fields should be used in multiple templates
      expect(Number(cabangField.usage_count)).toBeGreaterThanOrEqual(10);
      expect(Number(kodeUserField.usage_count)).toBeGreaterThanOrEqual(10);
      expect(Number(namaUserField.usage_count)).toBeGreaterThanOrEqual(10);
    });

    test('Should calculate optimization rate accurately', async () => {
      // Get total fields count
      const totalFields = await prisma.bsgTemplateField.count();
      
      // Get unique field names count
      const uniqueFields = await prisma.bsgTemplateField.groupBy({
        by: ['field_name'],
        _count: {
          field_name: true
        }
      });

      const uniqueFieldCount = uniqueFields.length;

      // Calculate optimization rate
      const optimizationRate = ((totalFields - uniqueFieldCount) / totalFields) * 100;

      expect(totalFields).toBeGreaterThan(100); // Should have 119 total fields
      expect(uniqueFieldCount).toBeLessThan(totalFields);
      expect(optimizationRate).toBeGreaterThan(60); // Should achieve >60% optimization
      expect(optimizationRate).toBeLessThan(80); // Realistic upper bound

      console.log(`📊 Field optimization metrics:`);
      console.log(`   Total fields: ${totalFields}`);
      console.log(`   Unique fields: ${uniqueFieldCount}`);
      console.log(`   Optimization rate: ${optimizationRate.toFixed(1)}%`);
    });

    test('Should organize fields into proper categories', async () => {
      // Get field distribution by category
      const categoryDistribution = await prisma.bsgTemplateField.groupBy({
        by: ['category'],
        _count: {
          category: true
        },
        orderBy: {
          _count: {
            category: 'desc'
          }
        }
      });

      expect(categoryDistribution.length).toBeGreaterThanOrEqual(8);

      // Check for expected categories
      const categories = categoryDistribution.map(c => c.category);
      expect(categories).toContain('location');
      expect(categories).toContain('user_identity');
      expect(categories).toContain('timing');
      expect(categories).toContain('transaction');
      expect(categories).toContain('permissions');

      // Verify user_identity category has most fields (due to common user fields)
      const userIdentityCategory = categoryDistribution.find(c => c.category === 'user_identity');
      expect(userIdentityCategory).toBeDefined();
      expect(userIdentityCategory._count.category).toBeGreaterThan(20);
    });

    test('Should validate field type distribution', async () => {
      // Get field type distribution
      const fieldTypeDistribution = await prisma.bsgTemplateField.groupBy({
        by: ['field_type'],
        _count: {
          field_type: true
        },
        orderBy: {
          _count: {
            field_type: 'desc'
          }
        }
      });

      expect(fieldTypeDistribution.length).toBeGreaterThanOrEqual(9);

      // Check for BSG-specific field types
      const fieldTypes = fieldTypeDistribution.map(ft => ft.field_type);
      expect(fieldTypes).toContain('text_short');
      expect(fieldTypes).toContain('text');
      expect(fieldTypes).toContain('dropdown_branch');
      expect(fieldTypes).toContain('dropdown_olibs_menu');
      expect(fieldTypes).toContain('currency');
      expect(fieldTypes).toContain('date');
      expect(fieldTypes).toContain('timestamp');
      expect(fieldTypes).toContain('number');

      // text_short should be most common due to user identity fields
      const textShortType = fieldTypeDistribution.find(ft => ft.field_type === 'text_short');
      expect(textShortType).toBeDefined();
      expect(textShortType._count.field_type).toBeGreaterThan(30);
    });
  });

  describe('Template Coverage and Completeness', () => {
    test('Should have 24 BSG templates implemented', async () => {
      const templateCount = await prisma.bsgTemplate.count();
      expect(templateCount).toBe(24);
    });

    test('Should have 9 template categories', async () => {
      const categoryCount = await prisma.bsgTemplateCategory.count();
      expect(categoryCount).toBeGreaterThanOrEqual(9);

      // Verify specific categories exist
      const categories = await prisma.bsgTemplateCategory.findMany({
        select: { name: true }
      });

      const categoryNames = categories.map(c => c.name);
      expect(categoryNames).toContain('olibs_core_banking');
      expect(categoryNames).toContain('bsgtouch_mobile');
      expect(categoryNames).toContain('sms_banking');
      expect(categoryNames).toContain('bsg_qris');
      expect(categoryNames).toContain('atm_operations');
    });

    test('Should have proper template-field relationships', async () => {
      // Get templates with their field counts
      const templatesWithFields = await prisma.bsgTemplate.findMany({
        include: {
          _count: {
            select: {
              bsgTemplateFields: true
            }
          }
        }
      });

      expect(templatesWithFields.length).toBe(24);

      // Each template should have at least 3 fields
      templatesWithFields.forEach(template => {
        expect(template._count.bsgTemplateFields).toBeGreaterThanOrEqual(3);
      });

      // OLIBS templates should have more fields (6-8 fields each)
      const olibsTemplates = templatesWithFields.filter(t => 
        t.category_name === 'olibs_core_banking'
      );
      expect(olibsTemplates.length).toBeGreaterThanOrEqual(5);
      
      olibsTemplates.forEach(template => {
        expect(template._count.bsgTemplateFields).toBeGreaterThanOrEqual(5);
      });
    });

    test('Should have comprehensive master data', async () => {
      // Check BSG master data
      const branchCount = await prisma.bsgMasterData.count({
        where: { type: 'branch' }
      });
      
      const olibsMenuCount = await prisma.bsgMasterData.count({
        where: { type: 'olibs_menu' }
      });

      expect(branchCount).toBeGreaterThan(40); // Should have 47+ branches
      expect(olibsMenuCount).toBeGreaterThan(20); // Should have 25+ OLIBS menus

      // Verify branch hierarchy
      const branches = await prisma.bsgMasterData.findMany({
        where: { type: 'branch' },
        select: { metadata: true }
      });

      const mainBranches = branches.filter(b => 
        b.metadata && b.metadata.level === 'cabang'
      );
      const subBranches = branches.filter(b => 
        b.metadata && b.metadata.level === 'capem'
      );

      expect(mainBranches.length).toBeGreaterThan(5);
      expect(subBranches.length).toBeGreaterThan(10);
    });
  });

  describe('Optimization Performance Impact', () => {
    test('Should demonstrate field reuse efficiency', async () => {
      // Simulate creating a new template using optimized fields
      const commonFields = await prisma.$queryRaw`
        SELECT 
          btf.field_name,
          btf.field_type,
          btf.category,
          COUNT(*) as usage_count
        FROM bsg_template_fields btf
        GROUP BY btf.field_name, btf.field_type, btf.category
        HAVING COUNT(*) >= 5
        ORDER BY COUNT(*) DESC
        LIMIT 5
      `;

      expect(commonFields.length).toBeGreaterThanOrEqual(5);

      // These fields represent high reuse efficiency
      commonFields.forEach(field => {
        expect(Number(field.usage_count)).toBeGreaterThanOrEqual(5);
        expect(field.field_name).toBeDefined();
        expect(field.field_type).toBeDefined();
        expect(field.category).toBeDefined();
      });

      console.log('🔧 Most reused fields:');
      commonFields.forEach(field => {
        console.log(`   ${field.field_name}: ${field.usage_count} instances`);
      });
    });

    test('Should validate memory and storage optimization', async () => {
      // Calculate storage impact of optimization
      const totalFieldsWithDuplicates = await prisma.bsgTemplateField.count();
      
      const uniqueFieldConfigurations = await prisma.bsgTemplateField.groupBy({
        by: ['field_name', 'field_type', 'category'],
        _count: true
      });

      const storageReduction = ((totalFieldsWithDuplicates - uniqueFieldConfigurations.length) / totalFieldsWithDuplicates) * 100;

      expect(storageReduction).toBeGreaterThan(50); // Significant storage optimization
      expect(uniqueFieldConfigurations.length).toBeLessThan(50); // Manageable number of unique configurations

      console.log(`💾 Storage optimization metrics:`);
      console.log(`   Total field instances: ${totalFieldsWithDuplicates}`);
      console.log(`   Unique configurations: ${uniqueFieldConfigurations.length}`);
      console.log(`   Storage reduction: ${storageReduction.toFixed(1)}%`);
    });
  });

  describe('Field Validation and Quality', () => {
    test('Should have valid field type definitions', async () => {
      const fieldTypes = await prisma.bsgFieldType.findMany();
      
      expect(fieldTypes.length).toBeGreaterThanOrEqual(9);

      fieldTypes.forEach(fieldType => {
        expect(fieldType.name).toBeDefined();
        expect(fieldType.display_name).toBeDefined();
        expect(fieldType.validation_rules).toBeDefined();
        
        // Validation rules should be valid JSON
        expect(() => JSON.parse(fieldType.validation_rules)).not.toThrow();
      });
    });

    test('Should have proper field sorting and organization', async () => {
      // Get a template with many fields to test sorting
      const templateWithFields = await prisma.bsgTemplate.findFirst({
        include: {
          bsgTemplateFields: {
            orderBy: { sort_order: 'asc' }
          }
        },
        where: {
          bsgTemplateFields: {
            some: {}
          }
        }
      });

      expect(templateWithFields).toBeDefined();
      expect(templateWithFields.bsgTemplateFields.length).toBeGreaterThan(3);

      // Sort orders should be sequential
      const sortOrders = templateWithFields.bsgTemplateFields.map(f => f.sort_order);
      
      for (let i = 1; i < sortOrders.length; i++) {
        expect(sortOrders[i]).toBeGreaterThanOrEqual(sortOrders[i-1]);
      }
    });

    test('Should have proper field constraints and validation', async () => {
      // Check required field distribution
      const requiredFieldsCount = await prisma.bsgTemplateField.count({
        where: { is_required: true }
      });
      
      const totalFieldsCount = await prisma.bsgTemplateField.count();
      const requiredFieldsPercentage = (requiredFieldsCount / totalFieldsCount) * 100;

      // Reasonable percentage of required fields (30-70%)
      expect(requiredFieldsPercentage).toBeGreaterThan(30);
      expect(requiredFieldsPercentage).toBeLessThan(70);

      // Check max length constraints
      const fieldsWithMaxLength = await prisma.bsgTemplateField.count({
        where: { 
          max_length: { not: null },
          field_type: { in: ['text_short', 'text'] }
        }
      });

      expect(fieldsWithMaxLength).toBeGreaterThan(20); // Most text fields should have length limits
    });
  });
});

console.log('🎯 BSG Field Optimization Tests');
console.log('📊 Testing: 70.6% Efficiency Validation');
console.log('🔧 Coverage: 24 Templates, 119 Fields, 9 Categories');
console.log('💾 Optimization: Storage & Memory Impact Analysis');
console.log('✅ Quality: Field Validation & Constraint Testing');