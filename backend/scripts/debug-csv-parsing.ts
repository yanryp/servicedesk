#!/usr/bin/env npx ts-node

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

async function debugCSVParsing() {
  console.log('🔍 Debugging CSV Parsing...\n');

  const hdTemplatePath = path.join(__dirname, '../../hd_template.csv');
  console.log(`📁 Looking for file at: ${hdTemplatePath}`);
  console.log(`📁 File exists: ${fs.existsSync(hdTemplatePath)}`);

  if (!fs.existsSync(hdTemplatePath)) {
    console.log('❌ File not found!');
    return;
  }

  // Read first few lines manually
  const content = fs.readFileSync(hdTemplatePath, 'utf8');
  const lines = content.split('\n').slice(0, 5);
  
  console.log('\n📄 First 5 lines of hd_template.csv:');
  lines.forEach((line, i) => {
    console.log(`${i + 1}: "${line}"`);
  });

  // Test CSV parsing
  console.log('\n🔄 Testing CSV parsing...');
  
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let rowCount = 0;
    
    fs.createReadStream(hdTemplatePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        rowCount++;
        if (rowCount <= 3) {
          console.log(`Row ${rowCount}:`, data);
        }
        results.push(data);
      })
      .on('end', () => {
        console.log(`\n✅ Successfully parsed ${results.length} rows`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('❌ Error parsing CSV:', error);
        reject(error);
      });
  });
}

debugCSVParsing().catch(console.error);