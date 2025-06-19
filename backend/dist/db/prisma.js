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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPrismaConnection = exports.disconnectPrisma = void 0;
const client_1 = require("@prisma/client");
// Create a singleton Prisma client instance
const prisma = global.__prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});
// In development, store the client on the global object to prevent
// creating multiple instances during hot reloads
if (process.env.NODE_ENV === 'development') {
    global.__prisma = prisma;
}
exports.default = prisma;
// Graceful shutdown function
const disconnectPrisma = () => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
});
exports.disconnectPrisma = disconnectPrisma;
// Health check function
const checkPrismaConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.$queryRaw `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Prisma connection failed:', error);
        return false;
    }
});
exports.checkPrismaConnection = checkPrismaConnection;
