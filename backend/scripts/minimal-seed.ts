// Minimal seed script to create essential users and departments
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function minimalSeed() {
  console.log('🌱 Starting minimal database seeding...');

  try {
    // Create departments
    const itDept = await prisma.department.create({
      data: {
        name: 'Information Technology',
        description: 'IT support and technical services',
        departmentType: 'internal',
        isServiceOwner: true
      }
    });

    const supportDept = await prisma.department.create({
      data: {
        name: 'Dukungan dan Layanan',
        description: 'Customer support and service department',
        departmentType: 'business',
        isServiceOwner: true
      }
    });

    console.log('✅ Created departments');

    // Create users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const techPassword = await bcrypt.hash('tech123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@company.com',
        passwordHash: hashedPassword,
        role: 'admin',
        departmentId: itDept.id,
        isAvailable: true,
        isKasdaUser: false
      }
    });

    const technician = await prisma.user.create({
      data: {
        username: 'it.technician',
        email: 'it.technician@company.com',
        passwordHash: techPassword,
        role: 'technician',
        departmentId: itDept.id,
        isAvailable: true,
        isKasdaUser: false,
        primarySkill: 'Technical Support'
      }
    });

    const kasdaUser = await prisma.user.create({
      data: {
        username: 'kasda.user',
        email: 'kasda.user@company.com',
        passwordHash: userPassword,
        role: 'requester',
        departmentId: supportDept.id,
        isAvailable: true,
        isKasdaUser: true
      }
    });

    // Create manager user for approval workflow
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.create({
      data: {
        username: 'branch.manager',
        email: 'branch.manager@company.com',
        passwordHash: managerPassword,
        role: 'manager',
        departmentId: supportDept.id,
        isAvailable: true,
        isKasdaUser: false
      }
    });

    // Create KASDA technician for proper routing
    const kasdaTechPassword = await bcrypt.hash('kasda123', 10);
    const kasdaTechnician = await prisma.user.create({
      data: {
        username: 'kasda.technician',
        email: 'kasda.technician@company.com',
        passwordHash: kasdaTechPassword,
        role: 'technician',
        departmentId: supportDept.id,
        isAvailable: true,
        isKasdaUser: true,
        primarySkill: 'KASDA Support'
      }
    });

    console.log('✅ Created users');

    // Create BSG template categories
    const kasdaCategory = await prisma.bSGTemplateCategory.create({
      data: {
        name: 'KASDA',
        displayName: 'KASDA (Regional Treasury)',
        description: 'Government treasury system templates',
        icon: 'building-office',
        sortOrder: 1,
        isActive: true
      }
    });

    const atmCategory = await prisma.bSGTemplateCategory.create({
      data: {
        name: 'ATM',
        displayName: 'ATM',
        description: 'ATM system templates',
        icon: 'credit-card',
        sortOrder: 2,
        isActive: true
      }
    });

    console.log('✅ Created BSG categories');

    // Create BSG field types
    const textFieldType = await prisma.bSGFieldType.create({
      data: {
        name: 'text',
        displayName: 'Text Input',
        htmlInputType: 'text',
        isActive: true
      }
    });

    const dropdownBranchType = await prisma.bSGFieldType.create({
      data: {
        name: 'dropdown_branch',
        displayName: 'Branch Dropdown',
        htmlInputType: 'select',
        isActive: true
      }
    });

    console.log('✅ Created BSG field types');

    // Create a sample BSG template
    const kasdaTemplate = await prisma.bSGTemplate.create({
      data: {
        categoryId: kasdaCategory.id,
        name: 'KASDA User Management',
        displayName: 'KASDA User Management',
        description: 'Regional treasury user management template',
        templateNumber: 1,
        isActive: true,
        popularityScore: 50,
        usageCount: 0
      }
    });

    // Add fields to the template
    await prisma.bSGTemplateField.create({
      data: {
        templateId: kasdaTemplate.id,
        fieldTypeId: dropdownBranchType.id,
        fieldName: 'Unit',
        fieldLabel: 'Cabang/Capem',
        fieldDescription: 'Select branch or unit',
        isRequired: true,
        sortOrder: 1,
        placeholderText: 'Select branch...'
      }
    });

    await prisma.bSGTemplateField.create({
      data: {
        templateId: kasdaTemplate.id,
        fieldTypeId: textFieldType.id,
        fieldName: 'Nama Nasabah',
        fieldLabel: 'Nama Nasabah',
        fieldDescription: 'Customer name',
        isRequired: true,
        sortOrder: 2,
        placeholderText: 'Enter customer name'
      }
    });

    console.log('✅ Created BSG templates and fields');

    // Create master data for branches/units
    await prisma.bSGMasterData.create({
      data: {
        dataType: 'unit',
        code: 'DEPT_14',
        name: 'Information Technology',
        displayName: 'Dept: Information Technology',
        isActive: true,
        sortOrder: 1
      }
    });

    await prisma.bSGMasterData.create({
      data: {
        dataType: 'unit',
        code: 'DEPT_15',
        name: 'Dukungan dan Layanan',
        displayName: 'Dept: Dukungan dan Layanan',
        isActive: true,
        sortOrder: 2
      }
    });

    console.log('✅ Created master data');

    console.log('🎉 Minimal seeding completed successfully!');
    console.log('Users created:');
    console.log('  - admin@company.com (admin123)');
    console.log('  - it.technician@company.com (tech123)');
    console.log('  - kasda.user@company.com (user123)');
    console.log('  - branch.manager@company.com (manager123)');
    console.log('  - kasda.technician@company.com (kasda123)');

  } catch (error) {
    console.error('❌ Error during minimal seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

minimalSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });