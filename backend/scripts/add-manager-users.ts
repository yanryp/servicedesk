// Script to add manager and KASDA technician users
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function addManagerUsers() {
  console.log('🌱 Adding manager and KASDA technician users...');

  try {
    // Get the support department
    const supportDept = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });

    if (!supportDept) {
      throw new Error('Support department not found');
    }

    // Create manager user for approval workflow
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.create({
      data: {
        username: 'branch.manager',
        email: 'branch.manager@company.com',
        passwordHash: managerPassword,
        role: 'manager',
        departmentId: supportDept.id,
        isAvailable: true,
        isKasdaUser: false
      }
    });

    console.log('✅ Created manager user');

    // Create KASDA technician for proper routing
    const kasdaTechPassword = await bcrypt.hash('kasda123', 10);
    const kasdaTechnician = await prisma.user.create({
      data: {
        username: 'kasda.technician',
        email: 'kasda.technician@company.com',
        passwordHash: kasdaTechPassword,
        role: 'technician',
        departmentId: supportDept.id,
        isAvailable: true,
        isKasdaUser: true,
        primarySkill: 'KASDA Support'
      }
    });

    console.log('✅ Created KASDA technician user');

    console.log('🎉 Successfully added new users!');
    console.log('New users created:');
    console.log('  - branch.manager@company.com (manager123)');
    console.log('  - kasda.technician@company.com (kasda123)');

  } catch (error) {
    console.error('❌ Error adding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addManagerUsers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });