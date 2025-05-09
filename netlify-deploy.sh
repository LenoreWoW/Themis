#!/bin/bash

# Netlify deployment script for Themis
# This script prepares both frontend and API for deployment

echo "Starting Themis deployment to Netlify..."

# 1. Update git repository
git pull origin main

# 2. Ensure the _redirects file is properly set up
echo "Setting up _redirects file..."
echo "/static/* /static/:splat 200" > themis-client-final/public/_redirects
echo "/assets/* /assets/:splat 200" >> themis-client-final/public/_redirects
echo "/* /index.html 200" >> themis-client-final/public/_redirects

# 3. Build and deploy frontend
echo "Deploying frontend to Netlify..."
# Netlify CLI will handle this via netlify.toml configuration
# Just to make sure everything is correct, let's check the config
if [ ! -f netlify.toml ]; then
  echo "netlify.toml not found! Deployment may fail."
  exit 1
fi

# 4. Configure API for production if needed
echo "Configuring API for production..."
# Ensure the API is properly configured to accept requests from Netlify domain
# This includes CORS, database connections, etc.

# 5. Ensure database persistence
echo "Configuring database persistence..."
# The API is connecting to PostgreSQL database at api.pmo.projects.mod.qa
# No action needed if the database is already deployed and configured properly

# 6. Deploy using Netlify CLI (if installed)
if command -v netlify &> /dev/null; then
  echo "Deploying via Netlify CLI..."
  
  # Ensure build directory is clean
  rm -rf themis-client-final/build
  
  # Build the project
  cd themis-client-final && npm run build && cd ..
  
  # Double-check _redirects file exists in the build directory
  if [ ! -f themis-client-final/build/_redirects ]; then
    echo "WARNING: _redirects file not found in build directory. Creating it now..."
    echo "/static/* /static/:splat 200" > themis-client-final/build/_redirects
    echo "/assets/* /assets/:splat 200" >> themis-client-final/build/_redirects
    echo "/* /index.html 200" >> themis-client-final/build/_redirects
  fi
  
  # Deploy to Netlify
  netlify deploy --prod
else
  echo "Netlify CLI not found. Please deploy manually via Netlify dashboard"
  echo "1. Go to app.netlify.com"
  echo "2. Connect to your GitHub repository"
  echo "3. Configure build settings as specified in netlify.toml"
  echo "4. Deploy the site"
fi

echo "Deployment preparation complete!"
echo "Remember to verify the following:"
echo "1. API is accessible from Netlify domain"
echo "2. Database connection is working correctly"
echo "3. CORS is properly configured to accept requests from Netlify domain" 