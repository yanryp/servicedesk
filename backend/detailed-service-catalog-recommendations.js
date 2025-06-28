const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function generateDetailedRecommendations() {
  console.log('🎯 DETAILED SERVICE CATALOG REMEDIATION PLAN');
  console.log('='.repeat(80));

  try {
    // Get all service catalogs with their details
    const serviceCatalogs = await prisma.serviceCatalog.findMany({
      include: {
        department: true,
        serviceItems: {
          include: {
            templates: true
          }
        }
      },
      orderBy: [
        { departmentId: 'asc' },
        { name: 'asc' }
      ]
    });

    const allServiceItems = serviceCatalogs.flatMap(catalog => 
      catalog.serviceItems.map(item => ({
        ...item,
        catalogName: catalog.name,
        departmentName: catalog.department.name,
        catalogId: catalog.id
      }))
    );

    // 1. DETAILED DUPLICATE ANALYSIS
    console.log('\n📋 DETAILED DUPLICATE SERVICE ANALYSIS:');
    console.log('='.repeat(60));

    const serviceGroups = {};
    allServiceItems.forEach(service => {
      const normalizedName = service.name.toLowerCase().trim();
      if (!serviceGroups[normalizedName]) {
        serviceGroups[normalizedName] = [];
      }
      serviceGroups[normalizedName].push(service);
    });

    const duplicates = Object.entries(serviceGroups).filter(([name, services]) => services.length > 1);
    
    duplicates.forEach(([serviceName, services], index) => {
      console.log(`\n${index + 1}. 🔄 DUPLICATE: "${serviceName.toUpperCase()}"`);
      console.log(`   Found in ${services.length} catalogs:`);
      
      services.forEach((service, i) => {
        console.log(`   ${String.fromCharCode(97 + i)}. Catalog: "${service.catalogName}" (ID: ${service.catalogId})`);
        console.log(`      Department: ${service.departmentName}`);
        console.log(`      Service ID: ${service.id}`);
        console.log(`      Templates: ${service.templates ? service.templates.length : 0}`);
      });

      // Provide specific recommendations
      console.log(`   💡 RECOMMENDATION:`);
      if (serviceName.includes('templates')) {
        console.log(`      → Consolidate all "${serviceName}" into ONE master catalog`);
        console.log(`      → Recommended location: "IT Infrastructure Services" catalog`);
        console.log(`      → Keep the template with the most comprehensive field definitions`);
      } else if (serviceName === 'general services') {
        console.log(`      → This is a design anti-pattern. Replace with specific service names:`);
        console.log(`      → "Account Management", "User Access Request", "Password Reset", etc.`);
      } else {
        console.log(`      → Keep only in the most appropriate catalog for the primary business function`);
        console.log(`      → Archive or redirect others to avoid user confusion`);
      }
    });

    // 2. EMPTY CATALOG ANALYSIS
    console.log('\n\n🗂️  EMPTY CATALOG REMEDIATION:');
    console.log('='.repeat(60));

    const emptyCatalogs = serviceCatalogs.filter(catalog => catalog.serviceItems.length === 0);
    if (emptyCatalogs.length > 0) {
      emptyCatalogs.forEach((catalog, index) => {
        console.log(`\n${index + 1}. 📁 EMPTY: "${catalog.name}" (ID: ${catalog.id})`);
        console.log(`   Department: ${catalog.department.name}`);
        console.log(`   Service Type: ${catalog.serviceType}`);
        console.log(`   💡 ACTIONS:`);
        
        if (catalog.name === 'Claims & Transactions') {
          console.log(`      → DELETE this catalog - it's redundant`);
          console.log(`      → Sub-catalogs already exist for Transfer/Payment/Purchase Services`);
          console.log(`      → SQL: DELETE FROM service_catalog WHERE id = ${catalog.id};`);
        } else {
          console.log(`      → Either populate with relevant services OR delete if not needed`);
        }
      });
    }

    // 3. SERVICES WITHOUT CLEAR PREFIXES - DETAILED ANALYSIS
    console.log('\n\n🏷️  SERVICES NEEDING APP/SYSTEM PREFIXES:');
    console.log('='.repeat(60));

    const servicesWithoutPrefix = [];
    allServiceItems.forEach(service => {
      const nameParts = service.name.split(/[\s-_:]/);
      const potentialPrefix = nameParts[0].toLowerCase();
      
      const commonWords = ['new', 'create', 'add', 'update', 'delete', 'edit', 'view', 'manage', 'admin', 'user', 'system', 'service'];
      const isPrefix = potentialPrefix.length >= 3 && !commonWords.includes(potentialPrefix) && 
                      (potentialPrefix.includes('app') || potentialPrefix.includes('sys') || 
                       potentialPrefix.match(/^[a-z]{3,8}$/) || potentialPrefix.includes('web'));
      
      if (!isPrefix && !service.name.toLowerCase().includes('templates')) {
        servicesWithoutPrefix.push(service);
      }
    });

    // Group by catalog for better organization
    const servicesByCatalog = {};
    servicesWithoutPrefix.forEach(service => {
      if (!servicesByCatalog[service.catalogName]) {
        servicesByCatalog[service.catalogName] = [];
      }
      servicesByCatalog[service.catalogName].push(service);
    });

    Object.entries(servicesByCatalog).forEach(([catalogName, services]) => {
      console.log(`\n📂 CATALOG: "${catalogName}"`);
      
      services.forEach((service, index) => {
        console.log(`   ${index + 1}. "${service.name}" (ID: ${service.id})`);
        
        // Provide specific naming recommendations
        let recommendation = '';
        if (service.name.toLowerCase().includes('smsbanking')) {
          recommendation = `SMS-${service.name.replace(/smsbanking[-_]?/i, '').trim()}`;
        } else if (service.name.toLowerCase().includes('maintenance')) {
          recommendation = `INFRA-${service.name}`;
        } else if (service.name.toLowerCase().includes('permintaan')) {
          recommendation = `REQ-${service.name.replace(/permintaan\s*/i, '').trim()}`;
        } else if (service.name.toLowerCase().includes('gangguan')) {
          recommendation = `INC-${service.name.replace(/gangguan\s*/i, '').trim()}`;
        } else if (service.name.toLowerCase().includes('pembukaan') || service.name.toLowerCase().includes('penutupan')) {
          recommendation = `OPS-${service.name}`;
        } else if (service.name.toLowerCase().includes('bi ') || service.name.toLowerCase().includes('rtgs') || service.name.toLowerCase().includes('fast')) {
          recommendation = `BANKID-${service.name}`;
        } else {
          recommendation = `APP-${service.name}`;
        }
        
        console.log(`      💡 Suggested rename: "${recommendation}"`);
      });
    });

    // 4. ITIL SERVICE HIERARCHY VIOLATIONS
    console.log('\n\n🏗️  ITIL SERVICE HIERARCHY ANALYSIS:');
    console.log('='.repeat(60));

    console.log('\n❌ CURRENT ISSUES:');
    console.log('1. No proper Business vs Technical service separation');
    console.log('2. Mixed abstraction levels in same catalog');
    console.log('3. No clear service ownership hierarchy');

    console.log('\n✅ RECOMMENDED ITIL-COMPLIANT STRUCTURE:');
    console.log(`
📊 BUSINESS SERVICES (What customers see/use):
├── 💳 Card Services
│   ├── ATM Services (combine all ATM-*)
│   ├── Debit Card Management
│   └── Card Transaction Support
├── 🏦 Digital Banking
│   ├── Mobile Banking (BSGTouch)
│   ├── SMS Banking (combine all SMS*)
│   ├── Online Banking (OLIBS)
│   └── Direct Banking (BSG Direct)
├── 💰 Payment & Transfer Services
│   ├── Government Payments (Samsat, PBB, etc.)
│   ├── Utility Payments (PLN, PSTN, etc.)
│   ├── Bank Transfers
│   └── Merchant Payments (QRIS)
├── 🏛️ Government Services
│   ├── KASDA Services
│   ├── Treasury Management
│   └── Budget Management

🔧 SUPPORTING SERVICES (Internal IT services):
├── 💻 Application Support
│   ├── Core Banking Support
│   ├── Mobile App Support
│   └── Web Application Support
├── 🌐 Infrastructure Services
│   ├── Network Services
│   ├── Server Management
│   └── Security Services
├── 👥 User Management
│   ├── Access Control
│   ├── Identity Management
│   └── Account Management
`);

    // 5. SPECIFIC MIGRATION PLAN
    console.log('\n\n📋 STEP-BY-STEP REMEDIATION PLAN:');
    console.log('='.repeat(60));

    console.log(`
🎯 PHASE 1: CLEANUP (Week 1)
1. Delete empty "Claims & Transactions" catalog
2. Archive duplicate services, keep only the most complete version
3. Standardize all service names with proper prefixes

🎯 PHASE 2: RESTRUCTURE (Week 2-3)
1. Create new ITIL-compliant catalog structure
2. Migrate services to appropriate business/technical catalogs
3. Update service descriptions and business impact classifications

🎯 PHASE 3: VALIDATION (Week 4)
1. Test all migrated services and templates
2. Update user documentation and training materials
3. Monitor for any broken workflows or missing services

📝 DETAILED ACTIONS:
`);

    // Generate specific SQL commands for cleanup
    console.log('\n💻 SQL CLEANUP COMMANDS:');
    console.log('-- 1. Remove empty catalog');
    const emptyCatalog = emptyCatalogs[0];
    if (emptyCatalog) {
      console.log(`DELETE FROM service_catalog WHERE id = ${emptyCatalog.id};`);
    }

    console.log('\n-- 2. Remove duplicate services (keep first occurrence)');
    duplicates.forEach(([serviceName, services]) => {
      if (services.length > 1) {
        // Keep the first service, delete others
        services.slice(1).forEach(service => {
          console.log(`-- Delete duplicate: ${service.name} from ${service.catalogName}`);
          console.log(`DELETE FROM service_items WHERE id = ${service.id};`);
        });
      }
    });

    // 6. MONITORING AND GOVERNANCE
    console.log('\n\n📊 ONGOING GOVERNANCE RECOMMENDATIONS:');
    console.log('='.repeat(60));

    console.log(`
🔍 MONITORING:
- Monthly review of new services to ensure proper naming
- Quarterly audit of service catalog completeness
- Annual ITIL compliance assessment

📝 GOVERNANCE:
- All new services must follow APP-ServiceName format
- Business services must have clear business impact classification
- Technical services must have defined SLAs and support procedures
- Service catalog changes require IT management approval

📋 QUALITY METRICS:
- Services with proper prefixes: Target 95%
- Empty catalogs: Target 0
- Duplicate services: Target 0
- Services with business impact defined: Target 100%
`);

    console.log('\n✅ ANALYSIS AND RECOMMENDATIONS COMPLETE!');

  } catch (error) {
    console.error('Error generating detailed recommendations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the detailed analysis
generateDetailedRecommendations();