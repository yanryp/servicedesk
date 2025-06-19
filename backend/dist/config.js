"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.dbConfig = void 0;
// backend/src/config.ts
const pg_1 = require("pg");
// Ensure that dotenv has been called in index.ts before this file is imported.
exports.dbConfig = {
    user: process.env.DB_USER || 'yanrypangouw',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'ticketing_system_db',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
};
// Optional: Add checks to ensure critical DB variables are set
if (!process.env.DB_USER || !process.env.DB_DATABASE) {
    console.warn('WARNING: DB_USER or DB_DATABASE environment variables are not fully set. ' +
        'Falling back to default config values. This is not recommended for production.');
    // You might want to throw an error here in a production environment if critical variables are missing
    // if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_DATABASE) {
    //   console.error('FATAL ERROR: Database configuration is incomplete. Check .env file.');
    //   process.exit(1);
    // }
}
// Create and export the pool instance
exports.pool = new pg_1.Pool(exports.dbConfig);
