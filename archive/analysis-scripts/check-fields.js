const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function checkFields() {
  const prisma = new PrismaClient();
  
  try {
    // Check total custom fields
    const totalFields = await prisma.serviceFieldDefinition.count();
    console.log('Total ServiceFieldDefinitions in database:', totalFields);
    
    // Check fields with serviceItemId
    const fieldsWithServiceItem = await prisma.serviceFieldDefinition.count({
      where: {
        serviceItemId: {
          not: null
        }
      }
    });
    console.log('ServiceFieldDefinitions with serviceItemId:', fieldsWithServiceItem);
    
    // Check ServiceItems with fields
    const serviceItemsWithFields = await prisma.serviceItem.findMany({
      include: {
        customFieldDefinitions: true
      }
    });
    
    console.log('\nServiceItems with their custom fields:');
    serviceItemsWithFields.forEach(item => {
      if (item.customFieldDefinitions.length > 0) {
        console.log(`  ${item.name}: ${item.customFieldDefinitions.length} fields`);
      }
    });
    
    // Check what the admin route should return
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          include: {
            customFieldDefinitions: true
          }
        }
      }
    });
    
    console.log('\nService Catalogs with field counts:');
    catalogs.forEach(catalog => {
      const totalFields = catalog.serviceItems.reduce((sum, item) => sum + item.customFieldDefinitions.length, 0);
      if (totalFields > 0) {
        console.log(`  ${catalog.name}: ${totalFields} total fields across ${catalog.serviceItems.length} items`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();