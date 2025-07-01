import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function integrateBSGTemplatesWithServices() {
  console.log('🔗 Starting BSG Template-Service Integration...');

  try {
    // Get all BSG templates and service items
    const bsgTemplates = await prisma.bSGTemplate.findMany({
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

    const serviceItems = await prisma.serviceItem.findMany({
      include: {
        serviceCatalog: true
      }
    });

    console.log(`📋 Found ${bsgTemplates.length} BSG templates and ${serviceItems.length} service items`);

    // Create mapping logic between templates and service items
    const templateServiceMappings = new Map<number, number[]>();

    for (const template of bsgTemplates) {
      const templateName = template.name.toLowerCase();
      const matchedServiceIds: number[] = [];

      for (const serviceItem of serviceItems) {
        const serviceName = serviceItem.name.toLowerCase();
        
        // Direct name matching
        if (serviceName.includes(templateName.split(' - ')[0]) && 
            serviceName.includes(templateName.split(' - ')[1])) {
          matchedServiceIds.push(serviceItem.id);
        }
        
        // Application-based matching
        else if (templateName.includes('olibs') && serviceName.includes('olibs')) {
          // Match OLIBS templates with OLIBS services
          const templateAction = templateName.split(' - ')[1];
          if (serviceName.includes(templateAction.split(' ')[0])) {
            matchedServiceIds.push(serviceItem.id);
          }
        }
        
        else if (templateName.includes('kasda') && serviceName.includes('kasda')) {
          // Match KASDA templates with KASDA services
          matchedServiceIds.push(serviceItem.id);
        }
        
        else if (templateName.includes('xcard') && serviceName.includes('xcard')) {
          // Match XCARD templates with XCARD services
          matchedServiceIds.push(serviceItem.id);
        }
        
        else if (templateName.includes('klaim') && 
                 (serviceName.includes('klaim') || serviceItem.serviceCatalog.name.includes('Claims'))) {
          // Match claims templates with claims services
          matchedServiceIds.push(serviceItem.id);
        }
        
        // BSGTouch specific matching
        else if (templateName.includes('bsgtouch') && serviceName.includes('bsgtouch')) {
          matchedServiceIds.push(serviceItem.id);
        }
        
        // ATM specific matching
        else if (templateName.includes('atm') && serviceName.includes('atm')) {
          matchedServiceIds.push(serviceItem.id);
        }
      }

      if (matchedServiceIds.length > 0) {
        templateServiceMappings.set(template.id, matchedServiceIds);
      }
    }

    console.log(`🎯 Found ${templateServiceMappings.size} template-service mappings`);

    // Create ServiceTemplate relationships
    let serviceTemplateCount = 0;
    
    for (const [templateId, serviceIds] of templateServiceMappings) {
      for (const serviceId of serviceIds) {
        // Create ServiceTemplate entry (standard Prisma model)
        const bsgTemplate = bsgTemplates.find(t => t.id === templateId);
        if (bsgTemplate) {
          const existingMapping = await prisma.serviceTemplate.findFirst({
            where: {
              serviceItemId: serviceId,
              name: bsgTemplate.name
            }
          });

          if (!existingMapping) {
            await prisma.serviceTemplate.create({
              data: {
                serviceItemId: serviceId,
                name: bsgTemplate.name,
                description: bsgTemplate.description,
                templateType: 'standard',
                isKasdaTemplate: bsgTemplate.name.toLowerCase().includes('kasda'),
                requiresBusinessApproval: true,
                isVisible: true,
                sortOrder: serviceTemplateCount + 1
              }
            });
            serviceTemplateCount++;
          }
        }
      }
    }

    console.log(`✅ Created ${serviceTemplateCount} service-template relationships`);

    // Create default ServiceFieldDefinitions for common service items without templates
    console.log('📝 Creating default field definitions for services without templates...');
    
    const servicesWithoutTemplates = await prisma.serviceItem.findMany({
      where: {
        templates: {
          none: {}
        }
      },
      include: {
        serviceCatalog: true
      }
    });

    console.log(`🔧 Found ${servicesWithoutTemplates.length} services without templates`);

    let defaultFieldCount = 0;

    // Get default field types
    const textFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'text' } });
    const textareaFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'textarea' } });
    const selectFieldType = await prisma.bSGFieldType.findFirst({ where: { htmlInputType: 'select' } });

    if (!textFieldType || !textareaFieldType || !selectFieldType) {
      throw new Error('Required field types not found. Run BSG seed first.');
    }

    // Create default fields for services without templates
    for (const service of servicesWithoutTemplates) {
      const serviceName = service.name.toLowerCase();
      
      // Common fields for all services
      const commonFields = [
        {
          fieldName: 'urgency',
          fieldLabel: 'Urgency Level',
          fieldType: selectFieldType,
          isRequired: true,
          options: ['Low', 'Medium', 'High', 'Critical']
        },
        {
          fieldName: 'description',
          fieldLabel: 'Problem Description',
          fieldType: textareaFieldType,
          isRequired: true,
          options: []
        }
      ];

      // Service-specific fields
      let specificFields: any[] = [];

      if (serviceName.includes('error') || serviceName.includes('gangguan')) {
        specificFields = [
          {
            fieldName: 'error_message',
            fieldLabel: 'Error Message',
            fieldType: textFieldType,
            isRequired: false,
            options: []
          },
          {
            fieldName: 'steps_to_reproduce',
            fieldLabel: 'Steps to Reproduce',
            fieldType: textareaFieldType,
            isRequired: false,
            options: []
          }
        ];
      } else if (serviceName.includes('user') || serviceName.includes('pendaftaran')) {
        specificFields = [
          {
            fieldName: 'user_name',
            fieldLabel: 'User Name',
            fieldType: textFieldType,
            isRequired: true,
            options: []
          },
          {
            fieldName: 'position',
            fieldLabel: 'Position/Role',
            fieldType: textFieldType,
            isRequired: true,
            options: []
          }
        ];
      } else if (serviceName.includes('transaksi') || serviceName.includes('klaim')) {
        specificFields = [
          {
            fieldName: 'transaction_amount',
            fieldLabel: 'Transaction Amount',
            fieldType: textFieldType,
            isRequired: true,
            options: []
          },
          {
            fieldName: 'transaction_date',
            fieldLabel: 'Transaction Date',
            fieldType: textFieldType,
            isRequired: true,
            options: []
          },
          {
            fieldName: 'reference_number',
            fieldLabel: 'Reference Number',
            fieldType: textFieldType,
            isRequired: false,
            options: []
          }
        ];
      }

      const allFields = [...commonFields, ...specificFields];

      // Create ServiceFieldDefinitions
      for (let i = 0; i < allFields.length; i++) {
        const field = allFields[i];
        
        const serviceField = await prisma.serviceFieldDefinition.create({
          data: {
            service_item_id: service.id,
            fieldName: field.fieldName,
            fieldLabel: field.fieldLabel,
            fieldType: field.fieldType.htmlInputType === 'select' ? 'dropdown' : 
                      field.fieldType.htmlInputType === 'number' ? 'number' :
                      field.fieldType.htmlInputType === 'textarea' ? 'textarea' : 'text',
            isRequired: field.isRequired,
            sortOrder: i + 1,
            validationRules: field.isRequired ? { required: true } : {},
            placeholder: `Enter ${field.fieldLabel.toLowerCase()}`
          }
        });

        defaultFieldCount++;

        // Create field options for select fields
        if (field.options.length > 0) {
          for (let j = 0; j < field.options.length; j++) {
            const option = field.options[j];
            // Note: ServiceFieldDefinition options would need a separate table if implemented
            // For now, we'll store them in validationRules
            await prisma.serviceFieldDefinition.update({
              where: { id: serviceField.id },
              data: {
                validationRules: {
                  required: field.isRequired,
                  options: field.options
                }
              }
            });
          }
        }
      }
    }

    console.log(`✅ Created ${defaultFieldCount} default field definitions`);

    // Summary statistics
    const finalStats = {
      totalTemplates: bsgTemplates.length,
      totalServiceItems: serviceItems.length,
      templateServiceMappings: templateServiceMappings.size,
      serviceTemplateRelationships: serviceTemplateCount,
      servicesWithTemplates: templateServiceMappings.size,
      servicesWithDefaultFields: servicesWithoutTemplates.length,
      totalDynamicFields: bsgTemplates.reduce((sum, t) => sum + t.fields.length, 0),
      totalDefaultFields: defaultFieldCount
    };

    console.log(`
🎉 BSG Template-Service Integration Summary:
═══════════════════════════════════════════
📝 BSG Templates: ${finalStats.totalTemplates}
🛠️ Service Items: ${finalStats.totalServiceItems}
🔗 Template Mappings: ${finalStats.templateServiceMappings}
📋 Service-Template Links: ${finalStats.serviceTemplateRelationships}

📊 Field Coverage:
🎯 Services with BSG Templates: ${finalStats.servicesWithTemplates}
🔧 Services with Default Fields: ${finalStats.servicesWithDefaultFields}
📝 Total Dynamic Fields: ${finalStats.totalDynamicFields}
⚙️ Total Default Fields: ${finalStats.totalDefaultFields}

✅ Complete service catalog with dynamic forms ready!
    `);

  } catch (error) {
    console.error('❌ Error integrating templates with services:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the integration
integrateBSGTemplatesWithServices()
  .catch((error) => {
    console.error('❌ Template-service integration failed:', error);
    process.exit(1);
  });