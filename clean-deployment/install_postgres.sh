#!/bin/bash
# PostgreSQL installation script

# Update package list
sudo apt update

# Install PostgreSQL and required packages
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service and enable on boot
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Check if PostgreSQL is running
sudo systemctl status postgresql

echo "PostgreSQL installed successfully!" 