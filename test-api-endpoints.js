const axios = require('axios');

// Test the API endpoints
async function testEndpoints() {
  const baseURL = 'http://localhost:3001/api';
  
  try {
    console.log('Testing API endpoints...\n');
    
    // Test 1: Health check
    console.log('1. Testing health check...');
    try {
      const health = await axios.get(`${baseURL}/test/health`);
      console.log('✅ Health check:', health.data);
    } catch (err) {
      console.log('❌ Health check failed:', err.message);
    }
    
    // Test 2: Test tickets endpoint without auth (should get 401)
    console.log('\n2. Testing tickets endpoint (no auth)...');
    try {
      const tickets = await axios.get(`${baseURL}/v2/tickets`);
      console.log('❌ Unexpected success (should fail without auth):', tickets.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Unexpected error:', err.message);
      }
    }
    
    // Test 3: Test with fake auth token (should get 401)
    console.log('\n3. Testing tickets endpoint (fake auth)...');
    try {
      const tickets = await axios.get(`${baseURL}/v2/tickets`, {
        headers: {
          'Authorization': 'Bearer fake-token'
        }
      });
      console.log('❌ Unexpected success with fake token:', tickets.data);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log('✅ Correctly rejects fake token');
      } else {
        console.log('❌ Unexpected error:', err.message);
      }
    }
    
    console.log('\n🔍 API endpoints test completed');
    console.log('📝 Next step: Check if backend server is running on port 3001');
    console.log('📝 Run: npm run dev:backend from the backend directory');
    
  } catch (error) {
    console.error('Connection error:', error.message);
    console.log('\n❌ Cannot connect to backend server');
    console.log('📝 Make sure backend is running: npm run dev:backend');
  }
}

testEndpoints();