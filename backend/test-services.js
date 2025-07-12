const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findService() {
  try {
    const service = await prisma.service.findFirst({
      where: {
        name: { contains: 'Transfer Antar Bank' }
      },
      include: {
        category: true
      }
    });
    
    if (service) {
      console.log('Found service:', service.name);
      console.log('Category:', service.category.name);
      console.log('Dynamic fields:', JSON.stringify(service.dynamicFields, null, 2));
    } else {
      console.log('Service not found - let me search for all BSGTouch services...');
      
      const services = await prisma.service.findMany({
        where: {
          name: { contains: 'BSGTouch' }
        },
        include: { category: true }
      });
      
      console.log('\nFound BSGTouch services:');
      services.forEach((s, i) => {
        console.log(`${i+1}. ${s.name} (Category: ${s.category.name})`);
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findService();