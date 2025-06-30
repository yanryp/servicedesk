const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function findAndCleanupLegacyDuplicates() {
  console.log('🔍 Finding all services that exist in both ITIL and Legacy catalogs...\n');
  
  // Get all services from active ITIL catalogs
  const itilServices = await client.serviceTemplate.findMany({
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
      },
      customFieldDefinitions: true
    }
  });
  
  console.log(`Found ${itilServices.length} services in active ITIL catalogs`);
  
  // Get all services from legacy catalogs with the same names
  const itilServiceNames = itilServices.map(s => s.name);
  
  const legacyDuplicates = await client.serviceTemplate.findMany({
    where: {
      name: {
        in: itilServiceNames
      },
      serviceItem: {
        serviceCatalog: {
          OR: [
            { isActive: false },
            {
              name: {
                in: ['[LEGACY] Banking Applications - User Management', '[LEGACY] Claims & Transactions - Transfer Services', '[LEGACY] Claims & Transactions - Payment Services', '[LEGACY] Claims & Transactions - Purchase Services', '[LEGACY] KASDA Services', '[LEGACY] Identity & Access Management', '[LEGACY] IT Infrastructure Services', '[LEGACY] OLIBS System', '[LEGACY] BSG Applications', '[LEGACY] ATM Management', '[LEGACY] Core Banking', '[LEGACY] Network & Infrastructure', '[LEGACY] Security & Access', '[LEGACY] Claims & Transactions', '[LEGACY] Hardware & Software']
              }
            }
          ]
        }
      }
    },
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      },
      customFieldDefinitions: true
    }
  });
  
  console.log(`Found ${legacyDuplicates.length} legacy duplicates to remove\n`);
  
  // Group by service name to show what we're removing
  const duplicateGroups = {};
  
  legacyDuplicates.forEach(service => {
    if (!duplicateGroups[service.name]) {
      duplicateGroups[service.name] = [];
    }
    duplicateGroups[service.name].push(service);
  });
  
  console.log(`📋 SERVICES WITH LEGACY DUPLICATES (${Object.keys(duplicateGroups).length} unique services):\n`);
  
  let totalToRemove = 0;
  let totalWithCustomFields = 0;
  
  Object.entries(duplicateGroups).forEach(([serviceName, duplicates]) => {
    console.log(`🔄 "${serviceName}" (${duplicates.length} legacy duplicates):`);
    
    duplicates.forEach(service => {
      console.log(`   🗑️  ID: ${service.id} in ${service.serviceItem.serviceCatalog.name}`);
      console.log(`      Custom Fields: ${service.customFieldDefinitions.length}`);
      if (service.customFieldDefinitions.length > 0) {
        totalWithCustomFields++;
      }
      totalToRemove++;
    });
    console.log('');
  });
  
  console.log(`📊 CLEANUP SUMMARY:`);
  console.log(`🗑️  Total legacy duplicates to remove: ${totalToRemove}`);
  console.log(`⚠️  Services with custom fields: ${totalWithCustomFields}`);
  
  // Execute cleanup
  const dryRun = false; // Set to true for testing
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN MODE - No actual deletions performed`);
    console.log(`Would remove service IDs: [${legacyDuplicates.map(s => s.id).join(', ')}]`);
  } else {
    console.log(`\n🚀 Executing cleanup of legacy duplicates...`);
    
    try {
      // Delete custom field definitions first
      await client.serviceFieldDefinition.deleteMany({
        where: {
          serviceTemplateId: {
            in: legacyDuplicates.map(s => s.id)
          }
        }
      });
      
      // Delete the service templates
      const result = await client.serviceTemplate.deleteMany({
        where: {
          id: {
            in: legacyDuplicates.map(s => s.id)
          }
        }
      });
      
      console.log(`✅ Successfully deleted ${result.count} legacy duplicate services`);
      
      // Verify cleanup
      const remaining = await client.serviceTemplate.findMany({
        where: {
          name: 'ATM-Pembelian Token PLN'
        },
        include: {
          serviceItem: {
            include: {
              serviceCatalog: true
            }
          }
        }
      });
      
      console.log(`\n🔍 Verification - "ATM-Pembelian Token PLN" services remaining: ${remaining.length}`);
      remaining.forEach(service => {
        console.log(`   ✅ ID: ${service.id} in ${service.serviceItem.serviceCatalog.name} (Active: ${service.serviceItem.serviceCatalog.isActive})`);
      });
      
    } catch (error) {
      console.error(`❌ Error during cleanup:`, error);
    }
  }
}

findAndCleanupLegacyDuplicates().catch(console.error).finally(() => process.exit());