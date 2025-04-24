#!/bin/bash
# Comprehensive Themis deployment script for staging environment
# This script performs all necessary steps to deploy Themis without SSL

# Exit on any error
set -e

# Set the current directory for reference
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Deployment directory: $DEPLOY_DIR"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Create environment variable file if it doesn't exist
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    if [ -f "$DEPLOY_DIR/config/env.sample" ]; then
        cp "$DEPLOY_DIR/config/env.sample" "$DEPLOY_DIR/.env"
        echo "Created .env file from template. Please update it with your values."
        read -p "Would you like to edit the .env file now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} "$DEPLOY_DIR/.env"
        else
            echo "Please update the .env file before continuing."
            exit 1
        fi
    else
        echo "Error: env.sample file not found. Cannot create .env file."
        exit 1
    fi
fi

# Load environment variables
source "$DEPLOY_DIR/.env"

# Create base directories
mkdir -p /var/www/themis/build/static
mkdir -p /var/www/themis/uploads
chmod -R 755 /var/www/themis

# Set all scripts as executable
chmod +x $DEPLOY_DIR/*.sh

echo "========================================================"
echo "Starting Themis deployment for staging environment"
echo "========================================================"

# 1. Install PostgreSQL
echo "Step 1/7: Installing PostgreSQL..."
if [ -f "$DEPLOY_DIR/install_postgres.sh" ]; then
    $DEPLOY_DIR/install_postgres.sh
else
    echo "Installing PostgreSQL directly..."
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi
echo "PostgreSQL installation complete."

# 2. Setup Node.js environment
echo "Step 2/7: Setting up Node.js environment..."
$DEPLOY_DIR/setup_nodejs.sh
echo "Node.js setup complete."

# 3. Setup Nginx for staging (without SSL)
echo "Step 3/7: Setting up Nginx (without SSL)..."

# Install Nginx
apt update
apt install -y nginx

# Create custom Nginx log directory if it doesn't exist
mkdir -p /var/log/nginx

# Create staging Nginx configuration
cat > /etc/nginx/sites-available/themis << EOF
server {
    listen 80;
    server_name ${SERVER_NAME:-localhost};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";

    # Client max body size
    client_max_body_size 10M;

    # API proxy
    location /api {
        proxy_pass http://localhost:${PORT:-3000}/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static assets served directly by Nginx
    location /static {
        alias /var/www/themis/build/static;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        gzip on;
        gzip_vary on;
        gzip_min_length 1000;
        gzip_proxied any;
        gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;
    }

    # Uploads directory
    location /uploads {
        alias /var/www/themis/uploads;
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
    }

    # All other requests go to the React app
    location / {
        root /var/www/themis/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Logging
    access_log /var/log/nginx/themis-access.log;
    error_log /var/log/nginx/themis-error.log;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/themis /etc/nginx/sites-enabled/

# Remove default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
  rm /etc/nginx/sites-enabled/default
fi

# Test Nginx configuration
nginx -t

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

echo "Nginx configured successfully."

# 4. Create database and schema
echo "Step 4/7: Setting up database schema..."
$DEPLOY_DIR/setup_database.sh
echo "Database setup complete."

# 5. Create admin user (if the script exists)
if [ -f "$DEPLOY_DIR/create_admin_user.sh" ]; then
    echo "Step 5/7: Creating admin user..."
    $DEPLOY_DIR/create_admin_user.sh
    echo "Admin user created."
else
    echo "Step 5/7: Skipping admin user creation (script not found)."
fi

# 6. Deploy application code (client)
echo "Step 6/7: Deploying client application..."
read -p "Enter the path to your themis-client directory: " CLIENT_DIR
if [ -d "$CLIENT_DIR" ]; then
    cd "$CLIENT_DIR"
    npm install
    npm run build
    cp -r build/* /var/www/themis/build/
    echo "Client application deployed."
else
    echo "Error: Client directory not found. Skipping client deployment."
fi

# 7. Deploy and start server
echo "Step 7/7: Deploying and starting server..."
read -p "Enter the path to your server directory: " SERVER_DIR
if [ -d "$SERVER_DIR" ]; then
    cd "$SERVER_DIR"
    npm install
    npm run build
    
    # Install PM2 if not already installed
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Start the application with PM2
    pm2 start dist/index.js --name themis
    pm2 save
    pm2 startup
    echo "Server deployed and started."
else
    echo "Error: Server directory not found. Skipping server deployment."
fi

echo ""
echo "=========================================================="
echo "Themis deployment for staging environment completed!"
echo "=========================================================="
echo ""
echo "Your application should now be accessible at:"
echo "http://${SERVER_NAME:-localhost}"
echo ""
echo "If you need to make changes:"
echo "1. Client files are in: /var/www/themis/build/"
echo "2. Server is running with PM2, manage it with: pm2 [status|logs|restart|stop] themis"
echo "3. Database is running with PostgreSQL"
echo "4. Nginx configuration is at: /etc/nginx/sites-available/themis"
echo ""
echo "For SSL in the future: sudo apt install certbot python3-certbot-nginx"
echo "Then run: sudo certbot --nginx -d your-domain.com"
echo ""
echo "Enjoy your Themis deployment!" 