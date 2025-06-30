const { PrismaClient } = require('@prisma/client');
const client = new PrismaClient();

async function analyzeFieldMappings() {
  console.log('=== CUSTOM FIELD MAPPINGS ANALYSIS ===\n');
  
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
  
  console.log('📊 TEMPLATES WITH CUSTOM FIELDS:\n');
  
  templates.forEach(template => {
    console.log(`🔧 Template: ${template.name}`);
    console.log(`   Service Item: ${template.serviceItem.name}`);
    console.log(`   Catalog: ${template.serviceItem.serviceCatalog.name}`);
    console.log(`   Field Count: ${template.customFieldDefinitions.length}`);
    
    template.customFieldDefinitions.forEach((field, index) => {
      console.log(`   ${index + 1}. ${field.fieldLabel} (${field.fieldType})${field.isRequired ? ' *REQUIRED*' : ''}`);
      if (field.placeholder) {
        console.log(`      Placeholder: ${field.placeholder}`);
      }
      if (field.defaultValue) {
        console.log(`      Default: ${field.defaultValue}`);
      }
    });
    console.log('');
  });
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`Total Templates with Fields: ${templates.length}`);
  console.log(`Total Custom Fields: ${templates.reduce((sum, t) => sum + t.customFieldDefinitions.length, 0)}`);
}

analyzeFieldMappings().catch(console.error).finally(() => process.exit());