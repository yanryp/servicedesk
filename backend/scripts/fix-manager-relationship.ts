// Script to fix manager relationship for kasda.user
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixManagerRelationship() {
  console.log('🔧 Fixing manager relationship for kasda.user...');

  try {
    // Get the branch manager
    const manager = await prisma.user.findFirst({
      where: { email: 'branch.manager@company.com' }
    });

    if (!manager) {
      throw new Error('Branch manager not found');
    }

    console.log(`✅ Found manager: ${manager.username} (ID: ${manager.id})`);

    // Update kasda.user to have branch.manager as their manager
    const updatedUser = await prisma.user.update({
      where: { email: 'kasda.user@company.com' },
      data: { managerId: manager.id }
    });

    console.log(`✅ Updated kasda.user managerId to: ${manager.id}`);

    // Also update any other KASDA users in the same department
    const kasdaTechnician = await prisma.user.findFirst({
      where: { email: 'kasda.technician@company.com' }
    });

    if (kasdaTechnician) {
      await prisma.user.update({
        where: { email: 'kasda.technician@company.com' },
        data: { managerId: manager.id }
      });
      console.log(`✅ Updated kasda.technician managerId to: ${manager.id}`);
    }

    console.log('🎉 Manager relationships fixed successfully!');
    console.log('Now branch.manager can approve tickets from kasda.user');

  } catch (error) {
    console.error('❌ Error fixing manager relationships:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixManagerRelationship()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });