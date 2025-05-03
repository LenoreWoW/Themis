import { createClient } from '@supabase/supabase-js';

// Supabase URL and service role key (use service role for schema creation)
const supabaseUrl = 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI3NzU3NiwiZXhwIjoyMDYxODUzNTc2fQ.E80s0mW2s9l6D3z1YWjRaT6CKuvNWf5ObdQAdBygZg8';

// Create a Supabase client with the Admin key
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// SQL statements to create the database schema based on pmo.projects.mod.qa
const createUsersTable = `
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

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`;

const createProjectsTable = `
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_pm ON projects(project_manager_id);
`;

const createTasksTable = `
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
`;

const createCommentsTable = `
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_comments_project ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
`;

const createDocumentsTable = `
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id);
`;

const createNotificationsTable = `
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
`;

const createProjectClosureTable = `
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

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_closures_project ON project_closures(project_id);
CREATE INDEX IF NOT EXISTS idx_closures_status ON project_closures(status);
`;

// Function to execute SQL query
async function executeQuery(query: string, queryName: string) {
  try {
    const { error } = await supabase.rpc('exec', { query });
    
    if (error) {
      console.error(`Error executing ${queryName}:`, error);
      return false;
    }
    
    console.log(`Successfully executed ${queryName}`);
    return true;
  } catch (error) {
    console.error(`Exception executing ${queryName}:`, error);
    return false;
  }
}

// Main function to set up the database
export async function setupDatabase() {
  console.log('Starting database setup...');
  
  try {
    // Enable uuid-ossp extension for UUID generation
    await executeQuery(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
      'Enable UUID extension'
    );
    
    // Create tables
    await executeQuery(createUsersTable, 'Create Users table');
    await executeQuery(createProjectsTable, 'Create Projects table');
    await executeQuery(createTasksTable, 'Create Tasks table');
    await executeQuery(createCommentsTable, 'Create Comments table');
    await executeQuery(createDocumentsTable, 'Create Documents table');
    await executeQuery(createNotificationsTable, 'Create Notifications table');
    await executeQuery(createProjectClosureTable, 'Create Project Closures table');
    
    console.log('Database setup completed.');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    return false;
  }
}

// Execute the setup if this script is run directly
if (require.main === module) {
  setupDatabase()
    .then((success) => {
      console.log(`Database setup ${success ? 'successful' : 'failed'}.`);
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error during database setup:', error);
      process.exit(1);
    });
}

export default supabase; 