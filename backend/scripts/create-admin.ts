import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Create basic departments first
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

    // Create a test admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bsg.co.id' },
      update: {},
      create: {
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@bsg.co.id',
        passwordHash: hashedPassword,
        role: 'admin',
        departmentId: itDept.id,
        isBusinessReviewer: true,
        workloadCapacity: 50,
        experienceLevel: 'expert',
        primarySkill: 'system_administration'
      }
    });

    // Create a test requester user
    const requesterPassword = await bcrypt.hash('user123', 10);
    
    const requester = await prisma.user.upsert({
      where: { email: 'user@bsg.co.id' },
      update: {},
      create: {
        username: 'user.test',
        name: 'Test User',
        email: 'user@bsg.co.id',
        passwordHash: requesterPassword,
        role: 'requester',
        departmentId: supportDept.id
      }
    });

    console.log('✅ Admin and test users created successfully!');
    console.log('Admin login: admin@bsg.co.id / admin123');
    console.log('User login: user@bsg.co.id / user123');
    
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();