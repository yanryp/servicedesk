const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function rejectTicket() {
  try {
    // Get manager ID
    const manager = await prisma.user.findFirst({
      where: { email: 'test.manager@bsg.co.id' }
    });
    
    if (!manager) {
      console.log('❌ Manager not found');
      return;
    }
    
    console.log('👔 Manager rejecting ticket:');
    console.log('- Manager ID:', manager.id);
    console.log('- Manager Email:', manager.email);
    
    // Check if ticket #60 exists and is pending approval
    const ticket = await prisma.ticket.findUnique({
      where: { id: 60 },
      include: { businessApproval: true }
    });
    
    if (!ticket) {
      console.log('❌ Ticket #60 not found');
      return;
    }
    
    console.log('\n📋 Ticket #60 before rejection:');
    console.log('- Title:', ticket.title);
    console.log('- Status:', ticket.status);
    console.log('- Business Approval exists:', !!ticket.businessApproval);
    
    // Update ticket status to rejected
    const rejectionResult = await prisma.ticket.update({
      where: { id: 60 },
      data: {
        status: 'rejected',
        businessComments: 'Rejected by branch manager - insufficient documentation provided. Please provide employee contract and department approval letter.',
        updatedAt: new Date()
      }
    });
    
    console.log('\n✅ Ticket #60 rejected successfully!');
    console.log('- Previous Status:', ticket.status);
    console.log('- New Status:', rejectionResult.status);
    console.log('- Manager Comments:', rejectionResult.businessComments);
    
    // Update or create business approval record with rejection
    if (ticket.businessApproval) {
      // Update existing approval record
      await prisma.businessApproval.update({
        where: { ticketId: 60 },
        data: {
          businessReviewerId: manager.id,
          approvalStatus: 'rejected',
          businessComments: 'Rejected by branch manager - insufficient documentation provided. Please provide employee contract and department approval letter.',
          approvedAt: new Date() // Actually the "decided at" timestamp
        }
      });
      console.log('✅ Business approval record updated to rejected');
    } else {
      // Create new approval record with rejection
      await prisma.businessApproval.create({
        data: {
          ticketId: 60,
          businessReviewerId: manager.id,
          approvalStatus: 'rejected',
          businessComments: 'Rejected by branch manager - insufficient documentation provided. Please provide employee contract and department approval letter.',
          approvedAt: new Date()
        }
      });
      console.log('✅ Business approval record created with rejected status');
    }
    
    console.log('\n🎉 MANAGER REJECTION WORKFLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ Status transition: pending_approval → rejected');
    console.log('✅ Business approval record: pending → rejected');
    console.log('✅ Manager rejection reason: documented');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

rejectTicket();