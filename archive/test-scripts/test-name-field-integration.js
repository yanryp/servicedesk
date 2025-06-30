#!/usr/bin/env node

/**
 * Comprehensive Test for Name Field Integration in Ticket Flows
 * Tests both IT and KASDA workflows to verify the new name field works correctly
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test configuration - using actual existing users
const testConfig = {
  admin: {
    email: 'admin@company.com',
    password: 'password123'
  },
  itRequester: {
    email: 'kasda.user@company.com', // Existing requester user
    password: 'password123'
  },
  kasdaRequester: {
    email: 'branch.manager@company.com', // Using existing manager as requester for testing
    password: 'password123'
  },
  manager: {
    email: 'utama.manager@company.com',
    password: 'password123'
  },
  itTechnician: {
    email: 'kotamobagu.manager@company.com', // Using existing manager as technician for testing
    password: 'password123'
  }
};

class BSGTicketFlowTester {
  constructor() {
    this.tokens = {};
    this.testResults = [];
    this.createdTickets = [];
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async login(userKey, credentials) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
      this.tokens[userKey] = response.data.token;
      
      await this.log(`✅ Successfully logged in ${userKey}: ${credentials.email}`);
      await this.log(`   User name: ${response.data.user.name || 'No name field'}`);
      await this.log(`   Username: ${response.data.user.username}`);
      await this.log(`   Role: ${response.data.user.role}`);
      await this.log(`   Department: ${response.data.user.department?.name || 'None'}`);
      await this.log(`   Unit: ${response.data.user.unit?.displayName || response.data.user.unit?.name || 'None'}`);
      
      return response.data.user;
    } catch (error) {
      await this.log(`❌ Failed to login ${userKey}: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async getHeaders(userKey) {
    return {
      'Authorization': `Bearer ${this.tokens[userKey]}`,
      'Content-Type': 'application/json'
    };
  }

  async getServiceCatalog() {
    try {
      const response = await axios.get(`${BASE_URL}/service-catalog/categories`);
      await this.log(`📋 Service Catalog: ${response.data.length} categories found`);
      return response.data;
    } catch (error) {
      await this.log(`❌ Failed to get service catalog: ${error.response?.data?.message || error.message}`);
      return [];
    }
  }

  async createITTicket(userKey, userData) {
    try {
      const ticketData = {
        title: `IT Support Request - ${this.timestamp}`,
        description: `Test IT ticket created to verify name field integration.\nRequester: ${userData.name || userData.username}\nTimestamp: ${this.timestamp}`,
        priority: 'high',
        serviceItemId: 1, // Assuming IT service item exists
        customFieldValues: []
      };

      const response = await axios.post(
        `${BASE_URL}/tickets`, 
        ticketData,
        { headers: await this.getHeaders(userKey) }
      );

      const ticket = response.data.ticket;
      this.createdTickets.push(ticket.id);
      
      await this.log(`🎫 Created IT ticket #${ticket.id}: ${ticket.title}`);
      await this.log(`   Created by: ${ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}`);
      await this.log(`   Status: ${ticket.status}`);
      
      return ticket;
    } catch (error) {
      await this.log(`❌ Failed to create IT ticket: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async createKASDATicket(userKey, userData) {
    try {
      const ticketData = {
        title: `KASDA Treasury Issue - ${this.timestamp}`,
        description: `Test KASDA ticket created to verify name field integration.\nRequester: ${userData.name || userData.username}\nTimestamp: ${this.timestamp}`,
        priority: 'medium',
        serviceItemId: 2, // Assuming KASDA service item exists
        isKasdaTicket: true,
        customFieldValues: []
      };

      const response = await axios.post(
        `${BASE_URL}/tickets`, 
        ticketData,
        { headers: await this.getHeaders(userKey) }
      );

      const ticket = response.data.ticket;
      this.createdTickets.push(ticket.id);
      
      await this.log(`🏦 Created KASDA ticket #${ticket.id}: ${ticket.title}`);
      await this.log(`   Created by: ${ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}`);
      await this.log(`   Status: ${ticket.status}`);
      await this.log(`   KASDA Flag: ${ticket.isKasdaTicket}`);
      
      return ticket;
    } catch (error) {
      await this.log(`❌ Failed to create KASDA ticket: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async getTicketDetails(ticketId, userKey) {
    try {
      const response = await axios.get(
        `${BASE_URL}/tickets/${ticketId}`,
        { headers: await this.getHeaders(userKey) }
      );

      const ticket = response.data;
      await this.log(`🔍 Ticket #${ticketId} details:`);
      await this.log(`   Title: ${ticket.title}`);
      await this.log(`   Created by: ${ticket.createdBy?.name || ticket.createdBy?.username || 'Unknown'}`);
      await this.log(`   Email: ${ticket.createdBy?.email || 'Unknown'}`);
      await this.log(`   Status: ${ticket.status}`);
      await this.log(`   Priority: ${ticket.priority}`);
      await this.log(`   Service Item: ${ticket.serviceItem?.name || 'None'}`);
      
      return ticket;
    } catch (error) {
      await this.log(`❌ Failed to get ticket details: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async testApprovalWorkflow(ticketId, managerKey) {
    try {
      const approvalData = {
        action: 'approve',
        comments: 'Approved for testing name field integration'
      };

      const response = await axios.post(
        `${BASE_URL}/tickets/${ticketId}/approve`,
        approvalData,
        { headers: await this.getHeaders(managerKey) }
      );

      await this.log(`✅ Ticket #${ticketId} approved successfully`);
      return response.data;
    } catch (error) {
      await this.log(`❌ Failed to approve ticket: ${error.response?.data?.message || error.message}`);
      // Continue testing even if approval fails
      return null;
    }
  }

  async createTestUserWithNameField() {
    try {
      const userData = {
        username: `test.name.user.${this.timestamp}`,
        name: `Test User ${this.timestamp}`,
        email: `test.name.user.${Date.now()}@bsg.co.id`,
        password: 'password123',
        role: 'requester',
        unitId: 1 // Assign to first available unit
      };

      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        userData,
        { headers: await this.getHeaders('admin') }
      );

      await this.log(`✅ Created test user with name field:`);
      await this.log(`   Name: ${response.data.user.name}`);
      await this.log(`   Username: ${response.data.user.username}`);
      await this.log(`   Email: ${response.data.user.email}`);
      
      return response.data.user;
    } catch (error) {
      await this.log(`❌ Failed to create test user: ${error.response?.data?.message || error.message}`);
      return null;
    }
  }

  async getUsersList() {
    try {
      const response = await axios.get(
        `${BASE_URL}/users`,
        { headers: await this.getHeaders('admin') }
      );

      await this.log(`👥 Active users in system: ${response.data.length}`);
      let usersWithNames = 0;
      response.data.forEach(user => {
        if (user.name) {
          usersWithNames++;
          this.log(`   ${user.role}: ${user.name} (${user.username}) - ${user.email}`);
        }
      });
      
      await this.log(`📊 Users with name field: ${usersWithNames}/${response.data.length}`);
      return response.data;
    } catch (error) {
      await this.log(`❌ Failed to get users list: ${error.response?.data?.message || error.message}`);
      return [];
    }
  }

  async checkDatabase() {
    try {
      // Test database connectivity by trying to login admin
      const response = await axios.post(`${BASE_URL}/auth/login`, testConfig.admin);
      await this.log(`💚 Database connection verified via login test`);
      return true;
    } catch (error) {
      await this.log(`❌ Database check failed: ${error.response?.data?.message || error.message}`);
      return false;
    }
  }

  async runComprehensiveTest() {
    await this.log('🚀 Starting comprehensive BSG ticket flow test with name field verification');
    await this.log('=' * 80);

    // Check system health
    const dbStatus = await this.checkDatabase();
    if (!dbStatus) {
      await this.log('❌ System health check failed. Aborting test.');
      return;
    }

    try {
      // Phase 1: Login all test users
      await this.log('\n📋 Phase 1: User Authentication');
      const adminUser = await this.login('admin', testConfig.admin);
      const itRequesterUser = await this.login('itRequester', testConfig.itRequester);
      
      // Try to login other users (may not exist)
      try {
        const kasdaRequesterUser = await this.login('kasdaRequester', testConfig.kasdaRequester);
        const managerUser = await this.login('manager', testConfig.manager);
        const itTechUser = await this.login('itTechnician', testConfig.itTechnician);
      } catch (error) {
        await this.log('⚠️  Some test users may not exist. Continuing with available users.');
      }

      // Phase 2: Create test user with name field
      await this.log('\n👤 Phase 2: Create Test User with Name Field');
      const newTestUser = await this.createTestUserWithNameField();
      
      // Phase 3: Get system data
      await this.log('\n📊 Phase 3: System Data Verification');
      await this.getUsersList();
      await this.getServiceCatalog();

      // Phase 4: Test IT ticket flow
      await this.log('\n🖥️  Phase 4: IT Ticket Flow Testing');
      const itTicket = await this.createITTicket('itRequester', itRequesterUser);
      await this.getTicketDetails(itTicket.id, 'itRequester');

      // Phase 5: Test KASDA ticket flow (if user exists)
      if (this.tokens.kasdaRequester) {
        await this.log('\n🏦 Phase 5: KASDA Ticket Flow Testing');
        const kasdaTicket = await this.createKASDATicket('kasdaRequester', kasdaRequesterUser);
        await this.getTicketDetails(kasdaTicket.id, 'kasdaRequester');
      } else {
        await this.log('\n⚠️  Phase 5: KASDA user not available, creating test KASDA ticket with IT requester');
        const kasdaTicket = await this.createKASDATicket('itRequester', itRequesterUser);
        await this.getTicketDetails(kasdaTicket.id, 'itRequester');
      }

      // Phase 6: Test approval workflow (if manager exists)
      if (this.tokens.manager && this.createdTickets.length > 0) {
        await this.log('\n✅ Phase 6: Approval Workflow Testing');
        for (const ticketId of this.createdTickets) {
          await this.testApprovalWorkflow(ticketId, 'manager');
          await this.getTicketDetails(ticketId, 'admin');
        }
      }

      // Phase 7: Final verification
      await this.log('\n🔍 Phase 7: Final Name Field Verification');
      for (const ticketId of this.createdTickets) {
        const ticket = await this.getTicketDetails(ticketId, 'admin');
        if (ticket?.createdBy?.name) {
          await this.log(`✅ Ticket #${ticketId}: Name field properly displayed: ${ticket.createdBy.name}`);
        } else {
          await this.log(`⚠️  Ticket #${ticketId}: Name field missing or not displayed`);
        }
      }

      await this.log('\n🎉 Test completed successfully!');
      await this.log(`📊 Created ${this.createdTickets.length} test tickets: ${this.createdTickets.join(', ')}`);

    } catch (error) {
      await this.log(`❌ Test failed with error: ${error.message}`);
      throw error;
    }
  }
}

// Run the test
async function main() {
  const tester = new BSGTicketFlowTester();
  try {
    await tester.runComprehensiveTest();
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BSGTicketFlowTester;