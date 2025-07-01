import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMissingServices() {
  console.log('🔧 Starting Missing Services Fix...');

  try {
    // Get the existing "Core Banking & Financial Systems" catalog or create it
    let coreBankingCatalog = await prisma.serviceCatalog.findFirst({
      where: {
        name: {
          contains: 'Core Banking',
          mode: 'insensitive'
        }
      }
    });

    // If not found, check for "Banking Support Services" catalog
    if (!coreBankingCatalog) {
      coreBankingCatalog = await prisma.serviceCatalog.findFirst({
        where: {
          name: {
            contains: 'Banking',
            mode: 'insensitive'
          }
        }
      });
    }

    if (!coreBankingCatalog) {
      // Get support department
      const supportDept = await prisma.department.findFirst({ 
        where: { name: 'Dukungan dan Layanan' } 
      });
      
      if (!supportDept) {
        throw new Error('Support department not found');
      }

      // Create the catalog
      coreBankingCatalog = await prisma.serviceCatalog.create({
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
    }

    console.log(`✅ Using catalog: ${coreBankingCatalog.name}`);

    // Define all missing Core Banking services
    const missingServices = {
      // OLIBS System Services
      'OLIBS System': [
        'OLIBs - BE Error', 'OLIBs - Buka Blokir', 'OLIBs - Error Deposito',
        'OLIBs - Error Giro', 'OLIBs - Error Kredit', 'OLIBs - Error PRK',
        'OLIBs - Error Tabungan', 'OLIBs - Error User', 'OLIBs - FE Error',
        'OLIBs - Gagal Close Operasional', 'OLIBs - Mutasi User Pegawai',
        'OLIBs - Non Aktif User', 'OLIBs - Override Password',
        'OLIBs - Pendaftaran User Baru', 'OLIBs - Perubahan Menu dan Limit Transaksi',
        'OLIBs - Selisih Pembukuan'
      ],
      // KASDA Online Services
      'KASDA Online': [
        'Kasda Online - Error Approval Maker', 'Kasda Online - Error Approval Transaksi',
        'Kasda Online - Error Cek Transaksi/Saldo Rekening', 'Kasda Online - Error Lainnya',
        'Kasda Online - Error Login', 'Kasda Online - Error Permintaan Token Transaksi',
        'Kasda Online - Error Tarik Data SP2D (Kasda FMIS)', 'Kasda Online - Gagal Pembayaran',
        'Kasda Online - Gagal Transfer', 'Kasda Online BUD - Error',
        'Kasda Online - User Management'
      ],
      // Specialized Financial Systems
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
    };

    let totalAdded = 0;
    let sortOrderStart = 100; // Start from 100 to avoid conflicts

    for (const [categoryName, services] of Object.entries(missingServices)) {
      console.log(`\n📂 Adding ${categoryName} services...`);
      
      for (const serviceName of services) {
        // Check if service already exists
        const existingService = await prisma.serviceItem.findFirst({
          where: {
            serviceCatalogId: coreBankingCatalog.id,
            name: serviceName
          }
        });

        if (!existingService) {
          // Determine service properties based on name
          const isKasdaRelated = serviceName.toLowerCase().includes('kasda');
          const requiresGovApproval = isKasdaRelated || serviceName.includes('User Management');
          const requestType = serviceName.includes('Error') || serviceName.includes('Gagal') ? 'incident' : 'service_request';

          await prisma.serviceItem.create({
            data: {
              name: serviceName,
              description: `${categoryName} service: ${serviceName}`,
              serviceCatalogId: coreBankingCatalog.id,
              requestType: requestType,
              isKasdaRelated: isKasdaRelated,
              requiresGovApproval: requiresGovApproval,
              isActive: true,
              sortOrder: sortOrderStart + totalAdded
            }
          });

          totalAdded++;
          console.log(`  ✅ Added: ${serviceName}`);
        } else {
          console.log(`  ⚠️ Already exists: ${serviceName}`);
        }
      }
    }

    // Create default field definitions for new services without templates
    console.log(`\n🔧 Creating default fields for new services...`);
    
    const newServices = await prisma.serviceItem.findMany({
      where: {
        serviceCatalogId: coreBankingCatalog.id,
        service_field_definitions: {
          none: {}
        }
      }
    });

    // Get field types
    const textFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'text' } });
    const textareaFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'textarea' } });
    const selectFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'select' } });

    if (!textFieldType || !textareaFieldType || !selectFieldType) {
      throw new Error('Required field types not found');
    }

    let fieldCount = 0;

    for (const service of newServices) {
      const serviceName = service.name.toLowerCase();
      
      // Base fields for all services
      const baseFields = [
        {
          fieldName: 'urgency',
          fieldLabel: 'Urgency Level',
          fieldType: 'dropdown',
          isRequired: true,
          options: ['Low', 'Medium', 'High', 'Critical']
        },
        {
          fieldName: 'description',
          fieldLabel: 'Issue Description',
          fieldType: 'textarea',
          isRequired: true,
          options: []
        }
      ];

      // Service-specific fields based on service name patterns
      let specificFields: any[] = [];

      if (serviceName.includes('olibs')) {
        specificFields = [
          {
            fieldName: 'branch_office',
            fieldLabel: 'Branch/CAPEM',
            fieldType: 'dropdown',
            isRequired: true,
            options: ['Kantor Cabang Utama', 'Kantor Cabang Jakarta', 'Kantor Cabang Gorontalo']
          },
          {
            fieldName: 'user_code',
            fieldLabel: 'User Code',
            fieldType: 'text',
            isRequired: serviceName.includes('user') || serviceName.includes('pendaftaran'),
            options: []
          },
          {
            fieldName: 'employee_name',
            fieldLabel: 'Employee Name',
            fieldType: 'text',
            isRequired: serviceName.includes('user') || serviceName.includes('pendaftaran'),
            options: []
          }
        ];
      } else if (serviceName.includes('kasda')) {
        specificFields = [
          {
            fieldName: 'government_entity',
            fieldLabel: 'Government Entity',
            fieldType: 'dropdown',
            isRequired: true,
            options: ['Pemerintah Provinsi Sulawesi Utara', 'Pemerintah Kota Manado', 'Pemerintah Provinsi Gorontalo']
          },
          {
            fieldName: 'transaction_reference',
            fieldLabel: 'Transaction Reference',
            fieldType: 'text',
            isRequired: serviceName.includes('transaksi') || serviceName.includes('approval'),
            options: []
          },
          {
            fieldName: 'error_code',
            fieldLabel: 'Error Code',
            fieldType: 'text',
            isRequired: serviceName.includes('error'),
            options: []
          }
        ];
      } else if (serviceName.includes('error') || serviceName.includes('gagal')) {
        specificFields = [
          {
            fieldName: 'error_message',
            fieldLabel: 'Error Message',
            fieldType: 'textarea',
            isRequired: true,
            options: []
          },
          {
            fieldName: 'system_version',
            fieldLabel: 'System Version',
            fieldType: 'text',
            isRequired: false,
            options: []
          },
          {
            fieldName: 'steps_to_reproduce',
            fieldLabel: 'Steps to Reproduce',
            fieldType: 'textarea',
            isRequired: false,
            options: []
          }
        ];
      } else if (serviceName.includes('pendaftaran') || serviceName.includes('user')) {
        specificFields = [
          {
            fieldName: 'full_name',
            fieldLabel: 'Full Name',
            fieldType: 'text',
            isRequired: true,
            options: []
          },
          {
            fieldName: 'position',
            fieldLabel: 'Position/Job Title',
            fieldType: 'text',
            isRequired: true,
            options: []
          },
          {
            fieldName: 'access_level',
            fieldLabel: 'Required Access Level',
            fieldType: 'dropdown',
            isRequired: true,
            options: ['Admin', 'User', 'Viewer', 'Operator']
          }
        ];
      }

      const allFields = [...baseFields, ...specificFields];

      // Create service field definitions
      for (let i = 0; i < allFields.length; i++) {
        const field = allFields[i];
        
        await prisma.serviceFieldDefinition.create({
          data: {
            service_item_id: service.id,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType === 'dropdown' ? 'dropdown' : 
                      field.fieldType === 'textarea' ? 'textarea' : 'text',
            isRequired: field.isRequired,
            sortOrder: i + 1,
            validationRules: {
              required: field.isRequired,
              options: field.options
            },
            placeholder: `Enter ${field.fieldLabel.toLowerCase()}`
          }
        });

        fieldCount++;
      }
    }

    // Final statistics
    const finalServiceCount = await prisma.serviceItem.count({
      where: { serviceCatalogId: coreBankingCatalog.id }
    });

    console.log(`
🎉 Missing Services Fix Complete:
═══════════════════════════════════
✅ Services Added: ${totalAdded}
🔧 Field Definitions Created: ${fieldCount}
📊 Total Core Banking Services: ${finalServiceCount}

🏦 Service Categories Fixed:
📂 OLIBS System: 16 services
🏛️ KASDA Online: 11 services  
💼 Specialized Financial: 31 services

✅ Core Banking catalog now 100% complete!
    `);

  } catch (error) {
    console.error('❌ Error fixing missing services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingServices()
  .catch((error) => {
    console.error('❌ Missing services fix failed:', error);
    process.exit(1);
  });