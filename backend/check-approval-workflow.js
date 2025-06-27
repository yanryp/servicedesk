const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkApprovalWorkflow() {
  try {
    console.log('🔍 Checking approval workflow configuration...\n');
    
    // 1. Check the test ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: 2 },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            managerId: true,
            manager: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        },
        businessApproval: {
          include: {
            businessReviewer: {
              select: {
                id: true,
                username: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });
    
    if (ticket) {
      console.log('📋 Ticket #2 Details:');
      console.log(`   Title: ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Requires Business Approval: ${ticket.requiresBusinessApproval}`);
      console.log(`   Creator: ${ticket.createdBy.username} (${ticket.createdBy.role})`);
      console.log(`   Creator Manager ID: ${ticket.createdBy.managerId}`);
      
      if (ticket.createdBy.manager) {
        console.log(`   Creator Manager: ${ticket.createdBy.manager.username} (${ticket.createdBy.manager.role})`);
      } else {
        console.log('   ❌ Creator has no manager assigned!');
      }
      
      if (ticket.businessApproval) {
        console.log(`   Business Approval Status: ${ticket.businessApproval.approvalStatus}`);
        if (ticket.businessApproval.businessReviewer) {
          console.log(`   Reviewer: ${ticket.businessApproval.businessReviewer.username}`);
        }
      } else {
        console.log('   ❌ No business approval record found!');
      }
    } else {
      console.log('❌ Ticket #2 not found');
    }
    
    console.log('\n👥 User relationships:');
    
    // 2. Check all users and their manager relationships
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            username: true,
            role: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    users.forEach(user => {
      console.log(`   ${user.username} (${user.role}) - Manager: ${user.manager ? user.manager.username : 'None'}`);
    });
    
    console.log('\n📋 All pending approval tickets:');
    
    // 3. Check all tickets pending approval
    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: 'pending_approval'
      },
      include: {
        createdBy: {
          select: {
            username: true,
            role: true,
            managerId: true
          }
        },
        businessApproval: {
          select: {
            approvalStatus: true,
            businessReviewerId: true
          }
        }
      }
    });
    
    pendingTickets.forEach(ticket => {
      console.log(`   Ticket #${ticket.id}: ${ticket.title}`);
      console.log(`     Status: ${ticket.status}`);
      console.log(`     Creator: ${ticket.createdBy.username} (Manager ID: ${ticket.createdBy.managerId})`);
      console.log(`     Business Approval: ${ticket.businessApproval ? ticket.businessApproval.approvalStatus : 'None'}`);
    });
    
    console.log('\n🔧 Manager Dashboard Query Test:');
    
    // 4. Simulate the manager dashboard query
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@company.com' }
    });
    
    if (adminUser) {
      console.log(`   Admin user: ${adminUser.username} (ID: ${adminUser.id}, Role: ${adminUser.role})`);
      
      // Query that the manager dashboard should be using
      const pendingForApproval = await prisma.ticket.findMany({
        where: {
          status: 'pending_approval',
          requiresBusinessApproval: true,
          businessApproval: {
            approvalStatus: 'pending'
          }
        },
        include: {
          createdBy: {
            select: {
              username: true,
              managerId: true
            }
          },
          businessApproval: true
        }
      });
      
      console.log(`   Found ${pendingForApproval.length} tickets pending approval`);
      
      pendingForApproval.forEach(ticket => {
        console.log(`     - Ticket #${ticket.id}: ${ticket.title}`);
        console.log(`       Creator Manager ID: ${ticket.createdBy.managerId}`);
        console.log(`       Admin can approve: ${adminUser.role === 'admin' || adminUser.role === 'manager'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkApprovalWorkflow();