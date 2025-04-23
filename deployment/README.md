# Themis Deployment Guide

This document provides instructions for deploying the Themis project management application on a Linux server. The deployment is configured for the following environment:

- Server: 172.28.17.95 (modbndc1tms01.defence.local)
- Subdomain: pmo.projects.mod.qa
- Database: PostgreSQL

## Prerequisites

Before beginning the deployment, ensure the following:

1. Linux server with root or sudo access
2. Domain pointed to your server IP (pmo.projects.mod.qa → 172.28.17.95)
3. Open ports:
   - 80/443 (HTTP/HTTPS)
   - 22 (SSH)
   - 5432 (PostgreSQL - optional, if external access is needed)

## Deployment Steps

### 1. Prepare the Server

Connect to the server via SSH:

```bash
ssh username@172.28.17.95
```

Update the system and install basic dependencies:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget unzip
```

### 2. Clone the Repository

```bash
mkdir -p /opt/themis
cd /opt/themis
git clone https://your-repository-url.git .
```

### 3. Deployment Script

Make all scripts executable:

```bash
cd /opt/themis/deployment
chmod +x *.sh
```

Run the deployment script:

```bash
sudo ./deploy_themis.sh
```

This script will:
- Create necessary directories
- Install PostgreSQL
- Setup Node.js environment
- Configure Nginx
- Setup the database schema

### 4. Configure SSL

Generate SSL certificate using Let's Encrypt:

```bash
sudo certbot --nginx -d pmo.projects.mod.qa
```

Follow the prompts to complete the certificate setup.

### 5. Deploy Application Code

#### Client (Frontend)

```bash
cd /opt/themis/themis-client

# Install dependencies
npm install

# Build the application
npm run build

# Copy to the web directory
cp -r build/* /var/www/themis/build/
```

#### Server (Backend)

```bash
cd /opt/themis/server

# Install dependencies
npm install

# Build the server
npm run build

# Install PM2 if not already installed
npm install -g pm2

# Start the application
pm2 start dist/index.js --name themis
pm2 save
pm2 startup
```

### 6. Migrating from localStorage to PostgreSQL

If you're migrating from a prototype using localStorage, you'll need to import the data:

1. Export data from the prototype (JSON format)
2. Use the data migration script:

```bash
cd /opt/themis/deployment
node migrate_data.js /path/to/exported/data.json
```

### 7. Backend Structure

The backend is organized as follows:

```
server/
├── src/
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Authentication, validation, etc.
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── index.ts        # Entry point
└── dist/               # Compiled JavaScript
```

### 8. Security Considerations

After deployment:

1. Secure PostgreSQL:
   ```bash
   sudo nano /etc/postgresql/14/main/pg_hba.conf
   # Set appropriate access policies
   sudo systemctl restart postgresql
   ```

2. Set up a firewall:
   ```bash
   sudo apt install -y ufw
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

3. Regularly update the system:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

### 9. Troubleshooting

#### Common Issues:

1. **Nginx Error**: Check logs at `/var/log/nginx/error.log`
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

2. **PostgreSQL Issues**: Check logs at `/var/log/postgresql/postgresql-14-main.log`
   ```bash
   sudo systemctl status postgresql
   ```

3. **Application Errors**: Check PM2 logs
   ```bash
   pm2 logs themis
   ```

## Need Help?

Contact the development team at your-support-email@example.com or open an issue in the project repository. 