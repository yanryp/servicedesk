// backend/src/db.ts
// backend/src/db.ts
import { Pool, PoolClient, QueryResult } from 'pg';
import { dbConfig } from './config';

const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Optional: Test the connection
pool.connect((err: Error | undefined, client: PoolClient | undefined, done: (release?: any) => void) => {
  if (err) {
    done(); // Release client if error occurred during connection attempt
    return console.error('Error acquiring client for DB connection test:', err.stack);
  }
  if (!client) {
    done(); // Release client if it's undefined for some reason
    return console.error('DB client is undefined after connect.');
  }
  client.query('SELECT NOW()', (queryErr: Error | undefined, result: QueryResult) => {
    done(); // Release the client back to the pool
    if (queryErr) {
      return console.error('Error executing query for DB connection test:', queryErr.stack);
    }
    console.log('Successfully connected to the database. Test query result:', result.rows);
  });
});

export default pool;

