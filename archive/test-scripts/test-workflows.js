#!/usr/bin/env node

// Comprehensive Backend Testing Script
// Tests all workflows, security, and edge cases

const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3001';
const JWT_SECRET = 'VERY_VERY_VERY_SECRET_KEY';

// Test configuration
const config = {
  baseURL: BASE_URL,
  timeout: 10000,
  validateStatus: () => true // Don't throw on 4xx/5xx
};

// Helper function to generate JWT tokens
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

// Test user tokens
const tokens = {
  admin: generateToken({ id: 1, username: 'admin', email: 'admin@bsg.com', role: 'admin', departmentId: 1 }),
  kasdaUser: generateToken({ id: 2, username: 'kasdauser', email: 'kasda@gov.id', role: 'user', departmentId: 2, isKasdaUser: true }),
  technician: generateToken({ id: 3, username: 'technician', email: 'tech@bsg.com', role: 'technician', departmentId: 2 }),
  businessReviewer: generateToken({ id: 4, username: 'business_manager', email: 'business.manager@bsg.com', role: 'manager', departmentId: 2, isBusinessReviewer: true }),
  regularUser: generateToken({ id: 5, username: 'user', email: 'user@company.com', role: 'user', departmentId: 1 }),
  manager: generateToken({ id: 6, username: 'manager', email: 'manager@bsg.com', role: 'manager', departmentId: 1 })
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  failures: []
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.failures.push({ test: testName, details });
    console.log(`❌ ${testName}: ${details}`);
  }
}

function logSection(sectionName) {
  console.log(`\n🔍 ${sectionName}`);
  console.log('='.repeat(50));
}

async function makeRequest(method, endpoint, data = null, token = null, expectedStatus = null) {
  try {
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    if (data) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      data,
      headers,
      ...config
    });

    if (expectedStatus && response.status !== expectedStatus) {
      return { success: false, error: `Expected status ${expectedStatus}, got ${response.status}`, response };
    }

    return { success: true, data: response.data, status: response.status, response };
  } catch (error) {
    return { success: false, error: error.message, status: error.response?.status };
  }
}

// Phase 1: End-to-End Workflow Testing
async function testCompleteKasdaWorkflow() {
  logSection('Phase 1A: Complete KASDA User Workflow');
  
  // Step 1: KASDA user creates ticket with categorization
  const createTicketResult = await makeRequest('POST', '/api/v2/tickets/create', {
    title: 'KASDA Treasury Account Access Request',
    description: 'Need access to treasury accounts for budget disbursement',
    serviceItemId: 1,
    serviceTemplateId: 1,
    businessImpact: 'high',
    governmentEntityId: 1,
    userRootCause: 'human_error',
    userIssueCategory: 'request'
  }, tokens.kasdaUser, 201);

  logTest('KASDA user can create categorized ticket', createTicketResult.success);
  
  if (!createTicketResult.success) return;
  
  const ticketId = createTicketResult.data.data.id;
  
  // Verify categorization was saved
  logTest('User categorization saved correctly', 
    createTicketResult.data.data.userRootCause === 'human_error' &&
    createTicketResult.data.data.userIssueCategory === 'request'
  );
  
  // Verify business approval required
  logTest('Business approval required for KASDA ticket', 
    createTicketResult.data.data.requiresBusinessApproval === true &&
    createTicketResult.data.data.status === 'awaiting_approval'
  );

  // Step 2: Business reviewer gets pending approvals
  const pendingApprovalsResult = await makeRequest('GET', '/api/v2/tickets/pending-business-approvals', null, tokens.businessReviewer, 200);
  logTest('Business reviewer can view pending approvals', 
    pendingApprovalsResult.success && 
    pendingApprovalsResult.data.data.length > 0
  );

  // Step 3: Business reviewer approves ticket
  const approvalResult = await makeRequest('POST', `/api/v2/tickets/business-approval/${ticketId}`, {
    action: 'approve',
    comments: 'KASDA access approved for treasury operations',
    govDocsVerified: true
  }, tokens.businessReviewer);

  logTest('Business reviewer can approve KASDA ticket', approvalResult.success);

  // Step 4: Technician reviews and validates categorization
  const techCategorizationResult = await makeRequest('PUT', `/api/categorization/${ticketId}`, {
    rootCause: 'system_error',
    issueCategory: 'request',
    overrideReason: 'Actually a system configuration issue, not user error'
  }, tokens.technician, 200);

  logTest('Technician can override user categorization', techCategorizationResult.success);
  
  if (techCategorizationResult.success) {
    logTest('Technician override creates confirmed classification',
      techCategorizationResult.data.data.categorization.confirmedRootCause === 'system_error' &&
      techCategorizationResult.data.data.categorization.confirmedIssueCategory === 'request'
    );
  }

  // Step 5: Verify audit trail
  const ticketDetailsResult = await makeRequest('GET', `/api/v2/tickets/${ticketId}`, null, tokens.technician, 200);
  logTest('Ticket details include categorization history', 
    ticketDetailsResult.success &&
    ticketDetailsResult.data.data.techOverrideReason === 'Actually a system configuration issue, not user error'
  );

  return ticketId;
}

async function testRegularUserTechnicalWorkflow() {
  logSection('Phase 1B: Regular User Technical Ticket Workflow');

  // Step 1: Get categorization suggestions
  const suggestionsResult = await makeRequest('GET', '/api/categorization/suggestions/9', null, tokens.regularUser, 200);
  logTest('User can get categorization suggestions', suggestionsResult.success);

  // Step 2: Create technical ticket
  const createTicketResult = await makeRequest('POST', '/api/v2/tickets/create', {
    title: 'Employee Password Reset Request',
    description: 'User forgot password and needs reset for internal access',
    serviceItemId: 9, // Internal User Management
    businessImpact: 'medium',
    userIssueCategory: 'request'
  }, tokens.regularUser, 201);

  logTest('Regular user can create technical ticket', createTicketResult.success);
  
  if (!createTicketResult.success) return;
  
  const ticketId = createTicketResult.data.data.id;

  // Verify no business approval required for technical tickets
  logTest('Technical ticket does not require business approval',
    createTicketResult.data.data.requiresBusinessApproval === false &&
    createTicketResult.data.data.status === 'open'
  );

  // Step 3: Technician validates and completes categorization
  const techCategorizationResult = await makeRequest('PUT', `/api/categorization/${ticketId}`, {
    rootCause: 'human_error',
    issueCategory: 'request',
    reason: 'Standard password reset - user error'
  }, tokens.technician, 200);

  logTest('Technician can categorize technical ticket', techCategorizationResult.success);

  return ticketId;
}

async function testBulkCategorizationOperations() {
  logSection('Phase 1C: Bulk Categorization Operations');

  // First, create multiple tickets to categorize
  const ticketIds = [];
  
  for (let i = 0; i < 3; i++) {
    const createResult = await makeRequest('POST', '/api/v2/tickets/create', {
      title: `Bulk Test Ticket ${i + 1}`,
      description: `Testing bulk categorization operations - ticket ${i + 1}`,
      serviceItemId: 9,
      businessImpact: 'low'
    }, tokens.regularUser, 201);
    
    if (createResult.success) {
      ticketIds.push(createResult.data.data.id);
    }
  }

  logTest('Created multiple tickets for bulk testing', ticketIds.length === 3);

  // Test bulk categorization
  const bulkResult = await makeRequest('POST', '/api/categorization/bulk', {
    ticketIds: ticketIds,
    rootCause: 'system_error',
    issueCategory: 'problem',
    reason: 'Bulk categorization test - system maintenance issues'
  }, tokens.technician, 200);

  logTest('Technician can perform bulk categorization', bulkResult.success);

  if (bulkResult.success) {
    logTest('Bulk operation processed all tickets',
      bulkResult.data.data.processedTickets === ticketIds.length
    );
  }

  return ticketIds;
}

async function testManagerAnalyticsAndExport() {
  logSection('Phase 1D: Manager Analytics and Export');

  // Test analytics overview
  const overviewResult = await makeRequest('GET', '/api/analytics/categorization/overview', null, tokens.manager, 200);
  logTest('Manager can view categorization overview', overviewResult.success);

  if (overviewResult.success) {
    logTest('Analytics includes distribution data',
      overviewResult.data.data.distributions.rootCause.length > 0 &&
      overviewResult.data.data.distributions.issueCategory.length > 0
    );
  }

  // Test trends analytics
  const trendsResult = await makeRequest('GET', '/api/analytics/categorization/trends?interval=day', null, tokens.manager, 200);
  logTest('Manager can view categorization trends', trendsResult.success);

  // Test service patterns (manager role)
  const patternsResult = await makeRequest('GET', '/api/analytics/categorization/service-patterns', null, tokens.manager, 200);
  logTest('Manager can view service patterns', patternsResult.success);

  // Test technician performance (manager role)
  const performanceResult = await makeRequest('GET', '/api/analytics/categorization/technician-performance', null, tokens.manager, 200);
  logTest('Manager can view technician performance', performanceResult.success);

  // Test data export (admin only)
  const exportResult = await makeRequest('GET', '/api/analytics/categorization/export?format=json', null, tokens.admin, 200);
  logTest('Admin can export categorization data', exportResult.success);

  // Test CSV export
  const csvExportResult = await makeRequest('GET', '/api/analytics/categorization/export?format=csv', null, tokens.admin, 200);
  logTest('Admin can export CSV data', csvExportResult.success && csvExportResult.status === 200);
}

async function testUncategorizedTicketQueue() {
  logSection('Phase 1E: Uncategorized Ticket Queue Management');

  // Create an uncategorized ticket
  const createResult = await makeRequest('POST', '/api/v2/tickets/create', {
    title: 'Uncategorized Test Ticket',
    description: 'This ticket will remain uncategorized for queue testing',
    serviceItemId: 9,
    businessImpact: 'medium'
  }, tokens.regularUser, 201);

  logTest('Created uncategorized ticket', createResult.success);

  if (!createResult.success) return;

  const ticketId = createResult.data.data.id;

  // Test uncategorized queue
  const queueResult = await makeRequest('GET', '/api/categorization/uncategorized', null, tokens.technician, 200);
  logTest('Technician can view uncategorized queue', queueResult.success);

  if (queueResult.success) {
    logTest('Queue contains uncategorized tickets',
      queueResult.data.data.tickets.length > 0
    );
  }

  // Test queue filtering
  const filteredQueueResult = await makeRequest('GET', '/api/categorization/uncategorized?priority=medium', null, tokens.technician, 200);
  logTest('Technician can filter uncategorized queue', filteredQueueResult.success);
}

// Phase 2: Security & Edge Case Testing
async function testSecurityAndEdgeCases() {
  logSection('Phase 2: Security & Edge Case Testing');

  await testRoleBasedAccess();
  await testInputValidation();
  await testRateLimiting();
  await testEdgeCases();
}

async function testRoleBasedAccess() {
  console.log('\n📊 Role-Based Access Control Testing');

  // Test unauthorized access to admin endpoints
  const unauthorizedExportResult = await makeRequest('GET', '/api/analytics/categorization/export', null, tokens.regularUser, 403);
  logTest('Regular user cannot access admin export', unauthorizedExportResult.status === 403);

  // Test unauthorized bulk operations
  const unauthorizedBulkResult = await makeRequest('POST', '/api/categorization/bulk', {
    ticketIds: [1],
    rootCause: 'system_error',
    issueCategory: 'problem',
    reason: 'Unauthorized test'
  }, tokens.regularUser, 403);
  logTest('Regular user cannot perform bulk operations', unauthorizedBulkResult.status === 403);

  // Test cross-department access
  const crossDeptResult = await makeRequest('GET', '/api/analytics/categorization/overview?department=1', null, tokens.technician, 200);
  logTest('Technician can access department analytics', crossDeptResult.success);

  // Test KASDA-specific access
  const kasdaSuggestionsResult = await makeRequest('GET', '/api/categorization/suggestions/1', null, tokens.kasdaUser, 200);
  logTest('KASDA user can access KASDA service suggestions', kasdaSuggestionsResult.success);

  const nonKasdaSuggestionsResult = await makeRequest('GET', '/api/categorization/suggestions/1', null, tokens.regularUser, 200);
  logTest('Regular user can access KASDA suggestions (for comparison)', nonKasdaSuggestionsResult.success);
}

async function testInputValidation() {
  console.log('\n🔍 Input Validation Testing');

  // Test invalid categorization values
  const invalidCategorizationResult = await makeRequest('PUT', '/api/categorization/1', {
    rootCause: 'invalid_cause',
    issueCategory: 'invalid_category'
  }, tokens.technician);
  logTest('Invalid categorization values rejected', invalidCategorizationResult.status === 400);

  // Test missing required fields
  const missingFieldsResult = await makeRequest('POST', '/api/categorization/bulk', {
    ticketIds: [1]
    // Missing rootCause, issueCategory, reason
  }, tokens.technician);
  logTest('Missing required fields rejected', missingFieldsResult.status === 400);

  // Test malicious input
  const maliciousInputResult = await makeRequest('PUT', '/api/categorization/1', {
    rootCause: 'human_error',
    issueCategory: 'request',
    overrideReason: '<script>alert("xss")</script>'.repeat(100)
  }, tokens.technician);
  logTest('Malicious input handled safely', maliciousInputResult.status === 400 || maliciousInputResult.status === 200);

  // Test SQL injection attempt
  const sqlInjectionResult = await makeRequest('GET', '/api/categorization/suggestions/1; DROP TABLE tickets; --', null, tokens.technician);
  logTest('SQL injection attempt blocked', sqlInjectionResult.status === 400 || sqlInjectionResult.status === 404);
}

async function testRateLimiting() {
  console.log('\n⏱️ Rate Limiting Testing');

  // Test normal rate limiting
  const requests = [];
  for (let i = 0; i < 60; i++) {
    requests.push(makeRequest('GET', '/api/categorization/suggestions/1', null, tokens.technician));
  }

  const results = await Promise.all(requests);
  const blocked = results.filter(r => r.status === 429).length;
  
  logTest('Rate limiting activates after threshold', blocked > 0);

  // Wait for rate limit reset
  console.log('⏳ Waiting for rate limit reset...');
  await new Promise(resolve => setTimeout(resolve, 2000));
}

async function testEdgeCases() {
  console.log('\n🔧 Edge Cases Testing');

  // Test non-existent ticket categorization
  const nonExistentTicketResult = await makeRequest('PUT', '/api/categorization/99999', {
    rootCause: 'human_error',
    issueCategory: 'request'
  }, tokens.technician, 404);
  logTest('Non-existent ticket returns 404', nonExistentTicketResult.status === 404);

  // Test locked ticket modification
  const lockResult = await makeRequest('POST', '/api/categorization/1/lock', {
    locked: true,
    reason: 'Testing lock functionality'
  }, tokens.admin, 200);
  
  if (lockResult.success) {
    const modifyLockedResult = await makeRequest('PUT', '/api/categorization/1', {
      rootCause: 'external_factor',
      issueCategory: 'complaint'
    }, tokens.technician, 403);
    logTest('Locked ticket modification blocked for non-admin', modifyLockedResult.status === 403);

    // Unlock for future tests
    await makeRequest('POST', '/api/categorization/1/lock', {
      locked: false,
      reason: 'Unlocking after test'
    }, tokens.admin);
  }

  // Test concurrent categorization updates
  const concurrentPromises = [
    makeRequest('PUT', '/api/categorization/1', {
      rootCause: 'human_error',
      issueCategory: 'request',
      reason: 'Concurrent test 1'
    }, tokens.technician),
    makeRequest('PUT', '/api/categorization/1', {
      rootCause: 'system_error',
      issueCategory: 'problem',
      reason: 'Concurrent test 2'
    }, tokens.technician)
  ];

  const concurrentResults = await Promise.all(concurrentPromises);
  logTest('Concurrent updates handled gracefully', 
    concurrentResults.filter(r => r.success).length >= 1
  );
}

// Phase 3: Performance & Load Testing
async function testPerformanceAndLoad() {
  logSection('Phase 3: Performance & Load Testing');

  // Test bulk operation performance
  console.log('📊 Testing bulk operation performance...');
  const bulkTicketIds = [];
  
  // Create tickets for bulk testing
  for (let i = 0; i < 20; i++) {
    const createResult = await makeRequest('POST', '/api/v2/tickets/create', {
      title: `Performance Test Ticket ${i + 1}`,
      description: `Performance testing ticket ${i + 1}`,
      serviceItemId: 9,
      businessImpact: 'low'
    }, tokens.regularUser);
    
    if (createResult.success) {
      bulkTicketIds.push(createResult.data.data.id);
    }
  }

  const startTime = Date.now();
  const bulkResult = await makeRequest('POST', '/api/categorization/bulk', {
    ticketIds: bulkTicketIds,
    rootCause: 'system_error',
    issueCategory: 'problem',
    reason: 'Performance test bulk categorization'
  }, tokens.technician);
  const endTime = Date.now();

  logTest('Bulk operation completed successfully', bulkResult.success);
  logTest('Bulk operation performance acceptable', (endTime - startTime) < 5000); // Under 5 seconds

  console.log(`⏱️ Bulk operation time: ${endTime - startTime}ms for ${bulkTicketIds.length} tickets`);

  // Test analytics query performance
  console.log('📈 Testing analytics performance...');
  const analyticsStartTime = Date.now();
  const analyticsResult = await makeRequest('GET', '/api/analytics/categorization/overview', null, tokens.manager);
  const analyticsEndTime = Date.now();

  logTest('Analytics query completed successfully', analyticsResult.success);
  logTest('Analytics query performance acceptable', (analyticsEndTime - analyticsStartTime) < 3000); // Under 3 seconds

  console.log(`⏱️ Analytics query time: ${analyticsEndTime - analyticsStartTime}ms`);

  // Test concurrent user scenario
  console.log('👥 Testing concurrent user scenario...');
  const concurrentStartTime = Date.now();
  const concurrentRequests = [
    makeRequest('GET', '/api/categorization/uncategorized', null, tokens.technician),
    makeRequest('GET', '/api/analytics/categorization/overview', null, tokens.manager),
    makeRequest('GET', '/api/categorization/suggestions/1', null, tokens.kasdaUser),
    makeRequest('GET', '/api/analytics/categorization/trends', null, tokens.manager),
    makeRequest('GET', '/api/categorization/uncategorized', null, tokens.technician)
  ];

  const concurrentResults = await Promise.all(concurrentRequests);
  const concurrentEndTime = Date.now();

  logTest('Concurrent requests handled successfully', 
    concurrentResults.filter(r => r.success).length === concurrentRequests.length
  );
  logTest('Concurrent request performance acceptable', (concurrentEndTime - concurrentStartTime) < 5000);

  console.log(`⏱️ Concurrent requests time: ${concurrentEndTime - concurrentStartTime}ms for ${concurrentRequests.length} requests`);
}

// Phase 4: Integration Testing
async function testSystemIntegration() {
  logSection('Phase 4: Integration Testing');

  // Test ITIL + Categorization integration
  console.log('🔗 Testing ITIL Service Catalog + Categorization Integration');
  
  const serviceCatalogResult = await makeRequest('GET', '/api/service-catalog/catalog', null, tokens.kasdaUser, 200);
  logTest('Service catalog accessible', serviceCatalogResult.success);

  if (serviceCatalogResult.success) {
    const serviceItem = serviceCatalogResult.data.data.find(s => s.name === 'Government Services');
    logTest('KASDA services available in catalog', serviceItem !== undefined);
  }

  // Test KASDA + Business Approval + Categorization integration
  console.log('🏛️ Testing KASDA + Business Approval + Categorization Integration');
  
  const kasdaTicketResult = await makeRequest('POST', '/api/v2/tickets/create', {
    title: 'Integration Test KASDA Ticket',
    description: 'Testing full KASDA workflow integration',
    serviceItemId: 1,
    serviceTemplateId: 1,
    businessImpact: 'high',
    governmentEntityId: 1,
    userRootCause: 'human_error',
    userIssueCategory: 'request'
  }, tokens.kasdaUser, 201);

  logTest('KASDA ticket creation with categorization works', kasdaTicketResult.success);

  if (kasdaTicketResult.success) {
    const ticketId = kasdaTicketResult.data.data.id;
    
    // Test business approval integration
    const approvalResult = await makeRequest('POST', `/api/v2/tickets/business-approval/${ticketId}`, {
      action: 'approve',
      comments: 'Integration test approval'
    }, tokens.businessReviewer);
    
    logTest('Business approval integration works', approvalResult.success);
    
    // Test categorization after approval
    const categorizationResult = await makeRequest('PUT', `/api/categorization/${ticketId}`, {
      rootCause: 'system_error',
      issueCategory: 'request',
      overrideReason: 'Integration test categorization'
    }, tokens.technician);
    
    logTest('Post-approval categorization works', categorizationResult.success);
  }

  // Test Legacy API compatibility
  console.log('🔄 Testing Legacy API Compatibility');
  
  const legacyCategoriesResult = await makeRequest('GET', '/api/categories', null, tokens.technician, 200);
  logTest('Legacy categories API still works', legacyCategoriesResult.success);

  const legacyTicketsResult = await makeRequest('GET', '/api/tickets', null, tokens.technician, 200);
  logTest('Legacy tickets API still works', legacyTicketsResult.success);
}

// Test execution and reporting
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Backend Testing');
  console.log('='.repeat(60));

  try {
    // Phase 1: End-to-End Workflow Testing
    console.log('\n📋 PHASE 1: END-TO-END WORKFLOW TESTING');
    await testCompleteKasdaWorkflow();
    await testRegularUserTechnicalWorkflow();
    await testBulkCategorizationOperations();
    await testManagerAnalyticsAndExport();
    await testUncategorizedTicketQueue();
    
    // Phase 2: Security & Edge Case Testing
    console.log('\n🔒 PHASE 2: SECURITY & EDGE CASE TESTING');
    await testSecurityAndEdgeCases();
    
    // Phase 3: Performance & Load Testing
    console.log('\n⚡ PHASE 3: PERFORMANCE & LOAD TESTING');
    await testPerformanceAndLoad();
    
    // Phase 4: Integration Testing
    console.log('\n🔗 PHASE 4: INTEGRATION TESTING');
    await testSystemIntegration();

  } catch (error) {
    console.error('❌ Test execution error:', error.message);
    testResults.failed++;
    testResults.failures.push({ test: 'Test Execution', details: error.message });
  }

  // Generate test report
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failures.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure.test}: ${failure.details}`);
    });
  }

  if (testResults.passed === testResults.total) {
    console.log('\n🎉 ALL TESTS PASSED! Backend is ready for production.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review and fix issues before proceeding.');
  }

  process.exit(testResults.failed === 0 ? 0 : 1);
}

// Check if server is running
async function checkServerHealth() {
  try {
    const healthResult = await makeRequest('GET', '/health');
    if (!healthResult.success) {
      console.error('❌ Server is not running or unhealthy. Please start the server first.');
      console.log('Run: npm run dev');
      process.exit(1);
    }
    console.log('✅ Server is running and healthy');
  } catch (error) {
    console.error('❌ Cannot connect to server. Please ensure it is running on port 3001.');
    process.exit(1);
  }
}

// Main execution
async function main() {
  await checkServerHealth();
  await runAllTests();
}

if (require.main === module) {
  main();
}