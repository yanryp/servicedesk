import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Expected services from ITIL documentation
const expectedServices = {
  'Core Banking & Financial Systems': {
    'OLIBS System': [
      'OLIBs - BE Error', 'OLIBs - Buka Blokir', 'OLIBs - Error Deposito',
      'OLIBs - Error Giro', 'OLIBs - Error Kredit', 'OLIBs - Error PRK',
      'OLIBs - Error Tabungan', 'OLIBs - Error User', 'OLIBs - FE Error',
      'OLIBs - Gagal Close Operasional', 'OLIBs - Mutasi User Pegawai',
      'OLIBs - Non Aktif User', 'OLIBs - Override Password',
      'OLIBs - Pendaftaran User Baru', 'OLIBs - Perubahan Menu dan Limit Transaksi',
      'OLIBs - Selisih Pembukuan'
    ],
    'Kasda Online': [
      'Kasda Online - Error Approval Maker', 'Kasda Online - Error Approval Transaksi',
      'Kasda Online - Error Cek Transaksi/Saldo Rekening', 'Kasda Online - Error Lainnya',
      'Kasda Online - Error Login', 'Kasda Online - Error Permintaan Token Transaksi',
      'Kasda Online - Error Tarik Data SP2D (Kasda FMIS)', 'Kasda Online - Gagal Pembayaran',
      'Kasda Online - Gagal Transfer', 'Kasda Online BUD - Error',
      'Kasda Online - User Management'
    ],
    'Specialized Financial Systems': [
      'Antasena - Error Proses Aplikasi', 'Antasena - Pendaftaran User', 'Antasena - Reset Password',
      'Antasena - User Expire', 'BI Fast - Error', 'BI RTGS - Error Aplikasi',
      'Brocade (Broker) - Mutasi User', 'Brocade (Broker) - Pendaftaran User Baru',
      'Brocade (Broker) - Perubahan User', 'Brocade (Broker) - Reset Password',
      'BSG sprint TNP - Error', 'BSGbrocade - Error', 'Error GoAML - Error Proses',
      'Finnet - Error', 'MPN - Error Transaksi', 'PSAK 71 - Error Aplikasi',
      'Report Viewer 724 - Error', 'Report Viewer 724 - Selisih', 'SIKP - Error',
      'SIKP - Error Aplikasi', 'SIKP - Pendaftaran user', 'SKNBI - Error Aplikasi',
      'SKNBI - Mutasi User', 'SKNBI - Pendaftaran User', 'SKNBI - Perubahan User',
      'SKNBI - Reset Password', 'SLIK - Error', 'Switching - Error Transaksi',
      'Switching - Permintaan Pendaftaran Prefiks Bank', 'Switching - Permintaan Penghapusan Prefiks Bank',
      'Switching - Permintaan Penyesuaian Prefiks Bank'
    ]
  },
  'Digital Channels & Customer Applications': {
    'BSGTouch (Mobile Banking)': [
      'BSGTouch (Android) - Mutasi User', 'BSGTouch (Android) - Pendaftaran User Baru',
      'BSGTouch (Android) - Buka Blokir dan Reset Password', 'BSGTouch (Android) - Error Registrasi BSGtouch',
      'BSGTouch (Android) - Perpanjang Masa Berlaku', 'BSGTouch (Android) - Perubahan User',
      'BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi', 'BSGTouch (Android/Ios) - Error Aplikasi',
      'BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)', 'BSGTouch (iOS) - SMS Aktivasi tidak terkirim',
      'BSGtouch - Error Transaksi', 'BSGTouch - Penutupan Akun BSGTouch'
    ],
    'BSGDirect (Internet Banking)': [
      'BSGDirect - Error Aplikasi', 'BSGDirect - Error Transaksi', 'BSGDirect - User Management'
    ],
    'SMS Banking': [
      'SMS Banking - Error', 'SMS Banking - Mutasi user', 'SMS Banking - Pendaftaran User',
      'SMS Banking - Perubahan User', 'SMS Banking - Reset Password'
    ],
    'BSG QRIS': [
      'BSG QRIS - Buka Blokir & Reset Password', 'BSG QRIS - Error Transaksi/Aplikasi',
      'BSG QRIS - Mutasi User', 'BSG QRIS - Pendaftaran User', 'BSG QRIS - Perpanjang Masa Berlaku',
      'BSG QRIS - Perubahan User'
    ]
  },
  'ATM, EDC & Branch Hardware': {
    'ATM Services': [
      'ATM - ATMB Error Transfer Antar Bank', 'ATM - Cash Handler', 'ATM - Cassette Supply/Persediaan Kaset',
      'ATM - Communication Offline', 'ATM - Door Contact Sensor Abnormal', 'ATM - Gagal Cash in/Cash out',
      'ATM - MCRW Fatal', 'ATM - Receipt Paper Media Out', 'ATM-Pendaftaran Terminal Baru',
      'ATM-Pengiriman Log Jurnal', 'ATM-Permasalahan Teknis', 'ATM-Permintaan Log Switching',
      'ATM-Perubahan IP', 'ATM-Perubahan Profil', 'Penggantian Mesin', 'Perubahan Denom'
    ],
    'EDC & Pinpad Services': [
      'BSGDebit/EDC - Permintaan Salinan Bukti Transaksi', 'Error Pinpad'
    ],
    'Branch Hardware': [
      'Maintenance Printer', 'Pendaftaran Terminal Komputer Baru', 'Formulir Serah Terima Komputer'
    ]
  },
  'Corporate IT & Employee Support': {
    'User & Access Management (IT Handled)': [
      'Digital Dashboard - Mutasi user', 'Digital Dashboard - Pendaftaran User',
      'Digital Dashboard - Perpanjangan Masa Berlaku', 'Digital Dashboard - Perubahan User',
      'Digital Dashboard - Reset Password User', 'Domain - Pendaftaran/Perubahan User',
      'Domain - Reset Password', 'eLOS - Mutasi User', 'eLOS - Pendaftaran Akses VPN',
      'eLOS - Pendaftaran User', 'eLOS - Perubahan User', 'eLOS - Reset Akses User',
      'eLOS - Reset Password User', 'Ms. Office 365 - Pendaftaran Email Baru',
      'Ms. Office 365 - Reset Password', 'Payroll - Pendaftaran User', 'Payroll - Perubahan User',
      'Payroll - Reset Batas Koneksi', 'Portal - IT Hepldesk - Pendaftaran User',
      'XReport - Pendaftaran User Baru'
    ],
    'Internal Applications Support': [
      'ARS73 - Error Aplikasi', 'ARS73 - Mutasi User', 'ARS73 - Pendaftaran User Baru',
      'ARS73 - Perubahan User', 'ARS73 -Buka Blokir', 'E-Dapem - Error Transaksi',
      'Error - Error Middleware', 'Error - Rintis PaymentProd', 'Error Aplikasi',
      'HRMS - Gagal Koneksi', 'HRMS - Pengaktifan dan Reset Password User',
      'HRMS - Perubahan IP PC', 'HRMS - User Error', 'KMS - Reset Password',
      'MIS - Error MIS', 'Ms. Office 365 - Error', 'OBOX - Error Aplikasi',
      'Payroll - Error Proses', 'Teller App / Reporting - Gagal Connect',
      'Teller App / Reporting - Mutasi User', 'Teller App / Reporting - Pendaftaran User Baru',
      'Teller App / Reporting - Perubahan User', 'Teller App / Reporting - Reset Batas Koneksi',
      'XCARD - Buka Blokir dan Reset Password', 'XCARD - Error Aplikasi', 'XCARD - Mutasi User',
      'XCARD - Pendaftaran User Baru', 'XCARD - Penggantian PIN', 'XCARD - Perubahan Menu',
      'XLink - Error', 'XMonitoring ATM - Buka Blokir & Reset Password',
      'XMonitoring ATM - Error Aplikasi', 'XMonitoring ATM - Mutasi User',
      'XMonitoring ATM - Pendaftaran User', 'XMonitoring ATM - Perubahan User'
    ],
    'General IT Support': [
      'Gangguan Ekstranet BI', 'Gangguan Internet', 'Gangguan LAN', 'Gangguan WAN',
      'Maintenance Komputer', 'Memo ke Divisi TI', 'Network - Permintaan Pemasangan Jaringan',
      'Permintaan Akses Flashdisk/Harddisk/SSD', 'Permintaan Data Lain',
      'Permintaan Pengembangan Aplikasi', 'Permintaan Perubahan Nomor PK Kredit',
      'Permintaan Softcopy RC', 'Surat ke Divisi TI', 'Technical Problem'
    ],
    'Card Management (Internal)': [
      'Card Center - Laporan Penerimaan Kartu ATM di Cabang',
      'Card Center - Laporan Penerimaan PIN ATM di Cabang',
      'Card Center - Laporan Persediaan Kartu ATM', 'Penggantian Kartu',
      'Penggantian PIN - Call Center', 'Penutupan Kartu'
    ]
  },
  'Claims & Disputes': {
    'Transaction Claims': [
      'ATM-Pembayaran Citilink', 'ATM-Pembayaran PBB', 'ATM-Pembayaran Samsat',
      'ATM-Pembayaran Tagihan BigTV', 'ATM-Pembayaran Tagihan BPJS', 'ATM-Pembayaran Tagihan PLN',
      'ATM-Pembayaran Tagihan PSTN', 'ATM-Pembelian Pulsa Indosat', 'ATM-Pembelian Pulsa Telkomsel',
      'ATM-Pembelian Pulsa Three', 'ATM-Pembelian Pulsa XL', 'ATM-Pembelian Token PLN',
      'ATM-Penarikan ATM Bank Lain', 'ATM-Penarikan ATM Bank Lain >75 Hari',
      'ATM-Penyelesaian Re-Klaim Bank Lain', 'ATM-Transfer ATM Bank Lain',
      'ATM-Transfer Bank Lain > 75 Hari', 'BSG QRIS - Klaim BI Fast', 'BSG QRIS - Klaim Gagal Transaksi',
      'BSG QRIS - Pembelian Data Telkomsel', 'BSG QRIS - Pembelian Pulsa Telkomsel',
      'BSGDebit/EDC - Pembayaran', 'BSGtouch - Pembayaran PBB', 'BSGtouch - Pembayaran Samsat',
      'BSGtouch - Pembayaran Tagihan BPJS', 'BSGtouch - Pembayaran Tagihan Kartu Halo',
      'BSGtouch - Pembayaran Tagihan PDAM', 'BSGtouch - Pembayaran Tagihan PLN',
      'BSGtouch - Pembayaran Tagihan PSTN', 'BSGTouch - Pembelian Pulsa Indosat',
      'BSGTouch - Pembelian Pulsa Telkomsel', 'BSGTouch - Pembelian Pulsa Three',
      'BSGTouch - Pembelian Pulsa XL', 'BSGTouch - Pembelian Token PLN', 'BSGTouch - Top-Up BSGcash',
      'BSGTouch - Transfer Antar Bank', 'Keamanan Informasi', 'Samsat - Error Transaksi',
      'SMSBanking-Pembayaran PBB', 'SMSBanking-Pembayaran Samsat', 'SMSBanking-Pembayaran Tagihan BigTV',
      'SMSBanking-Pembayaran Tagihan Kartu Halo', 'SMSBanking-Pembayaran Tagihan PLN',
      'SMSBanking-Pembayaran Tagihan PSTN', 'SMSBanking-Pembelian Pulsa Indosat',
      'SMSBanking-Pembelian Pulsa Telkomsel', 'SMSBanking-Pembelian Pulsa Three',
      'SMSBanking-Pembelian Pulsa XL', 'SMSBanking-Pembelian Token PLN',
      'SMSBanking-Transfer Bank Lain', 'SMSBanking-Transfer Bank Lain >75 Hari',
      'Teller App-Pembayaran Samsat', 'Teller App / Reporting - Gagal Transaksi'
    ],
    'Reconciliations & Data Requests': [
      'Hasil Rekonsiliasi', 'Permintaan - Penyelesaian Selisih ATM',
      'Permintaan - Upload Data DHN', 'Permintaan Data Softcopy Rekening Koran'
    ]
  },
  'General & Default Services': {
    'General': [
      'Default Request', 'Permintaan Lainnya'
    ]
  }
};

async function validateServiceCompleteness() {
  console.log('🔍 Starting Service Catalog Completeness Validation...');

  try {
    // Get all imported service catalogs and items
    const importedCatalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📊 Found ${importedCatalogs.length} imported catalogs`);

    // Validation results
    const validationResults = {
      totalExpected: 0,
      totalImported: 0,
      missing: [] as { catalog: string, category: string, service: string }[],
      extra: [] as { catalog: string, service: string }[],
      catalogMismatches: [] as { expected: string, actual?: string }[]
    };

    // Count total expected services
    for (const [catalogName, categories] of Object.entries(expectedServices)) {
      for (const [categoryName, services] of Object.entries(categories)) {
        validationResults.totalExpected += services.length;
      }
    }

    // Check each expected catalog
    for (const [expectedCatalogName, expectedCategories] of Object.entries(expectedServices)) {
      console.log(`\n🔍 Validating catalog: ${expectedCatalogName}`);
      
      // Find matching imported catalog (improved matching)
      let importedCatalog = importedCatalogs.find(cat => 
        cat.name.toLowerCase() === expectedCatalogName.toLowerCase()
      );
      
      // If exact match not found, try fuzzy matching
      if (!importedCatalog) {
        importedCatalog = importedCatalogs.find(cat => {
          const expectedWords = expectedCatalogName.toLowerCase().split(' ');
          const catalogWords = cat.name.toLowerCase().split(' ');
          
          // For "Core Banking & Financial Systems", match with any catalog containing "core" and "banking"
          if (expectedCatalogName.includes('Core Banking')) {
            return catalogWords.includes('core') && catalogWords.includes('banking');
          }
          
          // For other catalogs, check if they share key words
          return expectedWords.some(word => 
            word.length > 3 && catalogWords.some(cWord => cWord.includes(word) || word.includes(cWord))
          );
        });
      }

      if (!importedCatalog) {
        validationResults.catalogMismatches.push({ expected: expectedCatalogName });
        console.log(`  ❌ Missing entire catalog: ${expectedCatalogName}`);
        continue;
      }

      console.log(`  ✅ Found catalog: ${importedCatalog.name}`);
      
      // Check services within this catalog
      for (const [categoryName, expectedServicesList] of Object.entries(expectedCategories)) {
        console.log(`    📂 Checking category: ${categoryName}`);
        
        for (const expectedService of expectedServicesList) {
          // Look for this service in the imported catalog
          const foundService = importedCatalog.serviceItems.find(item => 
            item.name.toLowerCase() === expectedService.toLowerCase() ||
            item.name.toLowerCase().includes(expectedService.toLowerCase()) ||
            expectedService.toLowerCase().includes(item.name.toLowerCase())
          );

          if (foundService) {
            validationResults.totalImported++;
            console.log(`      ✅ ${expectedService}`);
          } else {
            validationResults.missing.push({
              catalog: expectedCatalogName,
              category: categoryName,
              service: expectedService
            });
            console.log(`      ❌ MISSING: ${expectedService}`);
          }
        }
      }

      // Check for extra services not in expected list
      for (const importedService of importedCatalog.serviceItems) {
        let found = false;
        for (const [categoryName, expectedServicesList] of Object.entries(expectedCategories)) {
          if (expectedServicesList.some(expected => 
            expected.toLowerCase() === importedService.name.toLowerCase() ||
            expected.toLowerCase().includes(importedService.name.toLowerCase()) ||
            importedService.name.toLowerCase().includes(expected.toLowerCase())
          )) {
            found = true;
            break;
          }
        }
        
        if (!found) {
          validationResults.extra.push({
            catalog: importedCatalog.name,
            service: importedService.name
          });
        }
      }
    }

    // Generate summary report
    console.log(`
🎯 Service Catalog Validation Summary:
═══════════════════════════════════════
📈 Expected Services: ${validationResults.totalExpected}
📊 Imported Services: ${validationResults.totalImported}
✅ Match Rate: ${((validationResults.totalImported / validationResults.totalExpected) * 100).toFixed(1)}%

❌ Missing Services: ${validationResults.missing.length}
➕ Extra Services: ${validationResults.extra.length}
📂 Catalog Mismatches: ${validationResults.catalogMismatches.length}
    `);

    // Detailed missing services report
    if (validationResults.missing.length > 0) {
      console.log(`\n❌ MISSING SERVICES (${validationResults.missing.length}):`);
      console.log('═'.repeat(50));
      
      const missingByCatalog = new Map<string, Map<string, string[]>>();
      
      for (const missing of validationResults.missing) {
        if (!missingByCatalog.has(missing.catalog)) {
          missingByCatalog.set(missing.catalog, new Map());
        }
        if (!missingByCatalog.get(missing.catalog)!.has(missing.category)) {
          missingByCatalog.get(missing.catalog)!.set(missing.category, []);
        }
        missingByCatalog.get(missing.catalog)!.get(missing.category)!.push(missing.service);
      }

      for (const [catalog, categories] of missingByCatalog) {
        console.log(`\n📂 ${catalog}:`);
        for (const [category, services] of categories) {
          console.log(`  📁 ${category}:`);
          for (const service of services) {
            console.log(`    ❌ ${service}`);
          }
        }
      }
    }

    // Extra services report
    if (validationResults.extra.length > 0) {
      console.log(`\n➕ EXTRA SERVICES (${validationResults.extra.length}):`);
      console.log('═'.repeat(50));
      
      const extraByCatalog = new Map<string, string[]>();
      for (const extra of validationResults.extra) {
        if (!extraByCatalog.has(extra.catalog)) {
          extraByCatalog.set(extra.catalog, []);
        }
        extraByCatalog.get(extra.catalog)!.push(extra.service);
      }

      for (const [catalog, services] of extraByCatalog) {
        console.log(`\n📂 ${catalog}:`);
        for (const service of services) {
          console.log(`  ➕ ${service}`);
        }
      }
    }

    // Critical gaps analysis
    console.log(`\n🚨 CRITICAL GAPS ANALYSIS:`);
    console.log('═'.repeat(50));
    
    const criticalMissing = validationResults.missing.filter(m => 
      m.service.includes('User Management') ||
      m.service.includes('Error') ||
      m.service.includes('Pendaftaran') ||
      m.service.includes('Reset Password')
    );

    if (criticalMissing.length > 0) {
      console.log(`❗ Critical missing services: ${criticalMissing.length}`);
      for (const critical of criticalMissing) {
        console.log(`  🚨 ${critical.catalog} → ${critical.service}`);
      }
    } else {
      console.log('✅ No critical services missing');
    }

    return validationResults;

  } catch (error) {
    console.error('❌ Error validating service completeness:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the validation
validateServiceCompleteness()
  .catch((error) => {
    console.error('❌ Service validation failed:', error);
    process.exit(1);
  });