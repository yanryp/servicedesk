const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testMultiManagerApproval() {
  console.log('🧪 Testing Multi-Manager Approval System...\n');

  try {
    // 1. Test the updated query logic for each Kotamobagu manager
    const kotamobagiManagers = [
      { email: 'rina.fadilah.manager@bsg.co.id', name: 'rina.fadilah.manager.kotamobagu' },
      { email: 'sinta.pratama.manager@bsg.co.id', name: 'sinta.pratama.manager.kotamobagu' },
      { email: 'kotamobagu.manager@company.com', name: 'kotamobagu.manager' }
    ];

    console.log('1. TESTING PENDING APPROVALS QUERY FOR EACH KOTAMOBAGU MANAGER:');

    for (const managerInfo of kotamobagiManagers) {
      console.log(`\n📋 Testing for manager: ${managerInfo.name}`);
      
      // Get manager details
      const manager = await prisma.user.findUnique({
        where: { email: managerInfo.email },
        include: { unit: true }
      });

      if (!manager) {
        console.log(`   ❌ Manager not found: ${managerInfo.email}`);
        continue;
      }

      console.log(`   Manager ID: ${manager.id}, Unit ID: ${manager.unitId}, Unit: ${manager.unit?.name}`);
      console.log(`   isBusinessReviewer: ${manager.isBusinessReviewer}`);

      // Test the new multi-manager query
      const pendingApprovals = await prisma.businessApproval.findMany({
        where: {
          approvalStatus: 'pending',
          OR: [
            { businessReviewerId: manager.id },
            {
              ticket: {
                createdBy: {
                  unitId: manager.unitId
                }
              }
            }
          ]
        },
        include: {
          ticket: {
            include: {
              createdBy: {
                include: { unit: true }
              }
            }
          }
        }
      });

      console.log(`   📊 Found ${pendingApprovals.length} pending approvals:`);
      pendingApprovals.forEach(approval => {
        const isDirectlyAssigned = approval.businessReviewerId === manager.id;
        const isUnitBased = approval.ticket?.createdBy?.unitId === manager.unitId;
        
        console.log(`     - Ticket #${approval.ticketId}: ${approval.ticket?.title}`);
        console.log(`       Created by: ${approval.ticket?.createdBy?.username} (${approval.ticket?.createdBy?.unit?.name})`);
        console.log(`       Access reason: ${isDirectlyAssigned ? '✅ Directly assigned' : ''} ${isUnitBased ? '✅ Same unit' : ''}`);
      });

      if (pendingApprovals.length === 0) {
        console.log(`     ❌ No pending approvals found for ${manager.username}`);
      }
    }

    // 2. Test authorization logic
    console.log('\n\n2. TESTING AUTHORIZATION LOGIC:');
    
    // Get ticket #12 details
    const ticket12 = await prisma.ticket.findUnique({
      where: { id: 12 },
      include: {
        createdBy: {
          include: { unit: true }
        },
        businessApproval: {
          include: {
            businessReviewer: true
          }
        }
      }
    });

    if (ticket12) {
      console.log(`\n🎫 Ticket #12: ${ticket12.title}`);
      console.log(`   Created by: ${ticket12.createdBy?.username} (Unit ID: ${ticket12.createdBy?.unitId})`);
      console.log(`   Assigned to: ${ticket12.businessApproval?.businessReviewer?.username} (ID: ${ticket12.businessApproval?.businessReviewerId})`);
      console.log(`   Status: ${ticket12.businessApproval?.approvalStatus}`);

      // Test each manager's authorization
      for (const managerInfo of kotamobagiManagers) {
        const manager = await prisma.user.findUnique({
          where: { email: managerInfo.email }
        });

        if (manager) {
          const isAssignedManager = ticket12.businessApproval?.businessReviewerId === manager.id;
          const isSameUnit = ticket12.createdBy?.unitId === manager.unitId;
          const canApprove = manager.role === 'admin' || 
            (manager.role === 'manager' && 
             manager.isBusinessReviewer === true &&
             ticket12.businessApproval?.approvalStatus === 'pending' &&
             (isAssignedManager || isSameUnit));

          console.log(`\n   👤 ${manager.username}:`);
          console.log(`      Role: ${manager.role}, isBusinessReviewer: ${manager.isBusinessReviewer}`);
          console.log(`      Unit ID: ${manager.unitId}`);
          console.log(`      Is assigned manager: ${isAssignedManager}`);
          console.log(`      Is same unit: ${isSameUnit}`);
          console.log(`      ✅ CAN APPROVE: ${canApprove}`);
        }
      }
    }

    // 3. Test with a ticket from a different unit
    console.log('\n\n3. TESTING CROSS-UNIT AUTHORIZATION (SHOULD FAIL):');
    
    const utamaTickets = await prisma.ticket.findFirst({
      where: {
        createdBy: {
          unit: {
            name: {
              contains: 'Utama',
              mode: 'insensitive'
            }
          }
        }
      },
      include: {
        createdBy: {
          include: { unit: true }
        }
      }
    });

    if (utamaTickets) {
      console.log(`\n🎫 Utama ticket example: #${utamaTickets.id}`);
      console.log(`   Created by: ${utamaTickets.createdBy?.username} (Unit: ${utamaTickets.createdBy?.unit?.name})`);
      
      // Test if Kotamobagu managers can see Utama tickets (should be NO)
      const kotamobaguManager = await prisma.user.findUnique({
        where: { email: 'rina.fadilah.manager@bsg.co.id' }
      });

      if (kotamobaguManager) {
        const isSameUnit = utamaTickets.createdBy?.unitId === kotamobaguManager.unitId;
        console.log(`   Kotamobagu manager unit: ${kotamobaguManager.unitId}`);
        console.log(`   Utama ticket unit: ${utamaTickets.createdBy?.unitId}`);
        console.log(`   ❌ Cross-unit access (should be false): ${isSameUnit}`);
      }
    }

  } catch (error) {
    console.error('Error testing multi-manager approval:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultiManagerApproval();