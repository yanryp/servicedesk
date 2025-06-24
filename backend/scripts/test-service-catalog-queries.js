#!/usr/bin/env node

/**
 * Test Service Catalog Database Queries
 * 
 * This script tests the exact queries used by the service catalog
 * to verify they're returning the expected data.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceCatalogQueries() {
  console.log('🧪 Testing Service Catalog Database Queries...\n');

  try {
    // Test 1: BSG Categories Query (used by service catalog)
    console.log('1️⃣ Testing BSG Categories Query:');
    const bsgCategories = await prisma.bSGTemplateCategory.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            templates: {
              where: { isActive: true }
            }
          }
        }
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`   ✅ Found ${bsgCategories.length} active categories`);
    bsgCategories.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.displayName} (${cat.name}): ${cat._count.templates} templates`);
    });

    // Test 2: BSG Templates for a category
    if (bsgCategories.length > 0) {
      console.log('\n2️⃣ Testing BSG Templates for OLIBS category:');
      const olibsCategory = bsgCategories.find(cat => cat.name === 'OLIBS');
      
      if (olibsCategory) {
        const templates = await prisma.bSGTemplate.findMany({
          where: {
            categoryId: olibsCategory.id,
            isActive: true
          },
          include: {
            category: {
              select: {
                name: true,
                displayName: true
              }
            },
            _count: {
              select: {
                fields: true
              }
            }
          },
          orderBy: [
            { popularityScore: 'desc' },
            { name: 'asc' }
          ]
        });

        console.log(`   ✅ Found ${templates.length} OLIBS templates`);
        templates.forEach(tmpl => {
          console.log(`   - ${tmpl.displayName || tmpl.name}: ${tmpl._count.fields} fields`);
        });

        // Test 3: Template Fields for first template
        if (templates.length > 0) {
          console.log('\n3️⃣ Testing Template Fields:');
          const firstTemplate = templates[0];
          
          const templateFields = await prisma.bSGTemplateField.findMany({
            where: {
              templateId: firstTemplate.id
            },
            include: {
              fieldType: {
                select: {
                  name: true,
                  displayName: true,
                  htmlInputType: true,
                  validationPattern: true
                }
              },
              options: {
                orderBy: { sortOrder: 'asc' }
              }
            },
            orderBy: [
              { sortOrder: 'asc' },
              { id: 'asc' }
            ]
          });

          console.log(`   ✅ Found ${templateFields.length} fields for ${firstTemplate.name}`);
          templateFields.forEach(field => {
            console.log(`   - ${field.fieldLabel} (${field.fieldType.name}): ${field.isRequired ? 'Required' : 'Optional'}`);
          });

          // Test 4: Master Data availability
          console.log('\n4️⃣ Testing Master Data for dropdown fields:');
          const dropdownFields = templateFields.filter(field => 
            field.fieldType.name.startsWith('dropdown_')
          );

          if (dropdownFields.length > 0) {
            for (const field of dropdownFields) {
              const dataType = field.fieldType.name.replace('dropdown_', '');
              console.log(`   Testing ${dataType} master data:`);
              
              // Check BSGMasterData
              const bsgMasterData = await prisma.bSGMasterData.findMany({
                where: {
                  dataType: dataType,
                  isActive: true
                },
                take: 3
              });

              // Check MasterDataEntity
              const genericMasterData = await prisma.masterDataEntity.findMany({
                where: {
                  type: dataType,
                  isActive: true
                },
                take: 3
              });

              console.log(`     - BSGMasterData: ${bsgMasterData.length} entries`);
              console.log(`     - MasterDataEntity: ${genericMasterData.length} entries`);
              
              if (bsgMasterData.length === 0 && genericMasterData.length === 0) {
                console.log(`     ❌ No master data found for ${dataType}`);
              }
            }
          }
        }
      }
    }

    // Test 5: Service Catalog Transformation
    console.log('\n5️⃣ Testing Service Catalog Data Transformation:');
    
    // Transform BSG categories to service catalog format
    const serviceCatalogCategories = bsgCategories.map(category => ({
      id: `bsg_${category.id}`,
      name: category.displayName || category.name,
      description: category.description || `${category.displayName} services and support`,
      icon: getIconForCategory(category.name),
      serviceCount: category._count?.templates || 0,
      type: 'bsg_category'
    }));

    console.log(`   ✅ Transformed ${serviceCatalogCategories.length} categories:`);
    serviceCatalogCategories.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.serviceCount} services (${cat.icon} icon)`);
    });

  } catch (error) {
    console.error('❌ Error testing service catalog queries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Icon mapping function (copied from service catalog routes)
function getIconForCategory(categoryName) {
  const iconMap = {
    'OLIBS': 'users',
    'XCARD': 'credit-card',
    'QRIS': 'qr-code',
    'KLAIM': 'receipt',
    'ATM': 'credit-card',
    'KASDA': 'building-office',
    'SWITCHING': 'wifi',
    'HARDWARE': 'hard-drive',
    'SOFTWARE': 'computer-desktop'
  };
  return iconMap[categoryName.toUpperCase()] || 'document-text';
}

// Run the test
testServiceCatalogQueries()
  .then(() => {
    console.log('\n✅ Service catalog query tests completed');
  })
  .catch((error) => {
    console.error('❌ Query tests failed:', error);
    process.exit(1);
  });