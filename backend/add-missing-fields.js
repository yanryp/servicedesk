const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingFields() {
  try {
    console.log('=== ADDING MISSING FIELDS TO OLIBs - Pendaftaran User Baru ===\n');
    
    const serviceItem = await prisma.serviceItem.findFirst({
      where: { name: 'OLIBs - Pendaftaran User Baru' }
    });
    
    if (!serviceItem) {
      console.log('Service not found');
      return;
    }
    
    const missingFields = [
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
    ];
    
    for (const field of missingFields) {
      const created = await prisma.serviceFieldDefinition.create({
        data: {
          service_item_id: serviceItem.id,
          ...field
        }
      });
      console.log(`✓ Added field: ${field.fieldLabel}`);
    }
    
    // Verify total fields
    const count = await prisma.serviceFieldDefinition.count({
      where: { service_item_id: serviceItem.id }
    });
    
    console.log(`\nTotal fields for OLIBs - Pendaftaran User Baru: ${count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingFields();