// Quick script to check ticket approval status
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicketApproval() {
  console.log('🔍 Checking Ticket #5 approval status...\n');

  try {
    // Get the ticket with approval details
    const ticket = await prisma.ticket.findUnique({
      where: { id: 5 },
      include: {
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        },
        businessApproval: {
          include: {
            businessReviewer: {
              include: {
                unit: true,
                department: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      console.log('❌ Ticket #5 not found');
      return;
    }

    console.log('📝 Ticket Details:');
    console.log(`   ID: ${ticket.id}`);
    console.log(`   Title: ${ticket.title}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Priority: ${ticket.priority}`);
    console.log(`   Created By: ${ticket.createdBy?.username}`);
    console.log(`   Created By Unit: ${ticket.createdBy?.unit?.name || 'No unit'}`);
    console.log(`   Created By Department: ${ticket.createdBy?.department?.name || 'No department'}`);

    if (ticket.businessApproval) {
      console.log('\n✅ Business Approval Found:');
      console.log(`   Approval Status: ${ticket.businessApproval.approvalStatus}`);
      console.log(`   Assigned to: ${ticket.businessApproval.businessReviewer?.username}`);
      console.log(`   Reviewer Email: ${ticket.businessApproval.businessReviewer?.email}`);
      console.log(`   Reviewer Unit: ${ticket.businessApproval.businessReviewer?.unit?.name || 'No unit'}`);
      console.log(`   Reviewer Department: ${ticket.businessApproval.businessReviewer?.department?.name || 'No department'}`);
      console.log(`   Comments: ${ticket.businessApproval.businessComments}`);
      console.log(`   Created At: ${ticket.businessApproval.createdAt}`);
    } else {
      console.log('\n❌ No Business Approval Found');
    }

    // Check all users in the same unit as the ticket creator
    console.log('\n👥 Available Managers in Same Unit:');
    const sameUnitManagers = await prisma.user.findMany({
      where: {
        unitId: ticket.createdBy?.unitId,
        role: { in: ['manager', 'admin'] },
        isBusinessReviewer: true
      },
      include: {
        unit: true,
        department: true
      }
    });

    sameUnitManagers.forEach(manager => {
      console.log(`   ✅ ${manager.username} (${manager.email})`);
      console.log(`      Role: ${manager.role}, Available: ${manager.isAvailable}`);
      console.log(`      Unit: ${manager.unit?.name}, Department: ${manager.department?.name}`);
    });

    if (sameUnitManagers.length === 0) {
      console.log('   ❌ No managers found in same unit');
    }

  } catch (error) {
    console.error('❌ Error checking ticket approval:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicketApproval();