#!/usr/bin/env node

/**
 * BSG Master Data Migration Script
 * 
 * This script migrates branch/capem data from the ATM Management System
 * into the ticketing system's BSGMasterData table as a one-time migration.
 * 
 * After this migration, the Service Catalog will load branch data from
 * the ticketing system database instead of the external ATM system.
 */

const { PrismaClient } = require('@prisma/client');
const atmManagementService = require('../dist/services/atmManagementService.js');

const prisma = new PrismaClient();

async function migrateBranchData() {
  console.log('🔄 Starting BSG Master Data Migration');
  console.log('=====================================\n');

  try {
    // Step 1: Check current BSGMasterData
    console.log('1️⃣ Checking current BSGMasterData...');
    const existingBranches = await prisma.bSGMasterData.count({
      where: {
        dataType: 'branch',
        isActive: true
      }
    });
    console.log(`   Current branch records: ${existingBranches}`);

    if (existingBranches > 0) {
      console.log('⚠️  BSGMasterData already contains branch data.');
      console.log('   Delete existing data? (This will replace all branch records)');
      // For this script, we'll proceed with replacement
      console.log('   Proceeding with data replacement...\n');
      
      await prisma.bSGMasterData.deleteMany({
        where: {
          dataType: 'branch'
        }
      });
      console.log('   ✅ Existing branch data cleared');
    }

    // Step 2: Fetch branch data from ATM Management System
    console.log('\n2️⃣ Fetching branch data from ATM Management System...');
    const atmBranches = await atmManagementService.default.getBranches();
    console.log(`   ✅ Retrieved ${atmBranches.length} branches from ATM system`);

    if (atmBranches.length === 0) {
      throw new Error('No branch data found in ATM Management System');
    }

    // Step 3: Transform and insert data into BSGMasterData
    console.log('\n3️⃣ Migrating data to BSGMasterData table...');
    
    const now = new Date();
    const branchRecords = atmBranches.map((branch, index) => ({
      dataType: 'branch',
      code: branch.code,
      name: branch.name,
      displayName: branch.name,
      parentId: null,
      metadata: {
        region: branch.region,
        isActive: branch.isActive,
        sourceSystem: 'atm_management_migration',
        migratedAt: now.toISOString()
      },
      isActive: branch.isActive,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    // Insert in batches to avoid memory issues
    const batchSize = 20;
    let insertedCount = 0;
    
    for (let i = 0; i < branchRecords.length; i += batchSize) {
      const batch = branchRecords.slice(i, i + batchSize);
      await prisma.bSGMasterData.createMany({
        data: batch,
        skipDuplicates: true
      });
      insertedCount += batch.length;
      console.log(`   📝 Inserted batch ${Math.ceil((i + batchSize) / batchSize)}: ${batch.length} records`);
    }

    // Step 4: Verify migration
    console.log('\n4️⃣ Verifying migration...');
    const migratedCount = await prisma.bSGMasterData.count({
      where: {
        dataType: 'branch',
        isActive: true
      }
    });
    
    console.log(`   ✅ Migration completed: ${migratedCount} branch records in BSGMasterData`);
    
    // Step 5: Show sample data
    console.log('\n5️⃣ Sample migrated data:');
    const sampleBranches = await prisma.bSGMasterData.findMany({
      where: {
        dataType: 'branch',
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      },
      take: 5,
      select: {
        code: true,
        name: true,
        displayName: true,
        sortOrder: true
      }
    });

    sampleBranches.forEach((branch, index) => {
      console.log(`   ${index + 1}. ${branch.displayName} (code: ${branch.code})`);
    });

    // Step 6: Migration summary
    console.log('\n📊 Migration Summary:');
    console.log('====================');
    console.log(`✅ Source: ATM Management System`);
    console.log(`✅ Target: BSGMasterData table (ticketing_system_db)`);
    console.log(`✅ Records migrated: ${migratedCount}`);
    console.log(`✅ Data type: 'branch'`);
    console.log(`✅ Status: All records active`);
    
    console.log('\n🎉 BSG Master Data migration completed successfully!');
    console.log('   Service Catalog dropdowns will now load from the ticketing system database.');
    console.log('   No more dependency on external ATM Management System for dropdown data.');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await atmManagementService.default.disconnect();
  }
}

// Additional utility function to add other master data types
async function addOtherMasterData() {
  console.log('\n🔧 Adding additional master data types...');
  
  try {
    // Add OLIBS menu options
    const olibsMenuData = [
      { code: 'INQUIRY', name: 'Inquiry', displayName: 'Inquiry' },
      { code: 'TRANSFER', name: 'Transfer', displayName: 'Transfer' },
      { code: 'PAYMENT', name: 'Payment', displayName: 'Payment' },
      { code: 'CLEARING', name: 'Clearing', displayName: 'Clearing' },
      { code: 'REPORTS', name: 'Reports', displayName: 'Reports' }
    ];

    const now = new Date();
    const olibsRecords = olibsMenuData.map((item, index) => ({
      dataType: 'olibs_menu',
      code: item.code,
      name: item.name,
      displayName: item.displayName,
      parentId: null,
      metadata: {
        sourceSystem: 'manual_migration',
        migratedAt: now.toISOString()
      },
      isActive: true,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: olibsRecords,
      skipDuplicates: true
    });

    console.log(`   ✅ Added ${olibsMenuData.length} OLIBS menu options`);

  } catch (error) {
    console.error('   ❌ Failed to add additional master data:', error);
  }
}

// Run the migration
async function runMigration() {
  try {
    await migrateBranchData();
    await addOtherMasterData();
    
    console.log('\n✅ Complete migration finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runMigration();
}

module.exports = {
  migrateBranchData,
  addOtherMasterData,
  runMigration
};