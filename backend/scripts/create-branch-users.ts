#!/usr/bin/env npx ts-node

/**
 * Create Branch Users for CSV Template Testing
 * 
 * Creates users for Cabang Utama and Cabang Kotamobagu with proper unit assignments:
 * - Branch requesters (users)
 * - Branch managers (approvers) 
 * - Department technicians (processors)
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏦 Creating Branch Users for CSV Template Testing...\n');

  try {
    // Find or create units for the branches
    const cabangUtamaUnit = await prisma.unit.upsert({
      where: { code: 'CABANG_UTAMA' },
      update: {},
      create: {
        code: 'CABANG_UTAMA',
        name: 'Cabang Utama',
        displayName: 'Kantor Cabang Utama',
        unitType: 'branch',
        isActive: true,
        sortOrder: 1,
        departmentId: 2, // Dukungan dan Layanan department
        metadata: {
          branchCode: 'CU001',
          location: 'Kantor Pusat',
          operationalHours: '08:00-16:00'
        }
      }
    });

    const cabangKotamobaguUnit = await prisma.unit.upsert({
      where: { code: 'CABANG_KOTAMOBAGU' },
      update: {},
      create: {
        code: 'CABANG_KOTAMOBAGU', 
        name: 'Cabang Kotamobagu',
        displayName: 'Kantor Cabang Kotamobagu',
        unitType: 'branch',
        isActive: true,
        sortOrder: 2,
        departmentId: 2, // Dukungan dan Layanan department
        metadata: {
          branchCode: 'CK002',
          location: 'Kotamobagu',
          operationalHours: '08:00-16:00'
        }
      }
    });

    console.log(`✅ Units created/verified:`);
    console.log(`   - ${cabangUtamaUnit.displayName} (ID: ${cabangUtamaUnit.id})`);
    console.log(`   - ${cabangKotamobaguUnit.displayName} (ID: ${cabangKotamobaguUnit.id})\n`);

    // Create branch users
    const users = [
      // Cabang Utama Users
      {
        username: 'utama.user',
        email: 'utama.user@company.com',
        password: 'user123',
        role: 'requester',
        unitId: cabangUtamaUnit.id,
        departmentId: 2,
        isBusinessReviewer: false,
        description: 'Cabang Utama Branch User (Requester)'
      },
      {
        username: 'utama.manager',
        email: 'utama.manager@company.com', 
        password: 'manager123',
        role: 'manager',
        unitId: cabangUtamaUnit.id,
        departmentId: 2,
        isBusinessReviewer: true,
        description: 'Cabang Utama Branch Manager (Approver)'
      },
      
      // Cabang Kotamobagu Users
      {
        username: 'kotamobagu.user',
        email: 'kotamobagu.user@company.com',
        password: 'user123', 
        role: 'requester',
        unitId: cabangKotamobaguUnit.id,
        departmentId: 2,
        isBusinessReviewer: false,
        description: 'Cabang Kotamobagu Branch User (Requester)'
      },
      {
        username: 'kotamobagu.manager',
        email: 'kotamobagu.manager@company.com',
        password: 'manager123',
        role: 'manager', 
        unitId: cabangKotamobaguUnit.id,
        departmentId: 2,
        isBusinessReviewer: true,
        description: 'Cabang Kotamobagu Branch Manager (Approver)'
      },

      // Central Department Technicians
      {
        username: 'it.technician',
        email: 'it.technician@company.com',
        password: 'tech123',
        role: 'technician',
        unitId: null, // Central department, not branch-specific
        departmentId: 1, // IT Operations department
        isBusinessReviewer: false,
        description: 'IT Operations Technician (Processes ALL technical tickets)'
      },
      {
        username: 'support.technician', 
        email: 'support.technician@company.com',
        password: 'tech123',
        role: 'technician',
        unitId: null, // Central department, not branch-specific
        departmentId: 2, // Dukungan dan Layanan department
        isBusinessReviewer: false,
        description: 'Support Technician (KASDA/BSGDirect user management only)'
      }
    ];

    console.log('👥 Creating branch and department users...\n');

    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          username: userData.username,
          role: userData.role,
          unitId: userData.unitId,
          departmentId: userData.departmentId,
          isBusinessReviewer: userData.isBusinessReviewer,
          isAvailable: true
        },
        create: {
          username: userData.username,
          email: userData.email,
          passwordHash: hashedPassword,
          role: userData.role,
          unitId: userData.unitId,
          departmentId: userData.departmentId,
          isBusinessReviewer: userData.isBusinessReviewer,
          isAvailable: true,
          currentWorkload: 0,
          workloadCapacity: 10
        }
      });

      const unitInfo = userData.unitId ? 
        `Unit: ${userData.unitId === cabangUtamaUnit.id ? 'Cabang Utama' : 'Cabang Kotamobagu'}` : 
        'Central Department';
      
      console.log(`✅ ${userData.description}`);
      console.log(`   📧 ${user.email} (${user.username})`);
      console.log(`   🏢 ${unitInfo}, Department: ${userData.departmentId === 1 ? 'IT Operations' : 'Dukungan & Layanan'}`);
      console.log(`   🔑 Password: ${userData.password}\n`);
    }

    // Verify user assignments and department structure
    console.log('📊 User Assignment Summary:\n');
    
    const itDeptUsers = await prisma.user.findMany({
      where: { departmentId: 1 },
      include: { unit: true }
    });
    
    const supportDeptUsers = await prisma.user.findMany({
      where: { departmentId: 2 },
      include: { unit: true }
    });

    console.log('🖥️  IT Operations Department:');
    itDeptUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.unit?.displayName || 'Central'}`);
    });

    console.log('\n🤝 Dukungan & Layanan Department:');
    supportDeptUsers.forEach(user => {
      console.log(`   - ${user.username} (${user.role}) - ${user.unit?.displayName || 'Central'}`);
    });

    console.log('\n🎯 Service Authority Structure:');
    console.log('   📋 Branch Users → Request tickets from their branch unit');
    console.log('   ✅ Branch Managers → Approve tickets from their branch unit only');
    console.log('   🔧 IT Technician → Process ALL technical tickets (272 templates)');
    console.log('   🤝 Support Technician → Process KASDA/BSGDirect user management only');

    console.log('\n✨ Branch users created successfully! Ready for CSV template testing.');

  } catch (error) {
    console.error('❌ Error creating branch users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});