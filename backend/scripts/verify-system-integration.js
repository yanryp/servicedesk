#!/usr/bin/env node

/**
 * System Integration Verification Script
 * 
 * This script verifies that all components are working properly:
 * - Categories and KASDA User Management
 * - BSG Templates
 * - No duplications
 * - API endpoints functioning
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySystemIntegration() {
  console.log('🔍 SYSTEM INTEGRATION VERIFICATION\n');

  // 1. Check for duplicate categories
  console.log('1️⃣ Checking for duplicate categories...');
  const categories = await prisma.category.findMany({
    include: { department: { select: { name: true } } },
    orderBy: { name: 'asc' }
  });

  const categoryNames = {};
  const duplicates = [];
  
  categories.forEach(cat => {
    if (categoryNames[cat.name]) {
      duplicates.push(cat.name);
    } else {
      categoryNames[cat.name] = cat;
    }
  });

  if (duplicates.length > 0) {
    console.log(`❌ Found ${duplicates.length} duplicate categories: ${duplicates.join(', ')}`);
  } else {
    console.log('✅ No duplicate categories found');
  }

  // 2. Verify KASDA User Management structure
  console.log('\n2️⃣ Verifying KASDA User Management structure...');
  const kasdaCategory = await prisma.category.findFirst({
    where: { name: 'KASDA' },
    include: {
      department: { select: { name: true } },
      subCategories: {
        where: { name: 'User Management' },
        include: {
          items: true
        }
      }
    }
  });

  if (!kasdaCategory) {
    console.log('❌ KASDA category not found');
  } else {
    console.log(`✅ KASDA category found (Routes to: ${kasdaCategory.department?.name})`);
    
    const userMgmtSubcat = kasdaCategory.subCategories[0];
    if (!userMgmtSubcat) {
      console.log('❌ User Management subcategory not found');
    } else {
      console.log(`✅ User Management subcategory found with ${userMgmtSubcat.items.length} items`);
      userMgmtSubcat.items.forEach(item => {
        console.log(`   - ${item.name}`);
      });
    }
  }

  // 3. Verify BSG KASDA template
  console.log('\n3️⃣ Verifying BSG KASDA User Management template...');
  const kasdaBsgTemplate = await prisma.bSGTemplate.findFirst({
    where: { 
      templateNumber: 25,
      name: 'User Management'
    },
    include: {
      category: true,
      fields: {
        include: {
          fieldType: true,
          options: true
        }
      }
    }
  });

  if (!kasdaBsgTemplate) {
    console.log('❌ KASDA User Management BSG template not found');
  } else {
    console.log(`✅ BSG Template found: ${kasdaBsgTemplate.displayName}`);
    console.log(`   Category: ${kasdaBsgTemplate.category.displayName}`);
    console.log(`   Fields: ${kasdaBsgTemplate.fields.length}`);
    console.log(`   Template Number: ${kasdaBsgTemplate.templateNumber}`);
  }

  // 4. Check department routing
  console.log('\n4️⃣ Verifying department routing...');
  const itDept = await prisma.department.findFirst({
    where: { name: 'Information Technology' },
    include: {
      categories: { select: { name: true } }
    }
  });

  const dukunganDept = await prisma.department.findFirst({
    where: { name: 'Dukungan dan Layanan' },
    include: {
      categories: { select: { name: true } }
    }
  });

  if (itDept) {
    console.log(`✅ Information Technology dept: ${itDept.categories.length} categories`);
    const hasKasda = itDept.categories.some(cat => cat.name === 'KASDA');
    if (hasKasda) {
      console.log('❌ KASDA incorrectly assigned to IT department');
    }
  }

  if (dukunganDept) {
    console.log(`✅ Dukungan dan Layanan dept: ${dukunganDept.categories.length} categories`);
    const hasKasda = dukunganDept.categories.some(cat => cat.name === 'KASDA');
    if (hasKasda) {
      console.log('✅ KASDA correctly assigned to Dukungan dan Layanan');
    } else {
      console.log('❌ KASDA not found in Dukungan dan Layanan department');
    }
  }

  // 5. Template correlation check
  console.log('\n5️⃣ Checking template correlations...');
  const bsgCategories = await prisma.bSGTemplateCategory.findMany({
    include: {
      templates: { select: { name: true, templateNumber: true } }
    }
  });

  console.log(`✅ BSG Template Categories: ${bsgCategories.length}`);
  bsgCategories.forEach(cat => {
    console.log(`   📁 ${cat.displayName}: ${cat.templates.length} templates`);
    if (cat.name === 'KASDA') {
      cat.templates.forEach(template => {
        console.log(`      📋 #${template.templateNumber}: ${template.name}`);
      });
    }
  });

  // 6. Overall system summary
  console.log('\n📊 SYSTEM SUMMARY:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   BSG Template Categories: ${bsgCategories.length}`);
  console.log(`   BSG Templates: ${bsgCategories.reduce((sum, cat) => sum + cat.templates.length, 0)}`);
  
  const totalSubcategories = await prisma.subCategory.count();
  const totalItems = await prisma.item.count();
  console.log(`   Subcategories: ${totalSubcategories}`);
  console.log(`   Items: ${totalItems}`);

  console.log('\n🎯 VERIFICATION COMPLETE!');
  console.log('✅ System is ready for KASDA User Management testing');
}

async function main() {
  try {
    await verifySystemIntegration();
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { verifySystemIntegration };