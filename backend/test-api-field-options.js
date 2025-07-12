#!/usr/bin/env node

/**
 * Test API Field Options
 * Check if the API is properly returning field options
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPIResponse() {
  try {
    console.log('🔍 Testing API field options response...\n');

    // Get the service item with fields
    const service = await prisma.serviceItem.findFirst({
      where: { name: 'OLIBs - Pendaftaran User Baru' },
      include: {
        service_field_definitions: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!service) {
      console.log('❌ Service not found');
      return;
    }

    console.log(`📌 Service: ${service.name}`);
    console.log(`   Total fields: ${service.service_field_definitions.length}\n`);

    // Check each field
    service.service_field_definitions.forEach(field => {
      console.log(`Field: ${field.fieldLabel}`);
      console.log(`  Type: ${field.fieldType}`);
      console.log(`  Options in DB: ${field.options ? JSON.stringify(field.options) : 'null'}`);
      
      // Simulate API transformation
      const apiField = {
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        type: field.fieldType,
        required: field.isRequired,
        description: null,
        placeholder: field.placeholder,
        helpText: null,
        originalFieldType: field.fieldType,
        isDropdownField: field.fieldType.includes('dropdown'),
        options: field.options || [] // This is what the API should return
      };
      
      console.log(`  Options in API: ${JSON.stringify(apiField.options)}`);
      console.log('');
    });

    // Now check the actual API endpoint logic
    console.log('\n📋 Checking serviceCatalogRoutes.ts logic...');
    console.log('The API should include: options: field.options || []');
    console.log('This ensures checkbox and radio fields get their options passed through.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIResponse();