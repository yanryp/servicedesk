const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function investigateTokenPLNDuplicates() {
  console.log('🔍 Investigating ATM-Pembelian Token PLN duplicates...\n');
  
  const tokenPLNServices = await client.serviceTemplate.findMany({
    where: {
      name: 'ATM-Pembelian Token PLN'
    },
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      },
      customFieldDefinitions: true
    },
    orderBy: { id: 'asc' }
  });
  
  console.log(`Found ${tokenPLNServices.length} services named "ATM-Pembelian Token PLN":\n`);
  
  tokenPLNServices.forEach((service, index) => {
    console.log(`${index + 1}. Service ID: ${service.id}`);
    console.log(`   Name: ${service.name}`);
    console.log(`   Description: ${service.description || 'No description'}`);
    console.log(`   Location: ${service.serviceItem.serviceCatalog.name} > ${service.serviceItem.name}`);
    console.log(`   Catalog Active: ${service.serviceItem.serviceCatalog.isActive}`);
    console.log(`   Service Active: ${service.isVisible}`);
    console.log(`   Custom Fields: ${service.customFieldDefinitions.length}`);
    console.log(`   Created: ${service.createdAt}`);
    console.log('');
  });
  
  // Check if they're in different catalogs or service items
  const uniqueLocations = [...new Set(tokenPLNServices.map(s => 
    `${s.serviceItem.serviceCatalog.name} > ${s.serviceItem.name}`
  ))];
  
  console.log(`📍 Unique Locations: ${uniqueLocations.length}`);
  uniqueLocations.forEach((location, index) => {
    const servicesInLocation = tokenPLNServices.filter(s => 
      `${s.serviceItem.serviceCatalog.name} > ${s.serviceItem.name}` === location
    );
    console.log(`${index + 1}. ${location} (${servicesInLocation.length} services)`);
  });
  
  // Check if we should keep one and remove others
  const activeITILServices = tokenPLNServices.filter(s => 
    s.serviceItem.serviceCatalog.isActive && 
    !s.serviceItem.serviceCatalog.name.startsWith('[LEGACY]')
  );
  
  const legacyServices = tokenPLNServices.filter(s => 
    !s.serviceItem.serviceCatalog.isActive || 
    s.serviceItem.serviceCatalog.name.startsWith('[LEGACY]')
  );
  
  console.log(`\n📊 BREAKDOWN:`);
  console.log(`✅ In Active ITIL Catalogs: ${activeITILServices.length}`);
  console.log(`📦 In Legacy Catalogs: ${legacyServices.length}`);
  
  if (legacyServices.length > 0) {
    console.log(`\n🗑️  Legacy services that should be removed:`);
    legacyServices.forEach(service => {
      console.log(`   - ID: ${service.id} in ${service.serviceItem.serviceCatalog.name}`);
    });
  }
  
  if (activeITILServices.length > 1) {
    console.log(`\n⚠️  Multiple services in active ITIL catalogs - need manual review:`);
    activeITILServices.forEach(service => {
      console.log(`   - ID: ${service.id} in ${service.serviceItem.serviceCatalog.name} > ${service.serviceItem.name}`);
    });
  }
}

investigateTokenPLNDuplicates().catch(console.error).finally(() => process.exit());