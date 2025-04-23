#!/bin/bash
# Script to update the /etc/hosts file with the server hostname and IP

# Set variables
SERVER_IP="172.28.17.95"
SERVER_HOSTNAME="modbndc1tms01.defence.local"
SERVER_SUBDOMAIN="pmo.projects.mod.qa"

# Check if running as root
if [ "$(id -u)" != "0" ]; then
   echo "This script must be run as root" 1>&2
   exit 1
fi

# Check if the entry already exists
if grep -q "$SERVER_IP $SERVER_HOSTNAME $SERVER_SUBDOMAIN" /etc/hosts; then
    echo "Hosts entry already exists."
else
    # Add entry to /etc/hosts
    echo "Adding host entry to /etc/hosts..."
    echo "$SERVER_IP $SERVER_HOSTNAME $SERVER_SUBDOMAIN" >> /etc/hosts
    echo "Hosts file updated successfully."
fi

# Display the current hosts file
echo "Current /etc/hosts file:"
cat /etc/hosts 