import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'themis_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'themis_db',
  },
  pool: { 
    min: 0, 
    max: 7 
  },
  debug: process.env.NODE_ENV !== 'production'
});

export default db; 