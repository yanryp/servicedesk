// Create test ticket directly in database for IT unit workflow testing
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestTicket() {
  console.log('🎫 Creating test ticket for IT unit workflow...\n');

  try {
    // Get IT user
    const itUser = await prisma.user.findUnique({
      where: { email: 'it.user@company.com' },
      include: { unit: true, department: true }
    });

    if (!itUser) {
      console.log('❌ IT user not found');
      return;
    }

    console.log(`✅ Found IT user: ${itUser.username} (Unit: ${itUser.unit?.name})`);

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        title: 'Network Connectivity Issue - IT Department',
        description: 'Unable to access internal servers from workstation. Appears to be a network configuration issue affecting productivity. This is a test ticket for unit-based approval workflow.',
        status: 'pending_approval',
        priority: 'high',
        createdByUserId: itUser.id,
        isKasdaTicket: false,
        requiresBusinessApproval: true,
        businessImpact: 'high',
        requestType: 'incident',
        userRootCause: 'system_error',
        userIssueCategory: 'problem',
        userCategorizedAt: new Date(),
        slaDueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    });

    console.log(`✅ Created ticket #${ticket.id}: ${ticket.title}`);
    console.log(`   Status: ${ticket.status}`);
    console.log(`   Priority: ${ticket.priority}`);
    console.log(`   Created by: ${itUser.username} (Unit: ${itUser.unit?.name})`);

    // Find appropriate manager for approval
    const itManager = await prisma.user.findFirst({
      where: {
        unitId: itUser.unitId,
        role: { in: ['manager', 'admin'] },
        isBusinessReviewer: true,
        isAvailable: true
      },
      include: { unit: true, department: true }
    });

    if (!itManager) {
      console.log('❌ No IT manager found for approval');
      return;
    }

    // Create business approval
    const businessApproval = await prisma.businessApproval.create({
      data: {
        ticketId: ticket.id,
        businessReviewerId: itManager.id,
        approvalStatus: 'pending',
        businessComments: `Ticket #${ticket.id}: ${ticket.title} - Assigned to ${itManager.username} (${itManager.unit?.name})`
      },
      include: {
        businessReviewer: {
          include: { unit: true }
        }
      }
    });

    console.log(`✅ Created business approval:`);
    console.log(`   Approval ID: ${businessApproval.id}`);
    console.log(`   Assigned to: ${businessApproval.businessReviewer?.username}`);
    console.log(`   Manager Unit: ${businessApproval.businessReviewer?.unit?.name}`);
    console.log(`   Status: ${businessApproval.approvalStatus}`);

    console.log('\n🎯 Test Setup Complete!');
    console.log(`   Ticket ID: ${ticket.id}`);
    console.log(`   IT User: ${itUser.email} (password: user123)`);
    console.log(`   IT Manager: ${itManager.email} (password: manager123)`);
    console.log(`   Use these credentials to test the manager dashboard`);

    return { ticket, businessApproval, itUser, itManager };

  } catch (error) {
    console.error('❌ Error creating test ticket:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestTicket();