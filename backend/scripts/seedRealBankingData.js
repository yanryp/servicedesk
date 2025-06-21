// scripts/seedRealBankingData.js
const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

const prisma = new PrismaClient();

// Connection to ATM Management System database
const atmDbClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'atm_management_system',
  user: 'yanrypangouw',
  // password: '', // Add if needed
});

async function seedRealBankingData() {
  console.log('🌱 Starting real BSG banking data seeding from ATM Management System...');

  try {
    // Connect to ATM Management System database
    await atmDbClient.connect();
    console.log('🔗 Connected to ATM Management System database');

    // 1. Get branches from ATM Management System
    console.log('🏢 Fetching branches from ATM Management System...');
    
    const branchesResult = await atmDbClient.query(`
      SELECT DISTINCT 
        cabang_code as branch_code,
        cabang_name as branch_name,
        region,
        is_active
      FROM master_cabang 
      WHERE cabang_code IS NOT NULL 
      ORDER BY cabang_code;
    `);

    console.log(`📊 Found ${branchesResult.rows.length} branches in ATM Management System`);

    // Seed branches to ticketing system
    for (const branch of branchesResult.rows) {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: {
            type: 'branch',
            code: branch.branch_code
          }
        },
        update: {
          name: branch.branch_name,
          nameIndonesian: branch.branch_name,
          description: `BSG ${branch.branch_name} - ${branch.region}`,
          metadata: {
            region: branch.region,
            original_active: branch.is_active
          },
          isActive: branch.is_active
        },
        create: {
          type: 'branch',
          code: branch.branch_code,
          name: branch.branch_name,
          nameIndonesian: branch.branch_name,
          description: `BSG ${branch.branch_name} - ${branch.region}`,
          metadata: {
            region: branch.region,
            original_active: branch.is_active
          },
          isActive: branch.is_active,
          sortOrder: parseInt(branch.branch_code.replace(/\D/g, '') || '0')
        }
      });
    }

    console.log(`✅ Seeded ${branchesResult.rows.length} branches to ticketing system`);

    // 2. Get ATM/Terminal locations from ATM Management System
    console.log('🏧 Fetching ATM/Terminal locations from ATM Management System...');
    
    const atmResult = await atmDbClient.query(`
      SELECT DISTINCT 
        terminal_id,
        terminal_name,
        terminal_type,
        cabang_code as branch_code,
        is_active
      FROM master_terminal 
      WHERE terminal_id IS NOT NULL 
      ORDER BY terminal_id;
    `);

    console.log(`📊 Found ${atmResult.rows.length} ATMs in ATM Management System`);

    // Seed ATM/Terminal locations as master data
    for (const terminal of atmResult.rows) {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: {
            type: 'terminal',
            code: terminal.terminal_id
          }
        },
        update: {
          name: terminal.terminal_name,
          nameIndonesian: terminal.terminal_name,
          description: `${terminal.terminal_type} ${terminal.terminal_name}`,
          metadata: {
            terminal_type: terminal.terminal_type,
            branch_code: terminal.branch_code,
            original_active: terminal.is_active
          },
          isActive: terminal.is_active
        },
        create: {
          type: 'terminal',
          code: terminal.terminal_id,
          name: terminal.terminal_name,
          nameIndonesian: terminal.terminal_name,
          description: `${terminal.terminal_type} ${terminal.terminal_name}`,
          metadata: {
            terminal_type: terminal.terminal_type,
            branch_code: terminal.branch_code,
            original_active: terminal.is_active
          },
          isActive: terminal.is_active,
          sortOrder: parseInt(terminal.terminal_id.replace(/\D/g, '') || '0')
        }
      });
    }

    console.log(`✅ Seeded ${atmResult.rows.length} ATM locations to ticketing system`);

    // 3. Get bank codes/names for inter-bank transfers
    console.log('🏦 Fetching bank data from ATM Management System...');
    
    const banksResult = await atmDbClient.query(`
      SELECT DISTINCT 
        bank_code,
        bank_name,
        bank_type,
        is_atm_bersama,
        is_active
      FROM master_bank 
      WHERE bank_code IS NOT NULL 
      ORDER BY bank_name;
    `);

    console.log(`📊 Found ${banksResult.rows.length} banks in ATM Management System`);

    // Seed bank data for inter-bank transfers
    for (const bank of banksResult.rows) {
      await prisma.masterDataEntity.upsert({
        where: { 
          type_code: {
            type: 'bank_code',
            code: bank.bank_code
          }
        },
        update: {
          name: bank.bank_name,
          nameIndonesian: bank.bank_name,
          description: `${bank.bank_type} - ${bank.is_atm_bersama ? 'ATM Bersama' : 'Non ATM Bersama'}`,
          metadata: {
            bank_type: bank.bank_type,
            is_atm_bersama: bank.is_atm_bersama,
            original_active: bank.is_active
          },
          isActive: bank.is_active
        },
        create: {
          type: 'bank_code',
          code: bank.bank_code,
          name: bank.bank_name,
          nameIndonesian: bank.bank_name,
          description: `${bank.bank_type} - ${bank.is_atm_bersama ? 'ATM Bersama' : 'Non ATM Bersama'}`,
          metadata: {
            bank_type: bank.bank_type,
            is_atm_bersama: bank.is_atm_bersama,
            original_active: bank.is_active
          },
          isActive: bank.is_active,
          sortOrder: parseInt(bank.bank_code.replace(/\D/g, '') || '0')
        }
      });
    }

    console.log(`✅ Seeded ${banksResult.rows.length} banks to ticketing system`);

    // 4. Check for any additional useful tables
    console.log('🔍 Checking for additional useful tables...');
    
    const tablesResult = await atmDbClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('📋 Available tables in ATM Management System:');
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

    // 5. Update existing BSG Touch template with real bank data
    console.log('🔄 Updating BSG Touch template with real bank options...');
    
    const bsgTouchTemplate = await prisma.serviceTemplate.findFirst({
      where: { name: 'Klaim BSG Touch - Transfer antar bank' },
      include: { customFieldDefinitions: true }
    });

    if (bsgTouchTemplate) {
      // Update bank destination field to use real bank data
      const bankField = bsgTouchTemplate.customFieldDefinitions.find(
        field => field.fieldName === 'bank_tujuan'
      );

      if (bankField) {
        await prisma.serviceFieldDefinition.update({
          where: { id: bankField.id },
          data: {
            fieldType: 'dropdown',
            options: {
              dataSource: 'master_data',
              entityType: 'bank_code',
              displayFormat: '{name} ({code})'
            },
            validationRules: {
              required: true,
              dataSource: 'master_data',
              entityType: 'bank_code'
            }
          }
        });

        console.log('✅ Updated BSG Touch template bank field with real data');
      }
    }

    console.log('\n🎉 Real banking data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Branches: ${branchesResult.rows.length}`);
    console.log(`  - Terminals/ATMs: ${atmResult.rows.length}`);
    console.log(`  - Banks: ${banksResult.rows.length}`);
    console.log('  - Template Updates: ✅ Completed');
    
  } catch (error) {
    console.error('❌ Error seeding real banking data:', error);
    
    // Check if it's a connection error
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Make sure PostgreSQL is running and the ATM Management System database exists.');
      console.log('   You can check with: psql -U yanrypangouw -d atm_management_system -c "\\dt"');
    }
    
    throw error;
  } finally {
    await atmDbClient.end();
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedRealBankingData()
    .then(() => {
      console.log('\n✅ Real data seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Real data seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedRealBankingData };