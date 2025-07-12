const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserUnits() {
  try {
    // Get all users with their units
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'kasda.user@company.com',
            'branch.manager@company.com',
            'it.technician@company.com'
          ]
        }
      },
      include: {
        unit: true,
        department: true
      }
    });

    console.log('\n=== User Unit Assignments ===\n');
    users.forEach(user => {
      console.log(`User: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Unit: ${user.unit ? `${user.unit.name} (ID: ${user.unit.id})` : 'No unit assigned'}`);
      console.log(`  Department: ${user.department ? user.department.name : 'No department'}`);
      console.log('---');
    });

    // Check if we need to assign units
    const unassignedUsers = users.filter(u => !u.unit);
    if (unassignedUsers.length > 0) {
      console.log('\n⚠️  Some users have no unit assigned!');
      console.log('The approval workflow requires users to be in the same unit.\n');

      // Find or create a unit
      let unit = await prisma.unit.findFirst({
        where: { code: 'HQ' }
      });

      if (!unit) {
        console.log('Creating default HQ unit...');
        unit = await prisma.unit.create({
          data: {
            code: 'HQ',
            name: 'Headquarters',
            unitType: 'CABANG',
            isActive: true,
            departmentId: 1
          }
        });
      }

      // Assign all unassigned users to this unit
      for (const user of unassignedUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: { unitId: unit.id }
        });
        console.log(`✅ Assigned ${user.email} to unit ${unit.name}`);
      }
    }

    // Re-query to show updated assignments
    const updatedUsers = await prisma.user.findMany({
      where: {
        email: {
          in: [
            'kasda.user@company.com',
            'branch.manager@company.com',
            'it.technician@company.com'
          ]
        }
      },
      include: {
        unit: true
      }
    });

    console.log('\n=== Updated Unit Assignments ===\n');
    updatedUsers.forEach(user => {
      console.log(`${user.email} => ${user.unit?.name || 'No unit'} (Unit ID: ${user.unitId})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserUnits();