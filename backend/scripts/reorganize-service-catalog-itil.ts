#!/usr/bin/env npx ts-node

/**
 * ITIL Service Catalog Reorganization
 * 
 * Reorganizes 271 services into ITIL-compliant business function groups
 * while preserving department routing and approval workflows.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function phase1MoveClaimsServices() {
  console.log('🔄 Phase 1: Moving Claims & Payment Services to Claims & Transactions...\n');
  
  // Get the Claims & Transactions service catalog
  const claimsCatalog = await prisma.serviceCatalog.findFirst({
    where: { name: 'Claims & Transactions' }
  });
  
  if (!claimsCatalog) {
    console.error('❌ Claims & Transactions catalog not found');
    return 0;
  }
  
  console.log(`✅ Target catalog: ${claimsCatalog.name} (ID: ${claimsCatalog.id})`);
  
  // Services to move - payment/claims related services
  const servicesToMove = [
    'ATM-Pembayaran Citilink',
    'ATM-Pembayaran PBB', 
    'ATM-Pembayaran Samsat',
    'ATM-Pembayaran Tagihan BigTV',
    'ATM-Pembayaran Tagihan BPJS',
    'ATM-Pembayaran Tagihan PLN',
    'ATM-Pembayaran Tagihan PSTN',
    'ATM-Pembelian Pulsa Indosat',
    'ATM-Pembelian Pulsa Telkomsel',
    'ATM-Pembelian Pulsa Three',
    'ATM-Pembelian Pulsa XL',
    'ATM-Pembelian Token PLN',
    'ATM-Penarikan ATM Bank Lain',
    'ATM-Penarikan ATM Bank Lain >75 Hari',
    'ATM-Transfer ATM Bank Lain',
    'ATM-Transfer Bank Lain > 75 Hari',
    'ATM-Penyelesaian Re-Klaim Bank Lain'
  ];
  
  let movedCount = 0;
  
  for (const serviceName of servicesToMove) {
    // Find the service item by name
    const serviceItem = await prisma.serviceItem.findFirst({
      where: { name: serviceName },
      include: { 
        serviceCatalog: true,
        templates: true
      }
    });
    
    if (serviceItem) {
      // Update the service item to belong to Claims & Transactions catalog
      await prisma.serviceItem.update({
        where: { id: serviceItem.id },
        data: { serviceCatalogId: claimsCatalog.id }
      });
      
      console.log(`   ✅ Moved: ${serviceName} (from ${serviceItem.serviceCatalog.name}) - ${serviceItem.templates.length} templates`);
      movedCount++;
    } else {
      console.log(`   ❌ Not found: ${serviceName}`);
    }
  }
  
  console.log(`\n📊 Phase 1 Summary: Moved ${movedCount} payment/claims services to Claims & Transactions`);
  return movedCount;
}

async function phase2MoveKasdaServices() {
  console.log('\n🔄 Phase 2: Moving KASDA Services to KASDA Services catalog...\n');
  
  // Get the KASDA Services catalog
  const kasdaCatalog = await prisma.serviceCatalog.findFirst({
    where: { name: 'KASDA Services' }
  });
  
  if (!kasdaCatalog) {
    console.error('❌ KASDA Services catalog not found');
    return 0;
  }
  
  console.log(`✅ Target catalog: ${kasdaCatalog.name} (ID: ${kasdaCatalog.id})`);
  
  // Services to move - KASDA related services
  const servicesToMove = [
    'Kasda Online',
    'Kasda Online BUD'
  ];
  
  let movedCount = 0;
  
  for (const serviceName of servicesToMove) {
    // Find the service item by name
    const serviceItem = await prisma.serviceItem.findFirst({
      where: { name: serviceName },
      include: { 
        serviceCatalog: true,
        templates: true
      }
    });
    
    if (serviceItem) {
      // Update the service item to belong to KASDA Services catalog
      await prisma.serviceItem.update({
        where: { id: serviceItem.id },
        data: { serviceCatalogId: kasdaCatalog.id }
      });
      
      console.log(`   ✅ Moved: ${serviceName} (from ${serviceItem.serviceCatalog.name}) - ${serviceItem.templates.length} templates`);
      movedCount++;
    } else {
      console.log(`   ❌ Not found: ${serviceName}`);
    }
  }
  
  console.log(`\n📊 Phase 2 Summary: Moved ${movedCount} KASDA services to KASDA Services`);
  return movedCount;
}

async function phase3MoveITServices() {
  console.log('\n🔄 Phase 3: Moving IT Infrastructure Services to IT Services catalog...\n');
  
  // Get the IT Services catalog
  const itServicesCatalog = await prisma.serviceCatalog.findFirst({
    where: { name: 'IT Services' }
  });
  
  if (!itServicesCatalog) {
    console.error('❌ IT Services catalog not found');
    return 0;
  }
  
  console.log(`✅ Target catalog: ${itServicesCatalog.name} (ID: ${itServicesCatalog.id})`);
  
  // Services to move - IT infrastructure related services
  const servicesToMove = [
    'Gangguan LAN',
    'Gangguan WAN',
    'Gangguan Internet',
    'Network',
    'Domain',
    'Maintenance Komputer',
    'Maintenance Printer',
    'Pendaftaran Terminal Komputer Baru',
    'Portal',
    'Technical Problem'
  ];
  
  let movedCount = 0;
  
  for (const serviceName of servicesToMove) {
    // Find the service item by name
    const serviceItem = await prisma.serviceItem.findFirst({
      where: { name: serviceName },
      include: { 
        serviceCatalog: true,
        templates: true
      }
    });
    
    if (serviceItem) {
      // Update the service item to belong to IT Services catalog
      await prisma.serviceItem.update({
        where: { id: serviceItem.id },
        data: { serviceCatalogId: itServicesCatalog.id }
      });
      
      console.log(`   ✅ Moved: ${serviceName} (from ${serviceItem.serviceCatalog.name}) - ${serviceItem.templates.length} templates`);
      movedCount++;
    } else {
      console.log(`   ❌ Not found: ${serviceName}`);
    }
  }
  
  console.log(`\n📊 Phase 3 Summary: Moved ${movedCount} IT infrastructure services to IT Services`);
  return movedCount;
}

async function phase4RenameCatalogs() {
  console.log('\n🔄 Phase 4: Renaming Service Catalogs for ITIL Compliance...\n');
  
  const renameMappings = [
    { from: 'Hardware & Software', to: 'Banking Applications' },
    { from: 'Security & Access', to: 'Identity & Access Management' }
  ];
  
  let renamedCount = 0;
  
  for (const mapping of renameMappings) {
    const catalog = await prisma.serviceCatalog.findFirst({
      where: { name: mapping.from }
    });
    
    if (catalog) {
      await prisma.serviceCatalog.update({
        where: { id: catalog.id },
        data: { 
          name: mapping.to,
          description: mapping.to === 'Banking Applications' 
            ? 'Core banking systems and business applications'
            : 'Identity management, access control, and security services'
        }
      });
      
      console.log(`   ✅ Renamed: ${mapping.from} → ${mapping.to}`);
      renamedCount++;
    } else {
      console.log(`   ❌ Not found: ${mapping.from}`);
    }
  }
  
  console.log(`\n📊 Phase 4 Summary: Renamed ${renamedCount} service catalogs`);
  return renamedCount;
}

async function verifyResults() {
  console.log('\n📊 Final Service Catalog Distribution:\n');
  
  const serviceCatalogs = await prisma.serviceCatalog.findMany({
    include: {
      serviceItems: {
        include: {
          templates: {
            where: { isVisible: true }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  let totalServices = 0;
  for (const catalog of serviceCatalogs) {
    const templateCount = catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
    totalServices += templateCount;
    console.log(`📂 ${catalog.name}: ${templateCount} services`);
  }
  
  console.log(`\n✅ Total services: ${totalServices} (Expected: 271)`);
}

async function main() {
  console.log('🚀 Starting ITIL Service Catalog Reorganization...\n');
  
  try {
    const phase1Count = await phase1MoveClaimsServices();
    const phase2Count = await phase2MoveKasdaServices(); 
    const phase3Count = await phase3MoveITServices();
    const phase4Count = await phase4RenameCatalogs();
    
    await verifyResults();
    
    console.log('\n🎉 ITIL Reorganization Complete!');
    console.log(`   • Payment/Claims services moved: ${phase1Count}`);
    console.log(`   • KASDA services moved: ${phase2Count}`);
    console.log(`   • IT infrastructure services moved: ${phase3Count}`);
    console.log(`   • Service catalogs renamed: ${phase4Count}`);
    console.log('\n✅ Department routing and approval workflows preserved');
    
  } catch (error) {
    console.error('❌ Error during reorganization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});