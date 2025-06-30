const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBranchUsers() {
  console.log('🏢 Checking current users and their branch assignments...\n');
  
  // Get all users with their departments and manager relationships
  const users = await prisma.user.findMany({
    include: {
      department: true,
      manager: true,
      subordinates: true
    },
    orderBy: { role: 'asc' }
  });
  
  console.log('👥 CURRENT USERS:');
  users.forEach(user => {
    console.log(`- ${user.email} (${user.username})`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Department: ${user.department?.name || 'No department'}`);
    console.log(`  Unit ID: ${user.unitId || 'No unit'}`);
    console.log(`  Manager: ${user.manager?.email || 'No manager'}`);
    console.log(`  Is Business Reviewer: ${user.isBusinessReviewer}`);
    if (user.subordinates.length > 0) {
      console.log(`  Subordinates: ${user.subordinates.map(s => s.email).join(', ')}`);
    }
    console.log('');
  });
  
  // Check branch units
  console.log('🏢 CHECKING BRANCH UNITS:');
  const branches = await prisma.unit.findMany({
    where: {
      unitType: 'branch'
    },
    orderBy: { sortOrder: 'asc' }
  });
  
  if (branches.length > 0) {
    console.log('Available branches:');
    branches.forEach(branch => {
      console.log(`- ${branch.name} (${branch.code}) - ID: ${branch.id}`);
    });
  } else {
    console.log('❌ No branch units found');
  }
}

checkBranchUsers().catch(console.error).finally(() => process.exit());