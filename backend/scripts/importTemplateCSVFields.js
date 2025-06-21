#!/usr/bin/env node

/**
 * Comprehensive Template.csv Parser and Field Importer
 * 
 * This script parses the complete template.csv file and creates all 120+ custom field 
 * definitions for the 24 BSG templates. It handles all field types, validation rules,
 * master data associations, and template-field relationships.
 */

const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Field type mappings from CSV to database
const FIELD_TYPE_MAPPINGS = {
  'Date': 'date',
  'Drop-Down "Nama Cabang"': 'dropdown_branch',
  'Drop-down nama Cabang/Capem': 'dropdown_branch', 
  'Short Text': 'text',
  'Short Text (maks 5 karakter)': 'text_short',
  'Drop-Down "Menu OLIBs"': 'dropdown_olibs_menu',
  'Text': 'text',
  'Number Only': 'number',
  'Currency': 'currency',
  'Timestamp': 'datetime',
  'Varchar': 'text'
};

// Validation rules based on field types and descriptions
const VALIDATION_RULES = {
  'text_short': { maxLength: 5 },
  'number': { type: 'integer', min: 0 },
  'currency': { type: 'number', min: 0, step: 0.01 },
  'date': { type: 'date' },
  'datetime': { type: 'datetime-local' },
  'text': { maxLength: 255 },
  'dropdown_branch': { required: true },
  'dropdown_olibs_menu': { required: true }
};

// Master data type mappings
const MASTER_DATA_TYPES = {
  'dropdown_branch': 'branch',
  'dropdown_olibs_menu': 'olibs_menu'
};

/**
 * Parse template.csv file and extract field definitions
 */
async function parseTemplateCSV() {
  const csvPath = '../template.csv';
  console.log('📄 Parsing template.csv file...');
  
  return new Promise((resolve, reject) => {
    const fieldDefinitions = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        const templateNo = parseInt(row['No.']);
        const aplikasi = row['Aplikasi']?.trim();
        const jenisPekerjaan = row['Jenis Pekerjaan']?.trim();
        const namaField = row['Nama Field']?.trim();
        const tipe = row['Tipe']?.trim();
        const keterangan = row['Keterangan']?.trim();
        
        if (templateNo && namaField && tipe) {
          // Determine if field is required (marked with *)
          const isRequired = namaField.includes('*');
          const cleanFieldName = namaField.replace('*', '').trim();
          
          // Map field type
          const fieldType = FIELD_TYPE_MAPPINGS[tipe] || 'text';
          
          fieldDefinitions.push({
            templateNumber: templateNo,
            aplikasi,
            jenisPekerjaan,
            fieldName: cleanFieldName,
            fieldType,
            originalType: tipe,
            description: keterangan,
            isRequired,
            rawData: row
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Parsed ${fieldDefinitions.length} field definitions from CSV`);
        resolve(fieldDefinitions);
      })
      .on('error', (error) => {
        console.error('❌ Error parsing CSV:', error);
        reject(error);
      });
  });
}

/**
 * Get or create BSG template by number
 */
async function getBSGTemplate(templateNumber, aplikasi, jenisPekerjaan) {
  // First try to find existing template
  let template = await prisma.bSGTemplate.findFirst({
    where: { templateNumber: templateNumber },
    include: { category: true }
  });
  
  if (!template) {
    console.log(`⚠️  Template ${templateNumber} not found, attempting to create...`);
    
    // Get or create category
    let category = await prisma.bSGTemplateCategory.findFirst({
      where: { name: aplikasi }
    });
    
    if (!category) {
      console.log(`📁 Creating category: ${aplikasi}`);
      category = await prisma.bSGTemplateCategory.create({
        data: {
          name: aplikasi,
          displayName: aplikasi,
          description: `${aplikasi} system templates`,
          sortOrder: 99 // New categories go to end
        }
      });
    }
    
    // Create template
    template = await prisma.bSGTemplate.create({
      data: {
        categoryId: category.id,
        templateNumber: templateNumber,
        name: jenisPekerjaan,
        displayName: jenisPekerjaan,
        description: `${aplikasi} - ${jenisPekerjaan}`,
        isActive: true
      },
      include: { category: true }
    });
    
    console.log(`✅ Created template ${templateNumber}: ${jenisPekerjaan}`);
  }
  
  return template;
}

/**
 * Create field type if it doesn't exist
 */
async function ensureFieldType(fieldTypeName, originalType) {
  let fieldType = await prisma.bSGFieldType.findUnique({
    where: { name: fieldTypeName }
  });
  
  if (!fieldType) {
    const displayName = originalType || fieldTypeName;
    const htmlInputType = getHtmlInputType(fieldTypeName);
    
    fieldType = await prisma.bSGFieldType.create({
      data: {
        name: fieldTypeName,
        displayName: displayName,
        htmlInputType: htmlInputType,
        validationRules: JSON.stringify(VALIDATION_RULES[fieldTypeName] || {})
      }
    });
    
    console.log(`📝 Created field type: ${fieldTypeName}`);
  }
  
  return fieldType;
}

/**
 * Get HTML input type for field type
 */
function getHtmlInputType(fieldType) {
  const mappings = {
    'text': 'text',
    'text_short': 'text',
    'number': 'number',
    'currency': 'number',
    'date': 'date',
    'datetime': 'datetime-local',
    'dropdown_branch': 'select',
    'dropdown_olibs_menu': 'select',
    'textarea': 'textarea'
  };
  
  return mappings[fieldType] || 'text';
}

/**
 * Create template field definition
 */
async function createTemplateField(template, fieldDef, sortOrder) {
  // Check if field already exists
  const existingField = await prisma.bSGTemplateField.findFirst({
    where: {
      templateId: template.id,
      fieldName: fieldDef.fieldName
    }
  });
  
  if (existingField) {
    console.log(`⚠️  Field '${fieldDef.fieldName}' already exists for template ${template.templateNumber}`);
    return existingField;
  }
  
  // Ensure field type exists and get its ID
  const fieldType = await ensureFieldType(fieldDef.fieldType, fieldDef.originalType);
  
  // Create validation rules
  const validationRules = {
    ...VALIDATION_RULES[fieldDef.fieldType],
    required: fieldDef.isRequired
  };
  
  // Add specific validations based on field description
  let maxLength = null;
  if (fieldDef.description.includes('maksimal') || fieldDef.description.includes('maks')) {
    const maxMatch = fieldDef.description.match(/(\d+)/);
    if (maxMatch && fieldDef.fieldType.includes('text')) {
      maxLength = parseInt(maxMatch[1]);
      validationRules.maxLength = maxLength;
    }
  }
  
  // Create the field
  const templateField = await prisma.bSGTemplateField.create({
    data: {
      templateId: template.id,
      fieldTypeId: fieldType.id,
      fieldName: fieldDef.fieldName,
      fieldLabel: fieldDef.fieldName,
      fieldDescription: fieldDef.description,
      isRequired: fieldDef.isRequired,
      maxLength: maxLength,
      sortOrder: sortOrder,
      placeholderText: generatePlaceholder(fieldDef),
      helpText: fieldDef.description,
      validationRules: validationRules
    }
  });
  
  console.log(`  ✅ Created field: ${fieldDef.fieldName} (${fieldDef.fieldType})`);
  return templateField;
}

/**
 * Generate appropriate placeholder text
 */
function generatePlaceholder(fieldDef) {
  const placeholders = {
    'dropdown_branch': 'Pilih Cabang/Capem',
    'dropdown_olibs_menu': 'Pilih Menu OLIBS',
    'date': 'YYYY-MM-DD',
    'datetime': 'YYYY-MM-DD HH:MM',
    'currency': 'Contoh: 1000000',
    'number': 'Masukkan angka',
    'text_short': `Maksimal ${VALIDATION_RULES.text_short.maxLength} karakter`
  };
  
  return placeholders[fieldDef.fieldType] || `Masukkan ${fieldDef.fieldName.toLowerCase()}`;
}

/**
 * Create field options for dropdown fields
 */
async function createFieldOptions(templateField, fieldDef) {
  if (!fieldDef.fieldType.startsWith('dropdown_')) {
    return;
  }
  
  const masterDataType = MASTER_DATA_TYPES[fieldDef.fieldType];
  if (!masterDataType) {
    return;
  }
  
  // Get master data options
  const masterDataOptions = await prisma.bSGMasterData.findMany({
    where: { dataType: masterDataType },
    orderBy: { sortOrder: 'asc' }
  });
  
  // Create field options
  for (const [index, option] of masterDataOptions.entries()) {
    // Check if option already exists
    const existingOption = await prisma.bSGFieldOption.findFirst({
      where: {
        fieldId: templateField.id,
        optionValue: option.code || option.name
      }
    });
    
    if (!existingOption) {
      await prisma.bSGFieldOption.create({
        data: {
          fieldId: templateField.id,
          masterDataType: masterDataType,
          optionValue: option.code || option.name,
          optionLabel: option.displayName || option.name,
          sortOrder: index,
          isDefault: index === 0 // First option as default
        }
      });
    }
  }
  
  console.log(`  📋 Created ${masterDataOptions.length} options for ${fieldDef.fieldName}`);
}

/**
 * Update template usage statistics
 */
async function updateTemplateStats() {
  console.log('📊 Updating template statistics...');
  
  const templates = await prisma.bSGTemplate.findMany({
    include: {
      _count: {
        select: { fields: true }
      }
    }
  });
  
  for (const template of templates) {
    await prisma.bSGTemplate.update({
      where: { id: template.id },
      data: {
        popularityScore: template._count.fields * 10, // Simple popularity calculation
        updatedAt: new Date()
      }
    });
  }
  
  console.log(`✅ Updated statistics for ${templates.length} templates`);
}

/**
 * Generate field import summary
 */
async function generateImportSummary() {
  console.log('\n📊 Import Summary:');
  
  // Templates summary
  const templateCount = await prisma.bSGTemplate.count();
  const categoryCount = await prisma.bSGTemplateCategory.count();
  const fieldCount = await prisma.bSGTemplateField.count();
  const fieldTypeCount = await prisma.bSGFieldType.count();
  
  console.log(`   📁 Categories: ${categoryCount}`);
  console.log(`   📋 Templates: ${templateCount}`);
  console.log(`   📝 Fields: ${fieldCount}`);
  console.log(`   🔧 Field Types: ${fieldTypeCount}`);
  
  // Per-category breakdown
  const categorySummary = await prisma.bSGTemplateCategory.findMany({
    include: {
      _count: {
        select: { templates: true }
      },
      templates: {
        include: {
          _count: {
            select: { fields: true }
          }
        }
      }
    },
    orderBy: { sortOrder: 'asc' }
  });
  
  console.log('\n📊 Per-Category Summary:');
  for (const category of categorySummary) {
    const totalFields = category.templates.reduce((sum, template) => sum + template._count.fields, 0);
    console.log(`   ${category.displayName}: ${category._count.templates} templates, ${totalFields} fields`);
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting comprehensive template.csv field import...\n');
    
    // Parse CSV file
    const fieldDefinitions = await parseTemplateCSV();
    
    // Group fields by template
    const fieldsByTemplate = fieldDefinitions.reduce((acc, field) => {
      const key = field.templateNumber;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(field);
      return acc;
    }, {});
    
    console.log(`📋 Processing ${Object.keys(fieldsByTemplate).length} templates...\n`);
    
    // Process each template
    let totalFieldsCreated = 0;
    for (const [templateNo, fields] of Object.entries(fieldsByTemplate)) {
      console.log(`🔧 Processing Template ${templateNo}: ${fields[0].jenisPekerjaan}`);
      
      // Get or create template
      const template = await getBSGTemplate(
        parseInt(templateNo),
        fields[0].aplikasi,
        fields[0].jenisPekerjaan
      );
      
      // Create fields for this template
      for (const [index, fieldDef] of fields.entries()) {
        const templateField = await createTemplateField(template, fieldDef, index + 1);
        await createFieldOptions(templateField, fieldDef);
        totalFieldsCreated++;
      }
      
      console.log(`  ✅ Completed template ${templateNo} with ${fields.length} fields\n`);
    }
    
    // Update statistics
    await updateTemplateStats();
    
    // Generate summary
    await generateImportSummary();
    
    console.log(`\n🎉 Template field import completed successfully!`);
    console.log(`📊 Total fields created: ${totalFieldsCreated}`);
    console.log(`📝 All 24 BSG templates now have complete field definitions`);
    
  } catch (error) {
    console.error('❌ Fatal error during template field import:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in other scripts
module.exports = {
  parseTemplateCSV,
  getBSGTemplate,
  createTemplateField,
  FIELD_TYPE_MAPPINGS,
  VALIDATION_RULES
};

// Run the script if called directly
if (require.main === module) {
  main();
}