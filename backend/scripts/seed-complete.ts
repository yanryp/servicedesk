import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedComplete() {
  console.log('🌱 Starting complete database seeding...');

  try {
    // Clear existing data in proper order (respecting foreign key constraints)
    console.log('🧹 Clearing existing data...');
    await prisma.ticket.deleteMany({});
    await prisma.item.deleteMany({});
    await prisma.subCategory.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.department.deleteMany({});

    // Create departments
    console.log('🏢 Creating departments...');
    const itDepartment = await prisma.department.create({
      data: {
        name: 'Information Technology',
        description: 'IT support and technical services',
        departmentType: 'internal'
      }
    });

    const supportDepartment = await prisma.department.create({
      data: {
        name: 'Dukungan dan Layanan',
        description: 'Support and services for KASDA and BSGDirect users',
        departmentType: 'business'
      }
    });

    console.log(`✅ Created departments: ${itDepartment.name}, ${supportDepartment.name}`);

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Promise.all([
      // IT Categories
      prisma.category.create({
        data: {
          name: 'Hardware',
          departmentId: itDepartment.id,
        }
      }),
      
      prisma.category.create({
        data: {
          name: 'Software',
          departmentId: itDepartment.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'Network',
          departmentId: itDepartment.id,
        }
      }),

      // Banking Categories
      prisma.category.create({
        data: {
          name: 'OLIBS',
          departmentId: supportDepartment.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'ATM',
          departmentId: itDepartment.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'KASDA',
          departmentId: supportDepartment.id,
        }
      }),
    ]);

    console.log(`✅ Created ${categories.length} categories`);

    // Create subcategories
    console.log('📁 Creating subcategories...');
    const subcategories = await Promise.all([
      // Hardware subcategories
      prisma.subCategory.create({
        data: {
          name: 'Desktop Issues',
          categoryId: categories[0].id, // Hardware
        }
      }),
      
      prisma.subCategory.create({
        data: {
          name: 'Printer Issues',
          categoryId: categories[0].id, // Hardware
        }
      }),

      // Software subcategories
      prisma.subCategory.create({
        data: {
          name: 'Email Issues',
          categoryId: categories[1].id, // Software
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'Office Applications',
          categoryId: categories[1].id, // Software
        }
      }),

      // Network subcategories
      prisma.subCategory.create({
        data: {
          name: 'Connectivity Issues',
          categoryId: categories[2].id, // Network
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'VPN Issues',
          categoryId: categories[2].id, // Network
        }
      }),

      // OLIBS subcategories
      prisma.subCategory.create({
        data: {
          name: 'Login Issues',
          categoryId: categories[3].id, // OLIBS
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'Transaction Issues',
          categoryId: categories[3].id, // OLIBS
        }
      }),

      // ATM subcategories
      prisma.subCategory.create({
        data: {
          name: 'Hardware Malfunction',
          categoryId: categories[4].id, // ATM
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'Cash Management',
          categoryId: categories[4].id, // ATM
        }
      }),

      // KASDA subcategories
      prisma.subCategory.create({
        data: {
          name: 'System Access',
          categoryId: categories[5].id, // KASDA
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'Data Entry Issues',
          categoryId: categories[5].id, // KASDA
        }
      }),

      prisma.subCategory.create({
        data: {
          name: 'Report Generation',
          categoryId: categories[5].id, // KASDA
        }
      }),
    ]);

    console.log(`✅ Created ${subcategories.length} subcategories`);

    // Create items
    console.log('📄 Creating items...');
    const items = await Promise.all([
      // Desktop Issues items
      prisma.item.create({
        data: {
          name: 'Computer Won\'t Start',
          subCategoryId: subcategories[0].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Slow Performance',
          subCategoryId: subcategories[0].id,
        }
      }),

      // Printer Issues items
      prisma.item.create({
        data: {
          name: 'Printer Not Responding',
          subCategoryId: subcategories[1].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Paper Jam',
          subCategoryId: subcategories[1].id,
        }
      }),

      // Email Issues items
      prisma.item.create({
        data: {
          name: 'Cannot Send Emails',
          subCategoryId: subcategories[2].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Email Not Syncing',
          subCategoryId: subcategories[2].id,
        }
      }),

      // Office Applications items
      prisma.item.create({
        data: {
          name: 'Word Document Issues',
          subCategoryId: subcategories[3].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Excel Crashes',
          subCategoryId: subcategories[3].id,
        }
      }),

      // Network Connectivity Issues items
      prisma.item.create({
        data: {
          name: 'No Internet Access',
          subCategoryId: subcategories[4].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Slow Network Speed',
          subCategoryId: subcategories[4].id,
        }
      }),

      // VPN Issues items
      prisma.item.create({
        data: {
          name: 'Cannot Connect to VPN',
          subCategoryId: subcategories[5].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'VPN Keeps Disconnecting',
          subCategoryId: subcategories[5].id,
        }
      }),

      // OLIBS Login Issues items
      prisma.item.create({
        data: {
          name: 'Forgot Password',
          subCategoryId: subcategories[6].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Account Locked',
          subCategoryId: subcategories[6].id,
        }
      }),

      // OLIBS Transaction Issues items
      prisma.item.create({
        data: {
          name: 'Transaction Failed',
          subCategoryId: subcategories[7].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Payment Processing Error',
          subCategoryId: subcategories[7].id,
        }
      }),

      // ATM Hardware Malfunction items
      prisma.item.create({
        data: {
          name: 'ATM Out of Service',
          subCategoryId: subcategories[8].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Card Reader Not Working',
          subCategoryId: subcategories[8].id,
        }
      }),

      // ATM Cash Management items
      prisma.item.create({
        data: {
          name: 'ATM Low on Cash',
          subCategoryId: subcategories[9].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Cash Dispenser Jam',
          subCategoryId: subcategories[9].id,
        }
      }),

      // KASDA System Access items
      prisma.item.create({
        data: {
          name: 'Cannot Login to KASDA',
          subCategoryId: subcategories[10].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Permission Denied',
          subCategoryId: subcategories[10].id,
        }
      }),

      // KASDA Data Entry Issues items
      prisma.item.create({
        data: {
          name: 'Form Validation Error',
          subCategoryId: subcategories[11].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Data Not Saving',
          subCategoryId: subcategories[11].id,
        }
      }),

      // KASDA Report Generation items
      prisma.item.create({
        data: {
          name: 'Report Export Failed',
          subCategoryId: subcategories[12].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Report Shows Incorrect Data',
          subCategoryId: subcategories[12].id,
        }
      }),
    ]);

    console.log(`✅ Created ${items.length} items`);

    // Create users
    console.log('👤 Creating users...');

    // Admin user
    const adminUser = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@company.com',
        passwordHash: await bcrypt.hash('admin123', 10),
        role: 'admin',
        departmentId: itDepartment.id,
      }
    });

    // IT Technician
    const itTechnician = await prisma.user.create({
      data: {
        username: 'it.technician',
        email: 'it.technician@company.com',
        passwordHash: await bcrypt.hash('tech123', 10),
        role: 'technician',
        departmentId: itDepartment.id,
        primarySkill: 'network_infrastructure',
        experienceLevel: 'senior',
        secondarySkills: 'Windows Server, Cisco Networking, VMware',
      }
    });

    // Banking Support Technician
    const bankingTech = await prisma.user.create({
      data: {
        username: 'banking.tech',
        email: 'banking.tech@company.com',
        passwordHash: await bcrypt.hash('tech123', 10),
        role: 'technician',
        departmentId: supportDepartment.id,
        primarySkill: 'banking_systems',
        experienceLevel: 'expert',
        secondarySkills: 'OLIBS, Core Banking, Payment Systems',
      }
    });

    // KASDA User
    const kasdaUser = await prisma.user.create({
      data: {
        username: 'kasda.user',
        email: 'kasda.user@company.com',
        passwordHash: await bcrypt.hash('user123', 10),
        role: 'requester',
        departmentId: supportDepartment.id,
        isKasdaUser: true,
      }
    });

    // BSGDirect User
    const bsgUser = await prisma.user.create({
      data: {
        username: 'bsgdirect.user',
        email: 'bsgdirect.user@company.com',
        passwordHash: await bcrypt.hash('user123', 10),
        role: 'requester',
        departmentId: supportDepartment.id,
      }
    });

    // Branch Manager
    const branchManager = await prisma.user.create({
      data: {
        username: 'branch.manager',
        email: 'branch.manager@company.com',
        passwordHash: await bcrypt.hash('user123', 10),
        role: 'manager',
        departmentId: supportDepartment.id,
      }
    });

    console.log('✅ Created test users successfully!');

    console.log(`
📊 Complete Database Summary:
- Departments: 2
- Categories: ${categories.length}
- Subcategories: ${subcategories.length}  
- Items: ${items.length}
- Users: 6

📝 Login credentials:
👑 Admin: admin@company.com / admin123
🔧 IT Technician: it.technician@company.com / tech123
🏦 Banking Tech: banking.tech@company.com / tech123
🏛️ KASDA User: kasda.user@company.com / user123
📱 BSGDirect User: bsgdirect.user@company.com / user123
👔 Branch Manager: branch.manager@company.com / user123
    `);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the complete seed function
seedComplete()
  .catch((error) => {
    console.error('❌ Complete seeding failed:', error);
    process.exit(1);
  });