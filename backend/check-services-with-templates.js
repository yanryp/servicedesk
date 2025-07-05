const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { PrismaClient } = require('@prisma/client');

async function checkServicesWithTemplates() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Checking services with templates...\n');
        
        // Check service items with templates
        const servicesWithTemplates = await prisma.serviceItem.findMany({
            where: {
                templates: {
                    some: {}
                }
            },
            include: {
                serviceCatalog: {
                    select: {
                        name: true,
                        id: true
                    }
                },
                templates: {
                    select: {
                        id: true,
                        name: true,
                        templateType: true,
                        isKasdaTemplate: true
                    }
                }
            },
            take: 20
        });
        
        console.log(`Found ${servicesWithTemplates.length} services with templates:`);
        servicesWithTemplates.forEach((service, index) => {
            console.log(`${index + 1}. ${service.name} (Category: ${service.serviceCatalog?.name})`);
            console.log(`   - Templates: ${service.templates.length}`);
            service.templates.forEach(template => {
                console.log(`     - ${template.name} (${template.templateType}) ${template.isKasdaTemplate ? '[KASDA]' : ''}`);
            });
            console.log('');
        });
        
        // Check BSG templates that are active
        console.log('🔍 Checking BSG templates...\n');
        const bsgTemplates = await prisma.bSGTemplate.findMany({
            where: {
                isActive: true
            },
            include: {
                fields: {
                    select: {
                        fieldName: true,
                        fieldLabel: true,
                        fieldType: true,
                        isRequired: true
                    }
                }
            },
            take: 10
        });
        
        console.log(`Found ${bsgTemplates.length} active BSG templates:`);
        bsgTemplates.forEach((template, index) => {
            console.log(`${index + 1}. ${template.templateName} (ID: ${template.id})`);
            console.log(`   - Description: ${template.description}`);
            console.log(`   - Category: ${template.category}`);
            console.log(`   - Fields: ${template.fields.length}`);
            if (template.fields.length > 0) {
                template.fields.forEach(field => {
                    console.log(`     - ${field.fieldLabel} (${field.fieldType}) ${field.isRequired ? '*' : ''}`);
                });
            }
            console.log('');
        });
        
    } catch (error) {
        console.error('Error checking services:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkServicesWithTemplates();