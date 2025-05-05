#!/bin/bash

# Themis Supabase Setup Script

echo "========================================="
echo "Themis Supabase Database Setup"
echo "========================================="

# Create required directories
mkdir -p exported-data src/scripts

# Check if .env exists, if not create a template
if [ ! -f .env ]; then
  echo "Creating .env file template..."
  cat > .env << EOL
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://jxtsbjkfashodslayoaw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw

# API Configuration
REACT_APP_API_URL=http://localhost:3000/api
EOL
  echo ".env file created with Supabase credentials."
else
  echo ".env file already exists. Skipping creation."
fi

# Install required dependencies
echo "Installing required dependencies..."
npm install @supabase/supabase-js fs path

# Check if esbuild is installed
if ! npm list -g esbuild > /dev/null 2>&1; then
  echo "Installing esbuild for TypeScript compilation..."
  npm install -g esbuild
fi

# Create dist directory if it doesn't exist
mkdir -p dist

# Generate SQL script file
echo "Generating SQL script for Supabase setup..."
cat > supabase-setup.sql << EOL
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT,
  department TEXT,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  budget NUMERIC(15, 2),
  start_date DATE,
  end_date DATE,
  project_manager_id UUID REFERENCES users(id),
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pm ON projects(project_manager_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'TODO',
  priority TEXT NOT NULL DEFAULT 'MEDIUM',
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  type TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Project Closures table
CREATE TABLE IF NOT EXISTS project_closures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  actual_end_date DATE,
  final_budget_spent NUMERIC(15, 2),
  completion_percentage INTEGER,
  status TEXT NOT NULL DEFAULT 'PENDING',
  closure_notes TEXT,
  submitted_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_closures_project ON project_closures(project_id);
CREATE INDEX IF NOT EXISTS idx_closures_status ON project_closures(status);

-- Sample admin user for initial setup
INSERT INTO users (email, full_name, role)
VALUES ('admin@example.com', 'Admin User', 'ADMIN')
ON CONFLICT (email) DO NOTHING;
EOL

echo "SQL script generated: supabase-setup.sql"

# Create a sample JSON file for migration testing
echo "Creating sample JSON data file for testing..."
cat > exported-data/users.json << EOL
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "admin@example.com",
    "full_name": "Admin User",
    "role": "ADMIN",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  },
  {
    "id": "00000000-0000-0000-0000-000000000002",
    "email": "manager@example.com",
    "full_name": "Project Manager",
    "role": "PROJECT_MANAGER",
    "department": "IT",
    "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  }
]
EOL

echo "Sample data file created: exported-data/users.json"

echo "========================================="
echo "Setup complete. Next steps:"
echo "========================================="
echo "1. Sign in to Supabase at https://app.supabase.io"
echo "2. Navigate to the SQL Editor in your project"
echo "3. Paste the contents of supabase-setup.sql and run it"
echo "4. To import sample data, run: npm run migrate-data"
echo ""
echo "For complete migration instructions, refer to the MIGRATION.md file."
echo "=========================================" 