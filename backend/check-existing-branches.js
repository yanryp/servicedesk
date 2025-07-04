const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingBranches() {
  try {
    console.log('=== CHECKING EXISTING BRANCHES IN DATABASE ===');
    
    const branches = await prisma.unit.findMany({
      where: {
        OR: [
          { unitType: 'CABANG' },
          { unitType: 'CAPEM' }
        ]
      },
      select: {
        id: true,
        code: true,
        name: true,
        displayName: true,
        unitType: true,
        province: true,
        region: true,
        isActive: true,
        address: true,
        phone: true,
        metadata: true
      },
      orderBy: [
        { unitType: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`\nFound ${branches.length} branches in database:`);
    console.log('\n=== CABANG BRANCHES ===');
    branches.filter(b => b.unitType === 'CABANG').forEach(branch => {
      console.log(`ID: ${branch.id} | Code: ${branch.code} | Name: ${branch.name}`);
      console.log(`  Province: ${branch.province || 'N/A'} | Region: ${branch.region || 'N/A'}`);
      console.log(`  Active: ${branch.isActive} | Address: ${branch.address || 'N/A'}`);
      console.log('');
    });

    console.log('\n=== CAPEM BRANCHES ===');
    branches.filter(b => b.unitType === 'CAPEM').forEach(branch => {
      console.log(`ID: ${branch.id} | Code: ${branch.code} | Name: ${branch.name}`);
      console.log(`  Province: ${branch.province || 'N/A'} | Region: ${branch.region || 'N/A'}`);
      console.log(`  Active: ${branch.isActive} | Address: ${branch.address || 'N/A'}`);
      console.log('');
    });

    // Check if there are any other unit types
    const allUnits = await prisma.unit.findMany({
      select: {
        unitType: true
      },
      distinct: ['unitType']
    });

    console.log('\n=== ALL UNIT TYPES IN DATABASE ===');
    allUnits.forEach(unit => {
      console.log(`- ${unit.unitType}`);
    });

    // Check total counts
    const counts = await prisma.unit.groupBy({
      by: ['unitType'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    });

    console.log('\n=== ACTIVE UNIT COUNTS ===');
    counts.forEach(count => {
      console.log(`${count.unitType}: ${count._count.id} units`);
    });

  } catch (error) {
    console.error('Error checking branches:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingBranches();