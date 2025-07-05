#!/usr/bin/env npx ts-node

// Check ticket routing and department assignments
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicketRouting() {
  try {
    console.log('🔍 Checking Recent Ticket Routing and Department Assignment...');
    console.log('');
    
    // Get recent tickets (last 5)
    const recentTickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        serviceItem: {
          include: {
            serviceCatalog: {
              include: {
                department: true
              }
            }
          }
        },
        businessApproval: {
          include: {
            reviewer: {
              select: {
                email: true,
                role: true,
                unit: {
                  select: {
                    name: true,
                    unitType: true
                  }
                }
              }
            }
          }
        },
        assignee: {
          select: {
            email: true,
            role: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    console.log(`📊 Found ${recentTickets.length} recent tickets:`);
    console.log('');
    
    for (const ticket of recentTickets) {
      console.log(`🎫 Ticket #${ticket.id}: ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Priority: ${ticket.priority}`);
      console.log(`   Service: ${ticket.serviceItem?.name || 'Unknown'}`);
      console.log(`   Category: ${ticket.serviceItem?.serviceCatalog?.name || 'Unknown'}`);
      console.log(`   Department: ${ticket.serviceItem?.serviceCatalog?.department?.name || 'Unknown'}`);
      console.log(`   KASDA Ticket: ${ticket.isKasdaTicket ? 'Yes' : 'No'}`);
      console.log(`   Requires Approval: ${ticket.requiresBusinessApproval ? 'Yes' : 'No'}`);
      
      if (ticket.businessApproval?.length > 0) {
        const approval = ticket.businessApproval[0];
        console.log(`   Approval Status: ${approval.status}`);
        console.log(`   Manager: ${approval.reviewer.email} (${approval.reviewer.unit?.name})`);
      }
      
      if (ticket.assignee) {
        console.log(`   Assigned To: ${ticket.assignee.email} (${ticket.assignee.department?.name})`);
      }
      
      console.log(`   Created: ${ticket.createdAt?.toLocaleString() || 'Unknown'}`);
      console.log('');
    }
    
    // Check department routing summary
    console.log('📈 Department Routing Analysis:');
    console.log('');
    
    const departmentSummary = await prisma.serviceItem.groupBy({
      by: ['serviceCatalogId'],
      _count: {
        id: true
      },
      where: {
        tickets: {
          some: {
            id: {
              in: recentTickets.map(t => t.id)
            }
          }
        }
      }
    });
    
    for (const summary of departmentSummary) {
      const catalog = await prisma.serviceCatalog.findUnique({
        where: { id: summary.serviceCatalogId },
        include: {
          department: true
        }
      });
      
      if (catalog) {
        console.log(`🏢 ${catalog.name}:`);
        console.log(`   Routes to: ${catalog.department?.name || 'No Department'}`);
        console.log(`   Recent tickets: ${summary._count.id}`);
        console.log('');
      }
    }
    
    console.log('✅ Ticket routing analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking ticket routing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicketRouting();