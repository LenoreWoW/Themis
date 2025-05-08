require('dotenv').config();
const sequelize = require('../config/database');
const { createDatabaseIfNotExists } = require('../config/database');
const User = require('../models/user.model');

const testUsers = [
  {
    email: 'john.smith@acme.com',
    password: 'password123', // Will be hashed by model hooks
    firstName: 'John',
    lastName: 'Smith',
    roles: ['ADMIN'],
    department: 'IT Department',
    forcePasswordChange: false
  },
  {
    email: 'sarah.johnson@acme.com',
    password: 'password123',
    firstName: 'Sarah',
    lastName: 'Johnson',
    roles: ['PROJECT_MANAGER'],
    department: 'Digital Transformation',
    forcePasswordChange: false
  },
  {
    email: 'emma.garcia@acme.com',
    password: 'password123',
    firstName: 'Emma',
    lastName: 'Garcia',
    roles: ['DEPARTMENT_DIRECTOR'],
    department: 'Finance Department',
    forcePasswordChange: false
  },
  {
    email: 'robert.taylor@acme.com',
    password: 'password123',
    firstName: 'Robert',
    lastName: 'Taylor',
    roles: ['EXECUTIVE'],
    department: 'Executive Office',
    forcePasswordChange: false
  },
  {
    email: 'david.wilson@acme.com',
    password: 'password123',
    firstName: 'David',
    lastName: 'Wilson',
    roles: ['MAIN_PMO'],
    department: 'IT Department',
    forcePasswordChange: false
  },
  {
    email: 'jessica.brown@acme.com',
    password: 'password123',
    firstName: 'Jessica',
    lastName: 'Brown',
    roles: ['SUB_PMO'],
    department: 'Digital Transformation',
    forcePasswordChange: false
  },
  {
    email: 'michael.chen@acme.com',
    password: 'password123',
    firstName: 'Michael',
    lastName: 'Chen',
    roles: ['PROJECT_MANAGER'], // Using PROJECT_MANAGER for 'Developer'
    department: 'Development Department',
    forcePasswordChange: false
  }
];

const seedTestUsers = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Connect to database
    await sequelize.authenticate();
    console.log('PostgreSQL connection established. Syncing models...');
    
    // Sync models
    await sequelize.sync({ alter: true });

    // Create each test user
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`User ${userData.email} already exists. Skipping creation.`);
        continue;
      }
      
      // Create user
      const user = await User.create(userData);
      console.log(`Created test user: ${user.email} with role(s): ${user.roles.join(', ')}`);
    }
    
    console.log('Done! Test users have been created successfully.');
    console.log('All test users have the password: password123');
  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
};

// Run the seed function
seedTestUsers(); 