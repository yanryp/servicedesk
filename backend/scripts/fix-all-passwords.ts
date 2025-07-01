import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixAllPasswords() {
  console.log('🔧 Fixing passwords for all test users...');
  
  try {
    const newHash = await bcrypt.hash('password123', 10);
    
    const result = await prisma.user.updateMany({
      data: { passwordHash: newHash }
    });
    
    console.log(`✅ Updated passwords for ${result.count} users`);
    console.log('🔐 All users now have password: "password123"');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPasswords();