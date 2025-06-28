const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeServiceCatalogStructure() {
  console.log('🔍 Analyzing Service Catalog Structure for ITIL Compliance');
  console.log('=' .repeat(70));

  try {
    // 1. Get all service catalogs with their departments and service items
    const serviceCatalogs = await prisma.serviceCatalog.findMany({
      include: {
        department: true,
        serviceItems: {
          include: {
            templates: true
          }
        },
        parent: true,
        children: true
      },
      orderBy: [
        { departmentId: 'asc' },
        { name: 'asc' }
      ]
    });

    // 2. Get all departments
    const departments = await prisma.department.findMany({
      include: {
        serviceCatalog: {
          include: {
            serviceItems: true
          }
        }
      }
    });

    console.log(`\n📊 OVERVIEW:`);
    console.log(`Total Departments: ${departments.length}`);
    console.log(`Total Service Catalogs: ${serviceCatalogs.length}`);
    console.log(`Total Service Items: ${serviceCatalogs.reduce((sum, catalog) => sum + catalog.serviceItems.length, 0)}`);

    // 3. Analyze empty catalogs
    console.log(`\n🔍 EMPTY CATALOGS (0 Service Items):`);
    const emptyCatalogs = serviceCatalogs.filter(catalog => catalog.serviceItems.length === 0);
    if (emptyCatalogs.length > 0) {
      emptyCatalogs.forEach(catalog => {
        console.log(`  ❌ ${catalog.department.name} - "${catalog.name}" (ID: ${catalog.id}) - ${catalog.serviceItems.length} items`);
      });
    } else {
      console.log(`  ✅ No empty catalogs found`);
    }

    // 4. Analyze service catalog hierarchy
    console.log(`\n🏗️  SERVICE CATALOG HIERARCHY:`);
    const parentCatalogs = serviceCatalogs.filter(catalog => catalog.parentId === null);
    const childCatalogs = serviceCatalogs.filter(catalog => catalog.parentId !== null);
    console.log(`  Parent Catalogs: ${parentCatalogs.length}`);
    console.log(`  Child Catalogs: ${childCatalogs.length}`);

    // 5. Group services by application/system prefix
    console.log(`\n🔍 SERVICE NAMING ANALYSIS (App/System Prefixes):`);
    const allServiceItems = serviceCatalogs.flatMap(catalog => 
      catalog.serviceItems.map(item => ({
        ...item,
        catalogName: catalog.name,
        departmentName: catalog.department.name
      }))
    );

    const servicesByPrefix = {};
    const servicesWithoutPrefix = [];
    
    allServiceItems.forEach(service => {
      const nameParts = service.name.split(/[\s-_:]/);
      const potentialPrefix = nameParts[0].toLowerCase();
      
      // Check if it looks like an app/system prefix (3+ chars, no common words)
      const commonWords = ['new', 'create', 'add', 'update', 'delete', 'edit', 'view', 'manage', 'admin', 'user', 'system', 'service'];
      const isPrefix = potentialPrefix.length >= 3 && !commonWords.includes(potentialPrefix) && 
                      (potentialPrefix.includes('app') || potentialPrefix.includes('sys') || 
                       potentialPrefix.match(/^[a-z]{3,8}$/) || potentialPrefix.includes('web'));
      
      if (isPrefix) {
        if (!servicesByPrefix[potentialPrefix]) {
          servicesByPrefix[potentialPrefix] = [];
        }
        servicesByPrefix[potentialPrefix].push(service);
      } else {
        servicesWithoutPrefix.push(service);
      }
    });

    console.log(`\n📋 SERVICES BY APPLICATION/SYSTEM PREFIX:`);
    Object.entries(servicesByPrefix).forEach(([prefix, services]) => {
      console.log(`\n  🏷️  ${prefix.toUpperCase()}: ${services.length} services`);
      services.forEach(service => {
        console.log(`    - ${service.name} (${service.departmentName} - ${service.catalogName})`);
      });
    });

    console.log(`\n⚠️  SERVICES WITHOUT CLEAR APP PREFIX (${servicesWithoutPrefix.length}):`);
    servicesWithoutPrefix.forEach(service => {
      console.log(`  - ${service.name} (${service.departmentName} - ${service.catalogName})`);
    });

    // 6. Find duplicate/similar services across catalogs
    console.log(`\n🔍 DUPLICATE/SIMILAR SERVICES ACROSS CATALOGS:`);
    const serviceNames = {};
    allServiceItems.forEach(service => {
      const normalizedName = service.name.toLowerCase().trim();
      if (!serviceNames[normalizedName]) {
        serviceNames[normalizedName] = [];
      }
      serviceNames[normalizedName].push(service);
    });

    const duplicates = Object.entries(serviceNames).filter(([name, services]) => services.length > 1);
    if (duplicates.length > 0) {
      duplicates.forEach(([name, services]) => {
        console.log(`\n  ⚠️  "${name}" appears in ${services.length} places:`);
        services.forEach(service => {
          console.log(`    - ${service.departmentName} - ${service.catalogName}`);
        });
      });
    } else {
      console.log(`  ✅ No exact duplicate service names found`);
    }

    // 7. ITIL Service Type Analysis
    console.log(`\n🎯 ITIL SERVICE TYPE ANALYSIS:`);
    const serviceTypeStats = {};
    serviceCatalogs.forEach(catalog => {
      if (!serviceTypeStats[catalog.serviceType]) {
        serviceTypeStats[catalog.serviceType] = {
          count: 0,
          services: 0,
          departments: new Set()
        };
      }
      serviceTypeStats[catalog.serviceType].count++;
      serviceTypeStats[catalog.serviceType].services += catalog.serviceItems.length;
      serviceTypeStats[catalog.serviceType].departments.add(catalog.department.name);
    });

    Object.entries(serviceTypeStats).forEach(([type, stats]) => {
      console.log(`\n  📊 ${type.toUpperCase()}:`);
      console.log(`    Catalogs: ${stats.count}`);
      console.log(`    Total Services: ${stats.services}`);
      console.log(`    Departments: ${stats.departments.size} (${Array.from(stats.departments).join(', ')})`);
    });

    // 8. Department Service Distribution
    console.log(`\n🏢 SERVICE DISTRIBUTION BY DEPARTMENT:`);
    departments.forEach(dept => {
      const totalCatalogs = dept.serviceCatalog.length;
      const totalServices = dept.serviceCatalog.reduce((sum, catalog) => sum + catalog.serviceItems.length, 0);
      console.log(`\n  🏢 ${dept.name}:`);
      console.log(`    Catalogs: ${totalCatalogs}`);
      console.log(`    Services: ${totalServices}`);
      console.log(`    Type: ${dept.departmentType}`);
      console.log(`    Service Owner: ${dept.isServiceOwner ? 'Yes' : 'No'}`);
      
      if (totalCatalogs > 0) {
        dept.serviceCatalog.forEach(catalog => {
          console.log(`      - ${catalog.name} (${catalog.serviceType}, ${catalog.serviceItems.length} services)`);
        });
      }
    });

    // 9. Service Templates Analysis
    console.log(`\n📋 SERVICE TEMPLATES ANALYSIS:`);
    const templatesStats = {
      totalTemplates: 0,
      servicesWithTemplates: 0,
      servicesWithoutTemplates: 0,
      templateTypes: {}
    };

    allServiceItems.forEach(service => {
      if (service.templates && service.templates.length > 0) {
        templatesStats.servicesWithTemplates++;
        templatesStats.totalTemplates += service.templates.length;
        
        service.templates.forEach(template => {
          if (!templatesStats.templateTypes[template.templateType]) {
            templatesStats.templateTypes[template.templateType] = 0;
          }
          templatesStats.templateTypes[template.templateType]++;
        });
      } else {
        templatesStats.servicesWithoutTemplates++;
      }
    });

    console.log(`  Services with templates: ${templatesStats.servicesWithTemplates}`);
    console.log(`  Services without templates: ${templatesStats.servicesWithoutTemplates}`);
    console.log(`  Total templates: ${templatesStats.totalTemplates}`);
    console.log(`  Template types:`);
    Object.entries(templatesStats.templateTypes).forEach(([type, count]) => {
      console.log(`    - ${type}: ${count}`);
    });

    // 10. ITIL Compliance Issues Summary
    console.log(`\n🚨 ITIL COMPLIANCE ISSUES SUMMARY:`);
    console.log(`=' .repeat(50)`);
    
    const issues = [];
    
    if (emptyCatalogs.length > 0) {
      issues.push(`${emptyCatalogs.length} empty catalogs found`);
    }
    
    if (servicesWithoutPrefix.length > 0) {
      issues.push(`${servicesWithoutPrefix.length} services without clear app/system identification`);
    }
    
    if (duplicates.length > 0) {
      issues.push(`${duplicates.length} sets of duplicate service names across catalogs`);
    }
    
    if (templatesStats.servicesWithoutTemplates > 0) {
      issues.push(`${templatesStats.servicesWithoutTemplates} services without templates`);
    }
    
    // Check for proper ITIL service categorization
    const businessServices = serviceCatalogs.filter(c => c.serviceType === 'business_service').length;
    const technicalServices = serviceCatalogs.filter(c => c.serviceType === 'technical_service').length;
    const governmentServices = serviceCatalogs.filter(c => c.serviceType === 'government_service').length;
    
    if (businessServices === 0) {
      issues.push('No business services defined (ITIL requires business service catalog)');
    }
    
    if (technicalServices === 0) {
      issues.push('No technical services defined (ITIL recommends technical service catalog)');
    }

    if (issues.length > 0) {
      issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ⚠️  ${issue}`);
      });
    } else {
      console.log(`  ✅ No major ITIL compliance issues found`);
    }

    // 11. Recommendations
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log(`=' .repeat(50)`);
    
    const recommendations = [];
    
    if (emptyCatalogs.length > 0) {
      recommendations.push('Remove empty catalogs or populate them with relevant services');
    }
    
    if (servicesWithoutPrefix.length > 10) {
      recommendations.push('Implement consistent naming convention with application/system prefixes');
    }
    
    if (duplicates.length > 0) {
      recommendations.push('Consolidate duplicate services into a single catalog or clearly differentiate them');
    }
    
    recommendations.push('Implement proper ITIL service hierarchy: Business Services → Supporting Services → Technical Services');
    recommendations.push('Ensure each service has proper business impact classification');
    recommendations.push('Create service templates for all services to ensure consistency');
    
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. 💡 ${rec}`);
    });

    console.log(`\n✅ Analysis complete!`);

  } catch (error) {
    console.error('Error analyzing service catalog structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeServiceCatalogStructure();