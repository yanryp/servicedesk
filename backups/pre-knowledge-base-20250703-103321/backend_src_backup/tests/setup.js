// src/tests/setup.js
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Setup test environment
beforeAll(async () => {
  // Ensure database connection
  try {
    await prisma.$connect();
    console.log('✅ Test database connected');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('✅ Test database disconnected');
});

// Global test utilities
global.testUtils = {
  // Helper to create test user
  createTestUser: async (overrides = {}) => {
    return await prisma.user.create({
      data: {
        username: 'test-user',
        email: 'test@example.com',
        passwordHash: 'test-hash',
        role: 'technician',
        ...overrides
      }
    });
  },

  // Helper to cleanup test data
  cleanup: async () => {
    // Clean up test data in correct order (respect foreign keys)
    await prisma.templateUsageLog.deleteMany({
      where: { sessionId: { contains: 'test' } }
    });
    
    await prisma.masterDataEntity.deleteMany({
      where: { code: { startsWith: 'TEST' } }
    });
    
    await prisma.user.deleteMany({
      where: { email: { contains: 'test' } }
    });
  }
};

// Load environment variables
require('dotenv').config();

// Set test environment variables
process.env.NODE_ENV = 'test';
// Use the same JWT_SECRET as the server for token compatibility
process.env.JWT_SECRET = process.env.JWT_SECRET || 'VERY_VERY_VERY_SECRET_KEY';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://yanrypangouw@localhost:5432/ticketing_system_db';