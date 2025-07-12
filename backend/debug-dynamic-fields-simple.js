const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDynamicFields() {
  try {
    console.log('=== DEBUGGING DYNAMIC FIELDS IN CUSTOMER PORTAL ===\n');

    // 1. Check BSG Templates (these are what the customer portal uses)
    console.log('1. BSG TEMPLATES WITH FIELDS:');
    console.log('='.repeat(50));
    
    const bsgTemplates = await prisma.bSGTemplate.findMany({
      include: {
        category: true,
        fields: {
          include: {
            fieldType: true
          }
        }
      }
    });
    
    console.log(`Found ${bsgTemplates.length} BSG templates with fields defined\n`);
    
    // Show specific services mentioned
    const specificNames = [
      'OLIBs - Pendaftaran User Baru',
      'ATM-Permasalahan Teknis'
    ];
    
    console.log('Checking specific services:\n');
    
    for (const searchName of specificNames) {
      const template = bsgTemplates.find(t => 
        t.name.includes(searchName) || 
        t.displayName?.includes(searchName)
      );
      
      if (template) {
        console.log(`✓ Found: ${template.displayName || template.name}`);
        console.log(`  ID: ${template.id}`);
        console.log(`  Category: ${template.category.displayName}`);
        console.log(`  Has fields: ${template.fields && template.fields.length > 0 ? 'YES' : 'NO'}`);
        if (template.fields && template.fields.length > 0) {
          console.log(`  Field count: ${template.fields.length}`);
          console.log(`  Fields:`);
          template.fields.forEach(field => {
            console.log(`    - ${field.fieldLabel} (${field.fieldName}) - Type: ${field.fieldType?.name || 'unknown'}${field.isRequired ? ' [Required]' : ''}`);
          });
        }
      } else {
        console.log(`✗ Not found: ${searchName}`);
      }
      console.log('-'.repeat(40));
    }
    
    // 2. Show how the backend transforms BSG templates
    console.log('\n2. BACKEND TRANSFORMATION LOGIC:');
    console.log('='.repeat(50));
    console.log('The serviceCatalogRoutes.ts transforms BSG templates like this:');
    console.log('- Takes template.fields from BSGTemplate');
    console.log('- Transforms them into a format the customer portal expects');
    console.log('- Adds application name field and user selection fields');
    console.log('- Returns as "fields" array in the service object');
    
    // 3. Show all BSG templates with fields
    console.log('\n3. ALL BSG TEMPLATES WITH FIELDS (Total: ' + bsgTemplates.length + '):');
    console.log('='.repeat(50));
    
    const templatesWithFields = bsgTemplates.filter(t => t.fields && t.fields.length > 0);
    console.log(`\nTemplates with fields: ${templatesWithFields.length} out of ${bsgTemplates.length}\n`);
    
    templatesWithFields.forEach((template, index) => {
      console.log(`${index + 1}. ${template.displayName || template.name}`);
      console.log(`   Category: ${template.category.displayName}`);
      console.log(`   Fields: ${template.fields.length}`);
    });
    
    // 4. Check the actual service catalog endpoint response format
    console.log('\n4. EXPECTED API RESPONSE FORMAT:');
    console.log('='.repeat(50));
    console.log('Customer portal expects services with this structure:');
    console.log(`{
  id: "bsg_template_<id>",
  name: "Service Name",
  hasFields: true,
  fieldCount: <number>,
  hasTemplate: true,
  fields: [
    {
      fieldName: "field_name",
      fieldLabel: "Field Label",
      fieldType: "text|select|textarea|etc",
      isRequired: true/false,
      options: [...] // for select fields
    }
  ]
}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDynamicFields();