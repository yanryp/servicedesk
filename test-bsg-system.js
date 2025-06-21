// test-bsg-system.js
// Simple test script for BSG Template Management System

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
let authToken = '';

// Create test admin user and get token
async function loginAsAdmin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@example.com',
      password: 'password'
    });
    authToken = response.data.token;
    console.log('✅ Successfully logged in as admin');
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test BSG template categories
async function testCategories() {
  try {
    const response = await axios.get(`${BASE_URL}/api/bsg-templates/categories`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Categories API working:', response.data.data.length, 'categories found');
    return response.data;
  } catch (error) {
    console.error('❌ Categories test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test BSG template search
async function testTemplateSearch() {
  try {
    const response = await axios.get(`${BASE_URL}/api/bsg-templates/search?limit=5`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Template search API working:', response.data.data.length, 'templates found');
    return response.data;
  } catch (error) {
    console.error('❌ Template search test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test BSG analytics
async function testAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/api/bsg-templates/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Analytics API working:', response.data.data.overview);
    return response.data;
  } catch (error) {
    console.error('❌ Analytics test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Test master data APIs
async function testMasterData() {
  try {
    // Test branches
    const branches = await axios.get(`${BASE_URL}/api/master-data/branch?limit=3`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Master data (branches) API working:', branches.data.data.length, 'branches found');

    // Test field types
    const fieldTypes = await axios.get(`${BASE_URL}/api/field-types`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Field types API working:', fieldTypes.data.data.length, 'field types found');

    return { branches: branches.data, fieldTypes: fieldTypes.data };
  } catch (error) {
    console.error('❌ Master data test failed:', error.response?.data || error.message);
    throw error;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting BSG Helpdesk System Tests...\n');

  try {
    // 1. Login
    await loginAsAdmin();
    console.log('');

    // 2. Test Categories
    await testCategories();
    console.log('');

    // 3. Test Template Search
    await testTemplateSearch();
    console.log('');

    // 4. Test Analytics
    await testAnalytics();
    console.log('');

    // 5. Test Master Data
    await testMasterData();
    console.log('');

    console.log('🎉 All BSG Template System Tests Passed!');
    console.log('');
    console.log('📋 System Status:');
    console.log('✅ Authentication: Working');
    console.log('✅ BSG Template Categories: Working');
    console.log('✅ BSG Template Search: Working'); 
    console.log('✅ BSG Analytics Dashboard: Working');
    console.log('✅ Master Data APIs: Working');
    console.log('✅ Field Type Definitions: Working');
    console.log('');
    console.log('🏦 BSG Helpdesk System is fully operational!');

  } catch (error) {
    console.error('💥 Test suite failed');
    process.exit(1);
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };