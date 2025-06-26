#!/usr/bin/env npx ts-node

/**
 * CSV Template Analysis and Import Script
 * 
 * Analyzes template.csv and hd_template.csv to understand:
 * - Field types and mappings needed
 * - Service categories and department assignments
 * - Dynamic field requirements
 * - Master data requirements
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

const prisma = new PrismaClient();

interface TemplateCSVRow {
  No: string;
  Aplikasi: string;
  'Jenis Pekerjaan': string;
  'Nama Field': string;
  Tipe: string;
  Keterangan: string;
}

interface HDTemplateCSVRow {
  'Template Name': string;
  Description: string;
  'Show to Requester': string;
  [key: string]: string;
}

interface TemplateAnalysis {
  templateNumber: string;
  application: string;
  serviceType: string;
  fields: {
    name: string;
    type: string;
    description: string;
    isRequired: boolean;
    maxLength?: number;
  }[];
}

interface HDTemplateAnalysis {
  name: string;
  description: string;
  showToRequester: boolean;
  category: string;
  department: 'IT_OPERATIONS' | 'DUKUNGAN_LAYANAN';
}

async function main() {
  console.log('📊 Analyzing CSV Template Data...\n');

  try {
    // Analysis Phase 1: Read and parse template.csv
    const templateData = await parseTemplateCSV();
    console.log(`📋 Dynamic Field Templates: ${templateData.length} templates found`);
    
    // Analysis Phase 2: Read and parse hd_template.csv  
    const hdTemplateData = await parseHDTemplateCSV();
    console.log(`🏷️  Static Service Templates: ${hdTemplateData.length} templates found\n`);

    // Analysis Phase 3: Analyze field types
    await analyzeFieldTypes(templateData);
    
    // Analysis Phase 4: Analyze service categories
    await analyzeServiceCategories(hdTemplateData);
    
    // Analysis Phase 5: Department assignment analysis
    await analyzeDepartmentAssignments(hdTemplateData);

    // Analysis Phase 6: Create comprehensive mapping
    await createServiceMapping(templateData, hdTemplateData);

    console.log('\n✨ CSV analysis complete! Ready for service catalog creation.');

  } catch (error) {
    console.error('❌ Error analyzing CSV data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function parseTemplateCSV(): Promise<TemplateAnalysis[]> {
  const templatePath = path.join(__dirname, '../../template.csv');
  const templates: Map<string, TemplateAnalysis> = new Map();

  return new Promise((resolve, reject) => {
    const results: TemplateCSVRow[] = [];
    
    fs.createReadStream(templatePath)
      .pipe(csv())
      .on('data', (data: TemplateCSVRow) => results.push(data))
      .on('end', () => {
        // Group fields by template number
        results.forEach(row => {
          const templateKey = `${row.No}-${row.Aplikasi}-${row['Jenis Pekerjaan']}`;
          
          if (!templates.has(templateKey)) {
            templates.set(templateKey, {
              templateNumber: row.No,
              application: row.Aplikasi,
              serviceType: row['Jenis Pekerjaan'],
              fields: []
            });
          }

          const template = templates.get(templateKey)!;
          template.fields.push({
            name: row['Nama Field'],
            type: row.Tipe,
            description: row.Keterangan,
            isRequired: row['Nama Field'].includes('*'),
            maxLength: extractMaxLength(row.Tipe)
          });
        });

        resolve(Array.from(templates.values()));
      })
      .on('error', reject);
  });
}

async function parseHDTemplateCSV(): Promise<HDTemplateAnalysis[]> {
  const hdTemplatePath = path.join(__dirname, '../../hd_template.csv');
  
  return new Promise((resolve, reject) => {
    const results: HDTemplateAnalysis[] = [];
    
    fs.createReadStream(hdTemplatePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data: HDTemplateCSVRow) => {
        // Handle BOM character in column name
        const templateName = data['﻿Template Name'] || data['Template Name'];
        if (!templateName) return; // Skip empty rows
        
        const category = extractCategory(templateName);
        results.push({
          name: templateName,
          description: data.Description || '',
          showToRequester: data['Show to Requester']?.toLowerCase() === 'yes',
          category,
          department: determineDepartment(templateName, category)
        });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

function extractMaxLength(fieldType: string): number | undefined {
  const match = fieldType.match(/maks (\d+) karakter/);
  return match ? parseInt(match[1]) : undefined;
}

function extractCategory(templateName: string): string {
  if (!templateName) return 'General';
  const parts = templateName.split(' - ');
  return parts[0] || 'General';
}

function determineDepartment(templateName: string, category: string): 'IT_OPERATIONS' | 'DUKUNGAN_LAYANAN' {
  if (!templateName) return 'IT_OPERATIONS';
  
  const lowerName = templateName.toLowerCase();
  
  // KASDA and BSGDirect user management go to Dukungan & Layanan
  if (lowerName.includes('kasda') && 
      (lowerName.includes('user') || lowerName.includes('pendaftaran'))) {
    return 'DUKUNGAN_LAYANAN';
  }
  
  if (lowerName.includes('bsgdirect') && 
      (lowerName.includes('user') || lowerName.includes('pendaftaran'))) {
    return 'DUKUNGAN_LAYANAN'; 
  }

  // All technical problems and system issues go to IT Operations
  return 'IT_OPERATIONS';
}

async function analyzeFieldTypes(templates: TemplateAnalysis[]) {
  console.log('🔍 Field Type Analysis:\n');
  
  const fieldTypes = new Map<string, number>();
  let totalFields = 0;

  templates.forEach(template => {
    template.fields.forEach(field => {
      const normalizedType = normalizeFieldType(field.type);
      fieldTypes.set(normalizedType, (fieldTypes.get(normalizedType) || 0) + 1);
      totalFields++;
    });
  });

  console.log(`📝 Total Dynamic Fields: ${totalFields}`);
  console.log('🏷️  Field Type Distribution:');
  
  Array.from(fieldTypes.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const systemMapping = mapToSystemFieldType(type);
      const support = systemMapping.supported ? '✅' : '❌';
      console.log(`   ${support} ${type}: ${count} fields → ${systemMapping.systemType}`);
    });

  console.log('\n📋 Field Type Mapping Recommendations:');
  const uniqueTypes = Array.from(fieldTypes.keys());
  uniqueTypes.forEach(type => {
    const mapping = mapToSystemFieldType(type);
    console.log(`   ${type} → ${mapping.systemType} (${mapping.implementation})`);
  });
}

function normalizeFieldType(fieldType: string): string {
  // Normalize field types for analysis
  if (fieldType.includes('Drop-Down')) return 'Drop-Down';
  if (fieldType.includes('Short Text')) return 'Short Text';
  if (fieldType.includes('Number')) return 'Number Only';
  if (fieldType.includes('Date')) return 'Date';
  if (fieldType.includes('Currency')) return 'Currency';
  if (fieldType.includes('Timestamp')) return 'Timestamp';
  if (fieldType.includes('Text')) return 'Text';
  if (fieldType.includes('Varchar')) return 'Varchar';
  return fieldType;
}

function mapToSystemFieldType(csvType: string): { systemType: string, supported: boolean, implementation: string } {
  const mappings: Record<string, { systemType: string, supported: boolean, implementation: string }> = {
    'Date': { systemType: 'date', supported: true, implementation: 'date input with auto-default to today' },
    'Short Text': { systemType: 'text_short', supported: true, implementation: 'text input with character limits' },
    'Number Only': { systemType: 'number', supported: true, implementation: 'number input with validation' },
    'Currency': { systemType: 'currency', supported: true, implementation: 'currency input with IDR formatting' },
    'Timestamp': { systemType: 'datetime', supported: true, implementation: 'datetime picker' },
    'Text': { systemType: 'textarea', supported: true, implementation: 'textarea for longer content' },
    'Varchar': { systemType: 'text', supported: true, implementation: 'text input' },
    'Drop-Down': { systemType: 'searchable_dropdown', supported: true, implementation: 'master data driven dropdown' }
  };

  return mappings[csvType] || { systemType: 'text', supported: false, implementation: 'default to text input' };
}

async function analyzeServiceCategories(hdTemplates: HDTemplateAnalysis[]) {
  console.log('\n📊 Service Category Analysis:\n');
  
  const categories = new Map<string, { count: number, department: string, examples: string[] }>();
  
  hdTemplates.forEach(template => {
    if (!categories.has(template.category)) {
      categories.set(template.category, {
        count: 0,
        department: template.department,
        examples: []
      });
    }
    
    const cat = categories.get(template.category)!;
    cat.count++;
    if (cat.examples.length < 3) {
      cat.examples.push(template.name);
    }
  });

  console.log('🏷️  Service Categories by Department:\n');
  
  // IT Operations categories
  const itCategories = Array.from(categories.entries())
    .filter(([_, data]) => data.department === 'IT_OPERATIONS')
    .sort((a, b) => b[1].count - a[1].count);
    
  console.log('🖥️  IT Operations Department:');
  itCategories.forEach(([category, data]) => {
    console.log(`   ${category}: ${data.count} templates`);
    console.log(`      Examples: ${data.examples.join(', ')}`);
  });

  // Support categories  
  const supportCategories = Array.from(categories.entries())
    .filter(([_, data]) => data.department === 'DUKUNGAN_LAYANAN')
    .sort((a, b) => b[1].count - a[1].count);
    
  console.log('\n🤝 Dukungan & Layanan Department:');
  supportCategories.forEach(([category, data]) => {
    console.log(`   ${category}: ${data.count} templates`);
    console.log(`      Examples: ${data.examples.join(', ')}`);
  });
}

async function analyzeDepartmentAssignments(hdTemplates: HDTemplateAnalysis[]) {
  const itCount = hdTemplates.filter(t => t.department === 'IT_OPERATIONS').length;
  const supportCount = hdTemplates.filter(t => t.department === 'DUKUNGAN_LAYANAN').length;
  
  console.log('\n🎯 Department Assignment Summary:');
  console.log(`   🖥️  IT Operations: ${itCount} templates (${((itCount/hdTemplates.length)*100).toFixed(1)}%)`);
  console.log(`   🤝 Dukungan & Layanan: ${supportCount} templates (${((supportCount/hdTemplates.length)*100).toFixed(1)}%)`);
  
  // Show specific KASDA and BSGDirect user management templates
  const kasdaUserMgmt = hdTemplates.filter(t => 
    t.name.toLowerCase().includes('kasda') && 
    (t.name.toLowerCase().includes('user') || t.name.toLowerCase().includes('pendaftaran'))
  );
  
  const bsgDirectUserMgmt = hdTemplates.filter(t => 
    t.name.toLowerCase().includes('bsgdirect') && 
    (t.name.toLowerCase().includes('user') || t.name.toLowerCase().includes('pendaftaran'))
  );

  console.log('\n🎯 Dukungan & Layanan Specific Services:');
  if (kasdaUserMgmt.length > 0) {
    console.log('   📋 KASDA User Management:');
    kasdaUserMgmt.forEach(t => console.log(`      - ${t.name}`));
  }
  
  if (bsgDirectUserMgmt.length > 0) {
    console.log('   📋 BSGDirect User Management:');
    bsgDirectUserMgmt.forEach(t => console.log(`      - ${t.name}`));
  }
}

async function createServiceMapping(templates: TemplateAnalysis[], hdTemplates: HDTemplateAnalysis[]) {
  console.log('\n📋 Creating Service Mapping for Database Import...\n');
  
  // Write mapping files for import scripts
  const mapping = {
    dynamicTemplates: templates,
    staticTemplates: hdTemplates,
    fieldTypeMappings: createFieldTypeMappings(),
    departmentAssignments: {
      itOperations: hdTemplates.filter(t => t.department === 'IT_OPERATIONS'),
      dukunganLayanan: hdTemplates.filter(t => t.department === 'DUKUNGAN_LAYANAN')
    },
    statistics: {
      totalTemplates: templates.length + hdTemplates.length,
      dynamicFieldTemplates: templates.length,
      staticTemplates: hdTemplates.length,
      totalFields: templates.reduce((sum, t) => sum + t.fields.length, 0),
      itOperationsTemplates: hdTemplates.filter(t => t.department === 'IT_OPERATIONS').length,
      dukunganLayananTemplates: hdTemplates.filter(t => t.department === 'DUKUNGAN_LAYANAN').length
    }
  };

  const mappingPath = path.join(__dirname, '../template-mapping.json');
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  
  console.log(`✅ Service mapping saved to: ${mappingPath}`);
  console.log(`📊 Mapping Statistics:`);
  console.log(`   🎯 Total Templates: ${mapping.statistics.totalTemplates}`);
  console.log(`   ⚡ Dynamic Field Templates: ${mapping.statistics.dynamicFieldTemplates}`);
  console.log(`   📋 Static Templates: ${mapping.statistics.staticTemplates}`);
  console.log(`   🔧 Total Dynamic Fields: ${mapping.statistics.totalFields}`);
  console.log(`   🖥️  IT Operations Templates: ${mapping.statistics.itOperationsTemplates}`);
  console.log(`   🤝 Dukungan & Layanan Templates: ${mapping.statistics.dukunganLayananTemplates}`);
}

function createFieldTypeMappings() {
  return {
    'Date': { systemType: 'date', htmlType: 'date', validation: 'required|date' },
    'Short Text': { systemType: 'text_short', htmlType: 'text', validation: 'required|string|max:255' },
    'Number Only': { systemType: 'number', htmlType: 'number', validation: 'required|numeric' },
    'Currency': { systemType: 'currency', htmlType: 'number', validation: 'required|numeric|min:0' },
    'Timestamp': { systemType: 'datetime', htmlType: 'datetime-local', validation: 'required|date' },
    'Text': { systemType: 'textarea', htmlType: 'textarea', validation: 'required|string' },
    'Varchar': { systemType: 'text', htmlType: 'text', validation: 'string' },
    'Drop-Down': { systemType: 'searchable_dropdown', htmlType: 'select', validation: 'required|exists:master_data' }
  };
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});