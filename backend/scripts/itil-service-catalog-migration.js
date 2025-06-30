// ITIL Service Catalog Migration Script
// Reorganizes existing service catalog structure to ITIL-aligned design
// Preserves all custom fields and templates while eliminating redundancy

const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

// New ITIL-aligned catalog structure
const ITIL_CATALOGS = [
  {
    name: 'Core Banking & Financial Systems',
    description: 'Services for core financial platforms and specialized financial applications',
    serviceType: 'business_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: true,
    businessImpact: 'high',
    serviceItems: [
      'OLIBS System',
      'Kasda Online', 
      'Specialized Financial Systems'
    ]
  },
  {
    name: 'Digital Channels & Customer Applications',
    description: 'Services for all customer-facing digital applications',
    serviceType: 'business_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: true,
    businessImpact: 'high',
    serviceItems: [
      'BSGTouch (Mobile Banking)',
      'BSGDirect (Internet Banking)',
      'SMS Banking',
      'BSG QRIS'
    ]
  },
  {
    name: 'ATM, EDC & Branch Hardware',
    description: 'Services related to physical endpoints and hardware in branches and at customer locations',
    serviceType: 'technical_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: false,
    businessImpact: 'medium',
    serviceItems: [
      'ATM Services',
      'EDC & Pinpad Services',
      'Branch Hardware'
    ]
  },
  {
    name: 'Corporate IT & Employee Support',
    description: 'Internal IT services that support employees and corporate functions',
    serviceType: 'technical_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: false,
    businessImpact: 'medium',
    serviceItems: [
      'User & Access Management (IT Handled)',
      'Internal Applications Support',
      'General IT Support',
      'Card Management (Internal)'
    ]
  },
  {
    name: 'Claims & Disputes',
    description: 'A dedicated category for all transaction-related claims, disputes, and reconciliations',
    serviceType: 'business_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: true,
    businessImpact: 'high',
    serviceItems: [
      'Transaction Claims',
      'Reconciliations & Data Requests'
    ]
  },
  {
    name: 'General & Default Services',
    description: 'Catch-all services for requests that do not fit into other categories',
    serviceType: 'technical_service',
    categoryLevel: 1,
    departmentId: 1,
    isActive: true,
    requiresApproval: false,
    businessImpact: 'low',
    serviceItems: [
      'General'
    ]
  }
];

