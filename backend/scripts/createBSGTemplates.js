// scripts/createBSGTemplates.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createBSGTemplates() {
  console.log('🏗️ Starting BSG template creation...');

  try {
    // Get category IDs for reference
    const coreBankingCategory = await prisma.templateCategory.findFirst({
      where: { name: 'Core Banking System' }
    });
    
    const mobileBankingCategory = await prisma.templateCategory.findFirst({
      where: { name: 'Mobile Banking' }
    });

    if (!coreBankingCategory || !mobileBankingCategory) {
      throw new Error('Required template categories not found');
    }

    // Get or create IT department
    let itDepartment = await prisma.department.findFirst({
      where: { name: { contains: 'IT', mode: 'insensitive' } }
    });

    if (!itDepartment) {
      itDepartment = await prisma.department.create({
        data: {
          name: 'Information Technology',
          description: 'IT Department for technical services',
          departmentType: 'internal',
          isServiceOwner: true
        }
      });
    }

    // Get admin user for creator/approver
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      throw new Error('Admin user not found');
    }

    // Create service catalog and service item first
    console.log('🏗️ Creating service catalog structure...');
    
    const bsgServiceCatalog = await prisma.serviceCatalog.upsert({
      where: {
        departmentId_name: {
          departmentId: itDepartment.id,
          name: 'BSG Banking Services'
        }
      },
      update: {},
      create: {
        name: 'BSG Banking Services',
        description: 'Core banking and mobile banking services for BSG',
        serviceType: 'business_service',
        categoryLevel: 1,
        departmentId: itDepartment.id,
        isActive: true,
        requiresApproval: false,
        estimatedTime: 45,
        businessImpact: 'medium'
      }
    });

    const bankingServiceItem = await prisma.serviceItem.upsert({
      where: {
        serviceCatalogId_name: {
          serviceCatalogId: bsgServiceCatalog.id,
          name: 'Banking System Management'
        }
      },
      update: {},
      create: {
        serviceCatalogId: bsgServiceCatalog.id,
        name: 'Banking System Management',
        description: 'User management and transaction services for banking systems',
        requestType: 'service_request',
        isKasdaRelated: false,
        requiresGovApproval: false,
        isActive: true,
        sortOrder: 1
      }
    });

    // 1. Create OLIBs - Perubahan Menu & Limit Transaksi template
    console.log('📝 Creating OLIBs - Perubahan Menu & Limit Transaksi template...');
    
    const olibsMenuTemplate = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: bankingServiceItem.id,
        name: 'OLIBs - Perubahan Menu & Limit Transaksi',
        description: 'Template untuk permintaan perubahan menu dan limit transaksi pada sistem OLIBs Core Banking',
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: false,
        isVisible: true,
        sortOrder: 1,
        estimatedResolutionTime: 30, // 30 minutes
        customFieldDefinitions: {
          create: [
            {
              fieldName: 'tanggal_permintaan',
              fieldLabel: 'Tanggal Permintaan',
              fieldType: 'date',
              isRequired: true,
              placeholder: 'Pilih tanggal permintaan',
              sortOrder: 1,
              isVisible: true,
              validationRules: {
                required: true,
                format: 'YYYY-MM-DD'
              }
            },
            {
              fieldName: 'cabang_pemohon',
              fieldLabel: 'Cabang Pemohon',
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
              fieldName: 'kode_user_lama',
              fieldLabel: 'Kode User Lama',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: USR001',
              sortOrder: 3,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[A-Z0-9]{3,10}$',
                maxLength: 10
              }
            },
            {
              fieldName: 'kode_user_baru',
              fieldLabel: 'Kode User Baru',
              fieldType: 'text',
              isRequired: false,
              placeholder: 'Contoh: USR002 (jika diperlukan)',
              sortOrder: 4,
              isVisible: true,
              validationRules: {
                pattern: '^[A-Z0-9]{3,10}$',
                maxLength: 10
              }
            },
            {
              fieldName: 'menu_olibs',
              fieldLabel: 'Menu OLIBs yang Diminta',
              fieldType: 'checkbox',
              isRequired: true,
              placeholder: 'Pilih menu yang diperlukan',
              sortOrder: 5,
              isVisible: true,
              options: {
                dataSource: 'master_data',
                entityType: 'olibs_menu',
                multiple: true
              },
              validationRules: {
                required: true,
                minItems: 1
              }
            },
            {
              fieldName: 'limit_transaksi',
              fieldLabel: 'Limit Transaksi (Rp)',
              fieldType: 'number',
              isRequired: false,
              placeholder: 'Rp 0',
              sortOrder: 6,
              isVisible: true,
              validationRules: {
                min: 0,
                max: 999999999999,
                format: 'currency'
              }
            },
            {
              fieldName: 'keterangan',
              fieldLabel: 'Keterangan Tambahan',
              fieldType: 'textarea',
              isRequired: false,
              placeholder: 'Jelaskan detail permintaan atau alasan perubahan',
              sortOrder: 7,
              isVisible: true,
              validationRules: {
                maxLength: 500
              }
            }
          ]
        }
      }
    });

    // Create template metadata for OLIBs Menu template
    await prisma.templateMetadata.create({
      data: {
        serviceTemplateId: olibsMenuTemplate.id,
        categoryId: coreBankingCategory.id,
        name: 'OLIBs - Perubahan Menu & Limit Transaksi',
        nameIndonesian: 'OLIBs - Perubahan Menu & Limit Transaksi',
        description: 'Template untuk permintaan perubahan menu dan limit transaksi pada sistem OLIBs Core Banking',
        businessProcess: 'core_banking',
        complexity: 'medium',
        estimatedTime: 30,
        popularityScore: 5.0,
        usageCount: 0,
        tags: ['olibs', 'core-banking', 'menu', 'limit', 'transaksi', 'user-management'],
        searchKeywords: 'olibs menu limit transaksi perubahan user kode',
        searchKeywordsId: 'olibs menu limit transaksi perubahan pengguna kode',
        isPublic: true,
        isActive: true,
        departmentId: itDepartment?.id,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: '1.0.0'
      }
    });

    // 2. Create OLIBs - Mutasi User Pegawai template
    console.log('👥 Creating OLIBs - Mutasi User Pegawai template...');
    
    const olibsMutasiTemplate = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: bankingServiceItem.id,
        name: 'OLIBs - Mutasi User Pegawai',
        description: 'Template untuk permintaan mutasi user pegawai antar cabang pada sistem OLIBs',
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: true, // Requires manager approval
        isVisible: true,
        sortOrder: 2,
        estimatedResolutionTime: 45,
        customFieldDefinitions: {
          create: [
            {
              fieldName: 'tanggal_mutasi',
              fieldLabel: 'Tanggal Efektif Mutasi',
              fieldType: 'date',
              isRequired: true,
              placeholder: 'Pilih tanggal efektif',
              sortOrder: 1,
              isVisible: true,
              validationRules: {
                required: true,
                format: 'YYYY-MM-DD'
              }
            },
            {
              fieldName: 'nama_pegawai',
              fieldLabel: 'Nama Lengkap Pegawai',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Masukkan nama lengkap pegawai',
              sortOrder: 2,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 100,
                minLength: 3
              }
            },
            {
              fieldName: 'nip_pegawai',
              fieldLabel: 'NIP Pegawai',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: 12345678',
              sortOrder: 3,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[0-9]{8,12}$'
              }
            },
            {
              fieldName: 'cabang_asal',
              fieldLabel: 'Cabang Asal',
              fieldType: 'dropdown',
              isRequired: true,
              placeholder: 'Pilih cabang asal',
              sortOrder: 4,
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
              fieldName: 'cabang_tujuan',
              fieldLabel: 'Cabang Tujuan',
              fieldType: 'dropdown',
              isRequired: true,
              placeholder: 'Pilih cabang tujuan',
              sortOrder: 5,
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
              fieldName: 'jabatan_baru',
              fieldLabel: 'Jabatan/Posisi Baru',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: Teller, Customer Service, etc.',
              sortOrder: 6,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 50
              }
            },
            {
              fieldName: 'kode_user_baru',
              fieldLabel: 'Kode User Baru (Jika Ada)',
              fieldType: 'text',
              isRequired: false,
              placeholder: 'Contoh: USR123',
              sortOrder: 7,
              isVisible: true,
              validationRules: {
                pattern: '^[A-Z0-9]{3,10}$',
                maxLength: 10
              }
            },
            {
              fieldName: 'menu_akses_diperlukan',
              fieldLabel: 'Menu Akses yang Diperlukan',
              fieldType: 'checkbox',
              isRequired: true,
              placeholder: 'Pilih menu akses yang diperlukan',
              sortOrder: 8,
              isVisible: true,
              options: {
                dataSource: 'master_data',
                entityType: 'olibs_menu',
                multiple: true
              },
              validationRules: {
                required: true,
                minItems: 1
              }
            },
            {
              fieldName: 'keterangan_mutasi',
              fieldLabel: 'Keterangan Mutasi',
              fieldType: 'textarea',
              isRequired: false,
              placeholder: 'Jelaskan detail mutasi atau informasi tambahan',
              sortOrder: 9,
              isVisible: true,
              validationRules: {
                maxLength: 500
              }
            }
          ]
        }
      }
    });

    // Create template metadata for Mutasi template
    await prisma.templateMetadata.create({
      data: {
        serviceTemplateId: olibsMutasiTemplate.id,
        categoryId: coreBankingCategory.id,
        name: 'OLIBs - Mutasi User Pegawai',
        nameIndonesian: 'OLIBs - Mutasi User Pegawai',
        description: 'Template untuk permintaan mutasi user pegawai antar cabang pada sistem OLIBs',
        businessProcess: 'human_resources',
        complexity: 'medium',
        estimatedTime: 45,
        popularityScore: 4.0,
        usageCount: 0,
        tags: ['olibs', 'mutasi', 'pegawai', 'cabang', 'user-management', 'hr'],
        searchKeywords: 'olibs mutasi pegawai cabang user karyawan pindah',
        searchKeywordsId: 'olibs mutasi pegawai cabang pengguna karyawan pindah',
        isPublic: true,
        isActive: true,
        departmentId: itDepartment?.id,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: '1.0.0'
      }
    });

    // 3. Create Klaim BSG Touch - Transfer antar bank template
    console.log('📱 Creating Klaim BSG Touch - Transfer antar bank template...');
    
    const bsgTouchTemplate = await prisma.serviceTemplate.create({
      data: {
        serviceItemId: bankingServiceItem.id,
        name: 'Klaim BSG Touch - Transfer antar bank',
        description: 'Template untuk klaim transaksi transfer antar bank yang gagal melalui aplikasi BSG Touch',
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: false,
        isVisible: true,
        sortOrder: 3,
        estimatedResolutionTime: 60,
        customFieldDefinitions: {
          create: [
            {
              fieldName: 'tanggal_transaksi',
              fieldLabel: 'Tanggal dan Waktu Transaksi',
              fieldType: 'datetime',
              isRequired: true,
              placeholder: 'Pilih tanggal dan waktu transaksi',
              sortOrder: 1,
              isVisible: true,
              validationRules: {
                required: true,
                format: 'YYYY-MM-DD HH:mm:ss'
              }
            },
            {
              fieldName: 'nomor_rekening_pengirim',
              fieldLabel: 'Nomor Rekening Pengirim',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: 1234567890',
              sortOrder: 2,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[0-9]{10,15}$'
              }
            },
            {
              fieldName: 'nama_pengirim',
              fieldLabel: 'Nama Pemilik Rekening Pengirim',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Nama sesuai rekening',
              sortOrder: 3,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 50,
                minLength: 3
              }
            },
            {
              fieldName: 'bank_tujuan',
              fieldLabel: 'Bank Tujuan',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Contoh: BCA, BNI, BRI, Mandiri, etc.',
              sortOrder: 4,
              isVisible: true,
              validationRules: {
                required: true,
                maxLength: 50
              }
            },
            {
              fieldName: 'nomor_rekening_tujuan',
              fieldLabel: 'Nomor Rekening Tujuan',
              fieldType: 'text',
              isRequired: true,
              placeholder: 'Nomor rekening bank tujuan',
              sortOrder: 5,
              isVisible: true,
              validationRules: {
                required: true,
                pattern: '^[0-9]{10,20}$'
              }
            },
            {
              fieldName: 'jumlah_transfer',
              fieldLabel: 'Jumlah Transfer (Rp)',
              fieldType: 'number',
              isRequired: true,
              placeholder: 'Rp 0',
              sortOrder: 6,
              isVisible: true,
              validationRules: {
                required: true,
                min: 10000,
                max: 500000000,
                format: 'currency'
              }
            }
          ]
        }
      }
    });

    // Create template metadata for BSG Touch template
    await prisma.templateMetadata.create({
      data: {
        serviceTemplateId: bsgTouchTemplate.id,
        categoryId: mobileBankingCategory.id,
        name: 'Klaim BSG Touch - Transfer antar bank',
        nameIndonesian: 'Klaim BSG Touch - Transfer antar bank',
        description: 'Template untuk klaim transaksi transfer antar bank yang gagal melalui aplikasi BSG Touch',
        businessProcess: 'mobile_banking',
        complexity: 'simple',
        estimatedTime: 60,
        popularityScore: 7.0,
        usageCount: 0,
        tags: ['bsg-touch', 'mobile-banking', 'transfer', 'antar-bank', 'klaim', 'gagal-transaksi'],
        searchKeywords: 'bsg touch transfer antar bank klaim gagal mobile banking',
        searchKeywordsId: 'bsg touch transfer antar bank klaim gagal mobile banking',
        isPublic: true,
        isActive: true,
        departmentId: itDepartment?.id,
        createdBy: adminUser.id,
        approvedBy: adminUser.id,
        approvedAt: new Date(),
        version: '1.0.0'
      }
    });

    console.log('✅ BSG templates created successfully!');
    console.log(`📊 Summary:`);
    console.log(`  - OLIBs Menu Template ID: ${olibsMenuTemplate.id}`);
    console.log(`  - OLIBs Mutasi Template ID: ${olibsMutasiTemplate.id}`);
    console.log(`  - BSG Touch Template ID: ${bsgTouchTemplate.id}`);
    
  } catch (error) {
    console.error('❌ Error creating BSG templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the template creation function
if (require.main === module) {
  createBSGTemplates()
    .then(() => {
      console.log('🎉 Template creation completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Template creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createBSGTemplates };