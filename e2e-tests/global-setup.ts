import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E Test Global Setup');
  
  // Initialize Prisma client for test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/ticketing_test'
      }
    }
  });

  try {
    // Clean up any existing test data
    console.log('🧹 Cleaning test database...');
    await prisma.ticket.deleteMany({ where: { title: { startsWith: 'E2E Test:' } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@e2e-test.com' } } });
    
    // Create test users for different roles
    console.log('👥 Creating test users...');
    
    const passwordHash = await bcrypt.hash('test123456', 10);
    
    // Create test admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'e2e-admin',
        email: 'admin@e2e-test.com',
        passwordHash,
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true
      }
    });

    // Create test manager user
    const managerUser = await prisma.user.create({
      data: {
        username: 'e2e-manager',
        email: 'manager@e2e-test.com',
        passwordHash,
        role: 'manager',
        firstName: 'Manager',
        lastName: 'User',
        isActive: true
      }
    });

    // Create test requester user (BSG Banking department)
    const requesterUser = await prisma.user.create({
      data: {
        username: 'e2e-requester',
        email: 'requester@e2e-test.com',
        passwordHash,
        role: 'requester',
        firstName: 'BSG',
        lastName: 'Requester',
        department: 'BSG Banking Operations',
        isActive: true
      }
    });

    // Create test technician user
    const technicianUser = await prisma.user.create({
      data: {
        username: 'e2e-technician',
        email: 'technician@e2e-test.com',
        passwordHash,
        role: 'technician',
        firstName: 'Tech',
        lastName: 'Support',
        isActive: true
      }
    });

    console.log('✅ Test users created:', {
      admin: adminUser.id,
      manager: managerUser.id,
      requester: requesterUser.id,
      technician: technicianUser.id
    });

    // Verify BSG templates exist
    console.log('🏦 Verifying BSG templates...');
    const templateCount = await prisma.bsgTemplate.count();
    console.log(`📋 Found ${templateCount} BSG templates`);

    if (templateCount === 0) {
      console.warn('⚠️ No BSG templates found. Some E2E tests may fail.');
    }

    // Verify BSG field types exist
    const fieldTypeCount = await prisma.bsgFieldType.count();
    console.log(`🔧 Found ${fieldTypeCount} BSG field types`);

    // Set up authentication state for tests
    console.log('🔐 Setting up authentication for E2E tests...');
    
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Navigate to login page and authenticate as admin
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Check if already on login page or navigate to it
    if (await page.locator('input[type="email"]').isVisible()) {
      await page.fill('input[type="email"]', 'admin@e2e-test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }

    // Save authentication state
    await context.storageState({ path: 'e2e-tests/auth-states/admin-auth.json' });

    // Authenticate as manager
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'manager@e2e-test.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await context.storageState({ path: 'e2e-tests/auth-states/manager-auth.json' });

    // Authenticate as requester
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'requester@e2e-test.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await context.storageState({ path: 'e2e-tests/auth-states/requester-auth.json' });

    // Authenticate as technician
    await context.clearCookies();
    await page.goto('/login');
    await page.fill('input[type="email"]', 'technician@e2e-test.com');
    await page.fill('input[type="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await context.storageState({ path: 'e2e-tests/auth-states/technician-auth.json' });

    await browser.close();

    console.log('✅ Authentication states saved for all user roles');
    console.log('🎯 Global setup completed successfully');

  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalSetup;