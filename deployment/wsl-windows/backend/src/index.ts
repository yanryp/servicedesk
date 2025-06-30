import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import prisma, { disconnectPrisma, checkPrismaConnection } from './db/prisma'; // Initialize Prisma client
import authRouter from './routes/auth'; // Import the auth router
import ticketRouter from './routes/ticketRoutes'; // Import ticket router (legacy)
import enhancedTicketRouter from './routes/enhancedTicketRoutes'; // Import enhanced ticket router
import serviceCatalogRouter from './routes/serviceCatalogRoutes'; // Import service catalog router
import serviceCatalogAdminRouter from './routes/serviceCatalogAdminRoutes'; // Import service catalog admin router
import categorizationRouter from './routes/categorizationRoutes'; // Import categorization router
import categorizationAnalyticsRouter from './routes/categorizationAnalyticsRoutes'; // Import analytics router
import reportingRoutes from './routes/reportingRoutes'; // Import reporting router
import testRoutes from './routes/testRoutes';
import categoryRoutes from './routes/categoryRoutes'; // Import category routes
import templateRoutes from './routes/templateRoutes'; // Import template routes
import departmentRoutes from './routes/departmentRoutes'; // Import department routes
import masterDataRoutes from './routes/masterDataRoutes'; // Import master data routes
import fieldTypeRoutes from './routes/fieldTypeRoutes'; // Import field type routes
import templateManagementRoutes from './routes/templateManagementRoutes'; // Import template management routes
import bsgTemplateRoutes from './routes/bsgTemplateRoutes'; // Import BSG template routes
import templateFieldsRoutes from './routes/templateFieldsRoutes'; // Import template fields routes
import ticketCommentsRoutes from './routes/ticketCommentsRoutes'; // Import ticket comments routes
import autoAssignmentRoutes from './routes/autoAssignmentRoutes'; // Import auto-assignment routes
import apiTokenRoutes from './routes/apiTokenRoutes'; // Import API token routes
import externalApiRoutes from './routes/externalApiRoutes'; // Import external API routes
import { startEscalationCronJob } from './services/escalationService'; // Import escalation service

const app: Express = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3002',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
  ],
  credentials: true,
  optionsSuccessStatus: 200
})); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Middleware to parse JSON bodies with size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

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

// ITIL-enhanced routes (new)
app.use('/api/v2/tickets', enhancedTicketRouter); // Enhanced ticket router with ITIL support
app.use('/api/service-catalog', serviceCatalogRouter); // Service catalog router
app.use('/api/service-catalog-admin', serviceCatalogAdminRouter); // Service catalog admin router
app.use('/api/categorization', categorizationRouter); // Ticket categorization routes
app.use('/api/analytics/categorization', categorizationAnalyticsRouter); // Categorization analytics

// BSG Template System routes (new scalable system)
app.use('/api/master-data', masterDataRoutes); // Master data for dropdowns (branches, terminals, banks)
app.use('/api/field-types', fieldTypeRoutes); // Dynamic field type definitions
app.use('/api/template-management', templateManagementRoutes); // Template discovery and management
app.use('/api/bsg-templates', bsgTemplateRoutes); // BSG template import and management
app.use('/api/service-templates', templateFieldsRoutes); // Template custom fields routes

// Ticket Comments and Conversation System
app.use('/api', ticketCommentsRoutes); // Ticket comments and conversation routes

// Auto-assignment system
app.use('/api/auto-assignment', autoAssignmentRoutes); // Auto-assignment management routes

// API Token management
app.use('/api/tokens', apiTokenRoutes); // API token management routes

// External API (with API token authentication)
app.use('/api/external-api', externalApiRoutes); // External API routes with token auth

// Legacy routes (for backward compatibility)
app.use('/api/tickets', ticketRouter); // Mount legacy ticket router
app.use('/api/categories', categoryRoutes); // Use category routes
app.use('/api/templates', templateRoutes); // Use template routes

// Other routes
app.use('/api/reports', reportingRoutes);
app.use('/api/departments', departmentRoutes); // Use department routes
app.use('/api/test', testRoutes); // Mount test routes

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
