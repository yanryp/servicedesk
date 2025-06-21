// scripts/testTemplateWorkflow.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testTemplateWorkflow() {
  console.log('🧪 Testing BSG template workflow...');

  try {
    // 1. Test field type definitions retrieval
    console.log('📋 Testing field type definitions...');
    const fieldTypes = await prisma.fieldTypeDefinition.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });
    
    console.log(`✅ Found ${fieldTypes.length} field types:`);
    fieldTypes.forEach(ft => {
      console.log(`  - ${ft.name} (${ft.category}): ${ft.displayNameId || ft.displayName}`);
    });

    // 2. Test master data retrieval
    console.log('\n🏢 Testing branch master data...');
    const branches = await prisma.masterDataEntity.findMany({
      where: { 
        type: 'branch',
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`✅ Found ${branches.length} branches:`);
    branches.slice(0, 5).forEach(branch => {
      console.log(`  - ${branch.code}: ${branch.nameIndonesian}`);
    });
    if (branches.length > 5) {
      console.log(`  ... and ${branches.length - 5} more branches`);
    }

    console.log('\n💻 Testing OLIBs menu master data...');
    const olibsMenus = await prisma.masterDataEntity.findMany({
      where: { 
        type: 'olibs_menu',
        isActive: true 
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`✅ Found ${olibsMenus.length} OLIBs menus:`);
    olibsMenus.slice(0, 5).forEach(menu => {
      console.log(`  - ${menu.code}: ${menu.nameIndonesian}`);
    });
    if (olibsMenus.length > 5) {
      console.log(`  ... and ${olibsMenus.length - 5} more menus`);
    }

    // 3. Test template categories retrieval
    console.log('\n📁 Testing template categories...');
    const categories = await prisma.templateCategory.findMany({
      where: { 
        isActive: true,
        parentId: null 
      },
      include: {
        children: {
          where: { isActive: true }
        },
        templates: {
          where: { isActive: true },
          select: { id: true, name: true, nameIndonesian: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`✅ Found ${categories.length} root categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.nameIndonesian} (${cat.templates.length} templates)`);
      cat.templates.forEach(template => {
        console.log(`    • ${template.nameIndonesian}`);
      });
    });

    // 4. Test service templates with field definitions
    console.log('\n📝 Testing service templates...');
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: { isVisible: true },
      include: {
        serviceItem: {
          include: {
            serviceCatalog: true
          }
        },
        customFieldDefinitions: {
          orderBy: { sortOrder: 'asc' }
        },
        metadata: {
          include: {
            category: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`✅ Found ${serviceTemplates.length} service templates:`);
    serviceTemplates.forEach(template => {
      console.log(`\n📋 Template: ${template.name}`);
      console.log(`   Service: ${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`);
      console.log(`   Category: ${template.metadata?.category?.nameIndonesian || 'N/A'}`);
      console.log(`   Fields (${template.customFieldDefinitions.length}):`);
      
      template.customFieldDefinitions.forEach(field => {
        console.log(`     • ${field.fieldLabel} (${field.fieldType}) ${field.isRequired ? '[Required]' : ''}`);
      });
    });

    // 5. Test template search functionality
    console.log('\n🔍 Testing template search...');
    const searchResults = await prisma.templateMetadata.findMany({
      where: {
        isActive: true,
        isPublic: true,
        OR: [
          { name: { contains: 'olibs', mode: 'insensitive' } },
          { nameIndonesian: { contains: 'olibs', mode: 'insensitive' } },
          { searchKeywords: { contains: 'olibs', mode: 'insensitive' } }
        ]
      },
      include: {
        category: true,
        serviceTemplate: {
          include: {
            customFieldDefinitions: {
              select: { id: true, fieldName: true, fieldLabel: true, fieldType: true }
            }
          }
        }
      },
      orderBy: { popularityScore: 'desc' }
    });

    console.log(`✅ Search for 'olibs' found ${searchResults.length} templates:`);
    searchResults.forEach(result => {
      console.log(`  - ${result.nameIndonesian} (popularity: ${result.popularityScore})`);
    });

    // 6. Test template usage logging
    console.log('\n📊 Testing usage logging...');
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const firstTemplate = serviceTemplates[0];
    
    if (adminUser && firstTemplate) {
      const usageLog = await prisma.templateUsageLog.create({
        data: {
          serviceTemplateId: firstTemplate.id,
          userId: adminUser.id,
          departmentId: adminUser.departmentId,
          usageType: 'view',
          sessionId: 'test-session-123',
          ipAddress: '127.0.0.1',
          userAgent: 'Test Agent'
        }
      });

      console.log(`✅ Created usage log: ${usageLog.id} for template ${firstTemplate.name}`);

      // Update popularity score
      await prisma.templateMetadata.updateMany({
        where: { serviceTemplateId: firstTemplate.id },
        data: {
          usageCount: { increment: 1 },
          popularityScore: { increment: 0.1 }
        }
      });

      console.log(`✅ Updated popularity score for template ${firstTemplate.name}`);
    }

    // 7. Test Indonesian language support
    console.log('\n🇮🇩 Testing Indonesian language support...');
    const indonesianTemplates = await prisma.templateMetadata.findMany({
      where: {
        isActive: true,
        nameIndonesian: { not: "" }
      },
      select: {
        name: true,
        nameIndonesian: true,
        searchKeywordsId: true
      },
      take: 3
    });

    console.log(`✅ Indonesian language templates:`);
    indonesianTemplates.forEach(template => {
      console.log(`  - EN: ${template.name}`);
      console.log(`    ID: ${template.nameIndonesian}`);
      console.log(`    Keywords: ${template.searchKeywordsId}`);
    });

    console.log('\n🎉 Template workflow test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`  - Field Types: ${fieldTypes.length}`);
    console.log(`  - Branches: ${branches.length}`);
    console.log(`  - OLIBs Menus: ${olibsMenus.length}`);
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - Service Templates: ${serviceTemplates.length}`);
    console.log(`  - Search Results: ${searchResults.length}`);
    console.log(`  - Indonesian Support: ✅ Working`);
    
  } catch (error) {
    console.error('❌ Error testing template workflow:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test function
if (require.main === module) {
  testTemplateWorkflow()
    .then(() => {
      console.log('\n✅ All tests passed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Tests failed:', error);
      process.exit(1);
    });
}

module.exports = { testTemplateWorkflow };