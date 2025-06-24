const { PrismaClient } = require('@prisma/client');

async function testAPI() {
  const prisma = new PrismaClient();
  
  try {
    // Test the ticket detail query
    console.log('=== Testing Ticket Detail Query ===');
    const ticket = await prisma.ticket.findUnique({
      where: { id: 36 },
      include: {
        createdBy: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            },
            manager: {
              select: {
                id: true,
                username: true,
                email: true,
                departmentId: true
              }
            }
          }
        },
        assignedTo: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        item: {
          include: {
            subCategory: {
              include: {
                category: true
              }
            }
          }
        },
        template: true,
        attachments: true,
        customFieldValues: {
          include: {
            fieldDefinition: true
          }
        },
        bsgFieldValues: {
          include: {
            field: {
              include: {
                fieldType: true
              }
            }
          }
        }
      }
    });

    if (ticket) {
      console.log('✅ Ticket found:', ticket.id, ticket.title);
      console.log('Creator:', ticket.createdBy.username);
      console.log('Department:', ticket.createdBy.department?.name);
      console.log('Manager:', ticket.createdBy.manager?.username);
    } else {
      console.log('❌ Ticket not found');
    }

    // Test the pending approvals query
    console.log('\n=== Testing Pending Approvals Query ===');
    
    // Get branch.manager user
    const manager = await prisma.user.findFirst({
      where: { username: 'branch.manager' }
    });

    if (!manager) {
      console.log('❌ branch.manager not found');
      return;
    }

    console.log('Manager found:', manager.username, 'Department:', manager.departmentId);

    const pendingTickets = await prisma.ticket.findMany({
      where: {
        status: 'pending_approval',
        createdBy: {
          managerId: manager.id,
          departmentId: manager.departmentId
        }
      },
      include: {
        createdBy: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        assignedTo: {
          include: {
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ Pending tickets found:', pendingTickets.length);
    pendingTickets.forEach(t => {
      console.log(`  - ${t.id}: ${t.title} (${t.createdBy.username})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();