const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMasterData() {
  console.log('BSG Master Data Analysis:');
  console.log('========================');
  
  const bsgData = await prisma.bSGMasterData.findMany({
    select: {
      id: true,
      dataType: true,
      code: true,
      name: true,
      displayName: true
    },
    orderBy: [
      { dataType: 'asc' },
      { sortOrder: 'asc' }
    ]
  });
  
  console.log('Total BSG Master Data Records:', bsgData.length);
  
  const dataByType = {};
  bsgData.forEach(item => {
    if (!dataByType[item.dataType]) {
      dataByType[item.dataType] = [];
    }
    dataByType[item.dataType].push(item);
  });
  
  Object.keys(dataByType).forEach(type => {
    console.log('');
    console.log(type.toUpperCase() + ':');
    dataByType[type].forEach(item => {
      console.log('  - ' + (item.displayName || item.name));
    });
  });
  
  console.log('');
  console.log('Units Data:');
  console.log('===========');
  const unitsCount = await prisma.unit.count();
  console.log('Total Units:', unitsCount);
  
  const unitTypes = await prisma.unit.findMany({
    select: { unitType: true },
    distinct: ['unitType']
  });
  
  for (const type of unitTypes) {
    const count = await prisma.unit.count({
      where: { unitType: type.unitType }
    });
    console.log(type.unitType + ':', count);
  }
  
  await prisma.$disconnect();
}

checkMasterData().catch(console.error);