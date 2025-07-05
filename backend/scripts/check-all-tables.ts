#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllTables() {
  console.log('🔍 Checking all table counts in the database...\n');

  try {
    // Get counts for all major tables
    const [
      userCount,
      unitCount,
      departmentCount,
      ticketCount,
      templateCount,
      categoryCount,
      fieldCount,
      masterDataCount,
      businessApprovalCount,
      apiTokenCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.unit.count(),
      prisma.department.count(),
      prisma.ticket.count(),
      prisma.bSGTemplate.count(),
      prisma.bSGTemplateCategory.count(),
      prisma.bSGTemplateField.count(),
      prisma.bSGMasterData.count(),
      prisma.businessApproval.count(),
      prisma.apiToken.count()
    ]);

    console.log('📊 Database Table Counts:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Units (Branches): ${unitCount}`);
    console.log(`   Departments: ${departmentCount}`);
    console.log(`   Tickets: ${ticketCount}`);
    console.log(`   BSG Templates: ${templateCount}`);
    console.log(`   BSG Template Categories: ${categoryCount}`);
    console.log(`   BSG Template Fields: ${fieldCount}`);
    console.log(`   BSG Master Data: ${masterDataCount}`);
    console.log(`   Business Approvals: ${businessApprovalCount}`);
    console.log(`   API Tokens: ${apiTokenCount}`);

    // Check for any recent tickets
    if (ticketCount > 0) {
      console.log('\n🎫 Recent Tickets:');
      const recentTickets = await prisma.ticket.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { email: true }
          }
        }
      });

      recentTickets.forEach((ticket, index) => {
        console.log(`   ${index + 1}. Ticket #${ticket.id} - ${ticket.title}`);
        console.log(`      Status: ${ticket.status}`);
        console.log(`      Created by: ${ticket.createdBy?.email || 'Unknown'}`);
        console.log(`      Created: ${ticket.createdAt?.toISOString() || 'Unknown'}`);
        console.log('');
      });
    }

    // Check for any recent approvals
    if (businessApprovalCount > 0) {
      console.log('\n✅ Recent Business Approvals:');
      const recentApprovals = await prisma.businessApproval.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

      recentApprovals.forEach((approval, index) => {
        console.log(`   ${index + 1}. Approval #${approval.id}`);
        console.log(`      Ticket ID: ${approval.ticketId}`);
        console.log(`      Status: ${approval.approvalStatus}`);
        console.log(`      Reviewer ID: ${approval.businessReviewerId}`);
        console.log(`      Created: ${approval.createdAt?.toISOString() || 'Unknown'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();