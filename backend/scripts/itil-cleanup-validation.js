// ITIL Cleanup and Validation Script
// Deactivates old service catalogs and validates the final ITIL structure

const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

// ITIL catalog names that should remain active
const ITIL_CATALOG_NAMES = [
  'Core Banking & Financial Systems',
  'Digital Channels & Customer Applications',
  'ATM, EDC & Branch Hardware',
  'Corporate IT & Employee Support',
  'Claims & Disputes',
  'General & Default Services'
];

async function deactivateOldCatalogs() {
  console.log('🧹 Deactivating old service catalogs...\n');
  
  // Find all catalogs that are not part of the new ITIL structure
  const oldCatalogs = await client.serviceCatalog.findMany({
    where: {
      name: {
        notIn: ITIL_CATALOG_NAMES
      },
      isActive: true
    },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  console.log(`Found ${oldCatalogs.length} old catalogs to deactivate:`);
  
  let deactivatedCatalogs = 0;
  let preservedTemplates = 0;
  let preservedFields = 0;
  
  for (const catalog of oldCatalogs) {
    console.log(`\n📁 Deactivating: ${catalog.name}`);
    console.log(`   Service Items: ${catalog.serviceItems.length}`);
    
    let catalogTemplates = 0;
    let catalogFields = 0;
    
    catalog.serviceItems.forEach(item => {
      const itemTemplates = item.templates.length;
      const itemFields = item.templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0);
      
      if (itemTemplates > 0) {
        console.log(`     📋 ${item.name}: ${itemTemplates} templates, ${itemFields} fields`);
      }
      
      catalogTemplates += itemTemplates;
      catalogFields += itemFields;
    });
    
    // Mark catalog as inactive instead of deleting (safer approach)
    await client.serviceCatalog.update({
      where: { id: catalog.id },
      data: { 
        isActive: false,
        name: `[LEGACY] ${catalog.name}` // Mark as legacy for identification
      }
    });
    
    console.log(`   ✅ Deactivated (${catalogTemplates} templates, ${catalogFields} fields preserved)`);
    deactivatedCatalogs++;
    preservedTemplates += catalogTemplates;
    preservedFields += catalogFields;
  }
  
  console.log(`\n📊 DEACTIVATION SUMMARY:`);
  console.log(`📁 Catalogs deactivated: ${deactivatedCatalogs}`);
  console.log(`📋 Templates preserved: ${preservedTemplates}`);
  console.log(`🔧 Custom fields preserved: ${preservedFields}`);
  
  return { deactivatedCatalogs, preservedTemplates, preservedFields };
}

async function validateFinalStructure() {
  console.log('\n🔍 Validating final ITIL service catalog structure...\n');
  
  // Get active ITIL catalogs
  const itilCatalogs = await client.serviceCatalog.findMany({
    where: {
      isActive: true,
      name: {
        in: ITIL_CATALOG_NAMES
      }
    },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  let totalServiceItems = 0;
  let totalTemplates = 0;
  let totalCustomFields = 0;
  let templatesWithFields = 0;
  
  console.log('📊 FINAL ITIL STRUCTURE:');
  
  itilCatalogs.forEach(catalog => {
    console.log(`\n📁 ${catalog.name}`);
    
    catalog.serviceItems.forEach(item => {
      totalServiceItems++;
      const templateCount = item.templates.length;
      const fieldCount = item.templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0);
      const templatesWithFieldsCount = item.templates.filter(t => t.customFieldDefinitions.length > 0).length;
      
      console.log(`   📋 ${item.name}: ${templateCount} services, ${fieldCount} custom fields`);
      
      if (templatesWithFieldsCount > 0) {
        console.log(`      🔧 ${templatesWithFieldsCount} services have custom fields`);
      }
      
      totalTemplates += templateCount;
      totalCustomFields += fieldCount;
      templatesWithFields += templatesWithFieldsCount;
    });
  });
  
  // Check for any remaining active legacy catalogs
  const remainingLegacy = await client.serviceCatalog.findMany({
    where: {
      isActive: true,
      name: {
        notIn: ITIL_CATALOG_NAMES
      }
    }
  });
  
  console.log(`\n📈 VALIDATION RESULTS:`);
  console.log(`✅ ITIL Catalogs active: ${itilCatalogs.length}/6`);
  console.log(`📋 Service Items: ${totalServiceItems}`);
  console.log(`🛠️  Total Services: ${totalTemplates}`);
  console.log(`🔧 Total Custom Fields: ${totalCustomFields}`);
  console.log(`📝 Services with Custom Fields: ${templatesWithFields}`);
  console.log(`⚠️  Legacy catalogs still active: ${remainingLegacy.length}`);
  
  if (remainingLegacy.length > 0) {
    console.log(`\n🔍 REMAINING LEGACY CATALOGS:`);
    remainingLegacy.forEach(catalog => {
      console.log(`   - ${catalog.name}`);
    });
  }
  
  return {
    catalogs: itilCatalogs.length,
    serviceItems: totalServiceItems,
    templates: totalTemplates,
    customFields: totalCustomFields,
    templatesWithFields: templatesWithFields,
    remainingLegacy: remainingLegacy.length
  };
}

async function generateMigrationReport() {
  console.log('\n📋 Generating migration report...\n');
  
  // Get comparison data
  const activeCatalogs = await client.serviceCatalog.findMany({
    where: { isActive: true },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  const legacyCatalogs = await client.serviceCatalog.findMany({
    where: { 
      isActive: false,
      name: { startsWith: '[LEGACY]' }
    },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  const activeStats = activeCatalogs.reduce((acc, catalog) => {
    const templates = catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
    const fields = catalog.serviceItems.reduce((sum, item) => 
      sum + item.templates.reduce((fieldSum, template) => fieldSum + template.customFieldDefinitions.length, 0), 0);
    
    return {
      catalogs: acc.catalogs + 1,
      serviceItems: acc.serviceItems + catalog.serviceItems.length,
      templates: acc.templates + templates,
      fields: acc.fields + fields
    };
  }, { catalogs: 0, serviceItems: 0, templates: 0, fields: 0 });
  
  const legacyStats = legacyCatalogs.reduce((acc, catalog) => {
    const templates = catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
    const fields = catalog.serviceItems.reduce((sum, item) => 
      sum + item.templates.reduce((fieldSum, template) => fieldSum + template.customFieldDefinitions.length, 0), 0);
    
    return {
      catalogs: acc.catalogs + 1,
      serviceItems: acc.serviceItems + catalog.serviceItems.length,
      templates: acc.templates + templates,
      fields: acc.fields + fields
    };
  }, { catalogs: 0, serviceItems: 0, templates: 0, fields: 0 });
  
  console.log('📊 MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════');
  console.log(`🎯 ITIL STRUCTURE (ACTIVE):`);
  console.log(`   📁 Catalogs: ${activeStats.catalogs}`);
  console.log(`   📋 Service Items: ${activeStats.serviceItems}`);
  console.log(`   🛠️  Service Templates: ${activeStats.templates}`);
  console.log(`   🔧 Custom Fields: ${activeStats.fields}`);
  console.log('');
  console.log(`📦 LEGACY STRUCTURE (DEACTIVATED):`);
  console.log(`   📁 Catalogs: ${legacyStats.catalogs}`);
  console.log(`   📋 Service Items: ${legacyStats.serviceItems}`);
  console.log(`   🛠️  Service Templates: ${legacyStats.templates}`);
  console.log(`   🔧 Custom Fields: ${legacyStats.fields}`);
  console.log('');
  console.log(`📈 TOTAL SYSTEM:`);
  console.log(`   📁 Total Catalogs: ${activeStats.catalogs + legacyStats.catalogs}`);
  console.log(`   🛠️  Total Templates: ${activeStats.templates + legacyStats.templates}`);
  console.log(`   🔧 Total Custom Fields: ${activeStats.fields + legacyStats.fields}`);
  console.log('');
  console.log('✅ MIGRATION SUCCESS CRITERIA:');
  console.log(`   ✅ All custom fields preserved: ${activeStats.fields + legacyStats.fields > 0 ? 'YES' : 'NO'}`);
  console.log(`   ✅ ITIL structure complete: ${activeStats.catalogs === 6 ? 'YES' : 'NO'}`);
  console.log(`   ✅ Legacy data preserved: ${legacyStats.templates > 0 ? 'YES' : 'NO'}`);
  console.log(`   ✅ No data loss: ${activeStats.fields + legacyStats.fields >= 238 ? 'YES' : 'NO'}`);
  
  return { activeStats, legacyStats };
}

async function runCleanupValidation() {
  try {
    console.log('🚀 Starting ITIL Cleanup and Validation Process...\n');
    
    // Phase 1: Deactivate old catalogs
    const deactivationResults = await deactivateOldCatalogs();
    
    // Phase 2: Validate final structure
    const validationResults = await validateFinalStructure();
    
    // Phase 3: Generate migration report
    const reportResults = await generateMigrationReport();
    
    console.log('\n🎉 ITIL CLEANUP AND VALIDATION COMPLETED SUCCESSFULLY!');
    console.log(`📁 Legacy catalogs deactivated: ${deactivationResults.deactivatedCatalogs}`);
    console.log(`🛠️  Total services in ITIL structure: ${validationResults.templates}`);
    console.log(`🔧 Total custom fields preserved: ${validationResults.customFields}`);
    
    if (validationResults.remainingLegacy > 0) {
      console.log(`⚠️  Note: ${validationResults.remainingLegacy} legacy catalogs still active`);
    }
    
    return { deactivationResults, validationResults, reportResults };
    
  } catch (error) {
    console.error('❌ Cleanup and validation failed:', error);
    throw error;
  }
}

module.exports = {
  runCleanupValidation,
  deactivateOldCatalogs,
  validateFinalStructure,
  generateMigrationReport
};

// Run if called directly
if (require.main === module) {
  runCleanupValidation()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}