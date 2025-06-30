const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Enhanced geographic mapping for Indonesian regions
const geographicData = {
  // North Sulawesi Provincial Regions
  'Manado Metropolitan': {
    province: 'Sulawesi Utara',
    region: 'Manado Metropolitan Area',
    zone: 'Urban Core',
    coordinates: { lat: 1.4748, lng: 124.8421 },
    branches: ['UTAMA', 'CALACA', 'TUMINTING', 'PAAL DUA', 'BAHU', 'RANOTANA', 'SAMRAT']
  },
  
  'Minahasa Cluster': {
    province: 'Sulawesi Utara',
    region: 'Minahasa Regency Cluster',
    zone: 'Highland Region',
    coordinates: { lat: 1.3000, lng: 124.9000 },
    branches: ['TOMOHON', 'TONDANO', 'KAWANGKOAN', 'AMURANG', 'RATAHAN', 'MOTOLING', 'LANGOWAN', 'MODOINDING']
  },
  
  'North Coast Cluster': {
    province: 'Sulawesi Utara',
    region: 'North Sulawesi Coast',
    zone: 'Coastal Industrial',
    coordinates: { lat: 1.4500, lng: 125.1500 },
    branches: ['BITUNG', 'AIRMADIDI', 'LIKUPANG', 'MANEMBO-NEMBO']
  },
  
  'Sangihe Talaud Islands': {
    province: 'Sulawesi Utara',
    region: 'Kepulauan Sangihe Talaud',
    zone: 'Remote Islands',
    coordinates: { lat: 3.6000, lng: 125.5000 },
    branches: ['TAHUNA', 'SIAU', 'MELONGUANE', 'LIRUNG', 'TAGULANDANG', 'TAMAKO', 'BEO']
  },
  
  'Bolaang Mongondow': {
    province: 'Sulawesi Utara',
    region: 'Bolaang Mongondow Regency',
    zone: 'Interior Highlands',
    coordinates: { lat: 0.7000, lng: 124.3000 },
    branches: ['KOTAMOBAGU', 'LOLAK', 'BOROKO', 'MOLIBAGU', 'TUTUYAN', 'MOPUYA']
  },
  
  // Gorontalo Provincial Regions
  'Gorontalo Metropolitan': {
    province: 'Gorontalo',
    region: 'Gorontalo City Area',
    zone: 'Provincial Capital',
    coordinates: { lat: 0.5435, lng: 123.0582 },
    branches: ['GORONTALO', 'LIMBOTO', 'PASAR SENTRAL', 'TELAGA']
  },
  
  'Gorontalo Regency': {
    province: 'Gorontalo',
    region: 'Gorontalo Rural Areas',
    zone: 'Rural Extension',
    coordinates: { lat: 0.6000, lng: 122.8000 },
    branches: ['SUWAWA', 'KWANDANG', 'TILAMUTA', 'PAGUAT', 'RANDANGAN', 'TOLANGOHULA', 'MARISA', 'POPAYATO', 'PAGUYAMAN']
  },
  
  // Java Regional Offices
  'Jakarta Business Center': {
    province: 'DKI Jakarta',
    region: 'Jakarta Metropolitan Area',
    zone: 'National Business Hub',
    coordinates: { lat: -6.2088, lng: 106.8456 },
    branches: ['JAKARTA', 'KELAPA GADING', 'CEMPAKA PUTIH', 'MANGGA DUA']
  },
  
  'East Java Operations': {
    province: 'Jawa Timur',
    region: 'East Java Business Zone',
    zone: 'Regional Office',
    coordinates: { lat: -7.2575, lng: 112.7521 },
    branches: ['SURABAYA', 'MALANG']
  }
};

// Business district classifications
const businessDistricts = {
  'Financial District': ['JAKARTA', 'KELAPA GADING', 'SURABAYA'],
  'Commercial Hub': ['UTAMA', 'GORONTALO', 'BITUNG', 'KOTAMOBAGU'],
  'Industrial Zone': ['BITUNG', 'AIRMADIDI', 'MALANG'],
  'Tourism Gateway': ['TOMOHON', 'TAHUNA', 'MELONGUANE'],
  'Government Center': ['GORONTALO', 'LIMBOTO', 'JAKARTA'],
  'Trading Port': ['BITUNG', 'SURABAYA', 'SIAU'],
  'Agricultural Center': ['TONDANO', 'KAWANGKOAN', 'AMURANG'],
  'Mining Region': ['KOTAMOBAGU', 'MOLIBAGU', 'LOLAK'],
  'Residential Area': ['CALACA', 'TUMINTING', 'RANOTANA', 'BAHU']
};

// Strategic importance classification
const strategicImportance = {
  'Tier 1 - Strategic': ['UTAMA', 'JAKARTA', 'GORONTALO', 'BITUNG', 'KOTAMOBAGU'],
  'Tier 2 - Important': ['TOMOHON', 'TONDANO', 'TAHUNA', 'SURABAYA', 'AIRMADIDI'],
  'Tier 3 - Standard': ['KAWANGKOAN', 'LIMBOTO', 'SIAU', 'CALACA', 'MALANG'],
  'Tier 4 - Coverage': [] // Will be filled with remaining branches
};

function findGeographicCluster(branchCode, branchName) {
  // Extract the actual branch name from the display name
  const nameToMatch = branchName.replace('Branch ', '').replace('CAPEM ', '').toUpperCase();
  
  // Search through geographic clusters by both code and name
  for (const [clusterName, clusterData] of Object.entries(geographicData)) {
    if (clusterData.branches.includes(branchCode) || clusterData.branches.includes(nameToMatch)) {
      return {
        cluster: clusterName,
        province: clusterData.province,
        region: clusterData.region,
        zone: clusterData.zone,
        coordinates: clusterData.coordinates
      };
    }
  }
  
  // Specific mappings for known branches
  const specificMappings = {
    'UTAMA': { cluster: 'Manado Metropolitan', province: 'Sulawesi Utara', region: 'Manado Metropolitan Area', zone: 'Urban Core' },
    'GORONTALO': { cluster: 'Gorontalo Metropolitan', province: 'Gorontalo', region: 'Gorontalo City Area', zone: 'Provincial Capital' },
    'JAKARTA': { cluster: 'Jakarta Business Center', province: 'DKI Jakarta', region: 'Jakarta Metropolitan Area', zone: 'National Business Hub' },
    'SURABAYA': { cluster: 'East Java Operations', province: 'Jawa Timur', region: 'East Java Business Zone', zone: 'Regional Office' },
    'MALANG': { cluster: 'East Java Operations', province: 'Jawa Timur', region: 'East Java Business Zone', zone: 'Regional Office' },
    'TAHUNA': { cluster: 'Sangihe Talaud Islands', province: 'Sulawesi Utara', region: 'Kepulauan Sangihe Talaud', zone: 'Remote Islands' },
    'SIAU': { cluster: 'Sangihe Talaud Islands', province: 'Sulawesi Utara', region: 'Kepulauan Sangihe Talaud', zone: 'Remote Islands' },
    'MELONGUANE': { cluster: 'Sangihe Talaud Islands', province: 'Sulawesi Utara', region: 'Kepulauan Sangihe Talaud', zone: 'Remote Islands' },
    'BITUNG': { cluster: 'North Coast Cluster', province: 'Sulawesi Utara', region: 'North Sulawesi Coast', zone: 'Coastal Industrial' },
    'TOMOHON': { cluster: 'Minahasa Cluster', province: 'Sulawesi Utara', region: 'Minahasa Regency Cluster', zone: 'Highland Region' },
    'TONDANO': { cluster: 'Minahasa Cluster', province: 'Sulawesi Utara', region: 'Minahasa Regency Cluster', zone: 'Highland Region' },
    'KOTAMOBAGU': { cluster: 'Bolaang Mongondow', province: 'Sulawesi Utara', region: 'Bolaang Mongondow Regency', zone: 'Interior Highlands' }
  };
  
  if (specificMappings[nameToMatch]) {
    const mapping = specificMappings[nameToMatch];
    return {
      cluster: mapping.cluster,
      province: mapping.province,
      region: mapping.region,
      zone: mapping.zone,
      coordinates: { lat: 1.0000, lng: 124.0000 }
    };
  }
  
  // Regional classification based on name patterns
  if (nameToMatch.includes('KELAPA GADING') || nameToMatch.includes('CEMPAKA PUTIH') || nameToMatch.includes('MANGGA DUA')) {
    return {
      cluster: 'Jakarta Business Center',
      province: 'DKI Jakarta',
      region: 'Jakarta Metropolitan Area',
      zone: 'National Business Hub',
      coordinates: { lat: -6.2088, lng: 106.8456 }
    };
  }
  
  // Default classification for remaining branches
  return {
    cluster: 'Sulawesi Regional Network',
    province: 'Sulawesi Utara',
    region: 'Regional Coverage Area',
    zone: 'Standard Coverage',
    coordinates: { lat: 1.0000, lng: 124.0000 }
  };
}

function findBusinessDistrict(branchCode, branchName) {
  const nameToMatch = branchName.replace('Branch ', '').replace('CAPEM ', '').toUpperCase();
  
  for (const [district, branches] of Object.entries(businessDistricts)) {
    if (branches.includes(branchCode) || branches.includes(nameToMatch)) {
      return district;
    }
  }
  
  // Classification by business type
  if (nameToMatch.includes('JAKARTA') || nameToMatch.includes('KELAPA GADING')) {
    return 'Financial District';
  }
  if (nameToMatch.includes('UTAMA') || nameToMatch.includes('GORONTALO') || nameToMatch.includes('BITUNG')) {
    return 'Commercial Hub';
  }
  if (nameToMatch.includes('TAHUNA') || nameToMatch.includes('TOMOHON')) {
    return 'Tourism Gateway';
  }
  
  return 'Mixed Commercial';
}

function findStrategicTier(branchCode, branchName) {
  const nameToMatch = branchName.replace('Branch ', '').replace('CAPEM ', '').toUpperCase();
  
  for (const [tier, branches] of Object.entries(strategicImportance)) {
    if (branches.includes(branchCode) || branches.includes(nameToMatch)) {
      return tier;
    }
  }
  
  // Strategic classification
  if (['UTAMA', 'JAKARTA', 'GORONTALO', 'BITUNG', 'KOTAMOBAGU'].includes(nameToMatch)) {
    return 'Tier 1 - Strategic';
  }
  if (['TOMOHON', 'TONDANO', 'TAHUNA', 'SURABAYA', 'AIRMADIDI'].includes(nameToMatch)) {
    return 'Tier 2 - Important';
  }
  if (['KAWANGKOAN', 'LIMBOTO', 'SIAU', 'CALACA', 'MALANG'].includes(nameToMatch)) {
    return 'Tier 3 - Standard';
  }
  
  return 'Tier 4 - Coverage';
}

// Market size classification based on branch type and location
function getMarketSize(unitType, branchCode, region) {
  if (['JAKARTA', 'SURABAYA', 'UTAMA', 'GORONTALO'].includes(branchCode)) {
    return 'Large Market';
  }
  
  if (unitType === 'branch') {
    return 'Medium Market';
  }
  
  if (region.includes('Island') || region.includes('Remote')) {
    return 'Small Market';
  }
  
  return 'Standard Market';
}

async function addGeographicMetadata() {
  console.log('🌍 ADDING GEOGRAPHIC METADATA TO ALL BRANCHES');
  console.log('═'.repeat(70));
  
  try {
    // Get all branches
    const branches = await prisma.unit.findMany({
      where: { 
        unitType: { in: ['branch', 'sub_branch'] },
        isActive: true 
      },
      orderBy: [
        { unitType: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    console.log(`📊 Found ${branches.length} branches to enhance`);
    
    let updated = 0;
    let errors = 0;

    console.log('\n🔍 Processing geographic enhancements...\n');

    for (const branch of branches) {
      try {
        const geo = findGeographicCluster(branch.code, branch.name);
        const businessDistrict = findBusinessDistrict(branch.code, branch.name);
        const strategicTier = findStrategicTier(branch.code, branch.name);
        const marketSize = getMarketSize(branch.unitType, branch.code, geo.region);

        // Create enhanced metadata
        const enhancedMetadata = {
          ...branch.metadata,
          geographic: {
            cluster: geo.cluster,
            coordinates: geo.coordinates,
            businessDistrict: businessDistrict,
            strategicTier: strategicTier,
            marketSize: marketSize,
            lastUpdated: new Date().toISOString()
          }
        };

        // Update branch with geographic data
        await prisma.unit.update({
          where: { id: branch.id },
          data: {
            region: geo.region,
            province: geo.province,
            metadata: enhancedMetadata
          }
        });

        console.log(`✅ ${branch.code} - ${branch.name}`);
        console.log(`   📍 ${geo.cluster} | ${geo.region}`);
        console.log(`   🏢 ${businessDistrict} | ${strategicTier}`);
        console.log(`   📈 ${marketSize}\n`);

        updated++;

      } catch (error) {
        console.error(`❌ Error updating ${branch.code}:`, error.message);
        errors++;
      }
    }

    // Generate summary by geographic clusters
    console.log('📊 GEOGRAPHIC DISTRIBUTION SUMMARY:');
    console.log('═'.repeat(50));

    const finalBranches = await prisma.unit.findMany({
      where: { 
        unitType: { in: ['branch', 'sub_branch'] },
        isActive: true 
      }
    });

    // Group by cluster
    const clusterCounts = {};
    const provinceCounts = {};
    const tierCounts = {};
    const marketCounts = {};

    finalBranches.forEach(branch => {
      const geo = branch.metadata?.geographic;
      if (geo) {
        // Cluster distribution
        const cluster = geo.cluster || 'Unknown';
        clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;

        // Strategic tier distribution
        const tier = geo.strategicTier || 'Unclassified';
        tierCounts[tier] = (tierCounts[tier] || 0) + 1;

        // Market size distribution
        const market = geo.marketSize || 'Unknown';
        marketCounts[market] = (marketCounts[market] || 0) + 1;
      }

      // Province distribution
      const province = branch.province || 'Unknown';
      provinceCounts[province] = (provinceCounts[province] || 0) + 1;
    });

    console.log('\n🌍 Geographic Clusters:');
    Object.entries(clusterCounts).forEach(([cluster, count]) => {
      console.log(`   • ${cluster}: ${count} branches`);
    });

    console.log('\n🏛️ Provincial Distribution:');
    Object.entries(provinceCounts).forEach(([province, count]) => {
      console.log(`   • ${province}: ${count} branches`);
    });

    console.log('\n⭐ Strategic Tiers:');
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   • ${tier}: ${count} branches`);
    });

    console.log('\n📈 Market Sizes:');
    Object.entries(marketCounts).forEach(([market, count]) => {
      console.log(`   • ${market}: ${count} branches`);
    });

    console.log(`\n✅ GEOGRAPHIC ENHANCEMENT COMPLETED!`);
    console.log(`📊 Updated: ${updated} branches`);
    console.log(`❌ Errors: ${errors} branches`);
    console.log('🎯 Ready for regional analytics and reporting');

  } catch (error) {
    console.error('❌ Error adding geographic metadata:', error);
    throw error;
  }
}

addGeographicMetadata().catch(console.error).finally(() => process.exit());