const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServiceFields() {
  try {
    const services = ['OLIBs - Pendaftaran User Baru', 'ATM-Permasalahan Teknis'];
    
    for (const serviceName of services) {
      console.log(`\n=== ${serviceName} ===`);
      
      const serviceItem = await prisma.serviceItem.findFirst({
        where: { name: serviceName },
        include: {
          service_field_definitions: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
      
      if (serviceItem) {
        console.log(`Service ID: ${serviceItem.id}`);
        console.log(`Total fields: ${serviceItem.service_field_definitions.length}`);
        console.log('\nFields:');
        serviceItem.service_field_definitions.forEach((field, idx) => {
          console.log(`${idx + 1}. ${field.fieldLabel} (${field.fieldName})`);
          console.log(`   Type: ${field.fieldType}, Required: ${field.isRequired}`);
          if (field.options) {
            console.log(`   Options: ${field.options}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServiceFields();