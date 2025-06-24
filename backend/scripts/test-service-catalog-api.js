#!/usr/bin/env node

/**
 * Test Service Catalog API Response
 * 
 * This script simulates the exact API calls that the frontend makes
 * to test if the data transformation is working correctly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceCatalogAPI() {
  console.log('🧪 Testing Service Catalog API Logic...\n');

  try {
    // Simulate GET /api/service-catalog/categories
    console.log('1️⃣ Testing Categories API:');
    
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

    // Transform BSG categories to service catalog format
    const transformBSGCategoriesToServiceCatalog = (bsgCategories) => {
      return bsgCategories.map(category => ({
        id: `bsg_${category.id}`,
        name: category.displayName || category.name,
        description: category.description || `${category.displayName} services and support`,
        icon: category.icon || getIconForCategory(category.name),
        serviceCount: category._count?.templates || 0,
        type: 'bsg_category'
      }));
    };

    const serviceCatalogCategories = transformBSGCategoriesToServiceCatalog(bsgCategories);
    console.log(`   ✅ Transformed ${serviceCatalogCategories.length} categories`);
    serviceCatalogCategories.slice(0, 3).forEach(cat => {
      console.log(`   - ${cat.name} (${cat.id}): ${cat.serviceCount} services`);
    });

    // Simulate GET /api/service-catalog/category/:categoryId/services
    if (serviceCatalogCategories.length > 0) {
      console.log('\n2️⃣ Testing Services for Category API:');
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

        // Transform BSG Templates to Services
        const transformBSGTemplatesToServices = (bsgTemplates) => {
          return bsgTemplates.map(template => ({
            id: `bsg_template_${template.id}`,
            name: template.displayName || template.name,
            description: template.description || `${template.name} service request`,
            categoryId: `bsg_${template.categoryId}`,
            templateId: template.id,
            popularity: template.popularityScore || 0,
            usageCount: template.usageCount || 0,
            hasFields: template._count?.fields > 0,
            fieldCount: template._count?.fields || 0,
            type: 'bsg_service'
          }));
        };

        const services = transformBSGTemplatesToServices(bsgTemplates);
        console.log(`   ✅ Found ${services.length} OLIBS services:`);
        services.forEach(svc => {
          console.log(`   - ${svc.name} (${svc.id}): ${svc.fieldCount} fields`);
        });

        // Simulate GET /api/service-catalog/service/:serviceId/template
        if (services.length > 0) {
          console.log('\n3️⃣ Testing Service Template API:');
          const firstService = services[0];
          const templateId = parseInt(firstService.id.replace('bsg_template_', ''));
          
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

          // Transform template fields to service catalog format
          const transformedFields = template.fields.map(field => ({
            id: field.id,
            name: field.fieldName,
            label: field.fieldLabel,
            type: field.fieldType.htmlInputType || field.fieldType.name,
            required: field.isRequired,
            description: field.fieldDescription,
            placeholder: field.placeholderText,
            helpText: field.helpText,
            maxLength: field.maxLength,
            validationRules: field.validationRules,
            options: field.options.map(opt => ({
              value: opt.optionValue,
              label: opt.optionLabel,
              isDefault: opt.isDefault
            }))
          }));

          console.log(`   ✅ Template: ${template.displayName}`);
          console.log(`   ✅ Fields (${transformedFields.length}):`);
          transformedFields.forEach(field => {
            const req = field.required ? '*' : '';
            console.log(`   - ${field.label}${req} (${field.type})`);
            if (field.type === 'select' || field.name.includes('dropdown')) {
              console.log(`     → Dropdown field with ${field.options.length} options`);
            }
          });

          // Test 4: Check if we can identify dropdown fields for master data
          console.log('\n4️⃣ Testing Master Data Field Detection:');
          const dropdownFields = transformedFields.filter(field => 
            field.type === 'select' || 
            template.fields.find(f => f.id === field.id)?.fieldType.name.startsWith('dropdown_')
          );

          console.log(`   ✅ Found ${dropdownFields.length} dropdown fields:`);
          dropdownFields.forEach(field => {
            const originalField = template.fields.find(f => f.id === field.id);
            const dataType = originalField.fieldType.name.replace('dropdown_', '');
            console.log(`   - ${field.label}: needs ${dataType} master data`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing service catalog API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Icon mapping function
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
testServiceCatalogAPI()
  .then(() => {
    console.log('\n✅ Service catalog API tests completed');
  })
  .catch((error) => {
    console.error('❌ Service catalog API tests failed:', error);
    process.exit(1);
  });