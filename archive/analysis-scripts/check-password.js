const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@company.com' },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        role: true
      }
    });
    
    if (admin) {
      console.log('Admin user found:', admin.username);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Password hash:', admin.passwordHash);
      
      // Test common passwords
      const testPasswords = ['password', 'admin', 'admin123', 'password123', '123456', 'admin@company.com'];
      
      for (const password of testPasswords) {
        const isMatch = await bcrypt.compare(password, admin.passwordHash);
        if (isMatch) {
          console.log(`✅ Password found: "${password}"`);
          break;
        } else {
          console.log(`❌ Not: "${password}"`);
        }
      }
    } else {
      console.log('Admin user not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();