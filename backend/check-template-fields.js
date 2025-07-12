const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
});

async function main() {
  console.log('🔍 Checking template fields for OLIBs - Pendaftaran User Baru...\n');
  
  // Find the service first
  const service = await prisma.service.findFirst({
    where: {
      name: {
        contains: 'OLIBs - Pendaftaran User Baru',
        mode: 'insensitive'
      }
    },
    include: {
      serviceTemplateFields: {
        include: {
          fieldType: true
        }
      }
    }
  });
  
  if (!service) {
    console.log('❌ Service not found');
    return;
  }
  
  console.log(`✅ Found service: ${service.name} (ID: ${service.id})`);
  console.log(`📋 Template fields (${service.serviceTemplateFields.length}):`);
  
  service.serviceTemplateFields.forEach(field => {
    console.log(`\n🔧 Field: ${field.label}`);
    console.log(`   - Type: ${field.fieldType.name}`);
    console.log(`   - Required: ${field.isRequired}`);
    console.log(`   - Master Data Type: ${field.masterDataType || 'none'}`);
    console.log(`   - Options: ${field.options || 'none'}`);
    console.log(`   - Default Value: ${field.defaultValue || 'none'}`);
    
    if (field.label.includes('Jenis Akses')) {
      console.log(`\n🎯 FOUND TARGET FIELD: ${field.label}`);
      console.log(`   - Field Type Name: ${field.fieldType.name}`);
      console.log(`   - Master Data Type: ${field.masterDataType}`);
      console.log(`   - Should be loading from: ${field.masterDataType || field.fieldType.name}`);
    }
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });