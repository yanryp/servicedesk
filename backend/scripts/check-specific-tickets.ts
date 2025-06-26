#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSpecificTickets() {
  console.log('🔍 Checking tickets 24 and 25...\n');

  try {
    for (const ticketId of [24, 25]) {
      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId }
      });

      if (ticket) {
        console.log(`🎫 Ticket #${ticketId}:`);
        console.log(`   Title: ${ticket.title}`);
        console.log(`   Status: ${ticket.status}`);
        console.log(`   KASDA ticket: ${ticket.isKasdaTicket}`);
        console.log(`   Assigned to: ${ticket.assignedToUserId || 'Unassigned'}`);
        console.log(`   Requires approval: ${ticket.requiresBusinessApproval}`);
        console.log();
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificTickets();