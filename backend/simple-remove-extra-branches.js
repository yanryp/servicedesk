const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleRemoveExtraBranches() {
  console.log('🧹 REMOVING 5 EXTRA BRANCHES TO RESTORE ORIGINAL 51-BRANCH STRUCTURE');
  console.log('═'.repeat(70));
  
  try {
    // The 5 extra branch IDs identified: WENANG, WANEA, MALALAYANG, POIGAR, BOLMONG_SELATAN
    const extraBranchIds = [16, 17, 18, 19, 20];
    
    // Get current count before removal
    const currentBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } }
    });
    console.log(`📊 Current branches: ${currentBranches.length}`);
    
    // Get details of branches to be removed
    const branchesToRemove = await prisma.unit.findMany({
      where: { id: { in: extraBranchIds } },
      select: {
        id: true,
        code: true,
        name: true,
        unitType: true
      }
    });
    
    console.log('\n📋 Branches to be removed:');
    branchesToRemove.forEach(branch => {
      console.log(`   • ID: ${branch.id} | ${branch.unitType} | ${branch.code} | ${branch.name}`);
    });
    
    // Remove the extra branches directly
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
      console.log('✅ Database now contains exactly the branches from the original CSV file');
    } else {
      console.log(`\n⚠️ Warning: Expected 51 branches, but have ${finalBranches.length}`);
    }
    
    // Show summary of remaining branches by type and province
    const provinceCounts = {};
    finalBranches.forEach(branch => {
      const province = branch.province || 'Unknown';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });
    
    console.log('\n🌍 Final Provincial Distribution:');
    Object.entries(provinceCounts).forEach(([province, count]) => {
      console.log(`   • ${province}: ${count} branches`);
    });
    
  } catch (error) {
    console.error('❌ Error removing extra branches:', error);
    throw error;
  }
}

simpleRemoveExtraBranches().catch(console.error).finally(() => process.exit());