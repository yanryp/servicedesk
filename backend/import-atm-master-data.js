const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

const prisma = new PrismaClient();

// External ATM database connection
const atmClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'atm_management_system',
  user: 'yanrypangouw',
  password: '' // No password set
});

async function importATMMasterData() {
  console.log('🏦 Starting ATM Master Data Import Process');
  console.log('=========================================');
  
  try {
    // Connect to ATM database
    await atmClient.connect();
    console.log('✅ Connected to ATM management database');
    
    // Import Banks
    console.log('\n📊 Importing Bank Master Data...');
    const banksResult = await atmClient.query('SELECT * FROM master_bank ORDER BY bank_code');
    const banks = banksResult.rows;
    
    let bankCount = 0;
    for (const bank of banks) {
      // Check if bank already exists
      const existingBank = await prisma.bSGMasterData.findFirst({
        where: {
          dataType: 'bank',
          code: bank.bank_code
        }
      });
      
      if (existingBank) {
        // Update existing bank
        await prisma.bSGMasterData.update({
          where: { id: existingBank.id },
          data: {
            name: bank.bank_name,
            displayName: bank.bank_name,
            isActive: bank.is_active,
            metadata: {
              bankType: bank.bank_type,
              isAtmBersama: bank.is_atm_bersama,
              logoUrl: bank.logo_url,
              website: bank.website
            }
          }
        });
      } else {
        // Create new bank
        await prisma.bSGMasterData.create({
          data: {
            dataType: 'bank',
            code: bank.bank_code,
            name: bank.bank_name,
            displayName: bank.bank_name,
            isActive: bank.is_active,
            sortOrder: parseInt(bank.bank_code) || 0,
            metadata: {
              bankType: bank.bank_type,
              isAtmBersama: bank.is_atm_bersama,
              logoUrl: bank.logo_url,
              website: bank.website
            }
          }
        });
      }
      bankCount++;
    }
    console.log(`✅ Imported ${bankCount} banks`);
    
    // Import Branches (Cabang)
    console.log('\n🏢 Importing Branch Master Data...');
    const branchesResult = await atmClient.query('SELECT * FROM master_cabang ORDER BY cabang_code');
    const branches = branchesResult.rows;
    
    let branchCount = 0;
    for (const branch of branches) {
      // Check if branch already exists
      const existingBranch = await prisma.bSGMasterData.findFirst({
        where: {
          dataType: 'cabang',
          code: branch.cabang_code
        }
      });
      
      if (existingBranch) {
        // Update existing branch
        await prisma.bSGMasterData.update({
          where: { id: existingBranch.id },
          data: {
            name: branch.cabang_name,
            displayName: branch.cabang_name,
            isActive: branch.is_active,
            metadata: {
              region: branch.region
            }
          }
        });
      } else {
        // Create new branch
        await prisma.bSGMasterData.create({
          data: {
            dataType: 'cabang',
            code: branch.cabang_code,
            name: branch.cabang_name,
            displayName: branch.cabang_name,
            isActive: branch.is_active,
            sortOrder: parseInt(branch.cabang_code) || 0,
            metadata: {
              region: branch.region
            }
          }
        });
      }
      branchCount++;
    }
    console.log(`✅ Imported ${branchCount} branches`);
    
    // Import Terminals
    console.log('\n🏧 Importing Terminal Master Data...');
    const terminalsResult = await atmClient.query('SELECT * FROM master_terminal ORDER BY terminal_id');
    const terminals = terminalsResult.rows;
    
    let terminalCount = 0;
    for (const terminal of terminals) {
      // Check if terminal already exists
      const existingTerminal = await prisma.bSGMasterData.findFirst({
        where: {
          dataType: 'terminal',
          code: terminal.terminal_id
        }
      });
      
      if (existingTerminal) {
        // Update existing terminal
        await prisma.bSGMasterData.update({
          where: { id: existingTerminal.id },
          data: {
            name: terminal.terminal_name || `Terminal ${terminal.terminal_id}`,
            displayName: terminal.terminal_name || `Terminal ${terminal.terminal_id}`,
            isActive: terminal.is_active,
            metadata: {
              terminalType: terminal.terminal_type,
              cabangCode: terminal.cabang_code
            }
          }
        });
      } else {
        // Create new terminal
        await prisma.bSGMasterData.create({
          data: {
            dataType: 'terminal',
            code: terminal.terminal_id,
            name: terminal.terminal_name || `Terminal ${terminal.terminal_id}`,
            displayName: terminal.terminal_name || `Terminal ${terminal.terminal_id}`,
            isActive: terminal.is_active,
            sortOrder: parseInt(terminal.terminal_id) || 0,
            metadata: {
              terminalType: terminal.terminal_type,
              cabangCode: terminal.cabang_code
            }
          }
        });
      }
      terminalCount++;
    }
    console.log(`✅ Imported ${terminalCount} terminals`);
    
    // Summary
    console.log('\n📈 Import Summary:');
    console.log('==================');
    console.log(`Banks: ${bankCount} imported`);
    console.log(`Branches: ${branchCount} imported`);
    console.log(`Terminals: ${terminalCount} imported`);
    console.log(`Total: ${bankCount + branchCount + terminalCount} master data entries`);
    
    // Verify import
    console.log('\n🔍 Verifying Import...');
    const totalBSGData = await prisma.bSGMasterData.count();
    const bankData = await prisma.bSGMasterData.count({ where: { dataType: 'bank' } });
    const cabangData = await prisma.bSGMasterData.count({ where: { dataType: 'cabang' } });
    const terminalData = await prisma.bSGMasterData.count({ where: { dataType: 'terminal' } });
    
    console.log(`Total BSG Master Data Records: ${totalBSGData}`);
    console.log(`Banks in BSG System: ${bankData}`);
    console.log(`Branches in BSG System: ${cabangData}`);
    console.log(`Terminals in BSG System: ${terminalData}`);
    
    console.log('\n✅ ATM Master Data Import Completed Successfully!');
    
  } catch (error) {
    console.error('❌ Error importing ATM master data:', error);
    throw error;
  } finally {
    await atmClient.end();
    await prisma.$disconnect();
  }
}

// Run the import
importATMMasterData()
  .then(() => {
    console.log('\n🎉 ATM Master Data Import Process Complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });