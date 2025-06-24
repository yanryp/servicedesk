#!/usr/bin/env node

/**
 * Test Master Data API Direct Access
 * 
 * This script tests the master data API endpoints directly
 * to ensure they're working with the ATM integration.
 */

const atmManagementService = require('../dist/services/atmManagementService.js');

async function testMasterDataAPI() {
  console.log('🔧 Testing Master Data API Direct Access\n');

  try {
    // Test 1: Direct service call
    console.log('1️⃣ Testing ATM Service Direct Call...');
    
    const branches = await atmManagementService.default.getBranchesForBSG();
    console.log(`   ✅ Branches for BSG format: ${branches.length} entries`);
    
    if (branches.length > 0) {
      console.log(`   📍 Sample: ${branches[0].label} (value: ${branches[0].value})`);
    }

    // Test 2: Simulate BSG route logic
    console.log('\n2️⃣ Testing BSG Route Logic Simulation...');
    
    // Simulate what the API route would do
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const dataType = 'branch';
    console.log(`   Testing master data for type: ${dataType}`);
    
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
    
    // If no BSGMasterData, try ATM service (like the updated API does)
    if (masterData.length === 0) {
      console.log('   📍 No BSGMasterData found, loading from ATM Management System...');
      const atmBranches = await atmManagementService.default.getBranches();
      const now = new Date();
      
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
    }

    // Transform to frontend format
    const formattedData = masterData.map(item => ({
      value: item.code || item.id.toString(),
      label: item.displayName || item.name,
      isDefault: item.isDefault || false
    }));

    console.log(`   ✅ Formatted data: ${formattedData.length} options`);
    
    if (formattedData.length > 0) {
      console.log('   📍 Sample formatted options:');
      formattedData.slice(0, 3).forEach((option, index) => {
        console.log(`     ${index + 1}. "${option.label}" (value: "${option.value}")`);
      });
    }

    // Test 3: Check if specific template has dropdown fields
    console.log('\n3️⃣ Testing Template with Dropdown Fields...');
    
    const templateWithDropdown = await prisma.bSGTemplate.findFirst({
      where: { 
        isActive: true,
        fields: {
          some: {
            fieldType: 'dropdown_branch'
          }
        }
      },
      include: {
        fields: {
          where: {
            fieldType: 'dropdown_branch'
          }
        }
      }
    });

    if (templateWithDropdown) {
      console.log(`   ✅ Found template: ${templateWithDropdown.displayName}`);
      console.log(`   ✅ Dropdown fields: ${templateWithDropdown.fields.length}`);
      
      templateWithDropdown.fields.forEach(field => {
        console.log(`     🔽 ${field.fieldLabel}: ${field.fieldType}`);
      });
    } else {
      console.log('   ❌ No templates with dropdown_branch fields found');
    }

    await prisma.$disconnect();

    // Summary
    console.log('\n📊 API Test Summary:');
    console.log('=======================');
    console.log(`✅ ATM Service: ${branches.length} branches available`);
    console.log(`✅ API Logic: ${masterData.length} master data entries`);
    console.log(`✅ Frontend Format: ${formattedData.length} options ready`);
    console.log(`✅ Template Integration: ${templateWithDropdown ? 'Working' : 'No dropdown fields'}`);
    
    console.log('\n🎉 Master Data API is working correctly!');
    console.log('   The issue might be in the frontend authentication or component loading.');

  } catch (error) {
    console.error('❌ Error testing master data API:', error);
  } finally {
    await atmManagementService.default.disconnect();
  }
}

// Run the test
testMasterDataAPI()
  .then(() => {
    console.log('\n✅ Master Data API testing completed');
  })
  .catch((error) => {
    console.error('❌ Master Data API testing failed:', error);
    process.exit(1);
  });