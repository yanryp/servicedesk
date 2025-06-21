// scripts/enhanceTemplatesWithRealData.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function enhanceTemplatesWithRealData() {
  console.log('🔧 Enhancing BSG templates with real banking data...');

  try {
    // 1. Add terminal selection field type
    console.log('📝 Adding terminal field type...');
    
    await prisma.fieldTypeDefinition.upsert({
      where: { name: 'terminal_dropdown' },
      update: {
        displayName: 'Terminal/ATM Selection',
        displayNameId: 'Pilihan Terminal/ATM',
        category: 'banking',
        description: 'Dropdown for selecting bank terminals or ATMs',
        validationRules: {
          type: 'string',
          required: true,
          dataSource: 'master_data',
          entityType: 'terminal'
        },
        formattingRules: {
          displayFormat: '{name} ({code})'
        },
        uiConfig: {
          inputType: 'select',
          searchable: true,
          placeholder: 'Pilih Terminal/ATM'
        }
      },
      create: {
        name: 'terminal_dropdown',
        displayName: 'Terminal/ATM Selection',
        displayNameId: 'Pilihan Terminal/ATM',
        category: 'banking',
        description: 'Dropdown for selecting bank terminals or ATMs',
        validationRules: {
          type: 'string',
          required: true,
          dataSource: 'master_data',
          entityType: 'terminal'
        },
        formattingRules: {
          displayFormat: '{name} ({code})'
        },
        uiConfig: {
          inputType: 'select',
          searchable: true,
          placeholder: 'Pilih Terminal/ATM'
        }
      }
    });

    // 2. Create ATM-related templates using real data
    console.log('🏧 Creating ATM-related templates...');

    // Get service item for banking
    const bankingServiceItem = await prisma.serviceItem.findFirst({
      where: { name: 'Banking System Management' }
    });

    // Get admin user and categories
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    const coreBankingCategory = await prisma.templateCategory.findFirst({
      where: { name: 'Core Banking System' }
    });
    const itDepartment = await prisma.department.findFirst({
      where: { name: { contains: 'IT', mode: 'insensitive' } }
    });

    if (!bankingServiceItem || !adminUser || !coreBankingCategory) {
      throw new Error('Required entities not found for template creation');
    }

    // Create ATM Selisih template
    const atmSelisihTemplate = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: bankingServiceItem.id,
        name: 'ATM - Penyelesaian Selisih ATM',
        description: 'Template untuk penyelesaian selisih kas ATM berdasarkan data transaksi',
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: true,
        isVisible: true,
        sortOrder: 4,
        estimatedResolutionTime: 120,
        customFieldDefinitions: {
          create: [
            {
              fieldName: 'nomor_tiket',
              fieldLabel: 'Nomor Tiket',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: TKT-2025-001',
              sortOrder: 1,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 50
              }
            },
            {
              fieldName: 'cabang_asal',
              fieldLabel: 'Cabang Pelapor',
              fieldType: 'dropdown',
              isRequired: true,
              placeholder: 'Pilih cabang',
              sortOrder: 2,
              isVisible: true,
              options: {
                dataSource: 'master_data',
                entityType: 'branch',
                displayFormat: '{name} ({code})'
              },
              validationRules: {
                required: true
              }
            },
            {
              fieldName: 'terminal_id',
              fieldLabel: 'Terminal/ATM',
              fieldType: 'dropdown',
              isRequired: true,
              placeholder: 'Pilih terminal',
              sortOrder: 3,
              isVisible: true,
              options: {
                dataSource: 'master_data',
                entityType: 'terminal',
                displayFormat: '{name} ({code})',
                filterBy: 'branch_code'
              },
              validationRules: {
                required: true
              }
            },
            {
              fieldName: 'tanggal_transaksi',
              fieldLabel: 'Tanggal Transaksi',
              fieldType: 'date',
              isRequired: true,
              placeholder: 'Pilih tanggal transaksi',
              sortOrder: 4,
              isVisible: true,
              validationRules: {
                required: true,
                format: 'YYYY-MM-DD'
              }
            },
            {
              fieldName: 'nomor_kartu',
              fieldLabel: 'Nomor Kartu (Masked)',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: ****-****-****-1234',
              sortOrder: 5,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[*0-9-]{16,19}$'
              }
            },
            {
              fieldName: 'jumlah_selisih',
              fieldLabel: 'Jumlah Selisih (Rp)',
              fieldType: 'number',
              isRequired: true,
              placeholder: 'Rp 0',
              sortOrder: 6,
              isVisible: true,
              validationRules: {
                required: true,
                min: 1000,
                max: 10000000,
                format: 'currency'
              }
            },
            {
              fieldName: 'otorisasi',
              fieldLabel: 'Kode Otorisasi',
              fieldType: 'text',
              isRequired: false,
              placeholder: 'Kode otorisasi transaksi',
              sortOrder: 7,
              isVisible: true,
              validationRules: {
                maxLength: 20
              }
            },
            {
              fieldName: 'keterangan_selisih',
              fieldLabel: 'Keterangan Selisih',
              fieldType: 'textarea',
              isRequired: true,
              placeholder: 'Jelaskan penyebab selisih dan detail transaksi',
              sortOrder: 8,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 500
              }
            }
          ]
        }
      }
    });

    // Create template metadata for ATM Selisih
    await prisma.templateMetadata.create({
      data: {
        serviceTemplateId: atmSelisihTemplate.id,
        categoryId: coreBankingCategory.id,
        name: 'ATM - Penyelesaian Selisih ATM',
        nameIndonesian: 'ATM - Penyelesaian Selisih ATM',
        description: 'Template untuk penyelesaian selisih kas ATM berdasarkan data transaksi',
        businessProcess: 'atm_operations',
        complexity: 'medium',
        estimatedTime: 120,
        popularityScore: 6.0,
        usageCount: 0,
        tags: ['atm', 'selisih', 'kas', 'terminal', 'penyelesaian', 'klaim'],
        searchKeywords: 'atm selisih kas terminal penyelesaian klaim dispute',
        searchKeywordsId: 'atm selisih kas terminal penyelesaian klaim sengketa',
        isPublic: true,
        isActive: true,
        departmentId: itDepartment?.id,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: '1.0.0'
      }
    });

    // Create Klaim ATM Bersama template
    const klaimAtmBersama = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: bankingServiceItem.id,
        name: 'ATM Bersama - Klaim Transaksi Gagal',
        description: 'Template untuk klaim transaksi gagal pada jaringan ATM Bersama',
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: false,
        isVisible: true,
        sortOrder: 5,
        estimatedResolutionTime: 90,
        customFieldDefinitions: {
          create: [
            {
              fieldName: 'tanggal_transaksi',
              fieldLabel: 'Tanggal & Waktu Transaksi',
              fieldType: 'datetime',
              isRequired: true,
              placeholder: 'Pilih tanggal dan waktu',
              sortOrder: 1,
              isVisible: true,
              validationRules: {
                required: true,
                format: 'YYYY-MM-DD HH:mm:ss'
              }
            },
            {
              fieldName: 'nomor_kartu',
              fieldLabel: 'Nomor Kartu (Terakhir 4 Digit)',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: 1234',
              sortOrder: 2,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[0-9]{4}$',
                maxLength: 4
              }
            },
            {
              fieldName: 'nama_nasabah',
              fieldLabel: 'Nama Pemegang Kartu',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Nama sesuai kartu ATM',
              sortOrder: 3,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 50
              }
            },
            {
              fieldName: 'terminal_bank',
              fieldLabel: 'Bank Terminal',
              fieldType: 'dropdown',
              isRequired: true,
              placeholder: 'Pilih bank pemilik terminal',
              sortOrder: 4,
              isVisible: true,
              options: {
                dataSource: 'master_data',
                entityType: 'bank_code',
                displayFormat: '{name}',
                filter: 'is_atm_bersama:true'
              },
              validationRules: {
                required: true
              }
            },
            {
              fieldName: 'jenis_transaksi',
              fieldLabel: 'Jenis Transaksi',
              fieldType: 'radio',
              isRequired: true,
              placeholder: 'Pilih jenis transaksi',
              sortOrder: 5,
              isVisible: true,
              options: {
                values: [
                  { value: 'tarik_tunai', label: 'Tarik Tunai' },
                  { value: 'transfer', label: 'Transfer' },
                  { value: 'inquiry_saldo', label: 'Inquiry Saldo' },
                  { value: 'ganti_pin', label: 'Ganti PIN' }
                ]
              },
              validationRules: {
                required: true
              }
            },
            {
              fieldName: 'nominal',
              fieldLabel: 'Nominal Transaksi (Rp)',
              fieldType: 'number',
              isRequired: true,
              placeholder: 'Rp 0',
              sortOrder: 6,
              isVisible: true,
              validationRules: {
                required: true,
                min: 10000,
                max: 5000000,
                format: 'currency'
              }
            },
            {
              fieldName: 'no_arsip',
              fieldLabel: 'Nomor Arsip/Referensi',
              fieldType: 'text',
              isRequired: false,
              placeholder: 'Nomor referensi bank',
              sortOrder: 7,
              isVisible: true,
              validationRules: {
                maxLength: 50
              }
            },
            {
              fieldName: 'keterangan_klaim',
              fieldLabel: 'Detail Klaim',
              fieldType: 'textarea',
              isRequired: true,
              placeholder: 'Jelaskan kronologi dan masalah yang terjadi',
              sortOrder: 8,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 500
              }
            }
          ]
        }
      }
    });

    // Create template metadata for ATM Bersama
    await prisma.templateMetadata.create({
      data: {
        serviceTemplateId: klaimAtmBersama.id,
        categoryId: coreBankingCategory.id,
        name: 'ATM Bersama - Klaim Transaksi Gagal',
        nameIndonesian: 'ATM Bersama - Klaim Transaksi Gagal',
        description: 'Template untuk klaim transaksi gagal pada jaringan ATM Bersama',
        businessProcess: 'atm_operations',
        complexity: 'simple',
        estimatedTime: 90,
        popularityScore: 8.0,
        usageCount: 0,
        tags: ['atm-bersama', 'klaim', 'transaksi-gagal', 'inter-bank', 'dispute'],
        searchKeywords: 'atm bersama klaim transaksi gagal inter bank dispute',
        searchKeywordsId: 'atm bersama klaim transaksi gagal antar bank sengketa',
        isPublic: true,
        isActive: true,
        departmentId: itDepartment?.id,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: '1.0.0'
      }
    });

    // 3. Update existing templates to use real branch data
    console.log('🔄 Updating existing templates with real data...');

    // Update OLIBs templates to use real branch data
    const olibsTemplates = await prisma.serviceTemplate.findMany({
      where: {
        name: {
          contains: 'OLIBs',
          mode: 'insensitive'
        }
      },
      include: {
        customFieldDefinitions: true
      }
    });

    for (const template of olibsTemplates) {
      // Update branch fields
      const branchFields = template.customFieldDefinitions.filter(
        field => field.fieldName.includes('cabang') || field.fieldName.includes('branch')
      );

      for (const field of branchFields) {
        await prisma.serviceFieldDefinition.update({
          where: { id: field.id },
          data: {
            options: {
              dataSource: 'master_data',
              entityType: 'branch',
              displayFormat: '{name} ({code})'
            },
            validationRules: {
              ...field.validationRules,
              dataSource: 'master_data',
              entityType: 'branch'
            }
          }
        });
      }
    }

    console.log('✅ Enhanced templates with real banking data!');
    console.log('\n📊 Summary:');
    console.log('  - Added terminal field type');
    console.log('  - Created ATM Selisih template');
    console.log('  - Created ATM Bersama Klaim template');
    console.log('  - Updated existing templates with real branch data');
    console.log('  - All templates now use real BSG data');
    
  } catch (error) {
    console.error('❌ Error enhancing templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the enhancement function
if (require.main === module) {
  enhanceTemplatesWithRealData()
    .then(() => {
      console.log('\n✅ Template enhancement completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Template enhancement failed:', error);
      process.exit(1);
    });
}

module.exports = { enhanceTemplatesWithRealData };