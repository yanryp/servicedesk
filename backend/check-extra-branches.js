const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Helper function to parse CSV with semicolon delimiter
function parseCSV(content, delimiter = ';') {
  const lines = content.split('\n').filter(line => line.trim());
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^\uFEFF/, '')); // Remove BOM
  
  return lines.slice(1).map(line => {
    const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });
}

async function checkExtraBranches() {
  console.log('🔍 CHECKING FOR EXTRA BRANCHES BEYOND ORIGINAL 51');
  console.log('═'.repeat(70));
  
  try {
    // Read original CSV
    const branchCSVPath = path.join(__dirname, '..', 'archive', 'csv-data', 'branch.csv');
    const branchContent = fs.readFileSync(branchCSVPath, 'utf-8');
    const originalBranches = parseCSV(branchContent);
    
    console.log(`📖 Original CSV contains: ${originalBranches.length} branches`);
    
    // Get all current branches in database
    const currentBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } },
      select: {
        id: true,
        code: true,
        name: true,
        unitType: true,
        metadata: true,
        sortOrder: true
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log(`📊 Current database contains: ${currentBranches.length} branches`);
    console.log(`❗ Extra branches: ${currentBranches.length - originalBranches.length}`);
    
    // Create a map of original branch names for comparison
    const originalBranchNames = new Set();
    originalBranches.forEach(branch => {
      originalBranchNames.add(branch.NAME.toUpperCase());
    });
    
    console.log('\n🎯 ORIGINAL BRANCHES FROM CSV:');
    originalBranches.forEach((branch, index) => {
      console.log(`${String(index + 1).padStart(2, '0')}. ${branch.TYPE} | ${branch.NAME} (ID: ${branch.BRANCH_ID})`);
    });
    
    // Find extra branches
    const extraBranches = [];
    const matchedBranches = [];
    
    currentBranches.forEach(current => {
      // Extract branch name from display name
      const cleanName = current.name
        .replace(/^Kantor Cabang Pembantu\s+/i, '')
        .replace(/^Kantor Cabang\s+/i, '')
        .toUpperCase();
      
      // Also check the code
      const codeMatches = originalBranchNames.has(current.code);
      const nameMatches = originalBranchNames.has(cleanName);
      
      if (!codeMatches && !nameMatches) {
        // Try alternative matching
        let found = false;
        for (const origName of originalBranchNames) {
          if (origName.includes(cleanName) || cleanName.includes(origName)) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          extraBranches.push({
            id: current.id,
            code: current.code,
            name: current.name,
            type: current.unitType,
            cleanName: cleanName,
            metadata: current.metadata
          });
        } else {
          matchedBranches.push(current);
        }
      } else {
        matchedBranches.push(current);
      }
    });
    
    console.log(`\n✅ MATCHED BRANCHES: ${matchedBranches.length}`);
    console.log(`❌ EXTRA BRANCHES: ${extraBranches.length}`);
    
    if (extraBranches.length > 0) {
      console.log('\n🚨 EXTRA BRANCHES NOT IN ORIGINAL CSV:');
      extraBranches.forEach((branch, index) => {
        console.log(`${index + 1}. ID: ${branch.id} | Code: ${branch.code} | Type: ${branch.type}`);
        console.log(`   Name: ${branch.name}`);
        console.log(`   Clean Name: ${branch.cleanName}`);
        if (branch.metadata) {
          console.log(`   Metadata: ${JSON.stringify(branch.metadata, null, 2)}`);
        }
        console.log('');
      });
      
      console.log('\n🛠️ RECOMMENDATION:');
      console.log('These extra branches should be removed to maintain the original 51-branch structure.');
      
      // Show the SQL to remove extra branches
      console.log('\n📝 SQL to remove extra branches:');
      const extraIds = extraBranches.map(b => b.id);
      console.log(`DELETE FROM units WHERE id IN (${extraIds.join(', ')});`);
    }
    
    // Double-check by looking for missing original branches
    console.log('\n🔍 CHECKING FOR MISSING ORIGINAL BRANCHES:');
    const missingOriginal = [];
    
    originalBranches.forEach(orig => {
      const found = currentBranches.find(curr => {
        const cleanCurrentName = curr.name
          .replace(/^Kantor Cabang Pembantu\s+/i, '')
          .replace(/^Kantor Cabang\s+/i, '')
          .toUpperCase();
        
        return cleanCurrentName === orig.NAME.toUpperCase() || 
               curr.code === orig.NAME.toUpperCase().replace(/\s+/g, '_');
      });
      
      if (!found) {
        missingOriginal.push(orig);
      }
    });
    
    if (missingOriginal.length > 0) {
      console.log(`❌ MISSING ${missingOriginal.length} ORIGINAL BRANCHES:`);
      missingOriginal.forEach(branch => {
        console.log(`   • ${branch.TYPE} | ${branch.NAME} (ID: ${branch.BRANCH_ID})`);
      });
    } else {
      console.log('✅ All original branches are present');
    }
    
  } catch (error) {
    console.error('❌ Error checking extra branches:', error);
    throw error;
  }
}

checkExtraBranches().catch(console.error).finally(() => process.exit());