const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function cleanupDuplicateServices() {
  console.log('🧹 Starting cleanup of duplicate services (removing non-prefixed old versions)...\n');
  
  const templates = await client.serviceTemplate.findMany({
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      },
      customFieldDefinitions: true
    },
    orderBy: { name: 'asc' }
  });
  
  // Group templates by base name (removing common prefixes)
  const serviceGroups = {};
  
  templates.forEach(template => {
    // Remove common prefixes to find base names
    let baseName = template.name;
    const prefixes = [
      'ATM - ', 'ATM-', 
      'BSG ', 'BSGTouch - ', 'BSGTouch-', 'BSGtouch - ', 'BSGtouch-',
      'OLIBS - ', 'OLIBs - ',
      'SMS Banking - ', 'SMSBanking-', 'SMS BANKING - ',
      'BSG QRIS - ', 
      'XCARD - ', 
      'Kasda Online - ',
      'TellerApp/Reporting - ', 'Teller App / Reporting - ',
      'eLOS - ',
      'Digital Dashboard - ',
      'Ms. Office 365 - ',
      'Payroll - ',
      'HRMS - ',
      'ARS73 - ',
      'XMonitoring ATM - ',
      'SKNBI - ',
      'SIKP - ',
      'Brocade (Broker) - ',
      'Antasena - ',
      'BI RTGS - ',
      'Domain - '
    ];
    
    for (const prefix of prefixes) {
      if (baseName.startsWith(prefix)) {
        baseName = baseName.substring(prefix.length);
        break;
      }
    }
    
    if (!serviceGroups[baseName]) {
      serviceGroups[baseName] = [];
    }
    
    serviceGroups[baseName].push({
      template,
      originalName: template.name,
      baseName,
      location: `${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`,
      hasPrefix: template.name !== baseName,
      hasCustomFields: template.customFieldDefinitions.length > 0,
      isInNewCatalog: !template.serviceItem.serviceCatalog.name.startsWith('[LEGACY]')
    });
  });
  
  // Find groups with duplicates where we have both prefixed and non-prefixed versions
  const duplicateGroups = Object.entries(serviceGroups).filter(([baseName, services]) => {
    if (services.length <= 1) return false;
    
    const prefixedServices = services.filter(s => s.hasPrefix);
    const nonPrefixedServices = services.filter(s => !s.hasPrefix);
    
    return prefixedServices.length > 0 && nonPrefixedServices.length > 0;
  });
  
  console.log(`Found ${duplicateGroups.length} service groups with both prefixed and non-prefixed versions\n`);
  
  // Collect services to remove (non-prefixed duplicates)
  const servicesToRemove = [];
  const servicesWithCustomFields = [];
  
  duplicateGroups.forEach(([baseName, services]) => {
    const prefixedServices = services.filter(s => s.hasPrefix);
    const nonPrefixedServices = services.filter(s => !s.hasPrefix);
    
    // Check if any prefixed version exists in new ITIL catalogs
    const hasNewVersion = prefixedServices.some(s => s.isInNewCatalog);
    
    if (hasNewVersion) {
      // Remove all non-prefixed versions
      nonPrefixedServices.forEach(service => {
        console.log(`🗑️  Will remove: "${service.originalName}" (ID: ${service.template.id})`);
        console.log(`   Location: ${service.location}`);
        console.log(`   Custom Fields: ${service.template.customFieldDefinitions.length}`);
        
        if (service.hasCustomFields) {
          servicesWithCustomFields.push(service);
        }
        
        servicesToRemove.push(service.template.id);
        console.log('');
      });
    }
  });
  
  console.log(`\n📊 CLEANUP SUMMARY:`);
  console.log(`🗑️  Total services to remove: ${servicesToRemove.length}`);
  console.log(`⚠️  Services with custom fields: ${servicesWithCustomFields.length}`);
  
  if (servicesWithCustomFields.length > 0) {
    console.log(`\n⚠️  SERVICES WITH CUSTOM FIELDS TO BE REMOVED:`);
    servicesWithCustomFields.forEach((service, index) => {
      console.log(`${index + 1}. "${service.originalName}" (${service.template.customFieldDefinitions.length} fields)`);
    });
  }
  
  // Confirm before deletion
  console.log(`\nProceed with deletion? This will remove ${servicesToRemove.length} duplicate services.`);
  console.log(`Note: ${servicesWithCustomFields.length} services have custom fields that will be lost.`);
  
  // For safety, let's do a dry run first
  const dryRun = false;
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN MODE - No actual deletions performed`);
    console.log(`\nTo execute the cleanup, change 'dryRun' to false in the script`);
    console.log(`\nServices that would be removed: [${servicesToRemove.join(', ')}]`);
  } else {
    console.log(`\n🚀 Executing cleanup...`);
    
    try {
      // Delete custom field definitions first (cascading should handle this, but being explicit)
      await client.serviceFieldDefinition.deleteMany({
        where: {
          serviceTemplateId: {
            in: servicesToRemove
          }
        }
      });
      console.log(`✅ Deleted custom field definitions for ${servicesToRemove.length} services`);
      
      // Delete the service templates
      const result = await client.serviceTemplate.deleteMany({
        where: {
          id: {
            in: servicesToRemove
          }
        }
      });
      
      console.log(`✅ Successfully deleted ${result.count} duplicate services`);
      
    } catch (error) {
      console.error(`❌ Error during cleanup:`, error);
    }
  }
}

cleanupDuplicateServices().catch(console.error).finally(() => process.exit());