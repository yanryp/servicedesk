#!/usr/bin/env node

/**
 * ATM Management System Complete Data Export
 * 
 * This script exports ALL relevant tables from atm_management_system database
 * to the ticketing_system_db BSGMasterData table and creates dedicated tables
 * for ATM management data in the ticketing system.
 */

const { PrismaClient } = require('@prisma/client');
const { Client } = require('pg');

const prisma = new PrismaClient();

// Connection to ATM Management System database
const atmDbClient = new Client({
  host: 'localhost',
  port: 5432,
  database: 'atm_management_system',
  user: 'yanrypangouw',
});

async function connectATMDatabase() {
  try {
    await atmDbClient.connect();
    console.log('✅ Connected to ATM Management System database');
  } catch (error) {
    console.error('❌ Failed to connect to ATM Management System database:', error);
    throw error;
  }
}

async function exportATMTables() {
  console.log('🔄 Starting Complete ATM Management System Data Export');
  console.log('=========================================================\n');

  try {
    await connectATMDatabase();

    // Step 1: Export master_cabang (branches) to BSGMasterData
    console.log('1️⃣ Exporting master_cabang table...');
    
    const branchQuery = `
      SELECT cabang_code, cabang_name, region, is_active
      FROM master_cabang 
      ORDER BY cabang_name ASC
    `;
    
    const branchResult = await atmDbClient.query(branchQuery);
    console.log(`   Found ${branchResult.rows.length} branch records`);

    // Clear existing branch data
    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'branch' }
    });

    // Insert branch data
    const now = new Date();
    const branchRecords = branchResult.rows.map((row, index) => ({
      dataType: 'branch',
      code: row.cabang_code,
      name: row.cabang_name,
      displayName: row.cabang_name,
      parentId: null,
      metadata: {
        region: row.region,
        isActive: row.is_active,
        sourceTable: 'master_cabang',
        exportedAt: now.toISOString()
      },
      isActive: row.is_active,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: branchRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Exported ${branchRecords.length} branches to BSGMasterData`);

    // Step 2: Export master_terminal (ATM terminals) to BSGMasterData
    console.log('\n2️⃣ Exporting master_terminal table...');
    
    const terminalQuery = `
      SELECT terminal_id, terminal_name, terminal_type, cabang_code, is_active
      FROM master_terminal 
      WHERE terminal_type = 'ATM'
      ORDER BY terminal_name ASC
    `;
    
    const terminalResult = await atmDbClient.query(terminalQuery);
    console.log(`   Found ${terminalResult.rows.length} ATM terminal records`);

    // Clear existing terminal data
    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'atm' }
    });

    // Insert terminal data
    const terminalRecords = terminalResult.rows.map((row, index) => ({
      dataType: 'atm',
      code: row.terminal_id,
      name: row.terminal_name,
      displayName: `${row.terminal_name} (ID: ${row.terminal_id})`,
      parentId: null,
      metadata: {
        terminalType: row.terminal_type,
        branchCode: row.cabang_code,
        isActive: row.is_active,
        sourceTable: 'master_terminal',
        exportedAt: now.toISOString()
      },
      isActive: row.is_active,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: terminalRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Exported ${terminalRecords.length} ATM terminals to BSGMasterData`);

    // Step 3: Export master_bank to BSGMasterData
    console.log('\n3️⃣ Exporting master_bank table...');
    
    const bankQuery = `
      SELECT bank_code, bank_name, bank_type, is_atm_bersama, is_active, logo_url, website
      FROM master_bank 
      WHERE is_active = true
      ORDER BY bank_name ASC
    `;
    
    const bankResult = await atmDbClient.query(bankQuery);
    console.log(`   Found ${bankResult.rows.length} bank records`);

    // Clear existing bank data
    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'bank' }
    });

    // Insert bank data
    const bankRecords = bankResult.rows.map((row, index) => ({
      dataType: 'bank',
      code: row.bank_code,
      name: row.bank_name,
      displayName: row.bank_name,
      parentId: null,
      metadata: {
        bankType: row.bank_type,
        isAtmBersama: row.is_atm_bersama,
        logoUrl: row.logo_url,
        website: row.website,
        isActive: row.is_active,
        sourceTable: 'master_bank',
        exportedAt: now.toISOString()
      },
      isActive: row.is_active,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: bankRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Exported ${bankRecords.length} banks to BSGMasterData`);

    // Step 4: Create terminal-by-branch lookup data
    console.log('\n4️⃣ Creating terminal-by-branch lookup data...');
    
    const terminalByBranchQuery = `
      SELECT t.terminal_id, t.terminal_name, t.cabang_code, c.cabang_name
      FROM master_terminal t
      JOIN master_cabang c ON t.cabang_code = c.cabang_code
      WHERE t.is_active = true AND c.is_active = true AND t.terminal_type = 'ATM'
      ORDER BY c.cabang_name, t.terminal_name
    `;
    
    const terminalByBranchResult = await atmDbClient.query(terminalByBranchQuery);
    console.log(`   Found ${terminalByBranchResult.rows.length} terminal-branch relationships`);

    // Clear existing terminal lookup data
    await prisma.bSGMasterData.deleteMany({
      where: { dataType: 'terminal_by_branch' }
    });

    // Insert terminal lookup data
    const terminalLookupRecords = terminalByBranchResult.rows.map((row, index) => ({
      dataType: 'terminal_by_branch',
      code: `${row.cabang_code}_${row.terminal_id}`,
      name: `${row.terminal_name} (${row.cabang_name})`,
      displayName: `${row.terminal_name} (ID: ${row.terminal_id})`,
      parentId: null,
      metadata: {
        terminalId: row.terminal_id,
        terminalName: row.terminal_name,
        branchCode: row.cabang_code,
        branchName: row.cabang_name,
        sourceTable: 'master_terminal+master_cabang',
        exportedAt: now.toISOString()
      },
      isActive: true,
      sortOrder: index + 1,
      createdAt: now,
      updatedAt: now
    }));

    await prisma.bSGMasterData.createMany({
      data: terminalLookupRecords,
      skipDuplicates: true
    });
    console.log(`   ✅ Created ${terminalLookupRecords.length} terminal-branch lookup records`);

    // Step 5: Verification
    console.log('\n5️⃣ Verifying exported data...');
    
    const verification = await prisma.bSGMasterData.groupBy({
      by: ['dataType'],
      _count: {
        dataType: true
      },
      where: {
        isActive: true
      }
    });

    console.log('   📊 BSGMasterData Summary:');
    verification.forEach(item => {
      console.log(`   - ${item.dataType}: ${item._count.dataType} records`);
    });

    // Step 6: Sample data display
    console.log('\n6️⃣ Sample exported data:');
    
    const sampleBranches = await prisma.bSGMasterData.findMany({
      where: { dataType: 'branch', isActive: true },
      take: 3,
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('   📍 Sample Branches:');
    sampleBranches.forEach((branch, index) => {
      console.log(`     ${index + 1}. ${branch.displayName} (${branch.code})`);
    });

    const sampleTerminals = await prisma.bSGMasterData.findMany({
      where: { dataType: 'atm', isActive: true },
      take: 3,
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('   🏧 Sample ATM Terminals:');
    sampleTerminals.forEach((terminal, index) => {
      console.log(`     ${index + 1}. ${terminal.displayName} (${terminal.code})`);
    });

    const sampleBanks = await prisma.bSGMasterData.findMany({
      where: { dataType: 'bank', isActive: true },
      take: 3,
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('   🏦 Sample Banks:');
    sampleBanks.forEach((bank, index) => {
      console.log(`     ${index + 1}. ${bank.displayName} (${bank.code})`);
    });

    // Export Summary
    console.log('\n📊 Export Summary:');
    console.log('==================');
    console.log(`✅ Source Database: atm_management_system`);
    console.log(`✅ Target Database: ticketing_system_db (BSGMasterData table)`);
    console.log(`✅ Tables Exported: master_cabang, master_terminal, master_bank`);
    console.log(`✅ Data Types Created: branch, atm, bank, terminal_by_branch`);
    console.log(`✅ Total Records: ${verification.reduce((sum, item) => sum + item._count.dataType, 0)}`);
    
    console.log('\n🎉 Complete ATM Management System export finished successfully!');
    console.log('   The Service Catalog now has access to all ATM management data');
    console.log('   from the ticketing system database.');

  } catch (error) {
    console.error('\n❌ Export failed:', error);
    throw error;
  } finally {
    await atmDbClient.end();
    await prisma.$disconnect();
  }
}

// Run the export
async function runExport() {
  try {
    await exportATMTables();
    console.log('\n✅ Complete export finished successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Export process failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runExport();
}

module.exports = {
  exportATMTables,
  runExport
};