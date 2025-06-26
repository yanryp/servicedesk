#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserAssignments() {
  console.log('🔍 Checking current user assignments...\n');

  try {
    // Check kotamobagu.user assignment
    const kotamobagiUser = await prisma.user.findUnique({
      where: { email: 'kotamobagu.user@company.com' },
      include: {
        unit: true,
        department: true
      }
    });

    console.log('👤 kotamobagu.user:');
    console.log(`   Unit: ${kotamobagiUser?.unit?.name || 'None'}`);
    console.log(`   Department: ${kotamobagiUser?.department?.name || 'None'}`);
    console.log(`   Role: ${kotamobagiUser?.role || 'None'}\n`);

    // Check all units and departments
    const units = await prisma.unit.findMany({
      orderBy: { name: 'asc' }
    });

    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    console.log('🏢 Available Units:');
    units.forEach(unit => {
      console.log(`   ID ${unit.id}: ${unit.name}`);
    });

    console.log('\n🏛️ Available Departments:');
    departments.forEach(dept => {
      console.log(`   ID ${dept.id}: ${dept.name}`);
    });

    // Check current ticket #24
    const ticket24 = await prisma.ticket.findUnique({
      where: { id: 24 },
      include: {
        createdBy: {
          include: {
            unit: true,
            department: true
          }
        }
      }
    });

    console.log('\n🎫 Ticket #24 Info:');
    console.log(`   Status: ${ticket24?.status}`);
    console.log(`   Created by: ${ticket24?.createdBy.email} (${ticket24?.createdBy.unit?.name} / ${ticket24?.createdBy.department?.name})`);
    
    // Check custom fields to see if BSG template was used
    const bsgFieldValues = await prisma.bSGTicketFieldValue.findMany({
      where: { ticketId: 24 },
      include: {
        field: {
          include: {
            template: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (bsgFieldValues.length > 0) {
      const template = bsgFieldValues[0].field.template;
      console.log(`   BSG Template: ${template.name} (Category: ${template.category?.name})`);
      console.log(`   Should go to: ${template.category?.name === 'KASDA (Regional Treasury)' ? 'Dukungan dan Layanan' : 'IT Operations'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserAssignments();