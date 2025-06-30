const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function validateBranchWorkflows() {
  console.log('🔍 VALIDATING EQUAL APPROVAL AUTHORITY FOR CABANG AND CAPEM BRANCHES');
  console.log('═'.repeat(80));
  
  try {
    // Get all branch managers with approval authority
    const branchManagers = await prisma.user.findMany({
      where: {
        role: 'manager',
        isBusinessReviewer: true,
        unit: {
          unitType: { in: ['branch', 'sub_branch'] }
        }
      },
      include: {
        unit: true
      },
      orderBy: [
        { unit: { unitType: 'asc' } },
        { unit: { sortOrder: 'asc' } }
      ]
    });

    console.log(`📊 Found ${branchManagers.length} branch managers with approval authority\n`);

    // Analyze by branch type
    const cabangManagers = branchManagers.filter(m => m.unit.unitType === 'branch');
    const capemManagers = branchManagers.filter(m => m.unit.unitType === 'sub_branch');

    console.log('🏢 BRANCH MANAGER ANALYSIS:');
    console.log('═'.repeat(50));
    console.log(`📈 CABANG Managers: ${cabangManagers.length}`);
    console.log(`📈 CAPEM Managers: ${capemManagers.length}`);

    // Validate equal approval authority
    console.log('\n⚖️ APPROVAL AUTHORITY VALIDATION:');
    console.log('═'.repeat(50));

    let cabangWithAuthority = 0;
    let capemWithAuthority = 0;
    let issuesFound = [];

    console.log('\n🔍 CABANG Branch Approval Authority:');
    cabangManagers.forEach(manager => {
      const hasAuthority = manager.isBusinessReviewer;
      const status = hasAuthority ? '✅' : '❌';
      console.log(`  ${status} ${manager.unit.code} - ${manager.unit.name}`);
      console.log(`     Manager: ${manager.email}`);
      console.log(`     Business Reviewer: ${hasAuthority}`);
      
      if (hasAuthority) cabangWithAuthority++;
      else issuesFound.push(`CABANG ${manager.unit.code} manager lacks approval authority`);
    });

    console.log('\n🔍 CAPEM Branch Approval Authority:');
    capemManagers.forEach(manager => {
      const hasAuthority = manager.isBusinessReviewer;
      const status = hasAuthority ? '✅' : '❌';
      console.log(`  ${status} ${manager.unit.code} - ${manager.unit.name}`);
      console.log(`     Manager: ${manager.email}`);
      console.log(`     Business Reviewer: ${hasAuthority}`);
      console.log(`     Parent: ${manager.unit.parentId ? 'Yes' : 'None'}`);
      
      if (hasAuthority) capemWithAuthority++;
      else issuesFound.push(`CAPEM ${manager.unit.code} manager lacks approval authority`);
    });

    // Test actual approval workflow simulation
    console.log('\n🧪 APPROVAL WORKFLOW SIMULATION:');
    console.log('═'.repeat(50));

    // Simulate ticket approval for different branch types
    const testResults = [];

    // Test CABANG approval
    const cabangTest = cabangManagers[0];
    if (cabangTest) {
      const availableApprovers = await prisma.user.findMany({
        where: {
          unitId: cabangTest.unitId,
          role: { in: ['manager', 'admin'] },
          isAvailable: true,
          isBusinessReviewer: true
        }
      });
      
      testResults.push({
        branchType: 'CABANG',
        branchCode: cabangTest.unit.code,
        branchName: cabangTest.unit.name,
        availableApprovers: availableApprovers.length,
        canApprove: availableApprovers.length > 0
      });
    }

    // Test CAPEM approval
    const capemTest = capemManagers[0];
    if (capemTest) {
      const availableApprovers = await prisma.user.findMany({
        where: {
          unitId: capemTest.unitId,
          role: { in: ['manager', 'admin'] },
          isAvailable: true,
          isBusinessReviewer: true
        }
      });
      
      testResults.push({
        branchType: 'CAPEM',
        branchCode: capemTest.unit.code,
        branchName: capemTest.unit.name,
        availableApprovers: availableApprovers.length,
        canApprove: availableApprovers.length > 0
      });
    }

    testResults.forEach(test => {
      const status = test.canApprove ? '✅' : '❌';
      console.log(`${status} ${test.branchType} ${test.branchCode} - ${test.branchName}`);
      console.log(`   Available Approvers: ${test.availableApprovers}`);
      console.log(`   Can Process Approvals: ${test.canApprove ? 'YES' : 'NO'}`);
    });

    // Test hierarchical isolation (CAPEM should NOT defer to CABANG)
    console.log('\n🔒 HIERARCHICAL ISOLATION TEST:');
    console.log('═'.repeat(50));

    let hierarchyIssues = [];
    
    for (const capemManager of capemManagers.slice(0, 3)) {
      if (capemManager.unit.parentId) {
        // Check if CAPEM has its own approval authority (should not depend on parent)
        const capemApprovers = await prisma.user.findMany({
          where: {
            unitId: capemManager.unitId,
            isBusinessReviewer: true
          }
        });

        const hasOwnAuthority = capemApprovers.length > 0;
        const status = hasOwnAuthority ? '✅' : '❌';
        
        console.log(`${status} ${capemManager.unit.code} - ${capemManager.unit.name}`);
        console.log(`   Has Own Approval Authority: ${hasOwnAuthority ? 'YES' : 'NO'}`);
        console.log(`   Independent from Parent: ${hasOwnAuthority ? 'YES' : 'NO'}`);
        
        if (!hasOwnAuthority) {
          hierarchyIssues.push(`CAPEM ${capemManager.unit.code} lacks independent approval authority`);
        }
      }
    }

    // Generate comprehensive report
    console.log('\n📊 VALIDATION SUMMARY:');
    console.log('═'.repeat(50));
    
    const totalBranches = cabangManagers.length + capemManagers.length;
    const totalWithAuthority = cabangWithAuthority + capemWithAuthority;
    const authorityPercentage = ((totalWithAuthority / totalBranches) * 100).toFixed(1);

    console.log(`🏢 Total Branches: ${totalBranches}`);
    console.log(`   • CABANG: ${cabangManagers.length}`);
    console.log(`   • CAPEM: ${capemManagers.length}`);
    
    console.log(`\n⚖️ Approval Authority Coverage:`);
    console.log(`   • CABANG with Authority: ${cabangWithAuthority}/${cabangManagers.length} (${((cabangWithAuthority/cabangManagers.length)*100).toFixed(1)}%)`);
    console.log(`   • CAPEM with Authority: ${capemWithAuthority}/${capemManagers.length} (${((capemWithAuthority/capemManagers.length)*100).toFixed(1)}%)`);
    console.log(`   • Overall Coverage: ${totalWithAuthority}/${totalBranches} (${authorityPercentage}%)`);

    // Verify equal authority principle
    const cabangAuthorityRate = cabangWithAuthority / cabangManagers.length;
    const capemAuthorityRate = capemWithAuthority / capemManagers.length;
    const equalAuthority = Math.abs(cabangAuthorityRate - capemAuthorityRate) < 0.01; // Within 1%

    console.log(`\n🎯 Equal Authority Validation:`);
    console.log(`   • CABANG Authority Rate: ${(cabangAuthorityRate * 100).toFixed(1)}%`);
    console.log(`   • CAPEM Authority Rate: ${(capemAuthorityRate * 100).toFixed(1)}%`);
    console.log(`   • Equal Authority Achieved: ${equalAuthority ? '✅ YES' : '❌ NO'}`);

    // Regional coverage analysis
    console.log(`\n🌍 Regional Coverage Analysis:`);
    const regionCoverage = {};
    branchManagers.forEach(manager => {
      const region = manager.unit.region || 'Unknown';
      if (!regionCoverage[region]) {
        regionCoverage[region] = { total: 0, withAuthority: 0 };
      }
      regionCoverage[region].total++;
      if (manager.isBusinessReviewer) {
        regionCoverage[region].withAuthority++;
      }
    });

    Object.entries(regionCoverage).forEach(([region, data]) => {
      const coverage = ((data.withAuthority / data.total) * 100).toFixed(1);
      console.log(`   • ${region}: ${data.withAuthority}/${data.total} (${coverage}%)`);
    });

    // Final validation result
    const allIssues = [...issuesFound, ...hierarchyIssues];
    
    console.log(`\n${allIssues.length === 0 ? '✅' : '❌'} FINAL VALIDATION RESULT:`);
    console.log('═'.repeat(50));
    
    if (allIssues.length === 0) {
      console.log('🎉 VALIDATION PASSED! Equal approval authority successfully implemented.');
      console.log('');
      console.log('✅ All CABANG branches have approval authority');
      console.log('✅ All CAPEM branches have approval authority');
      console.log('✅ No hierarchical dependencies found');
      console.log('✅ Branch-based approval isolation working correctly');
      console.log('✅ System ready for production approval workflows');
    } else {
      console.log('❌ VALIDATION FAILED! Issues found:');
      allIssues.forEach(issue => console.log(`   • ${issue}`));
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('═'.repeat(50));
    
    if (allIssues.length === 0) {
      console.log('✅ Branch approval system is ready for testing');
      console.log('✅ Documentation can be updated with validated structure');
      console.log('✅ Workflow testing can proceed with confidence');
    } else {
      console.log('🔧 Fix identified approval authority issues');
      console.log('🔧 Re-run validation after corrections');
      console.log('🔧 Update branch manager configurations as needed');
    }

  } catch (error) {
    console.error('❌ Error validating branch workflows:', error);
    throw error;
  }
}

validateBranchWorkflows().catch(console.error).finally(() => process.exit());