// Debug script for ATM-Transfer ATM Bank Lain service
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugATMTransferService() {
  console.log('🔍 Debugging ATM-Transfer ATM Bank Lain service...\n');

  try {
    // 1. Find the service
    const service = await prisma.service.findFirst({
      where: {
        name: { contains: 'ATM-Transfer ATM Bank Lain' }
      },
      include: {
        category: true,
        templates: {
          include: {
            fields: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    if (!service) {
      console.log('❌ Service not found!');
      return;
    }

    console.log('✅ Service found:');
    console.log(`   ID: ${service.id}`);
    console.log(`   Name: ${service.name}`);
    console.log(`   Description: ${service.description}`);
    console.log(`   Category: ${service.category.name} (ID: ${service.category.id})`);
    console.log(`   hasTemplate: ${service.hasTemplate}`);
    console.log(`   templateId: ${service.templateId}`);
    console.log(`   Templates count: ${service.templates.length}\n`);

    // 2. Check service flags
    console.log('🏷️ Service Configuration:');
    console.log(`   hasTemplate: ${service.hasTemplate}`);
    console.log(`   templateId: ${service.templateId}`);
    console.log(`   requestType: ${service.requestType}`);
    console.log(`   isKasdaRelated: ${service.isKasdaRelated}`);
    console.log(`   requiresBusinessApproval: ${service.requiresBusinessApproval}\n`);

    // 3. Analyze templates
    if (service.templates.length > 0) {
      console.log('📋 Template Analysis:');
      service.templates.forEach((template, index) => {
        console.log(`   Template ${index + 1}:`);
        console.log(`     ID: ${template.id}`);
        console.log(`     Name: ${template.name}`);
        console.log(`     Description: ${template.description}`);
        console.log(`     templateType: ${template.templateType}`);
        console.log(`     Fields count: ${template.fields.length}`);
        
        if (template.fields.length > 0) {
          console.log(`     Fields:`);
          template.fields.forEach(field => {
            console.log(`       - ${field.name} (${field.type}) - Required: ${field.isRequired}`);
            if (field.options.length > 0) {
              console.log(`         Options: ${field.options.map(opt => opt.value).join(', ')}`);
            }
          });
        } else {
          console.log(`     ❌ NO FIELDS DEFINED`);
        }
        console.log('');
      });
    } else {
      console.log('❌ No templates found for this service\n');
    }

    // 4. Check API endpoint simulation
    console.log('🌐 API Endpoint Simulation:');
    
    // Simulate /service-catalog/category/{categoryId}/services response
    console.log(`   GET /service-catalog/category/${service.categoryId}/services`);
    const categoryServices = await prisma.service.findMany({
      where: { categoryId: service.categoryId },
      include: {
        templates: {
          include: {
            fields: true
          }
        }
      }
    });
    
    const atmService = categoryServices.find(s => s.name.includes('ATM-Transfer ATM Bank Lain'));
    if (atmService) {
      console.log(`     Service found in category response:`);
      console.log(`     - hasTemplate: ${atmService.hasTemplate}`);
      console.log(`     - templateId: ${atmService.templateId}`);
      console.log(`     - fields property: ${atmService.fields ? 'present' : 'missing'}`);
      console.log(`     - templates.length: ${atmService.templates.length}`);
      console.log(`     - total fields across templates: ${atmService.templates.reduce((acc, t) => acc + t.fields.length, 0)}`);
    }

    // 5. Simulate /service-catalog/service/{serviceId}/template response
    console.log(`\n   GET /service-catalog/service/${service.id}/template`);
    
    // This would be the dedicated template endpoint
    const serviceTemplate = await prisma.service.findUnique({
      where: { id: service.id },
      include: {
        templates: {
          include: {
            fields: {
              include: {
                options: true
              }
            }
          }
        }
      }
    });

    if (serviceTemplate && serviceTemplate.templates.length > 0) {
      const mainTemplate = serviceTemplate.templates[0]; // Use first template
      console.log(`     Template endpoint would return:`);
      console.log(`     - Template: ${mainTemplate.name}`);
      console.log(`     - Fields: ${mainTemplate.fields.length}`);
      if (mainTemplate.fields.length > 0) {
        console.log(`     - Field details:`);
        mainTemplate.fields.forEach(field => {
          console.log(`       * ${field.name} (${field.type})`);
        });
      } else {
        console.log(`     ❌ Template has no fields defined`);
      }
    } else {
      console.log(`     ❌ No template data available`);
    }

    // 6. Check if this is the root cause
    console.log('\n🔍 Root Cause Analysis:');
    if (service.templates.every(t => t.fields.length === 0)) {
      console.log('❌ ISSUE IDENTIFIED: All templates for this service have zero fields');
      console.log('   This explains why dynamic fields are not showing in the customer portal');
      console.log('   The customer portal checks for service.fields or service.hasTemplate');
      console.log('   but the actual templates have no fields defined.');
    } else {
      console.log('✅ Service has fields defined in templates');
    }

    // 7. Check what customer portal sees
    console.log('\n👥 Customer Portal Perspective:');
    console.log('   The loadDynamicFields function in CustomerTicketCreation.tsx:');
    console.log(`   - Receives templateId: ${service.templateId}`);
    console.log(`   - Receives fields array: ${service.fields || '[]'} (probably empty)`);
    console.log('   - This explains why no dynamic fields are displayed');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugATMTransferService();