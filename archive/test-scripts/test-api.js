const fetch = require('node-fetch');

async function testAPI() {
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
    console.log('Login success:', !!loginData.token);
    
    if (loginData.token) {
      // Test admin API
      const catalogResponse = await fetch('http://localhost:3001/api/service-catalog-admin/catalogs', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      const catalogData = await catalogResponse.json();
      console.log('Catalog API Success:', catalogData.success);
      console.log('Number of catalogs:', catalogData.data?.length);
      console.log('Full response:', JSON.stringify(catalogData, null, 2));
      
      if (catalogData.data) {
        const totalFields = catalogData.data.reduce((sum, cat) => sum + (cat.statistics?.templateCount || 0), 0);
        console.log('Total custom fields in API response:', totalFields);
        
        catalogData.data.forEach(cat => {
          if (cat.statistics?.templateCount > 0) {
            console.log(`  ${cat.name}: ${cat.statistics.templateCount} fields, ${cat.statistics.visibleTemplateCount} items with fields`);
          }
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();