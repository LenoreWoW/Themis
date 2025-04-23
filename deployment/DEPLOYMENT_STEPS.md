# Themis Deployment Steps for modbndc1tms01.defence.local

This document provides step-by-step instructions for deploying the Themis application on the server at 172.28.17.95 (modbndc1tms01.defence.local) with the subdomain pmo.projects.mod.qa.

## Preparation

The deployment packages have been prepared and are available in the `deployment/packages/` directory:
- `themis-deployment.tar.gz` - Contains all deployment scripts and configurations
- `themis-client-build.tar.gz` - Contains the built client application

## Deployment Steps

### 1. Connect to the Server

```bash
ssh username@172.28.17.95
```

Replace `username` with your actual username on the server.

### 2. Create Deployment Directory

```bash
mkdir -p /opt/themis
cd /opt/themis
```

### 3. Transfer the Deployment Packages

Use SCP to transfer the deployment packages to the server:

```bash
# From your local machine:
scp /path/to/Themis/deployment/packages/themis-deployment.tar.gz username@172.28.17.95:/opt/themis/
scp /path/to/Themis/deployment/packages/themis-client-build.tar.gz username@172.28.17.95:/opt/themis/
```

### 4. Extract the Deployment Files

On the server:

```bash
cd /opt/themis
mkdir -p deployment
tar -xzvf themis-deployment.tar.gz -C deployment/
```

### 5. Run the Update Hosts Script

```bash
cd /opt/themis/deployment
chmod +x *.sh
sudo ./update_hosts.sh
```

### 6. Run the Deployment Script

```bash
sudo ./deploy_themis.sh
```

This will:
- Create necessary directories
- Set up PostgreSQL database
- Install Node.js
- Configure Nginx
- Set up the database schema

### 7. Deploy the Client Application

```bash
mkdir -p /var/www/themis/build
tar -xzvf /opt/themis/themis-client-build.tar.gz -C /var/www/themis/build/
```

### 8. Configure SSL Certificate

```bash
sudo certbot --nginx -d pmo.projects.mod.qa
```

Follow the prompts to complete the SSL certificate setup.

### 9. Restart Nginx

```bash
sudo systemctl restart nginx
```

### 10. Create a Simple Server (if not available)

If you need a simple server to serve the API:

```bash
cd /opt/themis
mkdir -p server/src
cat > server/src/index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Placeholder routes to be replaced with actual implementations
app.get('/api/projects', (req, res) => {
  res.json({ message: 'Projects API endpoint' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../var/www/themis/build')));

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../var/www/themis/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF
```

### 11. Install Server Dependencies and Start

```bash
cd /opt/themis/server
npm init -y
npm install express cors path

# Install PM2 globally
npm install -g pm2

# Start the server with PM2
pm2 start src/index.js --name themis
pm2 save
pm2 startup
```

### 12. Verify the Deployment

Open a web browser and navigate to:
- https://pmo.projects.mod.qa

You should see the Themis application running.

## Troubleshooting

If you encounter issues:

1. Check Nginx logs:
   ```bash
   sudo tail -f /var/log/nginx/themis-error.log
   ```

2. Check application logs:
   ```bash
   pm2 logs themis
   ```

3. Check database connection:
   ```bash
   sudo -u postgres psql -d themis_db -c "SELECT NOW();"
   ```

For more detailed information, refer to the full deployment guide in `/opt/themis/deployment/README.md`. 