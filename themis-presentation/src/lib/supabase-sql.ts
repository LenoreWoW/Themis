import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://jxtsbjkfashodslayoaw.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4dHNiamtmYXNob2RzbGF5b2F3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjI3NzU3NiwiZXhwIjoyMDYxODUzNTc2fQ.E80s0mW2s9l6D3z1YWjRaT6CKuvNWf5ObdQAdBygZg8';

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Database setup script combining all tables
const setupScript = `
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
`;

// Function to set up the database schema
export async function setupDatabaseSchema() {
  console.log('Starting database schema setup...');
  
  try {
    // Execute SQL script in the Supabase SQL Editor via API
    // Note: This is a direct approach and would need to be run in the Supabase SQL Editor UI
    // as programmatic SQL execution may be limited based on account tier
    console.log('Please run the following SQL in the Supabase SQL Editor:');
    console.log(setupScript);
    
    // For documentation only - actual SQL execution would need to be done manually in Supabase UI
    console.log('Database schema setup completed (instructions provided).');
    return true;
  } catch (error) {
    console.error('Error during database schema setup:', error);
    return false;
  }
}

// Sample function to insert test data
export async function insertTestData() {
  console.log('Inserting test data...');
  
  try {
    // Insert sample user if not exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([
        { 
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'PROJECT_MANAGER',
          department: 'IT'
        }
      ], { onConflict: 'email' })
      .select();
    
    if (userError) throw userError;
    console.log('Sample user created:', userData);
    
    // Insert a sample project using the user
    const userId = userData[0].id;
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name: 'Sample Project',
          description: 'This is a sample project for testing',
          status: 'ACTIVE',
          budget: 50000,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          project_manager_id: userId,
          department: 'IT'
        }
      ])
      .select();
    
    if (projectError) throw projectError;
    console.log('Sample project created:', projectData);
    
    console.log('Test data inserted successfully.');
    return true;
  } catch (error) {
    console.error('Error inserting test data:', error);
    return false;
  }
}

// Execute setup if running this file directly
if (require.main === module) {
  setupDatabaseSchema()
    .then(success => {
      if (success) {
        console.log('Database schema setup instructions provided.');
        console.log('After running the SQL in Supabase SQL Editor, you can insert test data.');
        
        // For safety, don't auto-insert test data - uncomment if needed
        // return insertTestData();
      }
    })
    .catch(error => {
      console.error('Setup failed with error:', error);
      process.exit(1);
    });
}

export default supabase; 