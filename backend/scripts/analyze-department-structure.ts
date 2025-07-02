import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeDepartmentStructure() {
  console.log('=== DATABASE STRUCTURE ANALYSIS ===\n');

  // 1. Check existing departments
  console.log('1. EXISTING DEPARTMENTS:');
  const departments = await prisma.department.findMany({
    include: {
      users: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          isBusinessReviewer: true,
          managerId: true,
          unitId: true
        }
      },
      units: {
        select: {
          id: true,
          code: true,
          name: true,
          unitType: true,
          isActive: true
        }
      },
      serviceCatalog: {
        select: {
          id: true,
          name: true,
          serviceType: true,
          requiresApproval: true
        }
      }
    }
  });

  departments.forEach(dept => {
    console.log(`\n📁 ${dept.name} (ID: ${dept.id})`);
    console.log(`   Description: ${dept.description || 'None'}`);
    console.log(`   Type: ${dept.departmentType}`);
    console.log(`   Service Owner: ${dept.isServiceOwner ? 'Yes' : 'No'}`);
    console.log(`   Users: ${dept.users.length}`);
    console.log(`   Units: ${dept.units.length}`);
    console.log(`   Service Catalog Items: ${dept.serviceCatalog.length}`);
    
    if (dept.users.length > 0) {
      console.log('   👥 Department Users:');
      dept.users.forEach(user => {
        const unitInfo = user.unitId ? ` (Unit: ${user.unitId})` : '';
        const managerInfo = user.managerId ? ` (Manager: ${user.managerId})` : '';
        const businessReviewer = user.isBusinessReviewer ? ' [Business Reviewer]' : '';
        console.log(`      - ${user.name} (@${user.username}) - ${user.role}${unitInfo}${managerInfo}${businessReviewer}`);
      });
    }

    if (dept.units.length > 0) {
      console.log('   🏢 Department Units:');
      dept.units.forEach(unit => {
        console.log(`      - ${unit.name} (${unit.code}) - ${unit.unitType} ${unit.isActive ? '✅' : '❌'}`);
      });
    }
  });

  // 2. Check units structure
  console.log('\n\n2. UNITS STRUCTURE:');
  const units = await prisma.unit.findMany({
    include: {
      users: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          isBusinessReviewer: true,
          managerId: true,
          departmentId: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [
      { unitType: 'asc' },
      { name: 'asc' }
    ]
  });

  const unitsByType = units.reduce((acc, unit) => {
    if (!acc[unit.unitType]) acc[unit.unitType] = [];
    acc[unit.unitType].push(unit);
    return acc;
  }, {} as Record<string, typeof units>);

  Object.entries(unitsByType).forEach(([unitType, typeUnits]) => {
    console.log(`\n🏢 ${unitType.toUpperCase()} UNITS (${typeUnits.length}):`);
    typeUnits.forEach(unit => {
      const deptInfo = unit.department ? ` [Dept: ${unit.department.name}]` : ' [No Department]';
      console.log(`   - ${unit.name} (${unit.code})${deptInfo} - ${unit.users.length} users`);
      
      if (unit.users.length > 0) {
        unit.users.forEach(user => {
          const deptInfo = user.departmentId ? ` Dept:${user.departmentId}` : '';
          const managerInfo = user.managerId ? ` Mgr:${user.managerId}` : '';
          const businessReviewer = user.isBusinessReviewer ? ' [BR]' : '';
          console.log(`     → ${user.name} (${user.role})${deptInfo}${managerInfo}${businessReviewer}`);
        });
      }
    });
  });

  // 3. Check current approval workflow setup
  console.log('\n\n3. APPROVAL WORKFLOW ANALYSIS:');
  
  const businessReviewers = await prisma.user.findMany({
    where: { isBusinessReviewer: true },
    include: {
      unit: {
        select: {
          id: true,
          code: true,
          name: true,
          unitType: true
        }
      },
      department: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  console.log(`\n👔 BUSINESS REVIEWERS (${businessReviewers.length}):`);
  businessReviewers.forEach(reviewer => {
    const unitInfo = reviewer.unit ? ` @ ${reviewer.unit.name} (${reviewer.unit.code})` : ' [No Unit]';
    const deptInfo = reviewer.department ? ` | Dept: ${reviewer.department.name}` : ' | No Dept';
    console.log(`   - ${reviewer.name} (${reviewer.role})${unitInfo}${deptInfo}`);
  });

  // 4. Check service catalog structure
  console.log('\n\n4. SERVICE CATALOG STRUCTURE:');
  const serviceCatalogStats = await prisma.serviceCatalog.groupBy({
    by: ['departmentId'],
    _count: {
      id: true
    },
    orderBy: {
      departmentId: 'asc'
    }
  });

  for (const stat of serviceCatalogStats) {
    const dept = await prisma.department.findUnique({
      where: { id: stat.departmentId },
      select: { name: true }
    });
    console.log(`   - ${dept?.name || 'Unknown'}: ${stat._count.id} services`);
  }

  // 5. Check recent tickets and their approval status
  console.log('\n\n5. RECENT TICKETS AND APPROVAL WORKFLOW:');
  const recentTickets = await prisma.ticket.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: {
        select: {
          name: true,
          role: true,
          unit: { select: { name: true, code: true } },
          department: { select: { name: true } }
        }
      },
      assignedTo: {
        select: {
          name: true,
          role: true,
          unit: { select: { name: true, code: true } },
          department: { select: { name: true } }
        }
      },
      businessApproval: {
        select: {
          approvalStatus: true,
          businessReviewer: {
            select: {
              name: true,
              unit: { select: { name: true, code: true } }
            }
          }
        }
      }
    }
  });

  console.log(`\n🎫 RECENT TICKETS (${recentTickets.length}):`);
  recentTickets.forEach(ticket => {
    const creatorUnit = ticket.createdBy.unit ? ` @ ${ticket.createdBy.unit.name}` : '';
    const creatorDept = ticket.createdBy.department ? ` (${ticket.createdBy.department.name})` : '';
    const assigneeInfo = ticket.assignedTo ? 
      ` → ${ticket.assignedTo.name} @ ${ticket.assignedTo.unit?.name || 'No Unit'}` : ' [Unassigned]';
    const approvalInfo = ticket.businessApproval ? 
      ` | Approval: ${ticket.businessApproval.approvalStatus} by ${ticket.businessApproval.businessReviewer.name}` : 
      ' | No Approval Required';
    
    console.log(`   #${ticket.id}: ${ticket.status} | ${ticket.createdBy.name}${creatorUnit}${creatorDept}${assigneeInfo}${approvalInfo}`);
  });

  // 6. Summary and recommendations
  console.log('\n\n6. CURRENT WORKFLOW SUMMARY:');
  
  const totalUsers = await prisma.user.count();
  const totalUnits = await prisma.unit.count();
  const totalTickets = await prisma.ticket.count();
  const pendingApprovals = await prisma.businessApproval.count({
    where: { approvalStatus: 'pending' }
  });

  console.log(`📊 System Statistics:`);
  console.log(`   - Total Users: ${totalUsers}`);
  console.log(`   - Total Departments: ${departments.length}`);
  console.log(`   - Total Units: ${totalUnits}`);
  console.log(`   - Business Reviewers: ${businessReviewers.length}`);
  console.log(`   - Total Tickets: ${totalTickets}`);
  console.log(`   - Pending Approvals: ${pendingApprovals}`);

  console.log('\n💡 WORKFLOW ANALYSIS:');
  
  // Check if approval is unit-based or department-based
  const departmentOnlyReviewers = businessReviewers.filter(br => br.departmentId && !br.unitId);
  const unitBasedReviewers = businessReviewers.filter(br => br.unitId);
  
  console.log(`   - Department-only reviewers: ${departmentOnlyReviewers.length}`);
  console.log(`   - Unit-based reviewers: ${unitBasedReviewers.length}`);
  
  if (unitBasedReviewers.length > 0) {
    console.log('   ✅ Current workflow appears to be UNIT-BASED approval');
    console.log('   📝 Each unit has its own approval authority');
  } else {
    console.log('   ⚠️  Current workflow appears to be DEPARTMENT-BASED approval');
    console.log('   📝 Approval is centralized at department level');
  }

  await prisma.$disconnect();
}

analyzeDepartmentStructure().catch((error) => {
  console.error('Error analyzing database structure:', error);
  process.exit(1);
});