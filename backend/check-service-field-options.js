const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkServiceFieldOptions() {
  try {
    // Get the service with dynamic fields
    const service = await prisma.serviceItem.findFirst({
      where: {
        name: 'New Employee Account Setup'
      },
      include: {
        service_field_definitions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!service) {
      console.log('Service not found');
      return;
    }

    console.log(`\n📋 Service: ${service.name}`);
    console.log(`Fields: ${service.service_field_definitions.length}\n`);

    service.service_field_definitions.forEach((field, idx) => {
      console.log(`${idx + 1}. ${field.fieldLabel} (${field.fieldName})`);
      console.log(`   Type: ${field.fieldType}`);
      console.log(`   Required: ${field.isRequired}`);
      
      if (field.options) {
        console.log(`   Options:`, JSON.stringify(field.options, null, 2));
      }
      
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServiceFieldOptions();