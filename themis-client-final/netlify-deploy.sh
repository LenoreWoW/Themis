#!/bin/bash

# Exit on error
set -e

# Themis Netlify Deployment Script

echo "====================================================="
echo "Themis Netlify Deployment"
echo "====================================================="

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "Netlify CLI not found, installing..."
    npm install -g netlify-cli
else
    echo "Netlify CLI is already installed."
fi

# Ensure we have the latest dependencies
echo "Installing dependencies..."
npm install

# Set up environment variables for Supabase
echo "Setting up environment variables..."
export REACT_APP_SUPABASE_URL=https://jxtsbjkfashodslayoaw.supabase.co
export REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw

# Build the application
echo "Building the application..."
npm run build

# Check if the build was successful
if [ ! -d "./build" ]; then
    echo "Error: Build failed. The 'build' directory does not exist."
    exit 1
fi

# Check if user is logged in to Netlify
netlify status 2>&1 | grep -q "Logged in" || {
    echo "Not logged into Netlify. Please log in:"
    netlify login
}

# Deploy to Netlify
echo "Deploying to Netlify..."
if [[ "$1" == "--prod" ]]; then
    # Production deployment
    echo "Running production deployment..."
    netlify deploy --prod --message "Production deployment $(date)"
else
    # Preview deployment
    echo "Running preview deployment..."
    netlify deploy --message "Preview deployment $(date)"
    
    # Offer to promote to production
    echo ""
    read -p "Would you like to promote this deploy to production? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Promoting to production..."
        netlify deploy --prod
    fi
fi

echo "====================================================="
echo "Deployment process completed."
echo "=====================================================" 