# Themis - Deployment Guide for New Team Members

This step-by-step guide will help you deploy the Themis Project Management System with no prior experience needed. Follow these instructions carefully to set up both the frontend and backend components.

## Prerequisites

- Linux server with Ubuntu 22.04 LTS (recommended)
- Root or sudo access to the server
- Domain name pointed to your server's IP address
- Basic knowledge of terminal commands

## 1. Initial Server Setup

Connect to your server via SSH:

```bash
ssh username@your-server-ip
```

Update the system:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget unzip
```

## 2. Clone the Repository

```bash
sudo mkdir -p /opt/themis
sudo chown $USER:$USER /opt/themis
cd /opt/themis
git clone https://github.com/your-organization/Themis.git .
```

## 3. Deploy Using the Automated Script

Our deployment scripts automate most of the setup process:

```bash
cd /opt/themis/deployment
chmod +x *.sh
sudo ./deploy_themis.sh
```

This script will:
- Install PostgreSQL database
- Set up Node.js environment
- Configure Nginx web server
- Set up database schema
- Create directories for the application

## 4. Configure Environment Variables

Create and edit the .env file for the backend (if not already created by the script):

```bash
sudo nano /opt/themis/server/.env
```

Add these variables (replace with appropriate values):

```
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=themis_user
DB_PASSWORD=your_secure_password
DB_NAME=themis_db

# Server settings
PORT=5065
NODE_ENV=production

# JWT settings
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
```

## 5. Configure SSL Certificate

If you have a domain name, set up SSL for secure HTTPS:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Follow the prompts to complete the certificate setup.

## 6. Set Up and Deploy the Frontend

Navigate to the client directory:

```bash
cd /opt/themis/themis-client
```

Update API URL in the config file:

```bash
nano src/config.ts
```

Change the `API_BASE_URL` to match your server's URL or IP:
```typescript
// API Configuration
export const API_BASE_URL = 'https://your-domain.com/api';  // Or http://your-server-ip:5065
```

Save the file, then build the frontend:

```bash
npm install
npm run build
```

Copy the build files to the web server directory:

```bash
sudo cp -r build/* /var/www/themis/build/
```

## 7. Set Up and Deploy the Backend

Navigate to the server directory:

```bash
cd /opt/themis/Themis.API
```

Restore dependencies and build the project:

```bash
dotnet restore
dotnet build
```

Start the API server:

```bash
dotnet run --urls="http://localhost:5065"
```

For production use, install as a service:

```bash
sudo nano /etc/systemd/system/themis-api.service
```

Add this configuration:

```
[Unit]
Description=Themis API Service
After=network.target

[Service]
WorkingDirectory=/opt/themis/Themis.API
ExecStart=/usr/bin/dotnet run --urls="http://localhost:5065"
Restart=always
RestartSec=10
SyslogIdentifier=themis-api
User=www-data
Environment=ASPNETCORE_ENVIRONMENT=Production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable themis-api
sudo systemctl start themis-api
```

## 8. Database Migration and Configuration

The database should be set up by the deployment script. Verify it's working:

```bash
sudo -u postgres psql -c '\l' | grep themis
```

If you need to manually create the database:

```bash
sudo -u postgres psql
```

In the PostgreSQL prompt:

```sql
CREATE DATABASE themis_db;
CREATE USER themis_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE themis_db TO themis_user;
\q
```

## 9. Verify the Deployment

1. Check that the frontend is accessible:
   - Visit `https://your-domain.com` or `http://your-server-ip` in a browser

2. Check that the API server is running:
   - `sudo systemctl status themis-api` (if using systemd service)
   - Visit `https://your-domain.com/api/health` or `http://your-server-ip:5065/health`

3. Check Nginx configuration:
   - `sudo nginx -t`
   - `sudo systemctl status nginx`

## 10. User Setup

Create an initial admin user if not created by scripts:

```bash
cd /opt/themis/deployment
sudo ./create_admin_user.sh
```

The default login credentials will be:
- Username: `admin@themis.com`
- Password: `Admin123$`

**IMPORTANT**: Change this password immediately after first login!

## 11. Common Issues and Troubleshooting

### Database Connection Issues

If the application can't connect to the database:

1. Check database status:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database user and permissions:
   ```bash
   sudo -u postgres psql -c '\du' | grep themis
   ```

3. Check database connection details in `/opt/themis/server/.env`

### API Not Responding

1. Verify the API is running:
   ```bash
   sudo systemctl status themis-api
   ```

2. Check API logs:
   ```bash
   sudo journalctl -u themis-api -n 100
   ```

3. Verify API port is open:
   ```bash
   sudo netstat -tuln | grep 5065
   ```

### Frontend Not Loading

1. Check Nginx configuration:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

2. Check Nginx logs:
   ```bash
   sudo cat /var/log/nginx/error.log
   ```

3. Verify frontend build files exist:
   ```bash
   ls -la /var/www/themis/build/
   ```

## 12. Maintenance Tasks

### Regular Updates

To update the application:

```bash
cd /opt/themis
git pull

# Update and rebuild frontend
cd themis-client
npm install
npm run build
sudo cp -r build/* /var/www/themis/build/

# Update and restart backend
cd ../Themis.API
dotnet restore
dotnet build
sudo systemctl restart themis-api
```

### Database Backups

Create regular database backups:

```bash
cd /opt/themis/deployment
sudo ./backup_db.sh
```

## Need Help?

If you encounter any issues not covered in this guide:

1. Check the detailed documentation in `/opt/themis/deployment/DEPLOYMENT_REQUIREMENTS.md`
2. Contact the development team at team@themis-support.com
3. Open an issue on our GitHub repository

---

This guide was last updated on April 27, 2023 and is intended for new team members deploying Themis for the first time.