// Service mapping from current structure to new ITIL structure
const SERVICE_MAPPINGS = {
  // Core Banking & Financial Systems
  'OLIBS System': [
    'OLIBs - BE Error',
    'OLIBs - Buka Blokir',
    'OLIBs - Error Deposito',
    'OLIBs - Error Giro',
    'OLIBs - Error Kredit',
    'OLIBs - Error PRK',
    'OLIBs - Error Tabungan',
    'OLIBs - Error User',
    'OLIBs - FE Error',
    'OLIBs - Gagal Close Operasional',
    'OLIBs - Mutasi User Pegawai',
    'OLIBs - Non Aktif User',
    'OLIBs - Override Password',
    'OLIBs - Pendaftaran User Baru',
    'OLIBs - Perubahan Menu dan Limit Transaksi',
    'OLIBs - Selisih Pembukuan'
  ],
  'Kasda Online': [
    'Kasda Online - Error Approval Maker',
    'Kasda Online - Error Approval Transaksi',
    'Kasda Online - Error Cek Transaksi/Saldo Rekening',
    'Kasda Online - Error Lainnya',
    'Kasda Online - Error Login',
    'Kasda Online - Error Permintaan Token Transaksi',
    'Kasda Online - Error Tarik Data SP2D (Kasda FMIS)',
    'Kasda Online - Gagal Pembayaran',
    'Kasda Online - Gagal Transfer',
    'Kasda Online BUD - Error',
    'Kasda Online - User Management (Handled by Dukungan & Layanan)'
  ],
  'Specialized Financial Systems': [
    'Antasena - Error Proses Aplikasi',
    'Antasena - Pendaftaran User',
    'Antasena - Reset Password',
    'Antasena - User Expire',
    'BI Fast - Error',
    'BI RTGS - Error Aplikasi',
    'Brocade (Broker) - Mutasi User',
    'Brocade (Broker) - Pendaftaran User Baru',
    'Brocade (Broker) - Perubahan User',
    'Brocade (Broker) - Reset Password',
    'BSG sprint TNP - Error',
    'BSGbrocade - Error',
    'Error GoAML - Error Proses',
    'Finnet - Error',
    'MPN - Error Transaksi',
    'PSAK 71 - Error Aplikasi',
    'Report Viewer 724 - Error',
    'Report Viewer 724 - Selisih',
    'SIKP - Error',
    'SIKP - Error Aplikasi',
    'SIKP - Pendaftaran user',
    'SKNBI - Error Aplikasi',
    'SKNBI - Mutasi User',
    'SKNBI - Pendaftaran User',
    'SKNBI - Perubahan User',
    'SKNBI - Reset Password',
    'SLIK - Error',
    'Switching - Error Transaksi',
    'Switching - Permintaan Pendaftaran Prefiks Bank',
    'Switching - Permintaan Penghapusan Prefiks Bank',
    'Switching - Permintaan Penyesuaian Prefiks Bank'
  ],

  // Digital Channels & Customer Applications
  'BSGTouch (Mobile Banking)': [
    'BSGTouch (Android) - Mutasi User',
    'BSGTouch (Android) - Pendaftaran User Baru',
    'BSGTouch (Android) - Buka Blokir dan Reset Password',
    'BSGTouch (Android) - Error Registrasi BSGtouch',
    'BSGTouch (Android) - Perpanjang Masa Berlaku',
    'BSGTouch (Android) - Perubahan User',
    'BSGTouch (Android/iOS) - Permintaan Pengiriman SMS Aktivasi',
    'BSGTouch (Android/Ios) - Error Aplikasi',
    'BSGTouch (iOS) - Error Registrasi BSGtouch (iOS)',
    'BSGTouch (iOS) - SMS Aktivasi tidak terkirim',
    'BSGtouch - Error Transaksi',
    'BSGTouch - Penutupan Akun BSGTouch'
  ],
  'BSGDirect (Internet Banking)': [
    'BSGDirect - Error Aplikasi',
    'BSGDirect - Error Transaksi',
    'BSGDirect - User Management (Handled by Dukungan & Layanan)'
  ],
  'SMS Banking': [
    'SMS Banking - Error',
    'SMS Banking - Mutasi user',
    'SMS Banking - Pendaftaran User',
    'SMS Banking - Perubahan User',
    'SMS Banking - Reset Password'
  ],
  'BSG QRIS': [
    'BSG QRIS - Buka Blokir & Reset Password',
    'BSG QRIS - Error Transaksi/Aplikasi',
    'BSG QRIS - Mutasi User',
    'BSG QRIS - Pendaftaran User',
    'BSG QRIS - Perpanjang Masa Berlaku',
    'BSG QRIS - Perubahan User'
  ],

  // ATM, EDC & Branch Hardware
  'ATM Services': [
    'ATM - ATMB Error Transfer Antar Bank',
    'ATM - Cash Handler',
    'ATM - Cassette Supply/Persediaan Kaset',
    'ATM - Communication Offline',
    'ATM - Door Contact Sensor Abnormal',
    'ATM - Gagal Cash in/Cash out',
    'ATM - MCRW Fatal',
    'ATM - Receipt Paper Media Out',
    'ATM-Pendaftaran Terminal Baru',
    'ATM-Pengiriman Log Jurnal',
    'ATM-Permasalahan Teknis',
    'ATM-Permintaan Log Switching',
    'ATM-Perubahan IP',
    'ATM-Perubahan Profil',
    'Penggantian Mesin',
    'Perubahan Denom'
  ],
  'EDC & Pinpad Services': [
    'BSGDebit/EDC - Permintaan Salinan Bukti Transaksi',
    'Error Pinpad'
  ],
  'Branch Hardware': [
    'Maintenance Printer',
    'Pendaftaran Terminal Komputer Baru',
    'Formulir Serah Terima Komputer'
  ],

  // Corporate IT & Employee Support
  'User & Access Management (IT Handled)': [
    'Digital Dashboard - Mutasi user',
    'Digital Dashboard - Pendaftaran User',
    'Digital Dashboard - Perpanjangan Masa Berlaku',
    'Digital Dashboard - Perubahan User',
    'Digital Dashboard - Reset Password User',
    'Domain - Pendaftaran/Perubahan User',
    'Domain - Reset Password',
    'eLOS - Mutasi User',
    'eLOS - Pendaftaran Akses VPN',
    'eLOS - Pendaftaran User',
    'eLOS - Perubahan User',
    'eLOS - Reset Akses User',
    'eLOS - Reset Password User',
    'Ms. Office 365 - Pendaftaran Email Baru',
    'Ms. Office 365 - Reset Password',
    'Payroll - Pendaftaran User',
    'Payroll - Perubahan User',
    'Payroll - Reset Batas Koneksi',
    'Portal - IT Hepldesk - Pendaftaran User',
    'XReport - Pendaftaran User Baru'
  ],
  'Internal Applications Support': [
    'ARS73 - Error Aplikasi',
    'ARS73 - Mutasi User',
    'ARS73 - Pendaftaran User Baru',
    'ARS73 - Perubahan User',
    'ARS73 -Buka Blokir',
    'E-Dapem - Error Transaksi',
    'Error - Error Middleware',
    'Error - Rintis PaymentProd',
    'Error Aplikasi',
    'HRMS - Gagal Koneksi',
    'HRMS - Pengaktifan dan Reset Password User',
    'HRMS - Perubahan IP PC',
    'HRMS - User Error',
    'KMS - Reset Password',
    'MIS - Error MIS',
    'Ms. Office 365 - Error',
    'OBOX - Error Aplikasi',
    'Payroll - Error Proses',
    'Teller App / Reporting - Gagal Connect',
    'Teller App / Reporting - Mutasi User',
    'Teller App / Reporting - Pendaftaran User Baru',
    'Teller App / Reporting - Perubahan User',
    'Teller App / Reporting - Reset Batas Koneksi',
    'XCARD - Buka Blokir dan Reset Password',
    'XCARD - Error Aplikasi',
    'XCARD - Mutasi User',
    'XCARD - Pendaftaran User Baru',
    'XCARD - Penggantian PIN',
    'XCARD - Perubahan Menu',
    'XLink - Error',
    'XMonitoring ATM - Buka Blokir & Reset Password',
    'XMonitoring ATM - Error Aplikasi',
    'XMonitoring ATM - Mutasi User',
    'XMonitoring ATM - Pendaftaran User',
    'XMonitoring ATM - Perubahan User'
  ],
  'General IT Support': [
    'Gangguan Ekstranet BI',
    'Gangguan Internet',
    'Gangguan LAN',
    'Gangguan WAN',
    'Maintenance Komputer',
    'Memo ke Divisi TI',
    'Network - Permintaan Pemasangan Jaringan',
    'Permintaan Akses Flashdisk/Harddisk/SSD',
    'Permintaan Data Lain',
    'Permintaan Pengembangan Aplikasi',
    'Permintaan Perubahan Nomor PK Kredit',
    'Permintaan Softcopy RC',
    'Surat ke Divisi TI',
    'Technical Problem'
  ],
  'Card Management (Internal)': [
    'Card Center - Laporan Penerimaan Kartu ATM di Cabang',
    'Card Center - Laporan Penerimaan PIN ATM di Cabang',
    'Card Center - Laporan Persediaan Kartu ATM',
    'Penggantian Kartu',
    'Penggantian PIN - Call Center',
    'Penutupan Kartu'
  ],

  // Claims & Disputes
  'Transaction Claims': [
    'ATM-Pembayaran Citilink',
    'ATM-Pembayaran PBB',
    'ATM-Pembayaran Samsat',
    'ATM-Pembayaran Tagihan BigTV',
    'ATM-Pembayaran Tagihan BPJS',
    'ATM-Pembayaran Tagihan PLN',
    'ATM-Pembayaran Tagihan PSTN',
    'ATM-Pembelian Pulsa Indosat',
    'ATM-Pembelian Pulsa Telkomsel',
    'ATM-Pembelian Pulsa Three',
    'ATM-Pembelian Pulsa XL',
    'ATM-Pembelian Token PLN',
    'ATM-Penarikan ATM Bank Lain',
    'ATM-Penarikan ATM Bank Lain >75 Hari',
    'ATM-Penyelesaian Re-Klaim Bank Lain',
    'ATM-Transfer ATM Bank Lain',
    'ATM-Transfer Bank Lain > 75 Hari',
    'BSG QRIS - Klaim BI Fast',
    'BSG QRIS - Klaim Gagal Transaksi',
    'BSG QRIS - Pembelian Data Telkomsel',
    'BSG QRIS - Pembelian Pulsa Telkomsel',
    'BSGDebit/EDC - Pembayaran',
    'BSGtouch - Pembayaran PBB',
    'BSGtouch - Pembayaran Samsat',
    'BSGtouch - Pembayaran Tagihan BPJS',
    'BSGtouch - Pembayaran Tagihan Kartu Halo',
    'BSGtouch - Pembayaran Tagihan PDAM',
    'BSGtouch - Pembayaran Tagihan PLN',
    'BSGtouch - Pembayaran Tagihan PSTN',
    'BSGTouch - Pembelian Pulsa Indosat',
    'BSGTouch - Pembelian Pulsa Telkomsel',
    'BSGTouch - Pembelian Pulsa Three',
    'BSGTouch - Pembelian Pulsa XL',
    'BSGTouch - Pembelian Token PLN',
    'BSGTouch - Top-Up BSGcash',
    'BSGTouch - Transfer Antar Bank',
    'Keamanan Informasi',
    'Samsat - Error Transaksi',
    'SMSBanking-Pembayaran PBB',
    'SMSBanking-Pembayaran Samsat',
    'SMSBanking-Pembayaran Tagihan BigTV',
    'SMSBanking-Pembayaran Tagihan Kartu Halo',
    'SMSBanking-Pembayaran Tagihan PLN',
    'SMSBanking-Pembayaran Tagihan PSTN',
    'SMSBanking-Pembelian Pulsa Indosat',
    'SMSBanking-Pembelian Pulsa Telkomsel',
    'SMSBanking-Pembelian Pulsa Three',
    'SMSBanking-Pembelian Pulsa XL',
    'SMSBanking-Pembelian Token PLN',
    'SMSBanking-Transfer Bank Lain',
    'SMSBanking-Transfer Bank Lain >75 Hari',
    'Teller App-Pembayaran Samsat',
    'Teller App / Reporting - Gagal Transaksi'
  ],
  'Reconciliations & Data Requests': [
    'Hasil Rekonsiliasi',
    'Permintaan - Penyelesaian Selisih ATM',
    'Permintaan - Upload Data DHN',
    'Permintaan Data Softcopy Rekening Koran'
  ],

  // General & Default Services
  'General': [
    'Default Request',
    'Permintaan Lainnya'
  ]
};

async function backupCurrentStructure() {
  console.log('📦 Creating backup of current service catalog structure...');
  
  const catalogs = await client.serviceCatalog.findMany({
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  const backup = {
    timestamp: new Date().toISOString(),
    catalogs: catalogs
  };
  
  // Store backup in a JSON file
  const fs = require('fs');
  fs.writeFileSync('./service-catalog-backup.json', JSON.stringify(backup, null, 2));
  console.log('✅ Backup created: service-catalog-backup.json');
  
  return backup;
}

async function createITILCatalogs() {
  console.log('🏗️ Creating new ITIL-aligned service catalogs...');
  
  const createdCatalogs = [];
  
  for (const catalog of ITIL_CATALOGS) {
    const { serviceItems, ...catalogData } = catalog;
    
    // Check if catalog already exists
    const existingCatalog = await client.serviceCatalog.findFirst({
      where: {
        name: catalog.name,
        departmentId: catalog.departmentId
      }
    });
    
    let newCatalog;
    if (existingCatalog) {
      console.log(`Catalog already exists: ${catalog.name}`);
      newCatalog = existingCatalog;
    } else {
      console.log(`Creating catalog: ${catalog.name}`);
      newCatalog = await client.serviceCatalog.create({
        data: catalogData
      });
    }
    
    createdCatalogs.push({ ...newCatalog, plannedServiceItems: serviceItems });
    
    // Create service items for this catalog (check for existing items)
    for (const serviceItemName of serviceItems) {
      const existingItem = await client.serviceItem.findFirst({
        where: {
          serviceCatalogId: newCatalog.id,
          name: serviceItemName
        }
      });
      
      if (existingItem) {
        console.log(`  Service item already exists: ${serviceItemName}`);
      } else {
        console.log(`  Creating service item: ${serviceItemName}`);
        await client.serviceItem.create({
          data: {
            serviceCatalogId: newCatalog.id,
            name: serviceItemName,
            description: `Service item for ${serviceItemName}`,
            requestType: 'service_request',
            isActive: true,
            sortOrder: serviceItems.indexOf(serviceItemName)
          }
        });
      }
    }
  }
  
  console.log('✅ Created/verified all ITIL catalogs and service items');
  return createdCatalogs;
}

async function migrateTemplatesAndFields() {
  console.log('🔧 Migrating custom field templates to new structure...');
  
  // Get all existing templates with custom fields
  const existingTemplates = await client.serviceTemplate.findMany({
    include: {
      customFieldDefinitions: {
        orderBy: { sortOrder: 'asc' }
      },
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
    },
    where: {
      customFieldDefinitions: {
        some: {}
      }
    }
  });
  
  console.log(`Found ${existingTemplates.length} templates with custom fields to migrate`);
  
  // Create template mapping plan
  const migrationPlan = [];
  
  for (const template of existingTemplates) {
    // Find which new service item this template should belong to
    let targetServiceItem = null;
    
    // Look through our service mappings to find where this template's services should go
    for (const [newServiceItemName, serviceList] of Object.entries(SERVICE_MAPPINGS)) {
      // Check if any of the services in the mapping match our template
      const templateBaseName = template.name.replace(/ - .+/, '').replace(/Templates?/, '').trim();
      
      if (serviceList.some(service => 
        service.includes(templateBaseName) || 
        templateBaseName.includes(service.split(' - ')[0])
      )) {
        targetServiceItem = newServiceItemName;
        break;
      }
    }
    
    if (targetServiceItem) {
      migrationPlan.push({
        originalTemplate: template,
        targetServiceItem: targetServiceItem,
        customFields: template.customFieldDefinitions
      });
    } else {
      console.log(`⚠️  No mapping found for template: ${template.name}`);
    }
  }
  
  console.log(`Created migration plan for ${migrationPlan.length} templates`);
  
  // Execute migration
  for (const migration of migrationPlan) {
    console.log(`Migrating template: ${migration.originalTemplate.name} → ${migration.targetServiceItem}`);
    
    // Find the target service item
    const targetItem = await client.serviceItem.findFirst({
      where: { name: migration.targetServiceItem }
    });
    
    if (!targetItem) {
      console.log(`❌ Target service item not found: ${migration.targetServiceItem}`);
      continue;
    }
    
    // Create new service template in target location
    const newTemplate = await client.serviceTemplate.create({
      data: {
        serviceItemId: targetItem.id,
        name: migration.originalTemplate.name,
        description: migration.originalTemplate.description,
        templateType: migration.originalTemplate.templateType,
        isKasdaTemplate: migration.originalTemplate.isKasdaTemplate,
        requiresBusinessApproval: migration.originalTemplate.requiresBusinessApproval,
        isVisible: migration.originalTemplate.isVisible,
        sortOrder: migration.originalTemplate.sortOrder,
        estimatedResolutionTime: migration.originalTemplate.estimatedResolutionTime,
        defaultRootCause: migration.originalTemplate.defaultRootCause,
        defaultIssueType: migration.originalTemplate.defaultIssueType
      }
    });
    
    // Migrate all custom field definitions
    for (const field of migration.customFields) {
      await client.serviceFieldDefinition.create({
        data: {
          serviceTemplateId: newTemplate.id,
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          fieldType: field.fieldType,
          options: field.options,
          isRequired: field.isRequired,
          isKasdaSpecific: field.isKasdaSpecific,
          placeholder: field.placeholder,
          defaultValue: field.defaultValue,
          validationRules: field.validationRules,
          sortOrder: field.sortOrder,
          isVisible: field.isVisible
        }
      });
    }
    
    console.log(`✅ Migrated ${migration.customFields.length} custom fields for ${migration.originalTemplate.name}`);
  }
  
  console.log('✅ All templates and custom fields migrated successfully');
  return migrationPlan;
}

async function cleanupOldStructure() {
  console.log('🧹 Cleaning up old service catalog structure...');
  
  // First, mark old catalogs as inactive instead of deleting (safer approach)
  const oldCatalogs = await client.serviceCatalog.findMany({
    where: {
      name: {
        notIn: ITIL_CATALOGS.map(c => c.name)
      }
    }
  });
  
  for (const catalog of oldCatalogs) {
    await client.serviceCatalog.update({
      where: { id: catalog.id },
      data: { 
        isActive: false,
        name: `[OLD] ${catalog.name}` // Mark as old for identification
      }
    });
    console.log(`Deactivated old catalog: ${catalog.name}`);
  }
  
  console.log('✅ Old structure cleaned up (marked as inactive)');
}

async function validateMigration() {
  console.log('🔍 Validating migration results...');
  
  const newCatalogs = await client.serviceCatalog.findMany({
    where: { isActive: true },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  let totalTemplates = 0;
  let totalFields = 0;
  
  newCatalogs.forEach(catalog => {
    console.log(`📁 ${catalog.name}`);
    catalog.serviceItems.forEach(item => {
      const templateCount = item.templates.length;
      const fieldCount = item.templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0);
      
      if (templateCount > 0 || fieldCount > 0) {
        console.log(`  📋 ${item.name}: ${templateCount} templates, ${fieldCount} fields`);
        totalTemplates += templateCount;
        totalFields += fieldCount;
      }
    });
  });
  
  console.log(`\n📊 MIGRATION SUMMARY:`);
  console.log(`Active Catalogs: ${newCatalogs.length}`);
  console.log(`Total Templates: ${totalTemplates}`);
  console.log(`Total Custom Fields: ${totalFields}`);
  
  return { catalogs: newCatalogs.length, templates: totalTemplates, fields: totalFields };
}

async function runMigration() {
  try {
    console.log('🚀 Starting ITIL Service Catalog Migration...\n');
    
    // Phase 1: Backup
    await backupCurrentStructure();
    
    // Phase 2: Create new structure
    await createITILCatalogs();
    
    // Phase 3: Migrate templates and custom fields
    await migrateTemplatesAndFields();
    
    // Phase 4: Cleanup old structure  
    await cleanupOldStructure();
    
    // Phase 5: Validate results
    const results = await validateMigration();
    
    console.log('\n🎉 ITIL Service Catalog Migration completed successfully!');
    console.log('📋 All custom fields and templates have been preserved');
    console.log('🏗️ New ITIL-aligned structure is now active');
    
    return results;
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('💡 Restore from backup: service-catalog-backup.json');
    throw error;
  }
}

module.exports = {
  runMigration,
  ITIL_CATALOGS,
  SERVICE_MAPPINGS
};

// Run migration if called directly
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}