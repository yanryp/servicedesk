#!/usr/bin/env node

/**
 * Add Default Dropdown Data
 * 
 * This script adds default data for generic "dropdown" field types
 * that are used in BSG templates but don't have a specific data type.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDefaultDropdownData() {
  console.log('🔧 Adding Default Dropdown Data for BSG Templates');
  console.log('=================================================\n');

  try {
    const now = new Date();

    // Add Request Type options
    console.log('1️⃣ Adding Request Type dropdown data...');
    
    const requestTypeData = [
      { code: 'new_account', name: 'New Account Request', displayName: 'New Account Request' },
      { code: 'modify_account', name: 'Modify Account Request', displayName: 'Modify Account Request' },
      { code: 'disable_account', name: 'Disable Account Request', displayName: 'Disable Account Request' },
      { code: 'reset_password', name: 'Reset Password Request', displayName: 'Reset Password Request' },
      { code: 'access_upgrade', name: 'Access Level Upgrade', displayName: 'Access Level Upgrade' },
      { code: 'access_downgrade', name: 'Access Level Downgrade', displayName: 'Access Level Downgrade' }
    ];

    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'request_type' }
    });

    const requestTypeRecords = requestTypeData.map((item, index) => ({
      dataType: 'request_type',
      code: item.code,
      name: item.name,
      displayName: item.displayName,
      parentId: null,
      metadata: {
        category: 'user_management',
        sourceSystem: 'manual_default',
        addedAt: now.toISOString()
      },
      isActive: true,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: requestTypeRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Added ${requestTypeData.length} request type options`);

    // Add Government Entity options
    console.log('\n2️⃣ Adding Government Entity dropdown data...');
    
    const governmentEntityData = [
      { code: 'pemda_sulut', name: 'Pemerintah Daerah Sulawesi Utara', displayName: 'Pemerintah Daerah Sulawesi Utara' },
      { code: 'pemda_manado', name: 'Pemerintah Kota Manado', displayName: 'Pemerintah Kota Manado' },
      { code: 'pemda_bitung', name: 'Pemerintah Kota Bitung', displayName: 'Pemerintah Kota Bitung' },
      { code: 'pemda_tomohon', name: 'Pemerintah Kota Tomohon', displayName: 'Pemerintah Kota Tomohon' },
      { code: 'pemda_kotamobagu', name: 'Pemerintah Kota Kotamobagu', displayName: 'Pemerintah Kota Kotamobagu' },
      { code: 'pemda_minahasa', name: 'Pemerintah Kabupaten Minahasa', displayName: 'Pemerintah Kabupaten Minahasa' },
      { code: 'pemda_minsel', name: 'Pemerintah Kabupaten Minahasa Selatan', displayName: 'Pemerintah Kabupaten Minahasa Selatan' },
      { code: 'pemda_minur', name: 'Pemerintah Kabupaten Minahasa Utara', displayName: 'Pemerintah Kabupaten Minahasa Utara' },
      { code: 'pemda_minten', name: 'Pemerintah Kabupaten Minahasa Tenggara', displayName: 'Pemerintah Kabupaten Minahasa Tenggara' },
      { code: 'pemda_bolmong', name: 'Pemerintah Kabupaten Bolaang Mongondow', displayName: 'Pemerintah Kabupaten Bolaang Mongondow' }
    ];

    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'government_entity' }
    });

    const governmentEntityRecords = governmentEntityData.map((item, index) => ({
      dataType: 'government_entity',
      code: item.code,
      name: item.name,
      displayName: item.displayName,
      parentId: null,
      metadata: {
        category: 'government',
        region: 'sulawesi_utara',
        sourceSystem: 'manual_default',
        addedAt: now.toISOString()
      },
      isActive: true,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: governmentEntityRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Added ${governmentEntityData.length} government entity options`);

    // Add Access Level options
    console.log('\n3️⃣ Adding Access Level dropdown data...');
    
    const accessLevelData = [
      { code: 'level_1', name: 'Level 1 - View Only', displayName: 'Level 1 - View Only' },
      { code: 'level_2', name: 'Level 2 - Basic Operations', displayName: 'Level 2 - Basic Operations' },
      { code: 'level_3', name: 'Level 3 - Advanced Operations', displayName: 'Level 3 - Advanced Operations' },
      { code: 'level_4', name: 'Level 4 - Administrative', displayName: 'Level 4 - Administrative' },
      { code: 'level_5', name: 'Level 5 - Full Access', displayName: 'Level 5 - Full Access' }
    ];

    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'access_level' }
    });

    const accessLevelRecords = accessLevelData.map((item, index) => ({
      dataType: 'access_level',
      code: item.code,
      name: item.name,
      displayName: item.displayName,
      parentId: null,
      metadata: {
        category: 'user_management',
        securityLevel: index + 1,
        sourceSystem: 'manual_default',
        addedAt: now.toISOString()
      },
      isActive: true,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: accessLevelRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Added ${accessLevelData.length} access level options`);

    // Verification
    console.log('\n4️⃣ Verifying all dropdown data...');
    
    const verification = await prisma.bSGMasterData.groupBy({
      by: ['dataType'],
      _count: { dataType: true },
      where: { isActive: true }
    });

    console.log('   📊 Updated BSGMasterData Summary:');
    let totalRecords = 0;
    verification.forEach(item => {
      console.log(`   - ${item.dataType}: ${item._count.dataType} records`);
      totalRecords += item._count.dataType;
    });
    console.log(`   📝 Total active records: ${totalRecords}`);

    console.log('\n📊 Default Dropdown Data Summary:');
    console.log('==================================');
    console.log(`✅ Request Types: ${requestTypeData.length} options`);
    console.log(`✅ Government Entities: ${governmentEntityData.length} options`);
    console.log(`✅ Access Levels: ${accessLevelData.length} options`);
    console.log(`✅ Total New Records: ${requestTypeData.length + governmentEntityData.length + accessLevelData.length}`);
    
    console.log('\n🎉 Default dropdown data added successfully!');
    console.log('   All BSG template dropdown fields now have data sources');
    console.log('   in the ticketing system database.');

  } catch (error) {
    console.error('\n❌ Failed to add default dropdown data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
async function runScript() {
  try {
    await addDefaultDropdownData();
    console.log('\n✅ Default dropdown data script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Default dropdown data script failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runScript();
}

module.exports = {
  addDefaultDropdownData,
  runScript
};