const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('=== CHECKING ALL TABLES IN DATABASE ===');
    
    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log('\nTables in database:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });

    // Check if there's a separate branches table
    const branchTables = tables.filter(t => t.table_name.toLowerCase().includes('branch'));
    if (branchTables.length > 0) {
      console.log('\n=== BRANCH-RELATED TABLES ===');
      branchTables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    }

    // Check units table specifically
    const unitsCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM units;`;
    console.log(`\nTotal records in units table: ${unitsCount[0].count}`);

    // Check if there are records with different unit types
    const unitTypes = await prisma.$queryRaw`
      SELECT unit_type, COUNT(*) as count 
      FROM units 
      GROUP BY unit_type 
      ORDER BY unit_type;
    `;

    console.log('\nUnit types and counts:');
    unitTypes.forEach(type => {
      console.log(`- ${type.unit_type}: ${type.count}`);
    });

    // Check for potential branches table
    try {
      const branchesCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM branches;`;
      console.log(`\nTotal records in branches table: ${branchesCount[0].count}`);
    } catch (error) {
      console.log('\nNo branches table found.');
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();