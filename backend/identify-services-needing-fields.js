#!/usr/bin/env node

/**
 * Identify Services Needing Dynamic Fields
 * 
 * This script analyzes all services and identifies which ones should have
 * dynamic fields but currently don't, and creates the necessary field definitions.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Template for common BSG service field patterns
const COMMON_FIELD_TEMPLATES = {
  // User management services (OLIBS, BSGTouch, SMS Banking, etc.)
  'user_management': [
    {
      fieldName: 'nama_lengkap',
      fieldLabel: 'Nama Lengkap',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nama lengkap user',
      sortOrder: 1
    },
    {
      fieldName: 'nip_pegawai',
      fieldLabel: 'NIP/ID Pegawai',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nomor Induk Pegawai',
      sortOrder: 2
    },
    {
      fieldName: 'jabatan',
      fieldLabel: 'Jabatan',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Jabatan pegawai',
      sortOrder: 3
    },
    {
      fieldName: 'unit_kerja',
      fieldLabel: 'Unit Kerja/Cabang',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Unit kerja atau cabang',
      sortOrder: 4
    },
    {
      fieldName: 'tanggal_berlaku',
      fieldLabel: 'Tanggal Berlaku',
      fieldType: 'date',
      isRequired: true,
      placeholder: 'Tanggal berlaku perubahan',
      sortOrder: 5
    }
  ],

  // ATM and hardware services
  'atm_hardware': [
    {
      fieldName: 'lokasi_atm',
      fieldLabel: 'Lokasi ATM',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Lokasi lengkap ATM',
      sortOrder: 1
    },
    {
      fieldName: 'terminal_id',
      fieldLabel: 'Terminal ID',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'ID Terminal ATM',
      sortOrder: 2
    },
    {
      fieldName: 'deskripsi_masalah',
      fieldLabel: 'Deskripsi Masalah',
      fieldType: 'textarea',
      isRequired: true,
      placeholder: 'Jelaskan masalah secara detail',
      sortOrder: 3
    },
    {
      fieldName: 'waktu_kejadian',
      fieldLabel: 'Waktu Kejadian',
      fieldType: 'datetime',
      isRequired: true,
      placeholder: 'Kapan masalah terjadi',
      sortOrder: 4
    }
  ],

  // Claims and transaction services
  'claims_transaction': [
    {
      fieldName: 'nama_nasabah',
      fieldLabel: 'Nama Nasabah',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nama nasabah',
      sortOrder: 1
    },
    {
      fieldName: 'nomor_rekening',
      fieldLabel: 'Nomor Rekening',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nomor rekening nasabah',
      sortOrder: 2
    },
    {
      fieldName: 'nominal_transaksi',
      fieldLabel: 'Nominal Transaksi',
      fieldType: 'number',
      isRequired: true,
      placeholder: 'Jumlah transaksi',
      sortOrder: 3
    },
    {
      fieldName: 'tanggal_transaksi',
      fieldLabel: 'Tanggal Transaksi',
      fieldType: 'datetime',
      isRequired: true,
      placeholder: 'Kapan transaksi dilakukan',
      sortOrder: 4
    },
    {
      fieldName: 'nomor_referensi',
      fieldLabel: 'Nomor Referensi',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nomor referensi transaksi',
      sortOrder: 5
    }
  ],

  // General IT support services
  'it_support': [
    {
      fieldName: 'nama_pelapor',
      fieldLabel: 'Nama Pelapor',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Nama lengkap pelapor',
      sortOrder: 1
    },
    {
      fieldName: 'unit_cabang',
      fieldLabel: 'Unit/Cabang',
      fieldType: 'text',
      isRequired: true,
      placeholder: 'Unit atau cabang pelapor',
      sortOrder: 2
    },
    {
      fieldName: 'jenis_perangkat',
      fieldLabel: 'Jenis Perangkat',
      fieldType: 'dropdown',
      isRequired: false,
      placeholder: 'Pilih jenis perangkat',
      options: [
        { value: 'computer', label: 'Komputer/PC', sortOrder: 1 },
        { value: 'laptop', label: 'Laptop', sortOrder: 2 },
        { value: 'printer', label: 'Printer', sortOrder: 3 },
        { value: 'network', label: 'Jaringan', sortOrder: 4 },
        { value: 'software', label: 'Software', sortOrder: 5 }
      ],
      sortOrder: 3
    }
  ]
};

// Service patterns to identify which template to use
const SERVICE_PATTERNS = [
  {
    patterns: ['olibs', 'bsgtouch', 'sms banking', 'user', 'pegawai', 'mutasi', 'pendaftaran'],
    template: 'user_management',
    description: 'User management services'
  },
  {
    patterns: ['atm', 'edc', 'hardware', 'terminal', 'mesin', 'teknis'],
    template: 'atm_hardware',
    description: 'ATM and hardware services'
  },
  {
    patterns: ['klaim', 'transfer', 'transaksi', 'gagal', 'claim'],
    template: 'claims_transaction',
    description: 'Claims and transaction services'
  },
  {
    patterns: ['domain', 'email', 'password', 'network', 'sistem', 'aplikasi'],
    template: 'it_support',
    description: 'IT support services'
  }
];

async function identifyAndCreateFields() {
  try {
    console.log('🔍 Identifying services that need dynamic fields...\n');

    // Get all service items
    const allServices = await prisma.serviceItem.findMany({
      include: {
        service_field_definitions: true,
        serviceCatalog: true
      }
    });

    console.log(`📊 Total services found: ${allServices.length}`);

    const servicesNeedingFields = [];
    const servicesWithFields = [];

    // Analyze each service
    for (const service of allServices) {
      const hasFields = service.service_field_definitions.length > 0;
      
      if (hasFields) {
        servicesWithFields.push({
          name: service.name,
          category: service.serviceCatalog.name,
          fieldCount: service.service_field_definitions.length
        });
      } else {
        // Determine if this service should have fields
        const serviceName = service.name.toLowerCase();
        const categoryName = service.serviceCatalog.name.toLowerCase();
        
        for (const pattern of SERVICE_PATTERNS) {
          const matches = pattern.patterns.some(p => 
            serviceName.includes(p) || categoryName.includes(p)
          );
          
          if (matches) {
            servicesNeedingFields.push({
              id: service.id,
              name: service.name,
              category: service.serviceCatalog.name,
              template: pattern.template,
              description: pattern.description
            });
            break;
          }
        }
      }
    }

    console.log(`\n✅ Services with fields: ${servicesWithFields.length}`);
    console.log(`⚠️ Services needing fields: ${servicesNeedingFields.length}`);

    // Show breakdown by category
    console.log('\n📋 Services currently WITH dynamic fields:');
    servicesWithFields.forEach(service => {
      console.log(`  - ${service.name} (${service.fieldCount} fields) - ${service.category}`);
    });

    console.log('\n🔧 Services that SHOULD HAVE dynamic fields:');
    const groupedByTemplate = {};
    servicesNeedingFields.forEach(service => {
      if (!groupedByTemplate[service.template]) {
        groupedByTemplate[service.template] = [];
      }
      groupedByTemplate[service.template].push(service);
    });

    for (const [template, services] of Object.entries(groupedByTemplate)) {
      console.log(`\n📌 ${template.toUpperCase()} (${services.length} services):`);
      services.forEach(service => {
        console.log(`  - ${service.name} (${service.category})`);
      });
    }

    // Ask if we should create fields for these services
    console.log(`\n🚀 Ready to create dynamic fields for ${servicesNeedingFields.length} services?`);
    console.log('This will add appropriate field definitions based on service patterns.');

    // For now, let's create fields for a subset to test
    const servicesToProcess = servicesNeedingFields.slice(0, 5); // Process first 5
    
    console.log(`\n🔧 Creating fields for first ${servicesToProcess.length} services...\n`);

    for (const service of servicesToProcess) {
      const template = COMMON_FIELD_TEMPLATES[service.template];
      if (!template) continue;

      console.log(`📝 Creating fields for: ${service.name}`);
      
      for (const fieldDef of template) {
        try {
          await prisma.serviceFieldDefinition.create({
            data: {
              service_item_id: service.id,
              fieldName: fieldDef.fieldName,
              fieldLabel: fieldDef.fieldLabel,
              fieldType: fieldDef.fieldType,
              isRequired: fieldDef.isRequired,
              placeholder: fieldDef.placeholder,
              options: fieldDef.options || null,
              sortOrder: fieldDef.sortOrder
            }
          });
          console.log(`  ✅ ${fieldDef.fieldLabel} (${fieldDef.fieldType})`);
        } catch (error) {
          console.log(`  ❌ Failed to create ${fieldDef.fieldLabel}: ${error.message}`);
        }
      }
      console.log('');
    }

    console.log('✅ Field creation completed!');
    console.log(`\n📊 Summary:`);
    console.log(`  - Services analyzed: ${allServices.length}`);
    console.log(`  - Services with existing fields: ${servicesWithFields.length}`);
    console.log(`  - Services identified for fields: ${servicesNeedingFields.length}`);
    console.log(`  - Services processed in this run: ${servicesToProcess.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

identifyAndCreateFields();