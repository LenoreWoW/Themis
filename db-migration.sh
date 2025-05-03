#!/bin/bash

# Database migration script for Themis
# This script helps migrate the PostgreSQL database from the existing server to a cloud database service

# Set variables (replace with actual values)
SOURCE_DB_HOST="api.pmo.projects.mod.qa"
SOURCE_DB_NAME="themisdb"
SOURCE_DB_USER="postgres"
SOURCE_DB_PASSWORD="postgres"

TARGET_DB_URL="${DATABASE_URL:-postgresql://user:password@host:port/dbname}"

echo "Starting database migration..."

# Create directory for database dumps
mkdir -p db_migration

# Step 1: Dump the schema from the source database
echo "Dumping schema from source database..."
PGPASSWORD=$SOURCE_DB_PASSWORD pg_dump -h $SOURCE_DB_HOST -U $SOURCE_DB_USER -d $SOURCE_DB_NAME --schema-only -f db_migration/schema.sql

# Step 2: Dump data from the source database
echo "Dumping data from source database..."
PGPASSWORD=$SOURCE_DB_PASSWORD pg_dump -h $SOURCE_DB_HOST -U $SOURCE_DB_USER -d $SOURCE_DB_NAME --data-only --inserts -f db_migration/data.sql

# Step 3: Apply schema to target database
echo "Applying schema to target database..."
psql $TARGET_DB_URL -f db_migration/schema.sql

# Step 4: Apply data to target database
echo "Applying data to target database..."
psql $TARGET_DB_URL -f db_migration/data.sql

echo "Database migration completed!"
echo ""
echo "Next steps:"
echo "1. Verify the data in the target database"
echo "2. Update the DATABASE_URL in Netlify environment variables"
echo "3. Update the API configuration to use the new database"

# Cleanup
# Uncomment the following line if you want to clean up the dump files
# rm -rf db_migration 