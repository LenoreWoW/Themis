# Themis Project Management System - Deployment Guide

## System Overview

The Themis application consists of:
- React frontend (themis-client) running on port 3000
- .NET API (Themis.API) running on port 5095
- Nginx as a reverse proxy on port 80

## Deployment Steps

### Prerequisites
- Node.js v18.x (Do NOT use Node.js v19 as it causes dependency issues)
- .NET SDK 6.0 or later
- PostgreSQL database
- Nginx

### 1. Clone the Repository
```bash
git clone https://github.com/your-organization/themis.git
cd themis
```

### 2. Database Setup
- Ensure PostgreSQL is running
- Create a new database for Themis
- The API will automatically create the schema on first run

### 3. API Deployment
```bash
cd Themis.API

# Restore packages
dotnet restore

# Build the API
dotnet build

# Run migrations (if needed)
dotnet ef database update

# Start the API
dotnet run --urls=http://localhost:5095
```

### 4. Client Deployment
```bash
cd themis-client

# Important: Use Node.js v18.x, NOT v19
# If using nvm: nvm use 18

# Install dependencies 
# Use --legacy-peer-deps to resolve React version conflicts
npm install --legacy-peer-deps

# Build for production
npm run build

# If running in development mode
npm start
```

### 5. Nginx Configuration

Create a configuration file at `/opt/homebrew/etc/nginx/servers/themis.conf` (macOS) or `/etc/nginx/sites-available/themis` (Linux):

```nginx
server {
    listen 80;
    server_name pmo.projects.mod.qa;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:5095;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

On Linux, create a symbolic link:
```bash
sudo ln -s /etc/nginx/sites-available/themis /etc/nginx/sites-enabled/
```

### 6. Domain Configuration

#### On macOS:
Add the following entry to your hosts file (`/etc/hosts`):
```
127.0.0.1 pmo.projects.mod.qa
```

#### On Linux:
To update the hosts file on Linux:

1. Open the hosts file with sudo privileges:
   ```bash
   sudo nano /etc/hosts
   ```

2. Add the following line to the file:
   ```
   127.0.0.1 pmo.projects.mod.qa
   ```

3. Save the file by pressing Ctrl+O, then Enter.

4. Exit the editor by pressing Ctrl+X.

5. Verify the hosts file was updated correctly:
   ```bash
   cat /etc/hosts
   ```

6. If your Linux distribution uses firewalld or ufw, you may need to allow traffic on port 80:
   ```bash
   # For firewalld
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --reload

   # For ufw
   sudo ufw allow 80/tcp
   ```

7. If you encounter permission issues with SELinux:
   ```bash
   # Check SELinux status
   getenforce

   # If it's Enforcing, adjust contexts for your web directories
   sudo chcon -R -t httpd_sys_content_t /var/www/themis/build/
   ```

### 7. Start Services

Use the provided scripts to start all services:

```bash
# Ensure scripts are executable
chmod +x start-api.sh
chmod +x start-client.sh
chmod +x start-all.sh
chmod +x stop-all.sh

# Start all services
./start-all.sh
```

## Automated Startup/Shutdown

### Starting the Application

To start all components automatically:

```bash
./start-all.sh
```

This script:
1. Starts/restarts Nginx
2. Starts the .NET API in the background
3. Starts the React client in the background
4. Creates log files for each component

### Stopping the Application

To stop all components automatically:

```bash
./stop-all.sh
```

## Troubleshooting

### Port 3000 Already in Use

If you see a message about port 3000 being in use:
```
Something is already running on port 3000
```

Either:
1. Kill the existing process:
```bash
pkill -f "node.*react-scripts.*start"
```

2. Use a different port:
```bash
export PORT=3001
npm start
```

### Node.js Version Issues

If you encounter errors related to React dependencies:
- Ensure you're using Node.js v18.x (NOT v19)
- Install dependencies with the --legacy-peer-deps flag:
```bash
npm install --legacy-peer-deps
```

### API Warnings

You may see C# compiler warnings about non-nullable properties. These are safe to ignore for development, but should be addressed before production deployment.

### Nginx Configuration Issues on Linux

If Nginx is not working properly after configuration:

1. Check Nginx configuration syntax:
   ```bash
   sudo nginx -t
   ```

2. Check Nginx service status:
   ```bash
   sudo systemctl status nginx
   ```

3. Inspect the Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

4. Restart Nginx after making changes:
   ```bash
   sudo systemctl restart nginx
   ```

## Logs

Log files are available at:
- API logs: `/Users/hassanalsahli/Desktop/Themis/api.log` and `/Users/hassanalsahli/Desktop/Themis/api-error.log`
- Client logs: `/Users/hassanalsahli/Desktop/Themis/client.log` and `/Users/hassanalsahli/Desktop/Themis/client-error.log`
- Startup logs: `/Users/hassanalsahli/Desktop/Themis/startup.log`
- Shutdown logs: `/Users/hassanalsahli/Desktop/Themis/shutdown.log`
- Nginx logs: `/opt/homebrew/var/log/nginx/access.log` and `/opt/homebrew/var/log/nginx/error.log` (macOS)
  or `/var/log/nginx/access.log` and `/var/log/nginx/error.log` (Linux)

## Production Deployment Notes

- SSL will be implemented in a future update
- For production, ensure all API warnings are addressed
- Consider using a process manager like PM2 for the Node.js application
- Use a proper reverse proxy setup with SSL in production 