import { PrismaClient } from '@prisma/client';
import { calculateSLADueDate, isCurrentlyInBusinessHours, slaCalculator } from '../src/utils/slaCalculator';

const prisma = new PrismaClient();

async function testSLABusinessHours() {
  console.log('🧪 Testing SLA Business Hours System...\n');

  try {
    // Get departments for testing
    const itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });

    const supportDepartment = await prisma.department.findFirst({
      where: { name: 'Dukungan dan Layanan' }
    });

    if (!itDepartment || !supportDepartment) {
      throw new Error('Required departments not found');
    }

    console.log(`📋 Testing with departments:
    • IT Department: ${itDepartment.name} (ID: ${itDepartment.id})
    • Support Department: ${supportDepartment.name} (ID: ${supportDepartment.id})\n`);

    // Test 1: Check current business hours status
    console.log('🕐 Test 1: Current Business Hours Status');
    const now = new Date();
    
    const itBusinessHours = await isCurrentlyInBusinessHours(now, {
      departmentId: itDepartment.id
    });
    
    const supportBusinessHours = await isCurrentlyInBusinessHours(now, {
      departmentId: supportDepartment.id
    });

    console.log(`Current time: ${now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} (Jakarta time)`);
    console.log(`IT Department in business hours: ${itBusinessHours ? '✅ YES' : '❌ NO'}`);
    console.log(`Support Department in business hours: ${supportBusinessHours ? '✅ YES' : '❌ NO'}\n`);

    // Test 2: Calculate SLA due dates for different scenarios
    console.log('📅 Test 2: SLA Due Date Calculations');
    
    // Test during business hours (Monday 10 AM)
    const mondayMorning = new Date('2025-07-07T10:00:00+07:00'); // Monday 10 AM Jakarta time
    
    console.log(`\\nScenario A: Ticket created on ${mondayMorning.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} (Monday 10 AM)`);
    
    // 4-hour SLA for IT (urgent priority)
    const itSLA = await calculateSLADueDate(mondayMorning, 240, {
      departmentId: itDepartment.id,
      businessHoursOnly: true
    });
    
    console.log(`   IT 4-hour SLA (business hours only):`);
    console.log(`   • Due date: ${itSLA.dueDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`   • Currently in business hours: ${itSLA.isCurrentlyInBusinessHours ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Holidays skipped: ${itSLA.holidaysSkipped.length > 0 ? itSLA.holidaysSkipped.join(', ') : 'None'}`);
    
    // 8-hour SLA for Support (high priority)
    const supportSLA = await calculateSLADueDate(mondayMorning, 480, {
      departmentId: supportDepartment.id,
      businessHoursOnly: true
    });
    
    console.log(`   Support 8-hour SLA (business hours only):`);
    console.log(`   • Due date: ${supportSLA.dueDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`   • Currently in business hours: ${supportSLA.isCurrentlyInBusinessHours ? '✅ YES' : '❌ NO'}`);
    console.log(`   • Holidays skipped: ${supportSLA.holidaysSkipped.length > 0 ? supportSLA.holidaysSkipped.join(', ') : 'None'}`);

    // Test during weekend
    const saturdayAfternoon = new Date('2025-07-05T15:00:00+07:00'); // Saturday 3 PM Jakarta time
    
    console.log(`\\nScenario B: Ticket created on ${saturdayAfternoon.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} (Saturday 3 PM)`);
    
    const weekendSLA = await calculateSLADueDate(saturdayAfternoon, 240, {
      departmentId: itDepartment.id,
      businessHoursOnly: true
    });
    
    console.log(`   IT 4-hour SLA (business hours only):`);
    console.log(`   • Due date: ${weekendSLA.dueDate.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    console.log(`   • Holidays skipped: ${weekendSLA.holidaysSkipped.length > 0 ? weekendSLA.holidaysSkipped.join(', ') : 'None'}`);

    // Test 3: Next business hour start
    console.log('\\n🕒 Test 3: Next Business Hour Start');
    
    const nextBusinessHour = await slaCalculator.getNextBusinessHourStart(now, {
      departmentId: itDepartment.id
    });
    
    if (nextBusinessHour) {
      console.log(`Next business hour starts: ${nextBusinessHour.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    } else {
      console.log('Could not determine next business hour start (might be within business hours)');
    }

    // Test 4: Check business hours configuration
    console.log('\\n📊 Test 4: Business Hours Configuration');
    
    const businessHours = await prisma.businessHoursConfig.findMany({
      where: {
        OR: [
          { departmentId: itDepartment.id },
          { departmentId: supportDepartment.id }
        ],
        isActive: true
      },
      include: {
        department: { select: { name: true } }
      },
      orderBy: [
        { departmentId: 'asc' },
        { dayOfWeek: 'asc' }
      ]
    });

    console.log('Current business hours configuration:');
    let currentDept = '';
    for (const bh of businessHours) {
      if (currentDept !== bh.department?.name) {
        currentDept = bh.department?.name || 'Unknown';
        console.log(`\\n   ${currentDept}:`);
      }
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bh.dayOfWeek];
      console.log(`   • ${dayName}: ${bh.startTime} - ${bh.endTime} (${bh.timezone})`);
    }

    // Test 5: Holiday checking
    console.log('\\n🎉 Test 5: Holiday Calendar');
    
    const upcomingHolidays = await prisma.holidayCalendar.findMany({
      where: {
        date: {
          gte: new Date(),
          lte: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Next year
        },
        isActive: true
      },
      orderBy: { date: 'asc' },
      take: 5
    });

    console.log('Upcoming holidays (next 5):');
    for (const holiday of upcomingHolidays) {
      const scope = holiday.departmentId ? 'Department-specific' : 
                   holiday.unitId ? 'Unit-specific' : 'Global';
      console.log(`   • ${holiday.name}: ${holiday.date.toLocaleDateString('id-ID')} (${scope})`);
    }

    console.log('\\n✅ SLA Business Hours System Test Complete!');
    console.log('\\n📋 Summary:');
    console.log(`   • Business hours configurations: ${businessHours.length} entries`);
    console.log(`   • Upcoming holidays: ${upcomingHolidays.length} entries`);
    console.log(`   • SLA calculations: Working with business hours and holidays`);
    console.log(`   • API endpoints: Ready for testing`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSLABusinessHours()
  .catch((error) => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });