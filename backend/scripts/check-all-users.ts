#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllUsers() {
  console.log('🔍 Checking all users in the database...\n');

  try {
    // Get all users with their relationships
    const users = await prisma.user.findMany({
      include: {
        unit: true,
        department: true
      },
      orderBy: [
        { unit: { name: 'asc' } },
        { email: 'asc' }
      ]
    });

    console.log(`📊 Total users found: ${users.length}\n`);

    // Group users by unit for better organization
    const usersByUnit = users.reduce((acc, user) => {
      const unitName = user.unit?.name || 'No Unit';
      if (!acc[unitName]) {
        acc[unitName] = [];
      }
      acc[unitName].push(user);
      return acc;
    }, {} as Record<string, typeof users>);

    // Display users grouped by unit
    Object.entries(usersByUnit).forEach(([unitName, unitUsers]) => {
      console.log(`🏢 ${unitName} (${unitUsers.length} users):`);
      unitUsers.forEach(user => {
        console.log(`   📧 ${user.email}`);
        console.log(`      Username: ${user.username}`);
        console.log(`      Role: ${user.role || 'No Role'}`);
        console.log(`      Department: ${user.department?.name || 'No Department'}`);
        console.log(`      Created: ${user.createdAt?.toISOString() || 'Unknown'}`);
        console.log(`      Is Business Reviewer: ${user.isBusinessReviewer ? 'Yes' : 'No'}`);
        console.log('');
      });
    });

    // Summary statistics
    console.log('\n📈 Summary Statistics:');
    const roleStats = users.reduce((acc, user) => {
      const role = user.role || 'No Role';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`   ${role}: ${count} users`);
    });

    const businessReviewers = users.filter(user => user.isBusinessReviewer);
    console.log(`   Business Reviewers: ${businessReviewers.length} users`);

    const usersWithUnits = users.filter(user => user.unit);
    console.log(`   Users with Units: ${usersWithUnits.length} users`);

    const usersWithDepartments = users.filter(user => user.department);
    console.log(`   Users with Departments: ${usersWithDepartments.length} users`);

    // Show users without proper assignments
    console.log('\n⚠️  Users needing attention:');
    const usersWithoutUnits = users.filter(user => !user.unit);
    if (usersWithoutUnits.length > 0) {
      console.log(`   Users without Units (${usersWithoutUnits.length}):`);
      usersWithoutUnits.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }

    const usersWithoutDepartments = users.filter(user => !user.department);
    if (usersWithoutDepartments.length > 0) {
      console.log(`   Users without Departments (${usersWithoutDepartments.length}):`);
      usersWithoutDepartments.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }

    const usersWithoutRoles = users.filter(user => !user.role);
    if (usersWithoutRoles.length > 0) {
      console.log(`   Users without Roles (${usersWithoutRoles.length}):`);
      usersWithoutRoles.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();