#!/usr/bin/env node

/**
 * Add BSG Field Values to Created Tickets
 * This script adds BSG application field values to make the reporting system work properly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addBSGFieldValues() {
    console.log('🔧 Adding BSG Field Values to Tickets');
    console.log('====================================\n');

    try {
        // Get the tickets we just created (last 10 tickets)
        const recentTickets = await prisma.ticket.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                createdBy: true
            }
        });

        console.log(`🎫 Found ${recentTickets.length} recent tickets to process`);

        // Check what BSG field types exist
        const fieldTypes = await prisma.bSGFieldType.findMany({
            where: { isActive: true }
        });

        console.log(`🔧 Found ${fieldTypes.length} BSG field types:`);
        fieldTypes.forEach(ft => {
            console.log(`   • ${ft.name} (${ft.displayName})`);
        });

        // Create field types if they don't exist
        const requiredFields = [
            { name: 'applicationName', displayName: 'Application Name', htmlInputType: 'select' },
            { name: 'kodeUser', displayName: 'User Code', htmlInputType: 'text' },
            { name: 'namaUser', displayName: 'User Name', htmlInputType: 'text' },
            { name: 'jabatan', displayName: 'Position/Role', htmlInputType: 'text' }
        ];

        console.log('\n🛠️  Creating/updating BSG field types...');
        const createdFields = {};

        for (const field of requiredFields) {
            try {
                const fieldType = await prisma.bSGFieldType.upsert({
                    where: { name: field.name },
                    update: {},
                    create: field
                });
                createdFields[field.name] = fieldType;
                console.log(`✅ Field type ready: ${field.name}`);
            } catch (error) {
                console.log(`⚠️  Could not create field type ${field.name}: ${error.message}`);
            }
        }

        // Extract BSG data from ticket descriptions and create field values
        const bsgDataPattern = /--- BSG Application Details ---\nApplication: ([^\n]+)\nUser Code: ([^\n]+)\nUser Name: ([^\n]+)\nPosition: ([^\n]+)/;
        
        let processedTickets = 0;
        let createdValues = 0;

        for (const ticket of recentTickets) {
            const match = ticket.description.match(bsgDataPattern);
            
            if (match) {
                const [, applicationName, kodeUser, namaUser, jabatan] = match;
                
                console.log(`\n📝 Processing ticket: ${ticket.title.substring(0, 50)}...`);
                console.log(`   Application: ${applicationName}`);
                console.log(`   User: ${namaUser} (${kodeUser})`);
                console.log(`   Position: ${jabatan}`);

                // Create field values
                const fieldMappings = [
                    { fieldName: 'applicationName', value: applicationName },
                    { fieldName: 'kodeUser', value: kodeUser },
                    { fieldName: 'namaUser', value: namaUser },
                    { fieldName: 'jabatan', value: jabatan }
                ];

                for (const mapping of fieldMappings) {
                    const fieldType = createdFields[mapping.fieldName];
                    
                    if (fieldType) {
                        try {
                            await prisma.bSGTicketFieldValue.create({
                                data: {
                                    ticketId: ticket.id,
                                    fieldId: fieldType.id,
                                    fieldValue: mapping.value
                                }
                            });
                            createdValues++;
                            console.log(`   ✅ Added ${mapping.fieldName}: ${mapping.value}`);
                        } catch (error) {
                            console.log(`   ⚠️  Could not add ${mapping.fieldName}: ${error.message}`);
                        }
                    }
                }
                
                processedTickets++;
            } else {
                console.log(`⚠️  No BSG data found in ticket: ${ticket.title.substring(0, 30)}...`);
            }
        }

        console.log(`\n🎯 BSG Field Values Addition Complete!`);
        console.log(`📊 Processed ${processedTickets} tickets`);
        console.log(`🔧 Created ${createdValues} field values`);
        console.log(`📈 Ready for BSG user access reporting`);

        console.log(`\n💡 Now run the report to see populated data:`);
        console.log(`   node generate-users-by-apps-report.js`);

    } catch (error) {
        console.error('❌ Error adding BSG field values:', error);
    } finally {
        await prisma.$disconnect();
    }
}

addBSGFieldValues();