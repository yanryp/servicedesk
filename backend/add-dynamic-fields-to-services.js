const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addDynamicFieldsToServices() {
  try {
    console.log('=== ADDING DYNAMIC FIELDS TO SERVICES ===\n');

    // Define field templates for specific services
    const serviceFieldTemplates = {
      'OLIBs - Pendaftaran User Baru': [
        {
          fieldName: 'nama_lengkap',
          fieldLabel: 'Nama Lengkap',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan nama lengkap pengguna',
          sortOrder: 1
        },
        {
          fieldName: 'nip',
          fieldLabel: 'NIP (Nomor Induk Pegawai)',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan NIP',
          sortOrder: 2
        },
        {
          fieldName: 'jabatan',
          fieldLabel: 'Jabatan',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan jabatan',
          sortOrder: 3
        },
        {
          fieldName: 'unit_kerja',
          fieldLabel: 'Unit Kerja',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan unit kerja',
          sortOrder: 4
        },
        {
          fieldName: 'jenis_akses',
          fieldLabel: 'Jenis Akses yang Diperlukan',
          fieldType: 'dropdown',
          isRequired: true,
          options: JSON.stringify([
            { value: 'operator', label: 'Operator' },
            { value: 'supervisor', label: 'Supervisor' },
            { value: 'admin', label: 'Administrator' }
          ]),
          sortOrder: 5
        },
        {
          fieldName: 'modul_akses',
          fieldLabel: 'Modul yang Diakses',
          fieldType: 'checkbox',
          isRequired: true,
          options: JSON.stringify([
            { value: 'deposito', label: 'Deposito' },
            { value: 'tabungan', label: 'Tabungan' },
            { value: 'kredit', label: 'Kredit' },
            { value: 'giro', label: 'Giro' },
            { value: 'laporan', label: 'Laporan' }
          ]),
          sortOrder: 6
        }
      ],
      'ATM-Permasalahan Teknis': [
        {
          fieldName: 'lokasi_atm',
          fieldLabel: 'Lokasi ATM',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan lokasi ATM',
          sortOrder: 1
        },
        {
          fieldName: 'terminal_id',
          fieldLabel: 'Terminal ID',
          fieldType: 'text',
          isRequired: true,
          placeholder: 'Masukkan Terminal ID',
          sortOrder: 2
        },
        {
          fieldName: 'jenis_masalah',
          fieldLabel: 'Jenis Masalah',
          fieldType: 'dropdown',
          isRequired: true,
          options: JSON.stringify([
            { value: 'offline', label: 'ATM Offline' },
            { value: 'kertas_habis', label: 'Kertas Struk Habis' },
            { value: 'uang_habis', label: 'Uang Habis' },
            { value: 'kartu_tertelan', label: 'Kartu Tertelan' },
            { value: 'error_transaksi', label: 'Error Transaksi' },
            { value: 'lainnya', label: 'Lainnya' }
          ]),
          sortOrder: 3
        },
        {
          fieldName: 'deskripsi_masalah',
          fieldLabel: 'Deskripsi Detail Masalah',
          fieldType: 'textarea',
          isRequired: true,
          placeholder: 'Jelaskan masalah secara detail',
          sortOrder: 4
        },
        {
          fieldName: 'waktu_kejadian',
          fieldLabel: 'Waktu Kejadian',
          fieldType: 'datetime',
          isRequired: true,
          sortOrder: 5
        },
        {
          fieldName: 'dampak_layanan',
          fieldLabel: 'Dampak terhadap Layanan',
          fieldType: 'radio',
          isRequired: true,
          options: JSON.stringify([
            { value: 'kritis', label: 'Kritis - ATM tidak bisa digunakan' },
            { value: 'sedang', label: 'Sedang - Beberapa fitur tidak berfungsi' },
            { value: 'rendah', label: 'Rendah - Minor issue' }
          ]),
          sortOrder: 6
        }
      ]
    };

    // Process each service
    for (const [serviceName, fields] of Object.entries(serviceFieldTemplates)) {
      console.log(`\nProcessing: ${serviceName}`);
      
      // Find the service item
      const serviceItem = await prisma.serviceItem.findFirst({
        where: {
          name: serviceName
        }
      });
      
      if (!serviceItem) {
        console.log(`  ✗ Service not found: ${serviceName}`);
        continue;
      }
      
      console.log(`  ✓ Found service item ID: ${serviceItem.id}`);
      
      // Check if fields already exist
      const existingFields = await prisma.serviceFieldDefinition.count({
        where: {
          service_item_id: serviceItem.id
        }
      });
      
      if (existingFields > 0) {
        console.log(`  ! Service already has ${existingFields} fields, skipping...`);
        continue;
      }
      
      // Add fields
      for (const field of fields) {
        const created = await prisma.serviceFieldDefinition.create({
          data: {
            service_item_id: serviceItem.id,
            ...field
          }
        });
        console.log(`  + Added field: ${field.fieldLabel}`);
      }
      
      console.log(`  ✓ Added ${fields.length} fields to ${serviceName}`);
    }
    
    // Add fields to more services if needed
    console.log('\n=== ADDING GENERIC FIELDS TO OTHER SERVICES ===');
    
    // Generic field template for services without fields
    const genericFields = [
      {
        fieldName: 'deskripsi_detail',
        fieldLabel: 'Deskripsi Detail',
        fieldType: 'textarea',
        isRequired: true,
        placeholder: 'Jelaskan permintaan atau masalah Anda secara detail',
        sortOrder: 1
      },
      {
        fieldName: 'prioritas',
        fieldLabel: 'Tingkat Prioritas',
        fieldType: 'select',
        isRequired: true,
        options: JSON.stringify([
          { value: 'rendah', label: 'Rendah' },
          { value: 'sedang', label: 'Sedang' },
          { value: 'tinggi', label: 'Tinggi' },
          { value: 'kritis', label: 'Kritis' }
        ]),
        sortOrder: 2
      }
    ];
    
    // Add generic fields to other ATM and OLIBs services
    const servicesNeedingFields = await prisma.serviceItem.findMany({
      where: {
        OR: [
          { name: { contains: 'ATM' } },
          { name: { contains: 'OLIBs' } }
        ],
        service_field_definitions: {
          none: {}
        }
      }
    });
    
    console.log(`\nFound ${servicesNeedingFields.length} services without fields`);
    
    // Show summary
    console.log('\n=== SUMMARY ===');
    const finalCount = await prisma.serviceItem.findMany({
      where: {
        OR: [
          { name: { contains: 'ATM' } },
          { name: { contains: 'OLIBs' } }
        ]
      },
      include: {
        _count: {
          select: {
            service_field_definitions: true
          }
        }
      }
    });
    
    console.log('\nServices with fields:');
    finalCount.forEach(item => {
      if (item._count.service_field_definitions > 0) {
        console.log(`  ✓ ${item.name}: ${item._count.service_field_definitions} fields`);
      }
    });
    
    console.log('\nServices still without fields:');
    finalCount.forEach(item => {
      if (item._count.service_field_definitions === 0) {
        console.log(`  ✗ ${item.name}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDynamicFieldsToServices();