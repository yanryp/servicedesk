#!/usr/bin/env npx ts-node

/**
 * Set Default Issue Classifications for Service Templates
 * 
 * Analyzes service templates and sets appropriate default issue classifications
 * based on service name patterns and categories.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define classification rules based on service patterns
const getIssueClassification = (serviceName: string, description: string) => {
  const name = serviceName.toLowerCase();
  const desc = description.toLowerCase();
  
  // User/Process Error patterns
  if (name.includes('user') || name.includes('password') || name.includes('login') || 
      name.includes('akses') || name.includes('registrasi') || name.includes('pendaftaran')) {
    return {
      rootCause: 'human_error' as const,
      issueType: 'request' as const
    };
  }
  
  // External Issue patterns (claims, payments, third-party services)
  if (name.includes('klaim') || name.includes('claim') || name.includes('pembayaran') ||
      name.includes('tagihan') || name.includes('pln') || name.includes('bpjs') ||
      name.includes('samsat') || name.includes('pulsa') || name.includes('bank lain')) {
    return {
      rootCause: 'external_factor' as const,
      issueType: 'complaint' as const
    };
  }
  
  // Technical/System Error patterns
  if (name.includes('error') || name.includes('gagal') || name.includes('offline') ||
      name.includes('gangguan') || name.includes('fatal') || name.includes('communication') ||
      name.includes('mcrw') || name.includes('cash handler') || name.includes('door contact')) {
    return {
      rootCause: 'system_error' as const,
      issueType: 'problem' as const
    };
  }
  
  // Service Request patterns (new requests, changes, installations)
  if (name.includes('permintaan') || name.includes('request') || name.includes('instalasi') ||
      name.includes('pemasangan') || name.includes('perubahan') || name.includes('mutasi') ||
      name.includes('maintenance') || name.includes('reset') || name.includes('aktivasi')) {
    return {
      rootCause: 'human_error' as const,
      issueType: 'request' as const
    };
  }
  
  // Technical problems (hardware/software issues)
  if (name.includes('teknis') || name.includes('technical') || name.includes('hardware') ||
      name.includes('software') || name.includes('komputer') || name.includes('printer') ||
      name.includes('network') || name.includes('internet') || name.includes('lan') ||
      name.includes('wan') || name.includes('wifi') || name.includes('vpn')) {
    return {
      rootCause: 'system_error' as const,
      issueType: 'problem' as const
    };
  }
  
  // Default for unclear cases
  return {
    rootCause: 'undetermined' as const,
    issueType: 'request' as const
  };
};

async function setDefaultIssueClassifications() {
  console.log('🔄 Setting Default Issue Classifications for Service Templates...\n');
  
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
  
  console.log(`📊 Found ${serviceTemplates.length} service templates to analyze...\n`);
  
  let updatedCount = 0;
  const classifications: Record<string, any[]> = {
    'human_error + request': [],
    'external_factor + complaint': [],
    'system_error + problem': [],
    'undetermined + request': []
  };
  
  for (const template of serviceTemplates) {
    const classification = getIssueClassification(template.name, template.description || '');
    
    // Update the template with default classifications
    await prisma.serviceTemplate.update({
      where: { id: template.id },
      data: {
        defaultRootCause: classification.rootCause,
        defaultIssueType: classification.issueType
      }
    });
    
    const key = `${classification.rootCause} + ${classification.issueType}`;
    if (!classifications[key]) {
      classifications[key] = [];
    }
    
    classifications[key].push({
      name: template.name,
      catalog: template.serviceItem.serviceCatalog.name,
      rootCause: classification.rootCause,
      issueType: classification.issueType
    });
    
    updatedCount++;
  }
  
  console.log('📋 Classification Summary:\n');
  
  Object.keys(classifications).forEach(category => {
    const items = classifications[category];
    if (items.length > 0) {
      console.log(`📱 ${category} (${items.length} services):`);
      items.slice(0, 5).forEach(item => {
        console.log(`   • ${item.name} (${item.catalog})`);
      });
      if (items.length > 5) {
        console.log(`   ... and ${items.length - 5} more services`);
      }
      console.log('');
    }
  });
  
  console.log(`📊 Classification Complete!`);
  console.log(`   • Templates updated: ${updatedCount}`);
  console.log(`   • Total templates: ${serviceTemplates.length}`);
  
  await prisma.$disconnect();
}

async function main() {
  console.log('🚀 Starting Default Issue Classification Setup...\n');
  
  try {
    await setDefaultIssueClassifications();
    
    console.log('\n🎉 Default Issue Classification Setup Complete!');
    console.log('✅ All service templates now have appropriate default classifications');
    console.log('🎯 Users will see pre-selected values that match their service type');
    console.log('📱 Frontend forms will be pre-populated with logical defaults');
    
  } catch (error) {
    console.error('❌ Error during classification setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});