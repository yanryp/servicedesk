#!/usr/bin/env node

/**
 * Check Templates with Dropdown Fields
 * 
 * This script finds templates that have proper dropdown_branch fields
 * to understand the correct field structure.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDropdownTemplates() {
  console.log('🔍 Checking Templates with Dropdown Fields...\n');

  try {
    // Find dropdown_branch field type
    const dropdownBranchType = await prisma.bSGFieldType.findFirst({
      where: { name: 'dropdown_branch' }
    });

    if (!dropdownBranchType) {
      console.log('❌ No dropdown_branch field type found');
      return;
    }

    console.log(`✅ Found dropdown_branch field type: ${dropdownBranchType.displayName}`);
    console.log(`   HTML Input Type: ${dropdownBranchType.htmlInputType}\n`);

    // Find all templates that have dropdown_branch fields
    const templatesWithDropdowns = await prisma.bSGTemplate.findMany({
      where: {
        fields: {
          some: {
            fieldTypeId: dropdownBranchType.id
          }
        }
      },
      include: {
        category: true,
        fields: {
          where: {
            fieldTypeId: dropdownBranchType.id
          },
          include: {
            fieldType: true
          }
        }
      }
    });

    console.log(`✅ Found ${templatesWithDropdowns.length} templates with dropdown_branch fields:\n`);

    templatesWithDropdowns.forEach((template, index) => {
      console.log(`${index + 1}. ${template.displayName || template.name} (ID: ${template.id})`);
      console.log(`   Category: ${template.category.displayName}`);
      console.log(`   Dropdown fields:`);
      
      template.fields.forEach(field => {
        console.log(`   - ${field.fieldLabel} (${field.fieldName})`);
        console.log(`     Type: ${field.fieldType.name} → ${field.fieldType.htmlInputType}`);
      });
      console.log('');
    });

    // Test transformation on a template with dropdown fields
    if (templatesWithDropdowns.length > 0) {
      console.log('🧪 Testing Field Transformation on Template with Dropdowns:');
      const testTemplate = templatesWithDropdowns[0];
      
      // Get full template data
      const fullTemplate = await prisma.bSGTemplate.findUnique({
        where: { id: testTemplate.id },
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

      console.log(`\nTemplate: ${fullTemplate.displayName} (ID: ${fullTemplate.id})`);
      console.log('All fields:');

      const transformedFields = fullTemplate.fields.map(field => ({
        id: field.id,
        name: field.fieldName,
        label: field.fieldLabel,
        type: field.fieldType.htmlInputType || field.fieldType.name,
        required: field.isRequired,
        originalFieldType: field.fieldType.name,
        htmlInputType: field.fieldType.htmlInputType
      }));

      transformedFields.forEach(field => {
        const marker = field.originalFieldType.startsWith('dropdown_') ? '🔽' : '  ';
        console.log(`${marker} ${field.label}: ${field.type} (original: ${field.originalFieldType})`);
      });

      // Test dropdown detection
      const dropdownFields = transformedFields.filter(field => 
        field.originalFieldType.startsWith('dropdown_') || field.type === 'select'
      );

      console.log(`\n✅ Detected ${dropdownFields.length} dropdown fields:`);
      dropdownFields.forEach(field => {
        const dataType = field.originalFieldType.replace('dropdown_', '');
        console.log(`   - ${field.label}: needs '${dataType}' master data`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking dropdown templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDropdownTemplates()
  .then(() => {
    console.log('\n✅ Dropdown template check completed');
  })
  .catch((error) => {
    console.error('❌ Dropdown template check failed:', error);
    process.exit(1);
  });