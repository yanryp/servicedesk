#!/usr/bin/env node

/**
 * Check Current Database State - BSG Template System
 * 
 * This script queries the database to understand what BSG template data
 * currently exists without requiring any seed scripts.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 Checking current database state...\n');

  try {
    // Check BSG Template Categories
    console.log('📂 BSG Template Categories:');
    const categories = await prisma.bSGTemplateCategory.findMany({
      include: {
        _count: {
          select: {
            templates: true
          }
        }
      }
    });
    
    if (categories.length === 0) {
      console.log('  ❌ No BSG template categories found');
    } else {
      categories.forEach(cat => {
        console.log(`  ✅ ${cat.name} (${cat.displayName}) - ${cat._count.templates} templates`);
      });
    }

    // Check BSG Templates
    console.log('\n📋 BSG Templates:');
    const templates = await prisma.bSGTemplate.findMany({
      include: {
        category: true,
        _count: {
          select: {
            fields: true
          }
        }
      },
      take: 10 // Show first 10
    });

    if (templates.length === 0) {
      console.log('  ❌ No BSG templates found');
    } else {
      console.log(`  ✅ Found ${templates.length} templates (showing first 10):`);
      templates.forEach(tmpl => {
        console.log(`    - ${tmpl.name} (${tmpl.category.name}) - ${tmpl._count.fields} fields`);
      });
    }

    // Check BSG Template Fields
    console.log('\n📝 BSG Template Fields:');
    const fieldsCount = await prisma.bSGTemplateField.count();
    if (fieldsCount === 0) {
      console.log('  ❌ No BSG template fields found');
    } else {
      console.log(`  ✅ Found ${fieldsCount} template fields`);
      
      // Sample fields
      const sampleFields = await prisma.bSGTemplateField.findMany({
        include: {
          template: {
            select: { name: true }
          },
          fieldType: true,
          options: true
        },
        take: 5
      });

      sampleFields.forEach(field => {
        console.log(`    - ${field.fieldLabel} (${field.fieldType.name}) in ${field.template.name}`);
      });
    }

    // Check BSG Master Data
    console.log('\n🗂️  BSG Master Data:');
    const masterDataCount = await prisma.bSGMasterData.count();
    if (masterDataCount === 0) {
      console.log('  ❌ No BSG master data found');
    } else {
      console.log(`  ✅ Found ${masterDataCount} master data entries`);
      
      // Check data types
      const dataTypes = await prisma.bSGMasterData.groupBy({
        by: ['dataType'],
        _count: true
      });

      dataTypes.forEach(type => {
        console.log(`    - ${type.dataType}: ${type._count} entries`);
      });
    }

    // Check Generic Master Data Entity
    console.log('\n🗃️  Generic Master Data:');
    const genericMasterCount = await prisma.masterDataEntity.count();
    if (genericMasterCount === 0) {
      console.log('  ❌ No generic master data found');
    } else {
      console.log(`  ✅ Found ${genericMasterCount} generic master data entries`);
      
      // Check types
      const genericTypes = await prisma.masterDataEntity.groupBy({
        by: ['type'],
        _count: true
      });

      genericTypes.forEach(type => {
        console.log(`    - ${type.type}: ${type._count} entries`);
      });
    }

    // Check Field Types
    console.log('\n🏷️  BSG Field Types:');
    const fieldTypes = await prisma.bSGFieldType.findMany();
    if (fieldTypes.length === 0) {
      console.log('  ❌ No BSG field types found');
    } else {
      console.log(`  ✅ Found ${fieldTypes.length} field types:`);
      fieldTypes.forEach(ft => {
        console.log(`    - ${ft.name}: ${ft.displayName} (${ft.htmlInputType})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabaseState()
  .then(() => {
    console.log('\n✅ Database state check completed');
  })
  .catch((error) => {
    console.error('❌ Database check failed:', error);
    process.exit(1);
  });