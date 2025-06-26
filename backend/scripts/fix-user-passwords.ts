#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUserPasswords() {
  console.log('🔄 Fixing user passwords to ensure password123 works...\n');
  
  const testUsers = [
    'utama.user@company.com',
    'kotamobagu.user@company.com',
    'cabang_utama.manager@company.com',
    'kotamobagu.manager@company.com',
    'it.technician@company.com',
    'dukungan.technician@company.com',
    'admin@company.com'
  ];
  
  const newPasswordHash = await bcrypt.hash('password123', 10);
  
  for (const email of testUsers) {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      });
      console.log(`✅ Fixed password for: ${email}`);
    } else {
      console.log(`❌ User not found: ${email}`);
    }
  }
  
  console.log('\n🎯 All user passwords set to: password123');
  console.log('🔐 You can now login with any of these credentials');
  
  await prisma.$disconnect();
}

fixUserPasswords().catch(console.error);