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
const prisma_1 = require("./db/prisma"); // Initialize Prisma client
const auth_1 = __importDefault(require("./routes/auth")); // Import the auth router
const ticketRoutes_1 = __importDefault(require("./routes/ticketRoutes")); // Import ticket router
const reportingRoutes_1 = __importDefault(require("./routes/reportingRoutes")); // Import reporting router
const testRoutes_1 = __importDefault(require("./routes/testRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes")); // Import category routes
const templateRoutes_1 = __importDefault(require("./routes/templateRoutes")); // Import template routes
const escalationService_1 = require("./services/escalationService"); // Import escalation service
const app = (0, express_1.default)();
app.use((0, cors_1.default)()); // Enable CORS for all routes
app.use(express_1.default.json()); // Middleware to parse JSON bodies
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
app.use('/api/tickets', ticketRoutes_1.default); // Mount ticket router
app.use('/api/reports', reportingRoutes_1.default);
app.use('/api/categories', categoryRoutes_1.default); // Use category routes
app.use('/api/templates', templateRoutes_1.default); // Use template routes
app.use('/api/test', testRoutes_1.default); // Mount reporting router
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
