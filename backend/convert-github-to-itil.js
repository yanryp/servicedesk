#!/usr/bin/env node

/**
 * Convert GitHub Working Data to ITIL Structure
 * 
 * This script takes the working template-mapping.json from GitHub commit bc84bd6
 * and properly converts it to the new ITIL-compliant service catalog structure.
 * It creates ServiceTemplates (not just ServiceItems) with proper channel differentiation.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * ITIL Service Catalog Structure with Channel Differentiation
 */
const ITIL_SERVICE_CATALOGS = [
  {
    name: 'Banking Applications - User Management',
    description: 'User registration, modification, and access management across all banking channels',
    serviceType: 'business_service',
    channels: ['BSGTouch', 'ATM', 'SMS Banking', 'OLIBS', 'KASDA', 'BSG Direct', 'XCARD', 'BSG QRIS', 'TellerApp']
  },
  {
    name: 'Claims & Transactions - Transfer Services', 
    description: 'Transfer services across all channels including inter-bank transfers and claims processing',
    serviceType: 'business_service',
    channels: ['BSGTouch', 'ATM', 'SMS Banking', 'BSG Direct', 'BI Fast']
  },
  {
    name: 'Claims & Transactions - Payment Services',
    description: 'Bill payment services across multiple channels (PBB, Samsat, PLN, BPJS, etc.)',
    serviceType: 'business_service',
    channels: ['BSGTouch', 'ATM', 'SMS Banking', 'TellerApp']
  },
  {
    name: 'Claims & Transactions - Purchase Services',
    description: 'Purchase services including pulsa, tokens, and other retail products',
    serviceType: 'business_service',
    channels: ['BSGTouch', 'ATM', 'SMS Banking']
  },
  {
    name: 'KASDA Services',
    description: 'Regional government treasury services and KASDA Online system',
    serviceType: 'business_service',
    channels: ['KASDA Online', 'KASDA BUD']
  },
  {
    name: 'Identity & Access Management',
    description: 'Security management, access control, and authentication services',
    serviceType: 'technical_service',
    channels: ['Domain', 'Security']
  },
  {
    name: 'IT Infrastructure Services',
    description: 'Network, hardware, software maintenance and technical support services',
    serviceType: 'technical_service',
    channels: ['Network', 'Hardware', 'Software', 'Maintenance']
  }
];

/**
 * Map template names to ITIL categories based on service type and channel
 */
function categorizeTemplate(templateName, application) {
  const name = templateName.toLowerCase();
  const app = application.toLowerCase();
  
  // User Management Services (across all channels)
  if (name.includes('pendaftaran user') || name.includes('mutasi user') || 
      name.includes('perubahan user') || name.includes('reset password') ||
      name.includes('buka blokir') || name.includes('user expire') ||
      name.includes('perpanjang masa berlaku') || name.includes('perubahan menu')) {
    return 'Banking Applications - User Management';
  }
  
  // Transfer Services 
  else if (name.includes('transfer') || name.includes('penarikan') || 
           (name.includes('klaim') && (name.includes('transfer') || name.includes('penarikan')))) {
    return 'Claims & Transactions - Transfer Services';
  }
  
  // Payment Services
  else if (name.includes('pembayaran') || name.includes('tagihan') ||
           (name.includes('pbb') || name.includes('samsat') || name.includes('pln') || 
            name.includes('bpjs') || name.includes('citilink') || name.includes('bigtv') ||
            name.includes('pstn') || name.includes('kartu halo'))) {
    return 'Claims & Transactions - Payment Services';
  }
  
  // Purchase Services  
  else if (name.includes('pembelian') || name.includes('pulsa') || name.includes('token')) {
    return 'Claims & Transactions - Purchase Services';
  }
  
  // KASDA Services
  else if (name.includes('kasda')) {
    return 'KASDA Services';
  }
  
  // Identity & Access
  else if (name.includes('domain') || name.includes('keamanan') || name.includes('security')) {
    return 'Identity & Access Management';
  }
  
  // IT Infrastructure (everything else)
  else {
    return 'IT Infrastructure Services';
  }
}

/**
 * Transform field definition to match current system
 */
function transformField(field, index) {
  return {
    fieldName: field.name.replace(/\*/g, '').trim(), // Remove required indicators
    fieldLabel: field.name.replace(/\*/g, '').trim(),
    fieldType: mapFieldType(field.type),
    isRequired: field.isRequired || field.name.includes('*'),
    isVisible: true,
    sortOrder: index,
    placeholder: field.description || null,
    defaultValue: null,
    options: null, // Will be populated for dropdown fields
    validationRules: field.maxLength ? JSON.stringify({ maxLength: field.maxLength }) : null,
    isKasdaSpecific: false
  };
}

/**
 * Map field types from CSV to system types
 */
function mapFieldType(csvType) {
  const typeMap = {
    'Short Text': 'text',
    'Long Text': 'textarea', 
    'Date': 'date',
    'Number': 'number',
    'Drop-Down': 'dropdown',
    'Multi-select': 'dropdown',
    'Boolean': 'checkbox',
    'File': 'text' // No file type in enum, default to text
  };
  
  // Handle complex types like "Short Text (maks 5 karakter)"
  for (const [key, value] of Object.entries(typeMap)) {
    if (csvType.includes(key)) {
      return value;
    }
  }
  
  return 'text'; // Default fallback
}

/**
 * Clear existing data and create ITIL structure
 */
async function setupITILStructure() {
  console.log('🧹 Clearing existing service catalog data...');
  
  // Clear in proper order due to foreign key constraints
  await prisma.serviceFieldDefinition.deleteMany();
  await prisma.serviceTemplate.deleteMany();
  await prisma.serviceItem.deleteMany();
  await prisma.serviceCatalog.deleteMany();
  
  console.log('🏗️  Creating ITIL service catalog structure...');
  
  // Get IT department
  const itDept = await prisma.department.findFirst({
    where: { name: 'Information Technology' }
  });
  
  if (!itDept) {
    throw new Error('Information Technology department not found');
  }
  
  const createdCatalogs = new Map();
  
  // Create ITIL service catalogs
  for (const catalogConfig of ITIL_SERVICE_CATALOGS) {
    const catalog = await prisma.serviceCatalog.create({
      data: {
        name: catalogConfig.name,
        description: catalogConfig.description,
        serviceType: catalogConfig.serviceType,
        departmentId: itDept.id,
        isActive: true
      }
    });
    
    createdCatalogs.set(catalogConfig.name, catalog);
    console.log(`  ✅ Created catalog: ${catalog.name}`);
  }
  
  return createdCatalogs;
}

/**
 * Convert working GitHub data to ITIL structure
 */
async function convertGitHubDataToITIL() {
  console.log('📥 Converting GitHub data to ITIL structure...\n');
  
  try {
    // Read the working template mapping
    const mappingPath = path.join(__dirname, 'working-template-mapping.json');
    if (!fs.existsSync(mappingPath)) {
      throw new Error('Working template mapping not found. Extract it from GitHub first.');
    }
    
    const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));
    console.log(`📊 Loaded ${mapping.statistics.totalTemplates} templates from GitHub\n`);
    
    // Setup ITIL structure
    const serviceCatalogs = await setupITILStructure();
    
    console.log('\n📋 Converting templates to ITIL structure...');
    
    let processedCount = 0;
    const createdServices = new Map();
    
    // Process dynamic templates (24 with custom fields)
    console.log('\n⚡ Processing dynamic templates with custom fields...');
    for (const template of mapping.dynamicTemplates) {
      const catalogName = categorizeTemplate(template.serviceType, template.application);
      const catalog = serviceCatalogs.get(catalogName);
      
      if (!catalog) {
        console.warn(`❌ No catalog found for: ${template.serviceType}`);
        continue;
      }
      
      // Create or get ServiceItem for this application group
      const serviceItemName = `${template.application} Templates`;
      let serviceItem = createdServices.get(`${catalog.id}-${serviceItemName}`);
      
      if (!serviceItem) {
        serviceItem = await prisma.serviceItem.create({
          data: {
            serviceCatalogId: catalog.id,
            name: serviceItemName,
            description: `${template.application} service templates`,
            isActive: true,
            sortOrder: 0
          }
        });
        createdServices.set(`${catalog.id}-${serviceItemName}`, serviceItem);
        console.log(`  📁 Created ServiceItem: ${serviceItemName} in ${catalog.name}`);
      }
      
      // Create ServiceTemplate
      const serviceTemplate = await prisma.serviceTemplate.create({
        data: {
          serviceItemId: serviceItem.id,
          name: `${template.application} - ${template.serviceType}`,
          description: `${template.serviceType} service template`,
          templateType: 'standard',
          isVisible: true,
          sortOrder: processedCount,
          defaultRootCause: 'human_error',
          defaultIssueType: 'request'
        }
      });
      
      // Create CustomFieldDefinitions
      if (template.fields && template.fields.length > 0) {
        for (const [index, field] of template.fields.entries()) {
          const fieldDef = transformField(field, index);
          
          await prisma.serviceFieldDefinition.create({
            data: {
              ...fieldDef,
              serviceTemplateId: serviceTemplate.id
            }
          });
        }
        console.log(`    ✅ ${template.application} - ${template.serviceType} (${template.fields.length} fields)`);
      }
      
      processedCount++;
    }
    
    // Process static templates (remaining 247 templates)
    console.log('\n📄 Processing static templates...');
    for (const template of mapping.staticTemplates) {
      const catalogName = categorizeTemplate(template.name, template.application || 'General');
      const catalog = serviceCatalogs.get(catalogName);
      
      if (!catalog) {
        console.warn(`❌ No catalog found for: ${template.name}`);
        continue;
      }
      
      // Group by application or create general item
      const serviceItemName = template.application ? `${template.application} Services` : 'General Services';
      let serviceItem = createdServices.get(`${catalog.id}-${serviceItemName}`);
      
      if (!serviceItem) {
        serviceItem = await prisma.serviceItem.create({
          data: {
            serviceCatalogId: catalog.id,
            name: serviceItemName,
            description: `${template.application || 'General'} service templates`,
            isActive: true,
            sortOrder: 0
          }
        });
        createdServices.set(`${catalog.id}-${serviceItemName}`, serviceItem);
        console.log(`  📁 Created ServiceItem: ${serviceItemName} in ${catalog.name}`);
      }
      
      // Create ServiceTemplate
      await prisma.serviceTemplate.create({
        data: {
          serviceItemId: serviceItem.id,
          name: template.name,
          description: template.description || `${template.name} service request`,
          templateType: 'standard',
          isVisible: template.showToRequester !== false,
          sortOrder: processedCount,
          defaultRootCause: 'human_error',
          defaultIssueType: 'request'
        }
      });
      
      processedCount++;
      
      if (processedCount % 50 === 0) {
        console.log(`    📊 Processed ${processedCount}/${mapping.statistics.totalTemplates} templates...`);
      }
    }
    
    console.log(`\n✅ Successfully converted ${processedCount} templates to ITIL structure!`);
    
    // Final verification
    console.log('\n📊 Final Structure Verification:');
    const finalCatalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          include: {
            templates: true,
            _count: {
              select: { templates: true }
            }
          }
        },
        _count: {
          select: { serviceItems: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    let totalTemplates = 0;
    finalCatalogs.forEach(catalog => {
      const templateCount = catalog.serviceItems.reduce((sum, item) => sum + item._count.templates, 0);
      totalTemplates += templateCount;
      console.log(`  📁 ${catalog.name}: ${catalog._count.serviceItems} items, ${templateCount} templates`);
    });
    
    console.log(`\n📈 Total: ${totalTemplates} templates in ${finalCatalogs.length} ITIL catalogs`);
    
  } catch (error) {
    console.error('❌ Error converting GitHub data:', error);
    throw error;
  }
}

// Execute the conversion
async function main() {
  try {
    await convertGitHubDataToITIL();
    console.log('\n🎉 GitHub to ITIL conversion completed successfully!');
  } catch (error) {
    console.error('💥 Conversion failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { convertGitHubDataToITIL };