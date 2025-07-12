const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransferAntarBankService() {
  try {
    console.log('🔍 Searching for Transfer Antar Bank service...');
    
    // Find the service
    const service = await prisma.service.findFirst({
      where: {
        name: {
          contains: 'Transfer Antar Bank'
        }
      },
      include: {
        serviceItems: {
          include: {
            template: {
              include: {
                fields: true
              }
            }
          }
        }
      }
    });
    
    if (!service) {
      console.log('❌ Service not found');
      return;
    }
    
    console.log('✅ Service found:', {
      id: service.id,
      name: service.name,
      description: service.description,
      serviceItemsCount: service.serviceItems.length
    });
    
    console.log('\n📋 Service Items:');
    service.serviceItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (ID: ${item.id})`);
      if (item.template) {
        console.log(`     📄 Template: ${item.template.name} (ID: ${item.template.id})`);
        console.log(`     🔢 Fields: ${item.template.fields.length}`);
        item.template.fields.forEach(field => {
          console.log(`       - ${field.fieldLabel} (${field.fieldType})`);
        });
      } else {
        console.log('     ❌ No template');
      }
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkTransferAntarBankService();