const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testServiceApiResponse() {
  try {
    console.log('=== SIMULATING API RESPONSE FOR CUSTOMER PORTAL ===\n');
    
    // Find the service catalog that contains these services
    const serviceItems = await prisma.serviceItem.findMany({
      where: {
        OR: [
          { name: 'OLIBs - Pendaftaran User Baru' },
          { name: 'ATM-Permasalahan Teknis' }
        ]
      },
      include: {
        serviceCatalog: true,
        service_field_definitions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });
    
    console.log('Found services in these catalogs:');
    serviceItems.forEach(item => {
      console.log(`- ${item.name} → Catalog: ${item.serviceCatalog.name} (ID: catalog_${item.serviceCatalogId})`);
    });
    
    // Simulate what the API would return for each catalog
    const catalogIds = [...new Set(serviceItems.map(item => item.serviceCatalogId))];
    
    for (const catalogId of catalogIds) {
      console.log(`\n=== CATALOG ID: catalog_${catalogId} ===`);
      
      const servicesInCatalog = await prisma.serviceItem.findMany({
        where: {
          serviceCatalogId: catalogId,
          isActive: true,
          OR: [
            { name: { contains: 'OLIBs - Pendaftaran User Baru' } },
            { name: { contains: 'ATM-Permasalahan Teknis' } }
          ]
        },
        include: {
          service_field_definitions: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
      
      // Transform to API response format
      const apiResponse = servicesInCatalog.map(item => ({
        id: `service_${item.id}`,
        name: item.name,
        description: item.description || `${item.name} service request`,
        categoryId: `catalog_${catalogId}`,
        templateId: null,
        serviceItemId: item.id,
        popularity: 0,
        usageCount: 0,
        hasTemplate: item.service_field_definitions.length > 0,
        hasFields: item.service_field_definitions.length > 0,
        fieldCount: item.service_field_definitions.length,
        type: 'service_item',
        fields: item.service_field_definitions.map(field => ({
          id: field.id,
          name: field.fieldName,
          label: field.fieldLabel,
          type: field.fieldType,
          required: field.isRequired,
          description: null,
          placeholder: field.placeholder,
          helpText: null,
          originalFieldType: field.fieldType,
          isDropdownField: field.fieldType === 'dropdown',
          options: field.options ? JSON.parse(field.options) : []
        }))
      }));
      
      console.log('\nAPI Response:');
      console.log(JSON.stringify(apiResponse, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testServiceApiResponse();