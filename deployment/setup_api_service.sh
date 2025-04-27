#!/bin/bash
# Setup script for Themis API systemd service

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo -e "${RED}Error: This script must be run as root or with sudo${NC}" 1>&2
   echo "Please run: sudo $0"
   exit 1
fi

# Deployment directory
DEPLOY_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo -e "${BOLD}Setting up Themis API service${NC}"

# Copy the service file to systemd
if [ -f "$DEPLOY_DIR/config/themis-api.service" ]; then
    cp "$DEPLOY_DIR/config/themis-api.service" /etc/systemd/system/
    echo "✓ Service file copied to /etc/systemd/system/"
else
    echo -e "${RED}Error: Service template file not found at $DEPLOY_DIR/config/themis-api.service${NC}"
    exit 1
fi

# Reload systemd to recognize the new service
systemctl daemon-reload
echo "✓ Systemd daemon reloaded"

# Enable the service to start on boot
systemctl enable themis-api
echo "✓ Themis API service enabled to start on boot"

# Start the service
systemctl start themis-api
echo "✓ Themis API service started"

# Check the status
echo -e "\n${BOLD}Checking service status:${NC}"
systemctl status themis-api --no-pager

echo -e "\n${GREEN}${BOLD}Themis API service setup completed successfully!${NC}"
echo -e "${BOLD}Commands to manage the service:${NC}"
echo "  - Check status: sudo systemctl status themis-api"
echo "  - Start service: sudo systemctl start themis-api" 
echo "  - Stop service: sudo systemctl stop themis-api"
echo "  - Restart service: sudo systemctl restart themis-api"
echo "  - View logs: sudo journalctl -u themis-api -f" 