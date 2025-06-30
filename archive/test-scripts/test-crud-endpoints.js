const fetch = require('node-fetch');

async function testCRUDEndpoints() {
  try {
    // Login first
    console.log('=== Testing Admin CRUD Endpoints ===\n');
    
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get all catalogs
    console.log('1. Testing GET /catalogs');
    const catalogsResponse = await fetch('http://localhost:3001/api/service-catalog-admin/catalogs', { headers });
    const catalogsData = await catalogsResponse.json();
    console.log(`   ✅ Found ${catalogsData.data.length} catalogs with ${catalogsData.meta.totalCustomFields} custom fields\n`);
    
    // Test 2: Get items for a specific catalog
    const testCatalogId = catalogsData.data[0].id;
    console.log(`2. Testing GET /catalogs/${testCatalogId}/items`);
    const itemsResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${testCatalogId}/items`, { headers });
    const itemsData = await itemsResponse.json();
    console.log(`   ✅ Found ${itemsData.data.length} items in catalog "${catalogsData.data[0].name}"`);
    
    // Find an item with custom fields for testing
    const itemWithFields = itemsData.data.find(item => item.statistics?.customFieldCount > 0);
    if (itemWithFields) {
      console.log(`   📋 Item "${itemWithFields.name}" has ${itemWithFields.statistics.customFieldCount} custom fields\n`);
    }
    
    // Test 3: Create a new Service Catalog
    console.log('3. Testing POST /catalogs (Create new catalog)');
    const newCatalogData = {
      name: 'Test Catalog ' + Date.now(),
      description: 'Test catalog for CRUD testing',
      serviceType: 'business_service',
      categoryLevel: 1,
      departmentId: 1,
      isActive: true,
      requiresApproval: false,
      businessImpact: 'low'
    };
    
    const createCatalogResponse = await fetch('http://localhost:3001/api/service-catalog-admin/catalogs', {
      method: 'POST',
      headers,
      body: JSON.stringify(newCatalogData)
    });
    
    if (createCatalogResponse.ok) {
      const createdCatalog = await createCatalogResponse.json();
      console.log(`   ✅ Created catalog: "${createdCatalog.data.name}" (ID: ${createdCatalog.data.id})\n`);
      
      // Test 4: Update the catalog
      console.log(`4. Testing PUT /catalogs/${createdCatalog.data.id} (Update catalog)`);
      const updateResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${createdCatalog.data.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          description: 'Updated test catalog description',
          businessImpact: 'medium'
        })
      });
      
      if (updateResponse.ok) {
        const updatedCatalog = await updateResponse.json();
        console.log(`   ✅ Updated catalog description and business impact\n`);
      } else {
        console.log(`   ❌ Failed to update catalog: ${updateResponse.status}\n`);
      }
      
      // Test 5: Create a Service Item in the new catalog
      console.log(`5. Testing POST /catalogs/${createdCatalog.data.id}/items (Create service item)`);
      const newItemData = {
        name: 'Test Service Item',
        description: 'Test service item for CRUD testing',
        requestType: 'service_request',
        isKasdaRelated: false,
        requiresGovApproval: false,
        isActive: true,
        sortOrder: 1
      };
      
      const createItemResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${createdCatalog.data.id}/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newItemData)
      });
      
      if (createItemResponse.ok) {
        const createdItem = await createItemResponse.json();
        console.log(`   ✅ Created service item: "${createdItem.data.name}" (ID: ${createdItem.data.id})\n`);
        
        // Test 6: Update the service item
        console.log(`6. Testing PUT /items/${createdItem.data.id} (Update service item)`);
        const updateItemResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${createdItem.data.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            description: 'Updated test service item description',
            requiresGovApproval: true
          })
        });
        
        if (updateItemResponse.ok) {
          console.log(`   ✅ Updated service item\n`);
        } else {
          console.log(`   ❌ Failed to update service item: ${updateItemResponse.status}\n`);
        }
        
        // Test 7: Delete the service item
        console.log(`7. Testing DELETE /items/${createdItem.data.id} (Delete service item)`);
        const deleteItemResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/items/${createdItem.data.id}`, {
          method: 'DELETE',
          headers
        });
        
        if (deleteItemResponse.ok) {
          console.log(`   ✅ Deleted service item\n`);
        } else {
          console.log(`   ❌ Failed to delete service item: ${deleteItemResponse.status}\n`);
        }
      } else {
        console.log(`   ❌ Failed to create service item: ${createItemResponse.status}\n`);
      }
      
      // Test 8: Delete the catalog
      console.log(`8. Testing DELETE /catalogs/${createdCatalog.data.id} (Delete catalog)`);
      const deleteCatalogResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${createdCatalog.data.id}`, {
        method: 'DELETE',
        headers
      });
      
      if (deleteCatalogResponse.ok) {
        console.log(`   ✅ Deleted catalog\n`);
      } else {
        console.log(`   ❌ Failed to delete catalog: ${deleteCatalogResponse.status}\n`);
      }
      
    } else {
      const error = await createCatalogResponse.json();
      console.log(`   ❌ Failed to create catalog: ${createCatalogResponse.status} - ${error.message}\n`);
    }
    
    console.log('=== CRUD Testing Complete ===');
    
  } catch (error) {
    console.error('Error during CRUD testing:', error.message);
  }
}

testCRUDEndpoints();