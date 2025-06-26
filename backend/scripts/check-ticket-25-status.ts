#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicket25Status() {
  console.log('🔍 Checking ticket #25 status...\n');

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: 25 },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        createdBy: {
          include: {
            department: true,
            unit: true
          }
        },
        businessApproval: {
          include: {
            businessReviewer: true
          }
        }
      }
    });

    if (ticket) {
      console.log(`🎫 Ticket #25:`);
      console.log(`   Title: ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   KASDA ticket: ${ticket.isKasdaTicket}`);
      console.log(`   Creator: ${ticket.createdBy?.username}`);
      console.log(`   Creator unit: ${ticket.createdBy?.unit?.name || 'None'}`);
      console.log(`   Requires approval: ${ticket.requiresBusinessApproval}`);
      console.log(`   Approval status: ${ticket.businessApproval?.approvalStatus || 'None'}`);
      console.log(`   Approved by: ${ticket.businessApproval?.businessReviewer?.username || 'None'}`);
      console.log(`   Service catalog: ${ticket.serviceCatalog?.name || 'None'}`);
      console.log(`   Service catalog department: ${ticket.serviceCatalog?.department?.name || 'None'}`);
      console.log(`   Service item: ${ticket.serviceItem?.name || 'None'}`);
      console.log();
    } else {
      console.log('❌ Ticket #25 not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicket25Status();