#!/bin/bash

# Exit on error
set -e

echo "Starting Netlify deployment process..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Clean build directory
echo "Cleaning previous build..."
rm -rf build

# Build the project
echo "Building project..."
npm run build

# Verify _redirects file and netlify.toml file exist
echo "Verifying deployment files..."
if [ ! -f build/_redirects ]; then
  echo "Creating _redirects file..."
  echo "/* /index.html 200" > build/_redirects
fi

if [ ! -f build/netlify.toml ]; then
  echo "Creating netlify.toml file in build directory..."
  cat > build/netlify.toml << EOF
[build]
  publish = "."

# Handle SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
fi

# If netlify-cli is not installed, install it
if ! command -v netlify &> /dev/null; then
  echo "Installing netlify-cli..."
  npm install -g netlify-cli
fi

# Deploy to Netlify
echo "Deploying to Netlify..."
if [ "$1" = "--prod" ]; then
  netlify deploy --prod --dir=build
else
  netlify deploy --dir=build
fi

echo "Deployment process completed!" 