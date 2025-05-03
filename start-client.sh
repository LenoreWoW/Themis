#!/bin/bash

# CD to themis client directory
cd themis-client-final

# Start a static server to serve the production build
echo "Starting Themis Client on port 3000..."
npx serve -s build 