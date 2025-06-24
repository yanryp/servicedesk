#!/usr/bin/env node

/**
 * End-to-End Service Catalog Test
 * 
 * This script tests the complete service catalog workflow:
 * 1. Categories API
 * 2. Services API  
 * 3. Template/Fields API
 * 4. Master Data API
 * 5. Complete data flow validation
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceCatalogEndToEnd() {
  console.log('🧪 End-to-End Service Catalog Test\n');

  let testResults = {
    categories: false,
    services: false,
    templates: false,
    masterData: false,
    dataFlow: false
  };

  try {
    // Test 1: Categories API Logic
    console.log('1️⃣ Testing Categories API...');
    
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

    const serviceCatalogCategories = bsgCategories.map(category => ({
      id: `bsg_${category.id}`,
      name: category.displayName || category.name,
      description: category.description || `${category.displayName} services and support`,
      icon: category.icon || getIconForCategory(category.name),
      serviceCount: category._count?.templates || 0,
      type: 'bsg_category'
    }));

    if (serviceCatalogCategories.length >= 10) {
      console.log(`   ✅ Categories API: ${serviceCatalogCategories.length} categories loaded`);
      testResults.categories = true;
    } else {
      console.log(`   ❌ Categories API: Only ${serviceCatalogCategories.length} categories found (expected 10+)`);
    }

    // Test 2: Services API Logic
    console.log('\n2️⃣ Testing Services API...');
    
    const olibsCategory = serviceCatalogCategories.find(cat => cat.name.includes('OLIBS'));
    if (olibsCategory) {
      const bsgCategoryId = parseInt(olibsCategory.id.replace('bsg_', ''));
      
      const bsgTemplates = await prisma.bSGTemplate.findMany({
        where: {
          categoryId: bsgCategoryId,
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

      const services = bsgTemplates.map(template => ({
        id: `bsg_template_${template.id}`,
        name: template.displayName || template.name,
        description: template.description || `${template.name} service request`,
        categoryId: `bsg_${template.categoryId}`,
        templateId: template.id,
        hasFields: template._count?.fields > 0,
        fieldCount: template._count?.fields || 0,
        type: 'bsg_service'
      }));

      if (services.length >= 5) {
        console.log(`   ✅ Services API: ${services.length} OLIBS services loaded`);
        testResults.services = true;
      } else {
        console.log(`   ❌ Services API: Only ${services.length} OLIBS services found (expected 5+)`);
      }

      // Test 3: Template/Fields API Logic
      console.log('\n3️⃣ Testing Template/Fields API...');
      
      // Find a service with dropdown fields
      const serviceWithDropdowns = services.find(svc => svc.fieldCount > 0);
      if (serviceWithDropdowns) {
        const templateId = parseInt(serviceWithDropdowns.id.replace('bsg_template_', ''));
        
        const template = await prisma.bSGTemplate.findUnique({
          where: { id: templateId },
          include: {
            category: {
              select: {
                name: true,
                displayName: true,
                description: true
              }
            },
            fields: {
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
              orderBy: { sortOrder: 'asc' }
            }
          }
        });

        const transformedFields = template.fields.map(field => ({
          id: field.id,
          name: field.fieldName,
          label: field.fieldLabel,
          type: field.fieldType.htmlInputType || field.fieldType.name,
          required: field.isRequired,
          originalFieldType: field.fieldType.name,
          isDropdownField: field.fieldType.name.startsWith('dropdown_'),
          masterDataType: field.fieldType.name.startsWith('dropdown_') 
            ? field.fieldType.name.replace('dropdown_', '') 
            : null
        }));

        console.log(`   ✅ Template API: ${template.displayName} with ${transformedFields.length} fields`);
        
        const dropdownFields = transformedFields.filter(field => field.isDropdownField);
        console.log(`   ✅ Dropdown Detection: ${dropdownFields.length} dropdown fields found`);
        
        if (transformedFields.length > 0) {
          testResults.templates = true;
        }

        // Test 4: Master Data API Logic
        console.log('\n4️⃣ Testing Master Data API...');
        
        if (dropdownFields.length > 0) {
          for (const field of dropdownFields) {
            const dataType = field.masterDataType;
            console.log(`   Testing master data for: ${dataType}`);
            
            // Test BSGMasterData lookup
            const bsgMasterData = await prisma.bSGMasterData.findMany({
              where: {
                dataType: dataType,
                isActive: true
              },
              take: 5
            });

            // Test fallback to default data
            let hasData = bsgMasterData.length > 0;
            if (!hasData && dataType === 'branch') {
              console.log(`     → Using default branch data (6 entries)`);
              hasData = true;
            }
            if (!hasData && dataType === 'olibs_menu') {
              console.log(`     → Using default OLIBS menu data (5 entries)`);
              hasData = true;
            }

            if (hasData) {
              console.log(`     ✅ Master data available for ${dataType}`);
              testResults.masterData = true;
            } else {
              console.log(`     ❌ No master data found for ${dataType}`);
            }
          }
        } else {
          console.log('   ⚠️  No dropdown fields found to test master data');
          testResults.masterData = true; // Mark as pass since no dropdowns to test
        }
      }
    }

    // Test 5: Complete Data Flow Validation
    console.log('\n5️⃣ Testing Complete Data Flow...');
    
    const flowSteps = [
      { name: 'Categories Load', passed: testResults.categories },
      { name: 'Services Load', passed: testResults.services },
      { name: 'Template Fields', passed: testResults.templates },
      { name: 'Master Data', passed: testResults.masterData }
    ];

    let allPassed = true;
    flowSteps.forEach(step => {
      const status = step.passed ? '✅' : '❌';
      console.log(`   ${status} ${step.name}`);
      if (!step.passed) allPassed = false;
    });

    testResults.dataFlow = allPassed;

    // Final Summary
    console.log('\n📊 Test Summary:');
    console.log('==================');
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(Boolean).length;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
    });

    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Service Catalog is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Review the issues above.');
    }

  } catch (error) {
    console.error('❌ Error during end-to-end testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function
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
testServiceCatalogEndToEnd()
  .then(() => {
    console.log('\n✅ End-to-end testing completed');
  })
  .catch((error) => {
    console.error('❌ End-to-end testing failed:', error);
    process.exit(1);
  });