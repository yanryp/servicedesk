#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTicketKasdaFlag() {
  console.log('🔧 Fixing KASDA flags for BSG tickets...\n');

  try {
    // Get all tickets with BSG field values
    const bsgTickets = await prisma.bSGTicketFieldValue.findMany({
      include: {
        ticket: true,
        field: {
          include: {
            template: {
              include: {
                category: true
              }
            }
          }
        }
      },
      distinct: ['ticketId']
    });

    console.log(`Found ${bsgTickets.length} tickets with BSG templates`);

    for (const bsgTicket of bsgTickets) {
      const ticket = bsgTicket.ticket;
      const category = bsgTicket.field.template.category;
      const shouldBeKasda = category?.name === 'KASDA';

      console.log(`\n🎫 Ticket #${ticket.id}: ${ticket.title}`);
      console.log(`   Template Category: ${category?.name}`);
      console.log(`   Current KASDA flag: ${ticket.isKasdaTicket}`);
      console.log(`   Should be KASDA: ${shouldBeKasda}`);

      if (ticket.isKasdaTicket !== shouldBeKasda) {
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { isKasdaTicket: shouldBeKasda }
        });
        console.log(`   ✅ Updated KASDA flag to: ${shouldBeKasda}`);
      } else {
        console.log(`   ✓ KASDA flag is correct`);
      }
    }

    // Specifically check ticket #24
    console.log('\n🔍 Checking ticket #24 specifically...');
    const ticket24 = await prisma.ticket.findUnique({
      where: { id: 24 }
    });

    if (ticket24) {
      console.log(`   Ticket #24 KASDA flag: ${ticket24.isKasdaTicket}`);
      
      // Find the BSG template for ticket 24
      const bsgFieldValues = await prisma.bSGTicketFieldValue.findMany({
        where: { ticketId: 24 },
        include: {
          field: {
            include: {
              template: {
                include: { category: true }
              }
            }
          }
        },
        take: 1
      });

      if (bsgFieldValues.length > 0) {
        const template = bsgFieldValues[0].field.template;
        console.log(`   Template: ${template.name} (Category: ${template.category?.name})`);
        const shouldBeKasda = template.category?.name === 'KASDA';
        
        if (ticket24.isKasdaTicket !== shouldBeKasda) {
          await prisma.ticket.update({
            where: { id: 24 },
            data: { isKasdaTicket: shouldBeKasda }
          });
          console.log(`   ✅ Fixed ticket #24 KASDA flag to: ${shouldBeKasda}`);
        }
      }
    }

    console.log('\n✨ KASDA flag fixing completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTicketKasdaFlag();