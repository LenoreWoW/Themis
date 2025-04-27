#!/bin/bash
# Main deployment script for Themis Project Management System
# This script performs all necessary steps to set up Themis on a fresh server

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Set the current directory for reference
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "${BOLD}Themis Deployment Script${NC}"
echo "Starting deployment process..."
echo "Deployment directory: $DEPLOY_DIR"
echo "------------------------------------------------------"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}Error: This script must be run as root or with sudo${NC}" 1>&2
   echo "Please run: sudo $0"
   exit 1
fi

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    echo "Deployment failed at step: $2"
    echo "Check the error message above and try to resolve the issue."
    echo "For more help, consult the troubleshooting section in README.md"
    exit 1
}

# Step 1: Create environment variable file
echo -e "${BOLD}Step 1: Setting up environment variables${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    if [ -f "$DEPLOY_DIR/config/env.sample" ]; then
        cp "$DEPLOY_DIR/config/env.sample" "$DEPLOY_DIR/.env"
        echo -e "${YELLOW}Created .env file from template.${NC}"
        echo "You should edit this file with your actual values before continuing."
        echo -e "Run: ${BOLD}nano $DEPLOY_DIR/.env${NC}"
        
        read -p "Would you like to edit the .env file now? [y/n]: " edit_env
        if [[ $edit_env == "y" || $edit_env == "Y" ]]; then
            nano "$DEPLOY_DIR/.env"
        else
            echo "Please make sure to edit the .env file before continuing!"
            read -p "Continue with deployment? [y/n]: " continue_deploy
            if [[ $continue_deploy != "y" && $continue_deploy != "Y" ]]; then
                echo "Deployment paused. Resume when you're ready by running this script again."
                exit 0
            fi
        fi
    else
        handle_error "env.sample file not found. Cannot create .env file." "Environment setup"
    fi
fi

# Step 2: Create base directories
echo -e "\n${BOLD}Step 2: Creating application directories${NC}"
mkdir -p /var/www/themis/build/static || handle_error "Failed to create web directories" "Directory creation"
mkdir -p /var/www/themis/uploads || handle_error "Failed to create uploads directory" "Directory creation"
chmod -R 755 /var/www/themis
echo "✓ Application directories created successfully"

# Set all scripts as executable
chmod +x $DEPLOY_DIR/*.sh || handle_error "Failed to make scripts executable" "Script setup"

# Step 3: Install PostgreSQL
echo -e "\n${BOLD}Step 3: Installing PostgreSQL${NC}"
if [ -f "$DEPLOY_DIR/install_postgres.sh" ]; then
    $DEPLOY_DIR/install_postgres.sh || handle_error "PostgreSQL installation failed" "PostgreSQL setup"
else
    echo "Installing PostgreSQL directly..."
    apt update || handle_error "apt update failed" "PostgreSQL setup"
    apt install -y postgresql postgresql-contrib || handle_error "PostgreSQL installation failed" "PostgreSQL setup"
    systemctl enable postgresql || handle_error "Failed to enable PostgreSQL service" "PostgreSQL setup"
    systemctl start postgresql || handle_error "Failed to start PostgreSQL service" "PostgreSQL setup"
fi
echo "✓ PostgreSQL installed successfully"

# Step 4: Setup Node.js environment
echo -e "\n${BOLD}Step 4: Setting up Node.js environment${NC}"
$DEPLOY_DIR/setup_nodejs.sh || handle_error "Node.js setup failed" "Node.js setup"
echo "✓ Node.js environment set up successfully"

# Step 5: Setup Nginx
echo -e "\n${BOLD}Step 5: Setting up Nginx web server${NC}"
$DEPLOY_DIR/setup_nginx.sh || handle_error "Nginx setup failed" "Nginx setup"
echo "✓ Nginx set up successfully"

# Step 6: Create database and schema
echo -e "\n${BOLD}Step 6: Setting up database schema${NC}"
$DEPLOY_DIR/setup_database.sh || handle_error "Database setup failed" "Database setup"
echo "✓ Database schema set up successfully"

# Step 7: Create admin user (if the script exists)
echo -e "\n${BOLD}Step 7: Creating admin user${NC}"
if [ -f "$DEPLOY_DIR/create_admin_user.sh" ]; then
    $DEPLOY_DIR/create_admin_user.sh || handle_error "Admin user creation failed" "User setup"
    echo "✓ Admin user created successfully"
else
    echo -e "${YELLOW}Warning: create_admin_user.sh not found. Skipping admin user creation.${NC}"
    echo "You'll need to create an admin user manually."
fi

# Final success message
echo -e "\n${GREEN}${BOLD}=========================================================${NC}"
echo -e "${GREEN}${BOLD}Themis deployment completed successfully!${NC}"
echo -e "${GREEN}${BOLD}=========================================================${NC}"
echo ""
echo -e "${BOLD}Next steps:${NC}"
echo ""
echo "1. Set up SSL certificate:"
echo -e "   ${BOLD}sudo certbot --nginx -d your-domain.com${NC}"
echo ""
echo "2. Deploy the frontend (client):"
echo -e "   ${BOLD}cd /opt/themis/themis-client${NC}"
echo -e "   ${BOLD}npm install${NC}"
echo -e "   ${BOLD}npm run build${NC}"
echo -e "   ${BOLD}cp -r build/* /var/www/themis/build/${NC}"
echo ""
echo "3. Deploy the backend (.NET Core API):"
echo -e "   ${BOLD}cd /opt/themis/Themis.API${NC}"
echo -e "   ${BOLD}dotnet restore${NC}"
echo -e "   ${BOLD}dotnet build${NC}"
echo -e "   ${BOLD}sudo systemctl start themis-api${NC}"
echo ""
echo "4. Verify the application is running:"
echo -e "   ${BOLD}https://your-domain.com${NC} or ${BOLD}http://your-server-ip${NC}"
echo ""
echo "5. Default admin login (change password immediately):"
echo -e "   ${BOLD}Username:${NC} admin@themis.com"
echo -e "   ${BOLD}Password:${NC} Admin123\$"
echo ""
echo "For detailed documentation and troubleshooting:"
echo -e "   ${BOLD}cat /opt/themis/deployment/README.md${NC}"
echo "" 