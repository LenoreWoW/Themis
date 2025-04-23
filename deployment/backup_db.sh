#!/bin/bash
# PostgreSQL backup script for Themis

# Configuration
BACKUP_DIR="/opt/themis/backups"
DB_NAME="themis_db"
DB_USER="themis_user"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating database backup..."
pg_dump -U $DB_USER -d $DB_NAME -F c -f "$BACKUP_DIR/themis_backup_$TIMESTAMP.dump"

# Delete backups older than 7 days
echo "Cleaning up old backups..."
find $BACKUP_DIR -type f -mtime +7 -name "*.dump" -delete

echo "Backup completed: $BACKUP_DIR/themis_backup_$TIMESTAMP.dump" 