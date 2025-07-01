import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function importCompleteITILCatalog() {
  console.log('🚀 Starting Complete ITIL Service Catalog Import...');

  try {
    // Get existing departments
    const itDept = await prisma.department.findFirst({ where: { name: 'Information Technology' } });
    const supportDept = await prisma.department.findFirst({ where: { name: 'Dukungan dan Layanan' } });
    
    if (!itDept || !supportDept) {
      throw new Error('Required departments not found. Run BSG seed first.');
    }

    // 1. Core Banking & Financial Systems
    console.log('🏦 Creating Core Banking & Financial Systems...');
    const coreBankingCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'Core Banking & Financial Systems',
        description: 'Services for core financial platforms and specialized financial applications',
        departmentId: supportDept.id,
        serviceType: 'business_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: true
      }
    });

    // OLIBS System Service Items
    const olibsServiceItems = [
      'OLIBs - BE Error', 'OLIBs - Buka Blokir', 'OLIBs - Error Deposito',
      'OLIBs - Error Giro', 'OLIBs - Error Kredit', 'OLIBs - Error PRK',
      'OLIBs - Error Tabungan', 'OLIBs - Error User', 'OLIBs - FE Error',
      'OLIBs - Gagal Close Operasional', 'OLIBs - Mutasi User Pegawai',
      'OLIBs - Non Aktif User', 'OLIBs - Override Password',
      'OLIBs - Pendaftaran User Baru', 'OLIBs - Perubahan Menu dan Limit Transaksi',
      'OLIBs - Selisih Pembukuan'
    ];

    for (const itemName of olibsServiceItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `OLIBS service request: ${itemName}`,
          serviceCatalogId: coreBankingCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: olibsServiceItems.indexOf(itemName) + 1
        }
      });
    }

    // KASDA Online Service Items
    const kasdaServiceItems = [
      'Kasda Online - Error Approval Maker', 'Kasda Online - Error Approval Transaksi',
      'Kasda Online - Error Cek Transaksi/Saldo Rekening', 'Kasda Online - Error Lainnya',
      'Kasda Online - Error Login', 'Kasda Online - Error Permintaan Token Transaksi',
      'Kasda Online - Error Tarik Data SP2D (Kasda FMIS)', 'Kasda Online - Gagal Pembayaran',
      'Kasda Online - Gagal Transfer', 'Kasda Online BUD - Error',
      'Kasda Online - User Management'
    ];

    for (const itemName of kasdaServiceItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `KASDA service request: ${itemName}`,
          serviceCatalogId: coreBankingCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: true,
          requiresGovApproval: itemName.includes('User Management'),
          isActive: true,
          sortOrder: olibsServiceItems.length + kasdaServiceItems.indexOf(itemName) + 1
        }
      });
    }

    // Specialized Financial Systems
    const specializedFinancialItems = [
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
    ];

    for (const itemName of specializedFinancialItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `Specialized financial system service: ${itemName}`,
          serviceCatalogId: coreBankingCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: olibsServiceItems.length + kasdaServiceItems.length + specializedFinancialItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created Core Banking catalog with ${olibsServiceItems.length + kasdaServiceItems.length + specializedFinancialItems.length} service items`);

    // 2. Digital Channels & Customer Applications
    console.log('📱 Creating Digital Channels & Customer Applications...');
    const digitalChannelsCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'Digital Channels & Customer Applications',
        description: 'Services for all customer-facing digital applications',
        departmentId: supportDept.id,
        serviceType: 'business_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: true
      }
    });

    // BSGTouch (Mobile Banking) Service Items
    const bsgTouchItems = [
      'BSGTouch (Android) - Mutasi User', 'BSGTouch (Android) - Pendaftaran User Baru',
      'BSGTouch (Android) - Buka Blokir dan Reset Password', 'BSGTouch (Android) - Error Registrasi BSGtouch',
      'BSGTouch (Android) - Perpanjang Masa Berlaku', 'BSGTouch (Android) - Perubahan User',
      'BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi', 'BSGTouch (Android/Ios) - Error Aplikasi',
      'BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)', 'BSGTouch (iOS) - SMS Aktivasi tidak terkirim',
      'BSGtouch - Error Transaksi', 'BSGTouch - Penutupan Akun BSGTouch'
    ];

    // BSGDirect (Internet Banking) Service Items
    const bsgDirectItems = [
      'BSGDirect - Error Aplikasi', 'BSGDirect - Error Transaksi', 'BSGDirect - User Management'
    ];

    // SMS Banking Service Items
    const smsBankingItems = [
      'SMS Banking - Error', 'SMS Banking - Mutasi user', 'SMS Banking - Pendaftaran User',
      'SMS Banking - Perubahan User', 'SMS Banking - Reset Password'
    ];

    // BSG QRIS Service Items
    const bsgQrisItems = [
      'BSG QRIS - Buka Blokir & Reset Password', 'BSG QRIS - Error Transaksi/Aplikasi',
      'BSG QRIS - Mutasi User', 'BSG QRIS - Pendaftaran User', 'BSG QRIS - Perpanjang Masa Berlaku',
      'BSG QRIS - Perubahan User'
    ];

    const allDigitalItems = [...bsgTouchItems, ...bsgDirectItems, ...smsBankingItems, ...bsgQrisItems];

    for (const itemName of allDigitalItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `Digital channel service: ${itemName}`,
          serviceCatalogId: digitalChannelsCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: itemName.includes('User Management'),
          isActive: true,
          sortOrder: allDigitalItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created Digital Channels catalog with ${allDigitalItems.length} service items`);

    // 3. ATM, EDC & Branch Hardware
    console.log('🏧 Creating ATM, EDC & Branch Hardware...');
    const atmHardwareCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'ATM, EDC & Branch Hardware',
        description: 'Services related to physical endpoints and hardware in branches and at customer locations',
        departmentId: itDept.id,
        serviceType: 'technical_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: false
      }
    });

    // ATM Services
    const atmItems = [
      'ATM - ATMB Error Transfer Antar Bank', 'ATM - Cash Handler', 'ATM - Cassette Supply/Persediaan Kaset',
      'ATM - Communication Offline', 'ATM - Door Contact Sensor Abnormal', 'ATM - Gagal Cash in/Cash out',
      'ATM - MCRW Fatal', 'ATM - Receipt Paper Media Out', 'ATM-Pendaftaran Terminal Baru',
      'ATM-Pengiriman Log Jurnal', 'ATM-Permasalahan Teknis', 'ATM-Permintaan Log Switching',
      'ATM-Perubahan IP', 'ATM-Perubahan Profil', 'Penggantian Mesin', 'Perubahan Denom'
    ];

    // EDC & Pinpad Services
    const edcItems = [
      'BSGDebit/EDC - Permintaan Salinan Bukti Transaksi', 'Error Pinpad'
    ];

    // Branch Hardware
    const branchHardwareItems = [
      'Maintenance Printer', 'Pendaftaran Terminal Komputer Baru', 'Formulir Serah Terima Komputer'
    ];

    const allHardwareItems = [...atmItems, ...edcItems, ...branchHardwareItems];

    for (const itemName of allHardwareItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `Hardware service: ${itemName}`,
          serviceCatalogId: atmHardwareCatalog.id,
          requestType: 'incident',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: allHardwareItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created ATM & Hardware catalog with ${allHardwareItems.length} service items`);

    // 4. Corporate IT & Employee Support
    console.log('💼 Creating Corporate IT & Employee Support...');
    const corporateITCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'Corporate IT & Employee Support',
        description: 'Internal IT services that support employees and corporate functions',
        departmentId: itDept.id,
        serviceType: 'technical_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: false
      }
    });

    // User & Access Management (IT Handled)
    const userAccessItems = [
      'Digital Dashboard - Mutasi user', 'Digital Dashboard - Pendaftaran User',
      'Digital Dashboard - Perpanjangan Masa Berlaku', 'Digital Dashboard - Perubahan User',
      'Digital Dashboard - Reset Password User', 'Domain - Pendaftaran/Perubahan User',
      'Domain - Reset Password', 'eLOS - Mutasi User', 'eLOS - Pendaftaran Akses VPN',
      'eLOS - Pendaftaran User', 'eLOS - Perubahan User', 'eLOS - Reset Akses User',
      'eLOS - Reset Password User', 'Ms. Office 365 - Pendaftaran Email Baru',
      'Ms. Office 365 - Reset Password', 'Payroll - Pendaftaran User', 'Payroll - Perubahan User',
      'Payroll - Reset Batas Koneksi', 'Portal - IT Hepldesk - Pendaftaran User',
      'XReport - Pendaftaran User Baru'
    ];

    // Internal Applications Support
    const internalAppItems = [
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
    ];

    // General IT Support
    const generalITItems = [
      'Gangguan Ekstranet BI', 'Gangguan Internet', 'Gangguan LAN', 'Gangguan WAN',
      'Maintenance Komputer', 'Memo ke Divisi TI', 'Network - Permintaan Pemasangan Jaringan',
      'Permintaan Akses Flashdisk/Harddisk/SSD', 'Permintaan Data Lain',
      'Permintaan Pengembangan Aplikasi', 'Permintaan Perubahan Nomor PK Kredit',
      'Permintaan Softcopy RC', 'Surat ke Divisi TI', 'Technical Problem'
    ];

    // Card Management (Internal)
    const cardMgmtItems = [
      'Card Center - Laporan Penerimaan Kartu ATM di Cabang',
      'Card Center - Laporan Penerimaan PIN ATM di Cabang',
      'Card Center - Laporan Persediaan Kartu ATM', 'Penggantian Kartu',
      'Penggantian PIN - Call Center', 'Penutupan Kartu'
    ];

    const allCorporateItems = [...userAccessItems, ...internalAppItems, ...generalITItems, ...cardMgmtItems];

    for (const itemName of allCorporateItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `Corporate IT service: ${itemName}`,
          serviceCatalogId: corporateITCatalog.id,
          requestType: itemName.includes('Error') || itemName.includes('Gangguan') ? 'incident' : 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: allCorporateItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created Corporate IT catalog with ${allCorporateItems.length} service items`);

    // 5. Claims & Disputes
    console.log('⚖️ Creating Claims & Disputes...');
    const claimsCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'Claims & Disputes',
        description: 'A dedicated category for all transaction-related claims, disputes, and reconciliations',
        departmentId: supportDept.id,
        serviceType: 'business_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: true
      }
    });

    // Transaction Claims (extensive list from documentation)
    const transactionClaimItems = [
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
    ];

    // Reconciliations & Data Requests
    const reconciliationItems = [
      'Hasil Rekonsiliasi', 'Permintaan - Penyelesaian Selisih ATM',
      'Permintaan - Upload Data DHN', 'Permintaan Data Softcopy Rekening Koran'
    ];

    const allClaimItems = [...transactionClaimItems, ...reconciliationItems];

    for (const itemName of allClaimItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `Claims service: ${itemName}`,
          serviceCatalogId: claimsCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: allClaimItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created Claims & Disputes catalog with ${allClaimItems.length} service items`);

    // 6. General & Default Services
    console.log('📝 Creating General & Default Services...');
    const generalCatalog = await prisma.serviceCatalog.create({
      data: {
        name: 'General & Default Services',
        description: 'Catch-all services for requests that do not fit into other categories',
        departmentId: itDept.id,
        serviceType: 'technical_service',
        categoryLevel: 1,
        isActive: true,
        requiresApproval: false
      }
    });

    const generalItems = ['Default Request', 'Permintaan Lainnya'];

    for (const itemName of generalItems) {
      await prisma.serviceItem.create({
        data: {
          name: itemName,
          description: `General service: ${itemName}`,
          serviceCatalogId: generalCatalog.id,
          requestType: 'service_request',
          isKasdaRelated: false,
          requiresGovApproval: false,
          isActive: true,
          sortOrder: generalItems.indexOf(itemName) + 1
        }
      });
    }

    console.log(`✅ Created General Services catalog with ${generalItems.length} service items`);

    // Calculate totals
    const totalCatalogs = 6;
    const totalServiceItems = 
      olibsServiceItems.length + kasdaServiceItems.length + specializedFinancialItems.length +
      allDigitalItems.length + allHardwareItems.length + allCorporateItems.length +
      allClaimItems.length + generalItems.length;

    console.log(`
🎉 Complete ITIL Service Catalog Import Summary:
════════════════════════════════════════════════
📋 Service Catalogs: ${totalCatalogs} comprehensive catalogs
🛠️ Service Items: ${totalServiceItems} total service items

📊 Breakdown by Domain:
🏦 Core Banking & Financial: ${olibsServiceItems.length + kasdaServiceItems.length + specializedFinancialItems.length} items
📱 Digital Channels: ${allDigitalItems.length} items  
🏧 ATM & Hardware: ${allHardwareItems.length} items
💼 Corporate IT: ${allCorporateItems.length} items
⚖️ Claims & Disputes: ${allClaimItems.length} items
📝 General Services: ${generalItems.length} items

✅ ITIL-aligned service catalog ready for production!
    `);

  } catch (error) {
    console.error('❌ Error importing ITIL service catalog:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importCompleteITILCatalog()
  .catch((error) => {
    console.error('❌ ITIL catalog import failed:', error);
    process.exit(1);
  });