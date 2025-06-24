#!/usr/bin/env node

/**
 * Test Master Data API Response Directly
 * 
 * This script directly calls the master data logic without authentication
 * to verify what data is being returned.
 */

const atmManagementService = require('../dist/services/atmManagementService.js');
const { PrismaClient } = require('@prisma/client');

async function testAPIResponse() {
  console.log('🔍 Testing Master Data API Response Logic\n');

  const prisma = new PrismaClient();
  const dataType = 'branch';

  try {
    console.log('1️⃣ Step 1: Check BSGMasterData table...');
    
    // Try BSGMasterData first (like the API does)
    let masterData = await prisma.bSGMasterData.findMany({
      where: {
        dataType: dataType,
        isActive: true
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    console.log(`   BSGMasterData found: ${masterData.length} entries`);

    console.log('\n2️⃣ Step 2: Check MasterDataEntity table...');
    
    // If no BSGMasterData, try MasterDataEntity as fallback
    if (masterData.length === 0) {
      const genericMasterData = await prisma.masterDataEntity.findMany({
        where: {
          type: dataType,
          isActive: true
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      console.log(`   MasterDataEntity found: ${genericMasterData.length} entries`);

      // Transform generic master data to BSG format
      masterData = genericMasterData.map(item => ({
        id: item.id,
        dataType: item.type,
        code: item.code,
        name: item.name,
        displayName: item.nameIndonesian || item.name,
        parentId: item.parentId,
        metadata: item.metadata,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    }

    console.log('\n3️⃣ Step 3: ATM Management System fallback...');
    
    // If still no data, get branch/capem data from ATM management database
    if (masterData.length === 0 && dataType === 'branch') {
      try {
        console.log('   📍 Loading branch data from ATM Management System...');
        const atmBranches = await atmManagementService.default.getBranches();
        const now = new Date();
        
        console.log(`   ATM Service returned: ${atmBranches.length} branches`);
        
        masterData = atmBranches.map((branch, index) => ({
          id: index + 1,
          dataType: 'branch',
          code: branch.code,
          name: branch.name,
          displayName: branch.name,
          parentId: null,
          isActive: branch.isActive,
          sortOrder: index + 1,
          createdAt: now,
          updatedAt: now,
          metadata: { region: branch.region }
        }));
        
        console.log(`   ✅ Generated ${masterData.length} master data entries from ATM system`);
      } catch (error) {
        console.error('   ❌ Failed to load branches from ATM Management System:', error);
        masterData = [];
      }
    }

    console.log('\n4️⃣ Step 4: Transform to frontend format...');
    
    // Transform to format expected by frontend
    const formattedData = masterData.map(item => ({
      value: item.code || item.id.toString(),
      label: item.displayName || item.name,
      isDefault: item.sortOrder === 1,
      sortOrder: item.sortOrder || 0
    }));

    console.log(`   ✅ Formatted data: ${formattedData.length} options`);
    
    if (formattedData.length > 0) {
      console.log('   📍 Sample formatted data:');
      formattedData.slice(0, 3).forEach((option, index) => {
        console.log(`     ${index + 1}. "${option.label}" (value: "${option.value}")`);
      });
    }

    const apiResponse = {
      success: true,
      data: formattedData,
      meta: {
        dataType: dataType,
        count: formattedData.length,
        source: masterData.length > 0 ? 'ATM Management System' : 'default'
      }
    };

    console.log('\n📊 Final API Response:');
    console.log('=======================');
    console.log(`Success: ${apiResponse.success}`);
    console.log(`Data count: ${apiResponse.data.length}`);
    console.log(`Source: ${apiResponse.meta.source}`);
    console.log(`Response size: ${JSON.stringify(apiResponse).length} bytes`);
    
    if (apiResponse.data.length === 0) {
      console.log('\n❌ ISSUE FOUND: API would return empty array!');
      console.log('   This explains why the dropdown is not populated.');
    } else {
      console.log('\n✅ API Response looks correct');
      console.log('   The issue might be elsewhere in the authentication or request handling.');
    }

  } catch (error) {
    console.error('❌ Error in API response logic:', error);
  } finally {
    await prisma.$disconnect();
    await atmManagementService.default.disconnect();
  }
}

// Run the test
testAPIResponse()
  .then(() => {
    console.log('\n✅ API response testing completed');
  })
  .catch((error) => {
    console.error('❌ API response testing failed:', error);
    process.exit(1);
  });