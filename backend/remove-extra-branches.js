const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeExtraBranches() {
  console.log('🧹 REMOVING EXTRA BRANCHES TO RESTORE ORIGINAL 51-BRANCH STRUCTURE');
  console.log('═'.repeat(70));
  
  try {
    // The 5 extra branch IDs identified
    const extraBranchIds = [16, 17, 18, 19, 20];
    
    // First, get details of branches to be removed
    console.log('📋 Branches to be removed:');
    const branchesToRemove = await prisma.unit.findMany({
      where: { id: { in: extraBranchIds } },
      select: {
        id: true,
        code: true,
        name: true,
        unitType: true
      }
    });
    
    branchesToRemove.forEach(branch => {
      console.log(`   • ID: ${branch.id} | ${branch.unitType} | ${branch.code} | ${branch.name}`);
    });
    
    // Check if any users are assigned to these branches
    console.log('\n🔍 Checking for users assigned to these branches...');
    const usersInExtraBranches = await prisma.user.findMany({
      where: { unitId: { in: extraBranchIds } },
      select: {
        id: true,
        username: true,
        name: true,
        unitId: true,
        unit: {
          select: { name: true }
        }
      }
    });
    
    if (usersInExtraBranches.length > 0) {
      console.log(`⚠️ Found ${usersInExtraBranches.length} users assigned to extra branches:`);
      usersInExtraBranches.forEach(user => {
        console.log(`   • ${user.username} (${user.name}) - ${user.unit?.name}`);
      });
      
      // We need to reassign these users before deleting branches
      console.log('\n🔧 Reassigning users to UTAMA branch...');
      const utamaBranch = await prisma.unit.findFirst({
        where: { code: 'UTAMA' }
      });
      
      if (utamaBranch) {
        await prisma.user.updateMany({
          where: { unitId: { in: extraBranchIds } },
          data: { unitId: utamaBranch.id }
        });
        console.log(`✅ Reassigned ${usersInExtraBranches.length} users to UTAMA branch`);
      } else {
        console.log('❌ Could not find UTAMA branch for reassignment');
        return;
      }
    } else {
      console.log('✅ No users assigned to extra branches');
    }
    
    // Check for any other dependencies (tickets, etc.)
    console.log('\n🔍 Checking for other dependencies...');
    
    // Check business approvals
    const businessApprovals = await prisma.businessApproval.count({
      where: { 
        ticket: {
          creator: {
            unitId: { in: extraBranchIds }
          }
        }
      }
    });
    
    if (businessApprovals > 0) {
      console.log(`⚠️ Found ${businessApprovals} business approvals related to these branches`);
    }
    
    // Remove the extra branches
    console.log('\n🗑️ Removing extra branches...');
    const deletedResult = await prisma.unit.deleteMany({
      where: { id: { in: extraBranchIds } }
    });
    
    console.log(`✅ Removed ${deletedResult.count} extra branches`);
    
    // Verify final count
    const finalBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } }
    });
    
    const cabangCount = finalBranches.filter(b => b.unitType === 'CABANG').length;
    const capemCount = finalBranches.filter(b => b.unitType === 'CAPEM').length;
    
    console.log('\n📊 FINAL BRANCH COUNT:');
    console.log('═'.repeat(40));
    console.log(`📈 Total branches: ${finalBranches.length}`);
    console.log(`   • CABANG: ${cabangCount}`);
    console.log(`   • CAPEM: ${capemCount}`);
    
    if (finalBranches.length === 51) {
      console.log('\n🎯 ✅ SUCCESS! Restored original 51-branch structure');
    } else {
      console.log(`\n⚠️ Warning: Expected 51 branches, but have ${finalBranches.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error removing extra branches:', error);
    throw error;
  }
}

removeExtraBranches().catch(console.error).finally(() => process.exit());