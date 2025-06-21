// scripts/importRealBSGTemplates.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const csv = require('csv-parser');

const prisma = new PrismaClient();

// BSG System Categories mapping
const SYSTEM_CATEGORIES = {
  'OLIBs': {
    name: 'Core Banking System',
    displayName: 'Core Banking System',
    displayNameId: 'Sistem Core Banking',
    description: 'Main banking operations and transactions',
    descriptionId: 'Operasi perbankan utama dan transaksi',
    color: '#1e40af'
  },
  'ATM': {
    name: 'ATM Operations',
    displayName: 'ATM Operations', 
    displayNameId: 'Operasional ATM',
    description: 'ATM network and transaction management',
    descriptionId: 'Jaringan ATM dan manajemen transaksi',
    color: '#059669'
  },
  'XLink': {
    name: 'ATM Switching',
    displayName: 'ATM Switching',
    displayNameId: 'Switching ATM',
    description: 'ATM switching and monitoring systems',
    descriptionId: 'Sistem switching dan monitoring ATM',
    color: '#dc2626'
  },
  'XCard': {
    name: 'Card Management',
    displayName: 'Card Management',
    displayNameId: 'Manajemen Kartu',
    description: 'Card issuance and management',
    descriptionId: 'Penerbitan dan manajemen kartu',
    color: '#7c3aed'
  },
  'XMonitoring': {
    name: 'ATM Monitoring',
    displayName: 'ATM Monitoring',
    displayNameId: 'Monitoring ATM',
    description: 'ATM network monitoring and alerts',
    descriptionId: 'Monitoring jaringan ATM dan alert',
    color: '#ea580c'
  },
  'BSGDirect': {
    name: 'Internet Banking',
    displayName: 'Internet Banking',
    displayNameId: 'Internet Banking',
    description: 'Online banking platform for customers',
    descriptionId: 'Platform perbankan online untuk nasabah',
    color: '#0891b2'
  },
  'BSGTouch': {
    name: 'Mobile Banking',
    displayName: 'Mobile Banking',
    displayNameId: 'Mobile Banking',
    description: 'Mobile banking application',
    descriptionId: 'Aplikasi mobile banking',
    color: '#15803d'
  },
  'BSG QRIS': {
    name: 'QR Payment',
    displayName: 'QR Payment System',
    displayNameId: 'Sistem Pembayaran QR',
    description: 'QR code payment processing',
    descriptionId: 'Pemrosesan pembayaran QR code',
    color: '#be123c'
  },
  'Kasda': {
    name: 'Government Treasury',
    displayName: 'Government Treasury',
    displayNameId: 'Kas Pemerintah',
    description: 'Government treasury management system',
    descriptionId: 'Sistem manajemen kas pemerintah',
    color: '#7c2d12'
  },
  'Switching': {
    name: 'Payment Switching',
    displayName: 'Payment Switching',
    displayNameId: 'Switching Pembayaran',
    description: 'Payment processing and clearing',
    descriptionId: 'Pemrosesan pembayaran dan kliring',
    color: '#374151'
  },
  'Network': {
    name: 'Network Infrastructure',
    displayName: 'Network Infrastructure',
    displayNameId: 'Infrastruktur Jaringan',
    description: 'Network and connectivity issues',
    descriptionId: 'Masalah jaringan dan konektivitas',
    color: '#4b5563'
  },
  'Antasena': {
    name: 'Internal Applications',
    displayName: 'Internal Applications',
    displayNameId: 'Aplikasi Internal',
    description: 'Internal BSG applications',
    descriptionId: 'Aplikasi internal BSG',
    color: '#6b7280'
  },
  'Permintaan': {
    name: 'Service Requests',
    displayName: 'Service Requests',
    displayNameId: 'Permintaan Layanan',
    description: 'General service and support requests',
    descriptionId: 'Permintaan layanan dan dukungan umum',
    color: '#f59e0b'
  },
  'Error': {
    name: 'System Errors',
    displayName: 'System Errors',
    displayNameId: 'Error Sistem',
    description: 'General system errors and issues',
    descriptionId: 'Error sistem dan masalah umum',
    color: '#ef4444'
  }
};

