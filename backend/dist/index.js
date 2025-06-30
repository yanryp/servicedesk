"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const prisma_1 = require("./db/prisma"); // Initialize Prisma client
const auth_1 = __importDefault(require("./routes/auth")); // Import the auth router
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes")); // Import ticket router (legacy)
const enhancedTicketRoutes_1 = __importDefault(require("./routes/enhancedTicketRoutes")); // Import enhanced ticket router
const serviceCatalogRoutes_1 = __importDefault(require("./routes/serviceCatalogRoutes")); // Import service catalog router
const serviceCatalogAdminRoutes_1 = __importDefault(require("./routes/serviceCatalogAdminRoutes")); // Import service catalog admin router
const categorizationRoutes_1 = __importDefault(require("./routes/categorizationRoutes")); // Import categorization router
const categorizationAnalyticsRoutes_1 = __importDefault(require("./routes/categorizationAnalyticsRoutes")); // Import analytics router
const reportingRoutes_1 = __importDefault(require("./routes/reportingRoutes")); // Import reporting router
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes")); // Import category routes
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes")); // Import template routes
const departmentRoutes_1 = __importDefault(require("./routes/departmentRoutes")); // Import department routes
const masterDataRoutes_1 = __importDefault(require("./routes/masterDataRoutes")); // Import master data routes
const fieldTypeRoutes_1 = __importDefault(require("./routes/fieldTypeRoutes")); // Import field type routes
const templateManagementRoutes_1 = __importDefault(require("./routes/templateManagementRoutes")); // Import template management routes
const bsgTemplateRoutes_1 = __importDefault(require("./routes/bsgTemplateRoutes")); // Import BSG template routes
const templateFieldsRoutes_1 = __importDefault(require("./routes/templateFieldsRoutes")); // Import template fields routes
const ticketCommentsRoutes_1 = __importDefault(require("./routes/ticketCommentsRoutes")); // Import ticket comments routes
const autoAssignmentRoutes_1 = __importDefault(require("./routes/autoAssignmentRoutes")); // Import auto-assignment routes
const apiTokenRoutes_1 = __importDefault(require("./routes/apiTokenRoutes")); // Import API token routes
const externalApiRoutes_1 = __importDefault(require("./routes/externalApiRoutes")); // Import external API routes
const escalationService_1 = require("./services/escalationService"); // Import escalation service
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3002',
        ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [])
    ],
    credentials: true,
    optionsSuccessStatus: 200
})); // Enable CORS for all routes
app.use(express_1.default.json({ limit: '10mb' })); // Middleware to parse JSON bodies with size limit
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
// Health check endpoint
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const dbHealthy = yield (0, prisma_1.checkPrismaConnection)();
    res.status(dbHealthy ? 200 : 503).json({
        status: dbHealthy ? 'healthy' : 'unhealthy',
        database: dbHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
}));
// Mount the authentication router
app.use('/api/auth', auth_1.default);
// ITIL-enhanced routes (new)
app.use('/api/v2/tickets', enhancedTicketRoutes_1.default); // Enhanced ticket router with ITIL support
app.use('/api/service-catalog', serviceCatalogRoutes_1.default); // Service catalog router
app.use('/api/service-catalog-admin', serviceCatalogAdminRoutes_1.default); // Service catalog admin router
app.use('/api/categorization', categorizationRoutes_1.default); // Ticket categorization routes
app.use('/api/analytics/categorization', categorizationAnalyticsRoutes_1.default); // Categorization analytics
// BSG Template System routes (new scalable system)
app.use('/api/master-data', masterDataRoutes_1.default); // Master data for dropdowns (branches, terminals, banks)
app.use('/api/field-types', fieldTypeRoutes_1.default); // Dynamic field type definitions
app.use('/api/template-management', templateManagementRoutes_1.default); // Template discovery and management
app.use('/api/bsg-templates', bsgTemplateRoutes_1.default); // BSG template import and management
app.use('/api/service-templates', templateFieldsRoutes_1.default); // Template custom fields routes
// Ticket Comments and Conversation System
app.use('/api', ticketCommentsRoutes_1.default); // Ticket comments and conversation routes
// Auto-assignment system
app.use('/api/auto-assignment', autoAssignmentRoutes_1.default); // Auto-assignment management routes
// API Token management
app.use('/api/tokens', apiTokenRoutes_1.default); // API token management routes
// External API (with API token authentication)
app.use('/api/external-api', externalApiRoutes_1.default); // External API routes with token auth
// Legacy routes (for backward compatibility)
app.use('/api/tickets', ticketRoutes_1.default); // Mount legacy ticket router
app.use('/api/categories', categoryRoutes_1.default); // Use category routes
app.use('/api/templates', templateRoutes_1.default); // Use template routes
// Other routes
app.use('/api/reports', reportingRoutes_1.default);
app.use('/api/departments', departmentRoutes_1.default); // Use department routes
app.use('/api/test', testRoutes_1.default); // Mount test routes
const port = process.env.PORT || 3001;
app.get('/', (req, res) => {
    res.send('Hello from the Ticketing System Backend!');
});
const server = app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    // Check database connection on startup
    const dbHealthy = yield (0, prisma_1.checkPrismaConnection)();
    if (dbHealthy) {
        console.log('[database]: Prisma connected successfully');
        (0, escalationService_1.startEscalationCronJob)(); // Start the cron job only if DB is healthy
    }
    else {
        console.error('[database]: Failed to connect to database');
    }
}));
// Graceful shutdown
const gracefulShutdown = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n[server]: Shutting down gracefully...');
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log('[server]: HTTP server closed');
        try {
            yield (0, prisma_1.disconnectPrisma)();
            console.log('[database]: Prisma disconnected');
        }
        catch (error) {
            console.error('[database]: Error disconnecting Prisma:', error);
        }
        process.exit(0);
    }));
});
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
