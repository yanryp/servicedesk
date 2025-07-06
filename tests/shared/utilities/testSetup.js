// Test setup utilities for BSG Enterprise Ticketing System
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

class TestSetup {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        }
      }
    });
    this.testUsers = new Map();
    this.testTickets = [];
    this.testBranches = [];
  }

  // Authentication helpers
  createTestToken(user, expiresIn = '1h') {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        unitId: user.unitId 
      },
      process.env.JWT_SECRET || 'test_secret',
      { expiresIn }
    );
  }

  // Test user creation and management
  async createTestUser(userData = {}) {
    const defaultData = {
      email: `test-${Date.now()}@bsg.co.id`,
      password: 'password123',
      name: 'Test User',
      role: 'requester',
      unitId: null,
      isActive: true,
      ...userData
    };

    const user = await this.prisma.user.create({
      data: defaultData,
      include: {
        unit: true,
        department: true
      }
    });

    this.testUsers.set(user.id, user);
    return user;
  }

  async getTestUserByRole(role) {
    // Try to get existing test user first
    let user = await this.prisma.user.findFirst({
      where: { 
        role: role,
        email: { contains: 'test-' }
      },
      include: {
        unit: true,
        department: true
      }
    });

    if (!user) {
      // Create new test user if none exists
      const roleData = this.getDefaultUserDataByRole(role);
      user = await this.createTestUser(roleData);
    }

    return user;
  }

  getDefaultUserDataByRole(role) {
    const roleDefaults = {
      admin: {
        name: 'Test Admin',
        role: 'admin',
        email: `test-admin-${Date.now()}@bsg.co.id`
      },
      manager: {
        name: 'Test Manager',
        role: 'manager',
        email: `test-manager-${Date.now()}@bsg.co.id`,
        isBusinessReviewer: true
      },
      technician: {
        name: 'Test Technician',
        role: 'technician',
        email: `test-technician-${Date.now()}@bsg.co.id`
      },
      requester: {
        name: 'Test Requester',
        role: 'requester',
        email: `test-requester-${Date.now()}@bsg.co.id`
      }
    };

    return roleDefaults[role] || roleDefaults.requester;
  }

  // Test ticket creation
  async createTestTicket(ticketData = {}, createdBy = null) {
    if (!createdBy) {
      createdBy = await this.getTestUserByRole('requester');
    }

    const defaultData = {
      title: `Test Ticket ${Date.now()}`,
      description: 'This is a test ticket for automated testing',
      priority: 'medium',
      status: 'pending_approval',
      createdById: createdBy.id,
      unitId: createdBy.unitId,
      ...ticketData
    };

    const ticket = await this.prisma.ticket.create({
      data: defaultData,
      include: {
        createdBy: true,
        assignedTo: true,
        unit: true,
        category: true,
        subcategory: true
      }
    });

    this.testTickets.push(ticket);
    return ticket;
  }

  // Test branch/unit helpers
  async getTestBranch(branchType = 'CABANG') {
    const branch = await this.prisma.unit.findFirst({
      where: { 
        unitType: branchType,
        isActive: true
      }
    });

    if (!branch) {
      throw new Error(`No ${branchType} branch found for testing`);
    }

    this.testBranches.push(branch);
    return branch;
  }

  async getAllTestBranches() {
    const branches = await this.prisma.unit.findMany({
      where: { 
        unitType: { in: ['CABANG', 'CAPEM'] },
        isActive: true
      },
      orderBy: { unitCode: 'asc' }
    });

    this.testBranches = branches;
    return branches;
  }

  // Test service catalog helpers
  async getTestServiceCategory(categoryName) {
    return await this.prisma.category.findFirst({
      where: { 
        name: { contains: categoryName },
        isActive: true
      },
      include: {
        subcategories: {
          where: { isActive: true }
        }
      }
    });
  }

  async getTestServiceItem(serviceName) {
    return await this.prisma.serviceItem.findFirst({
      where: { 
        name: { contains: serviceName },
        isActive: true
      },
      include: {
        category: true,
        subcategory: true
      }
    });
  }

  // Database cleanup
  async cleanupTestData() {
    // Clean up in reverse order of dependencies
    await this.prisma.ticketComment.deleteMany({
      where: { 
        ticket: { 
          createdBy: { 
            email: { contains: 'test-' }
          }
        }
      }
    });

    await this.prisma.ticketHistory.deleteMany({
      where: { 
        ticket: { 
          createdBy: { 
            email: { contains: 'test-' }
          }
        }
      }
    });

    await this.prisma.ticket.deleteMany({
      where: { 
        createdBy: { 
          email: { contains: 'test-' }
        }
      }
    });

    await this.prisma.user.deleteMany({
      where: { 
        email: { contains: 'test-' }
      }
    });

    // Clear internal tracking
    this.testUsers.clear();
    this.testTickets = [];
    this.testBranches = [];
  }

  // Test data validation helpers
  validateTicketData(ticket, expectedData = {}) {
    const validations = {
      hasId: ticket.id != null,
      hasTitle: ticket.title && ticket.title.length > 0,
      hasDescription: ticket.description && ticket.description.length > 0,
      hasValidStatus: ['pending_approval', 'new', 'assigned', 'in_progress', 'pending', 'resolved', 'closed'].includes(ticket.status),
      hasValidPriority: ['low', 'medium', 'high', 'urgent'].includes(ticket.priority),
      hasCreatedBy: ticket.createdById != null,
      hasCreatedAt: ticket.createdAt != null,
      hasUpdatedAt: ticket.updatedAt != null,
      ...expectedData
    };

    return validations;
  }

  validateUserData(user, expectedData = {}) {
    const validations = {
      hasId: user.id != null,
      hasEmail: user.email && user.email.includes('@'),
      hasName: user.name && user.name.length > 0,
      hasValidRole: ['admin', 'manager', 'technician', 'requester'].includes(user.role),
      isActive: user.isActive === true,
      hasCreatedAt: user.createdAt != null,
      hasUpdatedAt: user.updatedAt != null,
      ...expectedData
    };

    return validations;
  }

  // Wait helpers for async operations
  async waitForTicketStatus(ticketId, expectedStatus, maxWaitMs = 5000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const ticket = await this.prisma.ticket.findUnique({
        where: { id: ticketId }
      });
      
      if (ticket && ticket.status === expectedStatus) {
        return ticket;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`Ticket ${ticketId} did not reach status ${expectedStatus} within ${maxWaitMs}ms`);
  }

  async waitForNotification(userId, notificationType, maxWaitMs = 3000) {
    // Mock implementation for notification waiting
    // In real implementation, this would check the notification system
    await new Promise(resolve => setTimeout(resolve, 100));
    return { userId, type: notificationType, timestamp: new Date() };
  }

  // Test environment helpers
  isTestEnvironment() {
    return process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';
  }

  getTestApiBaseUrl() {
    return process.env.TEST_API_BASE_URL || 'http://localhost:3001';
  }

  getTestFrontendUrl() {
    return process.env.TEST_FRONTEND_URL || 'http://localhost:3000';
  }

  // Random test data generators
  generateRandomEmail() {
    return `test-${Math.random().toString(36).substring(7)}@bsg.co.id`;
  }

  generateRandomString(length = 10) {
    return Math.random().toString(36).substring(2, length + 2);
  }

  generateRandomTicketTitle() {
    const subjects = [
      'BSGDirect Login Issue',
      'Email Access Problem', 
      'Network Connectivity Issue',
      'Password Reset Request',
      'System Performance Problem',
      'Application Error Report',
      'Hardware Malfunction',
      'Software Installation Request'
    ];
    
    return subjects[Math.floor(Math.random() * subjects.length)] + ` - Test ${Date.now()}`;
  }

  // Performance testing helpers
  async measureExecutionTime(fn) {
    const startTime = process.hrtime.bigint();
    const result = await fn();
    const endTime = process.hrtime.bigint();
    const executionTimeMs = Number(endTime - startTime) / 1000000;
    
    return {
      result,
      executionTimeMs
    };
  }

  // Close database connection
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = TestSetup;