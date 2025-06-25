// Verify unit assignments and manager authority for approval workflows
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUnitAssignments() {
  console.log('🔍 Verifying unit assignments and manager authority...\n');

  try {
    // Get all units with their users
    const units = await prisma.unit.findMany({
      include: {
        users: {
          include: {
            department: { select: { name: true } }
          },
          orderBy: { role: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('📋 Unit Structure and User Assignments:\n');

    for (const unit of units) {
      console.log(`🏢 Unit: ${unit.name} (Type: ${unit.unitType})`);
      console.log(`   Code: ${unit.code}, Active: ${unit.isActive}`);
      
      if (unit.users.length === 0) {
        console.log('   ❌ No users assigned to this unit\n');
        continue;
      }

      // Group users by role
      const usersByRole = unit.users.reduce((acc, user) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
      }, {} as Record<string, any[]>);

      // Show managers (who can approve)
      const managers = usersByRole.manager || [];
      const admins = usersByRole.admin || [];
      const approvers = [...managers, ...admins].filter(u => u.isBusinessReviewer);

      if (approvers.length > 0) {
        console.log('   ✅ Approval Authority:');
        approvers.forEach(manager => {
          console.log(`      👨‍💼 ${manager.username} (${manager.role}) - ${manager.email}`);
          console.log(`         Available: ${manager.isAvailable}, Business Reviewer: ${manager.isBusinessReviewer}`);
        });
      } else {
        console.log('   ❌ No managers with approval authority in this unit');
      }

      // Show requesters
      const requesters = usersByRole.requester || [];
      if (requesters.length > 0) {
        console.log('   📝 Requesters:');
        requesters.forEach(requester => {
          console.log(`      👤 ${requester.username} - ${requester.email} (KASDA: ${requester.isKasdaUser})`);
        });
      }

      // Show technicians
      const technicians = usersByRole.technician || [];
      if (technicians.length > 0) {
        console.log('   🔧 Technicians:');
        technicians.forEach(tech => {
          console.log(`      👨‍🔧 ${tech.username} - ${tech.email} (Skill: ${tech.primarySkill || 'General'})`);
        });
      }

      console.log('');
    }

    // Test approval assignment logic
    console.log('🧪 Testing Approval Assignment Logic:\n');

    // Test IT unit workflow
    const itUser = await prisma.user.findUnique({
      where: { email: 'it.user@company.com' },
      include: { unit: true, department: true }
    });

    if (itUser) {
      console.log(`📋 Test Case 1: IT User "${itUser.username}" creates ticket`);
      console.log(`   User Unit: ${itUser.unit?.name} (ID: ${itUser.unitId})`);
      
      // Find available managers in the same unit
      const itManagers = await prisma.user.findMany({
        where: {
          unitId: itUser.unitId,
          role: { in: ['manager', 'admin'] },
          isBusinessReviewer: true,
          isAvailable: true
        },
        include: { unit: true }
      });

      if (itManagers.length > 0) {
        console.log(`   ✅ Available IT Managers for approval:`);
        itManagers.forEach(manager => {
          console.log(`      - ${manager.username} (${manager.email})`);
        });
      } else {
        console.log(`   ❌ No available managers in IT unit for approval`);
      }
    }

    // Test KASDA unit workflow
    const kasdaUser = await prisma.user.findUnique({
      where: { email: 'kasda.user@company.com' },
      include: { unit: true, department: true }
    });

    if (kasdaUser) {
      console.log(`\n📋 Test Case 2: KASDA User "${kasdaUser.username}" creates ticket`);
      console.log(`   User Unit: ${kasdaUser.unit?.name} (ID: ${kasdaUser.unitId})`);
      
      // Find available managers in the same unit
      const kasdaManagers = await prisma.user.findMany({
        where: {
          unitId: kasdaUser.unitId,
          role: { in: ['manager', 'admin'] },
          isBusinessReviewer: true,
          isAvailable: true
        },
        include: { unit: true }
      });

      if (kasdaManagers.length > 0) {
        console.log(`   ✅ Available KASDA Managers for approval:`);
        kasdaManagers.forEach(manager => {
          console.log(`      - ${manager.username} (${manager.email})`);
        });
      } else {
        console.log(`   ❌ No available managers in KASDA unit for approval`);
      }
    }

    console.log('\n🎯 Summary:');
    console.log(`   - Total Units: ${units.length}`);
    console.log(`   - Units with Managers: ${units.filter(u => u.users.some(user => user.role === 'manager' && user.isBusinessReviewer)).length}`);
    console.log(`   - Units with Requesters: ${units.filter(u => u.users.some(user => user.role === 'requester')).length}`);
    console.log(`   - Units with Technicians: ${units.filter(u => u.users.some(user => user.role === 'technician')).length}`);

  } catch (error) {
    console.error('❌ Error verifying unit assignments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUnitAssignments();