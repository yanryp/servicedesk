// analyze-service-catalog.js
// Comprehensive BSG Service Catalog Analysis Script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeServiceCatalog() {
  try {
    console.log('🔍 Analyzing BSG Service Catalog Structure...\n');

    // 1. Get all service catalog categories
    const catalogCategories = await prisma.serviceCatalog.findMany({
      include: {
        department: true,
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
      orderBy: {
        name: 'asc'
      }
    });

    let totalServices = 0;
    let totalTemplates = 0;
    let totalFields = 0;
    const departmentBreakdown = {};
    const catalogStructure = {};

    console.log('📊 SERVICE CATALOG ANALYSIS RESULTS\n');
    console.log('=' * 60);

    // 2. Analyze each category
    catalogCategories.forEach((category, index) => {
      console.log(`\n${index + 1}. CATEGORY: ${category.name}`);
      console.log(`   ID: ${category.id}`);
      console.log(`   Department: ${category.department ? category.department.name : 'N/A'}`);
      console.log(`   Description: ${category.description || 'N/A'}`);
      console.log(`   Services Count: ${category.serviceItems.length}`);

      // Track department breakdown
      const deptName = category.department ? category.department.name : 'Unassigned';
      if (!departmentBreakdown[deptName]) {
        departmentBreakdown[deptName] = {
          categories: 0,
          services: 0,
          templates: 0
        };
      }
      departmentBreakdown[deptName].categories++;
      departmentBreakdown[deptName].services += category.serviceItems.length;

      // Store structured data
      catalogStructure[category.name] = {
        id: category.id,
        department: deptName,
        description: category.description,
        services: []
      };

      // 3. Analyze services in each category
      if (category.serviceItems.length > 0) {
        console.log(`\n   SERVICES IN ${category.name}:`);
        
        category.serviceItems.forEach((service, serviceIndex) => {
          console.log(`   ${serviceIndex + 1}. ${service.name} (ID: ${service.id})`);
          console.log(`      Description: ${service.description || 'N/A'}`);
          console.log(`      Request Type: ${service.requestType || 'N/A'}`);
          console.log(`      KASDA Related: ${service.isKasdaRelated ? 'Yes' : 'No'}`);
          console.log(`      Gov Approval Required: ${service.requiresGovApproval ? 'Yes' : 'No'}`);
          console.log(`      Templates: ${service.templates.length}`);
          
          totalServices++;
          totalTemplates += service.templates.length;
          departmentBreakdown[deptName].templates += service.templates.length;

          // Store service data
          const serviceData = {
            id: service.id,
            name: service.name,
            description: service.description,
            requestType: service.requestType,
            isKasdaRelated: service.isKasdaRelated,
            requiresGovApproval: service.requiresGovApproval,
            templates: []
          };

          // 4. Analyze templates for each service
          service.templates.forEach((template, templateIndex) => {
            console.log(`         Template ${templateIndex + 1}: ${template.name || 'Unnamed'}`);
            console.log(`         Fields: ${template.customFieldDefinitions.length}`);
            console.log(`         KASDA Template: ${template.isKasdaTemplate ? 'Yes' : 'No'}`);
            console.log(`         Business Approval: ${template.requiresBusinessApproval ? 'Yes' : 'No'}`);
            
            totalFields += template.customFieldDefinitions.length;

            // Store template data
            serviceData.templates.push({
              id: template.id,
              name: template.name,
              description: template.description,
              templateType: template.templateType,
              isKasdaTemplate: template.isKasdaTemplate,
              requiresBusinessApproval: template.requiresBusinessApproval,
              fieldsCount: template.customFieldDefinitions.length,
              fields: template.customFieldDefinitions.map(field => ({
                id: field.id,
                name: field.name,
                type: field.type,
                required: field.required,
                options: field.options
              }))
            });
          });

          catalogStructure[category.name].services.push(serviceData);
        });
      }
    });

    // 5. Generate summary statistics
    console.log('\n' + '=' * 60);
    console.log('📈 SUMMARY STATISTICS');
    console.log('=' * 60);
    console.log(`Total Categories: ${catalogCategories.length}`);
    console.log(`Total Services: ${totalServices}`);
    console.log(`Total Templates: ${totalTemplates}`);
    console.log(`Total Fields: ${totalFields}`);

    // 6. Department breakdown
    console.log('\n📋 DEPARTMENT BREAKDOWN');
    console.log('-' * 40);
    Object.entries(departmentBreakdown).forEach(([dept, stats]) => {
      console.log(`${dept}:`);
      console.log(`  Categories: ${stats.categories}`);
      console.log(`  Services: ${stats.services}`);
      console.log(`  Templates: ${stats.templates}`);
      console.log('');
    });

    // 7. Generate testing checklist data
    console.log('\n🧪 TESTING CHECKLIST PREPARATION');
    console.log('-' * 40);
    
    const testingData = {
      totalCategories: catalogCategories.length,
      totalServices: totalServices,
      totalTemplates: totalTemplates,
      structure: catalogStructure,
      departments: departmentBreakdown,
      servicesByCategory: {}
    };

    // Prepare service list for testing
    catalogCategories.forEach(category => {
      testingData.servicesByCategory[category.name] = category.serviceItems.map(service => ({
        id: service.id,
        name: service.name,
        templateCount: service.templates.length,
        hasCustomFields: service.templates.some(t => t.customFieldDefinitions.length > 0),
        isKasdaRelated: service.isKasdaRelated,
        requiresGovApproval: service.requiresGovApproval,
        requiresBusinessApproval: service.templates.some(t => t.requiresBusinessApproval)
      }));
    });

    // 8. Save analysis to file
    const fs = require('fs');
    const analysisData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCategories: catalogCategories.length,
        totalServices: totalServices,
        totalTemplates: totalTemplates,
        totalFields: totalFields
      },
      departmentBreakdown,
      catalogStructure,
      testingData
    };

    fs.writeFileSync('service-catalog-analysis.json', JSON.stringify(analysisData, null, 2));
    console.log('\n💾 Analysis saved to: service-catalog-analysis.json');

    // 9. Generate specific insights
    console.log('\n🔍 KEY INSIGHTS FOR TESTING');
    console.log('-' * 40);
    
    // Services with most templates
    const servicesWithMostTemplates = [];
    catalogCategories.forEach(category => {
      category.serviceItems.forEach(service => {
        if (service.templates.length > 0) {
          servicesWithMostTemplates.push({
            name: service.name,
            category: category.name,
            templateCount: service.templates.length
          });
        }
      });
    });
    
    servicesWithMostTemplates.sort((a, b) => b.templateCount - a.templateCount);
    console.log('Top 5 services with most templates:');
    servicesWithMostTemplates.slice(0, 5).forEach((service, index) => {
      console.log(`${index + 1}. ${service.name} (${service.category}) - ${service.templateCount} templates`);
    });

    // Services requiring special attention
    const specialServices = [];
    catalogCategories.forEach(category => {
      category.serviceItems.forEach(service => {
        if (service.isKasdaRelated || service.requiresGovApproval || service.templates.some(t => t.requiresBusinessApproval)) {
          specialServices.push({
            name: service.name,
            category: category.name,
            kasda: service.isKasdaRelated,
            govApproval: service.requiresGovApproval,
            businessApproval: service.templates.some(t => t.requiresBusinessApproval)
          });
        }
      });
    });

    if (specialServices.length > 0) {
      console.log('\nServices requiring special attention:');
      specialServices.forEach((service, index) => {
        const flags = [];
        if (service.kasda) flags.push('KASDA');
        if (service.govApproval) flags.push('Gov Approval');
        if (service.businessApproval) flags.push('Business Approval');
        console.log(`${index + 1}. ${service.name} (${service.category}) - [${flags.join(', ')}]`);
      });
    }

    console.log('\n✅ Service catalog analysis complete!');
    return analysisData;

  } catch (error) {
    console.error('❌ Error analyzing service catalog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the analysis
analyzeServiceCatalog()
  .then((data) => {
    console.log('\n🎉 Analysis completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Analysis failed:', error);
    process.exit(1);
  });