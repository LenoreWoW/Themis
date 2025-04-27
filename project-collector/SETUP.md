# Project Collector Setup Guide

This guide provides instructions for deploying the Project Collector application, which is designed to collect legacy project data before the main Themis system goes live.

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Nginx or another web server (for production)
- SSL certificate (for secure connections)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-org/themis-project-collector.git
cd themis-project-collector
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure the application

Create a `.env` file in the project root with the following variables:

```
# API Configuration
REACT_APP_API_BASE_URL=http://your-api-server/api

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=project_collector_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Authentication
JWT_SECRET=your_secret_key_here
```

### 4. Set up the database

Create a PostgreSQL database for the Project Collector:

```sql
CREATE DATABASE project_collector_db;
```

Run the database migrations:

```bash
npm run migrate
```

### 5. Build the application

```bash
npm run build
```

## Deployment

### Development Mode

```bash
npm run dev
```

### Production Deployment

#### 1. Using Nginx

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name project-collector.yourdomain.com;

    # Redirect to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name project-collector.yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /path/to/project-collector/build;
    index index.html;

    # GZIP compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 2. Using PM2 for process management

Install PM2:

```bash
npm install pm2 -g
```

Create a PM2 ecosystem file:

```bash
touch ecosystem.config.js
```

Add the following content:

```javascript
module.exports = {
  apps: [
    {
      name: 'project-collector-api',
      script: 'server/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
```

Start the application:

```bash
pm2 start ecosystem.config.js
```

## Data Export & Migration

When Themis is ready for launch, use the following process to migrate data:

1. Access the Project Collector application as an administrator
2. Go to the Data Management page
3. Click "Export All Projects" to download a JSON file
4. Use the Themis import utility to import this file
5. Verify data integrity in Themis

## Troubleshooting

### Database Connection Issues

Check PostgreSQL logs:

```bash
sudo tail -f /var/log/postgresql/postgresql-12-main.log
```

### API Server Issues

Check API server logs:

```bash
pm2 logs project-collector-api
```

### Client Application Issues

Check browser console for errors and verify that API requests are reaching the server.

## Security Considerations

- Ensure the database is properly secured with strong passwords
- Use HTTPS for all connections
- Regularly update dependencies to address security vulnerabilities
- Back up project data regularly
- Implement proper user authentication and authorization

## Support

For assistance, contact the Themis support team at support@themis.org. 