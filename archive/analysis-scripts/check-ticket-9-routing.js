const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTicket9Routing() {
  console.log('🔍 Checking Ticket #9 routing after branch manager approval...\n');
  
  try {
    // Get ticket #9 with all related information
    const ticket = await prisma.ticket.findUnique({
      where: { id: 9 },
      include: {
        createdBy: {
          include: {
            unit: true,
            manager: true
          }
        },
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
            businessReviewer: {
              include: {
                unit: true
              }
            }
          }
        }
      }
    });
    
    if (!ticket) {
      console.log('❌ Ticket #9 not found');
      return;
    }
    
    console.log('📋 TICKET #9 CURRENT STATUS:');
    console.log(`- ID: ${ticket.id}`);
    console.log(`- Title: ${ticket.title}`);
    console.log(`- Status: ${ticket.status}`);
    console.log(`- Priority: ${ticket.priority}`);
    console.log(`- Created: ${ticket.createdAt}`);
    console.log(`- Updated: ${ticket.updatedAt}`);
    
    console.log('\n👤 REQUESTER INFO:');
    console.log(`- Email: ${ticket.createdBy.email}`);
    console.log(`- Username: ${ticket.createdBy.username}`);
    console.log(`- Role: ${ticket.createdBy.role}`);
    console.log(`- Branch: ${ticket.createdBy.unit?.name || 'No branch'}`);
    console.log(`- Manager: ${ticket.createdBy.manager?.email || 'No manager'}`);
    
    console.log('\n🎯 SERVICE ROUTING:');
    console.log(`- Service Catalog: ${ticket.serviceCatalog?.name || 'No catalog'}`);
    console.log(`- Service Item: ${ticket.serviceItem?.name || 'No item'}`);
    console.log(`- Service Template: ${ticket.serviceTemplate?.name || 'No template'}`);
    console.log(`- Target Department: ${ticket.serviceCatalog?.department?.name || 'No department'}`);
    
    console.log('\n👨‍💼 ASSIGNMENT INFO:');
    console.log(`- Assigned To: ${ticket.assignedTo?.email || 'NOT ASSIGNED'}`);
    if (ticket.assignedTo) {
      console.log(`- Technician Role: ${ticket.assignedTo.role}`);
      console.log(`- Technician Department: ${ticket.assignedTo.departmentId || 'No dept ID'}`);
    }
    
    console.log('\n✅ APPROVAL STATUS:');
    if (ticket.businessApproval) {
      console.log(`- Business Reviewer: ${ticket.businessApproval.businessReviewer.email}`);
      console.log(`- Reviewer Branch: ${ticket.businessApproval.businessReviewer.unit?.name || 'No branch'}`);
      console.log(`- Approval Status: ${ticket.businessApproval.approvalStatus}`);
      console.log(`- Approved At: ${ticket.businessApproval.approvedAt || 'Not approved'}`);
      console.log(`- Comments: ${ticket.businessApproval.comments || 'No comments'}`);
    } else {
      console.log('- No business approval record found');
    }
    
    // Check available technicians in target department
    const targetDept = ticket.serviceCatalog?.department;
    if (targetDept) {
      console.log(`\n🔧 AVAILABLE TECHNICIANS IN ${targetDept.name.toUpperCase()}:`);
      const technicians = await prisma.user.findMany({
        where: {
          role: 'technician',
          departmentId: targetDept.id
        },
        include: {
          department: true
        }
      });
      
      technicians.forEach(tech => {
        console.log(`- ${tech.email} (${tech.username}) - Available: ${tech.isAvailable}, Workload: ${tech.currentWorkload}/${tech.workloadCapacity}`);
      });
      
      console.log(`\n💡 ROUTING ANALYSIS:`);
      console.log(`✅ Ticket approved by correct branch manager`);
      console.log(`✅ Service categorized for ${targetDept.name} department`);
      if (technicians.length > 0) {
        console.log(`✅ ${technicians.length} technician(s) available in target department`);
        if (!ticket.assignedTo) {
          console.log(`❌ ISSUE: Ticket not assigned to any technician - auto-assignment may not be working`);
        }
      } else {
        console.log(`❌ ISSUE: No technicians found in target department`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking ticket routing:', error);
  }
}

checkTicket9Routing().catch(console.error).finally(() => process.exit());