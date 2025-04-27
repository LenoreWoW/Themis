# Themis Deployment

This folder contains all the necessary scripts and configuration files for deploying the Themis application to a staging environment.

## Files Included

- `stage_deploy.sh`: Main deployment script that orchestrates the entire deployment process
- `install_postgres.sh`: Script for installing PostgreSQL database
- `setup_database.sh`: Script for setting up database schema and initial data
- `setup_nodejs.sh`: Script for setting up Node.js environment
- `create_admin_user.sh`: Script for creating an admin user in the database
- `config/env.sample`: Sample environment variables file

## Deployment Instructions

1. Prepare your server (Ubuntu/Debian recommended)
2. Copy this deployment folder to your server
3. Connect to your server via SSH
4. Navigate to the deployment directory:
   ```
   cd /path/to/deployment/
   ```
5. Make all scripts executable:
   ```
   chmod +x *.sh
   ```
6. Run the deployment script as root:
   ```
   sudo ./stage_deploy.sh
   ```

The script will:
- Install PostgreSQL
- Set up Node.js environment
- Configure Nginx for staging (without SSL)
- Set up the database schema
- Create an admin user
- Deploy client application
- Deploy and start the server with PM2

During execution, the script will prompt you for:
- Confirmation to edit the .env file with your specific configuration
- The path to your themis-client directory
- The path to your server directory

## Post-Deployment

After deployment, your application will be available at the URL you configured in your .env file. If no SERVER_NAME is specified, it will default to http://localhost.

## Managing the Application

- The client files are in: `/var/www/themis/build/`
- The server is running with PM2, manage it with: `pm2 [status|logs|restart|stop] themis`
- The database is running with PostgreSQL
- The Nginx configuration is at: `/etc/nginx/sites-available/themis` 