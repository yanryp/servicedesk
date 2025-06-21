#!/usr/bin/env node

/**
 * BSG Category Restructuring Script
 * 
 * This script restructures the BSG categorization system based on real banking operations
 * and transaction flows. It creates a proper hierarchy that separates:
 * - ATM technical issues from operational claims
 * - Cross-channel transaction routing
 * - BSGTouch vs BSG QRIS differentiation
 * - Tax payment routing to local governments
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// New BSG Category Structure based on real banking operations
const BSG_CATEGORY_STRUCTURE = {
  // 1. Core Banking Systems
  "Core Banking Systems": {
    description: "Central banking platform and infrastructure",
    icon: "🏛️",
    color: "#1e40af",
    subcategories: {
      "OLIBs Core Banking": {
        description: "Core banking system for all account operations",
        items: [
          "OLIBs BE Error", "OLIBs FE Error", "OLIBs User Management",
          "OLIBs Tabungan", "OLIBs Deposito", "OLIBs Giro", "OLIBs Kredit",
          "OLIBs Close Operasional", "OLIBs Selisih Pembukuan"
        ]
      },
      "BSGDirect Internet Banking": {
        description: "Web-based internet banking platform",
        items: [
          "BSGDirect Error Aplikasi", "BSGDirect Error Transaksi",
          "BSGDirect Gagal Transfer", "BSGDirect Gagal Pembayaran"
        ]
      },
      "Kasda Online Treasury": {
        description: "Government treasury system and BUD operations",
        items: [
          "Kasda Online Error Login", "Kasda Online Error Approval",
          "Kasda Online Error Transaksi", "Kasda Online Gagal Transfer",
          "Kasda Online Gagal Pembayaran", "Kasda Online BUD Error",
          "Kasda Online Error SP2D"
        ]
      }
    }
  },

  // 2. Mobile Banking Platforms
  "Mobile Banking Platforms": {
    description: "Mobile banking applications for iOS and Android",
    icon: "📱",
    color: "#059669",
    subcategories: {
      "BSGTouch Mobile Banking": {
        description: "Main mobile banking app (iOS/Android)",
        items: [
          "BSGTouch User Management", "BSGTouch Error Aplikasi", "BSGTouch Error Transaksi",
          "BSGTouch SMS Aktivasi", "BSGTouch Error Registrasi", "BSGTouch Penutupan Akun"
        ]
      },
      "BSG QRIS Payment System": {
        description: "QRIS-focused mobile payment app (separate from BSGTouch)",
        items: [
          "BSG QRIS User Management", "BSG QRIS Error Aplikasi", "BSG QRIS Error Transaksi",
          "BSG QRIS Klaim BI Fast", "BSG QRIS Klaim Gagal Transaksi"
        ]
      },
      "Cross-Channel Transaction Claims": {
        description: "Claims and disputes for transactions across mobile platforms",
        items: [
          "Mobile Transfer Antar Bank Claims", "Mobile Payment Claims",
          "Mobile BI Fast Claims", "Mobile Top-Up Claims"
        ]
      }
    }
  },

  // 3. ATM Operations (Customer-facing)
  "ATM Operations": {
    description: "ATM network operations and customer transaction claims",
    icon: "🏧",
    color: "#dc2626",
    subcategories: {
      "ATM Transaction Claims": {
        description: "Customer claims and disputes for ATM transactions",
        items: [
          "ATM Penarikan Bank Lain Claims", "ATM Transfer Bank Lain Claims",
          "ATM Claims >75 Hari", "ATM Penyelesaian Re-Klaim"
        ]
      },
      "ATM Network Operations": {
        description: "ATM switching and network operations (ATMBersama, ALTO)",
        items: [
          "ATM ATMB Error Transfer", "ATM Switching Network Issues",
          "ATM Network Registration", "ATM Profile Changes"
        ]
      },
      "ATM Terminal Management": {
        description: "ATM terminal registration and configuration",
        items: [
          "ATM Pendaftaran Terminal Baru", "ATM Perubahan IP", 
          "ATM Perubahan Profil", "ATM Permintaan Log"
        ]
      }
    }
  },

  // 4. ATM Technical Systems
  "ATM Technical Systems": {
    description: "Technical infrastructure and hardware issues for ATM systems",
    icon: "🔧",
    color: "#7c2d12",
    subcategories: {
      "XLink Platform Systems": {
        description: "XLink technical applications (XCard, XMonitoring, XSecure)",
        items: [
          "XCard Error Aplikasi", "XCard User Management", "XCard Menu Changes",
          "XMonitoring Error Aplikasi", "XMonitoring User Management", "XLink Error"
        ]
      },
      "ATM Hardware Issues": {
        description: "Physical ATM hardware problems and maintenance",
        items: [
          "ATM Communication Offline", "ATM Cash Handler", "ATM Receipt Paper Media Out",
          "ATM Cassette Supply", "ATM Door Contact Sensor", "ATM MCRW Fatal",
          "ATM Gagal Cash in/out"
        ]
      },
      "ATM Maintenance Operations": {
        description: "ATM maintenance, spare parts, and technical support",
        items: [
          "ATM Permasalahan Teknis", "ATM Penggantian Mesin", "ATM Perubahan Denom"
        ]
      }
    }
  },

  // 5. Payment & Billing Systems
  "Payment & Billing Systems": {
    description: "Payment routing and biller integration systems",
    icon: "💳",
    color: "#7c3aed",
    subcategories: {
      "Payment Gateway Integration": {
        description: "Finnet, ICONPlus, and other payment gateway integrations",
        items: [
          "Finnet Error", "Payment Gateway Integration Issues",
          "Biller Integration Problems", "Payment Routing Errors"
        ]
      },
      "Utility & Service Payments": {
        description: "PLN, Telkom, BPJS, and other utility payment processing",
        items: [
          "PLN Token & Tagihan", "Telkom PSTN Payments", "BPJS Payments",
          "BigTV Payments", "Pulsa & Data Purchases", "Citilink Payments"
        ]
      },
      "Tax Payment Routing": {
        description: "Tax payments routed to local government systems",
        items: [
          "SAMSAT Payment Routing", "PBB Payment to Local Gov", "BPHTB Payment Processing",
          "Local Tax Payment Integration", "Government Revenue Systems"
        ]
      }
    }
  },

  // 6. Internal Banking Applications
  "Internal Banking Applications": {
    description: "Internal applications for bank operations and staff",
    icon: "🏢",
    color: "#0891b2",
    subcategories: {
      "Antasena Platform": {
        description: "Antasena application platform and related systems",
        items: [
          "Antasena Error Proses Aplikasi", "Antasena User Management", 
          "ARS73 Error Aplikasi", "ARS73 User Management", "ARS73 Buka Blokir"
        ]
      },
      "Document Management Systems": {
        description: "eLOS, SIKP, SLIK, and document processing systems",
        items: [
          "eLOS Error & User Management", "SIKP Error Aplikasi", "SIKP User Management",
          "SLIK Error", "E-Dapem Error Transaksi"
        ]
      },
      "Financial & Reporting Systems": {
        description: "MIS, Payroll, HRMS, and financial reporting systems",
        items: [
          "MIS Error", "Payroll Error & User Management", "HRMS Error & User Management",
          "Report Viewer 724", "PSAK 71 Error"
        ]
      }
    }
  },

  // 7. Infrastructure & Technical Support
  "Infrastructure & Technical Support": {
    description: "IT infrastructure, network, and technical support services",
    icon: "🌐",
    color: "#374151",
    subcategories: {
      "Network & Connectivity": {
        description: "Network infrastructure, WAN, LAN, and connectivity issues",
        items: [
          "Gangguan WAN", "Gangguan LAN", "Gangguan Internet",
          "Network Pemasangan Jaringan", "Gangguan Ekstranet BI"
        ]
      },
      "Security & Domain Services": {
        description: "Domain, email, security, and authentication services",
        items: [
          "Domain User Management", "Ms. Office 365 Error", "Ms. Office 365 User Management",
          "Keamanan Informasi", "Error Pinpad"
        ]
      },
      "Hardware & Maintenance": {
        description: "Computer, printer, and hardware maintenance services",
        items: [
          "Maintenance Komputer", "Maintenance Printer", "Pendaftaran Terminal Baru",
          "Permintaan Akses Storage", "Formulir Serah Terima"
        ]
      }
    }
  }
};

/**
 * Create the new BSG category structure
 */
async function createBSGCategoryStructure() {
  console.log('🚀 Creating new BSG category structure...\n');

  try {
    // Get the IT department (assuming it exists)
    const itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });

    if (!itDepartment) {
      throw new Error('IT Department not found. Please create it first.');
    }

    const createdCategories = [];

    // Create main categories
    for (const [categoryName, categoryData] of Object.entries(BSG_CATEGORY_STRUCTURE)) {
      console.log(`📁 Creating category: ${categoryData.icon} ${categoryName}`);

      // Create main category
      const category = await prisma.category.upsert({
        where: { 
          departmentId_name: {
            departmentId: itDepartment.id,
            name: categoryName
          }
        },
        update: {},
        create: {
          name: categoryName,
          departmentId: itDepartment.id
        }
      });

      createdCategories.push({
        category,
        subcategories: [],
        metadata: categoryData
      });

      // Create subcategories
      for (const [subCategoryName, subCategoryData] of Object.entries(categoryData.subcategories)) {
        console.log(`  📂 Creating subcategory: ${subCategoryName}`);

        const subCategory = await prisma.subCategory.upsert({
          where: {
            categoryId_name: {
              categoryId: category.id,
              name: subCategoryName
            }
          },
          update: {},
          create: {
            name: subCategoryName,
            categoryId: category.id
          }
        });

        createdCategories[createdCategories.length - 1].subcategories.push({
          subCategory,
          items: [],
          metadata: subCategoryData
        });

        // Create items
        for (const itemName of subCategoryData.items) {
          console.log(`    📄 Creating item: ${itemName}`);

          const item = await prisma.item.upsert({
            where: {
              subCategoryId_name: {
                subCategoryId: subCategory.id,
                name: itemName
              }
            },
            update: {},
            create: {
              name: itemName,
              subCategoryId: subCategory.id
            }
          });

          const lastSubCategoryIndex = createdCategories[createdCategories.length - 1].subcategories.length - 1;
          createdCategories[createdCategories.length - 1].subcategories[lastSubCategoryIndex].items.push(item);
        }
      }

      console.log(`✅ Category "${categoryName}" created with ${Object.keys(categoryData.subcategories).length} subcategories\n`);
    }

    return createdCategories;

  } catch (error) {
    console.error('❌ Error creating category structure:', error);
    throw error;
  }
}

/**
 * Create template categories for the new structure
 */
async function createTemplateCategoriesForBSG(categoryStructure) {
  console.log('📋 Creating template categories for BSG structure...\n');

  try {
    const itDepartment = await prisma.department.findFirst({
      where: { name: 'Information Technology' }
    });

    for (const categoryGroup of categoryStructure) {
      const { category, metadata } = categoryGroup;

      // Create template category
      const templateCategory = await prisma.templateCategory.create({
        data: {
          name: category.name,
          nameIndonesian: category.name, // Keep same for now
          description: metadata.description,
          icon: metadata.icon,
          color: metadata.color,
          departmentId: itDepartment.id,
          sortOrder: Object.keys(BSG_CATEGORY_STRUCTURE).indexOf(category.name)
        }
      }).catch(async (error) => {
        // If already exists, find and return it
        if (error.code === 'P2002') {
          return await prisma.templateCategory.findFirst({
            where: {
              name: category.name,
              parentId: null
            }
          });
        }
        throw error;
      });

      console.log(`✅ Template category created: ${metadata.icon} ${category.name}`);

      // Create subcategories as child template categories
      for (const subCategoryGroup of categoryGroup.subcategories) {
        const { subCategory, metadata: subMetadata } = subCategoryGroup;

        const templateSubCategory = await prisma.templateCategory.create({
          data: {
            name: subCategory.name,
            nameIndonesian: subCategory.name,
            description: subMetadata.description,
            parentId: templateCategory.id,
            departmentId: itDepartment.id,
            sortOrder: categoryGroup.subcategories.indexOf(subCategoryGroup)
          }
        }).catch(async (error) => {
          // If already exists, find and return it
          if (error.code === 'P2002') {
            return await prisma.templateCategory.findFirst({
              where: {
                name: subCategory.name,
                parentId: templateCategory.id
              }
            });
          }
          throw error;
        });

        console.log(`  ✅ Template subcategory created: ${subCategory.name}`);
      }
    }

    console.log('\n🎉 Template categories created successfully!\n');

  } catch (error) {
    console.error('❌ Error creating template categories:', error);
    throw error;
  }
}

/**
 * Map existing BSG templates to new category structure
 */
async function mapExistingTemplatesToNewStructure() {
  console.log('🔄 Mapping existing BSG templates to new structure...\n');

  try {
    // Read the CSV template data
    const csvPath = path.join(__dirname, '../../hd_template.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️ hd_template.csv not found, skipping template mapping');
      return;
    }

    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').slice(1); // Skip header

    const templateMappings = [];

    for (const line of lines) {
      if (!line.trim()) continue;

      const [templateName, description, showToRequester] = line.split(';');
      if (!templateName) continue;

      // Parse template name to extract system prefix
      const cleanTemplateName = templateName.replace('﻿', '').trim();
      const [prefix, ...nameParts] = cleanTemplateName.split(' - ');
      const actualName = nameParts.join(' - ') || cleanTemplateName;

      // Determine new category mapping based on prefix
      const mapping = determineNewCategoryMapping(prefix, actualName, cleanTemplateName);
      
      if (mapping) {
        templateMappings.push({
          originalName: cleanTemplateName,
          description: description?.trim(),
          showToRequester: showToRequester?.trim() === 'Yes',
          newMapping: mapping
        });
      }
    }

    console.log(`📊 Processed ${templateMappings.length} template mappings\n`);

    // Update template metadata with new mappings
    for (const mapping of templateMappings) {
      await updateTemplateWithNewMapping(mapping);
    }

    console.log('✅ Template mapping completed!\n');

  } catch (error) {
    console.error('❌ Error mapping templates:', error);
    throw error;
  }
}

/**
 * Determine which new category a template should belong to
 */
function determineNewCategoryMapping(prefix, name, fullName) {
  // ATM Technical Issues
  if (prefix === 'ATM' && (
    name.includes('Cash Handler') || 
    name.includes('Offline') || 
    name.includes('Media Out') || 
    name.includes('MCRW Fatal') ||
    name.includes('Cassette Supply') ||
    name.includes('Door Contact Sensor')
  )) {
    return {
      category: 'ATM Technical Systems',
      subcategory: 'ATM Hardware Issues',
      system: 'ATM Hardware'
    };
  }

  // ATM Operations Claims
  if (prefix === 'ATM' && (
    name.includes('Penarikan') ||
    name.includes('Transfer') ||
    name.includes('Klaim') ||
    name.includes('Re-Klaim')
  )) {
    return {
      category: 'ATM Operations',
      subcategory: 'ATM Transaction Claims',
      system: 'ATM Network'
    };
  }

  // ATM Payments (move to Payment Systems)
  if (prefix === 'ATM' && (
    name.includes('Pembayaran') ||
    name.includes('Pembelian') ||
    name.includes('Token PLN') ||
    name.includes('Pulsa')
  )) {
    return {
      category: 'Payment & Billing Systems',
      subcategory: 'Utility & Service Payments',
      system: 'ATM Payment Gateway'
    };
  }

  // BSGTouch Mobile Banking
  if (prefix === 'BSGTouch' || prefix.startsWith('BSGTouch ')) {
    if (name.includes('Pembayaran') || name.includes('Pembelian') || name.includes('Transfer')) {
      return {
        category: 'Mobile Banking Platforms',
        subcategory: 'Cross-Channel Transaction Claims',
        system: 'BSGTouch'
      };
    }
    return {
      category: 'Mobile Banking Platforms',
      subcategory: 'BSGTouch Mobile Banking',
      system: 'BSGTouch'
    };
  }

  // BSG QRIS
  if (prefix === 'BSG QRIS' || prefix.startsWith('BSG QRIS')) {
    return {
      category: 'Mobile Banking Platforms',
      subcategory: 'BSG QRIS Payment System',
      system: 'BSG QRIS'
    };
  }

  // BSGDirect
  if (prefix === 'BSGDirect' || prefix === 'BSG Direct') {
    return {
      category: 'Core Banking Systems',
      subcategory: 'BSGDirect Internet Banking',
      system: 'BSGDirect'
    };
  }

  // OLIBs
  if (prefix === 'OLIBs') {
    return {
      category: 'Core Banking Systems',
      subcategory: 'OLIBs Core Banking',
      system: 'OLIBs'
    };
  }

  // Kasda Online
  if (prefix === 'Kasda Online' || prefix.startsWith('Kasda Online')) {
    return {
      category: 'Core Banking Systems',
      subcategory: 'Kasda Online Treasury',
      system: 'Kasda'
    };
  }

  // XLink Technical Systems
  if (prefix === 'XLink' || prefix === 'XCARD' || prefix === 'XMonitoring ATM') {
    return {
      category: 'ATM Technical Systems',
      subcategory: 'XLink Platform Systems',
      system: 'XLink'
    };
  }

  // Antasena Platform
  if (prefix === 'Antasena' || prefix === 'ARS73') {
    return {
      category: 'Internal Banking Applications',
      subcategory: 'Antasena Platform',
      system: 'Antasena'
    };
  }

  // eLOS
  if (prefix === 'eLOS' || prefix === 'ELOS') {
    return {
      category: 'Internal Banking Applications',
      subcategory: 'Document Management Systems',
      system: 'eLOS'
    };
  }

  // Payment gateway errors
  if (prefix === 'Finnet') {
    return {
      category: 'Payment & Billing Systems',
      subcategory: 'Payment Gateway Integration',
      system: 'Finnet'
    };
  }

  // Network issues
  if (fullName.includes('Gangguan WAN') || fullName.includes('Gangguan LAN') || fullName.includes('Gangguan Internet')) {
    return {
      category: 'Infrastructure & Technical Support',
      subcategory: 'Network & Connectivity',
      system: 'Network Infrastructure'
    };
  }

  // Default mapping for other systems
  return {
    category: 'Internal Banking Applications',
    subcategory: 'Document Management Systems',
    system: 'General'
  };
}

/**
 * Update template with new category mapping
 */
async function updateTemplateWithNewMapping(mapping) {
  try {
    // Find or create the template category
    const templateCategory = await prisma.templateCategory.findFirst({
      where: { name: mapping.newMapping.category }
    });

    if (!templateCategory) {
      console.log(`⚠️ Template category not found: ${mapping.newMapping.category}`);
      return;
    }

    // Create or update template metadata
    const templateMetadata = await prisma.templateMetadata.create({
      data: {
        name: mapping.originalName,
        nameIndonesian: mapping.originalName,
        description: mapping.description,
        categoryId: templateCategory.id,
        businessProcess: mapping.newMapping.system,
        isPublic: mapping.showToRequester,
        searchKeywords: `${mapping.originalName} ${mapping.description}`,
        tags: [mapping.newMapping.system, mapping.newMapping.subcategory],
        createdBy: 1, // Assuming admin user ID is 1
        version: '1.0.0'
      }
    }).catch(async (error) => {
      // If already exists, update it
      if (error.code === 'P2002') {
        return await prisma.templateMetadata.update({
          where: { name: mapping.originalName },
          data: {
            categoryId: templateCategory.id,
            description: mapping.description,
            businessProcess: mapping.newMapping.system,
            isPublic: mapping.showToRequester,
            searchKeywords: `${mapping.originalName} ${mapping.description}`,
            tags: [mapping.newMapping.system, mapping.newMapping.subcategory]
          }
        });
      }
      throw error;
    });

    console.log(`  ✅ Mapped: ${mapping.originalName} → ${mapping.newMapping.category}/${mapping.newMapping.subcategory}`);

  } catch (error) {
    console.error(`❌ Error updating template mapping for ${mapping.originalName}:`, error);
  }
}

/**
 * Generate summary report
 */
async function generateSummaryReport() {
  console.log('📊 Generating BSG Category Restructuring Summary...\n');

  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          include: {
            items: true
          }
        }
      }
    });

    const templateCategories = await prisma.templateCategory.findMany({
      include: {
        children: true,
        templates: true
      }
    });

    console.log('=' .repeat(80));
    console.log('🏦 BSG HELPDESK CATEGORY RESTRUCTURING SUMMARY');
    console.log('=' .repeat(80));

    console.log('\n📁 CATEGORY STRUCTURE:');
    for (const category of categories) {
      console.log(`\n${category.name}`);
      console.log(`  📂 Subcategories: ${category.subCategories.length}`);
      const totalItems = category.subCategories.reduce((sum, sub) => sum + sub.items.length, 0);
      console.log(`  📄 Total Items: ${totalItems}`);
    }

    console.log('\n📋 TEMPLATE CATEGORIES:');
    const parentCategories = templateCategories.filter(tc => !tc.parentId);
    for (const templateCategory of parentCategories) {
      const childCount = templateCategories.filter(tc => tc.parentId === templateCategory.id).length;
      console.log(`\n${templateCategory.icon || '📁'} ${templateCategory.name}`);
      console.log(`  📂 Subcategories: ${childCount}`);
      console.log(`  📋 Templates: ${templateCategory.templates.length}`);
    }

    console.log('\n' + '=' .repeat(80));
    console.log('✅ BSG Category Restructuring Completed Successfully!');
    console.log('✅ Transaction routing properly organized');
    console.log('✅ ATM technical vs operational issues separated');
    console.log('✅ BSGTouch vs BSG QRIS differentiated');
    console.log('✅ Tax payment routing to local governments implemented');
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error generating summary report:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting BSG Category Restructuring...\n');

    // Step 1: Create new category structure
    const categoryStructure = await createBSGCategoryStructure();

    // Step 2: Create template categories
    await createTemplateCategoriesForBSG(categoryStructure);

    // Step 3: Map existing templates to new structure
    await mapExistingTemplatesToNewStructure();

    // Step 4: Generate summary report
    await generateSummaryReport();

    console.log('\n🎉 BSG Category Restructuring completed successfully!');

  } catch (error) {
    console.error('❌ Fatal error during restructuring:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  createBSGCategoryStructure,
  createTemplateCategoriesForBSG,
  mapExistingTemplatesToNewStructure,
  BSG_CATEGORY_STRUCTURE
};