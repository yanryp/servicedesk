import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCatalogStatus() {
  console.log('📊 Checking Service Catalog Status...');

  try {
    // Get all catalogs with their service counts
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          select: {
            id: true,
            name: true
          }
        },
        department: {
          select: {
            name: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`\n📋 Found ${catalogs.length} service catalogs:\n`);

    let totalServices = 0;

    for (const catalog of catalogs) {
      console.log(`📂 ${catalog.name}`);
      console.log(`   Department: ${catalog.department.name}`);
      console.log(`   Services: ${catalog.serviceItems.length}`);
      
      if (catalog.serviceItems.length > 0) {
        console.log('   Sample services:');
        catalog.serviceItems.slice(0, 5).forEach(service => {
          console.log(`     • ${service.name}`);
        });
        if (catalog.serviceItems.length > 5) {
          console.log(`     ... and ${catalog.serviceItems.length - 5} more`);
        }
      }
      console.log('');
      
      totalServices += catalog.serviceItems.length;
    }

    // Check for Core Banking specifically
    const coreBankingCatalogs = catalogs.filter(c => 
      c.name.toLowerCase().includes('core') || 
      c.name.toLowerCase().includes('banking')
    );

    console.log(`🏦 Core Banking Catalogs Found: ${coreBankingCatalogs.length}`);
    for (const catalog of coreBankingCatalogs) {
      console.log(`   • ${catalog.name}: ${catalog.serviceItems.length} services`);
    }

    // Look for OLIBS and KASDA services specifically
    const olibsServices = await prisma.serviceItem.findMany({
      where: {
        name: {
          contains: 'olibs',
          mode: 'insensitive'
        }
      },
      include: {
        serviceCatalog: {
          select: {
            name: true
          }
        }
      }
    });

    const kasdaServices = await prisma.serviceItem.findMany({
      where: {
        name: {
          contains: 'kasda',
          mode: 'insensitive'
        }
      },
      include: {
        serviceCatalog: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`\n🔍 OLIBS Services Found: ${olibsServices.length}`);
    if (olibsServices.length > 0) {
      console.log('   Catalogs containing OLIBS services:');
      const uniqueCatalogs = [...new Set(olibsServices.map(s => s.serviceCatalog.name))];
      uniqueCatalogs.forEach(cat => console.log(`     • ${cat}`));
      
      console.log('   Sample OLIBS services:');
      olibsServices.slice(0, 5).forEach(service => {
        console.log(`     • ${service.name} (${service.serviceCatalog.name})`);
      });
    }

    console.log(`\n🏛️ KASDA Services Found: ${kasdaServices.length}`);
    if (kasdaServices.length > 0) {
      console.log('   Catalogs containing KASDA services:');
      const uniqueCatalogs = [...new Set(kasdaServices.map(s => s.serviceCatalog.name))];
      uniqueCatalogs.forEach(cat => console.log(`     • ${cat}`));
      
      console.log('   Sample KASDA services:');
      kasdaServices.slice(0, 5).forEach(service => {
        console.log(`     • ${service.name} (${service.serviceCatalog.name})`);
      });
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Total Catalogs: ${catalogs.length}`);
    console.log(`   Total Services: ${totalServices}`);
    console.log(`   OLIBS Services: ${olibsServices.length}`);
    console.log(`   KASDA Services: ${kasdaServices.length}`);

  } catch (error) {
    console.error('❌ Error checking catalog status:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkCatalogStatus()
  .catch((error) => {
    console.error('❌ Catalog status check failed:', error);
    process.exit(1);
  });