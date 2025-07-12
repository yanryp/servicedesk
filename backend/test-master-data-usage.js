const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMasterDataUsage() {
  console.log('🔧 Testing Master Data Usage in Dynamic Fields');
  console.log('==============================================');
  
  try {
    // Get banks for dropdown
    console.log('\n💳 Available Banks for XCARD Service:');
    const banks = await prisma.bSGMasterData.findMany({
      where: { 
        dataType: 'bank',
        isActive: true 
      },
      select: {
        code: true,
        displayName: true,
        metadata: true
      },
      orderBy: { sortOrder: 'asc' },
      take: 10 // Show first 10 banks
    });
    
    banks.forEach(bank => {
      const bankType = bank.metadata?.bankType || 'Unknown';
      console.log(`  - ${bank.code}: ${bank.displayName} (${bankType})`);
    });
    
    // Get branches for dropdown  
    console.log('\n🏢 Available Branches for ATM Service:');
    const branches = await prisma.bSGMasterData.findMany({
      where: { 
        dataType: 'cabang',
        isActive: true 
      },
      select: {
        code: true,
        displayName: true,
        metadata: true
      },
      orderBy: { sortOrder: 'asc' },
      take: 10 // Show first 10 branches
    });
    
    branches.forEach(branch => {
      const region = branch.metadata?.region || 'Unknown';
      console.log(`  - ${branch.code}: ${branch.displayName} (${region})`);
    });
    
    // Get terminals for dropdown
    console.log('\n🏧 Available ATM Terminals:');
    const terminals = await prisma.bSGMasterData.findMany({
      where: { 
        dataType: 'terminal',
        isActive: true 
      },
      select: {
        code: true,
        displayName: true,
        metadata: true
      },
      orderBy: { sortOrder: 'asc' },
      take: 10 // Show first 10 terminals
    });
    
    terminals.forEach(terminal => {
      const cabangCode = terminal.metadata?.cabangCode || 'Unknown';
      const terminalType = terminal.metadata?.terminalType || 'ATM';
      console.log(`  - ${terminal.code}: ${terminal.displayName} (${terminalType} at ${cabangCode})`);
    });
    
    // Show usage example for dynamic fields
    console.log('\n📋 Dynamic Field Usage Examples:');
    console.log('=====================================');
    
    console.log('🔹 For XCARD Service - Bank Selection Field:');
    console.log('   Field Type: dropdown');
    console.log('   Data Source: BSGMasterData where dataType="bank"');
    console.log('   Display: bank.displayName');
    console.log('   Value: bank.code');
    
    console.log('\n🔹 For ATM Service - Branch Selection Field:');
    console.log('   Field Type: dropdown');  
    console.log('   Data Source: BSGMasterData where dataType="cabang"');
    console.log('   Display: cabang.displayName');
    console.log('   Value: cabang.code');
    
    console.log('\n🔹 For ATM Service - Terminal Selection Field:');
    console.log('   Field Type: dropdown');
    console.log('   Data Source: BSGMasterData where dataType="terminal"');
    console.log('   Display: terminal.displayName');
    console.log('   Value: terminal.code');
    console.log('   Filter: Can be filtered by selected branch (cabangCode)');
    
    // Show statistics
    console.log('\n📊 Master Data Statistics:');
    console.log('===========================');
    const totalData = await prisma.bSGMasterData.count();
    const bankCount = await prisma.bSGMasterData.count({ where: { dataType: 'bank' } });
    const branchCount = await prisma.bSGMasterData.count({ where: { dataType: 'cabang' } });
    const terminalCount = await prisma.bSGMasterData.count({ where: { dataType: 'terminal' } });
    
    console.log(`Total Master Data Records: ${totalData}`);
    console.log(`Available Banks: ${bankCount}`);
    console.log(`Available Branches: ${branchCount}`);
    console.log(`Available Terminals: ${terminalCount}`);
    console.log(`Other Master Data Types: ${totalData - bankCount - branchCount - terminalCount}`);
    
    console.log('\n✅ Master Data Successfully Integrated into BSG System!');
    console.log('🎯 Ready for use in Service Catalog Dynamic Fields');
    
  } catch (error) {
    console.error('❌ Error testing master data usage:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMasterDataUsage()
  .then(() => {
    console.log('\n🎉 Master Data Testing Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });