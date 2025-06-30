const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeCurrentStructure() {
  try {
    console.log('=== ANALYZING CURRENT SERVICE CATALOG STRUCTURE ===\n');
    
    // 1. Get all service catalogs
    console.log('1. CURRENT SERVICE CATALOGS:');
    const catalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          include: {
            customFieldDefinitions: true,
            templates: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    catalogs.forEach(catalog => {
      const itemCount = catalog.serviceItems.length;
      const fieldsCount = catalog.serviceItems.reduce((sum, item) => sum + item.customFieldDefinitions.length, 0);
      const templatesCount = catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
      
      console.log(`   - ${catalog.name} (ID: ${catalog.id})`);
      console.log(`     Description: ${catalog.description || 'No description'}`);
      console.log(`     Service Type: ${catalog.serviceType || 'Not specified'}`);
      console.log(`     Active: ${catalog.isActive}`);
      console.log(`     Items: ${itemCount}, Fields: ${fieldsCount}, Templates: ${templatesCount}\n`);
    });
    
    // 2. Get all service items and analyze patterns
    console.log('2. SERVICE ITEMS BY PATTERN:');
    const allItems = await prisma.serviceItem.findMany({
      include: {
        serviceCatalog: true,
        customFieldDefinitions: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Group by pattern
    const patterns = {
      userManagement: [],
      transfer: [],
      payment: [],
      purchase: [],
      technical: [],
      other: []
    };
    
    allItems.forEach(item => {
      const name = item.name.toLowerCase();
      
      if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi') || name.includes('reset') || name.includes('blokir')) {
        patterns.userManagement.push(item);
      } else if (name.includes('transfer') || name.includes('antar bank')) {
        patterns.transfer.push(item);
      } else if (name.includes('pembayaran') || name.includes('payment') || name.includes('pbb') || name.includes('samsat') || name.includes('pln') || name.includes('bpjs')) {
        patterns.payment.push(item);
      } else if (name.includes('pembelian') || name.includes('pulsa') || name.includes('token')) {
        patterns.purchase.push(item);
      } else if (name.includes('error') || name.includes('teknis') || name.includes('gangguan') || name.includes('maintenance')) {
        patterns.technical.push(item);
      } else {
        patterns.other.push(item);
      }
    });
    
    Object.entries(patterns).forEach(([pattern, items]) => {
      console.log(`   ${pattern.toUpperCase()} (${items.length} items):`);
      items.forEach(item => {
        console.log(`     - ${item.name} (Catalog: ${item.serviceCatalog.name}, Fields: ${item.customFieldDefinitions.length})`);
      });
      console.log('');
    });
    
    // 3. Check for missing services from CSV files
    console.log('3. CHECKING FOR SERVICES FROM TEMPLATE.CSV:');
    
    // Template.csv services (24 with custom fields)
    const templateCsvServices = [
      'OLIBS - Perubahan Menu & Limit Transaksi',
      'OLIBS - Mutasi User Pegawai', 
      'OLIBS - Pendaftaran User Baru',
      'OLIBS - Non Aktif User',
      'OLIBS - Override Password',
      'KLAIM - BSGTouch Transfer Antar Bank',
      'KLAIM - BSGTouch, BSGQRIS Klaim Gagal Transaksi',
      'XCARD - Buka Blokir dan Reset Password',
      'XCARD - Pendaftaran User Baru',
      'TellerApp/Reporting - Perubahan User',
      'TellerApp/Reporting - Pendaftaran User',
      'BSG QRIS - Pendaftaran User',
      'BSG QRIS - Perpanjang Masa Berlaku',
      'BSG QRIS - Buka Blokir & Reset Password',
      'Permintaan Perpanjangan operasional - Perpanjangan Waktu Operasional',
      'BSGTouch - Pendaftaran User',
      'BSGTouch - Perubahan User',
      'BSGTouch - Perpanjang Masa Berlaku',
      'BSGTouch - Mutasi User',
      'ATM - PERMASALAHAN TEKNIS',
      'SMS BANKING - Pendaftaran User',
      'SMS BANKING - Perubahan User',
      'SMS BANKING - Perpanjang Masa Berlaku',
      'SMS BANKING - Mutasi User'
    ];
    
    templateCsvServices.forEach(templateName => {
      const found = allItems.find(item => 
        item.name.toLowerCase().includes(templateName.toLowerCase().split(' - ')[1]?.substring(0, 15) || templateName.toLowerCase().substring(0, 15))
      );
      
      if (found) {
        console.log(`   ✅ Found: ${templateName} -> ${found.name} (Fields: ${found.customFieldDefinitions.length})`);
      } else {
        console.log(`   ❌ Missing: ${templateName}`);
      }
    });
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    
  } catch (error) {
    console.error('Error analyzing structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeCurrentStructure();