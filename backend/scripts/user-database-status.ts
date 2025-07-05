#!/usr/bin/env npx ts-node

/**
 * USER DATABASE STATUS CHECKER
 * 
 * Quick utility to check what users actually exist in the database
 * Usage: npx ts-node scripts/user-database-status.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserDatabaseStatus() {
  console.log('📊 USER DATABASE STATUS CHECK');
  console.log('=' .repeat(50));
  console.log(`🕐 Checked at: ${new Date().toISOString()}\n`);

  try {
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        unit: { select: { name: true } },
        department: { select: { name: true } }
      },
      orderBy: { email: 'asc' }
    });

    console.log(`🔢 TOTAL USERS: ${users.length}\n`);

    // Display in clean table format
    console.log('📋 USER LIST:');
    console.log('ID  | Email                      | Role        | Unit                    | Department');
    console.log('-'.repeat(90));
    
    users.forEach(user => {
      const id = user.id.toString().padEnd(3);
      const email = user.email.padEnd(26);
      const role = (user.role || 'No Role').padEnd(11);
      const unit = (user.unit?.name || 'No Unit').padEnd(23);
      const department = user.department?.name || 'No Department';
      
      console.log(`${id} | ${email} | ${role} | ${unit} | ${department}`);
    });

    // Quick stats
    console.log('\n📈 QUICK STATS:');
    const businessReviewers = users.filter(u => u.isBusinessReviewer);
    const usersWithUnits = users.filter(u => u.unit);
    const usersWithDepartments = users.filter(u => u.department);
    
    console.log(`   Business Reviewers: ${businessReviewers.length}`);
    console.log(`   Users with Units: ${usersWithUnits.length}`);
    console.log(`   Users with Departments: ${usersWithDepartments.length}`);
    
    // Show managers/reviewers
    if (businessReviewers.length > 0) {
      console.log('\n👑 BUSINESS REVIEWERS (MANAGERS):');
      businessReviewers.forEach(reviewer => {
        console.log(`   ${reviewer.email} (${reviewer.unit?.name || 'No Unit'})`);
      });
    }

    // Show users without proper setup
    const problemUsers = users.filter(u => !u.unit || !u.department || !u.role);
    if (problemUsers.length > 0) {
      console.log('\n⚠️  USERS NEEDING ATTENTION:');
      problemUsers.forEach(user => {
        const issues = [];
        if (!user.unit) issues.push('No Unit');
        if (!user.department) issues.push('No Department');
        if (!user.role) issues.push('No Role');
        console.log(`   ${user.email}: ${issues.join(', ')}`);
      });
    }

    console.log('\n✅ User database status check completed.');

  } catch (error) {
    console.error('❌ Error checking user database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserDatabaseStatus();