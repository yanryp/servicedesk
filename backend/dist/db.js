"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = void 0;
// backend/src/db.ts
// backend/src/db.ts
const pg_1 = require("pg");
const config_1 = require("./config");
const pool = new pg_1.Pool(config_1.dbConfig);
const query = (text, params) => pool.query(text, params);
exports.query = query;
// Optional: Test the connection
pool.connect((err, client, done) => {
    if (err) {
        done(); // Release client if error occurred during connection attempt
        return console.error('Error acquiring client for DB connection test:', err.stack);
    }
    if (!client) {
        done(); // Release client if it's undefined for some reason
        return console.error('DB client is undefined after connect.');
    }
    client.query('SELECT NOW()', (queryErr, result) => {
        done(); // Release the client back to the pool
        if (queryErr) {
            return console.error('Error executing query for DB connection test:', queryErr.stack);
        }
        console.log('Successfully connected to the database. Test query result:', result.rows);
    });
});
exports.default = pool;
