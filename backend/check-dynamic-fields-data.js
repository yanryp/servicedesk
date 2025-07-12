const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDynamicFieldsData() {
    try {
        // Check BSG templates and fields
        const bsgTemplates = await prisma.bSGTemplate.findMany({
            include: {
                fields: {
                    include: {
                        options: true,
                        fieldType: true
                    }
                },
                category: true
            },
            take: 5
        });

        console.log('BSG Templates with Fields:');
        console.log('==========================\n');

        if (bsgTemplates.length === 0) {
            console.log('No BSG templates found.');
        } else {
            for (const template of bsgTemplates) {
                console.log(`Template: ${template.displayName} (ID: ${template.id})`);
                console.log(`Category: ${template.category?.displayName || 'N/A'}`);
                console.log(`Fields Count: ${template.fields.length}`);
                
                if (template.fields.length > 0) {
                    console.log('\nFields:');
                    template.fields.forEach((field, index) => {
                        console.log(`  ${index + 1}. ${field.fieldLabel} (${field.fieldName})`);
                        console.log(`     Type: ${field.fieldType?.name || 'Unknown'}`);
                        console.log(`     Required: ${field.isRequired}`);
                        if (field.options && field.options.length > 0) {
                            console.log(`     Options: ${field.options.map(o => o.optionLabel).join(', ')}`);
                        }
                    });
                }
                console.log('\n-------------------------------------------\n');
            }
        }

        // Check field types
        const fieldTypes = await prisma.bSGFieldType.findMany();
        console.log('\nAvailable Field Types:');
        console.log('=====================');
        fieldTypes.forEach(ft => {
            console.log(`- ${ft.name} (${ft.displayName}) - HTML: ${ft.htmlInputType}`);
        });

        // Check a specific template with many fields
        const templateWithMostFields = await prisma.bSGTemplate.findFirst({
            orderBy: {
                fields: {
                    _count: 'desc'
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

        if (templateWithMostFields && templateWithMostFields.fields.length > 0) {
            console.log('\n\nTemplate with Most Dynamic Fields:');
            console.log('==================================');
            console.log(`Template: ${templateWithMostFields.displayName}`);
            console.log(`Total Fields: ${templateWithMostFields.fields.length}`);
            console.log('\nField Configuration:');
            
            templateWithMostFields.fields.forEach((field, index) => {
                console.log(`\nField ${index + 1}: ${field.fieldLabel}`);
                console.log(`  Name: ${field.fieldName}`);
                console.log(`  Type: ${field.fieldType?.name || 'Unknown'} (${field.fieldType?.htmlInputType || 'N/A'})`);
                console.log(`  Required: ${field.isRequired}`);
                console.log(`  Sort Order: ${field.sortOrder}`);
                
                if (field.placeholderText) {
                    console.log(`  Placeholder: ${field.placeholderText}`);
                }
                
                if (field.helpText) {
                    console.log(`  Help Text: ${field.helpText}`);
                }
                
                if (field.validationRules) {
                    console.log(`  Validation Rules: ${JSON.stringify(field.validationRules, null, 2)}`);
                }
                
                if (field.options && field.options.length > 0) {
                    console.log(`  Options (${field.options.length}):`);
                    field.options.forEach(opt => {
                        console.log(`    - ${opt.optionLabel} = ${opt.optionValue} ${opt.isDefault ? '(default)' : ''}`);
                    });
                }
            });
        }

        // Check service field definitions
        const serviceFieldCount = await prisma.serviceFieldDefinition.count();
        console.log(`\n\nTotal Service Field Definitions: ${serviceFieldCount}`);

        // Check BSG field options count
        const bsgFieldOptionCount = await prisma.bSGFieldOption.count();
        console.log(`Total BSG Field Options: ${bsgFieldOptionCount}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDynamicFieldsData();