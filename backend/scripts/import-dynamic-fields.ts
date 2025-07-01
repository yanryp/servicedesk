import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TemplateField {
  no: string;
  aplikasi: string;
  jenisPekerjaan: string;
  namaField: string;
  tipe: string;
  keterangan: string;
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"(.*)"$/, '$1'));
}

function mapFieldTypeToHTMLType(csvType: string): { htmlType: string; validationPattern?: string } {
  const type = csvType.toLowerCase();
  
  if (type.includes('date')) {
    return { htmlType: 'date' };
  } else if (type.includes('timestamp')) {
    return { htmlType: 'datetime-local' };
  } else if (type.includes('number')) {
    return { htmlType: 'number', validationPattern: '^[0-9]+$' };
  } else if (type.includes('currency')) {
    return { htmlType: 'number', validationPattern: '^[0-9]+(\\.[0-9]{1,2})?$' };
  } else if (type.includes('drop-down') || type.includes('dropdown')) {
    return { htmlType: 'select' };
  } else if (type.includes('text area') || type.includes('textarea')) {
    return { htmlType: 'textarea', validationPattern: '.{0,2000}' };
  } else if (type.includes('short text')) {
    const maxMatch = type.match(/maks (\d+)/);
    const maxLength = maxMatch ? parseInt(maxMatch[1]) : 255;
    return { htmlType: 'text', validationPattern: `.{0,${maxLength}}` };
  } else {
    return { htmlType: 'text', validationPattern: '.{0,255}' };
  }
}

async function importDynamicFields() {
  console.log('📋 Starting Dynamic Field Definitions Import...');

  try {
    // Read the template CSV file
    const csvPath = '/Users/yanrypangouw/Documents/Projects/Web/ticketing-system/archive/csv-data/template.csv';
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`Template CSV file not found at: ${csvPath}`);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Skip header line
    const dataLines = lines.slice(1);
    
    console.log(`📄 Processing ${dataLines.length} template field definitions...`);

    // Get existing field types and template categories
    const existingFieldTypes = await prisma.bSGFieldType.findMany();
    const existingCategories = await prisma.bSGTemplateCategory.findMany();

    // Parse CSV data
    const templateFields: TemplateField[] = [];
    
    for (const line of dataLines) {
      if (!line.trim()) continue;
      
      const fields = parseCSVLine(line);
      if (fields.length >= 6) {
        templateFields.push({
          no: fields[0],
          aplikasi: fields[1],
          jenisPekerjaan: fields[2],
          namaField: fields[3],
          tipe: fields[4],
          keterangan: fields[5]
        });
      }
    }

    console.log(`✅ Parsed ${templateFields.length} field definitions`);

    // Group templates by application and work type
    const templatesMap = new Map<string, TemplateField[]>();
    
    for (const field of templateFields) {
      const templateKey = `${field.aplikasi} - ${field.jenisPekerjaan}`;
      if (!templatesMap.has(templateKey)) {
        templatesMap.set(templateKey, []);
      }
      templatesMap.get(templateKey)!.push(field);
    }

    console.log(`📝 Creating ${templatesMap.size} BSG templates...`);

    // Create BSG templates and their fields
    let templateCount = 0;
    let fieldCount = 0;

    for (const [templateName, fields] of templatesMap) {
      // Determine template category based on application
      const application = fields[0].aplikasi.toUpperCase();
      let categoryId = existingCategories[0].id; // Default to first category
      
      if (application.includes('OLIBS') || application.includes('KASDA')) {
        // Banking Operations
        const bankingCategory = existingCategories.find(c => c.name === 'Banking Operations');
        if (bankingCategory) categoryId = bankingCategory.id;
      } else if (application.includes('XCARD') || application.includes('ATM')) {
        // IT Support  
        const itCategory = existingCategories.find(c => c.name === 'IT Support');
        if (itCategory) categoryId = itCategory.id;
      } else if (application.includes('KLAIM')) {
        // Government Services (for claims)
        const govCategory = existingCategories.find(c => c.name === 'Government Services');
        if (govCategory) categoryId = govCategory.id;
      }

      // Create BSG template
      const bsgTemplate = await prisma.bSGTemplate.create({
        data: {
          categoryId: categoryId,
          name: templateName,
          displayName: templateName,
          description: `Template for ${templateName} requests`,
          templateNumber: templateCount + 1,
          isActive: true,
          popularityScore: 0,
          usageCount: 0
        }
      });

      templateCount++;

      // Create template fields
      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const fieldTypeMapping = mapFieldTypeToHTMLType(field.tipe);
        
        // Find or create matching field type
        let fieldType = existingFieldTypes.find(ft => ft.htmlInputType === fieldTypeMapping.htmlType);
        
        if (!fieldType) {
          // Create new field type if it doesn't exist
          fieldType = await prisma.bSGFieldType.create({
            data: {
              name: fieldTypeMapping.htmlType + '_custom',
              displayName: field.tipe,
              htmlInputType: fieldTypeMapping.htmlType,
              validationPattern: fieldTypeMapping.validationPattern,
              isActive: true
            }
          });
          existingFieldTypes.push(fieldType);
        }

        // Create template field
        const isRequired = field.namaField.includes('*');
        const cleanFieldName = field.namaField.replace('*', '').trim();
        
        await prisma.bSGTemplateField.create({
          data: {
            templateId: bsgTemplate.id,
            fieldTypeId: fieldType.id,
            fieldName: cleanFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
            fieldLabel: cleanFieldName,
            fieldDescription: field.keterangan,
            isRequired: isRequired,
            sortOrder: i + 1,
            placeholderText: `Enter ${cleanFieldName.toLowerCase()}`,
            helpText: field.keterangan
          }
        });

        fieldCount++;

        // Create field options for dropdown fields
        if (fieldTypeMapping.htmlType === 'select') {
          // Extract dropdown options from field description or type
          let dropdownOptions: string[] = [];
          
          if (field.tipe.includes('Nama Cabang')) {
            // Get branch names from units
            const branches = await prisma.unit.findMany({
              where: { isActive: true },
              select: { name: true, code: true }
            });
            dropdownOptions = branches.map(b => b.name);
          } else if (field.tipe.includes('Menu OLIBs')) {
            // Get OLIBS menu options from master data
            const olibsMenus = await prisma.bSGMasterData.findMany({
              where: { dataType: 'olibs_menu', isActive: true },
              orderBy: { sortOrder: 'asc' }
            });
            dropdownOptions = olibsMenus.map(m => m.name);
          } else {
            // Default options for other dropdowns
            dropdownOptions = ['Option 1', 'Option 2', 'Option 3'];
          }

          // Create field options
          for (let j = 0; j < dropdownOptions.length; j++) {
            const option = dropdownOptions[j];
            await prisma.bSGFieldOption.create({
              data: {
                fieldId: (await prisma.bSGTemplateField.findFirst({
                  where: { templateId: bsgTemplate.id, fieldName: cleanFieldName.toLowerCase().replace(/[^a-z0-9]/g, '_') }
                }))!.id,
                optionValue: option.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                optionLabel: option,
                isDefault: j === 0,
                sortOrder: j + 1
              }
            });
          }
        }
      }
    }

    console.log(`
🎉 Dynamic Field Definitions Import Summary:
═══════════════════════════════════════════
📝 BSG Templates Created: ${templateCount}
🔧 Template Fields Created: ${fieldCount}
📋 Field Types Available: ${existingFieldTypes.length}

📊 Template Breakdown:
🏦 OLIBS Templates: ${Array.from(templatesMap.keys()).filter(k => k.includes('OLIBS')).length}
🏛️ KASDA Templates: ${Array.from(templatesMap.keys()).filter(k => k.includes('KASDA')).length}  
💳 XCARD Templates: ${Array.from(templatesMap.keys()).filter(k => k.includes('XCARD')).length}
⚖️ Claims Templates: ${Array.from(templatesMap.keys()).filter(k => k.includes('KLAIM')).length}

✅ Dynamic form generation ready for production!
    `);

  } catch (error) {
    console.error('❌ Error importing dynamic fields:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importDynamicFields()
  .catch((error) => {
    console.error('❌ Dynamic fields import failed:', error);
    process.exit(1);
  });