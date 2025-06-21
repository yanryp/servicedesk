// scripts/seedBankingData.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedBankingData() {
  console.log('🌱 Starting BSG banking data seeding...');

  try {
    // 1. Create field type definitions for banking-specific fields
    console.log('📝 Creating field type definitions...');
    
    const fieldTypes = [
      {
        name: 'currency_idr',
        displayName: 'Indonesian Rupiah',
        displayNameId: 'Rupiah Indonesia',
        category: 'banking',
        description: 'Currency input field for Indonesian Rupiah',
        validationRules: {
          type: 'number',
          min: 0,
          max: 999999999999,
          format: 'currency'
        },
        formattingRules: {
          currency: 'IDR',
          locale: 'id-ID',
          prefix: 'Rp ',
          thousandSeparator: '.',
          decimalSeparator: ','
        },
        uiConfig: {
          inputType: 'text',
          placeholder: 'Rp 0',
          mask: 'currency'
        }
      },
      {
        name: 'branch_dropdown',
        displayName: 'Bank Branch Selection',
        displayNameId: 'Pilihan Cabang Bank',
        category: 'selection',
        description: 'Dropdown for selecting bank branches',
        validationRules: {
          type: 'string',
          required: true,
          dataSource: 'master_data',
          entityType: 'branch'
        },
        formattingRules: {
          displayFormat: '{name} ({code})'
        },
        uiConfig: {
          inputType: 'select',
          searchable: true,
          placeholder: 'Pilih Cabang'
        }
      },
      {
        name: 'olibs_menu_dropdown',
        displayName: 'OLIBs Menu Selection',
        displayNameId: 'Pilihan Menu OLIBs',
        category: 'banking',
        description: 'Dropdown for selecting OLIBs menu options',
        validationRules: {
          type: 'array',
          dataSource: 'master_data',
          entityType: 'olibs_menu',
          multiple: true
        },
        formattingRules: {
          displayFormat: '{name}'
        },
        uiConfig: {
          inputType: 'multiselect',
          searchable: true,
          placeholder: 'Pilih Menu OLIBs'
        }
      },
      {
        name: 'text_limited',
        displayName: 'Limited Text Input',
        displayNameId: 'Input Teks Terbatas',
        category: 'input',
        description: 'Text input with character limit',
        validationRules: {
          type: 'string',
          maxLength: 100
        },
        formattingRules: {
          trim: true,
          upperCase: false
        },
        uiConfig: {
          inputType: 'text',
          maxLength: 100,
          showCounter: true
        }
      },
      {
        name: 'user_code',
        displayName: 'User Code',
        displayNameId: 'Kode User',
        category: 'banking',
        description: 'Banking user code input',
        validationRules: {
          type: 'string',
          pattern: '^[A-Z0-9]{3,10}$',
          required: true
        },
        formattingRules: {
          upperCase: true,
          trim: true
        },
        uiConfig: {
          inputType: 'text',
          placeholder: 'Contoh: USR001',
          transform: 'uppercase'
        }
      },
      {
        name: 'timestamp',
        displayName: 'Timestamp',
        displayNameId: 'Waktu Kejadian',
        category: 'date_time',
        description: 'Date and time input for incident timestamps',
        validationRules: {
          type: 'datetime',
          format: 'YYYY-MM-DD HH:mm:ss'
        },
        formattingRules: {
          timezone: 'Asia/Makassar',
          format: 'DD/MM/YYYY HH:mm'
        },
        uiConfig: {
          inputType: 'datetime-local',
          placeholder: 'Pilih tanggal dan waktu'
        }
      }
    ];

    for (const fieldType of fieldTypes) {
      await prisma.fieldTypeDefinition.upsert({
        where: { name: fieldType.name },
        update: fieldType,
        create: fieldType
      });
    }

    // 2. Create BSG branch master data
    console.log('🏢 Creating BSG branch data...');
    
    const branches = [
      { code: 'KCP001', name: 'Kantor Cabang Utama Manado', nameIndonesian: 'Kantor Cabang Utama Manado' },
      { code: 'KCP002', name: 'Kantor Cabang Bitung', nameIndonesian: 'Kantor Cabang Bitung' },
      { code: 'KCP003', name: 'Kantor Cabang Tomohon', nameIndonesian: 'Kantor Cabang Tomohon' },
      { code: 'KCP004', name: 'Kantor Cabang Tondano', nameIndonesian: 'Kantor Cabang Tondano' },
      { code: 'KCP005', name: 'Kantor Cabang Airmadidi', nameIndonesian: 'Kantor Cabang Airmadidi' },
      { code: 'KCP006', name: 'Kantor Cabang Langowan', nameIndonesian: 'Kantor Cabang Langowan' },
      { code: 'KCP007', name: 'Kantor Cabang Kawangkoan', nameIndonesian: 'Kantor Cabang Kawangkoan' },
      { code: 'KCP008', name: 'Kantor Cabang Kotamobagu', nameIndonesian: 'Kantor Cabang Kotamobagu' },
      { code: 'KCP009', name: 'Kantor Cabang Tahuna', nameIndonesian: 'Kantor Cabang Tahuna' },
      { code: 'KCP010', name: 'Kantor Cabang Melonguane', nameIndonesian: 'Kantor Cabang Melonguane' },
      // Kantor Cabang Pembantu
      { code: 'KP001', name: 'Kantor Cabang Pembantu Malalayang', nameIndonesian: 'Kantor Cabang Pembantu Malalayang' },
      { code: 'KP002', name: 'Kantor Cabang Pembantu Karombasan', nameIndonesian: 'Kantor Cabang Pembantu Karombasan' },
      { code: 'KP003', name: 'Kantor Cabang Pembantu Megamas', nameIndonesian: 'Kantor Cabang Pembantu Megamas' },
      { code: 'KP004', name: 'Kantor Cabang Pembantu Girian', nameIndonesian: 'Kantor Cabang Pembantu Girian' },
      { code: 'KP005', name: 'Kantor Cabang Pembantu Pasar 45', nameIndonesian: 'Kantor Cabang Pembantu Pasar 45' }
    ];

    for (const branch of branches) {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: {
            type: 'branch',
            code: branch.code
          }
        },
        update: {
          name: branch.name,
          nameIndonesian: branch.nameIndonesian
        },
        create: {
          type: 'branch',
          code: branch.code,
          name: branch.name,
          nameIndonesian: branch.nameIndonesian,
          description: `BSG ${branch.name}`,
          isActive: true,
          sortOrder: parseInt(branch.code.slice(-3))
        }
      });
    }

    // 3. Create OLIBs menu master data
    console.log('💻 Creating OLIBs menu data...');
    
    const olibsMenus = [
      { code: 'TAB001', name: 'Tabungan - Pembukaan Rekening', nameIndonesian: 'Tabungan - Pembukaan Rekening' },
      { code: 'TAB002', name: 'Tabungan - Penutupan Rekening', nameIndonesian: 'Tabungan - Penutupan Rekening' },
      { code: 'TAB003', name: 'Tabungan - Setoran Tunai', nameIndonesian: 'Tabungan - Setoran Tunai' },
      { code: 'TAB004', name: 'Tabungan - Penarikan Tunai', nameIndonesian: 'Tabungan - Penarikan Tunai' },
      { code: 'TAB005', name: 'Tabungan - Transfer', nameIndonesian: 'Tabungan - Transfer' },
      { code: 'GIR001', name: 'Giro - Pembukaan Rekening', nameIndonesian: 'Giro - Pembukaan Rekening' },
      { code: 'GIR002', name: 'Giro - Penutupan Rekening', nameIndonesian: 'Giro - Penutupan Rekening' },
      { code: 'GIR003', name: 'Giro - Pencairan Cek', nameIndonesian: 'Giro - Pencairan Cek' },
      { code: 'GIR004', name: 'Giro - Kliring', nameIndonesian: 'Giro - Kliring' },
      { code: 'DEP001', name: 'Deposito - Pembukaan', nameIndonesian: 'Deposito - Pembukaan' },
      { code: 'DEP002', name: 'Deposito - Pencairan', nameIndonesian: 'Deposito - Pencairan' },
      { code: 'DEP003', name: 'Deposito - Perpanjangan', nameIndonesian: 'Deposito - Perpanjangan' },
      { code: 'KRD001', name: 'Kredit - Input Aplikasi', nameIndonesian: 'Kredit - Input Aplikasi' },
      { code: 'KRD002', name: 'Kredit - Pencairan', nameIndonesian: 'Kredit - Pencairan' },
      { code: 'KRD003', name: 'Kredit - Pembayaran Angsuran', nameIndonesian: 'Kredit - Pembayaran Angsuran' },
      { code: 'KRD004', name: 'Kredit - Pelunasan', nameIndonesian: 'Kredit - Pelunasan' },
      { code: 'USR001', name: 'User Management - Create User', nameIndonesian: 'User Management - Buat User' },
      { code: 'USR002', name: 'User Management - Edit User', nameIndonesian: 'User Management - Edit User' },
      { code: 'USR003', name: 'User Management - Reset Password', nameIndonesian: 'User Management - Reset Password' },
      { code: 'USR004', name: 'User Management - Block/Unblock', nameIndonesian: 'User Management - Blokir/Buka Blokir' },
      { code: 'RPT001', name: 'Reporting - Daily Report', nameIndonesian: 'Reporting - Laporan Harian' },
      { code: 'RPT002', name: 'Reporting - Monthly Report', nameIndonesian: 'Reporting - Laporan Bulanan' },
      { code: 'ADM001', name: 'Administration - Parameter Setting', nameIndonesian: 'Administration - Pengaturan Parameter' },
      { code: 'ADM002', name: 'Administration - Backup Database', nameIndonesian: 'Administration - Backup Database' }
    ];

    for (const menu of olibsMenus) {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: {
            type: 'olibs_menu',
            code: menu.code
          }
        },
        update: {
          name: menu.name,
          nameIndonesian: menu.nameIndonesian
        },
        create: {
          type: 'olibs_menu',
          code: menu.code,
          name: menu.name,
          nameIndonesian: menu.nameIndonesian,
          description: `OLIBs Menu: ${menu.name}`,
          isActive: true,
          sortOrder: parseInt(menu.code.slice(-3))
        }
      });
    }

    // 4. Create template categories
    console.log('📁 Creating template categories...');
    
    const categories = [
      {
        name: 'Core Banking System',
        nameIndonesian: 'Sistem Core Banking',
        description: 'Templates for core banking system operations',
        icon: 'bank',
        color: '#1E40AF',
        sortOrder: 1
      },
      {
        name: 'Mobile Banking',
        nameIndonesian: 'Mobile Banking',
        description: 'Templates for mobile banking services',
        icon: 'mobile',
        color: '#059669',
        sortOrder: 2
      },
      {
        name: 'User Management',
        nameIndonesian: 'Manajemen User',
        description: 'Templates for user account management',
        icon: 'users',
        color: '#7C3AED',
        sortOrder: 3
      }
    ];

    for (const category of categories) {
      const existingCategory = await prisma.templateCategory.findFirst({
        where: {
          name: category.name,
          parentId: null
        }
      });

      if (existingCategory) {
        await prisma.templateCategory.update({
          where: { id: existingCategory.id },
          data: {
            nameIndonesian: category.nameIndonesian,
            description: category.description,
            icon: category.icon,
            color: category.color,
            sortOrder: category.sortOrder
          }
        });
      } else {
        await prisma.templateCategory.create({
          data: {
            name: category.name,
            nameIndonesian: category.nameIndonesian,
            description: category.description,
            icon: category.icon,
            color: category.color,
            sortOrder: category.sortOrder,
            isActive: true,
            parentId: null
          }
        });
      }
    }

    console.log('✅ BSG banking data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding banking data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedBankingData()
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBankingData };