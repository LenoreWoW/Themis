# Themis Data Migration to Supabase

This document provides a comprehensive guide for migrating the Themis database from `pmo.projects.mod.qa` to Supabase.

## Prerequisites

- Access to the source database at `pmo.projects.mod.qa`
- PostgreSQL client tools (`psql`, `pg_dump`)
- Supabase project set up with the following credentials:
  - URL: `https://jxtsbjkfashodslayoaw.supabase.co`
  - Anon key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw`
  - Service role key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI3NzU3NiwiZXhwIjoyMDYxODUzNTc2fQ.E80s0mW2s9l6D3z1YWjRaT6CKuvNWf5ObdQAdBygZg8`

## Migration Process

### Step 1: Create Database Schema in Supabase

1. Log in to your Supabase project
2. Navigate to the SQL Editor
3. Copy and execute the SQL script below to create the database schema:

```sql
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
```

### Step 2: Export Data from Source Database

Connect to the source database and export data from each table in JSON format:

```bash
# Export Users table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM users) TO 'exported-data/users.json' WITH (FORMAT json);"

# Export Projects table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM projects) TO 'exported-data/projects.json' WITH (FORMAT json);"

# Export Tasks table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM tasks) TO 'exported-data/tasks.json' WITH (FORMAT json);"

# Export Comments table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM comments) TO 'exported-data/comments.json' WITH (FORMAT json);"

# Export Documents table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM documents) TO 'exported-data/documents.json' WITH (FORMAT json);"

# Export Notifications table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM notifications) TO 'exported-data/notifications.json' WITH (FORMAT json);"

# Export Project Closures table
psql -h pmo.projects.mod.qa -U your_username -d themisdb -c "\copy (SELECT * FROM project_closures) TO 'exported-data/project_closures.json' WITH (FORMAT json);"
```

### Step 3: Import Data to Supabase

Use the provided migration script to import data to Supabase:

```bash
# Install required dependencies
npm install @supabase/supabase-js fs path

# Create scripts directory if it doesn't exist
mkdir -p src/scripts

# Run the data migration script
npx ts-node src/scripts/migrate-data.ts
```

Alternatively, you can use the Supabase UI to import the data:

1. Log in to your Supabase project
2. Navigate to the Table Editor
3. Select the table you want to import data to
4. Click on "Import" and select the corresponding JSON file
5. Repeat for each table

### Step 4: Configure Row-Level Security (RLS) Policies

For secure access to your data, set up Row-Level Security policies in Supabase:

1. Log in to your Supabase project
2. Navigate to Authentication > Policies
3. Create appropriate policies for each table

Example policy for projects table:

```sql
-- Allow users to read projects
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT
  USING (true);

-- Allow project managers to update their own projects
CREATE POLICY "Project managers can update their projects" ON projects
  FOR UPDATE
  USING (auth.uid() = project_manager_id);

-- Allow admins to update any project
CREATE POLICY "Admins can update any project" ON projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'ADMIN'
    )
  );
```

### Step 5: Update Application Configuration

Update your application to use Supabase by setting the following environment variables:

```
REACT_APP_SUPABASE_URL=https://jxtsbjkfashodslayoaw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNzc1NzYsImV4cCI6MjA2MTg1MzU3Nn0.KdqGGqc1r0LjHLgPZnfKff7seIcmFdJiDT3bTEBKHdw
```

### Step 6: Verify the Migration

To verify the migration was successful:

1. Check the row count in each table matches the source database
2. Test basic CRUD operations through your application
3. Review data integrity to ensure relationships are preserved

## Troubleshooting

### Common Issues

1. **Foreign Key Constraints**: Import tables in order of their dependencies (users → projects → tasks, etc.)
2. **UUID Generation**: Make sure the UUID extension is enabled in Supabase
3. **Data Format**: Ensure exported JSON files have the correct format for Supabase imports

### Getting Help

If you encounter any issues during migration:

1. Check the Supabase documentation: https://supabase.com/docs
2. Review the migration script logs for specific errors
3. Contact the development team for assistance

## Post-Migration Tasks

After successful migration:

1. Update any applications to point to the new Supabase database
2. Set up backup strategies for the Supabase database
3. Monitor performance and adjust indexes as needed 