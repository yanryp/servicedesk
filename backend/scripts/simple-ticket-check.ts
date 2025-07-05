#\!/usr/bin/env npx ts-node

// Simple ticket check to validate our recent tests
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRecentTickets() {
  try {
    console.log('🔍 Checking Recent Test Tickets...');
    console.log('');
    
    // Get tickets 11-14 (our test tickets)
    const testTickets = await prisma.ticket.findMany({
      where: {
        id: {
          gte: 11,
          lte: 14
        }
      },
      orderBy: { id: 'asc' },
      include: {
        createdBy: {
          select: { email: true }
        }
      }
    });
    
    console.log(`📊 Found ${testTickets.length} test tickets:`);
    console.log('');
    
    for (const ticket of testTickets) {
      console.log(`🎫 Ticket #${ticket.id}:`);
      console.log(`   Title: ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Priority: ${ticket.priority}`);
      console.log(`   Service ID: ${ticket.serviceItemId}`);
      console.log(`   KASDA Ticket: ${ticket.isKasdaTicket ? 'Yes' : 'No'}`);
      console.log(`   Requires Approval: ${ticket.requiresBusinessApproval ? 'Yes' : 'No'}`);
      console.log(`   Created By: ${ticket.createdBy.email}`);
      console.log(`   Created: ${ticket.createdAt?.toLocaleString()}`);
      console.log('');
    }
    
    console.log('✅ Analysis complete\!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentTickets();
EOF < /dev/null