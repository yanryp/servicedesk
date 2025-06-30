// Enhanced BSG Global Setup
// Prepares test environment and validates system state

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function globalSetup() {
  console.log('🚀 Enhanced BSG Global Setup Starting...');
  
  const testRunId = new Date().toISOString().replace(/[:.]/g, '-');
  const setupResults = {
    testRunId,
    timestamp: new Date().toISOString(),
    status: 'starting',
    services: {},
    database: {},
    users: {},
    errors: []
  };

  try {
    // Create test results directory
    const resultsDir = path.join(__dirname, '..', 'test-results');
    await fs.mkdir(resultsDir, { recursive: true });
    
    console.log('📁 Test results directory created');

    // 1. Check Backend Service
    console.log('🔍 Checking backend service...');
    try {
      const backendResponse = await axios.get('http://localhost:3001', { timeout: 5000 });
      setupResults.services.backend = {
        status: 'running',
        response: backendResponse.status
      };
      console.log('✅ Backend service is running');
    } catch (error) {
      setupResults.services.backend = {
        status: 'failed',
        error: error.message
      };
      setupResults.errors.push('Backend service not accessible');
      console.log('❌ Backend service check failed:', error.message);
    }

    // 2. Check Frontend Service
    console.log('🔍 Checking frontend service...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      setupResults.services.frontend = {
        status: 'running',
        response: frontendResponse.status
      };
      console.log('✅ Frontend service is running');
    } catch (error) {
      setupResults.services.frontend = {
        status: 'failed',
        error: error.message
      };
      setupResults.errors.push('Frontend service not accessible');
      console.log('❌ Frontend service check failed:', error.message);
    }

    // 3. Validate Database Connection
    console.log('🔍 Validating database connection...');
    try {
      const dbTestResponse = await axios.post('http://localhost:3001/api/auth/login', {
        email: 'admin@company.com',
        password: 'password123'
      }, { timeout: 10000 });
      
      setupResults.database = {
        status: 'connected',
        adminUser: dbTestResponse.data.user.username,
        adminRole: dbTestResponse.data.user.role
      };
      console.log('✅ Database connection validated');
    } catch (error) {
      setupResults.database = {
        status: 'failed',
        error: error.message
      };
      setupResults.errors.push('Database connection validation failed');
      console.log('❌ Database validation failed:', error.message);
    }

    // 4. Check User Management System
    console.log('🔍 Checking user management system...');
    try {
      if (setupResults.database.status === 'connected') {
        // Get admin token for user operations
        const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
          email: 'admin@company.com',
          password: 'password123'
        });
        
        const adminToken = loginResponse.data.token;
        
        // Test user creation endpoint
        const testUserData = {
          username: `setup.test.${testRunId.slice(-8)}`,
          name: `Setup Test User ${testRunId}`,
          email: `setup.test.${Date.now()}@bsg.co.id`,
          password: 'SetupTest123!',
          role: 'requester',
          unitId: 1
        };

        const userCreateResponse = await axios.post(
          'http://localhost:3001/api/auth/register',
          testUserData,
          { 
            headers: { 
              'Authorization': `Bearer ${adminToken}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );

        setupResults.users = {
          status: 'working',
          testUserCreated: userCreateResponse.data.user.username,
          nameFieldSupported: !!userCreateResponse.data.user.name,
          testUserName: userCreateResponse.data.user.name
        };
        
        console.log('✅ User management system validated');
        console.log(`   Test user created: ${userCreateResponse.data.user.name} (${userCreateResponse.data.user.username})`);
        console.log(`   Name field support: ${setupResults.users.nameFieldSupported ? 'YES' : 'NO'}`);
      }
    } catch (error) {
      setupResults.users = {
        status: 'failed',
        error: error.message
      };
      setupResults.errors.push('User management system validation failed');
      console.log('❌ User management validation failed:', error.message);
    }

    // 5. Save setup results
    setupResults.status = setupResults.errors.length > 0 ? 'completed_with_errors' : 'completed_successfully';
    
    const setupFile = path.join(resultsDir, `enhanced-bsg-setup-${testRunId}.json`);
    await fs.writeFile(setupFile, JSON.stringify(setupResults, null, 2));
    
    console.log('📊 Setup Results Summary:');
    console.log(`   Backend: ${setupResults.services.backend?.status || 'unknown'}`);
    console.log(`   Frontend: ${setupResults.services.frontend?.status || 'unknown'}`);
    console.log(`   Database: ${setupResults.database?.status || 'unknown'}`);
    console.log(`   User System: ${setupResults.users?.status || 'unknown'}`);
    console.log(`   Name Field Support: ${setupResults.users?.nameFieldSupported ? 'YES' : 'NO'}`);
    console.log(`   Errors: ${setupResults.errors.length}`);
    
    if (setupResults.errors.length > 0) {
      console.log('⚠️  Setup completed with errors:');
      setupResults.errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ Setup completed successfully - All systems ready');
    }

    // 6. Set global test environment variables
    process.env.BSG_TEST_RUN_ID = testRunId;
    process.env.BSG_NAME_FIELD_SUPPORTED = setupResults.users?.nameFieldSupported ? 'true' : 'false';
    process.env.BSG_SETUP_STATUS = setupResults.status;

    console.log('🎯 Enhanced BSG Global Setup Complete');
    
    return setupResults;

  } catch (error) {
    console.error('💥 Global setup failed:', error.message);
    setupResults.status = 'failed';
    setupResults.errors.push(`Global setup failure: ${error.message}`);
    
    // Still save the results for debugging
    try {
      const resultsDir = path.join(__dirname, '..', 'test-results');
      await fs.mkdir(resultsDir, { recursive: true });
      const setupFile = path.join(resultsDir, `enhanced-bsg-setup-failed-${testRunId}.json`);
      await fs.writeFile(setupFile, JSON.stringify(setupResults, null, 2));
    } catch (saveError) {
      console.error('Failed to save setup results:', saveError.message);
    }
    
    throw error;
  }
}

module.exports = globalSetup;