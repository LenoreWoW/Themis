#!/bin/bash

# Build the application
npm run build

# Create directory structure that matches Netlify's expectation
mkdir -p ../themis-client-final/build

# Copy build output to the expected location
cp -R build/* ../themis-client-final/build/

echo "Build files copied to ../themis-client-final/build for Netlify deployment" 