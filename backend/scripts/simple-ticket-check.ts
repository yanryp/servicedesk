#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleTicketCheck() {
  console.log('🔍 Simple ticket check...\n');

  try {
    // Check ticket 24
    const ticket24 = await prisma.ticket.findUnique({
      where: { id: 24 }
    });

    console.log('🎫 Ticket #24:');
    console.log(`   Status: ${ticket24?.status}`);
    console.log(`   Assigned to: ${ticket24?.assignedToUserId || 'Unassigned'}`);
    console.log(`   KASDA ticket: ${ticket24?.isKasdaTicket}`);
    console.log(`   Requires approval: ${ticket24?.requiresBusinessApproval}`);

    // Check business approval
    const approval = await prisma.businessApproval.findUnique({
      where: { ticketId: 24 }
    });

    console.log('\n✅ Business Approval:');
    console.log(`   Status: ${approval?.approvalStatus || 'None'}`);
    console.log(`   Approved at: ${approval?.approvedAt || 'Not approved'}`);

    // Check all open tickets
    const openTickets = await prisma.ticket.findMany({
      where: { 
        status: 'open',
        assignedToUserId: null
      }
    });

    console.log(`\n📊 Open unassigned tickets: ${openTickets.length}`);
    openTickets.forEach(t => {
      console.log(`   #${t.id}: ${t.title} (KASDA: ${t.isKasdaTicket})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleTicketCheck();