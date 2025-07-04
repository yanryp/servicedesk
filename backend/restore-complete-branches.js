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

// Helper function to extract contact info from address
function extractContactInfo(address) {
  const phoneRegex = /[Tt]elp[\.:\s]*([0-9\-\s\(\)\.\/\+,;]+)/i;
  const faxRegex = /[Ff]ax[\.:\s]*([0-9\-\s\(\)\.\/\+,;]+)/i;
  
  const phoneMatch = address.match(phoneRegex);
  const faxMatch = address.match(faxRegex);
  
  return {
    phone: phoneMatch ? phoneMatch[1].split(/[,;]/)[0].trim() : null,
    fax: faxMatch ? faxMatch[1].split(/[,;]/)[0].trim() : null
  };
}

// Helper function to determine province and region
function determineLocation(branchName, address) {
  const nameLower = branchName.toLowerCase();
  const addressLower = address.toLowerCase();
  
  // Province mapping
  if (nameLower.includes('jakarta') || addressLower.includes('jakarta')) {
    return { province: 'DKI Jakarta', region: 'DKI Jakarta' };
  }
  if (nameLower.includes('surabaya') || addressLower.includes('surabaya') || nameLower.includes('malang')) {
    return { province: 'Jawa Timur', region: 'Jawa Timur' };
  }
  if (nameLower.includes('gorontalo') || addressLower.includes('gorontalo')) {
    return { province: 'Gorontalo', region: 'Gorontalo Metro' };
  }
  
  // Sulawesi Utara regions
  if (nameLower.includes('manado') || nameLower.includes('utama') || nameLower.includes('kelapa gading') || 
      nameLower.includes('tuminting') || nameLower.includes('wenang') || nameLower.includes('wanea') || 
      nameLower.includes('malalayang') || nameLower.includes('bahu') || nameLower.includes('ranotana') ||
      nameLower.includes('samrat') || nameLower.includes('calaca') || nameLower.includes('paal dua')) {
    return { province: 'Sulawesi Utara', region: 'Manado Metro' };
  }
  
  if (nameLower.includes('minahasa') || nameLower.includes('tomohon') || nameLower.includes('tondano') || 
      nameLower.includes('airmadidi') || nameLower.includes('kawangkoan') || nameLower.includes('amurang') ||
      nameLower.includes('ratahan') || nameLower.includes('langowan') || nameLower.includes('modoinding')) {
    return { province: 'Sulawesi Utara', region: 'Minahasa' };
  }
  
  if (nameLower.includes('bitung') || nameLower.includes('likupang') || nameLower.includes('manembo')) {
    return { province: 'Sulawesi Utara', region: 'North Coast' };
  }
  
  if (nameLower.includes('kotamobagu') || nameLower.includes('molibagu') || nameLower.includes('lolak') ||
      nameLower.includes('poigar') || nameLower.includes('bolmong') || nameLower.includes('mopuya')) {
    return { province: 'Sulawesi Utara', region: 'Bolaang Mongondow' };
  }
  
  if (nameLower.includes('tahuna') || nameLower.includes('siau') || nameLower.includes('melonguane') ||
      nameLower.includes('lirung') || nameLower.includes('tagulandang') || nameLower.includes('tamako') ||
      nameLower.includes('beo')) {
    return { province: 'Sulawesi Utara', region: 'Sangihe Islands' };
  }
  
  // Default to Sulawesi Utara
  return { province: 'Sulawesi Utara', region: 'Sulawesi Utara' };
}

async function restoreCompleteBranches() {
  console.log('🏢 RESTORING COMPLETE 51-BRANCH STRUCTURE');
  console.log('═'.repeat(70));
  
  try {
    // Read original CSV files
    const branchCSVPath = path.join(__dirname, '..', 'archive', 'csv-data', 'branch.csv');
    const addressCSVPath = path.join(__dirname, '..', 'archive', 'csv-data', 'branch_address.csv');
    
    console.log('📖 Reading original CSV files...');
    const branchContent = fs.readFileSync(branchCSVPath, 'utf-8');
    const addressContent = fs.readFileSync(addressCSVPath, 'utf-8');
    
    // Parse CSV data
    const branchData = parseCSV(branchContent);
    const addressData = addressContent.split('\n').filter(line => line.trim());
    
    console.log(`✅ Found ${branchData.length} branches in original branch.csv`);
    console.log(`✅ Found ${addressData.length} addresses in original branch_address.csv`);

    // Create mapping of branch names to addresses
    const addressMap = {};
    addressData.forEach(line => {
      const parts = line.split(';');
      if (parts.length >= 2) {
        const branchName = parts[0].trim().replace(/^\uFEFF/, '');
        const address = parts[1].trim().replace(/"/g, '');
        
        // Extract branch name from "Cabang XXXX" format
        const cleanName = branchName.replace(/^Cabang\s+/i, '').toUpperCase();
        addressMap[cleanName] = address;
      }
    });

    console.log(`📍 Mapped ${Object.keys(addressMap).length} addresses`);

    // Clear existing units that might be incomplete
    console.log('\n🧹 Clearing existing incomplete branch data...');
    await prisma.unit.deleteMany({
      where: {
        unitType: { in: ['CABANG', 'CAPEM', 'branch', 'sub_branch'] }
      }
    });

    // Create all 51 branches
    console.log('\n🏗️ Creating complete branch structure...');
    let sortOrder = 1;
    const createdBranches = [];

    for (const branch of branchData) {
      const branchId = String(branch.BRANCH_ID).padStart(3, '0');
      const branchType = branch.TYPE; // CABANG or CAPEM
      const branchName = branch.NAME;
      
      // Find corresponding address
      const address = addressMap[branchName] || addressMap[branchName.toUpperCase()] || '';
      const contactInfo = extractContactInfo(address);
      const location = determineLocation(branchName, address);
      
      // Determine display name and unit type
      const isCapem = branchType === 'CAPEM';
      const displayName = isCapem ? 
        `Kantor Cabang Pembantu ${branchName}` : 
        `Kantor Cabang ${branchName}`;
      
      const unitType = isCapem ? 'CAPEM' : 'CABANG';
      
      // Create branch
      const newBranch = await prisma.unit.create({
        data: {
          code: branchName.toUpperCase().replace(/\s+/g, '_'),
          name: displayName,
          displayName: displayName,
          unitType: unitType,
          isActive: true,
          sortOrder: sortOrder++,
          address: address || null,
          phone: contactInfo.phone,
          fax: contactInfo.fax,
          region: location.region,
          province: location.province,
          metadata: {
            originalBranchId: branchId,
            branchType: branchType,
            csvData: branch,
            hasAddress: !!address
          }
        }
      });

      createdBranches.push(newBranch);
      console.log(`✅ Created ${branchType}: ${branchName} (${location.province})`);
    }

    // Summary
    console.log('\n📊 RESTORATION SUMMARY:');
    console.log('═'.repeat(50));
    
    const finalBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } },
      orderBy: { sortOrder: 'asc' }
    });

    const cabangCount = finalBranches.filter(b => b.unitType === 'CABANG').length;
    const capemCount = finalBranches.filter(b => b.unitType === 'CAPEM').length;
    
    console.log(`📈 Total branches restored: ${finalBranches.length}`);
    console.log(`   • CABANG: ${cabangCount}`);
    console.log(`   • CAPEM: ${capemCount}`);
    
    // Provincial distribution
    const provinceCounts = {};
    finalBranches.forEach(branch => {
      const province = branch.province || 'Unknown';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });
    
    console.log('\n🌍 Provincial Distribution:');
    Object.entries(provinceCounts).forEach(([province, count]) => {
      console.log(`   • ${province}: ${count} branches`);
    });

    // Show first 10 branches as sample
    console.log('\n📋 Sample branches (first 10):');
    finalBranches.slice(0, 10).forEach(branch => {
      console.log(`   ${branch.unitType} | ${branch.code} | ${branch.name}`);
    });

    console.log('\n✅ COMPLETE 51-BRANCH STRUCTURE RESTORED!');
    console.log('🎯 All original branches from CSV have been imported');

  } catch (error) {
    console.error('❌ Error restoring branches:', error);
    throw error;
  }
}

restoreCompleteBranches().catch(console.error).finally(() => process.exit());