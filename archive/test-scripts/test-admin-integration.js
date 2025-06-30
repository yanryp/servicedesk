#!/usr/bin/env node

// Test script to verify admin integration with real ServiceCatalog data
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

// Test credentials (from backend scripts, these are standard test users)
const TEST_ADMIN = {
  email: 'admin@company.com',
  password: 'admin123'
};

let authToken = null;

async function login() {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_ADMIN),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Login failed: ${data.message}`);
    }

    authToken = data.token;
    console.log('✅ Successfully authenticated as admin');
    return data;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }
}

async function testAdminCatalogs() {
  try {
    const response = await fetch(`${API_BASE}/service-catalog/admin/catalogs`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Admin catalogs API failed: ${data.message}`);
    }

    console.log('✅ Admin catalogs API working');
    console.log(`📊 Found ${data.data.length} service catalogs`);
    
    if (data.data.length > 0) {
      const firstCatalog = data.data[0];
      console.log(`📝 First catalog: "${firstCatalog.name}" (ID: ${firstCatalog.id})`);
      console.log(`   - Service Items: ${firstCatalog.statistics.serviceItemCount}`);
      console.log(`   - Templates: ${firstCatalog.statistics.templateCount}`);
      console.log(`   - Department: ${firstCatalog.department?.name || 'N/A'}`);
    }

    // Check if we have the expected 271 templates across all catalogs
    const totalTemplates = data.data.reduce((sum, cat) => sum + cat.statistics.templateCount, 0);
    console.log(`🎯 Total templates across all catalogs: ${totalTemplates}`);
    
    if (totalTemplates >= 271) {
      console.log('✅ Expected 271+ templates found in system!');
    } else {
      console.log(`⚠️  Expected 271+ templates, but found ${totalTemplates}`);
    }

    return data.data;
  } catch (error) {
    console.error('❌ Admin catalogs test failed:', error.message);
    process.exit(1);
  }
}

async function testAdminServiceItems() {
  try {
    const response = await fetch(`${API_BASE}/service-catalog/admin/items`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Admin items API failed: ${data.message}`);
    }

    console.log('✅ Admin service items API working');
    console.log(`📊 Found ${data.data.length} service items`);
    
    return data.data;
  } catch (error) {
    console.error('❌ Admin service items test failed:', error.message);
    process.exit(1);
  }
}

async function testAdminTemplates() {
  try {
    const response = await fetch(`${API_BASE}/service-catalog/admin/templates`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Admin templates API failed: ${data.message}`);
    }

    console.log('✅ Admin templates API working');
    console.log(`📊 Found ${data.data.length} templates`);
    
    if (data.data.length > 0) {
      const firstTemplate = data.data[0];
      console.log(`📝 First template: "${firstTemplate.name}" (ID: ${firstTemplate.id})`);
      console.log(`   - Service Item: ${firstTemplate.serviceItem?.name || 'N/A'}`);
      console.log(`   - Custom Fields: ${firstTemplate._count?.customFieldDefinitions || 0}`);
      console.log(`   - Visible: ${firstTemplate.isVisible ? 'Yes' : 'No'}`);
    }
    
    return data.data;
  } catch (error) {
    console.error('❌ Admin templates test failed:', error.message);
    process.exit(1);
  }
}

async function testUserFacingAPI() {
  try {
    const response = await fetch(`${API_BASE}/service-catalog/categories`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`User-facing categories API failed: ${data.message}`);
    }

    console.log('✅ User-facing service catalog API working');
    console.log(`📊 Found ${data.data.length} user-facing categories`);
    
    return data.data;
  } catch (error) {
    console.error('❌ User-facing API test failed:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Testing Service Catalog Admin Integration\n');
  
  await login();
  await testAdminCatalogs();
  await testAdminServiceItems();  
  await testAdminTemplates();
  await testUserFacingAPI();
  
  console.log('\n🎉 All integration tests passed!');
  console.log('✅ Admin system is successfully integrated with existing ServiceCatalog data');
  console.log('✅ Both admin and user-facing APIs are working correctly');
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

main().catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});