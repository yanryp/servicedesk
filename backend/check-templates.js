const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    // Count BSG templates
    const bsgCount = await prisma.bSGTemplate.count();
    console.log('BSGTemplate count:', bsgCount);
    
    // Count ServiceItems
    const serviceItemCount = await prisma.serviceItem.count();
    console.log('ServiceItem count:', serviceItemCount);
    
    // Count ServiceTemplates
    const serviceTemplateCount = await prisma.serviceTemplate.count();
    console.log('ServiceTemplate count:', serviceTemplateCount);
    
    // Check if we need to look at CSV imports
    if (bsgCount === 0) {
      console.log('\nNo BSG templates found. The services might be coming from:');
      console.log('1. ServiceItems directly');
      console.log('2. Need to import BSG templates from CSV');
      
      // Check for services with the specific names
      const serviceItems = await prisma.serviceItem.findMany({
        where: {
          OR: [
            { name: { contains: 'OLIBs' } },
            { name: { contains: 'ATM' } }
          ]
        },
        include: {
          service_field_definitions: true,
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      });
      
      console.log(`\nFound ${serviceItems.length} service items matching OLIBs or ATM`);
      
      serviceItems.forEach(item => {
        console.log(`\n- ${item.name}`);
        console.log(`  Direct fields: ${item.service_field_definitions.length}`);
        console.log(`  Templates: ${item.templates.length}`);
        if (item.templates.length > 0) {
          item.templates.forEach(template => {
            console.log(`    - Template: ${template.name} (${template.customFieldDefinitions.length} fields)`);
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

checkTemplates();