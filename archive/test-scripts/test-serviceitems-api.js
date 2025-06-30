const fetch = require('node-fetch');

async function testServiceItemsAPI() {
  try {
    console.log('=== Testing ServiceItems in Service Catalog API ===\n');
    
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
    console.log('✅ Login successful\n');
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Test 1: Get service catalog categories
    console.log('1. Testing GET /service-catalog/categories');
    const categoriesResponse = await fetch('http://localhost:3001/api/service-catalog/categories', { headers });
    const categoriesResult = await categoriesResponse.json();
    console.log(`   ✅ Found ${categoriesResult.data.length} categories`);
    if (categoriesResult.data.length > 0) {
      const firstCategory = categoriesResult.data[0];
      console.log(`   📋 First category: "${firstCategory.name}" (${firstCategory.serviceCount} services)`);
      
      // Test 2: Get services for the first category
      console.log(`\n2. Testing GET /service-catalog/category/${firstCategory.id}/services`);
      const servicesResponse = await fetch(`http://localhost:3001/api/service-catalog/category/${firstCategory.id}/services`, { headers });
      const servicesResult = await servicesResponse.json();
      console.log(`   ✅ Found ${servicesResult.data.length} services in "${firstCategory.name}"`);
      
      if (servicesResult.data.length > 0) {
        const firstService = servicesResult.data[0];
        console.log(`   📋 First service: "${firstService.name}" (${firstService.fieldCount} fields, type: ${firstService.type})`);
        console.log(`       Service ID: ${firstService.id}`);
        
        // Test 3: Get service template/details
        console.log(`\n3. Testing GET /service-catalog/service/${firstService.id}/template`);
        const templateResponse = await fetch(`http://localhost:3001/api/service-catalog/service/${firstService.id}/template`, { headers });
        const templateResult = await templateResponse.json();
        
        if (templateResponse.ok) {
          console.log(`   ✅ Got service details: "${templateResult.data.name}"`);
          console.log(`       Type: ${templateResult.data.type}`);
          console.log(`       Fields: ${templateResult.data.fields.length}`);
          if (templateResult.data.fields.length > 0) {
            console.log(`       First field: "${templateResult.data.fields[0].label}" (${templateResult.data.fields[0].type})`);
          }
        } else {
          const error = await templateResponse.json();
          console.log(`   ❌ Failed to get service template: ${templateResponse.status} - ${error.message}`);
        }
      }
    }
    
    console.log('\n=== ServiceItems API Testing Complete ===');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

testServiceItemsAPI();