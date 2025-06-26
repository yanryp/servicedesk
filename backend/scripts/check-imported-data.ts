#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking imported template data...\n');

  try {
    // Check service catalogs
    const serviceCatalogs = await prisma.serviceCatalog.findMany({
      orderBy: { name: 'asc' },
      take: 10
    });
    
    console.log('📂 Service Catalogs:');
    serviceCatalogs.forEach(sc => {
      console.log(`   - ${sc.name}: ${sc.description}`);
    });

    // Check service items
    const serviceItems = await prisma.serviceItem.findMany({
      where: { name: { contains: 'OLIBS' } },
      take: 5
    });
    
    console.log('\n📁 OLIBS Service Items:');
    serviceItems.forEach(si => {
      console.log(`   - ${si.name}: ${si.description}`);
    });

    // Check service templates
    const serviceTemplates = await prisma.serviceTemplate.findMany({
      where: { name: { contains: 'Perubahan Menu' } },
      include: { customFieldDefinitions: true },
      take: 2
    });
    
    console.log('\n⚡ OLIBS Templates:');
    serviceTemplates.forEach(st => {
      console.log(`   - ${st.name}: ${st.description}`);
      console.log(`     Fields: ${st.customFieldDefinitions.length}`);
    });

    // Count totals
    const totalServiceCatalogs = await prisma.serviceCatalog.count();
    const totalServiceItems = await prisma.serviceItem.count();
    const totalServiceTemplates = await prisma.serviceTemplate.count();
    const totalFields = await prisma.serviceFieldDefinition.count();

    console.log('\n📊 Total Counts:');
    console.log(`   Service Catalogs: ${totalServiceCatalogs}`);
    console.log(`   Service Items: ${totalServiceItems}`);
    console.log(`   Service Templates: ${totalServiceTemplates}`);
    console.log(`   Dynamic Fields: ${totalFields}`);

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();