#!/bin/bash
# Script to prepare deployment packages for Themis

echo "Preparing Themis deployment packages..."

# Set the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Create packages directory if it doesn't exist
mkdir -p "$SCRIPT_DIR/packages"

# Package deployment scripts and configurations
echo "Packaging deployment scripts and configurations..."
cd "$SCRIPT_DIR"
tar -czvf "packages/themis-deployment.tar.gz" config *.sh README.md DEPLOYMENT_STEPS.md

# Build the client application if needed
if [ "$1" == "--build-client" ]; then
  echo "Building client application..."
  cd "$ROOT_DIR/themis-client"
  npm install
  npm run build
fi

# Package the client build
echo "Packaging client build..."
cd "$ROOT_DIR/themis-client/build"
tar -czvf "$SCRIPT_DIR/packages/themis-client-build.tar.gz" *

echo "Deployment packages created successfully!"
echo "You can find them in: $SCRIPT_DIR/packages/"
echo "- themis-deployment.tar.gz: Deployment scripts and configurations"
echo "- themis-client-build.tar.gz: Built client application"
echo ""
echo "Next steps:"
echo "1. Transfer these packages to your server"
echo "2. Follow the instructions in DEPLOYMENT_STEPS.md" 