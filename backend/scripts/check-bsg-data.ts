import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBSGData() {
  try {
    const bsgCategories = await prisma.bSGTemplateCategory.findMany({
      orderBy: { name: 'asc' },
      include: { 
        _count: { 
          select: { templates: true } 
        } 
      }
    });
    
    console.log('📂 BSG Template Categories:');
    bsgCategories.forEach((cat: any) => {
      console.log(`   - ${cat.name}: ${cat._count.templates} templates`);
    });
    
    const totalTemplates = await prisma.bSGTemplate.count();
    console.log(`\n📊 Total BSG Templates: ${totalTemplates}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBSGData();