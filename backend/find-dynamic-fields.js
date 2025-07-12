const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findDynamicFields() {
    try {
        // Find service templates with custom field definitions
        const templatesWithFields = await prisma.serviceTemplate.findMany({
            where: {
                customFieldDefinitions: {
                    some: {}
                }
            },
            include: {
                customFieldDefinitions: true,
                serviceItem: {
                    include: {
                        serviceCatalog: true
                    }
                }
            }
        });

        console.log('Services with Dynamic Fields Configuration:');
        console.log('==========================================\n');

        for (const template of templatesWithFields) {
            console.log(`Template: ${template.name}`);
            console.log(`Service: ${template.serviceItem?.name || 'N/A'}`);
            console.log(`Category: ${template.serviceItem?.serviceCatalog?.name || 'N/A'}`);
            console.log(`\nDynamic Fields:`);
            
            template.customFieldDefinitions.forEach((field, index) => {
                console.log(`\n  Field ${index + 1}:`);
                console.log(`    Name: ${field.fieldName}`);
                console.log(`    Label: ${field.fieldLabel}`);
                console.log(`    Type: ${field.fieldType}`);
                console.log(`    Required: ${field.isRequired}`);
                console.log(`    Description: ${field.description || 'N/A'}`);
                if (field.options) {
                    console.log(`    Options: ${JSON.stringify(field.options)}`);
                }
                if (field.validationRules) {
                    console.log(`    Validation: ${JSON.stringify(field.validationRules)}`);
                }
            });
            console.log('\n-------------------------------------------\n');
        }

        // Also check BSG templates with fields
        const bsgTemplatesWithFields = await prisma.bSGTemplate.findMany({
            where: {
                fields: {
                    some: {}
                }
            },
            include: {
                fields: {
                    include: {
                        options: true,
                        fieldType: true
                    }
                },
                category: true
            }
        });

        if (bsgTemplatesWithFields.length > 0) {
            console.log('\nBSG Templates with Dynamic Fields:');
            console.log('==================================\n');

            for (const template of bsgTemplatesWithFields) {
                console.log(`Template: ${template.displayName}`);
                console.log(`Category: ${template.category?.displayName || 'N/A'}`);
                console.log(`\nDynamic Fields:`);
                
                template.fields.forEach((field, index) => {
                    console.log(`\n  Field ${index + 1}:`);
                    console.log(`    Name: ${field.fieldName}`);
                    console.log(`    Label: ${field.fieldLabel}`);
                    console.log(`    Type: ${field.fieldType?.name || field.fieldTypeId}`);
                    console.log(`    Required: ${field.isRequired}`);
                    console.log(`    Description: ${field.fieldDescription || 'N/A'}`);
                    if (field.options && field.options.length > 0) {
                        console.log(`    Options:`);
                        field.options.forEach(opt => {
                            console.log(`      - ${opt.optionLabel} (${opt.optionValue})`);
                        });
                    }
                });
                console.log('\n-------------------------------------------\n');
            }
        }

        // Check service field definitions
        const serviceFieldDefs = await prisma.serviceFieldDefinition.findMany({
            include: {
                service_items: {
                    include: {
                        serviceCatalog: true
                    }
                },
                serviceTemplate: true
            },
            take: 10
        });

        if (serviceFieldDefs.length > 0) {
            console.log('\nService Field Definitions:');
            console.log('==========================\n');

            for (const field of serviceFieldDefs) {
                console.log(`Field: ${field.fieldLabel}`);
                console.log(`  Name: ${field.fieldName}`);
                console.log(`  Type: ${field.fieldType}`);
                console.log(`  Required: ${field.isRequired}`);
                console.log(`  Service Item: ${field.service_items?.name || 'N/A'}`);
                console.log(`  Template: ${field.serviceTemplate?.name || 'N/A'}`);
                if (field.options) {
                    console.log(`  Options: ${JSON.stringify(field.options)}`);
                }
                console.log('');
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findDynamicFields();