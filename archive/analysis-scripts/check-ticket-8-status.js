const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTicket8Status() {
  console.log('🔍 Checking status of Ticket #8 after approval...\n');
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: 8 },
    include: {
      createdBy: true,
      assignedTo: true,
      serviceCatalog: {
        include: {
          department: true
        }
      },
      serviceItem: true,
      serviceTemplate: true,
      businessApproval: {
        include: {
          businessReviewer: true
        }
      }
    }
  });
  
  if (!ticket) {
    console.log('❌ Ticket #8 not found');
    return;
  }
  
  console.log('📋 TICKET #8 STATUS:');
  console.log(`- ID: ${ticket.id}`);
  console.log(`- Title: ${ticket.title}`);
  console.log(`- Status: ${ticket.status}`);
  console.log(`- Created by: ${ticket.createdBy.email}`);
  console.log(`- Service Catalog: ${ticket.serviceCatalog?.name || 'No service catalog'}`);
  console.log(`- Service Item: ${ticket.serviceItem?.name || 'No service item'}`);
  console.log(`- Service Template: ${ticket.serviceTemplate?.name || 'No service template'}`);
  console.log(`- Department: ${ticket.serviceCatalog?.department?.name || 'No department'}`);
  console.log(`- Assigned to: ${ticket.assignedTo?.email || 'Not assigned'}`);
  console.log(`- Created at: ${ticket.createdAt}`);
  console.log(`- Updated at: ${ticket.updatedAt}`);
  
  console.log('\n🏛️ BUSINESS APPROVAL:');
  if (ticket.businessApproval) {
    console.log(`- Reviewer: ${ticket.businessApproval.businessReviewer.email}`);
    console.log(`- Status: ${ticket.businessApproval.approvalStatus}`);
    console.log(`- Approved at: ${ticket.businessApproval.approvedAt || 'Not approved'}`);
    console.log(`- Comments: ${ticket.businessApproval.comments || 'No comments'}`);
  } else {
    console.log('- No business approval record found');
  }
  
  // Check if there are available technicians in the Dukungan dan Layanan department
  console.log('\n👨‍💻 AVAILABLE TECHNICIANS IN DUKUNGAN DAN LAYANAN:');
  const technicians = await prisma.user.findMany({
    where: {
      role: 'technician',
      department: {
        name: 'Dukungan dan Layanan'
      }
    },
    include: {
      department: true
    }
  });
  
  technicians.forEach(tech => {
    console.log(`- ${tech.email} (${tech.username})`);
  });
}

checkTicket8Status().catch(console.error).finally(() => process.exit());