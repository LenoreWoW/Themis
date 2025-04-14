#!/bin/bash

# Database connection variables (adjust these as needed)
DB_NAME="themis"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

echo "Running department and user setup script..."

# Run the SQL script
psql -h $DB_HOST -p $DB_PORT -d $DB_NAME -U $DB_USER -f create_hold_department.sql

# Check if the script was successful
if [ $? -eq 0 ]; then
    echo "Setup completed successfully!"
else
    echo "Setup failed. Check the error messages above."
fi