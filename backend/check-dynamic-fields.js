const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDynamicFields() {
  try {
    const servicesWithFields = await prisma.service.findMany({
      where: {
        dynamicFields: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        },
        dynamicFields: true
      }
    });
    
    console.log('Services with dynamic fields:');
    servicesWithFields.forEach(service => {
      const fields = JSON.parse(service.dynamicFields || '[]');
      console.log(`\n${service.category.name} > ${service.name}:`);
      console.log(`  Dynamic fields: ${fields.length}`);
      fields.forEach(field => {
        console.log(`    - ${field.label} (${field.type})`);
      });
    });
    
    console.log(`\nTotal services with dynamic fields: ${servicesWithFields.length}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDynamicFields();