// Create IT user for testing unit-based approval workflows
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createITUser() {
  console.log('🔧 Creating IT requester user for testing...\n');

  try {
    // Get IT department and unit
    const itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });

    const itUnit = await prisma.unit.findFirst({
      where: { 
        name: 'Information Technology',
        unitType: 'department'
      }
    });

    if (!itDepartment || !itUnit) {
      console.log('❌ IT department or unit not found');
      return;
    }

    console.log(`✅ Found IT department (ID: ${itDepartment.id}) and unit (ID: ${itUnit.id})`);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'it.user@company.com' }
    });

    if (existingUser) {
      console.log('✅ IT user already exists:', existingUser.username);
      return;
    }

    // Create IT user
    const hashedPassword = await bcrypt.hash('user123', 10);
    
    const itUser = await prisma.user.create({
      data: {
        username: 'it.user',
        email: 'it.user@company.com',
        passwordHash: hashedPassword,
        role: 'requester',
        departmentId: itDepartment.id,
        unitId: itUnit.id,
        isAvailable: true,
        isKasdaUser: false,
        isBusinessReviewer: false
      },
      include: {
        department: { select: { name: true } },
        unit: { select: { name: true, unitType: true } }
      }
    });

    console.log('✅ Created IT user:');
    console.log(`   Username: ${itUser.username}`);
    console.log(`   Email: ${itUser.email}`);
    console.log(`   Role: ${itUser.role}`);
    console.log(`   Department: ${itUser.department?.name}`);
    console.log(`   Unit: ${itUser.unit?.name} (${itUser.unit?.unitType})`);
    console.log(`   Password: user123`);

  } catch (error) {
    console.error('❌ Error creating IT user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createITUser();