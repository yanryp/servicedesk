import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedProductionData() {
  console.log('🌱 Starting production-ready database seeding...');

  try {
    // Don't clear existing data - this is for restoring missing data only
    console.log('📊 Checking existing data...');
    
    const existingCatalogs = await prisma.serviceCatalog.count();
    console.log(`Found ${existingCatalogs} existing service catalogs`);

    if (existingCatalogs > 0) {
      console.log('✅ Service catalogs already exist - skipping catalog creation');
    } else {
      console.log('📁 Creating core service catalogs...');
      
      // Get departments for foreign key relationships
      const itDept = await prisma.department.findFirst({ where: { name: 'Information Technology' } });
      const supportDept = await prisma.department.findFirst({ where: { name: 'Dukungan dan Layanan' } });
      
      if (!itDept || !supportDept) {
        throw new Error('Required departments not found. Please run restore-test-credentials.ts first.');
      }

      // Core Banking Systems
      const coreBanking = await prisma.serviceCatalog.create({
        data: {
          name: 'Core Banking Systems',
          description: 'Central banking platform and infrastructure services',
          serviceType: 'business_service',
          categoryLevel: 1,
          departmentId: supportDept.id,
          isActive: true,
          requiresApproval: true,
          businessImpact: 'high',
          estimatedTime: 480
        }
      });

      // Digital Channels & Customer Applications  
      const digitalChannels = await prisma.serviceCatalog.create({
        data: {
          name: 'Digital Channels & Customer Applications',
          description: 'Mobile banking, internet banking, and customer-facing applications',
          serviceType: 'business_service',
          categoryLevel: 1,
          departmentId: supportDept.id,
          isActive: true,
          requiresApproval: true,
          businessImpact: 'high',
          estimatedTime: 360
        }
      });

      // IT Infrastructure & Support
      const itInfrastructure = await prisma.serviceCatalog.create({
        data: {
          name: 'IT Infrastructure & Support',
          description: 'Network, hardware, software, and IT support services',
          serviceType: 'technical_service',
          categoryLevel: 1,
          departmentId: itDept.id,
          isActive: true,
          requiresApproval: false,
          businessImpact: 'medium',
          estimatedTime: 240
        }
      });

      // ATM & Payment Systems
      const atmPayment = await prisma.serviceCatalog.create({
        data: {
          name: 'ATM & Payment Systems',
          description: 'ATM machines, EDC terminals, and payment processing',
          serviceType: 'business_service', 
          categoryLevel: 1,
          departmentId: supportDept.id,
          isActive: true,
          requiresApproval: true,
          businessImpact: 'high',
          estimatedTime: 480
        }
      });

      console.log('✅ Created 4 core service catalogs');

      // Create service items for each catalog
      console.log('📂 Creating service items...');

      // Core Banking service items
      await prisma.serviceItem.createMany({
        data: [
          {
            name: 'OLIBS Core Banking',
            description: 'Core banking system access and operations',
            serviceCatalogId: coreBanking.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'high'
          },
          {
            name: 'KASDA Treasury System',
            description: 'Government treasury and accounting system support',
            serviceCatalogId: coreBanking.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: true,
            businessImpact: 'critical'
          }
        ]
      });

      // Digital Channels service items
      await prisma.serviceItem.createMany({
        data: [
          {
            name: 'BSGTouch Mobile Banking',
            description: 'Mobile banking application support and management',
            serviceCatalogId: digitalChannels.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'high'
          },
          {
            name: 'BSGDirect Internet Banking',
            description: 'Internet banking platform support',
            serviceCatalogId: digitalChannels.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'high'
          }
        ]
      });

      // IT Infrastructure service items
      await prisma.serviceItem.createMany({
        data: [
          {
            name: 'Network & Connectivity',
            description: 'Network infrastructure, internet, and connectivity issues',
            serviceCatalogId: itInfrastructure.id,
            requestType: 'incident',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'medium'
          },
          {
            name: 'Hardware & Equipment',
            description: 'Computer hardware, printers, and office equipment support',
            serviceCatalogId: itInfrastructure.id,
            requestType: 'incident',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'low'
          },
          {
            name: 'Software & Applications',
            description: 'Office software, applications, and system software support',
            serviceCatalogId: itInfrastructure.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'medium'
          }
        ]
      });

      // ATM & Payment service items
      await prisma.serviceItem.createMany({
        data: [
          {
            name: 'ATM Operations',
            description: 'ATM machine issues, cash loading, and maintenance',
            serviceCatalogId: atmPayment.id,
            requestType: 'incident',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'high'
          },
          {
            name: 'EDC Terminal Support',
            description: 'Point of sale terminal support and configuration',
            serviceCatalogId: atmPayment.id,
            requestType: 'service_request',
            isActive: true,
            requiresGovApproval: false,
            businessImpact: 'medium'
          }
        ]
      });

      console.log('✅ Created service items for all catalogs');
    }

    // Create categories if they don't exist
    console.log('📋 Creating legacy categories...');
    const existingCategories = await prisma.category.count();
    
    if (existingCategories === 0) {
      await prisma.category.createMany({
        data: [
          { name: 'Hardware' },
          { name: 'Software' },
          { name: 'Network' },
          { name: 'KASDA' },
          { name: 'BSGDirect' },
          { name: 'OLIBS' },
          { name: 'ATM' },
          { name: 'General' }
        ]
      });
      console.log('✅ Created 8 legacy categories');
    } else {
      console.log(`✅ Found ${existingCategories} existing categories`);
    }

    // Create basic SLA policies
    console.log('⏱️ Creating default SLA policies...');
    const existingSLAs = await prisma.slaPolicy.count();
    
    if (existingSLAs === 0) {
      const itDept = await prisma.department.findFirst({ where: { name: 'Information Technology' } });
      const supportDept = await prisma.department.findFirst({ where: { name: 'Dukungan dan Layanan' } });

      if (itDept && supportDept) {
        await prisma.slaPolicy.createMany({
          data: [
            {
              name: 'Critical IT Infrastructure',
              description: 'High priority IT infrastructure issues',
              departmentId: itDept.id,
              priority: 'urgent',
              responseTimeMinutes: 15,
              resolutionTimeMinutes: 120,
              businessHoursOnly: false,
              isActive: true
            },
            {
              name: 'Standard IT Support',
              description: 'Regular IT support and service requests',
              departmentId: itDept.id,
              priority: 'medium',
              responseTimeMinutes: 60,
              resolutionTimeMinutes: 480,
              businessHoursOnly: true,
              isActive: true
            },
            {
              name: 'Banking Systems Critical',
              description: 'Critical banking system issues',
              departmentId: supportDept.id,
              priority: 'urgent',
              responseTimeMinutes: 10,
              resolutionTimeMinutes: 60,
              businessHoursOnly: false,
              isActive: true
            },
            {
              name: 'Banking Systems Standard',
              description: 'Standard banking system support',
              departmentId: supportDept.id,
              priority: 'medium',
              responseTimeMinutes: 30,
              resolutionTimeMinutes: 240,
              businessHoursOnly: true,
              isActive: true
            }
          ]
        });
        console.log('✅ Created 4 default SLA policies');
      }
    } else {
      console.log(`✅ Found ${existingSLAs} existing SLA policies`);
    }

    // Final verification
    console.log('🔍 Final verification...');
    const finalStats = {
      departments: await prisma.department.count(),
      units: await prisma.unit.count(),
      users: await prisma.user.count(),
      serviceCatalogs: await prisma.serviceCatalog.count(),
      serviceItems: await prisma.serviceItem.count(),
      categories: await prisma.category.count(),
      slaPolices: await prisma.slaPolicy.count()
    };

    console.log('📊 Database Summary:');
    console.log(`  👥 Users: ${finalStats.users}`);
    console.log(`  🏢 Departments: ${finalStats.departments}`);
    console.log(`  🏦 Units (Branches): ${finalStats.units}`);
    console.log(`  📁 Service Catalogs: ${finalStats.serviceCatalogs}`);
    console.log(`  📂 Service Items: ${finalStats.serviceItems}`);
    console.log(`  📋 Categories: ${finalStats.categories}`);
    console.log(`  ⏱️ SLA Policies: ${finalStats.slaPolices}`);

    console.log('✅ Production database seeding completed successfully!');
    console.log('🎉 System is ready for deployment and testing!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionData();