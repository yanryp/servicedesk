#!/usr/bin/env node

/**
 * Debug BSG Data Structure
 * Check what data we actually have in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugBSGData() {
    console.log('🔍 Debugging BSG Data Structure');
    console.log('===============================\n');

    try {
        // Check recent tickets
        const recentTickets = await prisma.ticket.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                createdBy: true,
                bsgFieldValues: {
                    include: {
                        field: true
                    }
                }
            }
        });

        console.log(`🎫 Recent Tickets (${recentTickets.length}):`);
        recentTickets.forEach(ticket => {
            console.log(`   • ${ticket.title.substring(0, 50)}...`);
            console.log(`     Created by: ${ticket.createdBy.name || ticket.createdBy.username}`);
            console.log(`     BSG Fields: ${ticket.bsgFieldValues.length}`);
            
            if (ticket.bsgFieldValues.length > 0) {
                ticket.bsgFieldValues.forEach(fieldValue => {
                    console.log(`       - ${fieldValue.field.fieldName}: ${fieldValue.fieldValue}`);
                });
            }
            console.log('');
        });

        // Check BSG field types
        const fieldTypes = await prisma.bSGFieldType.findMany();
        console.log(`🔧 BSG Field Types (${fieldTypes.length}):`);
        fieldTypes.forEach(ft => {
            console.log(`   • ${ft.name}: ${ft.displayName}`);
        });

        // Check BSG template fields
        const templateFields = await prisma.bSGTemplateField.findMany({
            include: {
                fieldType: true
            }
        });
        console.log(`\n📋 BSG Template Fields (${templateFields.length}):`);
        templateFields.forEach(tf => {
            console.log(`   • ${tf.fieldName}: ${tf.fieldLabel} (Type: ${tf.fieldType?.name || 'Unknown'})`);
        });

        // Check BSG ticket field values
        const ticketFieldValues = await prisma.bSGTicketFieldValue.findMany({
            include: {
                field: true,
                ticket: true
            }
        });
        console.log(`\n💾 BSG Ticket Field Values (${ticketFieldValues.length}):`);
        ticketFieldValues.forEach(tfv => {
            console.log(`   • Ticket ${tfv.ticketId}: ${tfv.field.fieldName} = ${tfv.fieldValue}`);
        });

        // Test the exact query used by the reporting system
        console.log(`\n🔍 Testing Reporting Query...`);
        const testQuery = await prisma.ticket.findMany({
            where: {
                bsgFieldValues: {
                    some: {
                        field: {
                            fieldName: 'applicationName'
                        }
                    }
                }
            },
            include: {
                createdBy: {
                    include: {
                        unit: true,
                        department: true
                    }
                },
                bsgFieldValues: {
                    include: {
                        field: true
                    }
                }
            },
            take: 5
        });

        console.log(`📊 Query Result: Found ${testQuery.length} tickets with applicationName field`);
        testQuery.forEach(ticket => {
            const appField = ticket.bsgFieldValues.find(fv => fv.field.fieldName === 'applicationName');
            console.log(`   • ${ticket.title.substring(0, 40)}... -> ${appField?.fieldValue || 'No app name'}`);
        });

    } catch (error) {
        console.error('❌ Error debugging BSG data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugBSGData();