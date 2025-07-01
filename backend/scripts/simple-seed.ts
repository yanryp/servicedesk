import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleSeed() {
  console.log('🌱 Creating essential service catalog data...');

  try {
    // Check existing data
    const existingCatalogs = await prisma.serviceCatalog.count();
    console.log(`Found ${existingCatalogs} existing service catalogs`);

    if (existingCatalogs === 0) {
      // Get departments
      const supportDept = await prisma.department.findFirst({ where: { name: 'Dukungan dan Layanan' } });
      const itDept = await prisma.department.findFirst({ where: { name: 'Information Technology' } });
      
      if (!supportDept || !itDept) {
        throw new Error('Required departments not found');
      }

      console.log('📁 Creating service catalogs...');

      // Create Core Banking catalog
      const coreBanking = await prisma.serviceCatalog.create({
        data: {
          name: 'Core Banking Systems',
          description: 'Central banking platform and infrastructure services',
          serviceType: 'business_service',
          departmentId: supportDept.id,
          isActive: true,
          requiresApproval: true,
          businessImpact: 'high'
        }
      });

      // Create IT Infrastructure catalog
      const itInfra = await prisma.serviceCatalog.create({
        data: {
          name: 'IT Infrastructure & Support',
          description: 'Network, hardware, software, and IT support services',
          serviceType: 'technical_service',
          departmentId: itDept.id,
          isActive: true,
          requiresApproval: false,
          businessImpact: 'medium'
        }
      });

      console.log('✅ Created service catalogs');

      // Create service items with minimal required fields only
      console.log('📂 Creating service items...');
      
      await prisma.serviceItem.create({
        data: {
          name: 'OLIBS Core Banking',
          description: 'Core banking system access and operations',
          serviceCatalogId: coreBanking.id,
          requestType: 'service_request',
          isActive: true
        }
      });

      await prisma.serviceItem.create({
        data: {
          name: 'KASDA Treasury System',
          description: 'Government treasury and accounting system support',
          serviceCatalogId: coreBanking.id,
          requestType: 'service_request',
          isActive: true
        }
      });

      await prisma.serviceItem.create({
        data: {
          name: 'Network & Connectivity',
          description: 'Network infrastructure and connectivity support',
          serviceCatalogId: itInfra.id,
          requestType: 'incident',
          isActive: true
        }
      });

      await prisma.serviceItem.create({
        data: {
          name: 'Hardware & Equipment',
          description: 'Computer hardware and office equipment support',
          serviceCatalogId: itInfra.id,
          requestType: 'incident',
          isActive: true
        }
      });

      console.log('✅ Created service items');
    }

    // Create categories
    const existingCategories = await prisma.category.count();
    if (existingCategories === 0) {
      console.log('📋 Creating categories...');
      await prisma.category.createMany({
        data: [
          { name: 'Hardware' },
          { name: 'Software' },
          { name: 'Network' },
          { name: 'KASDA' },
          { name: 'BSGDirect' },
          { name: 'OLIBS' },
          { name: 'General' }
        ]
      });
      console.log('✅ Created categories');
    }

    // Final summary
    const summary = {
      serviceCatalogs: await prisma.serviceCatalog.count(),
      serviceItems: await prisma.serviceItem.count(),
      categories: await prisma.category.count(),
      users: await prisma.user.count()
    };

    console.log('📊 Database Summary:');
    console.log(`  📁 Service Catalogs: ${summary.serviceCatalogs}`);
    console.log(`  📂 Service Items: ${summary.serviceItems}`);
    console.log(`  📋 Categories: ${summary.categories}`);
    console.log(`  👥 Users: ${summary.users}`);

    console.log('✅ Essential data seeded successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed();