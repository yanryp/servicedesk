import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import prisma, { disconnectPrisma, checkPrismaConnection } from './db/prisma'; // Initialize Prisma client
import authRouter from './routes/auth'; // Import the auth router
import ticketRouter from './routes/ticketRoutes'; // Import ticket router
import reportingRoutes from './routes/reportingRoutes'; // Import reporting router
import testRoutes from './routes/testRoutes';
import categoryRoutes from './routes/categoryRoutes'; // Import category routes
import templateRoutes from './routes/templateRoutes'; // Import template routes
import departmentRoutes from './routes/departmentRoutes'; // Import department routes
import { startEscalationCronJob } from './services/escalationService'; // Import escalation service

const app: Express = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbHealthy = await checkPrismaConnection();
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Mount the authentication router
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRouter); // Mount ticket router
app.use('/api/reports', reportingRoutes);
app.use('/api/categories', categoryRoutes); // Use category routes
app.use('/api/templates', templateRoutes); // Use template routes
app.use('/api/departments', departmentRoutes); // Use department routes
app.use('/api/test', testRoutes); // Mount reporting router

const port = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Ticketing System Backend!');
});

const server = app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  
  // Check database connection on startup
  const dbHealthy = await checkPrismaConnection();
  if (dbHealthy) {
    console.log('[database]: Prisma connected successfully');
    startEscalationCronJob(); // Start the cron job only if DB is healthy
  } else {
    console.error('[database]: Failed to connect to database');
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n[server]: Shutting down gracefully...');
  
  server.close(async () => {
    console.log('[server]: HTTP server closed');
    
    try {
      await disconnectPrisma();
      console.log('[database]: Prisma disconnected');
    } catch (error) {
      console.error('[database]: Error disconnecting Prisma:', error);
    }
    
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
