#!/usr/bin/env npx ts-node

/**
 * Map BSG Templates to Service Items
 * 
 * This script creates proper mappings between BSG templates from template.csv
 * and the corresponding service items in the service catalog. It ensures that
 * service items display the correct dynamic field counts based on BSG template
 * field structures.
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const prisma = new PrismaClient();

interface CSVTemplateRow {
  'No.': string;
  'Aplikasi': string;
  'Jenis Pekerjaan': string;
  'Nama Field': string;
  'Tipe': string;
  'Keterangan': string;
}

interface BSGTemplateData {
  templateNumber: number;
  application: string;
  serviceType: string;
  fields: Array<{
    name: string;
    type: string;
    description: string;
    isRequired: boolean;
    maxLength?: number;
  }>;
}

interface ServiceMapping {
  serviceName: string;
  bsgTemplateName: string;
  expectedFieldCount: number;
  matchConfidence: 'exact' | 'high' | 'medium' | 'low';
}

/**
 * Parse template.csv and group fields by template
 */
async function parseTemplateCSV(): Promise<BSGTemplateData[]> {
  const csvPath = path.join(__dirname, '../../archive/csv-data/template.csv');
  const templates = new Map<string, BSGTemplateData>();
  
  return new Promise((resolve, reject) => {
    const results: CSVTemplateRow[] = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: CSVTemplateRow) => {
        results.push(data);
      })
      .on('end', () => {
        // Group fields by template number
        for (const row of results) {
          const templateNum = parseInt(row['No.']);
          const key = `${templateNum}-${row['Aplikasi']}-${row['Jenis Pekerjaan']}`;
          
          if (!templates.has(key)) {
            templates.set(key, {
              templateNumber: templateNum,
              application: row['Aplikasi'],
              serviceType: row['Jenis Pekerjaan'],
              fields: []
            });
          }
          
          const template = templates.get(key)!;
          template.fields.push({
            name: row['Nama Field'],
            type: row['Tipe'],
            description: row['Keterangan'],
            isRequired: row['Nama Field'].includes('*'),
            maxLength: row['Tipe'].includes('maks 5') ? 5 : undefined
          });
        }
        
        resolve(Array.from(templates.values()));
      })
      .on('error', reject);
  });
}

/**
 * Find matching service items for BSG templates
 */
async function findServiceMatches(bsgTemplates: BSGTemplateData[]): Promise<ServiceMapping[]> {
  console.log('🔍 Finding service item matches for BSG templates...\n');
  
  // Get all service items
  const serviceItems = await prisma.serviceItem.findMany({
    include: {
      serviceCatalog: true,
      _count: {
        select: {
          service_field_definitions: true
        }
      }
    }
  });
  
  const mappings: ServiceMapping[] = [];
  
  for (const template of bsgTemplates) {
    const bsgName = `${template.application} - ${template.serviceType}`;
    let bestMatch: any = null;
    let bestConfidence: 'exact' | 'high' | 'medium' | 'low' = 'low';
    
    // Try to find matches with confidence scoring
    for (const service of serviceItems) {
      const serviceName = service.name.toLowerCase();
      const templateName = template.serviceType.toLowerCase();
      const appName = template.application.toLowerCase();
      
      let currentConfidence: 'exact' | 'high' | 'medium' | 'low' = 'low';
      
      // Exact match check
      if (serviceName.includes(templateName) && serviceName.includes(appName)) {
        currentConfidence = 'exact';
      }
      // High confidence match - contains service type
      else if (serviceName.includes(templateName)) {
        currentConfidence = 'high';
      }
      // Medium confidence match - contains application name
      else if (serviceName.includes(appName)) {
        currentConfidence = 'medium';
      }
      
      // Update best match if this is better
      if (currentConfidence === 'exact' || 
          (currentConfidence === 'high' && bestConfidence !== 'exact') ||
          (currentConfidence === 'medium' && bestConfidence !== 'exact' && bestConfidence !== 'high') ||
          (currentConfidence === 'low' && !bestMatch)) {
        bestMatch = service;
        bestConfidence = currentConfidence;
        
        // Break early for exact matches
        if (currentConfidence === 'exact') {
          break;
        }
      }
    }
    
    if (bestMatch) {
      mappings.push({
        serviceName: bestMatch.name,
        bsgTemplateName: bsgName,
        expectedFieldCount: template.fields.length,
        matchConfidence: bestConfidence
      });
      
      console.log(`   ${bestConfidence === 'exact' ? '🎯' : bestConfidence === 'high' ? '✅' : bestConfidence === 'medium' ? '🔶' : '❓'} ${bestMatch.name} ← ${bsgName} (${template.fields.length} fields)`);
    } else {
      console.log(`   ❌ No match found for: ${bsgName} (${template.fields.length} fields)`);
    }
  }
  
  return mappings;
}

/**
 * Create ServiceTemplate entries that link BSG templates to service items
 */
async function createServiceTemplateLinks(bsgTemplates: BSGTemplateData[], mappings: ServiceMapping[]) {
  console.log('\n🔗 Creating ServiceTemplate links...\n');
  
  for (const template of bsgTemplates) {
    const bsgName = `${template.application} - ${template.serviceType}`;
    const mapping = mappings.find(m => m.bsgTemplateName === bsgName);
    
    if (!mapping || mapping.matchConfidence === 'low') {
      console.log(`   ⏭️  Skipping low-confidence match: ${bsgName}`);
      continue;
    }
    
    // Find the service item
    const serviceItem = await prisma.serviceItem.findFirst({
      where: { name: mapping.serviceName }
    });
    
    if (!serviceItem) {
      console.log(`   ❌ Service item not found: ${mapping.serviceName}`);
      continue;
    }
    
    // Create or update ServiceTemplate
    const serviceTemplate = await prisma.serviceTemplate.upsert({
      where: {
        serviceItemId_name: {
          serviceItemId: serviceItem.id,
          name: `BSG - ${template.serviceType}`
        }
      },
      update: {
        description: `BSG Template: ${bsgName} (${template.fields.length} fields)`,
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: true, // BSG templates typically require approval
        isVisible: true
      },
      create: {
        serviceItemId: serviceItem.id,
        name: `BSG - ${template.serviceType}`,
        description: `BSG Template: ${bsgName} (${template.fields.length} fields)`,
        templateType: 'standard',
        isKasdaTemplate: false,
        requiresBusinessApproval: true,
        isVisible: true,
        sortOrder: 1
      }
    });
    
    // Remove existing ServiceFieldDefinitions for this template
    await prisma.serviceFieldDefinition.deleteMany({
      where: { serviceTemplateId: serviceTemplate.id }
    });
    
    // Create ServiceFieldDefinitions based on BSG template fields
    for (let i = 0; i < template.fields.length; i++) {
      const field = template.fields[i];
      
      // Map BSG field types to service field types
      let fieldType: any = 'text';
      if (field.type.includes('Date') && !field.type.includes('Drop-Down')) fieldType = 'date';
      else if (field.type.includes('Timestamp')) fieldType = 'datetime';
      else if (field.type.includes('Drop-Down') || field.type.includes('dropdown')) fieldType = 'dropdown';
      else if (field.type.includes('Number') || field.type.includes('Currency')) fieldType = 'number';
      else if (field.type.includes('Email')) fieldType = 'email';
      else if (field.type.includes('Phone')) fieldType = 'phone';
      else if (field.type.toLowerCase().includes('text') && !field.type.includes('Short')) fieldType = 'textarea';
      
      await prisma.serviceFieldDefinition.create({
        data: {
          serviceTemplateId: serviceTemplate.id,
          fieldName: field.name.replace('*', '').trim(),
          fieldLabel: field.name.replace('*', '').trim(),
          fieldType: fieldType,
          isRequired: field.isRequired,
          placeholder: field.description,
          sortOrder: i + 1,
          isVisible: true,
          validationRules: field.maxLength ? { maxLength: field.maxLength } : undefined,
          options: fieldType === 'dropdown' ? { 
            values: field.type.includes('Cabang') ? 'DYNAMIC_BRANCHES' : 'DYNAMIC_OPTIONS' 
          } : undefined
        }
      });
    }
    
    console.log(`   ✅ ${serviceItem.name} → ${template.fields.length} BSG fields created`);
  }
}

/**
 * Update service items to show correct field counts
 */
async function updateServiceItemFieldCounts() {
  console.log('\n📊 Updating service item field counts...\n');
  
  const serviceItems = await prisma.serviceItem.findMany({
    include: {
      templates: {
        include: {
          customFieldDefinitions: true
        }
      },
      service_field_definitions: true
    }
  });
  
  for (const item of serviceItems) {
    const templateFieldCount = item.templates.reduce(
      (sum, template) => sum + template.customFieldDefinitions.length, 0
    );
    const directFieldCount = item.service_field_definitions.length;
    const totalFields = Math.max(templateFieldCount, directFieldCount);
    
    if (totalFields > 0) {
      console.log(`   📋 ${item.name}: ${totalFields} fields`);
    }
  }
}

/**
 * Generate mapping report
 */
async function generateMappingReport(mappings: ServiceMapping[]) {
  console.log('\n📈 Mapping Report:\n');
  
  const stats = {
    exact: mappings.filter(m => m.matchConfidence === 'exact').length,
    high: mappings.filter(m => m.matchConfidence === 'high').length,
    medium: mappings.filter(m => m.matchConfidence === 'medium').length,
    low: mappings.filter(m => m.matchConfidence === 'low').length,
    total: mappings.length
  };
  
  console.log(`📊 Mapping Statistics:`);
  console.log(`   🎯 Exact matches: ${stats.exact}`);
  console.log(`   ✅ High confidence: ${stats.high}`);
  console.log(`   🔶 Medium confidence: ${stats.medium}`);
  console.log(`   ❓ Low confidence: ${stats.low}`);
  console.log(`   📋 Total mappings: ${stats.total}`);
  
  // Show exact matches
  console.log(`\n🎯 Exact Matches:`);
  mappings.filter(m => m.matchConfidence === 'exact').forEach(m => {
    console.log(`   • ${m.serviceName} ← ${m.bsgTemplateName} (${m.expectedFieldCount} fields)`);
  });
  
  // Show high confidence matches
  console.log(`\n✅ High Confidence Matches:`);
  mappings.filter(m => m.matchConfidence === 'high').forEach(m => {
    console.log(`   • ${m.serviceName} ← ${m.bsgTemplateName} (${m.expectedFieldCount} fields)`);
  });
}

async function main() {
  console.log('🗺️  BSG Template to Service Item Mapping\n');
  console.log('This script maps BSG templates from template.csv to service items\n');
  
  try {
    // Step 1: Parse template.csv
    console.log('📄 Parsing template.csv...');
    const bsgTemplates = await parseTemplateCSV();
    console.log(`   ✅ Found ${bsgTemplates.length} BSG templates\n`);
    
    // Step 2: Find service matches
    const mappings = await findServiceMatches(bsgTemplates);
    
    // Step 3: Create ServiceTemplate links
    await createServiceTemplateLinks(bsgTemplates, mappings);
    
    // Step 4: Update field counts
    await updateServiceItemFieldCounts();
    
    // Step 5: Generate report
    await generateMappingReport(mappings);
    
    // Final summary
    const totalServiceTemplates = await prisma.serviceTemplate.count();
    const totalServiceFields = await prisma.serviceFieldDefinition.count();
    
    console.log(`\n✨ Mapping Complete!`);
    console.log(`   🔗 Total Service Templates: ${totalServiceTemplates}`);
    console.log(`   📝 Total Service Fields: ${totalServiceFields}`);
    console.log(`   🎯 BSG Templates Mapped: ${mappings.filter(m => m.matchConfidence !== 'low').length}/${bsgTemplates.length}`);
    
    console.log('\n🚀 Service catalog should now show correct field counts for BSG services!');
    
  } catch (error) {
    console.error('❌ Error mapping BSG templates:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});