const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigateTransferAntarBank() {
  try {
    console.log('🔍 Investigating Transfer Antar Bank service...');

    // First, let's find all services with "Transfer Antar Bank" in the name
    const services = await prisma.service.findMany({
      where: {
        name: {
          contains: 'Transfer Antar Bank'
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

    console.log(`\n📋 Found ${services.length} services with "Transfer Antar Bank":`);
    
    services.forEach((service, index) => {
      console.log(`\n  ${index + 1}. Service: ${service.name} (ID: ${service.id})`);
      console.log(`     Description: ${service.description || 'N/A'}`);
      console.log(`     Service Items: ${service.serviceItems.length}`);
      
      service.serviceItems.forEach((item, itemIndex) => {
        console.log(`\n       Item ${itemIndex + 1}: ${item.name} (ID: ${item.id})`);
        console.log(`         Templates: ${item.templates.length}`);
        
        item.templates.forEach((template, templateIndex) => {
          console.log(`\n           Template ${templateIndex + 1}: ${template.name} (ID: ${template.id})`);
          console.log(`             Fields: ${template.customFieldDefinitions.length}`);
          console.log(`             Visible: ${template.isVisible}`);
          console.log(`             Sort Order: ${template.sortOrder}`);
          
          if (template.customFieldDefinitions.length > 0) {
            console.log(`             Field Details:`);
            template.customFieldDefinitions.forEach((field, fieldIndex) => {
              console.log(`               ${fieldIndex + 1}. ${field.fieldLabel} (${field.fieldType})`);
            });
          }
        });
      });
    });
    
    // Let's also check serviceCatalog for BSGTouch
    const bsgTouchCatalog = await prisma.serviceCatalog.findFirst({
      where: {
        name: {
          contains: 'BSGTouch'
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
    
    if (bsgTouchCatalog) {
      console.log(`\n🎯 BSGTouch ServiceCatalog: ${bsgTouchCatalog.name} (ID: ${bsgTouchCatalog.id})`);
      console.log(`   Description: ${bsgTouchCatalog.description || 'N/A'}`);
      console.log(`   Service Items: ${bsgTouchCatalog.serviceItems.length}`);
      
      bsgTouchCatalog.serviceItems.forEach((item, itemIndex) => {
        if (item.name.includes('Transfer Antar Bank')) {
          console.log(`\n     Item ${itemIndex + 1}: ${item.name} (ID: ${item.id})`);
          console.log(`       Templates: ${item.templates.length}`);
          
          item.templates.forEach((template, templateIndex) => {
            console.log(`\n         Template ${templateIndex + 1}: ${template.name} (ID: ${template.id})`);
            console.log(`           Fields: ${template.customFieldDefinitions.length}`);
            console.log(`           Visible: ${template.isVisible}`);
            console.log(`           Sort Order: ${template.sortOrder}`);
            
            if (template.customFieldDefinitions.length > 0) {
              console.log(`           Field Details:`);
              template.customFieldDefinitions.forEach((field, fieldIndex) => {
                console.log(`             ${fieldIndex + 1}. ${field.fieldLabel} (${field.fieldType})`);
              });
            }
          });
        }
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

investigateTransferAntarBank();