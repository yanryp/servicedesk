#!/usr/bin/env node

/**
 * BSG Master Data Population Script
 * 
 * Populates master data entities for BSG template custom fields:
 * - BSG Branch hierarchy (branches, sub-branches, office units)
 * - OLIBS Menu options (banking operations menu structure)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// BSG Branch Structure - Complete hierarchy
const BSG_BRANCHES = [
  // Main Headquarters
  { 
    code: "001", 
    name: "Kantor Pusat", 
    nameIndonesian: "Kantor Pusat",
    level: "pusat", 
    region: "manado",
    address: "Jl. Sam Ratulangi No. 9, Manado",
    isActive: true
  },
  
  // Main Branches (Cabang)
  { 
    code: "101", 
    name: "Cabang Manado", 
    nameIndonesian: "Cabang Manado",
    level: "cabang", 
    region: "manado",
    address: "Jl. Sam Ratulangi No. 15, Manado",
    isActive: true
  },
  { 
    code: "102", 
    name: "Cabang Bitung", 
    nameIndonesian: "Cabang Bitung",
    level: "cabang", 
    region: "bitung",
    address: "Jl. Yos Sudarso No. 45, Bitung",
    isActive: true
  },
  { 
    code: "103", 
    name: "Cabang Tomohon", 
    nameIndonesian: "Cabang Tomohon",
    level: "cabang", 
    region: "tomohon",
    address: "Jl. Raya Tomohon No. 12, Tomohon",
    isActive: true
  },
  { 
    code: "104", 
    name: "Cabang Kotamobagu", 
    nameIndonesian: "Cabang Kotamobagu",
    level: "cabang", 
    region: "kotamobagu",
    address: "Jl. Diponegoro No. 8, Kotamobagu",
    isActive: true
  },
  { 
    code: "105", 
    name: "Cabang Gorontalo", 
    nameIndonesian: "Cabang Gorontalo",
    level: "cabang", 
    region: "gorontalo",
    address: "Jl. 23 Januari No. 20, Gorontalo",
    isActive: true
  },
  
  // Sub-Branches (Capem - Kantor Cabang Pembantu)
  { 
    code: "201", 
    name: "Capem Tondano", 
    nameIndonesian: "Capem Tondano",
    level: "capem", 
    region: "tondano",
    parentCode: "101",
    address: "Jl. Raya Tondano No. 5, Tondano",
    isActive: true
  },
  { 
    code: "202", 
    name: "Capem Airmadidi", 
    nameIndonesian: "Capem Airmadidi",
    level: "capem", 
    region: "airmadidi",
    parentCode: "101",
    address: "Jl. Trans Sulawesi, Airmadidi",
    isActive: true
  },
  { 
    code: "203", 
    name: "Capem Langowan", 
    nameIndonesian: "Capem Langowan",
    level: "capem", 
    region: "langowan",
    parentCode: "101",
    address: "Jl. Raya Langowan No. 18, Langowan",
    isActive: true
  },
  { 
    code: "204", 
    name: "Capem Amurang", 
    nameIndonesian: "Capem Amurang",
    level: "capem", 
    region: "amurang",
    parentCode: "102",
    address: "Jl. Raya Amurang No. 25, Amurang",
    isActive: true
  },
  { 
    code: "205", 
    name: "Capem Ratahan", 
    nameIndonesian: "Capem Ratahan",
    level: "capem", 
    region: "ratahan",
    parentCode: "103",
    address: "Jl. Raya Ratahan No. 7, Ratahan",
    isActive: true
  },
  { 
    code: "301", 
    name: "Capem Bolaang Mongondow", 
    nameIndonesian: "Capem Bolaang Mongondow",
    level: "capem", 
    region: "bolmong",
    parentCode: "104",
    address: "Jl. Trans Sulawesi, Lolak",
    isActive: true
  },
  { 
    code: "401", 
    name: "Capem Limboto", 
    nameIndonesian: "Capem Limboto",
    level: "capem", 
    region: "limboto",
    parentCode: "105",
    address: "Jl. Raya Limboto No. 15, Limboto",
    isActive: true
  }
];

// OLIBS Menu Structure - Complete banking operations
const OLIBS_MENUS = [
  // Tabungan (Savings) Operations
  { 
    code: "TAB001", 
    name: "Tabungan - Buka Rekening", 
    nameIndonesian: "Tabungan - Buka Rekening",
    category: "tabungan", 
    access_level: "teller",
    description: "Pembukaan rekening tabungan baru"
  },
  { 
    code: "TAB002", 
    name: "Tabungan - Setoran Tunai", 
    nameIndonesian: "Tabungan - Setoran Tunai",
    category: "tabungan", 
    access_level: "teller",
    description: "Setoran tunai ke rekening tabungan"
  },
  { 
    code: "TAB003", 
    name: "Tabungan - Penarikan Tunai", 
    nameIndonesian: "Tabungan - Penarikan Tunai",
    category: "tabungan", 
    access_level: "teller",
    description: "Penarikan tunai dari rekening tabungan"
  },
  { 
    code: "TAB004", 
    name: "Tabungan - Transfer Antar Rekening", 
    nameIndonesian: "Tabungan - Transfer Antar Rekening",
    category: "tabungan", 
    access_level: "teller",
    description: "Transfer antar rekening tabungan"
  },
  { 
    code: "TAB005", 
    name: "Tabungan - Cetak Buku", 
    nameIndonesian: "Tabungan - Cetak Buku",
    category: "tabungan", 
    access_level: "teller",
    description: "Cetak buku tabungan"
  },
  { 
    code: "TAB006", 
    name: "Tabungan - Blokir/Buka Blokir", 
    nameIndonesian: "Tabungan - Blokir/Buka Blokir",
    category: "tabungan", 
    access_level: "supervisor",
    description: "Blokir atau buka blokir rekening tabungan"
  },
  { 
    code: "TAB007", 
    name: "Tabungan - Tutup Rekening", 
    nameIndonesian: "Tabungan - Tutup Rekening",
    category: "tabungan", 
    access_level: "supervisor",
    description: "Penutupan rekening tabungan"
  },
  
  // Deposito Operations
  { 
    code: "DEP001", 
    name: "Deposito - Buka Rekening", 
    nameIndonesian: "Deposito - Buka Rekening",
    category: "deposito", 
    access_level: "teller",
    description: "Pembukaan rekening deposito baru"
  },
  { 
    code: "DEP002", 
    name: "Deposito - Perpanjangan Otomatis", 
    nameIndonesian: "Deposito - Perpanjangan Otomatis",
    category: "deposito", 
    access_level: "teller",
    description: "Setting perpanjangan otomatis deposito"
  },
  { 
    code: "DEP003", 
    name: "Deposito - Pencairan", 
    nameIndonesian: "Deposito - Pencairan",
    category: "deposito", 
    access_level: "supervisor",
    description: "Pencairan deposito jatuh tempo"
  },
  { 
    code: "DEP004", 
    name: "Deposito - Cetak Bilyet", 
    nameIndonesian: "Deposito - Cetak Bilyet",
    category: "deposito", 
    access_level: "teller",
    description: "Cetak ulang bilyet deposito"
  },
  
  // Giro (Current Account) Operations
  { 
    code: "GIR001", 
    name: "Giro - Buka Rekening", 
    nameIndonesian: "Giro - Buka Rekening",
    category: "giro", 
    access_level: "supervisor",
    description: "Pembukaan rekening giro baru"
  },
  { 
    code: "GIR002", 
    name: "Giro - Setoran", 
    nameIndonesian: "Giro - Setoran",
    category: "giro", 
    access_level: "teller",
    description: "Setoran ke rekening giro"
  },
  { 
    code: "GIR003", 
    name: "Giro - Kliring Masuk", 
    nameIndonesian: "Giro - Kliring Masuk",
    category: "giro", 
    access_level: "teller",
    description: "Proses kliring masuk"
  },
  { 
    code: "GIR004", 
    name: "Giro - Kliring Keluar", 
    nameIndonesian: "Giro - Kliring Keluar",
    category: "giro", 
    access_level: "teller",
    description: "Proses kliring keluar"
  },
  { 
    code: "GIR005", 
    name: "Giro - Tolakan Kliring", 
    nameIndonesian: "Giro - Tolakan Kliring",
    category: "giro", 
    access_level: "supervisor",
    description: "Proses tolakan kliring"
  },
  
  // Kredit (Loan) Operations
  { 
    code: "KRD001", 
    name: "Kredit - Input Aplikasi", 
    nameIndonesian: "Kredit - Input Aplikasi",
    category: "kredit", 
    access_level: "account_officer",
    description: "Input aplikasi kredit baru"
  },
  { 
    code: "KRD002", 
    name: "Kredit - Analisa Kredit", 
    nameIndonesian: "Kredit - Analisa Kredit",
    category: "kredit", 
    access_level: "analyst",
    description: "Analisa kelayakan kredit"
  },
  { 
    code: "KRD003", 
    name: "Kredit - Komite Kredit", 
    nameIndonesian: "Kredit - Komite Kredit",
    category: "kredit", 
    access_level: "committee",
    description: "Proses komite kredit"
  },
  { 
    code: "KRD004", 
    name: "Kredit - Realisasi", 
    nameIndonesian: "Kredit - Realisasi",
    category: "kredit", 
    access_level: "supervisor",
    description: "Realisasi pencairan kredit"
  },
  { 
    code: "KRD005", 
    name: "Kredit - Angsuran", 
    nameIndonesian: "Kredit - Angsuran",
    category: "kredit", 
    access_level: "teller",
    description: "Pembayaran angsuran kredit"
  },
  { 
    code: "KRD006", 
    name: "Kredit - Pelunasan", 
    nameIndonesian: "Kredit - Pelunasan",
    category: "kredit", 
    access_level: "supervisor",
    description: "Pelunasan kredit"
  },
  
  // Operasional System Menus
  { 
    code: "OPS001", 
    name: "Close Operasional Harian", 
    nameIndonesian: "Close Operasional Harian",
    category: "operasional", 
    access_level: "supervisor",
    description: "Penutupan operasional harian"
  },
  { 
    code: "OPS002", 
    name: "Backup Database", 
    nameIndonesian: "Backup Database",
    category: "operasional", 
    access_level: "it_support",
    description: "Backup database sistem"
  },
  { 
    code: "OPS003", 
    name: "Generate Laporan", 
    nameIndonesian: "Generate Laporan",
    category: "operasional", 
    access_level: "supervisor",
    description: "Generate laporan operasional"
  },
  { 
    code: "OPS004", 
    name: "Selisih Pembukuan", 
    nameIndonesian: "Selisih Pembukuan",
    category: "operasional", 
    access_level: "supervisor",
    description: "Penanganan selisih pembukuan"
  }
];

/**
 * Populate BSG branch master data
 */
async function populateBranches() {
  console.log('🏦 Populating BSG branch hierarchy...');
  
  // Get IT Department
  const itDepartment = await prisma.department.findFirst({
    where: { name: 'Information Technology' }
  });

  if (!itDepartment) {
    throw new Error('IT Department not found. Please ensure it exists.');
  }

  let branchCount = 0;
  
  for (const branch of BSG_BRANCHES) {
    try {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: { 
            type: "branch", 
            code: branch.code 
          } 
        },
        update: {
          name: branch.name,
          nameIndonesian: branch.nameIndonesian,
          metadata: {
            level: branch.level,
            region: branch.region,
            address: branch.address,
            parentCode: branch.parentCode
          },
          isActive: branch.isActive
        },
        create: {
          type: "branch",
          code: branch.code,
          name: branch.name,
          nameIndonesian: branch.nameIndonesian,
          description: `BSG ${branch.level} - ${branch.region}`,
          metadata: {
            level: branch.level,
            region: branch.region,
            address: branch.address,
            parentCode: branch.parentCode
          },
          departmentId: itDepartment.id,
          isActive: branch.isActive,
          sortOrder: BSG_BRANCHES.indexOf(branch) + 1
        }
      });
      
      branchCount++;
      console.log(`  ✅ ${branch.name} (${branch.code})`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${branch.name}:`, error.message);
    }
  }
  
  console.log(`📍 Created ${branchCount} BSG branches/offices\n`);
}

/**
 * Populate OLIBS menu master data
 */
async function populateOlibsMenus() {
  console.log('💻 Populating OLIBS menu structure...');
  
  // Get IT Department
  const itDepartment = await prisma.department.findFirst({
    where: { name: 'Information Technology' }
  });

  let menuCount = 0;
  
  for (const menu of OLIBS_MENUS) {
    try {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: { 
            type: "olibs_menu", 
            code: menu.code 
          } 
        },
        update: {
          name: menu.name,
          nameIndonesian: menu.nameIndonesian,
          description: menu.description,
          metadata: {
            category: menu.category,
            access_level: menu.access_level
          },
          isActive: true
        },
        create: {
          type: "olibs_menu",
          code: menu.code,
          name: menu.name,
          nameIndonesian: menu.nameIndonesian,
          description: menu.description,
          metadata: {
            category: menu.category,
            access_level: menu.access_level
          },
          departmentId: itDepartment.id,
          isActive: true,
          sortOrder: OLIBS_MENUS.indexOf(menu) + 1
        }
      });
      
      menuCount++;
      console.log(`  ✅ ${menu.name} (${menu.category})`);
    } catch (error) {
      console.error(`  ❌ Failed to create ${menu.name}:`, error.message);
    }
  }
  
  console.log(`🔧 Created ${menuCount} OLIBS menu options\n`);
}

/**
 * Verify master data creation
 */
async function verifyMasterData() {
  console.log('🔍 Verifying master data creation...');
  
  const branchCount = await prisma.masterDataEntity.count({
    where: { type: 'branch', isActive: true }
  });
  
  const menuCount = await prisma.masterDataEntity.count({
    where: { type: 'olibs_menu', isActive: true }
  });
  
  console.log(`📊 Verification Results:`);
  console.log(`  🏦 BSG Branches: ${branchCount} entities`);
  console.log(`  💻 OLIBS Menus: ${menuCount} entities`);
  
  if (branchCount > 0 && menuCount > 0) {
    console.log(`✅ Master data population completed successfully!\n`);
    
    // Show sample data
    console.log('📋 Sample Branch Data:');
    const sampleBranches = await prisma.masterDataEntity.findMany({
      where: { type: 'branch', isActive: true },
      take: 3,
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true, metadata: true }
    });
    
    sampleBranches.forEach(branch => {
      console.log(`  ${branch.code}: ${branch.name} (${branch.metadata.level})`);
    });
    
    console.log('\n📋 Sample OLIBS Menu Data:');
    const sampleMenus = await prisma.masterDataEntity.findMany({
      where: { type: 'olibs_menu', isActive: true },
      take: 3,
      orderBy: { sortOrder: 'asc' },
      select: { code: true, name: true, metadata: true }
    });
    
    sampleMenus.forEach(menu => {
      console.log(`  ${menu.code}: ${menu.name} (${menu.metadata.category})`);
    });
    
  } else {
    console.log(`❌ Master data population failed - missing entities`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting BSG Master Data Population...\n');
    
    await populateBranches();
    await populateOlibsMenus();
    await verifyMasterData();
    
    console.log('🎉 BSG Master Data Population completed successfully!');
    console.log('📝 Next step: Run create-bsg-template-fields.js to define template custom fields\n');
    
  } catch (error) {
    console.error('❌ Fatal error during master data population:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  populateBranches,
  populateOlibsMenus,
  BSG_BRANCHES,
  OLIBS_MENUS
};