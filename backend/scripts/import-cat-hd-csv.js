#!/usr/bin/env node

/**
 * Import cat_hd.csv Categories Script
 * 
 * This script imports the categories from cat_hd.csv file into the database
 * for the regular CreateTicketPage categorization system.
 */

const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get or create department by category name
 */
function getDepartmentByCategory(categoryName) {
  // KASDA categories go to Dukungan dan Layanan
  if (categoryName === 'KASDA') {
    return 'Dukungan dan Layanan';
  }
  
  // Banking/IT categories go to Information Technology
  const itCategories = ['OLIBS', 'ATM', 'BSGTouch', 'BSG QRIS', 'SMS BANKING', 'XCARD', 'TellerApp/Reporting'];
  if (itCategories.some(cat => categoryName.includes(cat))) {
    return 'Information Technology';
  }
  
  // Default to Information Technology for other categories
  return 'Information Technology';
}

/**
 * Ensure department exists
 */
async function ensureDepartmentExists(departmentName) {
  let department = await prisma.department.findFirst({
    where: { name: departmentName }
  });

  if (!department) {
    console.log(`🏢 Creating department: ${departmentName}`);
    department = await prisma.department.create({
      data: {
        name: departmentName,
        description: `${departmentName} department`,
        departmentType: departmentName === 'Information Technology' ? 'internal' : 'business',
        isServiceOwner: true
      }
    });
  }

  return department;
}

/**
 * Import categories from cat_hd.csv
 */
async function importCategoriesFromCSV() {
  console.log('📁 Importing categories from cat_hd.csv...\n');

  const categories = new Map();
  
  return new Promise((resolve, reject) => {
    fs.createReadStream('/Users/yanrypangouw/Documents/Projects/Web/ticketing-system/cat_hd.csv')
      .pipe(csv({ separator: ';', headers: ['Categories', 'Subcategories', 'Items'] }))
      .on('data', (row) => {
        // Skip header row
        if (row.Categories === 'Categories') return;
        
        const categoryName = row.Categories?.trim();
        const subcategoryName = row.Subcategories?.trim();
        const itemName = row.Items?.trim();
        
        if (!categoryName) return;
        
        // Initialize category if not exists
        if (!categories.has(categoryName)) {
          categories.set(categoryName, {
            name: categoryName,
            department: getDepartmentByCategory(categoryName),
            subcategories: new Map()
          });
        }
        
        const category = categories.get(categoryName);
        
        // Add subcategory if provided
        if (subcategoryName) {
          if (!category.subcategories.has(subcategoryName)) {
            category.subcategories.set(subcategoryName, {
              name: subcategoryName,
              items: []
            });
          }
          
          // Add item if provided
          if (itemName) {
            category.subcategories.get(subcategoryName).items.push({
              name: itemName
            });
          }
        }
      })
      .on('end', async () => {
        try {
          console.log(`📊 Parsed ${categories.size} categories from CSV\n`);
          
          // Create categories in database
          for (const [categoryName, categoryData] of categories) {
            console.log(`📁 Processing category: ${categoryName}`);
            
            // Ensure department exists
            const department = await ensureDepartmentExists(categoryData.department);
            
            // Create or get category
            const category = await prisma.category.upsert({
              where: { 
                departmentId_name: {
                  departmentId: department.id,
                  name: categoryName
                }
              },
              update: {},
              create: {
                name: categoryName,
                departmentId: department.id
              }
            });
            
            console.log(`  ✅ Category: ${categoryName} → ${categoryData.department}`);
            
            // Create subcategories
            for (const [subcategoryName, subcategoryData] of categoryData.subcategories) {
              console.log(`  📂 Processing subcategory: ${subcategoryName}`);
              
              const subcategory = await prisma.subCategory.upsert({
                where: {
                  categoryId_name: {
                    categoryId: category.id,
                    name: subcategoryName
                  }
                },
                update: {},
                create: {
                  name: subcategoryName,
                  categoryId: category.id
                }
              });
              
              // Create items
              for (const itemData of subcategoryData.items) {
                console.log(`    📄 Processing item: ${itemData.name}`);
                
                await prisma.item.upsert({
                  where: {
                    subCategoryId_name: {
                      subCategoryId: subcategory.id,
                      name: itemData.name
                    }
                  },
                  update: {},
                  create: {
                    name: itemData.name,
                    subCategoryId: subcategory.id
                  }
                });
              }
            }
            
            console.log();
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

/**
 * Verify imported categories
 */
async function verifyImportedCategories() {
  console.log('🔍 Verifying imported categories...\n');

  const categories = await prisma.category.findMany({
    include: {
      department: { select: { name: true } },
      subCategories: {
        include: {
          items: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Total categories: ${categories.length}\n`);

  let totalSubcategories = 0;
  let totalItems = 0;

  categories.forEach(category => {
    console.log(`📁 ${category.name} (${category.department?.name})`);
    console.log(`   Subcategories: ${category.subCategories.length}`);
    
    totalSubcategories += category.subCategories.length;
    
    category.subCategories.forEach(subcategory => {
      console.log(`   📂 ${subcategory.name} (${subcategory.items.length} items)`);
      totalItems += subcategory.items.length;
      
      subcategory.items.forEach(item => {
        console.log(`      📄 ${item.name}`);
      });
    });
    
    console.log();
  });

  console.log(`📈 Summary:`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Subcategories: ${totalSubcategories}`);
  console.log(`   Items: ${totalItems}`);
  
  // Check specifically for KASDA User Management
  const kasdaCategory = categories.find(cat => cat.name === 'KASDA');
  if (kasdaCategory) {
    const userMgmtSubcat = kasdaCategory.subCategories.find(sub => sub.name === 'User Management');
    if (userMgmtSubcat) {
      console.log(`\n✅ KASDA User Management found with ${userMgmtSubcat.items.length} items`);
      userMgmtSubcat.items.forEach(item => {
        console.log(`   - ${item.name}`);
      });
    } else {
      console.log(`\n❌ KASDA User Management subcategory not found`);
    }
  } else {
    console.log(`\n❌ KASDA category not found`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting cat_hd.csv import...\n');

    await importCategoriesFromCSV();
    await verifyImportedCategories();

    console.log('\n🎉 cat_hd.csv import completed successfully!');
    console.log('📝 Categories are now available in CreateTicketPage');
    console.log('🔄 KASDA categories will route to Dukungan dan Layanan');
    console.log('🔧 IT categories will route to Information Technology\n');

  } catch (error) {
    console.error('❌ Fatal error during CSV import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  importCategoriesFromCSV,
  getDepartmentByCategory
};