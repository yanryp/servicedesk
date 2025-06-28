#!/usr/bin/env node

/**
 * Comprehensive Service Catalog State Analysis
 * 
 * This script analyzes the current state of the service catalog structure
 * to understand what services exist, their organization, and compare against
 * the original CSV templates to identify any missing services or misorganization.
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function analyzeServiceCatalogState() {
  console.log('🔍 Analyzing Service Catalog State...\n');

  try {
    // 1. Check Service Catalogs
    console.log('📂 Service Catalogs:');
    const serviceCatalogs = await prisma.serviceCatalog.findMany({
      include: {
        serviceItems: {
          include: {
            templates: {
              where: { isVisible: true }
            }
          }
        },
        department: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (serviceCatalogs.length === 0) {
      console.log('  ❌ No service catalogs found');
      return;
    }

    let totalServices = 0;
    let totalTemplates = 0;
    
    for (const catalog of serviceCatalogs) {
      const templateCount = catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
      totalServices += catalog.serviceItems.length;
      totalTemplates += templateCount;
      
      console.log(`  📁 ${catalog.name}`);
      console.log(`     Department: ${catalog.department.name}`);
      console.log(`     Service Items: ${catalog.serviceItems.length}`);
      console.log(`     Templates: ${templateCount}`);
      console.log(`     Description: ${catalog.description || 'No description'}`);
      console.log('');
    }

    console.log(`📊 SUMMARY: ${serviceCatalogs.length} catalogs, ${totalServices} service items, ${totalTemplates} templates\n`);

    // 2. Detailed Service Items Analysis
    console.log('📋 Service Items by Category:');
    for (const catalog of serviceCatalogs) {
      if (catalog.serviceItems.length > 0) {
        console.log(`\n  📁 ${catalog.name}:`);
        for (const item of catalog.serviceItems) {
          console.log(`    - ${item.name} (${item.templates.length} templates)`);
        }
      }
    }

    // 3. Identify Service Types/Patterns
    console.log('\n🔍 Service Name Pattern Analysis:');
    const allServiceItems = serviceCatalogs.flatMap(cat => cat.serviceItems);
    
    const patterns = {
      'User Management': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('user') || 
        item.name.toLowerCase().includes('password') || 
        item.name.toLowerCase().includes('pendaftaran') ||
        item.name.toLowerCase().includes('mutasi')
      ),
      'Payment Services': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('pembayaran') ||
        item.name.toLowerCase().includes('payment') ||
        item.name.toLowerCase().includes('tagihan')
      ),
      'Purchase Services': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('pembelian') ||
        item.name.toLowerCase().includes('pulsa') ||
        item.name.toLowerCase().includes('token')
      ),
      'Transfer/Claims': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('transfer') ||
        item.name.toLowerCase().includes('klaim') ||
        item.name.toLowerCase().includes('penarikan')
      ),
      'ATM Services': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('atm')
      ),
      'KASDA Services': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('kasda')
      ),
      'IT/Technical': allServiceItems.filter(item => 
        item.name.toLowerCase().includes('gangguan') ||
        item.name.toLowerCase().includes('maintenance') ||
        item.name.toLowerCase().includes('network') ||
        item.name.toLowerCase().includes('technical')
      )
    };

    for (const [category, items] of Object.entries(patterns)) {
      if (items.length > 0) {
        console.log(`\n  🏷️  ${category} (${items.length} services):`);
        items.forEach(item => {
          const catalog = serviceCatalogs.find(cat => 
            cat.serviceItems.some(si => si.id === item.id)
          );
          console.log(`    - ${item.name} → ${catalog.name}`);
        });
      }
    }

    // 4. Check for specific services mentioned in requirements
    console.log('\n🎯 Key Services Check:');
    const keyServices = [
      'Transfer Antar Bank',
      'BSGTouch – Transfer Antar Bank',
      'OLIBS',
      'Kasda Online',
      'ATM-Pembayaran',
      'User Management',
      'Identity Access'
    ];

    for (const keyService of keyServices) {
      const found = allServiceItems.filter(item => 
        item.name.toLowerCase().includes(keyService.toLowerCase())
      );
      
      if (found.length > 0) {
        console.log(`  ✅ ${keyService}: Found ${found.length} matching services`);
        found.forEach(item => {
          const catalog = serviceCatalogs.find(cat => 
            cat.serviceItems.some(si => si.id === item.id)
          );
          console.log(`     - ${item.name} → ${catalog.name}`);
        });
      } else {
        console.log(`  ❌ ${keyService}: Not found`);
      }
    }

    // 5. Compare with CSV template count
    console.log('\n📈 Template Coverage Analysis:');
    
    // Count CSV templates (if files exist)
    const templateCsvPath = path.join(__dirname, 'template.csv');
    const hdTemplateCsvPath = path.join(__dirname, 'hd_template.csv');
    
    let csvTemplateCount = 0;
    if (fs.existsSync(templateCsvPath)) {
      const templateCsv = fs.readFileSync(templateCsvPath, 'utf-8');
      const templateLines = templateCsv.split('\n').filter(line => line.trim());
      csvTemplateCount += templateLines.length - 1; // Subtract header
    }
    
    if (fs.existsSync(hdTemplateCsvPath)) {
      const hdTemplateCsv = fs.readFileSync(hdTemplateCsvPath, 'utf-8');
      const hdTemplateLines = hdTemplateCsv.split('\n').filter(line => line.trim());
      csvTemplateCount += hdTemplateLines.length - 1; // Subtract header
    }

    console.log(`  📄 CSV Templates Expected: ${csvTemplateCount}`);
    console.log(`  🗄️  Database Templates Found: ${totalTemplates}`);
    console.log(`  📊 Coverage: ${csvTemplateCount > 0 ? ((totalTemplates / csvTemplateCount) * 100).toFixed(1) : 'Unknown'}%`);

    // 6. Check ITIL compliance
    console.log('\n🏛️  ITIL Service Catalog Structure Analysis:');
    const itilExpectedCatalogs = [
      'Banking Applications',
      'Identity & Access Management', 
      'Claims & Transactions',
      'KASDA Services',
      'IT Services'
    ];

    for (const expectedCatalog of itilExpectedCatalogs) {
      const found = serviceCatalogs.find(cat => cat.name === expectedCatalog);
      if (found) {
        console.log(`  ✅ ${expectedCatalog}: ${found.serviceItems.length} services`);
      } else {
        console.log(`  ❌ ${expectedCatalog}: Missing`);
      }
    }

    // 7. Department distribution
    console.log('\n🏢 Department Distribution:');
    const deptDistribution = {};
    serviceCatalogs.forEach(catalog => {
      const deptName = catalog.department.name;
      if (!deptDistribution[deptName]) {
        deptDistribution[deptName] = { catalogs: 0, services: 0, templates: 0 };
      }
      deptDistribution[deptName].catalogs++;
      deptDistribution[deptName].services += catalog.serviceItems.length;
      deptDistribution[deptName].templates += catalog.serviceItems.reduce((sum, item) => sum + item.templates.length, 0);
    });

    for (const [dept, stats] of Object.entries(deptDistribution)) {
      console.log(`  🏢 ${dept}: ${stats.catalogs} catalogs, ${stats.services} services, ${stats.templates} templates`);
    }

  } catch (error) {
    console.error('❌ Error analyzing service catalog state:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the analysis
analyzeServiceCatalogState()
  .then(() => {
    console.log('\n✅ Service catalog analysis completed');
  })
  .catch((error) => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });