const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function implementMultiManagerApproval() {
  console.log('🔧 Implementing Multi-Manager Approval System...\n');

  try {
    // 1. First, let's understand the current state
    console.log('1. ANALYZING CURRENT APPROVAL SYSTEM:');
    
    const currentApprovals = await prisma.businessApproval.findMany({
      where: { approvalStatus: 'pending' },
      include: {
        ticket: {
          include: {
            createdBy: {
              include: { unit: true }
            }
          }
        },
        businessReviewer: {
          include: { unit: true }
        }
      }
    });

    console.log(`Found ${currentApprovals.length} pending business approvals:`);
    currentApprovals.forEach(approval => {
      console.log(`  - Ticket #${approval.ticketId}: ${approval.ticket?.title}`);
      console.log(`    Assigned to: ${approval.businessReviewer?.username} (${approval.businessReviewer?.unit?.name})`);
      console.log(`    Requester unit: ${approval.ticket?.createdBy?.unit?.name}`);
    });
    console.log('');

    // 2. For each unit with pending approvals, create approval records for ALL unit managers
    console.log('2. CREATING MULTI-MANAGER APPROVAL RECORDS:');

    // Group approvals by requester unit
    const approvalsByUnit = {};
    for (const approval of currentApprovals) {
      const unitName = approval.ticket?.createdBy?.unit?.name;
      const unitId = approval.ticket?.createdBy?.unit?.id;
      
      if (unitName && unitId) {
        if (!approvalsByUnit[unitName]) {
          approvalsByUnit[unitName] = [];
        }
        approvalsByUnit[unitName].push({
          ticketId: approval.ticketId,
          unitId: unitId,
          currentReviewerId: approval.businessReviewerId
        });
      }
    }

    console.log(`Processing ${Object.keys(approvalsByUnit).length} units with pending approvals...`);

    for (const [unitName, tickets] of Object.entries(approvalsByUnit)) {
      console.log(`\n📋 Processing unit: ${unitName}`);
      
      // Find ALL managers for this unit
      const unitManagers = await prisma.user.findMany({
        where: {
          unitId: tickets[0].unitId,
          role: 'manager',
          isBusinessReviewer: true,
          isAvailable: true
        },
        include: { unit: true }
      });

      console.log(`   Found ${unitManagers.length} managers in ${unitName}:`);
      unitManagers.forEach(manager => {
        console.log(`     - ${manager.username} (${manager.email})`);
      });

      // For each ticket in this unit
      for (const ticketInfo of tickets) {
        console.log(`\n   🎫 Processing Ticket #${ticketInfo.ticketId}:`);
        
        // Get current approval record count
        const existingApprovals = await prisma.businessApproval.findMany({
          where: { ticketId: ticketInfo.ticketId }
        });
        
        console.log(`     Current approvals: ${existingApprovals.length}`);

        // If we only have 1 approval record and multiple managers, create additional records
        if (existingApprovals.length === 1 && unitManagers.length > 1) {
          
          // Remove the unique constraint by updating the schema first (if needed)
          // Since we can't modify schema in JS, we'll work with the current constraint
          // and modify the pending approvals query instead
          
          console.log(`     ⚠️  Multiple managers available but only 1 approval record exists`);
          console.log(`     📝 All ${unitManagers.length} managers can approve this ticket (logic will be updated in backend)`);
          
          // List all managers who SHOULD be able to approve
          console.log(`     👥 Managers who can approve:`);
          unitManagers.forEach(manager => {
            const isCurrent = manager.id === ticketInfo.currentReviewerId;
            console.log(`       ${isCurrent ? '✅' : '➕'} ${manager.username} ${isCurrent ? '(currently assigned)' : '(will be enabled)'}`);
          });
        } else {
          console.log(`     ✅ Approval structure is adequate`);
        }
      }
    }

    console.log('\n3. SUMMARY OF MULTI-MANAGER APPROACH:');
    console.log('Instead of creating multiple BusinessApproval records (which would break the schema),');
    console.log('we will modify the pending-approvals query to allow ANY manager in the same unit');
    console.log('to see and approve tickets from their unit members.\n');

    console.log('This approach:');
    console.log('✅ Preserves database schema integrity');
    console.log('✅ Allows multiple managers per unit to approve');
    console.log('✅ Maintains audit trail with original assigned manager');
    console.log('✅ Supports backup managers when primary manager is unavailable');

  } catch (error) {
    console.error('Error implementing multi-manager approval:', error);
  } finally {
    await prisma.$disconnect();
  }
}

implementMultiManagerApproval();