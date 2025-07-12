#!/usr/bin/env node

/**
 * Export Database Data
 * 
 * Creates exportable data files for the dynamic fields and master data
 * that were created during development and testing.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function exportDatabaseData() {
  try {
    console.log('📊 Exporting database data for version control...\n');

    const exportData = {
      timestamp: new Date().toISOString(),
      description: 'Database data export for dynamic fields and master data',
      version: '1.0.0'
    };

    // 1. Export Service Field Definitions
    console.log('📋 Exporting service field definitions...');
    const serviceFieldDefinitions = await prisma.serviceFieldDefinition.findMany({
      include: {
        service_items: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { service_item_id: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    exportData.serviceFieldDefinitions = serviceFieldDefinitions.map(field => ({
      serviceItemName: field.service_items?.name,
      fieldName: field.fieldName,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      placeholder: field.placeholder,
      options: field.options,
      sortOrder: field.sortOrder,
      defaultValue: field.defaultValue,
      validationRules: field.validationRules
    }));

    console.log(`✅ Exported ${serviceFieldDefinitions.length} service field definitions`);

    // 2. Export BSG Master Data
    console.log('🗂️ Exporting BSG master data...');
    const bsgMasterData = await prisma.bSGMasterData.findMany({
      orderBy: [
        { dataType: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    exportData.bsgMasterData = bsgMasterData.map(data => ({
      dataType: data.dataType,
      code: data.code,
      name: data.name,
      displayName: data.displayName,
      metadata: data.metadata,
      sortOrder: data.sortOrder,
      isActive: data.isActive
    }));

    console.log(`✅ Exported ${bsgMasterData.length} BSG master data entries`);

    // 3. Export Service Items with field counts
    console.log('🔧 Exporting service items summary...');
    const serviceItems = await prisma.serviceItem.findMany({
      include: {
        serviceCatalog: {
          select: {
            name: true
          }
        },
        service_field_definitions: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    exportData.serviceItemsSummary = serviceItems.map(item => ({
      name: item.name,
      categoryName: item.serviceCatalog.name,
      fieldCount: item.service_field_definitions.length,
      hasFields: item.service_field_definitions.length > 0
    }));

    console.log(`✅ Exported ${serviceItems.length} service items summary`);

    // 4. Generate statistics
    const stats = {
      totalServices: serviceItems.length,
      servicesWithFields: serviceItems.filter(s => s.service_field_definitions.length > 0).length,
      servicesWithoutFields: serviceItems.filter(s => s.service_field_definitions.length === 0).length,
      totalFieldDefinitions: serviceFieldDefinitions.length,
      totalMasterDataEntries: bsgMasterData.length,
      masterDataByType: {}
    };

    // Group master data by type
    bsgMasterData.forEach(data => {
      if (!stats.masterDataByType[data.dataType]) {
        stats.masterDataByType[data.dataType] = 0;
      }
      stats.masterDataByType[data.dataType]++;
    });

    exportData.statistics = stats;

    // 5. Write to JSON file
    const exportPath = path.join(__dirname, 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log(`\n💾 Database export saved to: ${exportPath}`);

    // 6. Create SQL dump for critical data
    console.log('\n📄 Creating SQL dump for critical data...');
    
    let sqlDump = `-- BSG Ticketing System Database Export
-- Generated: ${new Date().toISOString()}
-- Description: Dynamic fields and master data for service catalog

-- BSG Master Data
DELETE FROM bsg_master_data WHERE data_type IN ('branch', 'olibs_menu', 'atm', 'generic');

`;

    bsgMasterData.forEach(data => {
      const metadata = data.metadata ? `'${JSON.stringify(data.metadata).replace(/'/g, "''")}'` : 'NULL';
      const code = data.code ? `'${data.code.replace(/'/g, "''")}'` : 'NULL';
      const displayName = data.displayName ? `'${data.displayName.replace(/'/g, "''")}'` : 'NULL';
      
      sqlDump += `INSERT INTO bsg_master_data (data_type, code, name, display_name, metadata, sort_order, is_active) VALUES ('${data.dataType}', ${code}, '${data.name.replace(/'/g, "''")}', ${displayName}, ${metadata}, ${data.sortOrder}, ${data.isActive});\n`;
    });

    sqlDump += `\n-- Service Field Definitions (sample for key services)\n`;
    
    // Add field definitions for key services
    const keyServices = serviceFieldDefinitions.filter(field => 
      field.service_items?.name.includes('BSGTouch') ||
      field.service_items?.name.includes('OLIBs') ||
      field.service_items?.name.includes('ATM') ||
      field.service_items?.name.includes('QRIS')
    );

    sqlDump += `-- Note: Full field definitions available in database-export.json\n`;
    sqlDump += `-- Total field definitions: ${serviceFieldDefinitions.length}\n`;
    sqlDump += `-- Key services with fields: ${keyServices.length}\n`;

    const sqlPath = path.join(__dirname, 'database-export.sql');
    fs.writeFileSync(sqlPath, sqlDump);

    console.log(`💾 SQL dump saved to: ${sqlPath}`);

    // 7. Summary report
    console.log('\n📊 Export Summary:');
    console.log(`   - Total services: ${stats.totalServices}`);
    console.log(`   - Services with fields: ${stats.servicesWithFields}`);
    console.log(`   - Services without fields: ${stats.servicesWithoutFields}`);
    console.log(`   - Total field definitions: ${stats.totalFieldDefinitions}`);
    console.log(`   - Master data entries: ${stats.totalMasterDataEntries}`);
    
    console.log('\n🗂️ Master data by type:');
    Object.entries(stats.masterDataByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} entries`);
    });

    console.log('\n✅ Database export completed successfully!');
    console.log('\nFiles created:');
    console.log(`   - ${exportPath}`);
    console.log(`   - ${sqlPath}`);

  } catch (error) {
    console.error('❌ Error exporting database data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportDatabaseData();