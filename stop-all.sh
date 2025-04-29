#!/bin/bash
LOG_FILE="/Users/hassanalsahli/Desktop/Themis/shutdown.log"
touch $LOG_FILE
log() { echo "$(date): $1" >> $LOG_FILE; }
log "Stopping Nginx..."
brew services stop nginx
log "Stopping API..."
pkill -f "dotnet run.*Themis.API" || log "API was not running"
log "Stopping React client..."
pkill -f "node.*react-scripts.*start" || log "React client was not running"
log "Shutdown complete. All services stopped."
echo "All services stopped."
