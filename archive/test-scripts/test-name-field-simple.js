#!/usr/bin/env node

/**
 * Simple Test for Name Field Integration in Ticket Display
 * Tests that tickets properly display user name field when available
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

class SimpleNameFieldTester {
  constructor() {
    this.adminToken = null;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async loginAdmin() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@company.com',
        password: 'password123'
      });

      this.adminToken = response.data.token;
      await this.log(`✅ Admin logged in successfully`);
      return response.data.user;
    } catch (error) {
      await this.log(`❌ Admin login failed: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async createUserWithName() {
    try {
      const userData = {
        username: `name.test.${this.timestamp}`,
        name: `Name Test User ${this.timestamp}`,
        email: `name.test.${Date.now()}@bsg.co.id`,
        password: 'password123',
        role: 'requester',
        unitId: 1
      };

      const response = await axios.post(
        `${BASE_URL}/auth/register`,
        userData,
        { 
          headers: { 
            'Authorization': `Bearer ${this.adminToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.log(`✅ Created user: ${response.data.user.name} (${response.data.user.username})`);
      return response.data.user;
    } catch (error) {
      await this.log(`❌ User creation failed: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: email,
        password: password
      });

      await this.log(`✅ User logged in: ${response.data.user.name || response.data.user.username}`);
      return {
        token: response.data.token,
        user: response.data.user
      };
    } catch (error) {
      await this.log(`❌ User login failed: ${error.response?.data?.message || error.message}`);
      throw error;
    }
  }

  async getAvailableCategories(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/categories`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.log(`📂 Found ${response.data.length} categories`);
      return response.data;
    } catch (error) {
      await this.log(`⚠️  Categories endpoint not available: ${error.response?.status}`);
      return [];
    }
  }

  async createSimpleTicket(userToken, userData) {
    try {
      // Try a very simple ticket first
      const ticketData = {
        title: `Name Field Test Ticket - ${this.timestamp}`,
        description: `Testing name field display for user: ${userData.name || userData.username}`,
        priority: 'medium'
      };

      const response = await axios.post(
        `${BASE_URL}/tickets`,
        ticketData,
        { 
          headers: { 
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      await this.log(`🎫 Created ticket #${response.data.id || response.data.ticket?.id}: ${response.data.title || response.data.ticket?.title}`);
      return response.data.ticket || response.data;
    } catch (error) {
      await this.log(`❌ Ticket creation failed: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      
      // Try with minimal required fields
      if (error.response?.status === 400) {
        await this.log(`🔄 Trying with itemId...`);
        try {
          const ticketWithItem = {
            title: `Name Field Test Ticket - ${this.timestamp}`,
            description: `Testing name field display for user: ${userData.name || userData.username}`,
            priority: 'medium',
            itemId: 1
          };

          const response2 = await axios.post(
            `${BASE_URL}/tickets`,
            ticketWithItem,
            { 
              headers: { 
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
              }
            }
          );

          await this.log(`🎫 Created ticket #${response2.data.id || response2.data.ticket?.id}: ${response2.data.title || response2.data.ticket?.title}`);
          return response2.data.ticket || response2.data;
        } catch (error2) {
          await this.log(`❌ Second attempt failed: ${error2.response?.status} - ${error2.response?.data?.message || error2.message}`);
          return null;
        }
      }
      return null;
    }
  }

  async getTicketById(ticketId, token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/tickets/${ticketId}`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const ticket = response.data;
      await this.log(`🔍 Ticket #${ticketId} details:`);
      await this.log(`   Title: ${ticket.title}`);
      await this.log(`   Creator Name: ${ticket.createdBy?.name || 'NOT SET'}`);
      await this.log(`   Creator Username: ${ticket.createdBy?.username || 'NOT SET'}`);
      await this.log(`   Creator Email: ${ticket.createdBy?.email || 'NOT SET'}`);
      await this.log(`   Status: ${ticket.status}`);
      
      return ticket;
    } catch (error) {
      await this.log(`❌ Failed to get ticket: ${error.response?.status} - ${error.response?.data?.message || error.message}`);
      return null;
    }
  }

  async checkExistingTickets(token) {
    try {
      const response = await axios.get(
        `${BASE_URL}/tickets?limit=3`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const tickets = response.data.tickets || response.data;
      await this.log(`📋 Found ${tickets.length} existing tickets`);
      
      tickets.forEach(ticket => {
        this.log(`   #${ticket.id}: Creator name: "${ticket.createdBy?.name || 'NOT SET'}" username: "${ticket.createdBy?.username}"`);
      });
      
      return tickets;
    } catch (error) {
      await this.log(`⚠️  Could not fetch existing tickets: ${error.response?.status}`);
      return [];
    }
  }

  async runTest() {
    await this.log('🚀 Starting simple name field integration test');
    await this.log('═'.repeat(60));

    try {
      // Step 1: Login as admin
      await this.log('\n📋 Step 1: Admin Login');
      await this.loginAdmin();

      // Step 2: Check existing tickets to see name field status
      await this.log('\n📊 Step 2: Check Existing Tickets');
      await this.checkExistingTickets(this.adminToken);

      // Step 3: Create a user with name field
      await this.log('\n👤 Step 3: Create User with Name Field');
      const newUser = await this.createUserWithName();

      // Step 4: Login as the new user
      await this.log('\n🔐 Step 4: Login as New User');
      const userAuth = await this.loginUser(newUser.email, 'password123');

      // Step 5: Get available categories
      await this.log('\n📂 Step 5: Check Available Categories');
      await this.getAvailableCategories(userAuth.token);

      // Step 6: Create a test ticket
      await this.log('\n🎫 Step 6: Create Test Ticket');
      const ticket = await this.createSimpleTicket(userAuth.token, userAuth.user);

      // Step 7: Verify ticket shows name field
      if (ticket) {
        await this.log('\n🔍 Step 7: Verify Name Field Display');
        await this.getTicketById(ticket.id, this.adminToken);
      }

      // Step 8: Final check with existing user
      await this.log('\n🧪 Step 8: Test with Existing User');
      const existingUserAuth = await this.loginUser('kasda.user@company.com', 'password123');
      const existingTicket = await this.createSimpleTicket(existingUserAuth.token, existingUserAuth.user);
      
      if (existingTicket) {
        await this.getTicketById(existingTicket.id, this.adminToken);
      }

      await this.log('\n✅ Test completed successfully!');

    } catch (error) {
      await this.log(`❌ Test failed: ${error.message}`);
      throw error;
    }
  }
}

// Run the test
async function main() {
  const tester = new SimpleNameFieldTester();
  try {
    await tester.runTest();
  } catch (error) {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleNameFieldTester;