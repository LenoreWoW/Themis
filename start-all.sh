#!/bin/bash

# Log file
LOG_FILE="/Users/hassanalsahli/Desktop/Themis/startup.log"

# Create log file if it doesn't exist
touch $LOG_FILE

# Function to log messages
log() {
    echo "$(date): $1" >> $LOG_FILE
}

# Start Nginx
log "Starting Nginx..."
brew services restart nginx

# Wait for Nginx to start
sleep 2

# Start the API in the background
log "Starting API..."
/Users/hassanalsahli/Desktop/Themis/start-api.sh > /Users/hassanalsahli/Desktop/Themis/api.log 2> /Users/hassanalsahli/Desktop/Themis/api-error.log &

# Wait for API to initialize
sleep 5

# Start the React client in the background
log "Starting React client..."
/Users/hassanalsahli/Desktop/Themis/start-client.sh > /Users/hassanalsahli/Desktop/Themis/client.log 2> /Users/hassanalsahli/Desktop/Themis/client-error.log &

# Done
log "Startup complete. Services are running."
echo "All services started. Check logs for details." 