#!/usr/bin/env node

/**
 * Common Field Optimization Script
 * 
 * This script analyzes the BSG template fields to identify common/reusable fields
 * and creates a shared field library to reduce duplication and improve consistency.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Common field definitions that appear across multiple templates
const COMMON_FIELD_DEFINITIONS = {
  'Cabang/Capem': {
    fieldType: 'dropdown_branch',
    fieldLabel: 'Cabang/Capem',
    description: 'Nama Cabang atau Capem Requester',
    isRequired: true,
    placeholder: 'Pilih Cabang/Capem',
    helpText: 'Pilih cabang atau kantor cabang pembantu tempat Anda bertugas',
    category: 'location'
  },
  'Kode User': {
    fieldType: 'text_short',
    fieldLabel: 'Kode User',
    description: 'Kode User Requester',
    isRequired: true,
    placeholder: 'Contoh: U001',
    helpText: 'Masukkan kode user sesuai dengan yang terdaftar di sistem',
    maxLength: 10,
    category: 'user_identity'
  },
  'Nama User': {
    fieldType: 'text',
    fieldLabel: 'Nama User',
    description: 'Nama User Requester',
    isRequired: true,
    placeholder: 'Nama lengkap user',
    helpText: 'Masukkan nama lengkap user yang akan diproses',
    category: 'user_identity'
  },
  'Jabatan': {
    fieldType: 'text',
    fieldLabel: 'Jabatan',
    description: 'Jabatan User Requester',
    isRequired: true,
    placeholder: 'Contoh: Teller, Customer Service',
    helpText: 'Masukkan jabatan user di cabang/kantor',
    category: 'user_identity'
  },
  'Kantor Kas': {
    fieldType: 'text',
    fieldLabel: 'Kantor Kas',
    description: 'Kantor kas dari User',
    isRequired: false,
    placeholder: 'Nama kantor kas',
    helpText: 'Masukkan nama kantor kas jika berbeda dari cabang utama',
    category: 'location'
  },
  'Tanggal berlaku': {
    fieldType: 'date',
    fieldLabel: 'Tanggal Berlaku',
    description: 'Tanggal berlaku perubahan',
    isRequired: true,
    placeholder: 'YYYY-MM-DD',
    helpText: 'Pilih tanggal mulai berlakunya perubahan yang diminta',
    category: 'timing'
  },
  'Mutasi dari Cabang / Capem': {
    fieldType: 'dropdown_branch',
    fieldLabel: 'Mutasi dari Cabang/Capem',
    description: 'Cabang/Capem asal sebelum mutasi',
    isRequired: false,
    placeholder: 'Pilih cabang asal',
    helpText: 'Pilih cabang atau capem asal user sebelum mutasi',
    category: 'transfer'
  },
  'Mutasi ke Kantor Kas': {
    fieldType: 'text',
    fieldLabel: 'Mutasi ke Kantor Kas',
    description: 'Kantor kas tujuan mutasi',
    isRequired: false,
    placeholder: 'Nama kantor kas tujuan',
    helpText: 'Masukkan nama kantor kas tujuan untuk mutasi internal',
    category: 'transfer'
  },
  'Program Fasilitas OLIBS': {
    fieldType: 'dropdown_olibs_menu',
    fieldLabel: 'Program Fasilitas OLIBS',
    description: 'Wewenang menu yang diminta untuk User',
    isRequired: true,
    placeholder: 'Pilih menu OLIBS',
    helpText: 'Pilih fasilitas/menu OLIBS yang diperlukan user',
    category: 'permissions'
  },
  'Nama Nasabah': {
    fieldType: 'text',
    fieldLabel: 'Nama Nasabah',
    description: 'Nama nasabah terkait transaksi',
    isRequired: true,
    placeholder: 'Nama lengkap nasabah',
    helpText: 'Masukkan nama lengkap nasabah sesuai rekening',
    category: 'customer'
  },
  'Nomor Rekening': {
    fieldType: 'number',
    fieldLabel: 'Nomor Rekening',
    description: 'Nomor rekening nasabah',
    isRequired: true,
    placeholder: 'Contoh: 1234567890',
    helpText: 'Masukkan nomor rekening tanpa spasi atau tanda baca',
    category: 'customer'
  },
  'Nominal Transaksi': {
    fieldType: 'currency',
    fieldLabel: 'Nominal Transaksi',
    description: 'Jumlah nominal transaksi',
    isRequired: true,
    placeholder: 'Contoh: 1000000',
    helpText: 'Masukkan nominal transaksi dalam rupiah',
    category: 'transaction'
  },
  'Nomor Arsip': {
    fieldType: 'text',
    fieldLabel: 'Nomor Arsip',
    description: 'Nomor arsip transaksi',
    isRequired: true,
    placeholder: 'Nomor arsip sistem',
    helpText: 'Masukkan nomor arsip dari sistem untuk referensi',
    category: 'reference'
  }
};

// Field categories for better organization
const FIELD_CATEGORIES = {
  'location': 'Informasi Lokasi',
  'user_identity': 'Identitas User',
  'timing': 'Waktu dan Tanggal',
  'transfer': 'Mutasi/Transfer',
  'permissions': 'Hak Akses',
  'customer': 'Data Nasabah',
  'transaction': 'Transaksi',
  'reference': 'Referensi'
};

/**
 * Analyze field usage across templates
 */
async function analyzeFieldUsage() {
  console.log('🔍 Analyzing field usage across BSG templates...');
  
  const fieldUsage = await prisma.$queryRaw`
    SELECT 
      btf.field_name,
      bft.name as field_type,
      COUNT(*) as usage_count,
      ARRAY_AGG(DISTINCT t.name) as template_names
    FROM bsg_template_fields btf
    JOIN bsg_templates t ON btf.template_id = t.id
    JOIN bsg_field_types bft ON btf.field_type_id = bft.id
    GROUP BY btf.field_name, bft.name
    ORDER BY usage_count DESC, btf.field_name ASC
  `;
  
  console.log('\n📊 Field Usage Analysis:');
  console.log('='.repeat(60));
  
  const commonFields = [];
  const uniqueFields = [];
  
  for (const field of fieldUsage) {
    const usageInfo = `${field.field_name} (${field.field_type})`;
    const templatesUsed = field.template_names.slice(0, 3).join(', ') + 
                         (field.template_names.length > 3 ? '...' : '');
    
    if (parseInt(field.usage_count) > 1) {
      commonFields.push(field);
      console.log(`🔄 ${usageInfo.padEnd(35)} | Used ${field.usage_count}x | ${templatesUsed}`);
    } else {
      uniqueFields.push(field);
    }
  }
  
  console.log(`\n📈 Summary:`);
  console.log(`   Common fields (used >1x): ${commonFields.length}`);
  console.log(`   Unique fields (used 1x): ${uniqueFields.length}`);
  console.log(`   Total fields: ${fieldUsage.length}`);
  
  return { commonFields, uniqueFields, allFields: fieldUsage };
}

/**
 * Create global field definitions table
 */
async function createGlobalFieldDefinitions() {
  console.log('\n🔧 Creating global field definitions table...');
  
  // Create table for global field definitions
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS bsg_global_field_definitions (
      id SERIAL PRIMARY KEY,
      field_name VARCHAR(100) UNIQUE NOT NULL,
      field_type VARCHAR(50) NOT NULL,
      field_label VARCHAR(150) NOT NULL,
      description TEXT,
      placeholder_text VARCHAR(200),
      help_text VARCHAR(500),
      is_required BOOLEAN DEFAULT false,
      max_length INTEGER,
      validation_rules JSONB,
      field_category VARCHAR(50),
      usage_count INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  
  // Create indexes for performance
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_global_fields_name ON bsg_global_field_definitions(field_name)
  `;
  
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_global_fields_category ON bsg_global_field_definitions(field_category)
  `;
  
  console.log('✅ Global field definitions table created');
}

/**
 * Populate global field definitions
 */
async function populateGlobalFieldDefinitions() {
  console.log('📝 Populating global field definitions...');
  
  for (const [fieldName, definition] of Object.entries(COMMON_FIELD_DEFINITIONS)) {
    const validationRules = {
      required: definition.isRequired,
      ...(definition.maxLength && { maxLength: definition.maxLength })
    };
    
    await prisma.$executeRaw`
      INSERT INTO bsg_global_field_definitions (
        field_name, field_type, field_label, description, 
        placeholder_text, help_text, is_required, max_length,
        validation_rules, field_category
      ) VALUES (
        ${fieldName}, ${definition.fieldType}, ${definition.fieldLabel},
        ${definition.description}, ${definition.placeholder}, ${definition.helpText},
        ${definition.isRequired}, ${definition.maxLength || null},
        ${JSON.stringify(validationRules)}::jsonb, ${definition.category}
      )
      ON CONFLICT (field_name) DO UPDATE SET
        field_type = EXCLUDED.field_type,
        field_label = EXCLUDED.field_label,
        description = EXCLUDED.description,
        placeholder_text = EXCLUDED.placeholder_text,
        help_text = EXCLUDED.help_text,
        is_required = EXCLUDED.is_required,
        max_length = EXCLUDED.max_length,
        validation_rules = EXCLUDED.validation_rules::jsonb,
        field_category = EXCLUDED.field_category,
        updated_at = NOW()
    `;
  }
  
  console.log(`✅ Populated ${Object.keys(COMMON_FIELD_DEFINITIONS).length} global field definitions`);
}

/**
 * Update usage counts for global fields
 */
async function updateGlobalFieldUsageCounts() {
  console.log('📊 Updating usage counts for global fields...');
  
  const fieldNames = Object.keys(COMMON_FIELD_DEFINITIONS);
  const usageCounts = await prisma.$queryRaw`
    SELECT field_name, COUNT(*) as usage_count
    FROM bsg_template_fields
    WHERE field_name = ANY(${fieldNames})
    GROUP BY field_name
  `;
  
  for (const usage of usageCounts) {
    await prisma.$executeRaw`
      UPDATE bsg_global_field_definitions 
      SET usage_count = ${parseInt(usage.usage_count)}
      WHERE field_name = ${usage.field_name}
    `;
  }
  
  console.log('✅ Updated usage counts for all global fields');
}

/**
 * Create field reuse optimization report
 */
async function createOptimizationReport() {
  console.log('\n📋 Creating field reuse optimization report...');
  
  const totalFields = await prisma.bSGTemplateField.count();
  const globalFieldUsage = await prisma.$queryRaw`
    SELECT 
      gfd.field_name,
      gfd.field_category,
      gfd.usage_count,
      ROUND((gfd.usage_count::numeric / ${totalFields}::numeric) * 100, 2) as reuse_percentage
    FROM bsg_global_field_definitions gfd
    WHERE gfd.usage_count > 1
    ORDER BY gfd.usage_count DESC
  `;
  
  console.log('\n📊 Field Reuse Optimization Report:');
  console.log('=' * 80);
  console.log('Field Name'.padEnd(30) + 'Category'.padEnd(20) + 'Usage'.padEnd(10) + 'Reuse %');
  console.log('-' * 80);
  
  let totalReusableFields = 0;
  let totalFieldInstances = 0;
  
  for (const field of globalFieldUsage) {
    const reuse = parseFloat(field.reuse_percentage);
    console.log(
      field.field_name.padEnd(30) + 
      FIELD_CATEGORIES[field.field_category].padEnd(20) + 
      `${field.usage_count}x`.padEnd(10) + 
      `${reuse}%`
    );
    
    totalReusableFields++;
    totalFieldInstances += parseInt(field.usage_count);
  }
  
  const optimizationPercentage = ((totalFieldInstances - totalReusableFields) / totalFields * 100).toFixed(1);
  
  console.log('-' * 80);
  console.log(`\n💡 Optimization Impact:`);
  console.log(`   Total field instances: ${totalFields}`);
  console.log(`   Reusable field definitions: ${totalReusableFields}`);
  console.log(`   Field instances using common definitions: ${totalFieldInstances}`);
  console.log(`   Optimization achieved: ${optimizationPercentage}% reduction in unique definitions`);
  
  return {
    totalFields,
    reusableFields: totalReusableFields,
    fieldInstances: totalFieldInstances,
    optimizationPercentage
  };
}

/**
 * Generate field category summary
 */
async function generateFieldCategorySummary() {
  console.log('\n📂 Field Category Summary:');
  
  const categoryStats = await prisma.$queryRaw`
    SELECT 
      field_category,
      COUNT(*) as field_count,
      SUM(usage_count) as total_usage
    FROM bsg_global_field_definitions
    WHERE field_category IS NOT NULL
    GROUP BY field_category
    ORDER BY total_usage DESC
  `;
  
  for (const category of categoryStats) {
    const categoryName = FIELD_CATEGORIES[category.field_category] || category.field_category;
    console.log(`   ${categoryName}: ${category.field_count} fields, ${category.total_usage} total uses`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting BSG field optimization and analysis...\n');
    
    // Step 1: Analyze current field usage
    const { commonFields, uniqueFields } = await analyzeFieldUsage();
    
    // Step 2: Create global field definitions infrastructure
    await createGlobalFieldDefinitions();
    
    // Step 3: Populate with common field definitions
    await populateGlobalFieldDefinitions();
    
    // Step 4: Update usage counts
    await updateGlobalFieldUsageCounts();
    
    // Step 5: Generate optimization report
    const optimizationStats = await createOptimizationReport();
    
    // Step 6: Generate category summary
    await generateFieldCategorySummary();
    
    console.log('\n🎉 BSG field optimization completed successfully!');
    console.log(`📊 Achieved ${optimizationStats.optimizationPercentage}% reduction in field definition duplication`);
    console.log('🔧 Ready for dynamic field rendering implementation');
    
  } catch (error) {
    console.error('❌ Fatal error during field optimization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions for use in other scripts
module.exports = {
  analyzeFieldUsage,
  createGlobalFieldDefinitions,
  COMMON_FIELD_DEFINITIONS,
  FIELD_CATEGORIES
};

// Run the script if called directly
if (require.main === module) {
  main();
}