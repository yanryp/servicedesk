#!/usr/bin/env npx ts-node

// Reset test user password for API testing
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetTestUserPassword() {
  try {
    console.log('🔄 Resetting test user password...');
    
    // Hash the password
    const password = 'testpass123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update the test requester user
    const updatedUser = await prisma.user.update({
      where: {
        email: 'test.requester@bsg.co.id'
      },
      data: {
        passwordHash: hashedPassword
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        unit: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });
    
    console.log('✅ Password reset successful!');
    console.log('📋 User Details:');
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Username: ${updatedUser.username}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Unit: ${updatedUser.unit?.name || 'No unit'}`);
    console.log(`   New Password: ${password}`);
    console.log('');
    console.log('🧪 Test Login Command:');
    console.log(`curl -X POST http://localhost:3001/api/auth/login \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -d '{"email": "${updatedUser.email}", "password": "${password}"}'`);
    
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      console.log('');
      console.log('🔍 User not found. Available users:');
      
      const users = await prisma.user.findMany({
        select: {
          email: true,
          role: true
        },
        take: 10
      });
      
      users.forEach(user => {
        console.log(`   - ${user.email} (${user.role})`);
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

resetTestUserPassword();