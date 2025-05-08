require('dotenv').config();
const sequelize = require('../config/database');
const { createDatabaseIfNotExists } = require('../config/database');
const User = require('../models/user.model');

const seedAdminUser = async () => {
  try {
    // Create database if it doesn't exist
    await createDatabaseIfNotExists();
    
    // Connect to database
    await sequelize.authenticate();
    console.log('PostgreSQL connection established. Syncing models...');
    
    // Sync models
    await sequelize.sync({ alter: true });
    
    // Check if admin user already exists
    const adminExists = await User.findOne({
      where: { email: 'admin@themis.com' }
    });
    
    if (adminExists) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      email: 'admin@themis.com',
      password: 'Admin123!', // Will be hashed by model hooks
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['ADMIN'],
      department: 'IT',
      forcePasswordChange: true
    });
    
    console.log('Admin user created successfully:', {
      id: adminUser.id,
      email: adminUser.email,
      roles: adminUser.roles
    });
    
    console.log('Done! Use the following credentials to login:');
    console.log('Email: admin@themis.com');
    console.log('Password: Admin123!');
    console.log('Important: You will be required to change your password on first login.');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    process.exit(0);
  }
};

// Run the seed function
seedAdminUser(); 