import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCategories() {
  console.log('🌱 Starting category seeding...');

  try {
    // Get departments first
    const itDept = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });
    
    const supportDept = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });

    if (!itDept || !supportDept) {
      console.error('❌ Required departments not found. Please run user seed first.');
      return;
    }

    // Create categories
    console.log('📂 Creating categories...');

    const categories = await Promise.all([
      // IT Categories
      prisma.category.create({
        data: {
          name: 'Hardware',
          departmentId: itDept.id,
        }
      }),
      
      prisma.category.create({
        data: {
          name: 'Software',
          departmentId: itDept.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'Network',
          departmentId: itDept.id,
        }
      }),

      // Banking Categories
      prisma.category.create({
        data: {
          name: 'OLIBS',
          departmentId: supportDept.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'ATM',
          departmentId: itDept.id,
        }
      }),

      prisma.category.create({
        data: {
          name: 'KASDA',
          departmentId: supportDept.id,
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

      // OLIBS Login Issues items
      prisma.item.create({
        data: {
          name: 'Forgot Password',
          subCategoryId: subcategories[4].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'Account Locked',
          subCategoryId: subcategories[4].id,
        }
      }),

      // OLIBS Transaction Issues items
      prisma.item.create({
        data: {
          name: 'Transaction Failed',
          subCategoryId: subcategories[5].id,
        }
      }),

      // ATM items
      prisma.item.create({
        data: {
          name: 'ATM Out of Service',
          subCategoryId: subcategories[6].id,
        }
      }),

      prisma.item.create({
        data: {
          name: 'ATM Low on Cash',
          subCategoryId: subcategories[7].id,
        }
      }),
    ]);

    console.log(`✅ Created ${items.length} items`);

    console.log('🎉 Category seeding completed successfully!');
    console.log(`
📊 Summary:
- Categories: ${categories.length}
- Subcategories: ${subcategories.length}  
- Items: ${items.length}
    `);

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedCategories()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });