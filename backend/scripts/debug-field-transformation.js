#!/usr/bin/env node

/**
 * Debug Field Transformation
 * 
 * This script examines the exact field data being retrieved
 * to understand why dropdown fields aren't being detected.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugFieldTransformation() {
  console.log('🔍 Debugging Field Transformation...\n');

  try {
    // Get the "Mutasi User Pegawai" template (ID 2)
    console.log('1️⃣ Raw Template Data:');
    const template = await prisma.bSGTemplate.findUnique({
      where: { id: 2 },
      include: {
        category: true,
        fields: {
          include: {
            fieldType: true,
            options: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    console.log(`Template: ${template.name}`);
    console.log(`Category: ${template.category.name}\n`);

    console.log('2️⃣ Field-by-Field Analysis:');
    template.fields.forEach((field, index) => {
      console.log(`Field ${index + 1}: ${field.fieldLabel}`);
      console.log(`  - fieldName: ${field.fieldName}`);
      console.log(`  - fieldType.name: ${field.fieldType.name}`);
      console.log(`  - fieldType.displayName: ${field.fieldType.displayName}`);
      console.log(`  - fieldType.htmlInputType: ${field.fieldType.htmlInputType}`);
      console.log(`  - isRequired: ${field.isRequired}`);
      console.log(`  - options: ${field.options.length} options`);
      
      // Show transformation result
      const transformedType = field.fieldType.htmlInputType || field.fieldType.name;
      console.log(`  - TRANSFORMED TYPE: ${transformedType}`);
      
      // Check if it should be a dropdown
      const isDropdownType = field.fieldType.name.startsWith('dropdown_');
      const hasSelectHTML = field.fieldType.htmlInputType === 'select';
      console.log(`  - isDropdownType: ${isDropdownType}`);
      console.log(`  - hasSelectHTML: ${hasSelectHTML}`);
      console.log('');
    });

    // Test the specific field transformation logic used in service catalog
    console.log('3️⃣ Service Catalog Transformation Test:');
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
      // Add debug info
      debug: {
        originalFieldType: field.fieldType.name,
        htmlInputType: field.fieldType.htmlInputType
      }
    }));

    console.log('Transformed fields:');
    transformedFields.forEach(field => {
      console.log(`- ${field.label}: ${field.type} (original: ${field.debug.originalFieldType})`);
    });

    // Check for dropdown fields using different detection methods
    console.log('\n4️⃣ Dropdown Detection Methods:');
    
    const method1 = transformedFields.filter(field => field.type === 'select');
    const method2 = transformedFields.filter(field => field.debug.originalFieldType.startsWith('dropdown_'));
    const method3 = transformedFields.filter(field => field.type.startsWith('dropdown_'));
    
    console.log(`Method 1 (type === 'select'): ${method1.length} fields`);
    console.log(`Method 2 (originalFieldType.startsWith('dropdown_')): ${method2.length} fields`);
    console.log(`Method 3 (type.startsWith('dropdown_')): ${method3.length} fields`);

    method2.forEach(field => {
      console.log(`  - ${field.label} (${field.debug.originalFieldType})`);
    });

  } catch (error) {
    console.error('❌ Error debugging field transformation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugFieldTransformation()
  .then(() => {
    console.log('\n✅ Field transformation debug completed');
  })
  .catch((error) => {
    console.error('❌ Field transformation debug failed:', error);
    process.exit(1);
  });