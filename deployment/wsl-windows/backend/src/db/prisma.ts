import { PrismaClient } from '@prisma/client';

// Global variable to store the Prisma client instance
declare global {
  var __prisma: PrismaClient | undefined;
}

// Create a singleton Prisma client instance
const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// In development, store the client on the global object to prevent
// creating multiple instances during hot reloads
if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export default prisma;

// Graceful shutdown function
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

// Health check function
export const checkPrismaConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Prisma connection failed:', error);
    return false;
  }
};