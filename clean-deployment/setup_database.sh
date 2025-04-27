#!/bin/bash
# Database setup script for Themis

# Load environment variables if .env exists
if [ -f "$DEPLOY_DIR/.env" ]; then
    source "$DEPLOY_DIR/.env"
else
    echo "Error: .env file not found. Please create one based on env.sample"
    exit 1
fi

# Set default values if not set in environment
DB_USER=${DB_USER:-"themis_user"}
DB_NAME=${DB_NAME:-"themis_db"}
DB_HOST=${DB_HOST:-"172.28.17.95"}
DB_PORT=${DB_PORT:-"5432"}

# Create database and user
sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME WITH OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

# Connect to the database and create schema
sudo -u postgres psql -d $DB_NAME << EOF
-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS themis;

-- Set search path
SET search_path TO themis, public;

-- Create tables
CREATE TABLE IF NOT EXISTS themis.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS themis.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS themis.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2) DEFAULT 0.00,
    progress INTEGER DEFAULT 0,
    department_id UUID REFERENCES themis.departments(id),
    project_manager_id UUID REFERENCES themis.users(id),
    created_by UUID REFERENCES themis.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint to users table
ALTER TABLE themis.users ADD CONSTRAINT fk_users_departments
    FOREIGN KEY (department_id) REFERENCES themis.departments(id);

-- Additional tables will be created based on the application requirements
EOF

echo "Database setup completed." 