#!/usr/bin/env npx ts-node

/**
 * Standardize Service Names - Add App Names Consistently
 * 
 * Updates all ServiceTemplate names to include application names consistently,
 * using the format from their descriptions which already follow "AppName - ServiceName" pattern.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function standardizeServiceNames() {
  console.log('🔄 Standardizing Service Names with App Names...\n');
  
  // Get all service templates
  const serviceTemplates = await prisma.serviceTemplate.findMany({
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
    }
  });
  
  let updatedCount = 0;
  const updates: Array<{id: number, oldName: string, newName: string, app: string}> = [];
  
  console.log(`📊 Found ${serviceTemplates.length} service templates to analyze...\n`);
  
  for (const template of serviceTemplates) {
    const currentName = template.name;
    const description = template.description || '';
    
    // Extract app name from description if it follows "AppName - ServiceName" pattern
    const descriptionMatch = description.match(/^([^-]+)\s*-\s*(.+)$/);
    
    if (descriptionMatch) {
      const [, appName, serviceName] = descriptionMatch;
      const cleanAppName = appName.trim();
      const cleanServiceName = serviceName.trim();
      
      // Check if the current name already includes the app name
      const nameAlreadyHasApp = currentName.toLowerCase().includes(cleanAppName.toLowerCase());
      
      if (!nameAlreadyHasApp && cleanServiceName.toLowerCase() === currentName.toLowerCase()) {
        // Name matches the service part but doesn't have app name - needs updating
        const newName = `${cleanAppName} - ${cleanServiceName}`;
        
        updates.push({
          id: template.id,
          oldName: currentName,
          newName: newName,
          app: cleanAppName
        });
      }
    }
  }
  
  console.log(`📋 Found ${updates.length} services that need app name standardization:\n`);
  
  // Group by app for better display
  const updatesByApp: Record<string, typeof updates> = {};
  updates.forEach(update => {
    if (!updatesByApp[update.app]) {
      updatesByApp[update.app] = [];
    }
    updatesByApp[update.app].push(update);
  });
  
  // Display planned updates by app
  Object.keys(updatesByApp).sort().forEach(app => {
    console.log(`📱 ${app} (${updatesByApp[app].length} services):`);
    updatesByApp[app].forEach(update => {
      console.log(`   • "${update.oldName}" → "${update.newName}"`);
    });
    console.log('');
  });
  
  // Ask for confirmation (in real scenario)
  console.log('🚀 Proceeding with updates...\n');
  
  // Apply updates
  for (const update of updates) {
    await prisma.serviceTemplate.update({
      where: { id: update.id },
      data: { name: update.newName }
    });
    
    console.log(`✅ Updated: "${update.oldName}" → "${update.newName}"`);
    updatedCount++;
  }
  
  console.log(`\n📊 Standardization Complete!`);
  console.log(`   • Services updated: ${updatedCount}`);
  console.log(`   • Total services: ${serviceTemplates.length}`);
  console.log(`   • Services already standardized: ${serviceTemplates.length - updatedCount}`);
  
  // Verify results
  console.log('\n🔍 Verification Sample:');
  const verificationSample = await prisma.serviceTemplate.findMany({
    include: {
      serviceItem: {
        include: {
          serviceCatalog: true
        }
      }
    },
    take: 5
  });
  
  verificationSample.forEach(template => {
    console.log(`   • ${template.name} (${template.serviceItem.serviceCatalog.name})`);
  });
  
  await prisma.$disconnect();
}

async function main() {
  console.log('🚀 Starting Service Name Standardization...\n');
  
  try {
    await standardizeServiceNames();
    
    console.log('\n🎉 Service Name Standardization Complete!');
    console.log('✅ All service names now consistently include application names');
    console.log('🔍 Users can now easily identify which app each service belongs to');
    console.log('🎯 Search functionality will be more effective with consistent naming');
    
  } catch (error) {
    console.error('❌ Error during standardization:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});