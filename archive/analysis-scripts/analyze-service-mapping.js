const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function analyzeCurrentStructure() {
  console.log('=== CURRENT SERVICE CATALOG ANALYSIS ===\n');
  
  const catalogs = await client.serviceCatalog.findMany({
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: {
                orderBy: { sortOrder: 'asc' }
              }
            }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });
  
  let totalServices = 0;
  let servicesWithFields = 0;
  let totalFields = 0;
  let serviceMapping = {};
  
  catalogs.forEach(catalog => {
    console.log(`📁 ${catalog.name}`);
    console.log(`   Department ID: ${catalog.departmentId}`);
    
    if (catalog.serviceItems.length === 0) {
      console.log(`   ⚠️  EMPTY CATALOG - 0 service items`);
    }
    
    catalog.serviceItems.forEach(item => {
      totalServices++;
      console.log(`   📋 ${item.name}`);
      
      // Track all services for mapping
      if (!serviceMapping[item.name]) {
        serviceMapping[item.name] = [];
      }
      serviceMapping[item.name].push(catalog.name);
      
      item.templates.forEach(template => {
        if (template.customFieldDefinitions.length > 0) {
          servicesWithFields++;
          totalFields += template.customFieldDefinitions.length;
          console.log(`       🔧 Template: ${template.name} (${template.customFieldDefinitions.length} fields)`);
        }
      });
    });
    console.log('');
  });
  
  console.log('\n=== REDUNDANCY ANALYSIS ===');
  const duplicateServices = Object.entries(serviceMapping).filter(([name, catalogs]) => catalogs.length > 1);
  duplicateServices.forEach(([serviceName, catalogNames]) => {
    console.log(`🔄 DUPLICATE: "${serviceName}" appears in: ${catalogNames.join(', ')}`);
  });
  
  console.log('\n=== SERVICES WITHOUT APP PREFIXES ===');
  const servicesWithoutPrefixes = Object.keys(serviceMapping).filter(serviceName => {
    // Check if service doesn't start with an app/system name
    const hasPrefix = /^(OLIBS|BSG|ATM|SMS|Kasda|XCARD|eLOS|HRMS|Digital|Portal|XReport|ARS73|MIS|SIKP|SKNBI|SLIK|BI |Antasena|Brocade|Finnet|MPN|PSAK|Report|Switching|E-Dapem|Error|KMS|OBOX|Payroll|Teller|XLink|XMonitoring|Card|Gangguan|Network|Maintenance|Permintaan|Surat|Technical|Memo|Formulir|Pendaftaran|Penggantian|Perubahan|Penutupan|Default|Hasil|Samsat|Keamanan) /i.test(serviceName);
    return !hasPrefix;
  });
  
  servicesWithoutPrefixes.forEach(serviceName => {
    console.log(`❓ NO PREFIX: "${serviceName}"`);
  });
  
  console.log('\n=== SUMMARY ===');
  console.log(`Total Catalogs: ${catalogs.length}`);
  console.log(`Total Services: ${totalServices}`);
  console.log(`Duplicate Services: ${duplicateServices.length}`);
  console.log(`Services without App Prefixes: ${servicesWithoutPrefixes.length}`);
  console.log(`Services with Custom Fields: ${servicesWithFields}`);
  console.log(`Total Custom Fields: ${totalFields}`);
  console.log(`Empty Catalogs: ${catalogs.filter(c => c.serviceItems.length === 0).length}`);
}

analyzeCurrentStructure().catch(console.error).finally(() => process.exit());