#!/usr/bin/env node

/**
 * Test Fixed Field Transformation
 * 
 * This script tests the updated field transformation logic
 * to verify dropdown fields are properly detected.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFixedTransformation() {
  console.log('🧪 Testing Fixed Field Transformation...\n');

  try {
    // Test with template ID 3 (Pendaftaran User Baru) which has dropdown fields
    console.log('Testing with "Pendaftaran User Baru" template (ID: 3)');
    
    const template = await prisma.bSGTemplate.findUnique({
      where: { id: 3 },
      include: {
        category: {
          select: {
            name: true,
            displayName: true,
            description: true
          }
        },
        fields: {
          include: {
            fieldType: {
              select: {
                name: true,
                displayName: true,
                htmlInputType: true,
                validationPattern: true
              }
            },
            options: {
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log(`\n✅ Template: ${template.displayName}`);
    console.log(`   Category: ${template.category.displayName}\n`);

    // Apply the NEW transformation logic
    const transformedFields = template.fields.map(field => ({
      id: field.id,
      name: field.fieldName,
      label: field.fieldLabel,
      type: field.fieldType.htmlInputType || field.fieldType.name,
      required: field.isRequired,
      description: field.fieldDescription,
      placeholder: field.placeholderText,
      helpText: field.helpText,
      maxLength: field.maxLength,
      validationRules: field.validationRules,
      options: field.options.map(opt => ({
        value: opt.optionValue,
        label: opt.optionLabel,
        isDefault: opt.isDefault
      })),
      // NEW: Preserve original field type information for frontend
      originalFieldType: field.fieldType.name,
      isDropdownField: field.fieldType.name.startsWith('dropdown_'),
      masterDataType: field.fieldType.name.startsWith('dropdown_') 
        ? field.fieldType.name.replace('dropdown_', '') 
        : null
    }));

    console.log('🔄 Service Catalog Transformation Result:');
    transformedFields.forEach(field => {
      const dropdownMarker = field.isDropdownField ? '🔽' : '  ';
      console.log(`${dropdownMarker} ${field.label}:`);
      console.log(`     type: ${field.type}`);
      console.log(`     originalFieldType: ${field.originalFieldType}`);
      console.log(`     isDropdownField: ${field.isDropdownField}`);
      console.log(`     masterDataType: ${field.masterDataType}`);
      console.log('');
    });

    // Test the frontend transformation (BSGTemplateField)
    console.log('🔄 Frontend BSGTemplateField Transformation:');
    const bsgFields = transformedFields.map(field => ({
      id: field.id,
      fieldName: field.name,
      fieldLabel: field.label,
      // Use original field type if available for proper dropdown detection
      fieldType: field.originalFieldType || field.type,
      isRequired: field.required,
      description: field.description,
      placeholderText: field.placeholder,
      helpText: field.helpText,
      maxLength: field.maxLength,
      validationRules: field.validationRules,
      sortOrder: field.id,
      options: field.options || [],
      category: field.isDropdownField ? 'location' : 'reference'
    }));

    bsgFields.forEach(field => {
      const dropdownMarker = field.fieldType.startsWith('dropdown_') ? '🔽' : '  ';
      console.log(`${dropdownMarker} ${field.fieldLabel}:`);
      console.log(`     fieldType: ${field.fieldType}`);
      console.log(`     category: ${field.category}`);
      console.log('');
    });

    // Test dropdown detection
    const dropdownFields = bsgFields.filter(field => 
      field.fieldType.startsWith('dropdown_')
    );

    console.log(`✅ Dropdown Detection Result: ${dropdownFields.length} fields detected`);
    dropdownFields.forEach(field => {
      const dataType = field.fieldType.replace('dropdown_', '');
      console.log(`   - ${field.fieldLabel}: needs '${dataType}' master data`);
    });

    // Test master data endpoint for detected dropdown fields
    if (dropdownFields.length > 0) {
      console.log('\n🌐 Testing Master Data Endpoint:');
      for (const field of dropdownFields) {
        const dataType = field.fieldType.replace('dropdown_', '');
        console.log(`   Testing /api/bsg-templates/master-data/${dataType}`);
        
        // Simulate the endpoint logic (without HTTP call)
        // Check BSGMasterData
        const bsgMasterData = await prisma.bSGMasterData.findMany({
          where: {
            dataType: dataType,
            isActive: true
          },
          take: 3
        });

        if (bsgMasterData.length === 0) {
          console.log(`     → No BSGMasterData found, using default ${dataType} data`);
          if (dataType === 'branch') {
            console.log(`     → Would return 6 default branch options`);
          }
        } else {
          console.log(`     → Found ${bsgMasterData.length} BSGMasterData entries`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error testing fixed transformation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testFixedTransformation()
  .then(() => {
    console.log('\n✅ Fixed transformation test completed');
  })
  .catch((error) => {
    console.error('❌ Fixed transformation test failed:', error);
    process.exit(1);
  });