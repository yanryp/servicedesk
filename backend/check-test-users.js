const { PrismaClient } = require('@prisma/client');

async function checkTestUsers() {
    const prisma = new PrismaClient();
    
    try {
        console.log('🔍 Checking available test users...\n');
        
        // Check for users with requester role
        const requesters = await prisma.users.findMany({
            where: {
                role: 'requester'
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                unit: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            },
            take: 10
        });
        
        console.log(`Found ${requesters.length} requester users:`);
        requesters.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - Unit: ${user.unit?.name || 'No unit'}`);
        });
        
        // Check for specific test users
        console.log('\n🔍 Looking for specific test users...');
        const testUsers = await prisma.users.findMany({
            where: {
                email: {
                    contains: 'test'
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                unit: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            }
        });
        
        console.log(`Found ${testUsers.length} test users:`);
        testUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Unit: ${user.unit?.name || 'No unit'}`);
        });
        
        // Check for users from BSG 
        console.log('\n🔍 Looking for BSG users...');
        const bsgUsers = await prisma.users.findMany({
            where: {
                email: {
                    contains: 'bsg.co.id'
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                unit: {
                    select: {
                        name: true,
                        code: true
                    }
                }
            },
            take: 5
        });
        
        console.log(`Found ${bsgUsers.length} BSG users (showing first 5):`);
        bsgUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Unit: ${user.unit?.name || 'No unit'}`);
        });
        
    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkTestUsers();