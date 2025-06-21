// scripts/exploreBankingDB.js
const { Client } = require('pg');

// Connection to ATM Management System database
const atmDbClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'atm_management_system',
  user: 'yanrypangouw',
  // password: '', // Add if needed
});

async function exploreBankingDB() {
  console.log('🔍 Exploring ATM Management System database structure...');

  try {
    // Connect to ATM Management System database
    await atmDbClient.connect();
    console.log('🔗 Connected to ATM Management System database');

    // 1. List all tables
    console.log('\n📋 Available tables:');
    const tablesResult = await atmDbClient.query(`
      SELECT table_name, table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`);
    });

    // 2. For each table, show structure and sample data
    for (const table of tablesResult.rows) {
      if (table.table_type === 'BASE TABLE') {
        console.log(`\n🔍 Table: ${table.table_name}`);
        
        // Get column information
        const columnsResult = await atmDbClient.query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = $1
          ORDER BY ordinal_position;
        `, [table.table_name]);

        console.log('  📊 Columns:');
        columnsResult.rows.forEach(col => {
          console.log(`    - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });

        // Get row count
        try {
          const countResult = await atmDbClient.query(`SELECT COUNT(*) as count FROM ${table.table_name}`);
          console.log(`  📈 Total rows: ${countResult.rows[0].count}`);

          // Show sample data if table has data
          if (parseInt(countResult.rows[0].count) > 0) {
            const sampleResult = await atmDbClient.query(`SELECT * FROM ${table.table_name} LIMIT 3`);
            console.log('  🔬 Sample data:');
            sampleResult.rows.forEach((row, index) => {
              console.log(`    Row ${index + 1}:`, JSON.stringify(row, null, 6));
            });
          }
        } catch (error) {
          console.log(`  ⚠️ Could not query table: ${error.message}`);
        }
      }
    }

    console.log('\n🎉 Database exploration completed!');
    
  } catch (error) {
    console.error('❌ Error exploring database:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure PostgreSQL is running and the ATM Management System database exists.');
      console.log('   You can check with: psql -U yanrypangouw -d atm_management_system -c "\\dt"');
    }
    
    throw error;
  } finally {
    await atmDbClient.end();
  }
}

// Run the exploration function
if (require.main === module) {
  exploreBankingDB()
    .then(() => {
      console.log('\n✅ Exploration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Exploration failed:', error);
      process.exit(1);
    });
}

module.exports = { exploreBankingDB };