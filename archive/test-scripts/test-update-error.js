const fetch = require('node-fetch');

async function testUpdateError() {
  try {
    // Login first
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
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Create a test catalog
    const newCatalogData = {
      name: 'Test Update Catalog',
      description: 'Test catalog for update testing',
      serviceType: 'business_service',
      categoryLevel: 1,
      departmentId: 1,
      isActive: true,
      requiresApproval: false,
      businessImpact: 'low'
    };
    
    const createResponse = await fetch('http://localhost:3001/api/service-catalog-admin/catalogs', {
      method: 'POST',
      headers,
      body: JSON.stringify(newCatalogData)
    });
    
    const createdCatalog = await createResponse.json();
    console.log('Created catalog:', createdCatalog.data.name, 'ID:', createdCatalog.data.id);
    
    // Try to update it and get the detailed error
    const updateResponse = await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${createdCatalog.data.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        description: 'Updated description',
        businessImpact: 'medium'
      })
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update response status:', updateResponse.status);
    console.log('Update response body:', JSON.stringify(updateResult, null, 2));
    
    // Clean up
    await fetch(`http://localhost:3001/api/service-catalog-admin/catalogs/${createdCatalog.data.id}`, {
      method: 'DELETE',
      headers
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpdateError();