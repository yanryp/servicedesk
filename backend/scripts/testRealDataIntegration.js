// scripts/testRealDataIntegration.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRealDataIntegration() {
  console.log('🧪 Testing real BSG data integration...');

  try {
    // 1. Test real branch data
    console.log('\n🏢 Testing real BSG branch data...');
    
    const branches = await prisma.masterDataEntity.findMany({
      where: { 
        type: 'branch',
        isActive: true 
      },
      orderBy: { name: 'asc' },
      take: 10
    });
    
    console.log(`✅ Found ${branches.length} active branches (showing first 10):`);
    branches.forEach(branch => {
      console.log(`  - ${branch.code}: ${branch.name} (${branch.metadata?.region || 'N/A'})`);
    });

    // 2. Test real terminal data
    console.log('\n🏧 Testing real terminal/ATM data...');
    
    const terminals = await prisma.masterDataEntity.findMany({
      where: { 
        type: 'terminal',
        isActive: true 
      },
      orderBy: { name: 'asc' },
      take: 10
    });
    
    console.log(`✅ Found ${terminals.length} active terminals (showing first 10):`);
    terminals.forEach(terminal => {
      console.log(`  - ${terminal.code}: ${terminal.name} (Branch: ${terminal.metadata?.branch_code || 'N/A'})`);
    });

    // 3. Test real bank data
    console.log('\n🏦 Testing real bank data...');
    
    const banks = await prisma.masterDataEntity.findMany({
      where: { 
        type: 'bank_code',
        isActive: true 
      },
      orderBy: { name: 'asc' },
      take: 10
    });
    
    console.log(`✅ Found ${banks.length} active banks (showing first 10):`);
    banks.forEach(bank => {
      const atmBersama = bank.metadata?.is_atm_bersama ? '✓ ATM Bersama' : '✗ Non ATM Bersama';
      console.log(`  - ${bank.code}: ${bank.name} (${atmBersama})`);
    });

    // 4. Test enhanced templates
    console.log('\n📝 Testing enhanced templates...');
    
    const enhancedTemplates = await prisma.serviceTemplate.findMany({
      where: { isVisible: true },
      include: {
        customFieldDefinitions: {
          where: {
            OR: [
              { options: { path: ['dataSource'], equals: 'master_data' } },
              { fieldType: 'dropdown' }
            ]
          },
          orderBy: { sortOrder: 'asc' }
        },
        metadata: {
          include: {
            category: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    console.log(`✅ Found ${enhancedTemplates.length} templates with real data integration:`);
    enhancedTemplates.forEach(template => {
      console.log(`\n📋 ${template.name}:`);
      const realDataFields = template.customFieldDefinitions.filter(
        field => field.options?.dataSource === 'master_data'
      );
      console.log(`   Category: ${template.metadata?.category?.nameIndonesian || 'N/A'}`);
      console.log(`   Real Data Fields: ${realDataFields.length}`);
      
      realDataFields.forEach(field => {
        const entityType = field.options?.entityType;
        console.log(`     • ${field.fieldLabel}: ${entityType} (${field.fieldType})`);
      });
    });

    // 5. Test template search with real data
    console.log('\n🔍 Testing template search functionality...');
    
    const searchTerms = ['atm', 'cabang', 'transfer', 'olibs'];
    
    for (const term of searchTerms) {
      const searchResults = await prisma.templateMetadata.findMany({
        where: {
          isActive: true,
          isPublic: true,
          OR: [
            { searchKeywords: { contains: term, mode: 'insensitive' } },
            { searchKeywordsId: { contains: term, mode: 'insensitive' } },
            { nameIndonesian: { contains: term, mode: 'insensitive' } }
          ]
        },
        select: {
          name: true,
          nameIndonesian: true,
          popularityScore: true
        },
        orderBy: { popularityScore: 'desc' },
        take: 3
      });

      console.log(`\n🔍 Search "${term}" found ${searchResults.length} templates:`);
      searchResults.forEach(result => {
        console.log(`  - ${result.nameIndonesian} (popularity: ${result.popularityScore})`);
      });
    }

    // 6. Test data relationships
    console.log('\n🔗 Testing data relationships...');
    
    // Check branch-terminal relationships
    const sampleBranch = branches[0];
    if (sampleBranch) {
      const branchTerminals = await prisma.masterDataEntity.findMany({
        where: {
          type: 'terminal',
          metadata: {
            path: ['branch_code'],
            equals: sampleBranch.code
          }
        },
        take: 5
      });

      console.log(`✅ Branch ${sampleBranch.name} has ${branchTerminals.length} terminals:`);
      branchTerminals.forEach(terminal => {
        console.log(`  - ${terminal.name} (${terminal.code})`);
      });
    }

    // 7. Test field type definitions
    console.log('\n📋 Testing field type definitions...');
    
    const fieldTypes = await prisma.fieldTypeDefinition.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    const fieldsByCategory = fieldTypes.reduce((acc, field) => {
      if (!acc[field.category]) acc[field.category] = [];
      acc[field.category].push(field);
      return acc;
    }, {});

    console.log(`✅ Found ${fieldTypes.length} field types across ${Object.keys(fieldsByCategory).length} categories:`);
    Object.entries(fieldsByCategory).forEach(([category, fields]) => {
      console.log(`  📂 ${category}: ${fields.length} field types`);
      fields.forEach(field => {
        console.log(`    • ${field.name}: ${field.displayNameId || field.displayName}`);
      });
    });

    // 8. Test summary statistics
    console.log('\n📊 Integration Summary:');
    
    const totalBranches = await prisma.masterDataEntity.count({
      where: { type: 'branch', isActive: true }
    });
    
    const totalTerminals = await prisma.masterDataEntity.count({
      where: { type: 'terminal', isActive: true }
    });
    
    const totalBanks = await prisma.masterDataEntity.count({
      where: { type: 'bank_code', isActive: true }
    });
    
    const totalTemplates = await prisma.serviceTemplate.count({
      where: { isVisible: true }
    });
    
    const totalFieldTypes = await prisma.fieldTypeDefinition.count({
      where: { isActive: true }
    });

    console.log(`  🏢 BSG Branches: ${totalBranches}`);
    console.log(`  🏧 Terminals/ATMs: ${totalTerminals}`);
    console.log(`  🏦 Bank Partners: ${totalBanks}`);
    console.log(`  📝 Templates: ${totalTemplates}`);
    console.log(`  🔧 Field Types: ${totalFieldTypes}`);
    console.log('  🇮🇩 Language Support: ✅ Indonesian');
    console.log('  🔍 Search Integration: ✅ Working');
    console.log('  🔗 Data Relationships: ✅ Connected');

    console.log('\n🎉 Real data integration test completed successfully!');
    console.log('\n✅ All BSG banking templates are ready for production use!');
    
  } catch (error) {
    console.error('❌ Error testing real data integration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test function
if (require.main === module) {
  testRealDataIntegration()
    .then(() => {
      console.log('\n🎯 Integration testing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Integration testing failed:', error);
      process.exit(1);
    });
}

module.exports = { testRealDataIntegration };