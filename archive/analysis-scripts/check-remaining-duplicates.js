const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function checkForRemainingDuplicates() {
  console.log('🔍 Checking for any remaining duplicates...\n');
  
  const templates = await client.serviceTemplate.findMany({
    where: {
      serviceItem: {
        serviceCatalog: {
          isActive: true,
          name: {
            notIn: ['[LEGACY] Banking Applications - User Management', '[LEGACY] Claims & Transactions - Transfer Services', '[LEGACY] Claims & Transactions - Payment Services', '[LEGACY] Claims & Transactions - Purchase Services', '[LEGACY] KASDA Services', '[LEGACY] Identity & Access Management', '[LEGACY] IT Infrastructure Services', '[LEGACY] OLIBS System', '[LEGACY] BSG Applications', '[LEGACY] ATM Management', '[LEGACY] Core Banking', '[LEGACY] Network & Infrastructure', '[LEGACY] Security & Access', '[LEGACY] Claims & Transactions', '[LEGACY] Hardware & Software']
          }
        }
      }
    },
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  // Group by service name to find any remaining duplicates
  const serviceGroups = {};
  
  templates.forEach(template => {
    if (!serviceGroups[template.name]) {
      serviceGroups[template.name] = [];
    }
    
    serviceGroups[template.name].push({
      id: template.id,
      name: template.name,
      location: `${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`
    });
  });
  
  const duplicates = Object.entries(serviceGroups).filter(([name, services]) => services.length > 1);
  
  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} remaining duplicates:`);
    duplicates.forEach(([name, services]) => {
      console.log(`🔄 "${name}" (${services.length} instances):`);
      services.forEach(service => {
        console.log(`   - ID: ${service.id}, Location: ${service.location}`);
      });
      console.log('');
    });
  } else {
    console.log('✅ No duplicates found in active ITIL catalogs!');
    console.log(`📊 Total unique services: ${Object.keys(serviceGroups).length}`);
  }
}

checkForRemainingDuplicates().catch(console.error).finally(() => process.exit());