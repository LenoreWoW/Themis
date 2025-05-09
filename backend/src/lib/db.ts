import { Pool, QueryResult, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a new pool with connection details from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the database connection on startup
pool.connect()
  .then((client: PoolClient) => {
    console.log('Connected to PostgreSQL database');
    client.release();
  })
  .catch((err: Error) => {
    console.error('Database connection error:', err.message);
  });

/**
 * Execute a query against the database
 * @param text SQL query text
 * @param params Query parameters
 * @returns Promise resolving to the query result
 */
export async function query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Error executing query', { text, error: err });
    throw err;
  }
}

/**
 * Insert a new record into a table and return the inserted row
 * @param table The table name
 * @param data Object containing column-value pairs to insert
 * @param returning The column to return after insert (default: 'id')
 * @returns Promise resolving to the inserted row
 */
export async function insert<T>(
  table: string, 
  data: Record<string, any>, 
  returning: string = '*'
): Promise<T> {
  const keys = Object.keys(data);
  const columns = keys.join(', ');
  const values = keys.map((_, i) => `$${i + 1}`).join(', ');
  
  const text = `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${returning}`;
  const params = Object.values(data);
  
  const result = await query<T>(text, params);
  return result.rows[0];
}

/**
 * Update existing records in a table and return the updated rows
 * @param table The table name
 * @param data Object containing column-value pairs to update
 * @param condition WHERE condition object
 * @param returning The columns to return after update (default: '*')
 * @returns Promise resolving to the updated rows
 */
export async function update<T>(
  table: string,
  data: Record<string, any>,
  condition: Record<string, any>,
  returning: string = '*'
): Promise<T[]> {
  const dataKeys = Object.keys(data);
  const conditionKeys = Object.keys(condition);
  
  const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
  const whereClause = conditionKeys
    .map((key, i) => `${key} = $${i + dataKeys.length + 1}`)
    .join(' AND ');
  
  const text = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING ${returning}`;
  const params = [...Object.values(data), ...Object.values(condition)];
  
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Delete records from a table based on condition
 * @param table The table name
 * @param condition WHERE condition object
 * @param returning The columns to return from deleted rows (default: '*')
 * @returns Promise resolving to the deleted rows
 */
export async function remove<T>(
  table: string,
  condition: Record<string, any>,
  returning: string = '*'
): Promise<T[]> {
  const conditionKeys = Object.keys(condition);
  
  const whereClause = conditionKeys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(' AND ');
  
  const text = `DELETE FROM ${table} WHERE ${whereClause} RETURNING ${returning}`;
  const params = Object.values(condition);
  
  const result = await query<T>(text, params);
  return result.rows;
}

/**
 * Insert or update a record (upsert) based on a conflict constraint
 * @param table The table name
 * @param data Object containing column-value pairs to insert/update
 * @param constraint The constraint or column(s) that might conflict
 * @param returning The columns to return after operation (default: '*')
 * @returns Promise resolving to the upserted row
 */
export async function upsert<T>(
  table: string,
  data: Record<string, any>,
  constraint: string,
  returning: string = '*'
): Promise<T> {
  const keys = Object.keys(data);
  const columns = keys.join(', ');
  const values = keys.map((_, i) => `$${i + 1}`).join(', ');
  const updates = keys.map(key => `${key} = EXCLUDED.${key}`).join(', ');
  
  const text = `
    INSERT INTO ${table} (${columns})
    VALUES (${values})
    ON CONFLICT (${constraint})
    DO UPDATE SET ${updates}
    RETURNING ${returning}
  `;
  const params = Object.values(data);
  
  const result = await query<T>(text, params);
  return result.rows[0];
}

export default pool; 