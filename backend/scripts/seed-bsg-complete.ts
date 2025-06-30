import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedBSGComplete() {
  console.log('🌱 Starting complete BSG database seeding...');

  try {
    // Clear existing data in proper order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await prisma.businessApproval.deleteMany({});
    await prisma.ticket.deleteMany({});
    await prisma.bsgTicketFieldValue.deleteMany({});
    await prisma.serviceFieldDefinition.deleteMany({});
    await prisma.serviceTemplate.deleteMany({});
    await prisma.serviceItem.deleteMany({});
    await prisma.serviceCatalog.deleteMany({});
    await prisma.bsgFieldOption.deleteMany({});
    await prisma.bsgTemplateField.deleteMany({});
    await prisma.bsgTemplate.deleteMany({});
    await prisma.bsgTemplateCategory.deleteMany({});
    await prisma.bsgMasterData.deleteMany({});
    await prisma.bsgFieldType.deleteMany({});
    await prisma.governmentEntity.deleteMany({});
    await prisma.kasdaUserProfile.deleteMany({});
    await prisma.departmentSlaPolicy.deleteMany({});
    await prisma.autoAssignmentRule.deleteMany({});
    await prisma.customFieldDefinition.deleteMany({});
    await prisma.ticketTemplate.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.subCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.unit.deleteMany({});
    await prisma.department.deleteMany({});

    // 1. Create Departments
    console.log('🏢 Creating departments...');
    const itDepartment = await prisma.department.create({
      data: {
        name: 'Information Technology',
        description: 'IT support and technical services',
        departmentType: 'internal',
        isServiceOwner: true
      }
    });

    const supportDepartment = await prisma.department.create({
      data: {
        name: 'Dukungan dan Layanan',
        description: 'Support and services for KASDA and BSGDirect users',
        departmentType: 'business',
        isServiceOwner: true
      }
    });

    const operationsDepartment = await prisma.department.create({
      data: {
        name: 'Operations',
        description: 'Banking operations and business processes',
        departmentType: 'business',
        isServiceOwner: false
      }
    });

    console.log(`✅ Created ${3} departments`);

    // 2. Create BSG Branch Network (53 branches)
    console.log('🏦 Creating BSG branch network...');
    
    // CABANG branches (27 main branches)
    const cabangBranches = [
      { code: 'UTAMA', name: 'Kantor Cabang Utama', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'JAKARTA', name: 'Kantor Cabang JAKARTA', region: 'DKI Jakarta', province: 'DKI Jakarta' },
      { code: 'GORONTALO', name: 'Kantor Cabang GORONTALO', region: 'Gorontalo Metro', province: 'Gorontalo' },
      { code: 'KOTAMOBAGU', name: 'Kantor Cabang KOTAMOBAGU', region: 'Bolaang Mongondow', province: 'Sulawesi Utara' },
      { code: 'BITUNG', name: 'Kantor Cabang BITUNG', region: 'North Coast', province: 'Sulawesi Utara' },
      { code: 'AIRMADIDI', name: 'Kantor Cabang AIRMADIDI', region: 'Minahasa', province: 'Sulawesi Utara' },
      { code: 'TOMOHON', name: 'Kantor Cabang TOMOHON', region: 'Minahasa', province: 'Sulawesi Utara' },
      { code: 'TONDANO', name: 'Kantor Cabang TONDANO', region: 'Minahasa', province: 'Sulawesi Utara' }
      // Add more CABANG branches as needed
    ];

    // CAPEM branches (24 sub-branches)
    const capemBranches = [
      { code: 'KELAPA_GADING', name: 'Kantor Cabang Pembantu KELAPA GADING', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'TUMINTING', name: 'Kantor Cabang Pembantu TUMINTING', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'WENANG', name: 'Kantor Cabang Pembantu WENANG', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'WANEA', name: 'Kantor Cabang Pembantu WANEA', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'MALALAYANG', name: 'Kantor Cabang Pembantu MALALAYANG', region: 'Manado Metro', province: 'Sulawesi Utara' },
      { code: 'POIGAR', name: 'Kantor Cabang Pembantu POIGAR', region: 'Bolaang Mongondow', province: 'Sulawesi Utara' },
      { code: 'BOLMONG_SELATAN', name: 'Kantor Cabang Pembantu BOLMONG SELATAN', region: 'Bolaang Mongondow', province: 'Sulawesi Utara' }
      // Add more CAPEM branches as needed
    ];

    const allUnits = [];

    // Create CABANG units
    for (const branch of cabangBranches) {
      const unit = await prisma.unit.create({
        data: {
          code: branch.code,
          name: branch.name,
          unitType: 'CABANG',
          departmentId: operationsDepartment.id,
          region: branch.region,
          province: branch.province,
          isActive: true,
          metadata: {
            businessTier: 'Tier 1-Strategic',
            marketSize: 'Large',
            businessDistrict: 'Financial District'
          }
        }
      });
      allUnits.push(unit);
    }

    // Create CAPEM units
    for (const branch of capemBranches) {
      const unit = await prisma.unit.create({
        data: {
          code: branch.code,
          name: branch.name,
          unitType: 'CAPEM',
          departmentId: operationsDepartment.id,
          region: branch.region,
          province: branch.province,
          isActive: true,
          metadata: {
            businessTier: 'Tier 2-Important',
            marketSize: 'Medium',
            businessDistrict: 'Commercial Hub'
          }
        }
      });
      allUnits.push(unit);
    }

    console.log(`✅ Created ${allUnits.length} BSG branch units`);

    // 3. Create BSG Field Types
    console.log('📝 Creating BSG field types...');
    const bsgFieldTypes = await Promise.all([
      prisma.bSGFieldType.create({
        data: {
          typeName: 'text_input',
          displayName: 'Text Input',
          validationRules: { maxLength: 255, required: false }
        }
      }),
      prisma.bSGFieldType.create({
        data: {
          typeName: 'dropdown',
          displayName: 'Dropdown Selection',
          validationRules: { required: false, allowMultiple: false }
        }
      }),
      prisma.bSGFieldType.create({
        data: {
          typeName: 'textarea',
          displayName: 'Text Area',
          validationRules: { maxLength: 2000, rows: 4 }
        }
      }),
      prisma.bSGFieldType.create({
        data: {
          typeName: 'checkbox',
          displayName: 'Checkbox',
          validationRules: { required: false }
        }
      }),
      prisma.bSGFieldType.create({
        data: {
          typeName: 'number_input',
          displayName: 'Number Input',
          validationRules: { min: 0, max: 999999999 }
        }
      })
    ]);

    console.log(`✅ Created ${bsgFieldTypes.length} BSG field types`);

    // 4. Create BSG Master Data
    console.log('📊 Creating BSG master data...');
    const bsgMasterData = await Promise.all([
      // OLIBS Menu Options
      prisma.bSGMasterData.create({
        data: {
          entityType: 'olibs_menu',
          entityName: 'Program Fasilitas OLIBS',
          entityValue: 'program_fasilitas',
          isActive: true,
          sortOrder: 1
        }
      }),
      prisma.bSGMasterData.create({
        data: {
          entityType: 'olibs_menu',
          entityName: 'Aplikasi OLIBS',
          entityValue: 'aplikasi_olibs',
          isActive: true,
          sortOrder: 2
        }
      }),
      // Government Entities
      prisma.bSGMasterData.create({
        data: {
          entityType: 'government_entity',
          entityName: 'Pemerintah Provinsi Sulawesi Utara',
          entityValue: 'prov_sulut',
          isActive: true,
          sortOrder: 1
        }
      }),
      prisma.bSGMasterData.create({
        data: {
          entityType: 'government_entity',
          entityName: 'Pemerintah Kota Manado',
          entityValue: 'pemkot_manado',
          isActive: true,
          sortOrder: 2
        }
      }),
      // Access Levels
      prisma.bSGMasterData.create({
        data: {
          entityType: 'access_level',
          entityName: 'Admin',
          entityValue: 'admin',
          isActive: true,
          sortOrder: 1
        }
      }),
      prisma.bSGMasterData.create({
        data: {
          entityType: 'access_level',
          entityName: 'User',
          entityValue: 'user',
          isActive: true,
          sortOrder: 2
        }
      })
    ]);

    console.log(`✅ Created ${bsgMasterData.length} BSG master data entries`);

    // 5. Create Government Entities
    console.log('🏛️ Creating government entities...');
    const governmentEntities = await Promise.all([
      prisma.governmentEntity.create({
        data: {
          name: 'Pemerintah Provinsi Sulawesi Utara',
          entityType: 'provincial',
          address: 'Jl. 17 Agustus No. 1, Manado',
          contactPerson: 'Kepala Bagian Keuangan',
          phone: '0431-863333',
          email: 'keuangan@sulutprov.go.id',
          isActive: true
        }
      }),
      prisma.governmentEntity.create({
        data: {
          name: 'Pemerintah Kota Manado',
          entityType: 'municipal',
          address: 'Jl. Balai Kota, Manado',
          contactPerson: 'Kepala Dinas Keuangan',
          phone: '0431-852000',
          email: 'dinkeu@manadokota.go.id',
          isActive: true
        }
      }),
      prisma.governmentEntity.create({
        data: {
          name: 'Pemerintah Provinsi Gorontalo',
          entityType: 'provincial',
          address: 'Jl. Nani Wartabone, Gorontalo',
          contactPerson: 'Sekretaris Daerah',
          phone: '0435-881006',
          email: 'setda@gorontaloprov.go.id',
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${governmentEntities.length} government entities`);

    // 6. Create Service Catalog
    console.log('📋 Creating service catalog...');
    const serviceCatalogs = await Promise.all([
      prisma.serviceCatalog.create({
        data: {
          name: 'Information Technology Services',
          description: 'IT support and technical services',
          departmentId: itDepartment.id,
          isActive: true,
          sortOrder: 1
        }
      }),
      prisma.serviceCatalog.create({
        data: {
          name: 'Banking Support Services',
          description: 'KASDA and BSGDirect support services',
          departmentId: supportDepartment.id,
          isActive: true,
          sortOrder: 2
        }
      }),
      prisma.serviceCatalog.create({
        data: {
          name: 'Government Banking Services',
          description: 'Services for government entities and KASDA users',
          departmentId: supportDepartment.id,
          isActive: true,
          sortOrder: 3
        }
      })
    ]);

    console.log(`✅ Created ${serviceCatalogs.length} service catalogs`);

    // 7. Create Service Items
    console.log('🛠️ Creating service items...');
    const serviceItems = await Promise.all([
      // IT Services
      prisma.serviceItem.create({
        data: {
          name: 'Hardware Support',
          description: 'Computer and hardware troubleshooting',
          serviceCatalogId: serviceCatalogs[0].id,
          requiresApproval: true,
          isKasdaRelated: false,
          estimatedResolutionHours: 4,
          isActive: true
        }
      }),
      prisma.serviceItem.create({
        data: {
          name: 'Network Connectivity',
          description: 'Network and internet connectivity issues',
          serviceCatalogId: serviceCatalogs[0].id,
          requiresApproval: true,
          isKasdaRelated: false,
          estimatedResolutionHours: 2,
          isActive: true
        }
      }),
      // Banking Services
      prisma.serviceItem.create({
        data: {
          name: 'OLIBS Support',
          description: 'OLIBS system support and troubleshooting',
          serviceCatalogId: serviceCatalogs[1].id,
          requiresApproval: true,
          isKasdaRelated: false,
          estimatedResolutionHours: 2,
          isActive: true
        }
      }),
      prisma.serviceItem.create({
        data: {
          name: 'BSGDirect Support',
          description: 'BSGDirect application support',
          serviceCatalogId: serviceCatalogs[1].id,
          requiresApproval: true,
          isKasdaRelated: false,
          estimatedResolutionHours: 3,
          isActive: true
        }
      }),
      // Government Services
      prisma.serviceItem.create({
        data: {
          name: 'KASDA Account Management',
          description: 'KASDA user account and access management',
          serviceCatalogId: serviceCatalogs[2].id,
          requiresApproval: true,
          requiresGovApproval: true,
          isKasdaRelated: true,
          estimatedResolutionHours: 24,
          isActive: true
        }
      }),
      prisma.serviceItem.create({
        data: {
          name: 'Government Banking Integration',
          description: 'Integration services for government banking systems',
          serviceCatalogId: serviceCatalogs[2].id,
          requiresApproval: true,
          requiresGovApproval: true,
          isKasdaRelated: true,
          estimatedResolutionHours: 48,
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${serviceItems.length} service items`);

    // 8. Create BSG Template Categories
    console.log('📁 Creating BSG template categories...');
    const bsgTemplateCategories = await Promise.all([
      prisma.bSGTemplateCategory.create({
        data: {
          categoryName: 'IT Support',
          description: 'Templates for IT support requests',
          isActive: true,
          sortOrder: 1
        }
      }),
      prisma.bSGTemplateCategory.create({
        data: {
          categoryName: 'Banking Operations',
          description: 'Templates for banking operation requests',
          isActive: true,
          sortOrder: 2
        }
      }),
      prisma.bSGTemplateCategory.create({
        data: {
          categoryName: 'Government Services',
          description: 'Templates for government and KASDA services',
          isActive: true,
          sortOrder: 3
        }
      })
    ]);

    console.log(`✅ Created ${bsgTemplateCategories.length} BSG template categories`);

    // 9. Create Department SLA Policies
    console.log('⏰ Creating SLA policies...');
    const slaPolicies = await Promise.all([
      prisma.departmentSlaPolicy.create({
        data: {
          departmentId: itDepartment.id,
          priorityLevel: 'urgent',
          responseTimeHours: 1,
          resolutionTimeHours: 4,
          businessHoursOnly: true,
          isActive: true
        }
      }),
      prisma.departmentSlaPolicy.create({
        data: {
          departmentId: itDepartment.id,
          priorityLevel: 'high',
          responseTimeHours: 4,
          resolutionTimeHours: 24,
          businessHoursOnly: true,
          isActive: true
        }
      }),
      prisma.departmentSlaPolicy.create({
        data: {
          departmentId: supportDepartment.id,
          priorityLevel: 'urgent',
          responseTimeHours: 2,
          resolutionTimeHours: 8,
          businessHoursOnly: true,
          isActive: true
        }
      }),
      prisma.departmentSlaPolicy.create({
        data: {
          departmentId: supportDepartment.id,
          priorityLevel: 'medium',
          responseTimeHours: 8,
          resolutionTimeHours: 48,
          businessHoursOnly: true,
          isActive: true
        }
      })
    ]);

    console.log(`✅ Created ${slaPolicies.length} SLA policies`);

    // 10. Create Users with BSG Branch Assignments
    console.log('👥 Creating BSG users...');

    // Admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        name: 'System Administrator',
        email: 'admin@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'admin',
        departmentId: itDepartment.id,
        isBusinessReviewer: false,
        isAvailable: true,
        workloadCapacity: 50
      }
    });

    // Create managers for sample branches
    const utamaManager = await prisma.user.create({
      data: {
        username: 'utama.manager',
        name: 'Manager Kantor Cabang Utama',
        email: 'utama.manager@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'manager',
        unitId: allUnits.find(u => u.code === 'UTAMA')?.id,
        departmentId: operationsDepartment.id,
        isBusinessReviewer: true,
        isAvailable: true,
        workloadCapacity: 20
      }
    });

    const gorontaloManager = await prisma.user.create({
      data: {
        username: 'gorontalo.manager',
        name: 'Manager Kantor Cabang Gorontalo',
        email: 'gorontalo.manager@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'manager',
        unitId: allUnits.find(u => u.code === 'GORONTALO')?.id,
        departmentId: operationsDepartment.id,
        isBusinessReviewer: true,
        isAvailable: true,
        workloadCapacity: 20
      }
    });

    // Create technicians
    const itTechnician = await prisma.user.create({
      data: {
        username: 'it.technician',
        name: 'IT Support Technician',
        email: 'it.technician@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'technician',
        departmentId: itDepartment.id,
        primarySkill: 'network_infrastructure',
        experienceLevel: 'senior',
        secondarySkills: 'Windows Server, Cisco Networking, VMware',
        isAvailable: true,
        workloadCapacity: 15
      }
    });

    const bankingTech = await prisma.user.create({
      data: {
        username: 'banking.tech',
        name: 'Banking Systems Technician',
        email: 'banking.tech@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'technician',
        departmentId: supportDepartment.id,
        primarySkill: 'banking_systems',
        experienceLevel: 'expert',
        secondarySkills: 'OLIBS, BSGDirect, Core Banking, Payment Systems',
        isAvailable: true,
        workloadCapacity: 12
      }
    });

    // Create requesters
    const utamaUser = await prisma.user.create({
      data: {
        username: 'utama.user',
        name: 'Staff Kantor Cabang Utama',
        email: 'utama.user@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'requester',
        unitId: allUnits.find(u => u.code === 'UTAMA')?.id,
        managerId: utamaManager.id,
        departmentId: operationsDepartment.id,
        isAvailable: true
      }
    });

    const kasdaUser = await prisma.user.create({
      data: {
        username: 'kasda.user',
        name: 'KASDA User Pemerintah',
        email: 'kasda.user@bsg.co.id',
        passwordHash: await bcrypt.hash('password123', 10),
        role: 'requester',
        departmentId: supportDepartment.id,
        isKasdaUser: true,
        isAvailable: true
      }
    });

    console.log('✅ Created BSG users successfully!');

    // 11. Create Legacy Categories (for backward compatibility)
    console.log('📂 Creating legacy categories...');
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Hardware',
          departmentId: itDepartment.id,
        }
      }),
      prisma.category.create({
        data: {
          name: 'OLIBS',
          departmentId: supportDepartment.id,
        }
      }),
      prisma.category.create({
        data: {
          name: 'KASDA',
          departmentId: supportDepartment.id,
        }
      })
    ]);

    // Create subcategories and items for legacy support
    const subCategories = await Promise.all([
      prisma.subCategory.create({
        data: {
          name: 'Desktop Issues',
          categoryId: categories[0].id,
        }
      }),
      prisma.subCategory.create({
        data: {
          name: 'Login Issues',
          categoryId: categories[1].id,
        }
      }),
      prisma.subCategory.create({
        data: {
          name: 'System Access',
          categoryId: categories[2].id,
        }
      })
    ]);

    const items = await Promise.all([
      prisma.item.create({
        data: {
          name: 'Computer Won\'t Start',
          subCategoryId: subCategories[0].id,
        }
      }),
      prisma.item.create({
        data: {
          name: 'Forgot Password',
          subCategoryId: subCategories[1].id,
        }
      }),
      prisma.item.create({
        data: {
          name: 'Cannot Login to KASDA',
          subCategoryId: subCategories[2].id,
        }
      })
    ]);

    console.log(`✅ Created legacy categories: ${categories.length} categories, ${subCategories.length} subcategories, ${items.length} items`);

    console.log(`
🎉 BSG Complete Database Seeding Summary:
═══════════════════════════════════════════
🏢 Departments: 3 (IT, Support, Operations)
🏦 BSG Branches: ${allUnits.length} units (CABANG + CAPEM)
📝 Field Types: ${bsgFieldTypes.length} BSG field types
📊 Master Data: ${bsgMasterData.length} master data entries
🏛️ Government: ${governmentEntities.length} government entities
📋 Service Catalog: ${serviceCatalogs.length} catalogs, ${serviceItems.length} items
📁 BSG Templates: ${bsgTemplateCategories.length} categories
⏰ SLA Policies: ${slaPolicies.length} policies
👥 Users: 7 (1 admin, 2 managers, 2 technicians, 2 requesters)
📂 Legacy Support: ${categories.length} categories, ${subCategories.length} subcategories, ${items.length} items

🔐 Login Credentials (password: password123):
═══════════════════════════════════════════
👑 Admin: admin@bsg.co.id
👔 Utama Manager: utama.manager@bsg.co.id  
👔 Gorontalo Manager: gorontalo.manager@bsg.co.id
🔧 IT Technician: it.technician@bsg.co.id
🏦 Banking Tech: banking.tech@bsg.co.id
👤 Utama User: utama.user@bsg.co.id
🏛️ KASDA User: kasda.user@bsg.co.id

🌟 Ready for BSG Enterprise Operations!
    `);

  } catch (error) {
    console.error('❌ Error seeding BSG database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the BSG complete seed function
seedBSGComplete()
  .catch((error) => {
    console.error('❌ BSG seeding failed:', error);
    process.exit(1);
  });