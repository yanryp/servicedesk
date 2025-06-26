#!/usr/bin/env npx ts-node

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function fixUserDepartmentAssignments() {
  console.log('🔧 Fixing user department assignments...\n');

  try {
    // 1. Fix kotamobagu.user - should be in branch, not department
    // Branch users should not be assigned to a specific department
    console.log('1️⃣ Fixing kotamobagu.user assignment...');
    
    await prisma.user.update({
      where: { email: 'kotamobagu.user@company.com' },
      data: {
        departmentId: null, // Branch users should not have a department
        unitId: 7 // Cabang Kotamobagu
      }
    });
    console.log('   ✅ kotamobagu.user now in Cabang Kotamobagu (no department)');

    // 2. Also fix utama.user for consistency
    await prisma.user.update({
      where: { email: 'utama.user@company.com' },
      data: {
        departmentId: null, // Branch users should not have a department
        unitId: 5 // Cabang Utama
      }
    });
    console.log('   ✅ utama.user now in Cabang Utama (no department)');

    // 3. Create a proper Dukungan dan Layanan technician for KASDA tickets
    console.log('\n2️⃣ Creating Dukungan dan Layanan technician...');
    
    const hashedPassword = await bcrypt.hash('technician123', 10);
    
    const dukunganTechnician = await prisma.user.upsert({
      where: { email: 'dukungan.technician@company.com' },
      update: {
        passwordHash: hashedPassword,
        role: 'technician',
        departmentId: 2, // Dukungan dan Layanan
        unitId: 4, // Dukungan dan Layanan unit
        primarySkill: 'KASDA Support',
        secondarySkills: 'BSGDirect User Management, Treasury Systems',
        isAvailable: true
      },
      create: {
        username: 'dukungan.technician',
        email: 'dukungan.technician@company.com',
        passwordHash: hashedPassword,
        role: 'technician',
        departmentId: 2, // Dukungan dan Layanan
        unitId: 4, // Dukungan dan Layanan unit
        primarySkill: 'KASDA Support',
        secondarySkills: 'BSGDirect User Management, Treasury Systems',
        isAvailable: true,
        workloadCapacity: 15
      }
    });
    console.log('   ✅ dukungan.technician created/updated');

    // 4. Create KASDA category for proper routing
    console.log('\n3️⃣ Creating KASDA category...');
    
    const kasdaCategory = await prisma.bSGTemplateCategory.upsert({
      where: { name: 'KASDA' },
      update: {
        displayName: 'KASDA (Regional Treasury)',
        description: 'Regional treasury system templates and user management'
      },
      create: {
        name: 'KASDA',
        displayName: 'KASDA (Regional Treasury)',
        description: 'Regional treasury system templates and user management',
        isActive: true,
        sortOrder: 2
      }
    });
    console.log('   ✅ KASDA category created/updated');

    // 5. Create a KASDA template for testing
    const kasdaTemplate = await prisma.bSGTemplate.upsert({
      where: {
        categoryId_templateNumber: {
          categoryId: kasdaCategory.id,
          templateNumber: 1
        }
      },
      update: {
        name: 'KASDA User Management',
        displayName: 'KASDA User Management',
        description: 'User management for regional treasury system'
      },
      create: {
        name: 'KASDA User Management',
        displayName: 'KASDA User Management',
        description: 'User management for regional treasury system',
        categoryId: kasdaCategory.id,
        templateNumber: 1,
        isActive: true
      }
    });

    // Add fields to KASDA template
    await prisma.bSGTemplateField.upsert({
      where: {
        templateId_fieldName: {
          templateId: kasdaTemplate.id,
          fieldName: 'user_action'
        }
      },
      update: {
        fieldLabel: 'User Action',
        isRequired: true
      },
      create: {
        templateId: kasdaTemplate.id,
        fieldTypeId: 1,
        fieldName: 'user_action',
        fieldLabel: 'User Action',
        fieldDescription: 'Action to perform (Create, Modify, Deactivate)',
        isRequired: true,
        sortOrder: 1,
        placeholderText: 'e.g., Create new user'
      }
    });

    await prisma.bSGTemplateField.upsert({
      where: {
        templateId_fieldName: {
          templateId: kasdaTemplate.id,
          fieldName: 'treasury_unit'
        }
      },
      update: {
        fieldLabel: 'Treasury Unit',
        isRequired: true
      },
      create: {
        templateId: kasdaTemplate.id,
        fieldTypeId: 1,
        fieldName: 'treasury_unit',
        fieldLabel: 'Treasury Unit',
        fieldDescription: 'Regional treasury unit name',
        isRequired: true,
        sortOrder: 2,
        placeholderText: 'e.g., Treasury Kotamobagu'
      }
    });

    console.log('   ✅ KASDA template created with fields');

    // 6. Verify the setup
    console.log('\n4️⃣ Verifying setup...');
    
    const kotamobagiUserFixed = await prisma.user.findUnique({
      where: { email: 'kotamobagu.user@company.com' },
      include: { unit: true, department: true }
    });

    const dukunganTech = await prisma.user.findUnique({
      where: { email: 'dukungan.technician@company.com' },
      include: { unit: true, department: true }
    });

    console.log('\n📊 Final Setup:');
    console.log(`   kotamobagu.user: ${kotamobagiUserFixed?.unit?.name} / ${kotamobagiUserFixed?.department?.name || 'No Department'}`);
    console.log(`   dukungan.technician: ${dukunganTech?.unit?.name} / ${dukunganTech?.department?.name}`);
    console.log(`   KASDA category ID: ${kasdaCategory.id}`);
    console.log(`   KASDA template ID: ${kasdaTemplate.id}`);

    console.log('\n✨ User department assignments fixed!');
    console.log('\n📋 Summary:');
    console.log('   • Branch users (kotamobagu.user, utama.user) are now in their branches without departments');
    console.log('   • Created dukungan.technician for KASDA ticket processing');
    console.log('   • OLIBS tickets go to IT Operations (it.technician)');
    console.log('   • KASDA tickets go to Dukungan dan Layanan (dukungan.technician)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserDepartmentAssignments();