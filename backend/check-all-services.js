const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllServices() {
  try {
    // Get all service catalogs
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          include: {
            service_field_definitions: true
          }
        },
        department: true
      }
    });

    console.log('📋 All Service Catalogs:\n');
    
    catalogs.forEach(catalog => {
      console.log(`Catalog: ${catalog.name}`);
      console.log(`Department: ${catalog.department.name}`);
      console.log(`Active: ${catalog.isActive}`);
      console.log(`Service Items: ${catalog.serviceItems.length}`);
      
      catalog.serviceItems.forEach(item => {
        console.log(`  - ${item.name}`);
        console.log(`    Fields: ${item.service_field_definitions?.length || 0}`);
        console.log(`    Active: ${item.isActive}`);
      });
      
      console.log('\n');
    });

    // Check service templates
    const templates = await prisma.serviceTemplate.findMany({
      include: {
        customFieldDefinitions: true,
        serviceItem: true
      }
    });

    console.log('📝 Service Templates with Fields:\n');
    
    templates.forEach(template => {
      if (template.customFieldDefinitions.length > 0) {
        console.log(`Template: ${template.name}`);
        console.log(`Service Item: ${template.serviceItem?.name || 'N/A'}`);
        console.log(`Fields: ${template.customFieldDefinitions.length}`);
        console.log('\n');
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllServices();