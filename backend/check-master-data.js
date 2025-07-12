const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client with proper schema path
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn'],
});

async function main() {
  console.log('🔍 Checking master data for dropdowns...\n');
  
  // Check OLIBS menu data in BSGMasterData (try both case variations)
  console.log('📋 BSG OLIBS menu master data:');
  const olibsDataUpper = await prisma.bSGMasterData.findMany({
    where: { dataType: 'OLIBS_MENU' }
  });
  const olibsDataLower = await prisma.bSGMasterData.findMany({
    where: { dataType: 'olibs_menu' }
  });
  console.log(`Found ${olibsDataUpper.length} with 'OLIBS_MENU' and ${olibsDataLower.length} with 'olibs_menu':`);
  olibsDataLower.forEach(item => {
    console.log(`  - ${item.id}: ${item.displayName || item.name} (code: ${item.code})`);
  });
  
  // Check ATM location data in BSGMasterData
  console.log('\n🏧 BSG ATM_LOCATION master data:');
  const atmData = await prisma.bSGMasterData.findMany({
    where: { dataType: 'ATM_LOCATION' }
  });
  console.log(`Found ${atmData.length} ATM location entries:`);
  atmData.forEach(item => {
    console.log(`  - ${item.id}: ${item.value} (code: ${item.code})`);
  });
  
  // Check branch data in BSGMasterData
  console.log('\n🏦 BSG BRANCH master data:');
  const branchData = await prisma.bSGMasterData.findMany({
    where: { dataType: 'BRANCH' }
  });
  console.log(`Found ${branchData.length} branch entries:`);
  branchData.forEach(item => {
    console.log(`  - ${item.id}: ${item.value} (code: ${item.code})`);
  });
  
  // Check all BSGMasterData types
  console.log('\n📊 All BSG master data types:');
  const allTypes = await prisma.bSGMasterData.groupBy({
    by: ['dataType'],
    _count: true
  });
  allTypes.forEach(item => {
    console.log(`  - ${item.dataType}: ${item._count} entries`);
  });
  
  // Check all MasterDataEntity types
  console.log('\n📊 All master data entity types:');
  const allEntityTypes = await prisma.masterDataEntity.groupBy({
    by: ['type'],
    _count: true
  });
  allEntityTypes.forEach(item => {
    console.log(`  - ${item.type}: ${item._count} entries`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });