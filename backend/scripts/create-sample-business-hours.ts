import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleBusinessHours() {
  console.log('🕘 Creating Sample Business Hours and Holiday Data...');

  try {
    // Get departments for business hours setup
    const itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });

    const supportDepartment = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });

    if (!itDepartment || !supportDepartment) {
      throw new Error('Required departments not found');
    }

    // Create business hours for IT Department (Monday-Friday 9-17, Saturday 9-12)
    console.log('📅 Creating IT Department business hours...');
    
    const itBusinessHours = [
      // Monday to Friday
      ...Array.from({ length: 5 }, (_, i) => ({
        departmentId: itDepartment.id,
        dayOfWeek: i + 1, // 1 = Monday, 5 = Friday
        startTime: '09:00',
        endTime: '17:00',
        timezone: 'Asia/Jakarta',
        isActive: true
      })),
      // Saturday
      {
        departmentId: itDepartment.id,
        dayOfWeek: 6, // Saturday
        startTime: '09:00',
        endTime: '12:00',
        timezone: 'Asia/Jakarta',
        isActive: true
      }
    ];

    await prisma.businessHoursConfig.createMany({
      data: itBusinessHours,
      skipDuplicates: true
    });

    // Create business hours for Support Department (Monday-Friday 8-18, Saturday 8-14)
    console.log('📅 Creating Support Department business hours...');
    
    const supportBusinessHours = [
      // Monday to Friday
      ...Array.from({ length: 5 }, (_, i) => ({
        departmentId: supportDepartment.id,
        dayOfWeek: i + 1,
        startTime: '08:00',
        endTime: '18:00',
        timezone: 'Asia/Jakarta',
        isActive: true
      })),
      // Saturday
      {
        departmentId: supportDepartment.id,
        dayOfWeek: 6,
        startTime: '08:00',
        endTime: '14:00',
        timezone: 'Asia/Jakarta',
        isActive: true
      }
    ];

    await prisma.businessHoursConfig.createMany({
      data: supportBusinessHours,
      skipDuplicates: true
    });

    // Create sample holidays for 2025
    console.log('🎉 Creating sample holidays for 2025...');
    
    const holidays2025 = [
      // Indonesian National Holidays 2025
      {
        name: 'Tahun Baru',
        date: new Date('2025-01-01'),
        description: 'New Year\'s Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: null, // Global holiday
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Raya Idul Fitri',
        date: new Date('2025-03-31'),
        description: 'Eid al-Fitr (estimated)',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Raya Idul Fitri (Kedua)',
        date: new Date('2025-04-01'),
        description: 'Second day of Eid al-Fitr',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Buruh',
        date: new Date('2025-05-01'),
        description: 'Labour Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Kenaikan Isa Almasih',
        date: new Date('2025-05-29'),
        description: 'Ascension of Jesus Christ',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Pancasila',
        date: new Date('2025-06-01'),
        description: 'Pancasila Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Raya Idul Adha',
        date: new Date('2025-06-07'),
        description: 'Eid al-Adha (estimated)',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Tahun Baru Islam',
        date: new Date('2025-06-27'),
        description: 'Islamic New Year (estimated)',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Kemerdekaan',
        date: new Date('2025-08-17'),
        description: 'Independence Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Maulid Nabi Muhammad',
        date: new Date('2025-09-05'),
        description: 'Prophet Muhammad\'s Birthday (estimated)',
        isRecurring: false,
        recurrenceRule: null,
        departmentId: null,
        unitId: null,
        isActive: true
      },
      {
        name: 'Hari Natal',
        date: new Date('2025-12-25'),
        description: 'Christmas Day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: null,
        unitId: null,
        isActive: true
      }
    ];

    await prisma.holidayCalendar.createMany({
      data: holidays2025,
      skipDuplicates: true
    });

    // Create some department-specific holidays
    console.log('🏢 Creating department-specific holidays...');
    
    const departmentHolidays = [
      {
        name: 'IT Department Training Day',
        date: new Date('2025-07-15'),
        description: 'Annual IT department training and team building',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: itDepartment.id,
        unitId: null,
        isActive: true
      },
      {
        name: 'Customer Service Excellence Day',
        date: new Date('2025-10-15'),
        description: 'Support department excellence day',
        isRecurring: true,
        recurrenceRule: 'FREQ=YEARLY',
        departmentId: supportDepartment.id,
        unitId: null,
        isActive: true
      }
    ];

    await prisma.holidayCalendar.createMany({
      data: departmentHolidays,
      skipDuplicates: true
    });

    // Create sample SLA policies with business hours
    console.log('📋 Creating sample SLA policies...');
    
    const slaPolicies = [
      {
        name: 'Critical IT Issues',
        description: 'SLA for critical IT infrastructure issues',
        departmentId: itDepartment.id,
        priority: 'urgent' as const,
        responseTimeMinutes: 30,
        resolutionTimeMinutes: 240, // 4 hours
        businessHoursOnly: true,
        isActive: true,
        escalationMatrix: {
          levels: [
            { level: 1, timeMinutes: 60, assignToRole: 'technician' },
            { level: 2, timeMinutes: 120, assignToRole: 'manager' }
          ]
        },
        notificationRules: {
          onCreated: true,
          onEscalated: true,
          beforeBreach: 30
        }
      },
      {
        name: 'High Priority Support',
        description: 'SLA for high priority business support issues',
        departmentId: supportDepartment.id,
        priority: 'high' as const,
        responseTimeMinutes: 60,
        resolutionTimeMinutes: 480, // 8 hours
        businessHoursOnly: true,
        isActive: true,
        escalationMatrix: {
          levels: [
            { level: 1, timeMinutes: 120, assignToRole: 'technician' },
            { level: 2, timeMinutes: 240, assignToRole: 'manager' }
          ]
        },
        notificationRules: {
          onCreated: true,
          onEscalated: true,
          beforeBreach: 60
        }
      },
      {
        name: 'Standard Business Hours',
        description: 'Default SLA for medium priority issues',
        priority: 'medium' as const,
        responseTimeMinutes: 120,
        resolutionTimeMinutes: 1440, // 24 hours
        businessHoursOnly: true,
        isActive: true,
        escalationMatrix: {
          levels: [
            { level: 1, timeMinutes: 480, assignToRole: 'technician' },
            { level: 2, timeMinutes: 960, assignToRole: 'manager' }
          ]
        },
        notificationRules: {
          onCreated: false,
          onEscalated: true,
          beforeBreach: 120
        }
      },
      {
        name: '24/7 Critical Infrastructure',
        description: 'SLA for critical infrastructure - no business hours restriction',
        priority: 'urgent' as const,
        responseTimeMinutes: 15,
        resolutionTimeMinutes: 120, // 2 hours
        businessHoursOnly: false, // 24/7 support
        isActive: true,
        escalationMatrix: {
          levels: [
            { level: 1, timeMinutes: 30, assignToRole: 'technician' },
            { level: 2, timeMinutes: 60, assignToRole: 'manager' }
          ]
        },
        notificationRules: {
          onCreated: true,
          onEscalated: true,
          beforeBreach: 15
        }
      }
    ];

    for (const policy of slaPolicies) {
      await prisma.slaPolicy.create({
        data: policy
      });
    }

    // Summary
    const businessHoursCount = await prisma.businessHoursConfig.count();
    const holidaysCount = await prisma.holidayCalendar.count();
    const slaPoliciesCount = await prisma.slaPolicy.count();

    console.log(`
✅ Sample Data Creation Complete!

📊 Summary:
   🕘 Business Hours Configurations: ${businessHoursCount}
   🎉 Holiday Calendar Entries: ${holidaysCount}
   📋 SLA Policies: ${slaPoliciesCount}

🏢 Business Hours Created:
   • IT Department: Mon-Fri 9:00-17:00, Sat 9:00-12:00
   • Support Department: Mon-Fri 8:00-18:00, Sat 8:00-14:00

🎉 Holidays Created:
   • 11 National Indonesian holidays for 2025
   • 2 Department-specific holidays

📋 SLA Policies Created:
   • Critical IT Issues (4 hours, business hours only)
   • High Priority Support (8 hours, business hours only)
   • Standard Business Hours (24 hours, business hours only)
   • 24/7 Critical Infrastructure (2 hours, no business hours restriction)

🚀 Ready to test SLA calculations with business hours!
    `);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createSampleBusinessHours()
  .catch((error) => {
    console.error('❌ Sample data creation failed:', error);
    process.exit(1);
  });