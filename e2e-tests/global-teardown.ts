import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

async function globalTeardown() {
  console.log('🧹 Starting E2E Test Global Teardown');
  
  // Initialize Prisma client for test database
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/ticketing_test'
      }
    }
  });

  try {
    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    
    // Delete test tickets
    const deletedTickets = await prisma.ticket.deleteMany({ 
      where: { title: { startsWith: 'E2E Test:' } } 
    });
    console.log(`🎫 Deleted ${deletedTickets.count} test tickets`);
    
    // Delete test users
    const deletedUsers = await prisma.user.deleteMany({ 
      where: { email: { endsWith: '@e2e-test.com' } } 
    });
    console.log(`👥 Deleted ${deletedUsers.count} test users`);
    
    // Clean up authentication state files
    console.log('🔐 Cleaning up authentication states...');
    const authStatesDir = path.join(__dirname, 'auth-states');
    
    if (fs.existsSync(authStatesDir)) {
      const authFiles = fs.readdirSync(authStatesDir);
      for (const file of authFiles) {
        if (file.endsWith('-auth.json')) {
          fs.unlinkSync(path.join(authStatesDir, file));
          console.log(`🗂️ Deleted ${file}`);
        }
      }
    }
    
    // Clean up temporary test files
    console.log('📁 Cleaning up temporary files...');
    const tempDirs = [
      'e2e-test-results/downloads',
      'e2e-test-results/videos',
      'e2e-test-results/traces'
    ];
    
    for (const dir of tempDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`📂 Cleaned up ${dir}`);
      }
    }
    
    console.log('✅ Global teardown completed successfully');
    
  } catch (error) {
    console.error('❌ Global teardown failed:', error);
    // Don't throw error to avoid failing the test run
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;