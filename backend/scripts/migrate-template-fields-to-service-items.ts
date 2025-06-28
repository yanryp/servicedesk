#!/usr/bin/env npx ts-node

/**
 * Migrate Template Fields to Service Items
 * 
 * This script copies ServiceFieldDefinitions from ServiceTemplates to their parent ServiceItems.
 * This enables the simplified workflow where ServiceItems are directly selectable with their own custom fields,
 * deprecating the ServiceTemplate layer.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Migrating ServiceFieldDefinitions from ServiceTemplates to ServiceItems...\n');

  try {
    // Step 1: Get all ServiceTemplates with their custom fields
    const templatesWithFields = await prisma.serviceTemplate.findMany({
      include: {
        customFieldDefinitions: true,
        serviceItem: true
      },
      where: {
        customFieldDefinitions: {
          some: {} // Only templates that have custom fields
        }
      }
    });

    console.log(`📊 Found ${templatesWithFields.length} templates with custom fields\n`);

    let totalFieldsMigrated = 0;
    const serviceItemFieldsMap = new Map<number, Set<string>>();

    // Step 2: Process each template and copy its fields to the parent ServiceItem
    for (const template of templatesWithFields) {
      const serviceItemId = template.serviceItemId;
      
      if (!serviceItemFieldsMap.has(serviceItemId)) {
        serviceItemFieldsMap.set(serviceItemId, new Set());
      }
      
      const existingFields = serviceItemFieldsMap.get(serviceItemId)!;

      console.log(`🔄 Processing template: ${template.name}`);
      console.log(`   Service Item: ${template.serviceItem.name} (ID: ${serviceItemId})`);
      console.log(`   Fields to migrate: ${template.customFieldDefinitions.length}`);

      // Copy each field definition to the ServiceItem (avoid duplicates)
      for (const field of template.customFieldDefinitions) {
        const fieldKey = `${field.fieldName}_${field.fieldType}`;
        
        if (existingFields.has(fieldKey)) {
          console.log(`   ⚠️  Skipping duplicate field: ${field.fieldName}`);
          continue;
        }

        try {
          await prisma.serviceFieldDefinition.create({
            data: {
              serviceItemId: serviceItemId,
              fieldName: field.fieldName,
              fieldLabel: field.fieldLabel,
              fieldType: field.fieldType,
              options: field.options || undefined,
              isRequired: field.isRequired,
              isKasdaSpecific: field.isKasdaSpecific,
              placeholder: field.placeholder,
              defaultValue: field.defaultValue,
              validationRules: field.validationRules || undefined,
              sortOrder: field.sortOrder,
              isVisible: field.isVisible
            }
          });

          existingFields.add(fieldKey);
          totalFieldsMigrated++;
          console.log(`   ✅ Migrated field: ${field.fieldName} (${field.fieldType})`);
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`   ⚠️  Field already exists: ${field.fieldName}`);
          } else {
            console.error(`   ❌ Failed to migrate field ${field.fieldName}:`, error.message);
          }
        }
      }
      console.log('');
    }

    // Step 3: Generate summary
    console.log('📊 Migration Summary:');
    console.log(`   Total fields migrated: ${totalFieldsMigrated}`);
    console.log(`   Service items with fields: ${serviceItemFieldsMap.size}`);

    // Step 4: Verify migration
    const serviceItemsWithFields = await prisma.serviceItem.findMany({
      include: {
        customFieldDefinitions: true
      },
      where: {
        customFieldDefinitions: {
          some: {}
        }
      }
    });

    console.log('\n✅ Verification:');
    serviceItemsWithFields.forEach(item => {
      console.log(`   📋 ${item.name}: ${item.customFieldDefinitions.length} fields`);
    });

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update admin interface to show ServiceItems with their custom fields');
    console.log('   2. Update ServiceCatalogV2Page to use ServiceItems directly');
    console.log('   3. Gradually deprecate ServiceTemplate usage');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { main as migrateFieldsToServiceItems };