# Themis Deployment Requirements

This document outlines all requirements and detailed steps for deploying the Themis project management application.

## System Requirements

### Hardware
- Minimum 2 CPU cores
- 4GB RAM (8GB recommended)
- 20GB free disk space

### Software Prerequisites
- Ubuntu 22.04 LTS (recommended) or other Linux distribution
- PostgreSQL 14+
- Node.js 20.x
- Nginx
- SSL certificate (via Certbot)

## Deployment Scripts

The deployment directory contains the following scripts:

| Script | Purpose |
|--------|---------|
| `deploy_themis.sh` | Main deployment script that runs all other scripts |
| `install_postgres.sh` | Installs PostgreSQL database |
| `setup_database.sh` | Creates database, user, and schema |
| `create_admin_user.sh` | Creates initial admin user |
| `setup_nodejs.sh` | Installs Node.js and creates .env file |
| `setup_nginx.sh` | Installs and configures Nginx as reverse proxy |

## Detailed Deployment Steps

### 1. Prepare the Server

1. Provision a Linux server with Ubuntu 22.04 LTS
2. Update the system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
3. Install git:
   ```bash
   sudo apt install -y git
   ```

### 2. Clone the Repository

```bash
git clone https://your-repository-url.git /opt/themis
cd /opt/themis
```

### 3. Set Up Deployment Files

1. Make all deployment scripts executable:
   ```bash
   cd /opt/themis/deployment
   chmod +x *.sh
   ```

### 4. Run the Main Deployment Script

```bash
sudo ./deploy_themis.sh
```

This will:
- Install PostgreSQL 14
- Set up the database with all required tables
- Install Node.js 20.x and PM2
- Configure Nginx as a reverse proxy
- Create an initial admin user

### 5. Configure Nginx for Your Domain

1. Edit the Nginx configuration:
   ```bash
   sudo nano /etc/nginx/sites-available/themis
   ```

2. Update the `server_name` directive with your domain:
   ```
   server_name your-actual-domain.com;
   ```

3. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### 6. Set Up SSL Certificate

```bash
sudo certbot --nginx -d your-actual-domain.com
```

### 7. Build the Frontend

```bash
cd /opt/themis/themis-client
npm install
npm run build
```

### 8. Set Up and Start the Backend

1. Install server dependencies:
   ```bash
   cd /opt/themis/server
   npm install
   npm install knex pg dotenv
   npm install --save-dev @types/node @types/pg
   ```

2. Build the backend:
   ```bash
   npm run build
   ```

3. Start with PM2:
   ```bash
   pm2 start dist/index.js --name themis
   pm2 save
   pm2 startup
   ```

### 9. PostgreSQL Migration

If migrating from localStorage to PostgreSQL:

1. Ensure the database connection file is properly configured:
   ```bash
   nano /opt/themis/server/src/config/db.ts
   ```

2. Implement the database models based on the provided schemas in `setup_database.sh`

3. Update API service files to use the PostgreSQL version instead of localStorage (see `api_service_example.ts`)

### 10. Post-Deployment Checks

1. Verify the frontend is accessible: https://your-domain.com
2. Test login with admin user:
   - Username: admin
   - Default password: admin123 (change immediately!)
3. Check all features are working correctly
4. Monitor server logs:
   ```bash
   pm2 logs themis
   ```

### 11. Security Hardening

1. Change default admin password immediately
2. Update the JWT secret in the .env file to a strong random value
3. Set up a firewall:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

4. Set up automatic PostgreSQL backups:
   ```bash
   sudo apt install -y postgresql-client
   ```

   Create a backup script:
   ```bash
   sudo nano /opt/themis/deployment/backup_db.sh
   ```

   Add this content:
   ```bash
   #!/bin/bash
   BACKUP_DIR="/opt/themis/backups"
   TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
   mkdir -p $BACKUP_DIR
   pg_dump -U themis_user -d themis_db -F c -f "$BACKUP_DIR/themis_backup_$TIMESTAMP.dump"
   find $BACKUP_DIR -type f -mtime +7 -name "*.dump" -delete
   ```

   Make it executable and add to crontab:
   ```bash
   chmod +x /opt/themis/deployment/backup_db.sh
   sudo crontab -e
   ```

   Add this line to run backups daily at 2 AM:
   ```
   0 2 * * * /opt/themis/deployment/backup_db.sh
   ```

## Troubleshooting

### Database Connection Issues
- Check PostgreSQL service: `sudo systemctl status postgresql`
- Verify database user exists: `sudo -u postgres psql -c '\du'`
- Check database permissions: `sudo -u postgres psql -c '\l'`

### Backend Service Not Starting
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs themis`
- Verify .env file has correct database credentials

### Frontend Not Loading
- Check Nginx configuration: `sudo nginx -t`
- View Nginx error logs: `sudo cat /var/log/nginx/error.log`
- Verify build files exist in the build directory

### SSL Certificate Issues
- Run Certbot again: `sudo certbot --nginx -d your-domain.com`
- Check certificate status: `sudo certbot certificates`

## Maintenance

### Regular Updates
1. Pull latest code:
   ```bash
   cd /opt/themis
   git pull
   ```

2. Rebuild frontend:
   ```bash
   cd /opt/themis/themis-client
   npm install
   npm run build
   ```

3. Rebuild and restart backend:
   ```bash
   cd /opt/themis/server
   npm install
   npm run build
   pm2 restart themis
   ```

### Package Updates
Regularly update system packages:
```bash
sudo apt update && sudo apt upgrade -y
```

### Database Maintenance
Perform regular database maintenance:
```bash
sudo -u postgres psql -d themis_db -c 'VACUUM ANALYZE;'
``` 