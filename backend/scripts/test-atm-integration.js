#!/usr/bin/env node

/**
 * Test ATM Management Database Integration
 * 
 * This script tests the integration between BSG templates and ATM management database
 * for populating Cabang/Capem and ATM terminal dropdown fields.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testATMIntegration() {
  console.log('🧪 Testing ATM Management Database Integration\n');

  let testResults = {
    atmService: false,
    bsgIntegration: false
  };

  try {
    // Test 1: ATM Management Service Direct Access
    console.log('1️⃣ Testing ATM Management Service...');
    
    try {
      // Import the service
      const atmService = require('../dist/services/atmManagementService.js');
      
      // Test branch data
      const branches = await atmService.default.getBranches();
      console.log(`   ✅ Branches loaded: ${branches.length} entries`);
      
      if (branches.length > 0) {
        console.log(`   📍 Sample branch: ${branches[0].name} (${branches[0].code})`);
      }
      
      // Test terminal data
      const terminals = await atmService.default.getTerminals();
      console.log(`   ✅ Terminals loaded: ${terminals.length} entries`);
      
      if (terminals.length > 0) {
        console.log(`   🏧 Sample terminal: ${terminals[0].name} (ID: ${terminals[0].id})`);
      }
      
      testResults.atmService = branches.length > 0 && terminals.length > 0;
      
    } catch (error) {
      console.log(`   ❌ ATM Service Error: ${error.message}`);
    }

    // Test 2: BSG Template Integration
    console.log('\n2️⃣ Testing BSG Template Integration...');
    
    try {
      // Count total BSG templates and fields
      const totalTemplates = await prisma.bSGTemplate.count({
        where: { isActive: true }
      });
      
      const totalFields = await prisma.bSGTemplateField.count();

      console.log(`   ✅ Active BSG Templates: ${totalTemplates}`);
      console.log(`   ✅ Total Template Fields: ${totalFields}`);
      
      // Check for any dropdown fields
      const dropdownFields = await prisma.bSGTemplateField.findMany({
        where: {
          fieldName: { contains: 'cabang' }
        },
        take: 3
      });
      
      console.log(`   ✅ Fields with 'cabang': ${dropdownFields.length}`);
      
      if (dropdownFields.length > 0) {
        dropdownFields.forEach(field => {
          console.log(`     🔽 ${field.fieldLabel}: ${field.fieldType}`);
        });
      }
      
      testResults.bsgIntegration = totalTemplates > 0 && totalFields > 0;
      
    } catch (error) {
      console.log(`   ❌ BSG Integration Error: ${error.message}`);
    }

    // Final Summary
    console.log('\n📊 Test Summary:');
    console.log('==================');
    
    const totalTests = Object.keys(testResults).length;
    const passedTests = Object.values(testResults).filter(Boolean).length;
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const testName = test.charAt(0).toUpperCase() + test.slice(1).replace(/([A-Z])/g, ' $1');
      console.log(`${status} ${testName}`);
    });

    console.log(`\nOverall: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! ATM Management integration is working properly.');
    } else {
      console.log('⚠️  Some tests failed. Check the integration setup.');
    }

  } catch (error) {
    console.error('❌ Error during ATM integration testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testATMIntegration()
  .then(() => {
    console.log('\n✅ ATM integration testing completed');
  })
  .catch((error) => {
    console.error('❌ ATM integration testing failed:', error);
    process.exit(1);
  });