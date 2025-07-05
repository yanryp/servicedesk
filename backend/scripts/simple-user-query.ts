#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simpleUserQuery() {
  console.log('📊 Simple User Query Results:\n');

  try {
    // Raw SQL query to get user data
    const result = await prisma.$queryRaw`
      SELECT 
        u.id,
        u.email,
        u.username,
        u.role,
        u."isBusinessReviewer",
        unit.name as unit_name,
        dept.name as department_name,
        u."createdAt"
      FROM "User" u
      LEFT JOIN "Unit" unit ON u."unitId" = unit.id
      LEFT JOIN "Department" dept ON u."departmentId" = dept.id
      ORDER BY unit.name ASC NULLS LAST, u.email ASC
    `;

    console.log(`Found ${Array.isArray(result) ? result.length : 0} users:\n`);

    if (Array.isArray(result)) {
      result.forEach((user: any, index: number) => {
        console.log(`${index + 1}. ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role || 'No Role'}`);
        console.log(`   Unit: ${user.unit_name || 'No Unit'}`);
        console.log(`   Department: ${user.department_name || 'No Department'}`);
        console.log(`   Is Business Reviewer: ${user.isBusinessReviewer ? 'Yes' : 'No'}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleUserQuery();