const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findServicesWithDynamicFields() {
    try {
        console.log('🔍 Searching for Services with Dynamic Fields Configuration\n');
        console.log('=' .repeat(80) + '\n');

        // 1. Check Service Templates with Field Definitions
        const templatesWithFields = await prisma.serviceTemplate.findMany({
            where: {
                customFieldDefinitions: {
                    some: {}
                }
            },
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
            orderBy: { name: 'asc' }
        });

        if (templatesWithFields.length > 0) {
            console.log(`📋 Found ${templatesWithFields.length} Service Templates with Dynamic Fields:\n`);

            for (const template of templatesWithFields.slice(0, 5)) { // Show first 5
                console.log(`Template: ${template.name}`);
                console.log(`Service Item: ${template.serviceItem?.name || 'N/A'}`);
                console.log(`Category: ${template.serviceItem?.serviceCatalog?.name || 'N/A'}`);
                console.log(`Total Fields: ${template.customFieldDefinitions.length}`);
                console.log(`\nField Configurations:`);
                
                template.customFieldDefinitions.forEach((field, index) => {
                    console.log(`\n  ${index + 1}. ${field.fieldLabel}`);
                    console.log(`     Field Name: ${field.fieldName}`);
                    console.log(`     Type: ${field.fieldType}`);
                    console.log(`     Required: ${field.isRequired}`);
                    console.log(`     Sort Order: ${field.sortOrder}`);
                    
                    if (field.description) {
                        console.log(`     Description: ${field.description}`);
                    }
                    
                    if (field.options) {
                        console.log(`     Options: ${JSON.stringify(field.options, null, 2).replace(/\n/g, '\n     ')}`);
                    }
                    
                    if (field.validationRules) {
                        console.log(`     Validation: ${JSON.stringify(field.validationRules, null, 2).replace(/\n/g, '\n     ')}`);
                    }
                    
                    if (field.defaultValue) {
                        console.log(`     Default Value: ${field.defaultValue}`);
                    }
                });
                
                console.log('\n' + '-'.repeat(80) + '\n');
            }
        }

        // 2. Check BSG Templates and their fields
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
                    },
                    orderBy: { sortOrder: 'asc' }
                },
                category: true
            },
            orderBy: { displayName: 'asc' }
        });

        if (bsgTemplatesWithFields.length > 0) {
            console.log(`\n🏦 Found ${bsgTemplatesWithFields.length} BSG Templates with Dynamic Fields:\n`);

            // Show examples from different categories
            const categoriesShown = new Set();
            let templatesShown = 0;

            for (const template of bsgTemplatesWithFields) {
                if (templatesShown >= 5) break;
                if (categoriesShown.has(template.category?.displayName)) continue;
                
                categoriesShown.add(template.category?.displayName);
                templatesShown++;

                console.log(`BSG Template: ${template.displayName}`);
                console.log(`Category: ${template.category?.displayName || 'N/A'}`);
                console.log(`Total Fields: ${template.fields.length}`);
                console.log(`\nDynamic Field Configurations:`);
                
                template.fields.forEach((field, index) => {
                    console.log(`\n  ${index + 1}. ${field.fieldLabel}`);
                    console.log(`     Field Name: ${field.fieldName}`);
                    console.log(`     Type: ${field.fieldType?.name || 'Unknown'} (HTML: ${field.fieldType?.htmlInputType || 'N/A'})`);
                    console.log(`     Required: ${field.isRequired}`);
                    console.log(`     Sort Order: ${field.sortOrder}`);
                    
                    if (field.fieldDescription) {
                        console.log(`     Description: ${field.fieldDescription}`);
                    }
                    
                    if (field.placeholderText) {
                        console.log(`     Placeholder: ${field.placeholderText}`);
                    }
                    
                    if (field.helpText) {
                        console.log(`     Help Text: ${field.helpText}`);
                    }
                    
                    if (field.validationRules) {
                        console.log(`     Validation: ${JSON.stringify(field.validationRules, null, 2).replace(/\n/g, '\n     ')}`);
                    }
                    
                    if (field.options && field.options.length > 0) {
                        console.log(`     Options (${field.options.length}):`);
                        field.options.slice(0, 5).forEach(opt => {
                            console.log(`       - ${opt.optionLabel} = ${opt.optionValue}${opt.isDefault ? ' (default)' : ''}`);
                        });
                        if (field.options.length > 5) {
                            console.log(`       ... and ${field.options.length - 5} more options`);
                        }
                    }
                });
                
                console.log('\n' + '-'.repeat(80) + '\n');
            }
        }

        // 3. Summary of field types used
        console.log('\n📊 Dynamic Fields Summary:\n');

        // Count field types in service templates
        const serviceFieldTypes = await prisma.serviceFieldDefinition.groupBy({
            by: ['fieldType'],
            _count: {
                fieldType: true
            }
        });

        if (serviceFieldTypes.length > 0) {
            console.log('Service Template Field Types:');
            serviceFieldTypes.forEach(ft => {
                console.log(`  - ${ft.fieldType}: ${ft._count.fieldType} fields`);
            });
        }

        // Get BSG field types
        const bsgFieldTypes = await prisma.bSGFieldType.findMany({
            orderBy: { name: 'asc' }
        });

        if (bsgFieldTypes.length > 0) {
            console.log('\nBSG Field Types Available:');
            bsgFieldTypes.forEach(ft => {
                console.log(`  - ${ft.name} (${ft.displayName}): ${ft.htmlInputType}`);
            });
        }

        // 4. Examples of templates with the most fields
        const templateWithMostFields = await prisma.bSGTemplate.findFirst({
            orderBy: {
                fields: {
                    _count: 'desc'
                }
            },
            include: {
                fields: true,
                category: true
            }
        });

        if (templateWithMostFields && templateWithMostFields.fields.length > 0) {
            console.log(`\n🏆 Template with Most Dynamic Fields:`);
            console.log(`   ${templateWithMostFields.displayName} - ${templateWithMostFields.fields.length} fields`);
            console.log(`   Category: ${templateWithMostFields.category?.displayName || 'N/A'}`);
        }

        // 5. Check for templates with dropdown fields that use dynamic data
        const templatesWithDropdowns = await prisma.bSGTemplate.findMany({
            where: {
                fields: {
                    some: {
                        fieldType: {
                            htmlInputType: 'select'
                        }
                    }
                }
            },
            include: {
                fields: {
                    where: {
                        fieldType: {
                            htmlInputType: 'select'
                        }
                    },
                    include: {
                        options: true,
                        fieldType: true
                    }
                },
                category: true
            },
            take: 3
        });

        if (templatesWithDropdowns.length > 0) {
            console.log(`\n🔽 Examples of Templates with Dropdown Fields:\n`);
            
            templatesWithDropdowns.forEach(template => {
                console.log(`Template: ${template.displayName}`);
                template.fields.forEach(field => {
                    console.log(`  - ${field.fieldLabel}: ${field.options.length} options`);
                    if (field.options.length > 0 && field.options[0].masterDataType) {
                        console.log(`    Uses Master Data: ${field.options[0].masterDataType}`);
                    }
                });
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

findServicesWithDynamicFields();