// src/services/bsgTemplateImportService.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';

const prisma = new PrismaClient();

// BSG System Categories mapping for the current schema
const BSG_SYSTEM_CATEGORIES = {
  'OLIBs': 'Core Banking System',
  'ATM': 'ATM Operations',
  'BSGDirect': 'Internet Banking',
  'BSGTouch': 'Mobile Banking',
  'BSG QRIS': 'QR Payment System',
  'Kasda': 'Government Treasury',
  'XLink': 'ATM Switching',
  'XCard': 'Card Management',
  'XMonitoring': 'ATM Monitoring',
  'Switching': 'Payment Switching',
  'Network': 'Network Infrastructure',
  'Antasena': 'Internal Applications',
  'Permintaan': 'Service Requests',
  'Error': 'System Errors'
};

function categorizeTemplate(templateName: string): { systemCategory: string, categoryName: string } {
  const name = templateName.toLowerCase();
  
  if (name.startsWith('olibs')) {
    return { systemCategory: 'OLIBs', categoryName: BSG_SYSTEM_CATEGORIES['OLIBs'] };
  } else if (name.startsWith('atm')) {
    return { systemCategory: 'ATM', categoryName: BSG_SYSTEM_CATEGORIES['ATM'] };
  } else if (name.startsWith('bsgdirect')) {
    return { systemCategory: 'BSGDirect', categoryName: BSG_SYSTEM_CATEGORIES['BSGDirect'] };
  } else if (name.startsWith('bsgtouch')) {
    return { systemCategory: 'BSGTouch', categoryName: BSG_SYSTEM_CATEGORIES['BSGTouch'] };
  } else if (name.startsWith('bsg qris')) {
    return { systemCategory: 'BSG QRIS', categoryName: BSG_SYSTEM_CATEGORIES['BSG QRIS'] };
  } else if (name.startsWith('kasda')) {
    return { systemCategory: 'Kasda', categoryName: BSG_SYSTEM_CATEGORIES['Kasda'] };
  } else if (name.startsWith('xlink') || name.startsWith('xcard') || name.startsWith('xmonitoring')) {
    if (name.startsWith('xcard')) {
      return { systemCategory: 'XCard', categoryName: BSG_SYSTEM_CATEGORIES['XCard'] };
    } else if (name.startsWith('xmonitoring')) {
      return { systemCategory: 'XMonitoring', categoryName: BSG_SYSTEM_CATEGORIES['XMonitoring'] };
    } else {
      return { systemCategory: 'XLink', categoryName: BSG_SYSTEM_CATEGORIES['XLink'] };
    }
  } else if (name.startsWith('switching')) {
    return { systemCategory: 'Switching', categoryName: BSG_SYSTEM_CATEGORIES['Switching'] };
  } else if (name.includes('gangguan lan') || name.includes('gangguan wan') || name.includes('gangguan internet')) {
    return { systemCategory: 'Network', categoryName: BSG_SYSTEM_CATEGORIES['Network'] };
  } else if (name.startsWith('antasena') || name.startsWith('ars73')) {
    return { systemCategory: 'Antasena', categoryName: BSG_SYSTEM_CATEGORIES['Antasena'] };
  } else if (name.startsWith('permintaan')) {
    return { systemCategory: 'Permintaan', categoryName: BSG_SYSTEM_CATEGORIES['Permintaan'] };
  } else {
    return { systemCategory: 'Error', categoryName: BSG_SYSTEM_CATEGORIES['Error'] };
  }
}

export async function importRealBSGTemplates(): Promise<{ 
  importedCount: number, 
  skippedCount: number, 
  totalCategories: number 
}> {
  console.log('🚀 Starting Real BSG Template Import (Simplified)...');
  
  try {
    // Read and parse CSV file
    const csvPath = '/Users/yanrypangouw/Documents/Projects/Web/ticketing-system/hd_template.csv';
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV file not found: ' + csvPath);
    }
    
    const templates: any[] = [];
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv({ separator: ';' }))
        .on('data', (row) => {
          // Handle BOM character in column name
          const templateName = row['﻿Template Name'] || row['Template Name'];
          if (templateName && templateName !== 'Template Name') {
            templates.push({
              name: templateName.trim(),
              description: row['Description'] ? row['Description'].trim() : '',
              showToRequester: row['Show to Requester'] === 'Yes'
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`📋 Found ${templates.length} templates to import`);
    
    // Create categories first
    const categoriesCreated = new Set<string>();
    const categoryMap = new Map<string, number>();
    
    for (const template of templates) {
      const { categoryName } = categorizeTemplate(template.name);
      if (!categoriesCreated.has(categoryName)) {
        try {
          const category = await prisma.category.upsert({
            where: { 
              departmentId_name: {
                departmentId: 1, // IT Department
                name: categoryName
              }
            },
            create: { 
              name: categoryName,
              departmentId: 1 // IT Department
            },
            update: {}
          });
          categoryMap.set(categoryName, category.id);
          categoriesCreated.add(categoryName);
        } catch (error) {
          console.warn(`⚠️ Category creation failed for: ${categoryName}`);
        }
      }
    }
    
    console.log(`✅ Created/found ${categoriesCreated.size} categories`);
    
    // Create subcategories and templates
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const template of templates) {
      try {
        const { systemCategory, categoryName } = categorizeTemplate(template.name);
        const categoryId = categoryMap.get(categoryName);
        
        if (!categoryId) {
          console.warn(`⚠️ Category not found for: ${categoryName}`);
          skippedCount++;
          continue;
        }
        
        // Create subcategory
        const subCategory = await prisma.subCategory.upsert({
          where: { 
            categoryId_name: {
              categoryId: categoryId,
              name: systemCategory
            }
          },
          create: {
            categoryId: categoryId,
            name: systemCategory
          },
          update: {}
        });
        
        // Create item
        const item = await prisma.item.upsert({
          where: {
            subCategoryId_name: {
              subCategoryId: subCategory.id,
              name: template.name
            }
          },
          create: {
            subCategoryId: subCategory.id,
            name: template.name
          },
          update: {}
        });
        
        // Create template
        const existingTemplate = await prisma.ticketTemplate.findFirst({
          where: { name: template.name }
        });
        
        if (existingTemplate) {
          skippedCount++;
          continue;
        }
        
        await prisma.ticketTemplate.create({
          data: {
            name: template.name,
            description: template.description,
            itemId: item.id
          }
        });
        
        importedCount++;
        
        if (importedCount % 25 === 0) {
          console.log(`⏳ Imported ${importedCount} templates...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to import template "${template.name}":`, error);
        skippedCount++;
      }
    }
    
    console.log('\\n🎉 Import completed!');
    console.log(`✅ Successfully imported: ${importedCount} templates`);
    console.log(`⏭️ Skipped (already exists): ${skippedCount} templates`);
    console.log(`📊 Total processed: ${templates.length} templates`);
    console.log(`📁 Categories created: ${categoriesCreated.size}`);
    
    return {
      importedCount,
      skippedCount,
      totalCategories: categoriesCreated.size
    };
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    throw error;
  }
}