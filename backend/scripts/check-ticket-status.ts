#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicketStatus() {
  console.log('🔍 Checking ticket #24 status...\n');

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: 24 },
      include: {
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        },
        assignedTo: {
          include: {
            unit: true,
            department: true
          }
        },
        businessApproval: true
      }
    });

    if (!ticket) {
      console.log('❌ Ticket #24 not found');
      return;
    }

    console.log('🎫 Ticket #24 Details:');
    console.log(`   Title: ${ticket.title}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Priority: ${ticket.priority}`);
    console.log(`   Created by: ${ticket.createdBy.email} (${ticket.createdBy.unit?.name})`);
    console.log(`   Assigned to: ${ticket.assignedTo?.email || 'Not assigned'}`);
    console.log(`   Requires approval: ${ticket.requiresBusinessApproval}`);
    console.log(`   Is KASDA ticket: ${ticket.isKasdaTicket}`);

    if (ticket.businessApproval) {
      console.log('\n✅ Business Approval:');
      console.log(`   Status: ${ticket.businessApproval.status}`);
      console.log(`   Approved at: ${ticket.businessApproval.approvedAt || 'Not approved'}`);
    }

    // Check the tickets page filter logic
    console.log('\n🔍 Checking IT department tickets query...');
    const itTickets = await prisma.ticket.findMany({
      where: {
        OR: [
          {
            // Tickets assigned to IT department users
            assignedTo: {
              departmentId: 1 // IT department
            }
          },
          {
            // Unassigned tickets that should go to IT (OLIBS, etc.)
            AND: [
              { assignedToUserId: null },
              { status: 'open' },
              {
                OR: [
                  { isKasdaTicket: false },
                  { isKasdaTicket: null }
                ]
              }
            ]
          }
        ]
      },
      include: {
        createdBy: true,
        assignedTo: true
      }
    });

    console.log(`\\n📊 IT department tickets found: ${itTickets.length}`);
    itTickets.forEach(t => {
      console.log(`   #${t.id}: ${t.title} (Status: ${t.status}, Assigned: ${t.assignedTo?.email || 'Unassigned'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicketStatus();