const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setupBranchStructure() {
  console.log('🏗️ Setting up proper branch-based structure...\n');
  
  try {
    // 1. Create branch units
    console.log('📍 Creating branch units...');
    
    const branchUtama = await prisma.unit.upsert({
      where: { code: 'UTAMA' },
      update: {},
      create: {
        code: 'UTAMA',
        name: 'Branch Utama',
        displayName: 'Kantor Cabang Utama',
        unitType: 'branch',
        isActive: true,
        sortOrder: 1
      }
    });
    
    const branchKotamobagu = await prisma.unit.upsert({
      where: { code: 'KOTAMOBAGU' },
      update: {},
      create: {
        code: 'KOTAMOBAGU',
        name: 'Branch Kotamobagu',
        displayName: 'Kantor Cabang Kotamobagu',
        unitType: 'branch',
        isActive: true,
        sortOrder: 2
      }
    });
    
    console.log(`✅ Created Branch Utama (ID: ${branchUtama.id})`);
    console.log(`✅ Created Branch Kotamobagu (ID: ${branchKotamobagu.id})`);
    
    // 2. Update users to be properly branch-based
    console.log('\n👥 Setting up branch-based users...');
    
    // Create Branch Utama Manager
    const utamaManager = await prisma.user.upsert({
      where: { email: 'utama.manager@company.com' },
      update: {
        unitId: branchUtama.id,
        isBusinessReviewer: true,
        role: 'manager'
      },
      create: {
        username: 'utama.manager',
        email: 'utama.manager@company.com',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        role: 'manager',
        unitId: branchUtama.id,
        isBusinessReviewer: true,
        departmentId: null // Branch managers are not tied to specific departments
      }
    });
    
    // Create Branch Utama Requester  
    const utamaRequester = await prisma.user.upsert({
      where: { email: 'utama.user@company.com' },
      update: {
        unitId: branchUtama.id,
        managerId: utamaManager.id,
        role: 'requester'
      },
      create: {
        username: 'utama.user',
        email: 'utama.user@company.com',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        role: 'requester',
        unitId: branchUtama.id,
        managerId: utamaManager.id,
        departmentId: null // Requesters can be from any department
      }
    });
    
    // Create Branch Kotamobagu Manager
    const kotamobaGumanager = await prisma.user.upsert({
      where: { email: 'kotamobagu.manager@company.com' },
      update: {
        unitId: branchKotamobagu.id,
        isBusinessReviewer: true,
        role: 'manager'
      },
      create: {
        username: 'kotamobagu.manager',
        email: 'kotamobagu.manager@company.com',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        role: 'manager',
        unitId: branchKotamobagu.id,
        isBusinessReviewer: true,
        departmentId: null
      }
    });
    
    // Create Branch Kotamobagu Requester
    const kotamobaGuuser = await prisma.user.upsert({
      where: { email: 'kotamobagu.user@company.com' },
      update: {
        unitId: branchKotamobagu.id,
        managerId: kotamobaGumanager.id,
        role: 'requester'
      },
      create: {
        username: 'kotamobagu.user',
        email: 'kotamobagu.user@company.com',
        passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
        role: 'requester',
        unitId: branchKotamobagu.id,
        managerId: kotamobaGumanager.id,
        departmentId: null
      }
    });
    
    console.log(`✅ Branch Utama Manager: ${utamaManager.email}`);
    console.log(`✅ Branch Utama User: ${utamaRequester.email}`);
    console.log(`✅ Branch Kotamobagu Manager: ${kotamobaGumanager.email}`);
    console.log(`✅ Branch Kotamobagu User: ${kotamobaGuuser.email}`);
    
    // 3. Keep department technicians (they serve all branches)
    console.log('\n🔧 Updating department technicians...');
    
    // Update IT technician
    await prisma.user.update({
      where: { email: 'it.technician@company.com' },
      data: {
        unitId: null, // Technicians serve all branches
        departmentId: (await prisma.department.findFirst({ where: { name: 'Information Technology' } })).id
      }
    });
    
    // Update banking technician  
    await prisma.user.update({
      where: { email: 'banking.tech@company.com' },
      data: {
        unitId: null, // Technicians serve all branches
        departmentId: (await prisma.department.findFirst({ where: { name: 'Dukungan dan Layanan' } })).id
      }
    });
    
    console.log('✅ IT Technician: serves all branches');
    console.log('✅ Banking Technician: serves all branches');
    
    // 4. Update old users to remove them or make them inactive
    console.log('\n🧹 Cleaning up old test users...');
    
    // Remove the old branch.manager@company.com as it was department-based
    await prisma.user.update({
      where: { email: 'branch.manager@company.com' },
      data: {
        isBusinessReviewer: false,
        departmentId: null,
        unitId: null
      }
    });
    
    console.log('✅ Deactivated old department-based branch.manager@company.com');
    
    console.log('\n🎯 BRANCH-BASED STRUCTURE SETUP COMPLETE!');
    console.log('\n📋 TESTING WORKFLOW:');
    console.log('1. utama.user@company.com creates ticket');
    console.log('2. utama.manager@company.com approves ticket');  
    console.log('3. Ticket routes to:');
    console.log('   - KASDA/BSGDirect → banking.tech@company.com (Dukungan dan Layanan)');
    console.log('   - IT/eLOS → it.technician@company.com (Information Technology)');
    
  } catch (error) {
    console.error('❌ Error setting up branch structure:', error);
  }
}

setupBranchStructure().catch(console.error).finally(() => process.exit());