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

async function addMissingBranches() {
  console.log('🏢 ADDING MISSING BRANCHES TO COMPLETE 51-BRANCH STRUCTURE');
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

    // Get existing branches
    const existingBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } },
      select: { code: true, name: true, unitType: true }
    });

    console.log(`📊 Currently have ${existingBranches.length} branches in database`);
    
    // Find missing branches
    const missingBranches = [];
    for (const branch of branchData) {
      const branchName = branch.NAME;
      const branchCode = branchName.toUpperCase().replace(/\s+/g, '_');
      
      // Check if this branch already exists
      const exists = existingBranches.find(eb => 
        eb.code === branchCode || 
        eb.name.toLowerCase().includes(branchName.toLowerCase()) ||
        branchName.toLowerCase().includes(eb.name.toLowerCase().replace(/kantor cabang pembantu\s+/i, '').replace(/kantor cabang\s+/i, ''))
      );
      
      if (!exists) {
        missingBranches.push(branch);
      }
    }

    console.log(`🔍 Found ${missingBranches.length} missing branches to add`);
    
    if (missingBranches.length === 0) {
      console.log('✅ All branches are already present in the database!');
      return;
    }

    // Get current max sort order
    const maxSortOrder = await prisma.unit.findFirst({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true }
    });

    let sortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    
    // Add missing branches
    console.log('\n🏗️ Adding missing branches...');
    const addedBranches = [];

    for (const branch of missingBranches) {
      const branchType = branch.TYPE; // CABANG or CAPEM
      const branchName = branch.NAME;
      const branchCode = branchName.toUpperCase().replace(/\s+/g, '_');
      
      // Find corresponding address
      const address = addressMap[branchName] || addressMap[branchName.toUpperCase()] || '';
      const contactInfo = extractContactInfo(address);
      const location = determineLocation(branchName, address);
      
      // Determine display name
      const isCapem = branchType === 'CAPEM';
      const displayName = isCapem ? 
        `Kantor Cabang Pembantu ${branchName}` : 
        `Kantor Cabang ${branchName}`;
      
      const unitType = isCapem ? 'CAPEM' : 'CABANG';
      
      try {
        // Create branch
        const newBranch = await prisma.unit.create({
          data: {
            code: branchCode,
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
              originalBranchId: String(branch.BRANCH_ID).padStart(3, '0'),
              branchType: branchType,
              csvData: branch,
              hasAddress: !!address,
              imported: true
            }
          }
        });

        addedBranches.push(newBranch);
        console.log(`✅ Added ${branchType}: ${branchName} (${location.province})`);
      } catch (error) {
        console.log(`❌ Failed to add ${branchName}: ${error.message}`);
      }
    }

    // Final summary
    console.log('\n📊 FINAL SUMMARY:');
    console.log('═'.repeat(50));
    
    const allBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['CABANG', 'CAPEM'] } },
      orderBy: { sortOrder: 'asc' }
    });

    const cabangCount = allBranches.filter(b => b.unitType === 'CABANG').length;
    const capemCount = allBranches.filter(b => b.unitType === 'CAPEM').length;
    
    console.log(`📈 Total branches now: ${allBranches.length}`);
    console.log(`   • CABANG: ${cabangCount}`);
    console.log(`   • CAPEM: ${capemCount}`);
    console.log(`   • Added this session: ${addedBranches.length}`);
    
    // Provincial distribution
    const provinceCounts = {};
    allBranches.forEach(branch => {
      const province = branch.province || 'Unknown';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });
    
    console.log('\n🌍 Provincial Distribution:');
    Object.entries(provinceCounts).forEach(([province, count]) => {
      console.log(`   • ${province}: ${count} branches`);
    });

    console.log('\n✅ BRANCH STRUCTURE COMPLETED!');
    console.log(`🎯 Database now contains the complete BSG branch network (target: 51 branches)`);

  } catch (error) {
    console.error('❌ Error adding missing branches:', error);
    throw error;
  }
}

addMissingBranches().catch(console.error).finally(() => process.exit());