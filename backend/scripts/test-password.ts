import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@company.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      passwordHashLength: user.passwordHash.length
    });
    
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, user.passwordHash);
    
    console.log('🔐 Password test:', {
      testPassword,
      isValid,
      storedHash: user.passwordHash.substring(0, 20) + '...'
    });
    
    if (!isValid) {
      console.log('🔧 Fixing password...');
      const newHash = await bcrypt.hash(testPassword, 10);
      await prisma.user.update({
        where: { email: 'admin@company.com' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password updated');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();