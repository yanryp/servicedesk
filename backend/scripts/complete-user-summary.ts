#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function completeUserSummary() {
  console.log('🔍 Complete User Summary Report\n');
  console.log('=' .repeat(60) + '\n');

  try {
    // Get all users with their relationships
    const users = await prisma.user.findMany({
      include: {
        unit: true,
        department: true
      },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 TOTAL USERS: ${users.length}\n`);

    // Create a mapping of user ID to user info for easy lookup
    const userIdMap = new Map();
    users.forEach(user => {
      userIdMap.set(user.id, {
        email: user.email,
        username: user.username,
        role: user.role,
        unit: user.unit?.name || 'No Unit',
        department: user.department?.name || 'No Department',
        isBusinessReviewer: user.isBusinessReviewer
      });
    });

    // Display all users with their ID for reference
    console.log('👥 ALL USERS (with ID for reference):');
    users.forEach(user => {
      console.log(`   ID ${user.id}: ${user.email}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Role: ${user.role || 'No Role'}`);
      console.log(`      Unit: ${user.unit?.name || 'No Unit'}`);
      console.log(`      Department: ${user.department?.name || 'No Department'}`);
      console.log(`      Is Business Reviewer: ${user.isBusinessReviewer ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Show business reviewers specifically
    const businessReviewers = users.filter(user => user.isBusinessReviewer);
    console.log(`🔍 BUSINESS REVIEWERS (${businessReviewers.length}):`);
    businessReviewers.forEach(reviewer => {
      console.log(`   ID ${reviewer.id}: ${reviewer.email} (${reviewer.unit?.name || 'No Unit'})`);
    });

    // Show current business approvals with reviewer mapping
    console.log('\n✅ CURRENT BUSINESS APPROVALS:');
    const approvals = await prisma.businessApproval.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        ticket: {
          select: { id: true, title: true, createdBy: { select: { email: true } } }
        }
      }
    });

    if (approvals.length > 0) {
      approvals.forEach(approval => {
        const reviewer = userIdMap.get(approval.businessReviewerId);
        console.log(`   Approval #${approval.id}:`);
        console.log(`      Ticket: #${approval.ticket?.id} - ${approval.ticket?.title}`);
        console.log(`      Status: ${approval.approvalStatus}`);
        console.log(`      Reviewer: ${reviewer?.email || 'Unknown'} (ID: ${approval.businessReviewerId})`);
        console.log(`      Reviewer Unit: ${reviewer?.unit || 'Unknown'}`);
        console.log(`      Ticket Created by: ${approval.ticket?.createdBy?.email || 'Unknown'}`);
        console.log(`      Created: ${approval.createdAt?.toISOString() || 'Unknown'}`);
        console.log('');
      });
    } else {
      console.log('   No business approvals found.');
    }

    // Show recent tickets with creators
    console.log('\n🎫 RECENT TICKETS:');
    const tickets = await prisma.ticket.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { email: true, unit: { select: { name: true } } }
        }
      }
    });

    if (tickets.length > 0) {
      tickets.forEach(ticket => {
        console.log(`   Ticket #${ticket.id}: ${ticket.title}`);
        console.log(`      Status: ${ticket.status}`);
        console.log(`      Created by: ${ticket.createdBy?.email || 'Unknown'}`);
        console.log(`      Creator Unit: ${ticket.createdBy?.unit?.name || 'Unknown'}`);
        console.log(`      Created: ${ticket.createdAt?.toISOString() || 'Unknown'}`);
        console.log('');
      });
    } else {
      console.log('   No tickets found.');
    }

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    const roleStats = users.reduce((acc, user) => {
      const role = user.role || 'No Role';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    console.log(`   Business Reviewers: ${businessReviewers.length} users`);
    console.log(`   Users with Units: ${users.filter(u => u.unit).length} users`);
    console.log(`   Users with Departments: ${users.filter(u => u.department).length} users`);
    console.log(`   Active Approvals: ${approvals.filter(a => a.approvalStatus === 'pending').length}`);
    console.log(`   Total Tickets: ${tickets.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeUserSummary();