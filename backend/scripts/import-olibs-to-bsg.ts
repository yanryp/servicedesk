#!/usr/bin/env npx ts-node

/**
 * Import OLIBS Templates to BSG System
 * 
 * Simple script to import just the OLIBS templates to the BSG system
 * so they show up in the service catalog UI.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('📥 Importing OLIBS Templates to BSG System...\n');

  try {
    // Read the template mapping
    const mappingPath = path.join(__dirname, '../template-mapping.json');
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

    // Create/update OLIBS category
    const olibsCategory = await prisma.bSGTemplateCategory.upsert({
      where: { name: 'OLIBS' },
      update: { 
        displayName: 'OLIBS System',
        description: 'Online Banking System (OLIBS) templates and services'
      },
      create: {
        name: 'OLIBS',
        displayName: 'OLIBS System', 
        description: 'Online Banking System (OLIBS) templates and services',
        isActive: true,
        sortOrder: 1
      }
    });

    console.log(`✅ OLIBS Category: ${olibsCategory.displayName} (ID: ${olibsCategory.id})`);

    // Get OLIBS templates from mapping
    const olibsTemplates = mapping.dynamicTemplates.filter((t: any) => t.application === 'OLIBS');
    console.log(`\n📋 Found ${olibsTemplates.length} OLIBS templates to import\n`);

    // Import OLIBS templates
    for (let i = 0; i < olibsTemplates.length; i++) {
      const template = olibsTemplates[i];
      
      const bsgTemplate = await prisma.bSGTemplate.upsert({
        where: {
          categoryId_templateNumber: {
            categoryId: olibsCategory.id,
            templateNumber: parseInt(template.templateNumber) || i + 1
          }
        },
        update: {
          name: template.serviceType,
          displayName: template.serviceType,
          description: `OLIBS - ${template.serviceType}`
        },
        create: {
          name: template.serviceType,
          displayName: template.serviceType,
          description: `OLIBS - ${template.serviceType}`,
          categoryId: olibsCategory.id,
          templateNumber: parseInt(template.templateNumber) || i + 1,
          isActive: true
        }
      });

      // Import template fields (simplified - all as text fields for now)
      for (let j = 0; j < template.fields.length; j++) {
        const field = template.fields[j];
        
        await prisma.bSGTemplateField.upsert({
          where: {
            templateId_fieldName: {
              templateId: bsgTemplate.id,
              fieldName: field.name
            }
          },
          update: {
            fieldLabel: field.name,
            isRequired: field.isRequired
          },
          create: {
            templateId: bsgTemplate.id,
            fieldTypeId: 1, // Default to text field type
            fieldName: field.name,
            fieldLabel: field.name,
            fieldDescription: field.description,
            isRequired: field.isRequired,
            sortOrder: j + 1,
            placeholderText: field.description,
            maxLength: field.maxLength
          }
        });
      }

      console.log(`   ✅ ${template.serviceType} (${template.fields.length} fields)`);
    }

    // Verify results
    const totalBSGTemplates = await prisma.bSGTemplate.count({
      where: { categoryId: olibsCategory.id }
    });
    
    const totalBSGFields = await prisma.bSGTemplateField.count({
      where: { 
        template: { 
          categoryId: olibsCategory.id 
        } 
      }
    });

    console.log(`\n📊 Import Results:`);
    console.log(`   🎯 OLIBS Templates: ${totalBSGTemplates}`);
    console.log(`   ⚡ OLIBS Fields: ${totalBSGFields}`);
    console.log(`\n✨ OLIBS templates successfully imported to BSG system!`);
    console.log(`🔍 OLIBS should now appear in the service catalog UI.\n`);

  } catch (error) {
    console.error('❌ Error importing OLIBS templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});