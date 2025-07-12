const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDynamicFields() {
  try {
    console.log('=== DEBUGGING DYNAMIC FIELDS IN CUSTOMER PORTAL ===\n');

    // 1. Get all ServiceTemplates with customFieldDefinitions
    console.log('1. SERVICE TEMPLATES WITH CUSTOM FIELD DEFINITIONS:');
    console.log('='.repeat(50));
    
    const templatesWithFields = await prisma.serviceTemplate.findMany({
      include: {
        customFieldDefinitions: true,
        serviceItem: {
          include: {
            serviceCatalog: {
              include: {
                service: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${templatesWithFields.length} total templates\n`);
    
    const templatesWithFieldsCount = templatesWithFields.filter(t => t.customFieldDefinitions.length > 0);
    console.log(`Templates with fields: ${templatesWithFieldsCount.length}\n`);
    
    for (const template of templatesWithFields) {
      if (template.customFieldDefinitions.length > 0) {
        console.log(`Template: ${template.name}`);
        console.log(`  ID: ${template.id}`);
        console.log(`  ServiceItem: ${template.serviceItem.name}`);
        console.log(`  Service: ${template.serviceItem.serviceCatalog?.service?.name || 'N/A'}`);
        console.log(`  Category: ${template.serviceItem.serviceCatalog?.name || 'N/A'}`);
        console.log(`  Field Count: ${template.customFieldDefinitions.length}`);
        console.log(`  Fields:`);
        template.customFieldDefinitions.forEach(field => {
          console.log(`    - ${field.fieldLabel} (${field.fieldName}) - Type: ${field.fieldType}${field.isRequired ? ' [Required]' : ''}`);
        });
        console.log('-'.repeat(40));
      }
    }

    // 2. Get specific services mentioned by user
    console.log('\n2. CHECKING SPECIFIC SERVICES:');
    console.log('='.repeat(50));
    
    const specificServices = [
      'OLIBs - Pendaftaran User Baru',
      'ATM-Permasalahan Teknis'
    ];

    for (const serviceName of specificServices) {
      console.log(`\nChecking: ${serviceName}`);
      
      const serviceItem = await prisma.serviceItem.findFirst({
        where: {
          name: {
            contains: serviceName
          }
        },
        include: {
          service_field_definitions: true,
          serviceTemplates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      });

      if (serviceItem) {
        console.log(`  ServiceItem ID: ${serviceItem.id}`);
        console.log(`  Has service_field_definitions: ${serviceItem.service_field_definitions?.length || 0}`);
        console.log(`  Has serviceTemplates: ${serviceItem.serviceTemplates?.length || 0}`);
        
        if (serviceItem.serviceTemplates && serviceItem.serviceTemplates.length > 0) {
          serviceItem.serviceTemplates.forEach(template => {
            console.log(`  Template: ${template.name}`);
            console.log(`    Template ID: ${template.id}`);
            console.log(`    customFieldDefinitions: ${template.customFieldDefinitions.length} fields`);
            if (template.customFieldDefinitions.length > 0) {
              template.customFieldDefinitions.forEach(field => {
                console.log(`      - ${field.fieldLabel} (${field.fieldName})`);
              });
            }
          });
        }
      } else {
        console.log(`  Service not found!`);
      }
    }

    // 3. Check all ServiceItems and their field sources
    console.log('\n3. ALL SERVICE ITEMS WITH THEIR FIELD SOURCES:');
    console.log('='.repeat(50));
    
    const allServiceItems = await prisma.serviceItem.findMany({
      include: {
        serviceTemplates: {
          include: {
            customFieldDefinitions: true
          }
        },
        service_field_definitions: true,
        serviceCatalog: {
          include: {
            service: true
          }
        }
      }
    });

    let itemsWithTemplateFields = 0;
    let itemsWithDirectFields = 0;
    let itemsWithBothFields = 0;
    let itemsWithNoFields = 0;

    for (const item of allServiceItems) {
      const hasTemplateFields = item.serviceTemplates?.some(t => t.customFieldDefinitions?.length > 0);
      const hasDirectFields = item.service_field_definitions?.length > 0;
      
      if (hasTemplateFields && hasDirectFields) {
        itemsWithBothFields++;
      } else if (hasTemplateFields) {
        itemsWithTemplateFields++;
      } else if (hasDirectFields) {
        itemsWithDirectFields++;
      } else {
        itemsWithNoFields++;
      }
    }

    console.log(`Total ServiceItems: ${allServiceItems.length}`);
    console.log(`  With template fields only: ${itemsWithTemplateFields}`);
    console.log(`  With direct fields only: ${itemsWithDirectFields}`);
    console.log(`  With both: ${itemsWithBothFields}`);
    console.log(`  With no fields: ${itemsWithNoFields}`);

    // 4. List all items that should have fields but might not be showing
    console.log('\n4. SERVICE ITEMS WITH TEMPLATE FIELDS (potential issues):');
    console.log('='.repeat(50));
    
    const itemsWithTemplateFieldsOnly = allServiceItems.filter(item => 
      item.serviceTemplates?.some(t => t.customFieldDefinitions?.length > 0) && 
      (!item.service_field_definitions || item.service_field_definitions.length === 0)
    );

    console.log(`\nFound ${itemsWithTemplateFieldsOnly.length} items with template fields but no direct fields:\n`);
    
    for (const item of itemsWithTemplateFieldsOnly) {
      console.log(`ServiceItem: ${item.name}`);
      console.log(`  Category: ${item.serviceCatalog?.name || 'N/A'} (Service: ${item.serviceCatalog?.service?.name || 'N/A'})`);
      console.log(`  Templates with fields:`);
      item.serviceTemplates.forEach(template => {
        if (template.customFieldDefinitions.length > 0) {
          console.log(`    - ${template.name} (${template.customFieldDefinitions.length} fields)`);
        }
      });
      console.log(`  Issue: Has template fields but no service_field_definitions`);
      console.log('-'.repeat(40));
    }

    // 5. Check the API endpoint logic
    console.log('\n5. BACKEND API LOGIC CHECK:');
    console.log('='.repeat(50));
    console.log('The backend serviceCatalogRoutes.ts is checking:');
    console.log('  - service_field_definitions on ServiceItem (direct relationship)');
    console.log('  - But NOT checking customFieldDefinitions on ServiceTemplate');
    console.log('\nThis explains why services with template-based fields are not showing fields!');
    
    // 6. Check BSG Template endpoints
    console.log('\n6. BSG TEMPLATE SERVICES (These SHOULD have fields):');
    console.log('='.repeat(50));
    
    const bsgTemplates = await prisma.bSGTemplate.findMany({
      where: {
        fields: {
          not: null
        }
      },
      include: {
        category: true
      }
    });
    
    console.log(`Found ${bsgTemplates.length} BSG templates with fields:\n`);
    
    // Show specific services mentioned
    const specificBSGTemplates = bsgTemplates.filter(t => 
      t.name.includes('OLIBs - Pendaftaran User Baru') || 
      t.name.includes('ATM-Permasalahan Teknis')
    );
    
    for (const template of specificBSGTemplates) {
      console.log(`BSG Template: ${template.displayName || template.name}`);
      console.log(`  Category: ${template.category.displayName}`);
      console.log(`  Fields: ${JSON.stringify(template.fields, null, 2)}`);
      console.log('-'.repeat(40));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDynamicFields();