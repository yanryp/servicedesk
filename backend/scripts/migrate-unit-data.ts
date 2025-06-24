// Migration script to create Units and assign users to units for branch-based approval
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function migrateUnitData() {
  console.log('🏢 Starting unit data migration...');

  try {
    // Step 1: Create Units from existing BSGMasterData
    console.log('Step 1: Creating units from BSGMasterData...');
    
    const existingUnits = await prisma.bSGMasterData.findMany({
      where: {
        dataType: 'unit',
        isActive: true
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`Found ${existingUnits.length} existing unit records in BSGMasterData`);

    for (const unitData of existingUnits) {
      // Determine unit type based on code/name
      let unitType = 'branch';
      if (unitData.code?.startsWith('DEPT_')) {
        unitType = 'department';
      } else if (unitData.name.includes('CAPEM')) {
        unitType = 'capem';
      }

      // Find matching department
      let departmentId = null;
      if (unitData.metadata && typeof unitData.metadata === 'object' && 'originalId' in unitData.metadata) {
        const originalId = unitData.metadata.originalId as number;
        const dept = await prisma.department.findUnique({ where: { id: originalId } });
        if (dept) {
          departmentId = dept.id;
        }
      }

      // Create or update unit
      const unit = await prisma.unit.upsert({
        where: { code: unitData.code || `UNIT_${unitData.id}` },
        create: {
          code: unitData.code || `UNIT_${unitData.id}`,
          name: unitData.name,
          displayName: unitData.displayName || unitData.name,
          unitType: unitType,
          departmentId: departmentId,
          isActive: unitData.isActive,
          sortOrder: unitData.sortOrder,
          metadata: unitData.metadata || {}
        },
        update: {
          name: unitData.name,
          displayName: unitData.displayName || unitData.name,
          unitType: unitType,
          departmentId: departmentId,
          isActive: unitData.isActive,
          sortOrder: unitData.sortOrder,
          metadata: unitData.metadata || {}
        }
      });

      console.log(`✅ Created/updated unit: ${unit.name} (${unit.unitType})`);
    }

    // Step 2: Create some default units for departments that don't have them
    console.log('Step 2: Creating default units for departments...');
    
    const departments = await prisma.department.findMany({
      include: {
        units: true
      }
    });

    for (const dept of departments) {
      if (dept.units.length === 0) {
        const defaultUnit = await prisma.unit.create({
          data: {
            code: `DEPT_${dept.id}`,
            name: dept.name,
            displayName: `Unit ${dept.name}`,
            unitType: 'department',
            departmentId: dept.id,
            isActive: true,
            sortOrder: 1,
            metadata: { type: 'department', originalId: dept.id }
          }
        });
        
        console.log(`✅ Created default unit for department: ${dept.name}`);
      }
    }

    // Step 3: Assign users to units based on their department
    console.log('Step 3: Assigning users to units...');
    
    const users = await prisma.user.findMany({
      where: {
        unitId: null // Only users not yet assigned to units
      },
      include: {
        department: true
      }
    });

    for (const user of users) {
      if (user.departmentId) {
        // Find a unit in the user's department
        const departmentUnit = await prisma.unit.findFirst({
          where: {
            departmentId: user.departmentId,
            isActive: true
          },
          orderBy: { sortOrder: 'asc' }
        });

        if (departmentUnit) {
          await prisma.user.update({
            where: { id: user.id },
            data: { unitId: departmentUnit.id }
          });
          
          console.log(`✅ Assigned ${user.username} to unit: ${departmentUnit.name}`);
        }
      }
    }

    // Step 4: Create unit managers with business reviewer permissions
    console.log('Step 4: Creating unit managers...');
    
    const units = await prisma.unit.findMany({
      include: {
        department: true,
        users: true
      }
    });

    for (const unit of units) {
      // Check if this unit already has a manager
      const hasManager = unit.users.some(user => 
        user.role === 'manager' && user.isBusinessReviewer
      );

      if (!hasManager) {
        const managerPassword = await bcrypt.hash('manager123', 10);
        
        const manager = await prisma.user.create({
          data: {
            username: `${unit.code.toLowerCase()}.manager`,
            email: `${unit.code.toLowerCase()}.manager@company.com`,
            passwordHash: managerPassword,
            role: 'manager',
            departmentId: unit.departmentId,
            unitId: unit.id,
            isAvailable: true,
            isBusinessReviewer: true,
            isKasdaUser: unit.unitType === 'department' && unit.name.includes('Layanan'),
            primarySkill: 'Management'
          }
        });

        console.log(`✅ Created manager for unit ${unit.name}: ${manager.username}`);
      }
    }

    // Step 5: Create additional branch managers for common branches
    console.log('Step 5: Creating additional branch managers...');
    
    const branchManagers = [
      {
        code: 'CABANG_UTAMA',
        name: 'Cabang Utama',
        unitType: 'branch',
        departmentId: null
      },
      {
        code: 'CAPEM_JAKARTA',
        name: 'Capem Jakarta',
        unitType: 'capem',
        departmentId: null
      }
    ];

    for (const branchData of branchManagers) {
      // Create unit if it doesn't exist
      const unit = await prisma.unit.upsert({
        where: { code: branchData.code },
        create: {
          code: branchData.code,
          name: branchData.name,
          displayName: branchData.name,
          unitType: branchData.unitType,
          departmentId: branchData.departmentId,
          isActive: true,
          sortOrder: 100,
          metadata: { type: 'branch' }
        },
        update: {}
      });

      // Create manager for this unit
      const managerPassword = await bcrypt.hash('manager123', 10);
      
      const existingManager = await prisma.user.findUnique({
        where: { username: `${branchData.code.toLowerCase()}.manager` }
      });

      if (!existingManager) {
        const manager = await prisma.user.create({
          data: {
            username: `${branchData.code.toLowerCase()}.manager`,
            email: `${branchData.code.toLowerCase()}.manager@company.com`,
            passwordHash: managerPassword,
            role: 'manager',
            departmentId: branchData.departmentId,
            unitId: unit.id,
            isAvailable: true,
            isBusinessReviewer: true,
            isKasdaUser: false,
            primarySkill: 'Branch Management'
          }
        });

        console.log(`✅ Created branch manager: ${manager.username} for ${unit.name}`);
      }
    }

    // Step 6: Summary report
    const unitCount = await prisma.unit.count();
    const usersWithUnits = await prisma.user.count({ where: { unitId: { not: null } } });
    const managersCount = await prisma.user.count({ 
      where: { 
        role: 'manager',
        isBusinessReviewer: true 
      } 
    });

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Total units created: ${unitCount}`);
    console.log(`✅ Users assigned to units: ${usersWithUnits}`);
    console.log(`✅ Business reviewer managers: ${managersCount}`);
    
    console.log('\n🎉 Unit data migration completed successfully!');
    console.log('\nSample Manager Accounts Created:');
    
    const sampleManagers = await prisma.user.findMany({
      where: {
        role: 'manager',
        isBusinessReviewer: true
      },
      include: {
        unit: true,
        department: true
      },
      take: 5
    });

    sampleManagers.forEach(manager => {
      console.log(`  - ${manager.email} (password: manager123) - Unit: ${manager.unit?.name || 'No unit'}`);
    });

  } catch (error) {
    console.error('❌ Error during unit data migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateUnitData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });