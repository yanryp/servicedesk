const { exec } = require('child_process');

const script = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    });
    
    console.log('Users in system:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
`;

require('fs').writeFileSync('backend/check-users-temp.js', script);

exec('cd backend && node check-users-temp.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  console.log(stdout);
  
  // Clean up
  require('fs').unlinkSync('backend/check-users-temp.js');
});