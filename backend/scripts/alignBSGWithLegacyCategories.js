#!/usr/bin/env node

/**
 * BSG Template and Legacy Category Alignment Script
 * 
 * This script creates proper integration between the BSG template system and the 
 * existing ServiceCatalog/ServiceItem structure while maintaining KASDA/BSGDirect
 * in "Departement Dukungan & Layanan" and supporting future department additions.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Department mappings for BSG systems
const BSG_DEPARTMENT_MAPPINGS = {
  // Core Banking Systems - remain in Departement Dukungan & Layanan
  'OLIBS': 'Departement Dukungan & Layanan',
  'KASDA': 'Departement Dukungan & Layanan', 
  'BSGDirect': 'Departement Dukungan & Layanan',
  'BSGTouch': 'Departement Dukungan & Layanan',
  'BSG QRIS': 'Departement Dukungan & Layanan',
  'SMS BANKING': 'Departement Dukungan & Layanan',
  
  // Infrastructure Systems - can be assigned to IT Department
  'ATM': 'IT Department',
  'XCARD': 'IT Department',
  'TellerApp/Reporting': 'IT Department',
  'KLAIM': 'IT Department',
  
  // Operational - Business Department
  'Permintaan Perpanjangan operasional': 'Operations Department'
};

// Legacy category mappings for BSG systems
const BSG_LEGACY_CATEGORY_MAPPINGS = {
  'OLIBS': {
    serviceName: 'Core Banking System (OLIBS)',
    description: 'Online Banking System for internal operations',
    businessImpact: 'high',
    requiresApproval: true
  },
  'BSGDirect': {
    serviceName: 'Internet Banking Platform',
    description: 'Customer internet banking services',
    businessImpact: 'high', 
    requiresApproval: true
  },
  'BSGTouch': {
    serviceName: 'Mobile Banking Platform',
    description: 'Customer mobile banking services',
    businessImpact: 'high',
    requiresApproval: true
  },
  'BSG QRIS': {
    serviceName: 'QR Payment System',
    description: 'QR code payment processing system',
    businessImpact: 'medium',
    requiresApproval: true
  },
  'KASDA': {
    serviceName: 'Government Treasury System',
    description: 'Government cash management and treasury operations',
    businessImpact: 'critical',
    requiresApproval: true
  },
  'ATM': {
    serviceName: 'ATM Network Management',
    description: 'ATM operations and technical support',
    businessImpact: 'high',
    requiresApproval: false
  },
  'XCARD': {
    serviceName: 'Card Management System',
    description: 'Debit/credit card management and support',
    businessImpact: 'medium',
    requiresApproval: false
  },
  'KLAIM': {
    serviceName: 'Transaction Claims System',
    description: 'Customer transaction dispute and claims processing',
    businessImpact: 'medium',
    requiresApproval: true
  },
  'SMS BANKING': {
    serviceName: 'SMS Banking Platform',
    description: 'SMS-based banking services',
    businessImpact: 'low',
    requiresApproval: false
  },
  'TellerApp/Reporting': {
    serviceName: 'Teller Application System',
    description: 'Teller operations and reporting system',
    businessImpact: 'high',
    requiresApproval: false
  },
  'Permintaan Perpanjangan operasional': {
    serviceName: 'Operational Extension Requests',
    description: 'Branch operational hour extension requests',
    businessImpact: 'low',
    requiresApproval: true
  }
};

/**
 * Ensure all required departments exist
 */
async function ensureDepartmentsExist() {
  console.log('🏢 Ensuring all departments exist...');
  
  const requiredDepartments = [
    {
      name: 'Departement Dukungan & Layanan',
      type: 'business',
      isServiceOwner: true,
      description: 'Business Support and Services Department - KASDA and Banking Services'
    },
    {
      name: 'IT Department', 
      type: 'internal',
      isServiceOwner: false,
      description: 'Information Technology Department - Infrastructure Support'
    },
    {
      name: 'Operations Department',
      type: 'business', 
      isServiceOwner: true,
      description: 'Operations Department - Branch and Operational Support'
    }
  ];
  
  const departments = {};
  
  for (const deptConfig of requiredDepartments) {
    const department = await prisma.department.upsert({
      where: { name: deptConfig.name },
      update: {
        departmentType: deptConfig.type,
        isServiceOwner: deptConfig.isServiceOwner,
        description: deptConfig.description
      },
      create: {
        name: deptConfig.name,
        departmentType: deptConfig.type,
        isServiceOwner: deptConfig.isServiceOwner,
        description: deptConfig.description
      }
    });
    
    departments[deptConfig.name] = department;
    console.log(`  ✅ Department: ${deptConfig.name}`);
  }
  
  return departments;
}

/**
 * Create legacy service catalog entries for BSG systems
 */
async function createLegacyServiceCatalog(departments) {
  console.log('📋 Creating legacy service catalog entries...');
  
  for (const [bsgCategory, mapping] of Object.entries(BSG_LEGACY_CATEGORY_MAPPINGS)) {
    const departmentName = BSG_DEPARTMENT_MAPPINGS[bsgCategory];
    const department = departments[departmentName];
    
    if (!department) {
      console.warn(`⚠️  Department not found: ${departmentName} for ${bsgCategory}`);
      continue;
    }
    
    // Create or update service catalog entry
    const serviceCatalog = await prisma.serviceCatalog.upsert({
      where: {
        departmentId_name: {
          departmentId: department.id,
          name: mapping.serviceName
        }
      },
      update: {
        description: mapping.description,
        businessImpact: mapping.businessImpact,
        requiresApproval: mapping.requiresApproval,
        serviceType: 'business_service'
      },
      create: {
        name: mapping.serviceName,
        description: mapping.description,
        departmentId: department.id,
        businessImpact: mapping.businessImpact,
        requiresApproval: mapping.requiresApproval,
        serviceType: 'business_service',
        categoryLevel: 1,
        isActive: true
      }
    });
    
    console.log(`  ✅ Service: ${mapping.serviceName} → ${departmentName}`);
    
    // Create service items based on BSG templates
    await createServiceItemsForBSGCategory(serviceCatalog, bsgCategory);
  }
}

/**
 * Create service items for each BSG template category
 */
async function createServiceItemsForBSGCategory(serviceCatalog, bsgCategoryName) {
  // Get BSG templates for this category
  const bsgCategory = await prisma.bSGTemplateCategory.findFirst({
    where: { name: bsgCategoryName },
    include: { templates: true }
  });
  
  if (!bsgCategory) {
    console.warn(`⚠️  BSG category not found: ${bsgCategoryName}`);
    return;
  }
  
  // Create service items for each template
  for (const template of bsgCategory.templates) {
    const serviceItem = await prisma.serviceItem.upsert({
      where: {
        serviceCatalogId_name: {
          serviceCatalogId: serviceCatalog.id,
          name: template.name
        }
      },
      update: {
        description: template.description,
        requestType: 'service_request',
        isKasdaRelated: bsgCategoryName === 'KASDA',
        requiresGovApproval: bsgCategoryName === 'KASDA'
      },
      create: {
        serviceCatalogId: serviceCatalog.id,
        name: template.name,
        description: template.description,
        requestType: 'service_request',
        isKasdaRelated: bsgCategoryName === 'KASDA',
        requiresGovApproval: bsgCategoryName === 'KASDA',
        isActive: true,
        sortOrder: template.templateNumber
      }
    });
    
    // Create service template linking BSG template to legacy system
    await createServiceTemplateForBSG(serviceItem, template);
  }
  
  console.log(`    📝 Created ${bsgCategory.templates.length} service items for ${bsgCategoryName}`);
}

/**
 * Create service template linking BSG template to legacy system
 */
async function createServiceTemplateForBSG(serviceItem, bsgTemplate) {
  const serviceTemplate = await prisma.serviceTemplate.upsert({
    where: {
      serviceItemId_name: {
        serviceItemId: serviceItem.id,
        name: bsgTemplate.name
      }
    },
    update: {
      description: bsgTemplate.description,
      isKasdaTemplate: serviceItem.isKasdaRelated,
      requiresBusinessApproval: serviceItem.requiresGovApproval,
      templateType: serviceItem.isKasdaRelated ? 'kasda_specific' : 'standard'
    },
    create: {
      serviceItemId: serviceItem.id,
      name: bsgTemplate.name,
      description: bsgTemplate.description,
      templateType: serviceItem.isKasdaRelated ? 'kasda_specific' : 'standard',
      isKasdaTemplate: serviceItem.isKasdaRelated,
      requiresBusinessApproval: serviceItem.requiresGovApproval,
      isVisible: true,
      sortOrder: bsgTemplate.templateNumber
    }
  });
  
  // Create field definitions that map to BSG template fields
  await createServiceFieldDefinitionsForBSG(serviceTemplate, bsgTemplate);
  
  return serviceTemplate;
}

/**
 * Create service field definitions that map to BSG template fields
 */
async function createServiceFieldDefinitionsForBSG(serviceTemplate, bsgTemplate) {
  // Get BSG template fields
  const bsgFields = await prisma.bSGTemplateField.findMany({
    where: { templateId: bsgTemplate.id },
    orderBy: { sortOrder: 'asc' }
  });
  
  // Create corresponding service field definitions
  for (const bsgField of bsgFields) {
    await prisma.serviceFieldDefinition.upsert({
      where: {
        serviceTemplateId_fieldName: {
          serviceTemplateId: serviceTemplate.id,
          fieldName: bsgField.fieldName
        }
      },
      update: {
        fieldLabel: bsgField.fieldLabel,
        fieldType: mapBSGFieldTypeToLegacy(bsgField.fieldType),
        isRequired: bsgField.isRequired,
        placeholder: bsgField.placeholder,
        validationRules: bsgField.validationRules
      },
      create: {
        serviceTemplateId: serviceTemplate.id,
        fieldName: bsgField.fieldName,
        fieldLabel: bsgField.fieldLabel,
        fieldType: mapBSGFieldTypeToLegacy(bsgField.fieldType),
        isRequired: bsgField.isRequired,
        isKasdaSpecific: serviceTemplate.isKasdaTemplate,
        placeholder: bsgField.placeholder,
        validationRules: bsgField.validationRules,
        sortOrder: bsgField.sortOrder,
        isVisible: bsgField.isVisible
      }
    });
  }
}

/**
 * Map BSG field types to legacy field types
 */
function mapBSGFieldTypeToLegacy(bsgFieldType) {
  const mappings = {
    'text': 'text',
    'text_short': 'text',
    'number': 'number', 
    'currency': 'number',
    'date': 'date',
    'datetime': 'datetime',
    'dropdown_branch': 'select',
    'dropdown_olibs_menu': 'select',
    'textarea': 'textarea'
  };
  
  return mappings[bsgFieldType] || 'text';
}

/**
 * Create ticket integration mappings
 */
async function createTicketIntegrationMappings() {
  console.log('🔗 Creating ticket integration mappings...');
  
  // Update existing tickets to use BSG templates where applicable
  const bsgTickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { title: { contains: 'OLIBS' } },
        { title: { contains: 'BSGTouch' } },
        { title: { contains: 'BSGDirect' } },
        { title: { contains: 'QRIS' } },
        { title: { contains: 'KASDA' } }
      ]
    },
    include: { serviceCatalog: true }
  });
  
  console.log(`  📊 Found ${bsgTickets.length} potential BSG tickets to update`);
  
  // Create mapping table for future ticket routing
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS bsg_ticket_mappings (
      id SERIAL PRIMARY KEY,
      ticket_id INTEGER REFERENCES tickets(id),
      bsg_template_id INTEGER REFERENCES bsg_templates(id),
      service_template_id INTEGER REFERENCES service_templates(id),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  
  console.log('  ✅ Created BSG ticket mapping infrastructure');
}

/**
 * Create department expansion framework
 */
async function createDepartmentExpansionFramework() {
  console.log('🔧 Creating department expansion framework...');
  
  // Create a metadata table for future department-template mappings
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS bsg_department_mappings (
      id SERIAL PRIMARY KEY,
      bsg_category VARCHAR(100) NOT NULL,
      department_id INTEGER REFERENCES departments(id),
      is_primary BOOLEAN DEFAULT false,
      priority INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(bsg_category, department_id)
    );
  `;
  
  // Insert current mappings
  for (const [category, departmentName] of Object.entries(BSG_DEPARTMENT_MAPPINGS)) {
    const department = await prisma.department.findFirst({
      where: { name: departmentName }
    });
    
    if (department) {
      await prisma.$executeRaw`
        INSERT INTO bsg_department_mappings (bsg_category, department_id, is_primary, priority)
        VALUES (${category}, ${department.id}, true, 1)
        ON CONFLICT (bsg_category, department_id) DO NOTHING;
      `;
    }
  }
  
  console.log('  ✅ Created department expansion framework');
}

/**
 * Generate alignment summary
 */
async function generateAlignmentSummary() {
  console.log('\n📊 BSG-Legacy Alignment Summary:');
  
  // Count service catalogs by department
  const servicesByDept = await prisma.serviceCatalog.groupBy({
    by: ['departmentId'],
    _count: { id: true }
  });
  
  for (const group of servicesByDept) {
    const dept = await prisma.department.findUnique({
      where: { id: group.departmentId }
    });
    console.log(`   ${dept?.name || 'Unknown'}: ${group._count.id} services`);
  }
  
  // BSG template distribution
  const bsgTemplateCount = await prisma.bSGTemplate.count();
  const serviceTemplateCount = await prisma.serviceTemplate.count();
  const serviceItemCount = await prisma.serviceItem.count();
  
  console.log(`\n📊 Template Alignment:`)
  console.log(`   BSG Templates: ${bsgTemplateCount}`);
  console.log(`   Service Templates: ${serviceTemplateCount}`);
  console.log(`   Service Items: ${serviceItemCount}`);
  
  // KASDA/BSGDirect verification
  const dukunganDept = await prisma.department.findFirst({
    where: { name: 'Departement Dukungan & Layanan' },
    include: {
      _count: {
        select: { serviceCatalog: true }
      }
    }
  });
  
  console.log(`\n✅ KASDA/BSGDirect Department Verification:`);
  console.log(`   Departement Dukungan & Layanan: ${dukunganDept?._count.serviceCatalog || 0} services`);
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🚀 Starting BSG template and legacy category alignment...\n');
    
    // Step 1: Ensure departments exist
    const departments = await ensureDepartmentsExist();
    console.log();
    
    // Step 2: Create legacy service catalog entries
    await createLegacyServiceCatalog(departments);
    console.log();
    
    // Step 3: Create ticket integration mappings
    await createTicketIntegrationMappings();
    console.log();
    
    // Step 4: Create department expansion framework
    await createDepartmentExpansionFramework();
    console.log();
    
    // Step 5: Generate summary
    await generateAlignmentSummary();
    
    console.log('\n🎉 BSG template and legacy category alignment completed!');
    console.log('✅ KASDA and BSGDirect maintained in Departement Dukungan & Layanan');
    console.log('✅ Support for future department additions implemented');
    console.log('✅ Legacy service catalog integration complete');
    
  } catch (error) {
    console.error('❌ Fatal error during alignment:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions for use in other scripts
module.exports = {
  ensureDepartmentsExist,
  createLegacyServiceCatalog,
  BSG_DEPARTMENT_MAPPINGS,
  BSG_LEGACY_CATEGORY_MAPPINGS
};

// Run the script if called directly
if (require.main === module) {
  main();
}