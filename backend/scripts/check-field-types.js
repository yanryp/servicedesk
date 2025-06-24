#!/usr/bin/env node

/**
 * Check Field Types and Mapping
 * 
 * This script examines the field types in the database to understand
 * why dropdown fields aren't being detected properly.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFieldTypes() {
  console.log('🔍 Checking Field Types and Mapping...\n');

  try {
    // Check all BSG field types
    console.log('1️⃣ All BSG Field Types:');
    const fieldTypes = await prisma.bSGFieldType.findMany({
      orderBy: { name: 'asc' }
    });

    fieldTypes.forEach(ft => {
      console.log(`   - ${ft.name}: "${ft.displayName}" → ${ft.htmlInputType}`);
    });

    // Check fields that should be dropdowns
    console.log('\n2️⃣ Fields that should be dropdowns:');
    const fieldsWithCabang = await prisma.bSGTemplateField.findMany({
      where: {
        OR: [
          { fieldLabel: { contains: 'Cabang', mode: 'insensitive' } },
          { fieldLabel: { contains: 'Capem', mode: 'insensitive' } },
          { fieldDescription: { contains: 'Cabang', mode: 'insensitive' } }
        ]
      },
      include: {
        fieldType: true,
        template: {
          select: { name: true }
        }
      },
      take: 10
    });

    fieldsWithCabang.forEach(field => {
      console.log(`   - "${field.fieldLabel}" in ${field.template.name}`);
      console.log(`     Type: ${field.fieldType.name} (${field.fieldType.displayName})`);
      console.log(`     HTML: ${field.fieldType.htmlInputType}`);
      console.log(`     Description: ${field.fieldDescription}`);
      console.log('');
    });

    // Check if any fields have the dropdown_branch type
    console.log('3️⃣ Fields with dropdown_branch type:');
    const dropdownBranchType = await prisma.bSGFieldType.findFirst({
      where: { name: 'dropdown_branch' }
    });

    if (dropdownBranchType) {
      const dropdownBranchFields = await prisma.bSGTemplateField.findMany({
        where: { fieldTypeId: dropdownBranchType.id },
        include: {
          template: {
            select: { name: true }
          }
        }
      });

      console.log(`   ✅ Found ${dropdownBranchFields.length} fields with dropdown_branch type:`);
      dropdownBranchFields.forEach(field => {
        console.log(`   - ${field.fieldLabel} in ${field.template.name}`);
      });
    } else {
      console.log('   ❌ No dropdown_branch field type found');
    }

    // Check for OLIBS menu fields
    console.log('\n4️⃣ OLIBS Menu Fields:');
    const olibsMenuFields = await prisma.bSGTemplateField.findMany({
      where: {
        OR: [
          { fieldLabel: { contains: 'OLIBS', mode: 'insensitive' } },
          { fieldLabel: { contains: 'Menu', mode: 'insensitive' } },
          { fieldDescription: { contains: 'menu', mode: 'insensitive' } }
        ]
      },
      include: {
        fieldType: true,
        template: {
          select: { name: true }
        }
      }
    });

    olibsMenuFields.forEach(field => {
      console.log(`   - "${field.fieldLabel}" in ${field.template.name}`);
      console.log(`     Type: ${field.fieldType.name}`);
      console.log(`     Description: ${field.fieldDescription}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking field types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkFieldTypes()
  .then(() => {
    console.log('✅ Field type check completed');
  })
  .catch((error) => {
    console.error('❌ Field type check failed:', error);
    process.exit(1);
  });