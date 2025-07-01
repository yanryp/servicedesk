import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔧 Creating missing test users...');
    
    const itDept = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });
    
    const supportDept = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });
    
    const branch = await prisma.unit.findFirst({
      where: { code: 'UTAMA' }
    });
    
    if (!itDept || !supportDept || !branch) {
      console.error('Required departments or branch not found');
      console.log('IT Dept:', itDept?.name);
      console.log('Support Dept:', supportDept?.name);
      console.log('Branch:', branch?.name);
      return;
    }
    
    // Create a technician in IT department if not exists
    const existingTechnician = await prisma.user.findFirst({
      where: { 
        role: 'technician',
        departmentId: itDept.id
      }
    });
    
    let technician = existingTechnician;
    if (!technician) {
      technician = await prisma.user.create({
        data: {
          username: 'test.technician.it',
          name: 'Test IT Technician',
          email: 'test.technician@bsg.co.id',
          passwordHash: '$2b$10$rKz8QQg7gD4M8Xv2L5nJ7uGjK3mP9wF2eR8tY6qA1sB4nC7vX2zL9',
          role: 'technician',
          departmentId: itDept.id,
          unitId: null // Department-level technician
        }
      });
      console.log('✅ Created IT technician:', technician.username);
    } else {
      console.log('✅ Found existing IT technician:', technician.username);
    }
    
    // Create a requester in Support department if not exists  
    const existingRequester = await prisma.user.findFirst({
      where: { 
        role: 'requester',
        unitId: branch.id,
        departmentId: supportDept.id
      }
    });
    
    let requester = existingRequester;
    if (!requester) {
      requester = await prisma.user.create({
        data: {
          username: 'test.requester.support',
          name: 'Test Support Requester',
          email: 'test.requester@bsg.co.id',
          passwordHash: '$2b$10$rKz8QQg7gD4M8Xv2L5nJ7uGjK3mP9wF2eR8tY6qA1sB4nC7vX2zL9',
          role: 'requester',
          departmentId: supportDept.id,
          unitId: branch.id
        }
      });
      console.log('✅ Created support requester:', requester.username);
    } else {
      console.log('✅ Found existing support requester:', requester.username);
    }
    
    // Check existing manager
    const manager = await prisma.user.findFirst({
      where: { 
        role: 'manager',
        unitId: branch.id,
        isBusinessReviewer: true
      }
    });
    
    if (manager) {
      console.log('✅ Found existing manager:', manager.username);
    } else {
      console.log('❌ No manager found with business reviewer privileges');
    }
    
    console.log('\n📊 Test users ready:');
    console.log('- Requester:', requester?.username || 'NOT CREATED', '(Department:', supportDept.name, ')');
    console.log('- Manager:', manager?.username || 'NOT FOUND', '(Business Reviewer:', manager?.isBusinessReviewer || false, ')');
    console.log('- Technician:', technician?.username || 'NOT CREATED', '(Department:', itDept.name, ')');
    
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();