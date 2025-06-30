#!/usr/bin/env node

/**
 * Test Data Manager for Enhanced BSG Automation
 * Manages test users, prevents duplicates, provides datasets
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

class TestDataManager {
  constructor() {
    this.dataFile = path.join(__dirname, 'test-data', 'managed-test-data.json');
    this.adminToken = null;
    this.testData = {
      users: [],
      tickets: [],
      branches: [],
      lastUpdate: null,
      runHistory: []
    };
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }

  async initializeDataStore() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      
      try {
        const existingData = await fs.readFile(this.dataFile, 'utf8');
        this.testData = JSON.parse(existingData);
        await this.log(`📂 Loaded existing test data: ${this.testData.users.length} users, ${this.testData.tickets.length} tickets`);
      } catch (readError) {
        await this.log('📝 Creating new test data store');
        await this.saveData();
      }
    } catch (error) {
      await this.log(`❌ Failed to initialize data store: ${error.message}`);
      throw error;
    }
  }

  async saveData() {
    try {
      this.testData.lastUpdate = new Date().toISOString();
      await fs.writeFile(this.dataFile, JSON.stringify(this.testData, null, 2));
    } catch (error) {
      await this.log(`❌ Failed to save test data: ${error.message}`);
    }
  }

  async loginAdmin() {
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@company.com',
        password: 'password123'
      });
      this.adminToken = response.data.token;
      await this.log('✅ Admin authentication successful');
      return true;
    } catch (error) {
      await this.log(`❌ Admin login failed: ${error.message}`);
      return false;
    }
  }

  async getBranches() {
    try {
      const response = await axios.get(`${BASE_URL}/auth/branches`, {
        headers: { 'Authorization': `Bearer ${this.adminToken}` }
      });
      
      this.testData.branches = response.data.map(branch => ({
        id: branch.id,
        name: branch.name,
        displayName: branch.displayName,
        unitType: branch.unitType,
        code: branch.code
      }));
      
      await this.log(`📍 Retrieved ${this.testData.branches.length} branches`);
      await this.saveData();
      return this.testData.branches;
    } catch (error) {
      await this.log(`❌ Failed to get branches: ${error.message}`);
      return [];
    }
  }

  generateUserData(userType, index = 0) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const indonesianNames = [
      { first: 'Sari', last: 'Dewi' },
      { first: 'Budi', last: 'Santoso' },
      { first: 'Indah', last: 'Permata' },
      { first: 'Rahman', last: 'Hakim' },
      { first: 'Maya', last: 'Sari' },
      { first: 'Andi', last: 'Wijaya' },
      { first: 'Dini', last: 'Kusuma' },
      { first: 'Reza', last: 'Pratama' },
      { first: 'Lina', last: 'Maharani' },
      { first: 'Fajar', last: 'Nugroho' }
    ];

    const nameData = indonesianNames[index % indonesianNames.length];
    const fullName = `${nameData.first} ${nameData.last}`;
    
    const userData = {
      name: `${fullName} ${userType.toUpperCase()}`,
      username: `${nameData.first.toLowerCase()}.${userType}.test.${timestamp.slice(-6)}`,
      email: `${nameData.first.toLowerCase()}.${userType}.test.${Date.now()}@bsg.co.id`,
      password: 'TestPassword123!',
      role: this.getRoleForUserType(userType),
      unitId: this.getRandomBranchId(),
      metadata: {
        testGenerated: true,
        userType: userType,
        timestamp: new Date().toISOString(),
        nameFieldTest: true
      }
    };

    return userData;
  }

  getRoleForUserType(userType) {
    const roleMap = {
      'it': 'technician',
      'kasda': 'requester', 
      'manager': 'manager',
      'requester': 'requester',
      'technician': 'technician',
      'admin': 'admin'
    };
    return roleMap[userType] || 'requester';
  }

  getRandomBranchId() {
    if (this.testData.branches.length === 0) return 1;
    const randomIndex = Math.floor(Math.random() * this.testData.branches.length);
    return this.testData.branches[randomIndex].id;
  }

  async createTestUser(userType, index = 0) {
    const userData = this.generateUserData(userType, index);
    
    // Check for existing user to prevent duplicates
    const existing = this.testData.users.find(u => 
      u.email === userData.email || u.username === userData.username
    );
    
    if (existing) {
      await this.log(`⚠️  User already exists: ${existing.username}`);
      return existing;
    }

    try {
      const response = await axios.post(`${BASE_URL}/auth/register`, userData, {
        headers: { 
          'Authorization': `Bearer ${this.adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const createdUser = {
        ...response.data.user,
        password: userData.password, // Store for testing
        testMetadata: userData.metadata
      };

      this.testData.users.push(createdUser);
      await this.saveData();

      await this.log(`✅ Created ${userType} user: ${createdUser.name} (${createdUser.username})`);
      return createdUser;
    } catch (error) {
      await this.log(`❌ Failed to create ${userType} user: ${error.response?.data?.message || error.message}`);
      return null;
    }
  }

  async createTestDatasets() {
    await this.log('🏗️  Creating comprehensive test datasets...');
    
    const datasets = {
      itUsers: [],
      kasdaUsers: [],
      managers: [],
      requesters: []
    };

    // Create IT users (technicians with name field)
    for (let i = 0; i < 3; i++) {
      const user = await this.createTestUser('it', i);
      if (user) datasets.itUsers.push(user);
    }

    // Create KASDA users (requesters with name field)
    for (let i = 0; i < 3; i++) {
      const user = await this.createTestUser('kasda', i);
      if (user) datasets.kasdaUsers.push(user);
    }

    // Create managers
    for (let i = 0; i < 2; i++) {
      const user = await this.createTestUser('manager', i);
      if (user) datasets.managers.push(user);
    }

    // Create general requesters
    for (let i = 0; i < 2; i++) {
      const user = await this.createTestUser('requester', i);
      if (user) datasets.requesters.push(user);
    }

    await this.log('📊 Test datasets created:');
    await this.log(`   IT Users: ${datasets.itUsers.length}`);
    await this.log(`   KASDA Users: ${datasets.kasdaUsers.length}`);
    await this.log(`   Managers: ${datasets.managers.length}`);
    await this.log(`   Requesters: ${datasets.requesters.length}`);

    return datasets;
  }

  async getExistingTestUsers() {
    return {
      itUsers: this.testData.users.filter(u => u.testMetadata?.userType === 'it'),
      kasdaUsers: this.testData.users.filter(u => u.testMetadata?.userType === 'kasda'),
      managers: this.testData.users.filter(u => u.testMetadata?.userType === 'manager'),
      requesters: this.testData.users.filter(u => u.testMetadata?.userType === 'requester'),
      all: this.testData.users
    };
  }

  generateTicketData(ticketType, userType) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    const ticketTemplates = {
      it: {
        title: `IT Network Infrastructure Issue - ${timestamp}`,
        description: `Automated test for IT department network infrastructure problems.\nTest Type: ${userType}\nTimestamp: ${timestamp}\nName Field Test: Verifying user name display in tickets`,
        priority: 'high',
        category: 'Network Infrastructure',
        type: 'it'
      },
      kasda: {
        title: `KASDA Treasury System Issue - ${timestamp}`,
        description: `Automated test for KASDA treasury system processing.\nTest Type: ${userType}\nTimestamp: ${timestamp}\nName Field Test: Verifying user name display in KASDA tickets`,
        priority: 'medium',
        category: 'KASDA Treasury',
        type: 'kasda'
      },
      general: {
        title: `General Support Request - ${timestamp}`,
        description: `Automated test for general support requests.\nTest Type: ${userType}\nTimestamp: ${timestamp}\nName Field Test: Standard user name verification`,
        priority: 'low',
        category: 'General Support',
        type: 'general'
      }
    };

    return ticketTemplates[ticketType] || ticketTemplates.general;
  }

  async cleanup(olderThanHours = 24) {
    await this.log(`🧹 Cleaning up test data older than ${olderThanHours} hours...`);
    
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    const initialUserCount = this.testData.users.length;
    const initialTicketCount = this.testData.tickets.length;
    
    // Clean up old test users (in a real implementation, you'd delete from database)
    this.testData.users = this.testData.users.filter(user => {
      if (!user.testMetadata?.timestamp) return true;
      return new Date(user.testMetadata.timestamp) > cutoffTime;
    });
    
    // Clean up old test tickets
    this.testData.tickets = this.testData.tickets.filter(ticket => {
      if (!ticket.testMetadata?.timestamp) return true;
      return new Date(ticket.testMetadata.timestamp) > cutoffTime;
    });
    
    const cleanedUsers = initialUserCount - this.testData.users.length;
    const cleanedTickets = initialTicketCount - this.testData.tickets.length;
    
    await this.saveData();
    
    await this.log(`🗑️  Cleanup completed:`);
    await this.log(`   Users removed: ${cleanedUsers}`);
    await this.log(`   Tickets removed: ${cleanedTickets}`);
    
    return { cleanedUsers, cleanedTickets };
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalUsers: this.testData.users.length,
        totalTickets: this.testData.tickets.length,
        totalBranches: this.testData.branches.length,
        lastUpdate: this.testData.lastUpdate
      },
      usersByType: {
        it: this.testData.users.filter(u => u.testMetadata?.userType === 'it').length,
        kasda: this.testData.users.filter(u => u.testMetadata?.userType === 'kasda').length,
        manager: this.testData.users.filter(u => u.testMetadata?.userType === 'manager').length,
        requester: this.testData.users.filter(u => u.testMetadata?.userType === 'requester').length
      },
      nameFieldSupport: {
        usersWithNames: this.testData.users.filter(u => u.name).length,
        usersWithoutNames: this.testData.users.filter(u => !u.name).length,
        supportPercentage: this.testData.users.length > 0 
          ? Math.round((this.testData.users.filter(u => u.name).length / this.testData.users.length) * 100)
          : 0
      },
      testDataQuality: {
        uniqueEmails: new Set(this.testData.users.map(u => u.email)).size,
        uniqueUsernames: new Set(this.testData.users.map(u => u.username)).size,
        duplicateEmailsDetected: this.testData.users.length - new Set(this.testData.users.map(u => u.email)).size,
        duplicateUsernamesDetected: this.testData.users.length - new Set(this.testData.users.map(u => u.username)).size
      }
    };

    await this.log('📈 Test Data Management Report:');
    await this.log(`   Total Test Users: ${report.summary.totalUsers}`);
    await this.log(`   Name Field Support: ${report.nameFieldSupport.supportPercentage}%`);
    await this.log(`   Data Quality: ${report.testDataQuality.duplicateEmailsDetected === 0 ? 'GOOD' : 'ISSUES DETECTED'}`);
    
    return report;
  }

  async run(command = 'create') {
    try {
      await this.initializeDataStore();
      
      if (!(await this.loginAdmin())) {
        throw new Error('Admin authentication failed');
      }

      await this.getBranches();

      switch (command) {
        case 'create':
          return await this.createTestDatasets();
        
        case 'report':
          return await this.generateReport();
        
        case 'cleanup':
          return await this.cleanup();
        
        case 'list':
          return await this.getExistingTestUsers();
        
        default:
          await this.log(`❌ Unknown command: ${command}`);
          await this.log('Available commands: create, report, cleanup, list');
          return null;
      }
    } catch (error) {
      await this.log(`💥 Test data management failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const command = process.argv[2] || 'create';
  const manager = new TestDataManager();
  
  console.log('🎯 BSG Test Data Manager');
  console.log('=' * 50);
  
  try {
    const result = await manager.run(command);
    console.log('\\n✅ Test data management completed successfully');
    return result;
  } catch (error) {
    console.error('\\n❌ Test data management failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TestDataManager;