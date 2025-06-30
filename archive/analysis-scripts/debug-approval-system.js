const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugApprovalSystem() {
  console.log('🔍 Debugging BSG Approval System...\n');

  try {
    // 1. Check pending tickets
    console.log('1. CHECKING PENDING TICKETS:');
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: 'pending_approval'
      },
      include: {
        createdBy: {
          include: {
            unit: true,
            manager: true
          }
        }
      }
    });
    
    console.log(`Found ${pendingTickets.length} tickets with PENDING_APPROVAL status:`);
    pendingTickets.forEach(ticket => {
      console.log(`  - Ticket #${ticket.id}: ${ticket.title}`);
      console.log(`    Created by: ${ticket.createdBy?.username} (Unit: ${ticket.createdBy?.unit?.name})`);
      console.log(`    Manager: ${ticket.createdBy?.manager?.username || 'No manager assigned'}`);
    });
    console.log('');

    // 2. Check BusinessApproval records
    console.log('2. CHECKING BUSINESS APPROVAL RECORDS:');
    const businessApprovals = await prisma.businessApproval.findMany({
      where: {
        approvalStatus: 'pending'
      },
      include: {
        ticket: true,
        businessReviewer: {
          include: {
            unit: true
          }
        }
      }
    });
    
    console.log(`Found ${businessApprovals.length} pending business approvals:`);
    businessApprovals.forEach(approval => {
      console.log(`  - Approval #${approval.id} for Ticket #${approval.ticketId}: ${approval.ticket?.title}`);
      console.log(`    Reviewer: ${approval.businessReviewer?.username} (Unit: ${approval.businessReviewer?.unit?.name})`);
      console.log(`    Status: ${approval.approvalStatus}`);
    });
    console.log('');

    // 3. Check Business Reviewers (Managers)
    console.log('3. CHECKING BUSINESS REVIEWERS:');
    const businessReviewers = await prisma.user.findMany({
      where: {
        isBusinessReviewer: true
      },
      include: {
        unit: true,
        department: true
      }
    });
    
    console.log(`Found ${businessReviewers.length} business reviewers:`);
    businessReviewers.forEach(reviewer => {
      console.log(`  - ${reviewer.username} (${reviewer.email})`);
      console.log(`    Role: ${reviewer.role}, Unit: ${reviewer.unit?.name}, Department: ${reviewer.department?.name}`);
      console.log(`    isBusinessReviewer: ${reviewer.isBusinessReviewer}`);
    });
    console.log('');

    // 4. Check specific Kotamobagu users
    console.log('4. CHECKING KOTAMOBAGU USERS:');
    const kotamobagiUsers = await prisma.user.findMany({
      where: {
        unit: {
          name: {
            contains: 'Kotamobagu',
            mode: 'insensitive'
          }
        }
      },
      include: {
        unit: true,
        manager: true
      }
    });
    
    console.log(`Found ${kotamobagiUsers.length} Kotamobagu users:`);
    kotamobagiUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
      console.log(`    Unit: ${user.unit?.name}, Manager: ${user.manager?.username || 'None'}`);
      console.log(`    isBusinessReviewer: ${user.isBusinessReviewer}`);
    });
    console.log('');

    // 5. Check if there's a mismatch between tickets and business approvals
    console.log('5. CHECKING FOR MISSING BUSINESS APPROVALS:');
    for (const ticket of pendingTickets) {
      const hasApproval = businessApprovals.find(approval => approval.ticketId === ticket.id);
      if (!hasApproval) {
        console.log(`  ❌ Ticket #${ticket.id} has PENDING_APPROVAL status but NO BusinessApproval record!`);
        
        // Try to find the appropriate business reviewer for this ticket
        const userUnit = ticket.createdBy?.unit;
        if (userUnit) {
          const unitManager = await prisma.user.findFirst({
            where: {
              unitId: userUnit.id,
              role: 'manager',
              isBusinessReviewer: true
            }
          });
          
          if (unitManager) {
            console.log(`    📋 Should create BusinessApproval for reviewer: ${unitManager.username}`);
          } else {
            console.log(`    ⚠️  No business reviewer found for unit: ${userUnit.name}`);
          }
        }
      } else {
        console.log(`  ✅ Ticket #${ticket.id} has proper BusinessApproval record`);
      }
    }

  } catch (error) {
    console.error('Error debugging approval system:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugApprovalSystem();