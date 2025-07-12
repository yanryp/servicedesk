const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTechnician() {
  try {
    // Find a technician in Information Technology department
    const technician = await prisma.user.findFirst({
      where: { 
        role: 'technician',
        department: {
          name: 'Information Technology'
        }
      },
      include: {
        department: true,
        unit: true
      }
    });

    if (technician) {
      console.log('✅ Found IT Technician:');
      console.log('Email:', technician.email);
      console.log('Name:', technician.name);
      console.log('Username:', technician.username);
      console.log('Department:', technician.department.name);
      console.log('Unit:', technician.unit?.name || 'N/A');
      console.log('\nDefault password for all users: password123');
    } else {
      console.log('❌ No IT technician found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findTechnician();