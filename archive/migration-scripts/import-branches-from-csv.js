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

// Helper function to determine parent branch for CAPEM units
function findParentBranch(capemName, branches) {
  // Extract location from CAPEM name for matching
  const location = capemName.toLowerCase();
  
  // Define parent relationships based on geographic proximity
  const parentMappings = {
    'kelapa gading': 'JAKARTA',
    'cempaka putih': 'JAKARTA', 
    'mangga dua': 'JAKARTA',
    'lirung': 'TAHUNA',
    'tagulandang': 'SIAU',
    'tuminting': 'UTAMA',
    'likupang': 'AIRMADIDI',
    'paal dua': 'UTAMA',
    'paguat': 'TILAMUTA',
    'motoling': 'TOMOHON',
    'manembo-nembo': 'BITUNG',
    'randangan': 'TILAMUTA',
    'tolangohula': 'LIMBOTO',
    'bahu': 'UTAMA',
    'ranotana': 'UTAMA',
    'tamako': 'TAHUNA',
    'paguyaman': 'MARISA',
    'langowan': 'TONDANO',
    'samrat': 'UTAMA',
    'beo': 'MELONGUANE',
    'telaga': 'GORONTALO',
    'mopuya': 'KOTAMOBAGU',
    'modoinding': 'TOMOHON',
    'popayato': 'MARISA',
    'pasar sentral': 'GORONTALO'
  };

  // Find matching key in parent mappings
  for (const [key, parent] of Object.entries(parentMappings)) {
    if (location.includes(key)) {
      const parentBranch = branches.find(b => b.code === parent);
      return parentBranch ? parentBranch.id : null;
    }
  }

  // Default fallback to UTAMA for Manado area or GORONTALO for Gorontalo area
  if (location.includes('manado') || location.includes('sulawesi utara')) {
    const utama = branches.find(b => b.code === 'UTAMA');
    return utama ? utama.id : null;
  }
  
  if (location.includes('gorontalo')) {
    const gorontalo = branches.find(b => b.code === 'GORONTALO');
    return gorontalo ? gorontalo.id : null;
  }

  return null; // No parent found
}

// Helper function to extract region from address
function extractRegion(address) {
  const addressLower = address.toLowerCase();
  
  if (addressLower.includes('jakarta')) return 'DKI Jakarta';
  if (addressLower.includes('surabaya') || addressLower.includes('malang')) return 'Jawa Timur';
  if (addressLower.includes('manado') || addressLower.includes('bitung') || addressLower.includes('tomohon')) return 'Sulawesi Utara';
  if (addressLower.includes('gorontalo')) return 'Gorontalo';
  if (addressLower.includes('talaud') || addressLower.includes('sangihe')) return 'Kepulauan Sangihe Talaud';
  if (addressLower.includes('minahasa')) return 'Minahasa';
  if (addressLower.includes('bolaang mongondow')) return 'Bolaang Mongondow';
  
  return 'Sulawesi Utara'; // Default region
}

// Helper function to extract contact info from address
function extractContactInfo(address) {
  const phoneRegex = /[Tt]elp[\.:\s]*([0-9\-\s\(\)\.\/\+,]+)/i;
  const faxRegex = /[Ff]ax[\.:\s]*([0-9\-\s\(\)\.\/\+,]+)/i;
  
  const phoneMatch = address.match(phoneRegex);
  const faxMatch = address.match(faxRegex);
  
  return {
    phone: phoneMatch ? phoneMatch[1].trim() : null,
    fax: faxMatch ? faxMatch[1].trim() : null
  };
}

async function importBranchesFromCSV() {
  console.log('🏢 IMPORTING BRANCHES FROM CSV FILES');
  console.log('═'.repeat(70));
  
  try {
    // Read and parse branch.csv
    const branchCSVPath = path.join(__dirname, '..', 'branch.csv');
    const branchAddressCSVPath = path.join(__dirname, '..', 'branch_address.csv');
    
    console.log('📖 Reading CSV files...');
    const branchContent = fs.readFileSync(branchCSVPath, 'utf-8');
    const addressContent = fs.readFileSync(branchAddressCSVPath, 'utf-8');
    
    // Parse CSV data
    const branchData = parseCSV(branchContent);
    const addressData = parseCSV(addressContent);
    
    console.log(`✅ Found ${branchData.length} branches in branch.csv`);
    console.log(`✅ Found ${addressData.length} addresses in branch_address.csv`);

    // Check existing branches to avoid duplicates
    const existingBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['branch', 'sub_branch'] } }
    });
    
    console.log(`📊 Existing branches in database: ${existingBranches.length}`);

    // First, enhance Unit table schema if needed
    console.log('\n🔧 Checking Unit table schema...');
    try {
      await prisma.$executeRaw`ALTER TABLE units ADD COLUMN IF NOT EXISTS address TEXT`;
      await prisma.$executeRaw`ALTER TABLE units ADD COLUMN IF NOT EXISTS phone VARCHAR(100)`;
      await prisma.$executeRaw`ALTER TABLE units ADD COLUMN IF NOT EXISTS fax VARCHAR(100)`;
      await prisma.$executeRaw`ALTER TABLE units ADD COLUMN IF NOT EXISTS region VARCHAR(100)`;
      await prisma.$executeRaw`ALTER TABLE units ADD COLUMN IF NOT EXISTS province VARCHAR(100)`;
      console.log('✅ Unit table schema enhanced');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Unit table schema already up to date');
      } else {
        console.warn('⚠️ Schema update warning:', error.message);
      }
    }

    // Create mapping of branch names to addresses
    const addressMap = {};
    addressData.forEach(addr => {
      const parts = addr['Cabang Utama'].split(';'); // First column contains branch name
      const branchName = parts[0].trim();
      const address = parts[1] ? parts[1].trim() : '';
      addressMap[branchName] = address;
    });

    // Process branches in two passes: CABANG first, then CAPEM
    const cabangBranches = branchData.filter(branch => branch.TYPE === 'CABANG');
    const capemBranches = branchData.filter(branch => branch.TYPE === 'CAPEM');
    
    console.log(`\n📍 Processing ${cabangBranches.length} CABANG branches first...`);
    
    const createdBranches = [];
    let sortOrder = existingBranches.length + 1;

    // Pass 1: Create CABANG branches
    for (const branch of cabangBranches) {
      const code = String(branch.BRANCH_ID).padStart(3, '0');
      const name = branch.NAME;
      
      // Check if branch already exists
      const existing = existingBranches.find(eb => eb.code === code);
      if (existing) {
        console.log(`⏭️ Skipping existing branch: ${code} (${name})`);
        createdBranches.push(existing);
        continue;
      }

      // Find corresponding address
      const addressKey = Object.keys(addressMap).find(key => 
        key.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(key.toLowerCase().replace('cabang ', ''))
      );
      
      const fullAddress = addressMap[addressKey] || '';
      const contactInfo = extractContactInfo(fullAddress);
      const region = extractRegion(fullAddress);

      // Create branch unit
      const newBranch = await prisma.unit.create({
        data: {
          code: code,
          name: `Branch ${name}`,
          displayName: `Kantor Cabang ${name}`,
          unitType: 'branch',
          parentId: null,
          isActive: true,
          sortOrder: sortOrder++,
          address: fullAddress,
          phone: contactInfo.phone,
          fax: contactInfo.fax,
          region: region,
          province: region,
          metadata: {
            branchType: 'CABANG',
            originalCSVData: branch
          }
        }
      });

      createdBranches.push(newBranch);
      console.log(`✅ Created CABANG: ${code} - ${name} (${region})`);
    }

    console.log(`\n📍 Processing ${capemBranches.length} CAPEM branches...`);

    // Pass 2: Create CAPEM branches with proper parent relationships
    for (const branch of capemBranches) {
      const code = String(branch.BRANCH_ID).padStart(3, '0');
      const name = branch.NAME;
      
      // Check if branch already exists
      const existing = existingBranches.find(eb => eb.code === code);
      if (existing) {
        console.log(`⏭️ Skipping existing branch: ${code} (${name})`);
        continue;
      }

      // Find corresponding address
      const addressKey = Object.keys(addressMap).find(key => 
        key.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(key.toLowerCase().replace('cabang pembantu ', ''))
      );
      
      const fullAddress = addressMap[addressKey] || '';
      const contactInfo = extractContactInfo(fullAddress);
      const region = extractRegion(fullAddress);
      
      // Find parent branch
      const parentId = findParentBranch(name, createdBranches);

      // Create CAPEM unit
      const newBranch = await prisma.unit.create({
        data: {
          code: code,
          name: `CAPEM ${name}`,
          displayName: `Kantor Cabang Pembantu ${name}`,
          unitType: 'sub_branch',
          parentId: parentId,
          isActive: true,
          sortOrder: sortOrder++,
          address: fullAddress,
          phone: contactInfo.phone,
          fax: contactInfo.fax,
          region: region,
          province: region,
          metadata: {
            branchType: 'CAPEM',
            originalCSVData: branch,
            parentBranch: parentId ? createdBranches.find(b => b.id === parentId)?.name : null
          }
        }
      });

      createdBranches.push(newBranch);
      const parentName = parentId ? createdBranches.find(b => b.id === parentId)?.name : 'No parent';
      console.log(`✅ Created CAPEM: ${code} - ${name} (Parent: ${parentName})`);
    }

    // Summary
    console.log('\n📊 IMPORT SUMMARY:');
    console.log('═'.repeat(50));
    
    const finalBranches = await prisma.unit.findMany({
      where: { unitType: { in: ['branch', 'sub_branch'] } },
      orderBy: { sortOrder: 'asc' }
    });

    const cabangCount = finalBranches.filter(b => b.unitType === 'branch').length;
    const capemCount = finalBranches.filter(b => b.unitType === 'sub_branch').length;
    
    console.log(`📈 Total branches: ${finalBranches.length}`);
    console.log(`   • CABANG: ${cabangCount}`);
    console.log(`   • CAPEM: ${capemCount}`);
    
    // Regional distribution
    const regionCounts = {};
    finalBranches.forEach(branch => {
      const region = branch.region || 'Unknown';
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    });
    
    console.log('\n🌍 Regional Distribution:');
    Object.entries(regionCounts).forEach(([region, count]) => {
      console.log(`   • ${region}: ${count} branches`);
    });

    console.log('\n✅ BRANCH IMPORT COMPLETED SUCCESSFULLY!');
    console.log('🎯 Ready for user creation and workflow testing');

  } catch (error) {
    console.error('❌ Error importing branches:', error);
    throw error;
  }
}

importBranchesFromCSV().catch(console.error).finally(() => process.exit());