const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function findDuplicateServices() {
  console.log('🔍 Checking for duplicate services (prefixed vs non-prefixed)...\n');
  
  const templates = await client.serviceTemplate.findMany({
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
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
      location: `${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`
    });
  });
  
  // Find groups with duplicates
  const duplicateGroups = Object.entries(serviceGroups).filter(([baseName, services]) => services.length > 1);
  
  console.log(`📊 Found ${duplicateGroups.length} base service names with duplicates:\n`);
  
  duplicateGroups.forEach(([baseName, services]) => {
    console.log(`🔄 Base Name: "${baseName}" (${services.length} versions)`);
    
    services.forEach((service, index) => {
      const hasPrefix = service.originalName !== service.baseName;
      const status = hasPrefix ? '✅ PREFIXED (NEW)' : '❌ NON-PREFIXED (OLD)';
      
      console.log(`   ${index + 1}. "${service.originalName}" - ${status}`);
      console.log(`      Location: ${service.location}`);
      console.log(`      ID: ${service.template.id}`);
      console.log(`      Active: ${service.template.isVisible}`);
    });
    console.log('');
  });
  
  // Summary of old services to remove
  const oldServices = [];
  duplicateGroups.forEach(([baseName, services]) => {
    const prefixedServices = services.filter(s => s.originalName !== s.baseName);
    const nonPrefixedServices = services.filter(s => s.originalName === s.baseName);
    
    // Only flag for removal if there are both prefixed and non-prefixed versions
    if (prefixedServices.length > 0 && nonPrefixedServices.length > 0) {
      oldServices.push(...nonPrefixedServices);
    }
  });
  
  console.log(`📋 CLEANUP SUMMARY:`);
  console.log(`🗑️  Old services to remove: ${oldServices.length}`);
  
  if (oldServices.length > 0) {
    console.log(`\nOLD SERVICES TO REMOVE:`);
    oldServices.forEach((service, index) => {
      console.log(`${index + 1}. "${service.originalName}" (ID: ${service.template.id})`);
      console.log(`   Location: ${service.location}`);
    });
    
    // Generate cleanup script
    console.log(`\n📝 CLEANUP SCRIPT:`);
    console.log(`// Run this to remove duplicate old services without prefixes`);
    console.log(`const servicesToRemove = [${oldServices.map(s => s.template.id).join(', ')}];`);
    console.log(`// Use: await prisma.serviceTemplate.deleteMany({ where: { id: { in: servicesToRemove } } });`);
  }
}

findDuplicateServices().catch(console.error).finally(() => process.exit());