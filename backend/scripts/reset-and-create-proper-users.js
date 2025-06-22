// scripts/reset-and-create-proper-users.js
// Clean up improper users and create proper users with correct department assignments

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 CLEANING UP AND RECREATING PROPER USERS\n');

  try {
    // Step 1: Clean up existing data (handle foreign key constraints)
    console.log('🗑️  Cleaning up existing data...');
    
    // Delete tickets first (they reference users)
    const deletedTickets = await prisma.ticket.deleteMany();
    console.log(`   - Deleted ${deletedTickets.count} tickets`);
    
    // Delete other related data (if tables exist)
    try {
      await prisma.classificationAudit.deleteMany();
      console.log('   - Deleted classification audit records');
    } catch (error) {
      console.log('   - Classification audit table not found (skipping)');
    }
    
    // Now we can safely delete users
    const deletedUsers = await prisma.user.deleteMany();
    console.log(`   - Deleted ${deletedUsers.count} users`);
    
    console.log('✅ All existing data cleaned up\n');

    // Step 2: Get existing departments or create them
    console.log('🏢 Setting up departments...');
    
    let itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });
    
    if (!itDepartment) {
      itDepartment = await prisma.department.create({
        data: {
          name: 'Information Technology',
          description: 'IT support and technical services',
          departmentType: 'internal',
          isServiceOwner: true
        }
      });
    }

    let supportDepartment = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });
    
    if (!supportDepartment) {
      supportDepartment = await prisma.department.create({
        data: {
          name: 'Dukungan dan Layanan',
          description: 'Support and services for KASDA and BSGDirect users',
          departmentType: 'business',
          isServiceOwner: true
        }
      });
    }

    console.log(`✅ Departments ready:`);
    console.log(`   - ${itDepartment.name} (ID: ${itDepartment.id})`);
    console.log(`   - ${supportDepartment.name} (ID: ${supportDepartment.id})\n`);

    // Step 3: Create password hashes
    const adminPassword = await bcrypt.hash('admin123', 10);
    const techPassword = await bcrypt.hash('tech123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    // Step 4: Create admin user (no department - can access all)
    console.log('👑 Creating admin user...');
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@company.com',
        passwordHash: adminPassword,
        role: 'admin',
        departmentId: null, // Admin can access all departments
        primarySkill: 'System Administration',
        experienceLevel: 'senior',
        isAvailable: true,
        workloadCapacity: 100,
        currentWorkload: 0
      }
    });
    console.log(`✅ Admin created: ${admin.email}\n`);

    // Step 5: Create IT Department technicians
    console.log('🔧 Creating IT department technicians...');
    
    const networkAdmin = await prisma.user.create({
      data: {
        username: 'network_admin',
        email: 'network.admin@company.com',
        passwordHash: techPassword,
        role: 'technician',
        departmentId: itDepartment.id,
        primarySkill: 'Network Administration',
        experienceLevel: 'senior',
        secondarySkills: 'VPN, Firewall, Security',
        isAvailable: true,
        workloadCapacity: 20,
        currentWorkload: 0
      }
    });

    const itTechnician = await prisma.user.create({
      data: {
        username: 'it_technician',
        email: 'it.technician@company.com',
        passwordHash: techPassword,
        role: 'technician',
        departmentId: itDepartment.id,
        primarySkill: 'Hardware Support',
        experienceLevel: 'intermediate',
        secondarySkills: 'Desktop Support, Printers',
        isAvailable: true,
        workloadCapacity: 15,
        currentWorkload: 0
      }
    });

    const itManager = await prisma.user.create({
      data: {
        username: 'it_manager',
        email: 'it.manager@company.com',
        passwordHash: techPassword,
        role: 'manager',
        departmentId: itDepartment.id,
        primarySkill: 'IT Management',
        experienceLevel: 'senior',
        isAvailable: true,
        workloadCapacity: 10,
        currentWorkload: 0
      }
    });

    console.log(`✅ IT Department users created:`);
    console.log(`   - ${networkAdmin.username}: ${networkAdmin.primarySkill}`);
    console.log(`   - ${itTechnician.username}: ${itTechnician.primarySkill}`);
    console.log(`   - ${itManager.username}: ${itManager.primarySkill}\n`);

    // Step 6: Create Dukungan dan Layanan technicians
    console.log('🏦 Creating Dukungan dan Layanan technicians...');
    
    const kasdaSpecialist = await prisma.user.create({
      data: {
        username: 'kasda_specialist',
        email: 'kasda.specialist@company.com',
        passwordHash: techPassword,
        role: 'technician',
        departmentId: supportDepartment.id,
        primarySkill: 'KASDA Support',
        experienceLevel: 'expert',
        secondarySkills: 'Banking Systems, Financial Applications',
        isAvailable: true,
        workloadCapacity: 25,
        currentWorkload: 0
      }
    });

    const bsgDirectSpecialist = await prisma.user.create({
      data: {
        username: 'bsgdirect_specialist',
        email: 'bsgdirect.specialist@company.com',
        passwordHash: techPassword,
        role: 'technician',
        departmentId: supportDepartment.id,
        primarySkill: 'BSGDirect Support',
        experienceLevel: 'expert',
        secondarySkills: 'Mobile Banking, Digital Services',
        isAvailable: true,
        workloadCapacity: 25,
        currentWorkload: 0
      }
    });

    const supportManager = await prisma.user.create({
      data: {
        username: 'support_manager',
        email: 'support.manager@company.com',
        passwordHash: techPassword,
        role: 'manager',
        departmentId: supportDepartment.id,
        primarySkill: 'Support Management',
        experienceLevel: 'senior',
        isAvailable: true,
        workloadCapacity: 10,
        currentWorkload: 0
      }
    });

    console.log(`✅ Dukungan dan Layanan users created:`);
    console.log(`   - ${kasdaSpecialist.username}: ${kasdaSpecialist.primarySkill}`);
    console.log(`   - ${bsgDirectSpecialist.username}: ${bsgDirectSpecialist.primarySkill}`);
    console.log(`   - ${supportManager.username}: ${supportManager.primarySkill}\n`);

    // Step 7: Create test requesters
    console.log('👥 Creating test requesters...');
    
    const kasdaUser = await prisma.user.create({
      data: {
        username: 'kasda_user',
        email: 'kasda.user@branch.com',
        passwordHash: userPassword,
        role: 'requester',
        departmentId: null, // Requesters don't need department assignment
        // Removed isKasdaUser flag - routing now based on category selection
        primarySkill: 'KASDA Systems', // Indicates user expertise area
        isAvailable: false // Requesters don't handle tickets
      }
    });

    const bsgDirectUser = await prisma.user.create({
      data: {
        username: 'bsgdirect_user',
        email: 'bsgdirect.user@branch.com',
        passwordHash: userPassword,
        role: 'requester',
        departmentId: null,
        primarySkill: 'BSGDirect Systems', // Indicates user expertise area
        isAvailable: false
      }
    });

    const branchUser = await prisma.user.create({
      data: {
        username: 'branch_user',
        email: 'branch.user@branch.com',
        passwordHash: userPassword,
        role: 'requester',
        departmentId: null,
        primarySkill: 'General Banking', // General branch user
        isAvailable: false
      }
    });

    console.log(`✅ Test requesters created:`);
    console.log(`   - ${kasdaUser.username}: Branch user (KASDA expertise)`);
    console.log(`   - ${bsgDirectUser.username}: Branch user (BSGDirect expertise)`);
    console.log(`   - ${branchUser.username}: Branch user (General banking)\n`);

    // Step 8: Display login credentials
    console.log('🔑 LOGIN CREDENTIALS:\n');
    console.log('👑 ADMIN:');
    console.log(`   Email: admin@company.com`);
    console.log(`   Password: admin123\n`);
    
    console.log('🔧 IT DEPARTMENT:');
    console.log(`   Network Admin: network.admin@company.com / tech123`);
    console.log(`   IT Technician: it.technician@company.com / tech123`);
    console.log(`   IT Manager: it.manager@company.com / tech123\n`);
    
    console.log('🏦 DUKUNGAN DAN LAYANAN:');
    console.log(`   KASDA Specialist: kasda.specialist@company.com / tech123`);
    console.log(`   BSGDirect Specialist: bsgdirect.specialist@company.com / tech123`);
    console.log(`   Support Manager: support.manager@company.com / tech123\n`);
    
    console.log('👥 TEST BRANCH USERS:');
    console.log(`   Branch User (KASDA expertise): kasda.user@branch.com / user123`);
    console.log(`   Branch User (BSGDirect expertise): bsgdirect.user@branch.com / user123`);
    console.log(`   Branch User (General banking): branch.user@branch.com / user123\n`);

    console.log('✅ ALL USERS CREATED SUCCESSFULLY!');
    console.log('🎯 Ready for category-based routing testing!');
    console.log('📝 Note: All branch users can now select any category (KASDA, BSGDirect, IT)');
    console.log('🔄 Routing happens based on category selection, not user type');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });