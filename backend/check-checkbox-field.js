#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFields() {
  try {
    // Check if checkbox field exists
    const checkboxField = await prisma.serviceFieldDefinition.findFirst({
      where: { fieldType: 'checkbox' }
    });
    
    console.log('Checkbox field exists:', Boolean(checkboxField));
    
    if (!checkboxField) {
      console.log('\n❌ No checkbox field found! Need to create it.');
      
      // Find the service item first
      const olibsService = await prisma.serviceItem.findFirst({
        where: { name: 'OLIBs - Pendaftaran User Baru' }
      });
      
      if (olibsService) {
        console.log('\n✅ Found service:', olibsService.name);
        console.log('Creating checkbox field...');
        
        // Create the checkbox field with proper options
        const newField = await prisma.serviceFieldDefinition.create({
          data: {
            service_item_id: olibsService.id,
            fieldName: 'modul_yang_diakses',
            fieldLabel: 'Modul yang Diakses',
            fieldType: 'checkbox',
            isRequired: true,
            placeholder: 'Pilih modul yang perlu diakses',
            sortOrder: 6,
            options: [
              { value: 'tabungan', label: 'Tabungan', sortOrder: 1 },
              { value: 'deposito', label: 'Deposito', sortOrder: 2 },
              { value: 'kredit', label: 'Kredit', sortOrder: 3 },
              { value: 'giro', label: 'Giro', sortOrder: 4 },
              { value: 'report', label: 'Report/Laporan', sortOrder: 5 }
            ]
          }
        });
        
        console.log('✅ Created checkbox field:', newField.fieldLabel);
      }
    } else {
      console.log('Field name:', checkboxField.fieldName);
      console.log('Field label:', checkboxField.fieldLabel);
      console.log('Options:', checkboxField.options);
      
      // Update if options are null
      if (!checkboxField.options) {
        console.log('\n⚠️ Options are null, updating...');
        
        await prisma.serviceFieldDefinition.update({
          where: { id: checkboxField.id },
          data: {
            options: [
              { value: 'tabungan', label: 'Tabungan', sortOrder: 1 },
              { value: 'deposito', label: 'Deposito', sortOrder: 2 },
              { value: 'kredit', label: 'Kredit', sortOrder: 3 },
              { value: 'giro', label: 'Giro', sortOrder: 4 },
              { value: 'report', label: 'Report/Laporan', sortOrder: 5 }
            ]
          }
        });
        
        console.log('✅ Updated checkbox field with options');
      }
    }
    
    // Verify all fields for both services
    console.log('\n📋 Verifying all dynamic fields...\n');
    
    const services = [
      'OLIBs - Pendaftaran User Baru',
      'ATM-Permasalahan Teknis'
    ];
    
    for (const serviceName of services) {
      const service = await prisma.serviceItem.findFirst({
        where: { name: serviceName },
        include: {
          service_field_definitions: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      });
      
      if (service && service.service_field_definitions.length > 0) {
        console.log(`\n📌 ${service.name}:`);
        console.log(`   Total fields: ${service.service_field_definitions.length}`);
        
        service.service_field_definitions.forEach(field => {
          console.log(`   - ${field.fieldLabel} (${field.fieldType}): ${field.options ? 'has options' : 'no options'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();