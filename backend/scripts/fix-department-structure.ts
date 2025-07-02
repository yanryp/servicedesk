import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDepartmentStructure() {
  console.log('🔧 Fixing department structure...');

  try {
    // First, let's analyze the current state
    console.log('📊 Current department analysis:');
    
    const departments = await prisma.department.findMany({
      include: {
        serviceCatalog: true,
        users: true,
        units: true
      },
      orderBy: { id: 'asc' }
    });

    departments.forEach(dept => {
      console.log(`\n📁 ${dept.name} (ID: ${dept.id})`);
      console.log(`   Service Owner: ${dept.isServiceOwner}`);
      console.log(`   Service Catalogs: ${dept.serviceCatalog.length}`);
      console.log(`   Users: ${dept.users.length}`);
      console.log(`   Units: ${dept.units.length}`);
    });

    // Find the departments
    const itDept = await prisma.department.findFirst({ 
      where: { name: 'Information Technology' },
      include: { users: true, units: true }
    });
    
    const supportDept = await prisma.department.findFirst({ 
      where: { name: 'Dukungan dan Layanan' },
      include: { users: true, units: true }
    });
    
    const operationsDept = await prisma.department.findFirst({ 
      where: { name: 'Operations' },
      include: { users: true, units: true }
    });

    if (!itDept || !supportDept || !operationsDept) {
      throw new Error('One or more required departments not found');
    }

    console.log('\n🔄 Starting migration...');

    // Step 1: Move all branch units from Operations to Dukungan dan Layanan
    // This makes sense because branches primarily handle customer service and banking operations
    console.log('\n📦 Moving branch units from Operations to Dukungan dan Layanan...');
    
    const unitsToMove = await prisma.unit.findMany({
      where: { departmentId: operationsDept.id }
    });

    console.log(`Found ${unitsToMove.length} units to move:`);
    unitsToMove.forEach(unit => {
      console.log(`  - ${unit.name} (${unit.code}) - ${unit.unitType}`);
    });

    await prisma.unit.updateMany({
      where: { departmentId: operationsDept.id },
      data: { departmentId: supportDept.id }
    });

    console.log('✅ Units moved successfully');

    // Step 2: Move branch managers and requesters from Operations to Dukungan dan Layanan
    console.log('\n👥 Moving branch users from Operations to Dukungan dan Layanan...');
    
    const usersToMove = await prisma.user.findMany({
      where: { 
        departmentId: operationsDept.id,
        role: { in: ['manager', 'requester'] }
      }
    });

    console.log(`Found ${usersToMove.length} users to move:`);
    usersToMove.forEach(user => {
      console.log(`  - ${user.name} (${user.role}) - ${user.email}`);
    });

    await prisma.user.updateMany({
      where: { 
        departmentId: operationsDept.id,
        role: { in: ['manager', 'requester'] }
      },
      data: { departmentId: supportDept.id }
    });

    console.log('✅ Users moved successfully');

    // Step 3: Delete the Operations department (since it should not exist)
    console.log('\n🗑️ Removing Operations department...');
    
    // First check if there are any remaining dependencies
    const remainingUsers = await prisma.user.count({
      where: { departmentId: operationsDept.id }
    });
    
    const remainingUnits = await prisma.unit.count({
      where: { departmentId: operationsDept.id }
    });

    const remainingCatalogs = await prisma.serviceCatalog.count({
      where: { departmentId: operationsDept.id }
    });

    if (remainingUsers > 0 || remainingUnits > 0 || remainingCatalogs > 0) {
      console.log(`⚠️ Warning: Operations department still has dependencies:`);
      console.log(`   Users: ${remainingUsers}`);
      console.log(`   Units: ${remainingUnits}`);
      console.log(`   Service Catalogs: ${remainingCatalogs}`);
      console.log(`   Skipping deletion for safety.`);
    } else {
      await prisma.department.delete({
        where: { id: operationsDept.id }
      });
      console.log('✅ Operations department deleted successfully');
    }

    // Step 4: Verify the final state
    console.log('\n✅ Final verification...');
    
    const finalDepartments = await prisma.department.findMany({
      include: {
        serviceCatalog: true,
        users: {
          select: { id: true, name: true, role: true }
        },
        units: {
          select: { id: true, name: true, code: true, unitType: true }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log('\n📊 Final Department Structure:');
    console.log('===============================');
    
    finalDepartments.forEach(dept => {
      console.log(`\n📁 ${dept.name} (ID: ${dept.id})`);
      console.log(`   Type: ${dept.departmentType}`);
      console.log(`   Service Owner: ${dept.isServiceOwner}`);
      console.log(`   Service Catalogs: ${dept.serviceCatalog.length}`);
      console.log(`   Users: ${dept.users.length}`);
      console.log(`   Units: ${dept.units.length}`);
      
      if (dept.units.length > 0) {
        console.log(`   Branch Distribution:`);
        const cabang = dept.units.filter(u => u.unitType === 'CABANG');
        const capem = dept.units.filter(u => u.unitType === 'CAPEM');
        console.log(`     - CABANG: ${cabang.length}`);
        console.log(`     - CAPEM: ${capem.length}`);
      }
    });

    console.log('\n🎯 Service Mapping Summary:');
    console.log('============================');
    console.log('🔧 Information Technology Department:');
    console.log('   ├── Handles: IT infrastructure, hardware, software, network issues');
    console.log('   ├── Users: IT technicians and administrators');
    console.log('   └── No branch assignments (serves all branches)');
    console.log('\n🏦 Dukungan dan Layanan Department:');
    console.log('   ├── Handles: Banking services, KASDA, BSGDirect, customer support');
    console.log('   ├── Users: Banking technicians, branch managers, requesters');
    console.log('   └── Branch assignments: All CABANG and CAPEM branches');

    console.log('\n✅ Department structure fixed successfully!');
    console.log('\n🎉 The system now has the correct 2-department structure:');
    console.log('   1. Information Technology (IT services)');
    console.log('   2. Dukungan dan Layanan (Banking and customer services)');

  } catch (error) {
    console.error('❌ Error fixing department structure:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDepartmentStructure();