const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simulate the pending-approvals endpoint logic
async function simulateEndpoint(userId) {
  console.log(`🔍 Simulating GET /pending-approvals for user ID: ${userId}`);
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { unit: true, department: true }
  });
  
  console.log(`👤 User: ${user.username} (Role: ${user.role}, Business Reviewer: ${user.isBusinessReviewer})`);
  
  // Check role authorization (from enhancedTicketRoutes.ts line 1207-1212)
  if (user?.role !== 'manager' && user?.role !== 'admin') {
    console.log('❌ Access denied: Not a manager or admin');
    return [];
  }
  
  // Query BusinessApproval table (from enhancedTicketRoutes.ts line 1218-1332)
  const businessApprovals = await prisma.businessApproval.findMany({
    where: {
      businessReviewerId: user.id,
      approvalStatus: 'pending'
    },
    include: {
      ticket: {
        include: {
          createdBy: {
            include: {
              department: {
                select: {
                  id: true,
                  name: true
                }
              },
              unit: {
                select: {
                  id: true,
                  name: true,
                  unitType: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Extract tickets from business approvals and add approval context
  const pendingTickets = businessApprovals.map(approval => ({
    ...approval.ticket,
    businessApprovalId: approval.id,
    approvalStatus: approval.approvalStatus,
    businessComments: approval.businessComments,
    approvalCreatedAt: approval.createdAt
  }));
  
  console.log(`📋 Found ${pendingTickets.length} pending approvals`);
  
  pendingTickets.forEach(ticket => {
    console.log(`   Ticket #${ticket.id}: ${ticket.title} (Status: ${ticket.status})`);
    console.log(`     Created by: ${ticket.createdBy.username} (${ticket.createdBy.unit?.name || 'No unit'})`);
  });
  
  return pendingTickets;
}

async function testSpecificManagers() {
  console.log('🧪 Testing Specific Managers with Pending Approvals\n');
  
  // Test managers who should have pending approvals
  const managerUsernames = ['kotamobagu.manager', 'branch.manager', 'admin'];
  
  for (const username of managerUsernames) {
    const manager = await prisma.user.findUnique({
      where: { username: username },
      include: { unit: true, department: true }
    });
    
    if (manager) {
      await simulateEndpoint(manager.id);
      console.log('');
    } else {
      console.log(`Manager ${username} not found\n`);
    }
  }
  
  await prisma.$disconnect();
}

testSpecificManagers().catch(console.error);