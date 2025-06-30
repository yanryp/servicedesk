// ITIL Template Mapping Script
// Maps existing templates with custom fields to new ITIL service structure
// Preserves all custom fields exactly as they are

const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

// Manual mapping of existing templates to new ITIL service items
// Based on the actual template names found in the database
const TEMPLATE_MAPPING = {
  // Core Banking & Financial Systems
  'OLIBS System': [
    'OLIBS - Perubahan Menu & Limit Transaksi',
    'OLIBS - Mutasi User Pegawai', 
    'OLIBS - Pendaftaran User Baru',
    'OLIBS - Non Aktif User',
    'OLIBS - Override Password',
    'Perubahan Menu & Limit Transaksi',  // Duplicate from OLIBS System catalog
    'Mutasi User Pegawai',                // Duplicate from OLIBS System catalog  
    'Pendaftaran User Baru',              // Duplicate from OLIBS System catalog
    'Non Aktif User',                     // Duplicate from OLIBS System catalog
    'Override Password'                   // Duplicate from OLIBS System catalog
  ],
  
  'Specialized Financial Systems': [
    // Add other financial system templates here if found
  ],

  // Digital Channels & Customer Applications
  'BSGTouch (Mobile Banking)': [
    'BSGTouch - Pendaftaran User',
    'BSGTouch - Perubahan User', 
    'BSGTouch - Perpanjang Masa Berlaku',
    'BSGTouch - Mutasi User',
    'Pendaftaran User',                   // From BSGTouch Templates
    'Perubahan User',                     // From BSGTouch Templates
    'Perpanjang Masa Berlaku',            // From BSGTouch Templates
    'Mutasi User'                         // From BSGTouch Templates
  ],

  'SMS Banking': [
    'SMS BANKING - Pendaftaran User',
    'SMS BANKING - Perubahan User',
    'SMS BANKING - Perpanjang Masa Berlaku', 
    'SMS BANKING - Mutasi User',
    'Pendaftaran User',                   // From SMS BANKING Templates (duplicate)
    'Perubahan User',                     // From SMS BANKING Templates (duplicate)
    'Perpanjang Masa Berlaku',            // From SMS BANKING Templates (duplicate)
    'Mutasi User'                         // From SMS BANKING Templates (duplicate)
  ],

  'BSG QRIS': [
    'BSG QRIS - Pendaftaran User',
    'BSG QRIS - Perpanjang Masa Berlaku',
    'BSG QRIS - Buka Blokir & Reset Password',
    'Pendaftaran User',                   // From BSG QRIS Templates (duplicate)
    'Perpanjang Masa Berlaku',            // From BSG QRIS Templates (duplicate)
    'Buka Blokir & Reset Password'        // From BSG QRIS Templates (duplicate)
  ],

  // ATM, EDC & Branch Hardware
  'ATM Services': [
    'PERMASALAHAN TEKNIS',               // From ATM Templates
    'ATM - PERMASALAHAN TEKNIS'          // From ATM Templates in IT Infrastructure
  ],

  // Corporate IT & Employee Support
  'Internal Applications Support': [
    'XCARD - Buka Blokir dan Reset Password',
    'XCARD - Pendaftaran User Baru',
    'Buka Blokir dan Reset Password',     // From XCARD Templates (duplicate)
    'Pendaftaran User Baru',              // From XCARD Templates (duplicate)
    'TellerApp/Reporting - Perubahan User',
    'TellerApp/Reporting - Pendaftaran User',
    'Perubahan User',                     // From TellerApp/Reporting Templates (duplicate)
    'Pendaftaran User'                    // From TellerApp/Reporting Templates (duplicate)
  ],

  'General IT Support': [
    'Permintaan Perpanjangan operasional - Perpanjangan Waktu Operasional',
    'Perpanjangan Waktu Operasional'     // From Permintaan Perpanjangan operasional Templates
  ],

  // Claims & Disputes  
  'Transaction Claims': [
    'KLAIM - BSGTouch – Transfer Antar Bank',
    'KLAIM - BSGTouch, BSGQRIS – Klaim Gagal Transaksi',
    'BSGTouch – Transfer Antar Bank',     // From KLAIM Templates (duplicate)
    'BSGTouch, BSGQRIS – Klaim Gagal Transaksi'  // From KLAIM Templates (duplicate)
  ]
};

async function analyzeExistingTemplates() {
  console.log('🔍 Analyzing existing templates with custom fields...\n');
  
  const templates = await client.serviceTemplate.findMany({
    include: {
      customFieldDefinitions: {
        orderBy: { sortOrder: 'asc' }
      },
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
    },
    where: {
      customFieldDefinitions: {
        some: {}
      }
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Found ${templates.length} templates with custom fields:`);
  
  const templatesByName = {};
  templates.forEach(template => {
    console.log(`🔧 ${template.name} (${template.customFieldDefinitions.length} fields)`);
    console.log(`   From: ${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`);
    
    if (!templatesByName[template.name]) {
      templatesByName[template.name] = [];
    }
    templatesByName[template.name].push({
      template,
      location: `${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`
    });
  });
  
  console.log('\n📊 TEMPLATE NAME ANALYSIS:');
  Object.entries(templatesByName).forEach(([name, instances]) => {
    if (instances.length > 1) {
      console.log(`🔄 DUPLICATE: "${name}" appears ${instances.length} times:`);
      instances.forEach(inst => {
        console.log(`   - ${inst.location} (${inst.template.customFieldDefinitions.length} fields)`);
      });
    }
  });
  
  return templates;
}

async function createMappingPlan() {
  console.log('\n📋 Creating template migration plan...\n');
  
  const existingTemplates = await analyzeExistingTemplates();
  const migrationPlan = [];
  const unmappedTemplates = [];
  
  // Create mapping plan
  for (const template of existingTemplates) {
    let targetServiceItem = null;
    
    // Look for exact name match in mapping
    for (const [serviceItemName, templateNames] of Object.entries(TEMPLATE_MAPPING)) {
      if (templateNames.includes(template.name)) {
        targetServiceItem = serviceItemName;
        break;
      }
    }
    
    if (targetServiceItem) {
      migrationPlan.push({
        originalTemplate: template,
        targetServiceItem: targetServiceItem,
        originalLocation: `${template.serviceItem.serviceCatalog.name} > ${template.serviceItem.name}`,
        customFields: template.customFieldDefinitions
      });
    } else {
      unmappedTemplates.push(template);
    }
  }
  
  console.log(`\n✅ MAPPING PLAN CREATED:`);
  console.log(`📦 Templates to migrate: ${migrationPlan.length}`);
  console.log(`❓ Unmapped templates: ${unmappedTemplates.length}`);
  
  if (unmappedTemplates.length > 0) {
    console.log(`\n⚠️  UNMAPPED TEMPLATES:`);
    unmappedTemplates.forEach(template => {
      console.log(`   - "${template.name}" from ${template.serviceItem.serviceCatalog.name}`);
    });
  }
  
  return { migrationPlan, unmappedTemplates };
}

async function executeTemplateMigration(migrationPlan) {
  console.log('\n🚀 Executing template migration...\n');
  
  let migrated = 0;
  let skipped = 0;
  
  for (const migration of migrationPlan) {
    console.log(`Migrating: ${migration.originalTemplate.name} → ${migration.targetServiceItem}`);
    
    // Find target service item
    const targetItem = await client.serviceItem.findFirst({
      where: { name: migration.targetServiceItem }
    });
    
    if (!targetItem) {
      console.log(`❌ Target service item not found: ${migration.targetServiceItem}`);
      skipped++;
      continue;
    }
    
    // Check if template already exists in target location
    const existingTemplate = await client.serviceTemplate.findFirst({
      where: {
        serviceItemId: targetItem.id,
        name: migration.originalTemplate.name
      }
    });
    
    if (existingTemplate) {
      console.log(`   ⏭️  Template already exists in target location, skipping`);
      skipped++;
      continue;
    }
    
    try {
      // Create new template in target location
      const newTemplate = await client.serviceTemplate.create({
        data: {
          serviceItemId: targetItem.id,
          name: migration.originalTemplate.name,
          description: migration.originalTemplate.description,
          templateType: migration.originalTemplate.templateType,
          isKasdaTemplate: migration.originalTemplate.isKasdaTemplate,
          requiresBusinessApproval: migration.originalTemplate.requiresBusinessApproval,
          isVisible: migration.originalTemplate.isVisible,
          sortOrder: migration.originalTemplate.sortOrder,
          estimatedResolutionTime: migration.originalTemplate.estimatedResolutionTime,
          defaultRootCause: migration.originalTemplate.defaultRootCause,
          defaultIssueType: migration.originalTemplate.defaultIssueType
        }
      });
      
      // Migrate all custom field definitions
      for (const field of migration.customFields) {
        await client.serviceFieldDefinition.create({
          data: {
            serviceTemplateId: newTemplate.id,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType,
            options: field.options,
            isRequired: field.isRequired,
            isKasdaSpecific: field.isKasdaSpecific,
            placeholder: field.placeholder,
            defaultValue: field.defaultValue,
            validationRules: field.validationRules,
            sortOrder: field.sortOrder,
            isVisible: field.isVisible
          }
        });
      }
      
      console.log(`   ✅ Migrated ${migration.customFields.length} custom fields`);
      migrated++;
      
    } catch (error) {
      console.log(`   ❌ Migration failed: ${error.message}`);
      skipped++;
    }
  }
  
  console.log(`\n📊 MIGRATION SUMMARY:`);
  console.log(`✅ Successfully migrated: ${migrated} templates`);
  console.log(`⏭️  Skipped (already exists): ${skipped} templates`);
  
  return { migrated, skipped };
}

async function validateMigration() {
  console.log('\n🔍 Validating migration results...\n');
  
  const itilCatalogs = await client.serviceCatalog.findMany({
    where: {
      name: {
        in: [
          'Core Banking & Financial Systems',
          'Digital Channels & Customer Applications',
          'ATM, EDC & Branch Hardware', 
          'Corporate IT & Employee Support',
          'Claims & Disputes',
          'General & Default Services'
        ]
      }
    },
    include: {
      serviceItems: {
        include: {
          templates: {
            include: {
              customFieldDefinitions: true
            }
          }
        }
      }
    }
  });
  
  let totalTemplates = 0;
  let totalFields = 0;
  
  itilCatalogs.forEach(catalog => {
    console.log(`📁 ${catalog.name}`);
    catalog.serviceItems.forEach(item => {
      const templateCount = item.templates.length;
      const fieldCount = item.templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0);
      
      if (templateCount > 0) {
        console.log(`   📋 ${item.name}: ${templateCount} templates, ${fieldCount} fields`);
        totalTemplates += templateCount;
        totalFields += fieldCount;
      }
    });
  });
  
  console.log(`\n📊 VALIDATION RESULTS:`);
  console.log(`📁 ITIL Catalogs: ${itilCatalogs.length}`);
  console.log(`📋 Total Templates: ${totalTemplates}`);
  console.log(`🔧 Total Custom Fields: ${totalFields}`);
  
  return { catalogs: itilCatalogs.length, templates: totalTemplates, fields: totalFields };
}

async function runTemplateMapping() {
  try {
    console.log('🎯 Starting ITIL Template Mapping Process...\n');
    
    // Phase 1: Analyze and create mapping plan
    const { migrationPlan, unmappedTemplates } = await createMappingPlan();
    
    if (migrationPlan.length === 0) {
      console.log('❌ No templates to migrate. Check template mappings.');
      return;
    }
    
    // Phase 2: Execute migration
    const results = await executeTemplateMigration(migrationPlan);
    
    // Phase 3: Validate results
    await validateMigration();
    
    console.log('\n🎉 Template mapping completed successfully!');
    console.log(`📦 Templates migrated: ${results.migrated}`);
    console.log(`⏭️  Templates skipped: ${results.skipped}`);
    console.log(`❓ Unmapped templates: ${unmappedTemplates.length}`);
    
    if (unmappedTemplates.length > 0) {
      console.log('\n💡 Review unmapped templates and update TEMPLATE_MAPPING if needed');
    }
    
  } catch (error) {
    console.error('❌ Template mapping failed:', error);
    throw error;
  }
}

module.exports = {
  runTemplateMapping,
  TEMPLATE_MAPPING,
  analyzeExistingTemplates,
  createMappingPlan
};

// Run if called directly
if (require.main === module) {
  runTemplateMapping()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}