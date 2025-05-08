const { Sequelize } = require('sequelize');
const { Client } = require('pg');

// Database configuration from environment or defaults
const dbName = process.env.DB_NAME || 'themis';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;

// Create database if it doesn't exist
async function createDatabaseIfNotExists() {
  // Connect to the default 'postgres' database first
  const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    database: 'postgres' // Connect to default postgres database
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL default database');

    // Check if our database exists
    const checkDbResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = $1
    `, [dbName]);

    // If database doesn't exist, create it
    if (checkDbResult.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }
  } catch (error) {
    console.error('Error checking/creating database:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Create Sequelize instance
const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword, 
  {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    // First create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Then connect to it
    await sequelize.authenticate();
    console.log('PostgreSQL connection has been established successfully.');
    
    // Sync models with database (in development only)
    if (process.env.NODE_ENV === 'development') {
      console.log('Syncing database models...');
      await sequelize.sync({ alter: true });
      console.log('Database sync complete.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.createDatabaseIfNotExists = createDatabaseIfNotExists; 