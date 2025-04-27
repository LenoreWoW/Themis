#!/bin/bash
# Main deployment script for Themis

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
        echo "Created .env file from template. Please update it with actual values."
        exit 1
    else
        echo "Error: env.sample file not found. Cannot create .env file."
        exit 1
    fi
fi

# Create base directories
mkdir -p /var/www/themis/build/static
mkdir -p /var/www/themis/uploads
chmod -R 755 /var/www/themis

# Set all scripts as executable
chmod +x $DEPLOY_DIR/*.sh

# 1. Install PostgreSQL
echo "Installing PostgreSQL..."
if [ -f "$DEPLOY_DIR/install_postgres.sh" ]; then
    $DEPLOY_DIR/install_postgres.sh
else
    echo "Installing PostgreSQL directly..."
    apt update
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql
fi

# 2. Setup Node.js environment
echo "Setting up Node.js environment..."
$DEPLOY_DIR/setup_nodejs.sh

# 3. Setup Nginx
echo "Setting up Nginx..."
$DEPLOY_DIR/setup_nginx.sh

# 4. Create database and schema
echo "Setting up database schema..."
$DEPLOY_DIR/setup_database.sh

# 5. Create admin user (if the script exists)
if [ -f "$DEPLOY_DIR/create_admin_user.sh" ]; then
    echo "Creating admin user..."
    $DEPLOY_DIR/create_admin_user.sh
fi

echo ""
echo "=========================================================="
echo "Themis deployment completed successfully!"
echo "=========================================================="
echo ""
echo "Next steps:"
echo "1. Update SSL certificate:"
echo "   sudo certbot --nginx -d pmo.projects.mod.qa"
echo ""
echo "2. Deploy application code (client):"
echo "   cd /path/to/themis/themis-client"
echo "   npm install"
echo "   npm run build"
echo "   cp -r build/* /var/www/themis/build/"
echo ""
echo "3. Deploy server code:"
echo "   cd /path/to/themis/server"
echo "   npm install"
echo "   npm run build"
echo ""
echo "4. Start the application with PM2:"
echo "   cd /path/to/themis/server"
echo "   pm2 start dist/index.js --name themis"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "5. Verify the application is running:"
echo "   https://pmo.projects.mod.qa"
echo ""
echo "Enjoy your Themis deployment!" 