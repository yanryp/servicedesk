import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function restoreTestCredentials() {
  console.log('🔄 Restoring comprehensive test credentials...');
  
  try {
    // Create departments first
    const itDept = await prisma.department.upsert({
      where: { name: 'Information Technology' },
      update: {},
      create: {
        name: 'Information Technology',
        description: 'IT Support and Infrastructure',
        departmentType: 'internal',
        isServiceOwner: true
      }
    });

    const supportDept = await prisma.department.upsert({
      where: { name: 'Dukungan dan Layanan' },
      update: {},
      create: {
        name: 'Dukungan dan Layanan',
        description: 'Customer Support and Services',
        departmentType: 'service',
        isServiceOwner: true
      }
    });

    // Create units (branches)
    const cabangUtama = await prisma.unit.upsert({
      where: { code: 'UTAMA' },
      update: {},
      create: {
        code: 'UTAMA',
        name: 'Kantor Cabang Utama',
        displayName: 'Utama Branch',
        unitType: 'CABANG',
        departmentId: supportDept.id,
        isActive: true,
        sortOrder: 1,
        address: 'Jl. Utama No. 1, Manado',
        phone: '0431-123456',
        region: 'Manado Metro',
        province: 'Sulawesi Utara'
      }
    });

    const cabangKotamobagu = await prisma.unit.upsert({
      where: { code: 'KOTAMOBAGU' },
      update: {},
      create: {
        code: 'KOTAMOBAGU',
        name: 'Kantor Cabang Kotamobagu',
        displayName: 'Kotamobagu Branch',
        unitType: 'CABANG',
        departmentId: supportDept.id,
        isActive: true,
        sortOrder: 2,
        address: 'Jl. Raya Kotamobagu No. 123',
        phone: '0434-789012',
        region: 'Bolaang Mongondow',
        province: 'Sulawesi Utara'
      }
    });

    const cabangGorontalo = await prisma.unit.upsert({
      where: { code: 'GORONTALO' },
      update: {},
      create: {
        code: 'GORONTALO',
        name: 'Kantor Cabang GORONTALO',
        displayName: 'Gorontalo Branch',
        unitType: 'CABANG',
        departmentId: supportDept.id,
        isActive: true,
        sortOrder: 3,
        address: 'Jl. Ahmad Yani No. 45, Gorontalo',
        phone: '0435-654321',
        region: 'Gorontalo Metro',
        province: 'Gorontalo'
      }
    });

    const cabangBitung = await prisma.unit.upsert({
      where: { code: 'BITUNG' },
      update: {},
      create: {
        code: 'BITUNG',
        name: 'Kantor Cabang BITUNG',
        displayName: 'Bitung Branch',
        unitType: 'CABANG',
        departmentId: supportDept.id,
        isActive: true,
        sortOrder: 4,
        address: 'Jl. Pelabuhan Bitung No. 88',
        phone: '0438-333444',
        region: 'North Coast',
        province: 'Sulawesi Utara'
      }
    });

    // Hash password for all test users
    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('👑 Creating admin users...');
    
    // System Administrator
    await prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@company.com',
        passwordHash: hashedPassword,
        role: 'admin',
        departmentId: itDept.id,
        isBusinessReviewer: true,
        workloadCapacity: 50,
        experienceLevel: 'expert',
        primarySkill: 'system_administration'
      }
    });

    console.log('👔 Creating manager users...');

    // Utama Branch Managers
    await prisma.user.upsert({
      where: { email: 'utama.manager@company.com' },
      update: {},
      create: {
        username: 'utama.manager',
        name: 'Utama Branch Manager',
        email: 'utama.manager@company.com',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangUtama.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    await prisma.user.upsert({
      where: { email: 'rahma.pradana.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'rahma.pradana.manager.utama',
        name: 'Rahma Pradana',
        email: 'rahma.pradana.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangUtama.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    await prisma.user.upsert({
      where: { email: 'putri.anggraini.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'putri.anggraini.manager.utama',
        name: 'Putri Anggraini',
        email: 'putri.anggraini.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangUtama.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    // Kotamobagu Branch Managers
    await prisma.user.upsert({
      where: { email: 'kotamobagu.manager@company.com' },
      update: {},
      create: {
        username: 'kotamobagu.manager',
        name: 'Kotamobagu Branch Manager',
        email: 'kotamobagu.manager@company.com',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangKotamobagu.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    await prisma.user.upsert({
      where: { email: 'sinta.pratama.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'sinta.pratama.manager.kotamobagu',
        name: 'Sinta Pratama',
        email: 'sinta.pratama.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangKotamobagu.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    await prisma.user.upsert({
      where: { email: 'rina.fadilah.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'rina.fadilah.manager.kotamobagu',
        name: 'Rina Fadilah',
        email: 'rina.fadilah.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangKotamobagu.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    await prisma.user.upsert({
      where: { email: 'test.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'test.manager.branch',
        name: 'Test Manager',
        email: 'test.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangKotamobagu.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    // Gorontalo Branch Manager
    await prisma.user.upsert({
      where: { email: 'ahmad.manager@bsg.co.id' },
      update: {},
      create: {
        username: 'ahmad.manager.gorontalo',
        name: 'Ahmad Manager',
        email: 'ahmad.manager@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'manager',
        unitId: cabangGorontalo.id,
        isBusinessReviewer: true,
        workloadCapacity: 30
      }
    });

    // General Manager (No specific branch)
    await prisma.user.upsert({
      where: { email: 'branch.manager@company.com' },
      update: {},
      create: {
        username: 'branch.manager',
        name: 'General Manager',
        email: 'branch.manager@company.com',
        passwordHash: hashedPassword,
        role: 'manager',
        isBusinessReviewer: true,
        workloadCapacity: 40
      }
    });

    console.log('🔧 Creating technician users...');

    // IT Operations Technician
    await prisma.user.upsert({
      where: { email: 'it.technician@company.com' },
      update: {},
      create: {
        username: 'it.technician',
        name: 'IT Operations Technician',
        email: 'it.technician@company.com',
        passwordHash: hashedPassword,
        role: 'technician',
        departmentId: itDept.id,
        workloadCapacity: 15,
        experienceLevel: 'intermediate',
        primarySkill: 'network_infrastructure',
        secondarySkills: 'Network Admin, Server Management, IT Support'
      }
    });

    // Banking Systems Technician
    await prisma.user.upsert({
      where: { email: 'banking.tech@company.com' },
      update: {},
      create: {
        username: 'banking.tech',
        name: 'Banking Systems Technician',
        email: 'banking.tech@company.com',
        passwordHash: hashedPassword,
        role: 'technician',
        departmentId: supportDept.id,
        workloadCapacity: 15,
        experienceLevel: 'expert',
        primarySkill: 'banking_systems',
        secondarySkills: 'KASDA, BSGDirect, Core Banking'
      }
    });

    console.log('👥 Creating requester users...');

    // Utama Branch Requesters
    await prisma.user.upsert({
      where: { email: 'utama.user@company.com' },
      update: {},
      create: {
        username: 'utama.user',
        name: 'Utama Branch User',
        email: 'utama.user@company.com',
        passwordHash: hashedPassword,
        role: 'requester',
        unitId: cabangUtama.id
      }
    });

    await prisma.user.upsert({
      where: { email: 'gilang.hartono.user@bsg.co.id' },
      update: {},
      create: {
        username: 'gilang.hartono.user.utama',
        name: 'Gilang Hartono',
        email: 'gilang.hartono.user@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'requester',
        unitId: cabangUtama.id
      }
    });

    // Kotamobagu Branch Requesters
    await prisma.user.upsert({
      where: { email: 'kotamobagu.user@company.com' },
      update: {},
      create: {
        username: 'kotamobagu.user',
        name: 'Kotamobagu Branch User',
        email: 'kotamobagu.user@company.com',
        passwordHash: hashedPassword,
        role: 'requester',
        unitId: cabangKotamobagu.id
      }
    });

    await prisma.user.upsert({
      where: { email: 'sinta.trianto.user@bsg.co.id' },
      update: {},
      create: {
        username: 'sinta.trianto.user.kotamobagu',
        name: 'Sinta Trianto',
        email: 'sinta.trianto.user@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'requester',
        unitId: cabangKotamobagu.id
      }
    });

    // Bitung Branch Requester (WITH NAME FIELD!)
    await prisma.user.upsert({
      where: { email: 'sari.requester@bsg.co.id' },
      update: {},
      create: {
        username: 'sari.requester.bitung',
        name: 'Sari Dewi Kusuma',
        email: 'sari.requester@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'requester',
        unitId: cabangBitung.id
      }
    });

    // KASDA Specialized Users
    await prisma.user.upsert({
      where: { email: 'kasda.user@company.com' },
      update: {},
      create: {
        username: 'kasda.user',
        email: 'kasda.user@company.com',
        passwordHash: hashedPassword,
        role: 'requester',
        departmentId: supportDept.id,
        isKasdaUser: true
      }
    });

    await prisma.user.upsert({
      where: { email: 'bsgdirect.user@company.com' },
      update: {},
      create: {
        username: 'bsgdirect.user',
        name: 'BSGDirect User',
        email: 'bsgdirect.user@company.com',
        passwordHash: hashedPassword,
        role: 'requester',
        departmentId: supportDept.id
      }
    });

    // Test Requester
    await prisma.user.upsert({
      where: { email: 'test.requester@bsg.com' },
      update: {},
      create: {
        username: 'test_requester',
        name: 'Test Requester',
        email: 'test.requester@bsg.com',
        passwordHash: hashedPassword,
        role: 'requester'
      }
    });

    console.log('✅ All test credentials restored successfully!');
    console.log('\n📝 Available credentials (all with password: "password123"):');
    console.log('\n👑 ADMIN USERS:');
    console.log('- admin@company.com (System Administrator)');
    
    console.log('\n👔 MANAGER USERS:');
    console.log('- utama.manager@company.com (Utama Branch)');
    console.log('- rahma.pradana.manager@bsg.co.id (Utama Branch)');
    console.log('- putri.anggraini.manager@bsg.co.id (Utama Branch)');
    console.log('- kotamobagu.manager@company.com (Kotamobagu Branch)');
    console.log('- sinta.pratama.manager@bsg.co.id (Kotamobagu Branch)');
    console.log('- rina.fadilah.manager@bsg.co.id (Kotamobagu Branch)');
    console.log('- test.manager@bsg.co.id (Kotamobagu Branch)');
    console.log('- ahmad.manager@bsg.co.id (Gorontalo Branch)');
    console.log('- branch.manager@company.com (General Manager)');
    
    console.log('\n🔧 TECHNICIAN USERS:');
    console.log('- it.technician@company.com (IT Operations)');
    console.log('- banking.tech@company.com (Banking Systems)');
    
    console.log('\n👥 REQUESTER USERS:');
    console.log('- utama.user@company.com (Utama Branch)');
    console.log('- gilang.hartono.user@bsg.co.id (Utama Branch)');
    console.log('- kotamobagu.user@company.com (Kotamobagu Branch)');
    console.log('- sinta.trianto.user@bsg.co.id (Kotamobagu Branch)');
    console.log('- sari.requester@bsg.co.id (Bitung Branch - WITH NAME FIELD!)');
    console.log('- kasda.user@company.com (KASDA Specialized)');
    console.log('- bsgdirect.user@company.com (BSGDirect Specialized)');
    console.log('- test.requester@bsg.com (General Testing)');
    
    console.log('\n🎯 Ready for comprehensive testing! All credentials match your original TESTING_CREDENTIALS.md file.');

  } catch (error) {
    console.error('❌ Error restoring test credentials:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreTestCredentials();