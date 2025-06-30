const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function manuallyAssignTicket9() {
  console.log('🔧 Manually assigning Ticket #9 to banking technician...\n');
  
  try {
    // Get banking technician
    const bankingTech = await prisma.user.findUnique({
      where: { email: 'banking.tech@company.com' },
      include: { department: true }
    });
    
    if (!bankingTech) {
      console.log('❌ Banking technician not found');
      return;
    }
    
    // Update ticket assignment
    const updatedTicket = await prisma.ticket.update({
      where: { id: 9 },
      data: {
        assignedToUserId: bankingTech.id,
        status: 'assigned' // Change status from 'open' to 'assigned'
      },
      include: {
        assignedTo: true,
        createdBy: true
      }
    });
    
    // Create assignment log
    await prisma.ticketAssignmentLog.create({
      data: {
        ticketId: 9,
        assignedToUserId: bankingTech.id,
        assignmentMethod: 'manual_admin',
        assignmentReason: 'Manual assignment for testing - KASDA ticket routed to Dukungan dan Layanan technician',
        assignedByUserId: null // Manual assignment for testing
      }
    });
    
    // Update technician workload
    await prisma.user.update({
      where: { id: bankingTech.id },
      data: {
        currentWorkload: bankingTech.currentWorkload + 1
      }
    });
    
    console.log('✅ TICKET ASSIGNMENT COMPLETED:');
    console.log(`- Ticket #${updatedTicket.id}: ${updatedTicket.title}`);
    console.log(`- Status: ${updatedTicket.status}`);
    console.log(`- Assigned to: ${updatedTicket.assignedTo.email}`);
    console.log(`- Technician Department: ${bankingTech.department.name}`);
    console.log(`- New Workload: ${bankingTech.currentWorkload + 1}/10`);
    
    console.log('\n🎯 WORKFLOW COMPLETED:');
    console.log('1. ✅ Branch Utama user created KASDA ticket');
    console.log('2. ✅ Branch Utama manager approved ticket');  
    console.log('3. ✅ Ticket routed to Dukungan dan Layanan department');
    console.log('4. ✅ Ticket assigned to banking technician');
    console.log('\n🚀 Ready for technician to process!');
    
  } catch (error) {
    console.error('❌ Error assigning ticket:', error);
  }
}

manuallyAssignTicket9().catch(console.error).finally(() => process.exit());