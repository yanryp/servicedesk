#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicket26Details() {
  console.log('🔍 Checking ticket #26 details...\n');

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: 26 },
      include: {
        serviceCatalog: {
          include: {
            department: true
          }
        },
        serviceItem: true,
        createdBy: {
          include: {
            department: true,
            unit: true
          }
        },
        assignedTo: {
          include: {
            department: true
          }
        }
      }
    });

    if (ticket) {
      console.log(`🎫 Ticket #26:`);
      console.log(`   Title: ${ticket.title}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   KASDA ticket: ${ticket.isKasdaTicket}`);
      console.log(`   Creator: ${ticket.createdBy?.username}`);
      console.log(`   Creator department: ${ticket.createdBy?.department?.name || 'None'}`);
      console.log(`   Creator unit: ${ticket.createdBy?.unit?.name || 'None'}`);
      console.log(`   Assigned to: ${ticket.assignedToUserId || 'Unassigned'}`);
      console.log(`   Service catalog: ${ticket.serviceCatalog?.name || 'None'}`);
      console.log(`   Service catalog department: ${ticket.serviceCatalog?.department?.name || 'None'} (ID: ${ticket.serviceCatalog?.departmentId || 'None'})`);
      console.log(`   Service item: ${ticket.serviceItem?.name || 'None'}`);
      console.log();
      
      // Check IT technician details
      const itTechnician = await prisma.user.findUnique({
        where: { email: 'it.technician@company.com' },
        include: {
          department: true,
          unit: true
        }
      });
      
      if (itTechnician) {
        console.log(`👨‍💻 IT Technician:`);
        console.log(`   Username: ${itTechnician.username}`);
        console.log(`   Department: ${itTechnician.department?.name || 'None'} (ID: ${itTechnician.departmentId || 'None'})`);
        console.log(`   Unit: ${itTechnician.unit?.name || 'None'}`);
        console.log();
        
        // Check access logic
        const canView = itTechnician.role === 'admin' ||
          ticket.createdByUserId === itTechnician.id ||
          (itTechnician.departmentId === ticket.serviceCatalog?.departmentId) ||
          (itTechnician.isBusinessReviewer && ticket.isKasdaTicket) ||
          ticket.assignedToUserId === itTechnician.id;
          
        console.log(`🔐 Access Check:`);
        console.log(`   Is admin: ${itTechnician.role === 'admin'}`);
        console.log(`   Is creator: ${ticket.createdByUserId === itTechnician.id}`);
        console.log(`   Department match: ${itTechnician.departmentId === ticket.serviceCatalog?.departmentId} (${itTechnician.departmentId} === ${ticket.serviceCatalog?.departmentId})`);
        console.log(`   Is business reviewer for KASDA: ${itTechnician.isBusinessReviewer && ticket.isKasdaTicket}`);
        console.log(`   Is assigned: ${ticket.assignedToUserId === itTechnician.id}`);
        console.log(`   Can view: ${canView}`);
      }

    } else {
      console.log('❌ Ticket #26 not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicket26Details();