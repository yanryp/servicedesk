import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function generateServiceMapping() {
  try {
    console.log('🎯 COMPREHENSIVE SERVICE MAPPING REPORT');
    console.log('=====================================');
    
    const departments = await prisma.department.findMany({
      include: {
        serviceCatalog: {
          include: {
            serviceItems: {
              orderBy: { name: 'asc' }
            }
          },
          orderBy: { name: 'asc' }
        },
        users: {
          select: { 
            id: true, 
            name: true, 
            role: true, 
            email: true,
            primarySkill: true,
            experienceLevel: true
          },
          orderBy: { role: 'asc' }
        },
        units: {
          select: { 
            id: true, 
            name: true, 
            code: true, 
            unitType: true,
            region: true,
            province: true
          },
          orderBy: { code: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    });
    
    departments.forEach((dept, index) => {
      console.log(`\n${index + 1}. 📁 ${dept.name.toUpperCase()} DEPARTMENT`);
      console.log(`   Department Type: ${dept.departmentType}`);
      console.log(`   Service Owner: ${dept.isServiceOwner ? '✅ Yes' : '❌ No'}`);
      console.log(`   Description: ${dept.description || 'N/A'}`);
      
      // Service Catalogs and Items
      console.log(`\n   📋 SERVICE CATALOGS (${dept.serviceCatalog.length} total):`);
      dept.serviceCatalog.forEach((catalog, catIndex) => {
        console.log(`   ${catIndex + 1}. ${catalog.name}`);
        console.log(`      Description: ${catalog.description || 'N/A'}`);
        console.log(`      Service Type: ${catalog.serviceType}`);
        console.log(`      Requires Approval: ${catalog.requiresApproval ? 'Yes' : 'No'}`);
        console.log(`      Business Impact: ${catalog.businessImpact}`);
        console.log(`      Service Items (${catalog.serviceItems.length}):`);
        
        catalog.serviceItems.forEach((item, itemIndex) => {
          console.log(`         ${itemIndex + 1}. ${item.name}`);
        });
        console.log('');
      });
      
      // Users
      console.log(`   👥 ASSIGNED USERS (${dept.users.length} total):`);
      const usersByRole = dept.users.reduce((acc: any, user: any) => {
        if (!acc[user.role]) acc[user.role] = [];
        acc[user.role].push(user);
        return acc;
      }, {});
      
      Object.entries(usersByRole).forEach(([role, users]: [string, any]) => {
        console.log(`   ${role.toUpperCase()} (${users.length}):`);
        users.forEach((user: any) => {
          const skillInfo = user.primarySkill ? ` - ${user.primarySkill} (${user.experienceLevel || 'N/A'})` : '';
          console.log(`      • ${user.name} (${user.email})${skillInfo}`);
        });
      });
      
      // Units (Branches)
      if (dept.units.length > 0) {
        console.log(`\n   🏦 BRANCH ASSIGNMENTS (${dept.units.length} total):`);
        const unitsByType = dept.units.reduce((acc: any, unit: any) => {
          if (!acc[unit.unitType]) acc[unit.unitType] = [];
          acc[unit.unitType].push(unit);
          return acc;
        }, {});
        
        Object.entries(unitsByType).forEach(([type, units]: [string, any]) => {
          console.log(`   ${type} (${units.length}):`);
          units.forEach((unit: any) => {
            console.log(`      • ${unit.name} (${unit.code}) - ${unit.region}, ${unit.province}`);
          });
        });
      }
      
      console.log(`\n   ${'='.repeat(60)}`);
    });
    
    // Summary
    const totalCatalogs = departments.reduce((sum, dept) => sum + dept.serviceCatalog.length, 0);
    const totalItems = departments.reduce((sum, dept) => 
      sum + dept.serviceCatalog.reduce((catSum, cat) => catSum + cat.serviceItems.length, 0), 0);
    const totalUsers = departments.reduce((sum, dept) => sum + dept.users.length, 0);
    const totalUnits = departments.reduce((sum, dept) => sum + dept.units.length, 0);
    
    console.log(`\n📊 SUMMARY STATISTICS:`);
    console.log(`═══════════════════════`);
    console.log(`   🏢 Total Departments: ${departments.length}`);
    console.log(`   📋 Total Service Catalogs: ${totalCatalogs}`);
    console.log(`   📂 Total Service Items: ${totalItems}`);
    console.log(`   👥 Total Users: ${totalUsers}`);
    console.log(`   🏦 Total Branch Units: ${totalUnits}`);
    
    console.log(`\n🎯 DEPARTMENT RESPONSIBILITIES:`);
    console.log(`═══════════════════════════════`);
    console.log(`🔧 INFORMATION TECHNOLOGY:`);
    console.log(`   • Primary Focus: Technical infrastructure and IT support`);
    console.log(`   • Service Areas: Hardware, software, network, employee IT systems`);
    console.log(`   • Coverage: Serves all branches (no specific branch assignments)`);
    console.log(`   • Ticket Types: IT incidents, hardware requests, software issues`);
    
    console.log(`\n🏦 DUKUNGAN DAN LAYANAN:`);
    console.log(`   • Primary Focus: Banking operations and customer services`);
    console.log(`   • Service Areas: Core banking, digital channels, KASDA, claims`);
    console.log(`   • Coverage: All CABANG and CAPEM branches`);
    console.log(`   • Ticket Types: Banking service requests, customer support, government services`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

generateServiceMapping();