// Field definitions for different template types
const FIELD_DEFINITIONS = {
  userManagement: [
    {
      name: 'employee_name',
      displayName: 'Employee Name',
      displayNameId: 'Nama Pegawai',
      fieldType: 'text',
      isRequired: true,
      sortOrder: 1
    },
    {
      name: 'employee_id',
      displayName: 'Employee ID',
      displayNameId: 'ID Pegawai',
      fieldType: 'text',
      isRequired: true,
      sortOrder: 2
    },
    {
      name: 'branch_code',
      displayName: 'Branch',
      displayNameId: 'Cabang',
      fieldType: 'branch_dropdown',
      isRequired: true,
      sortOrder: 3
    },
    {
      name: 'user_level',
      displayName: 'User Level',
      displayNameId: 'Level User',
      fieldType: 'text',
      isRequired: false,
      sortOrder: 4
    }
  ],
  transactionClaim: [
    {
      name: 'account_number',
      displayName: 'Account Number',
      displayNameId: 'Nomor Rekening',
      fieldType: 'account_number',
      isRequired: true,
      sortOrder: 1
    },
    {
      name: 'transaction_amount',
      displayName: 'Transaction Amount',
      displayNameId: 'Jumlah Transaksi',
      fieldType: 'currency_idr',
      isRequired: true,
      sortOrder: 2
    },
    {
      name: 'transaction_date',
      displayName: 'Transaction Date',
      displayNameId: 'Tanggal Transaksi',
      fieldType: 'date',
      isRequired: true,
      sortOrder: 3
    },
    {
      name: 'terminal_id',
      displayName: 'Terminal/ATM ID',
      displayNameId: 'ID Terminal/ATM',
      fieldType: 'terminal_dropdown',
      isRequired: false,
      sortOrder: 4
    }
  ],
  systemError: [
    {
      name: 'error_message',
      displayName: 'Error Message',
      displayNameId: 'Pesan Error',
      fieldType: 'textarea',
      isRequired: true,
      sortOrder: 1
    },
    {
      name: 'error_time',
      displayName: 'Error Time',
      displayNameId: 'Waktu Error',
      fieldType: 'datetime',
      isRequired: true,
      sortOrder: 2
    },
    {
      name: 'affected_branch',
      displayName: 'Affected Branch',
      displayNameId: 'Cabang Terdampak',
      fieldType: 'branch_dropdown',
      isRequired: false,
      sortOrder: 3
    }
  ],
  networkIssue: [
    {
      name: 'location',
      displayName: 'Location',
      displayNameId: 'Lokasi',
      fieldType: 'text',
      isRequired: true,
      sortOrder: 1
    },
    {
      name: 'issue_type',
      displayName: 'Issue Type',
      displayNameId: 'Jenis Masalah',
      fieldType: 'text',
      isRequired: true,
      sortOrder: 2
    },
    {
      name: 'affected_services',
      displayName: 'Affected Services',
      displayNameId: 'Layanan Terdampak',
      fieldType: 'textarea',
      isRequired: false,
      sortOrder: 3
    }
  ]
};

// Determine template category and fields based on template name
function categorizeTemplate(templateName, description) {
  const name = templateName.toLowerCase();
  const desc = description.toLowerCase();
  
  // Extract system prefix
  let systemCategory = 'Error';
  let fieldType = 'systemError';
  let priority = 50;
  
  if (name.startsWith('olibs')) {
    systemCategory = 'OLIBs';
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    }
    priority = 90;
  } else if (name.startsWith('atm')) {
    systemCategory = 'ATM';
    if (name.includes('pembayaran') || name.includes('pembelian') || name.includes('transfer')) {
      fieldType = 'transactionClaim';
    }
    priority = 85;
  } else if (name.startsWith('xlink') || name.startsWith('xcard') || name.startsWith('xmonitoring')) {
    if (name.startsWith('xcard')) {
      systemCategory = 'XCard';
    } else if (name.startsWith('xmonitoring')) {
      systemCategory = 'XMonitoring';
    } else {
      systemCategory = 'XLink';
    }
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    }
    priority = 85;
  } else if (name.startsWith('bsgdirect')) {
    systemCategory = 'BSGDirect';
    if (name.includes('gagal') || name.includes('error')) {
      fieldType = 'transactionClaim';
    }
    priority = 80;
  } else if (name.startsWith('bsgtouch')) {
    systemCategory = 'BSGTouch';
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    } else if (name.includes('pembayaran') || name.includes('pembelian')) {
      fieldType = 'transactionClaim';
    }
    priority = 80;
  } else if (name.startsWith('bsg qris')) {
    systemCategory = 'BSG QRIS';
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    } else if (name.includes('klaim') || name.includes('gagal')) {
      fieldType = 'transactionClaim';
    }
    priority = 80;
  } else if (name.startsWith('kasda')) {
    systemCategory = 'Kasda';
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    } else if (name.includes('gagal') || name.includes('error')) {
      fieldType = 'transactionClaim';
    }
    priority = 85;
  } else if (name.startsWith('switching')) {
    systemCategory = 'Switching';
    priority = 85;
  } else if (name.includes('gangguan lan') || name.includes('gangguan wan') || name.includes('gangguan internet')) {
    systemCategory = 'Network';
    fieldType = 'networkIssue';
    priority = 90;
  } else if (name.startsWith('antasena') || name.startsWith('ars73')) {
    systemCategory = 'Antasena';
    if (name.includes('user') || name.includes('pendaftaran') || name.includes('mutasi')) {
      fieldType = 'userManagement';
    }
    priority = 70;
  } else if (name.startsWith('permintaan')) {
    systemCategory = 'Permintaan';
    fieldType = 'systemError';
    priority = 60;
  }
  
  return { systemCategory, fieldType, priority };
}

async function importRealBSGTemplates() {
  console.log('🚀 Starting Real BSG Template Import...');
  
  try {
    // Create categories first
    console.log('📁 Creating template categories...');
    
    for (const [key, categoryData] of Object.entries(SYSTEM_CATEGORIES)) {
      await prisma.bSGTemplateCategory.upsert({
        where: { name: categoryData.name },
        create: {
          name: categoryData.name,
          displayName: categoryData.displayName,
          displayNameId: categoryData.displayNameId,
          description: categoryData.description,
          descriptionId: categoryData.descriptionId,
          sortOrder: Object.keys(SYSTEM_CATEGORIES).indexOf(key) + 1,
          isActive: true,
          metadata: {
            color: categoryData.color,
            systemType: key
          }
        },
        update: {
          displayName: categoryData.displayName,
          displayNameId: categoryData.displayNameId,
          description: categoryData.description,
          descriptionId: categoryData.descriptionId
        }
      });
    }
    
    console.log('✅ Categories created successfully');
    
    // Read and parse CSV file
    console.log('📊 Reading hd_template.csv...');
    const csvPath = '/Users/yanrypangouw/Documents/Projects/Web/ticketing-system/hd_template.csv';
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV file not found: ' + csvPath);
    }
    
    const templates = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          // Skip header or empty rows
          if (row['Template Name'] && row['Template Name'] !== 'Template Name') {
            templates.push({
              name: row['Template Name'].trim(),
              description: row['Description'] ? row['Description'].trim() : '',
              showToRequester: row['Show to Requester'] === 'Yes'
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📋 Found ${templates.length} templates to import`);
    
    // Import templates
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const template of templates) {
      try {
        const { systemCategory, fieldType, priority } = categorizeTemplate(template.name, template.description);
        
        // Get category
        const category = await prisma.bSGTemplateCategory.findFirst({
          where: { name: SYSTEM_CATEGORIES[systemCategory].name }
        });
        
        if (!category) {
          console.warn(`⚠️ Category not found for: ${systemCategory}`);
          continue;
        }
        
        // Check if template already exists
        const existingTemplate = await prisma.bSGTemplate.findFirst({
          where: { name: template.name }
        });
        
        if (existingTemplate) {
          skippedCount++;
          continue;
        }
        
        // Create template
        const newTemplate = await prisma.bSGTemplate.create({
          data: {
            name: template.name,
            displayName: template.name,
            displayNameId: template.name, // Could be translated later
            description: template.description,
            descriptionId: template.description, // Could be translated later
            categoryId: category.id,
            fieldDefinitions: {
              create: FIELD_DEFINITIONS[fieldType].map(field => ({
                name: field.name,
                displayName: field.displayName,
                displayNameId: field.displayNameId,
                fieldTypeId: 1, // Default to first field type, will be updated
                isRequired: field.isRequired,
                sortOrder: field.sortOrder,
                validationRules: {},
                placeholder: field.displayName,
                placeholderId: field.displayNameId
              }))
            },
            popularityScore: priority,
            isActive: template.showToRequester,
            metadata: {
              systemCategory,
              fieldType,
              importedFrom: 'hd_template.csv',
              originalDescription: template.description
            }
          }
        });
        
        importedCount++;
        
        if (importedCount % 25 === 0) {
          console.log(`⏳ Imported ${importedCount} templates...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to import template "${template.name}":`, error.message);
        skippedCount++;
      }
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${importedCount} templates`);
    console.log(`⏭️ Skipped (already exists): ${skippedCount} templates`);
    console.log(`📊 Total processed: ${templates.length} templates`);
    
    // Generate summary by category
    console.log('\n📈 Templates by Category:');
    for (const [key, categoryData] of Object.entries(SYSTEM_CATEGORIES)) {
      const count = await prisma.bSGTemplate.count({
        where: {
          category: {
            name: categoryData.name
          }
        }
      });
      console.log(`  ${categoryData.displayNameId}: ${count} templates`);
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run import if called directly
if (require.main === module) {
  importRealBSGTemplates()
    .then(() => {
      console.log('🏁 Template import completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Template import failed:', error);
      process.exit(1);
    });
}

module.exports = { importRealBSGTemplates };