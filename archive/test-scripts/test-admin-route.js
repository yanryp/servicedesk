const { PrismaClient } = require('./backend/node_modules/@prisma/client');

async function testAdminRoute() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing the exact query from serviceCatalogAdminRoutes...\n');
    
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        department: {
          select: { id: true, name: true }
        },
        serviceItems: {
          include: {
            customFieldDefinitions: true
          }
        }
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    console.log(`Found ${catalogs.length} catalogs\n`);

    // Add statistics to each catalog - now showing ServiceItems with their custom fields
    const catalogsWithStats = catalogs.map(catalog => {
      const totalFields = catalog.serviceItems.reduce((sum, item) => sum + item.customFieldDefinitions.length, 0);
      const itemsWithFields = catalog.serviceItems.filter(item => item.customFieldDefinitions.length > 0).length;
      
      console.log(`Catalog: ${catalog.name}`);
      console.log(`  Service Items: ${catalog.serviceItems.length}`);
      console.log(`  Total Fields: ${totalFields}`);
      console.log(`  Items with Fields: ${itemsWithFields}`);
      
      catalog.serviceItems.forEach(item => {
        if (item.customFieldDefinitions.length > 0) {
          console.log(`    ${item.name}: ${item.customFieldDefinitions.length} fields`);
        }
      });
      console.log('');
      
      return {
        ...catalog,
        statistics: {
          serviceItemCount: catalog.serviceItems.length,
          templateCount: totalFields, // Now represents total custom fields
          visibleTemplateCount: itemsWithFields // Now represents service items with custom fields
        }
      };
    });

    // Calculate meta statistics
    const meta = {
      totalCatalogs: catalogs.length,
      totalServiceItems: catalogs.reduce((sum, c) => sum + c.serviceItems.length, 0),
      totalCustomFields: catalogs.reduce((sum, c) => 
        sum + c.serviceItems.reduce((itemSum, item) => itemSum + item.customFieldDefinitions.length, 0), 0
      ),
      serviceItemsWithFields: catalogs.reduce((sum, c) => 
        sum + c.serviceItems.filter(item => item.customFieldDefinitions.length > 0).length, 0
      )
    };

    console.log('Meta statistics:');
    console.log(`  Total Catalogs: ${meta.totalCatalogs}`);
    console.log(`  Total Service Items: ${meta.totalServiceItems}`);
    console.log(`  Total Custom Fields: ${meta.totalCustomFields}`);
    console.log(`  Service Items with Fields: ${meta.serviceItemsWithFields}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminRoute();