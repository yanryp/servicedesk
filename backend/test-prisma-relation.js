const { PrismaClient } = require('@prisma/client');

async function testPrismaRelation() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing ServiceItem with customFieldDefinitions relation...\n');
    
    // Test if any ServiceItem has custom fields
    const itemWithFields = await prisma.serviceItem.findFirst({
      where: {
        customFieldDefinitions: {
          some: {}
        }
      },
      include: {
        customFieldDefinitions: true
      }
    });
    
    if (itemWithFields) {
      console.log(`Found ServiceItem with fields: ${itemWithFields.name}`);
      console.log(`Number of custom fields: ${itemWithFields.customFieldDefinitions.length}`);
      console.log('Field names:', itemWithFields.customFieldDefinitions.map(f => f.fieldName));
    } else {
      console.log('No ServiceItem found with custom fields');
    }
    
    console.log('\nTesting direct ServiceCatalog query...');
    
    // Test the exact query from the route
    const catalog = await prisma.serviceCatalog.findFirst({
      where: {
        name: 'ATM Management'
      },
      include: {
        serviceItems: {
          include: {
            customFieldDefinitions: true
          }
        }
      }
    });
    
    if (catalog) {
      console.log(`\nCatalog: ${catalog.name}`);
      console.log(`Service Items: ${catalog.serviceItems.length}`);
      
      catalog.serviceItems.forEach(item => {
        console.log(`  ${item.name}: ${item.customFieldDefinitions ? item.customFieldDefinitions.length : 'undefined'} fields`);
        if (item.customFieldDefinitions && item.customFieldDefinitions.length > 0) {
          item.customFieldDefinitions.forEach(field => {
            console.log(`    - ${field.fieldName}: ${field.fieldType}`);
          });
        }
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaRelation();