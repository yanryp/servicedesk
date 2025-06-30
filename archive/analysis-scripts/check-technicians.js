const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTechnicians() {
  try {
    console.log('🔧 Available Technicians:');
    
    const technicians = await prisma.user.findMany({
      where: {
        role: 'technician',
        isAvailable: true
      },
      include: {
        department: true,
        unit: true
      }
    });
    
    console.log(`Found ${technicians.length} available technicians:`);
    
    const byDepartment = {};
    technicians.forEach(tech => {
      const dept = tech.department?.name || 'No Department';
      if (!byDepartment[dept]) byDepartment[dept] = [];
      byDepartment[dept].push(tech);
    });
    
    Object.entries(byDepartment).forEach(([dept, techs]) => {
      console.log(`\n📋 ${dept} (${techs.length} technicians):`);
      techs.forEach(tech => {
        console.log(`   - ${tech.username} (${tech.email})`);
        console.log(`     Unit: ${tech.unit?.name || 'No unit'}`);
        console.log(`     Skills: ${tech.primarySkill || 'None'}`);
        console.log(`     Workload: ${tech.currentWorkload}/${tech.workloadCapacity}`);
        console.log(`     isKasdaUser: ${tech.isKasdaUser}`);
      });
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkTechnicians();