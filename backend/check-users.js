const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['admin', 'manager']
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      },
      take: 10
    });
    
    console.log('Admin and Manager users:');
    users.forEach(user => {
      console.log(`${user.id}: ${user.username} (${user.email}) - ${user.role}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();