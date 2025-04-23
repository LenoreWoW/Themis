# Themis Migration Guide: localStorage to PostgreSQL

This guide provides detailed instructions for migrating the Themis application from using localStorage for data persistence to PostgreSQL.

## Overview

The current implementation of Themis uses browser localStorage to store application data. This migration will:

1. Set up a PostgreSQL database with appropriate schema
2. Create a backend API that connects to PostgreSQL
3. Migrate existing data from localStorage to the database
4. Update the frontend to use the new API endpoints

## Prerequisites

- PostgreSQL installed and configured (see deployment scripts)
- Node.js and npm installed
- Knex.js query builder

## Step 1: Database Connection Setup

1. Install required dependencies:

```bash
npm install knex pg dotenv
npm install --save-dev @types/node @types/pg
```

2. Create a database connection file at `server/src/config/db.ts`:

```typescript
import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'themis_user',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'themis_db',
  },
  pool: { 
    min: 0, 
    max: 7 
  },
  debug: process.env.NODE_ENV !== 'production'
});

export default db;
```

## Step 2: Create Data Models

Create model files for each entity in your application. For example, create `server/src/models/Project.ts`:

```typescript
import db from '../config/db';
import { Project } from '../types';

export const getProjects = async (): Promise<Project[]> => {
  try {
    const projects = await db('projects')
      .select('*')
      .orderBy('created_at', 'desc');
    
    // Transform DB results to match the application's type structure
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      priority: project.priority,
      budget: project.budget,
      actualCost: project.actual_cost,
      client: project.client,
      progress: project.progress,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    }));
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch projects');
  }
};

// Add other CRUD operations
```

## Step 3: Create Migration Script

Create a script to migrate data from localStorage to PostgreSQL:

```typescript
// server/scripts/migrateFromLocalStorage.ts
import db from '../src/config/db';
import fs from 'fs';

async function migrateFromLocalStorage() {
  try {
    console.log('Starting migration from localStorage to PostgreSQL...');
    
    // Read localStorage dump file
    const localStorageData = JSON.parse(fs.readFileSync('./localStorage_dump.json', 'utf8'));
    
    // Migrate departments
    if (localStorageData.departments) {
      console.log('Migrating departments...');
      const departments = JSON.parse(localStorageData.departments);
      
      for (const dept of departments) {
        await db('departments').insert({
          id: dept.id,
          name: dept.name,
          description: dept.description,
          created_at: new Date(dept.createdAt || Date.now()),
          updated_at: new Date(dept.updatedAt || Date.now())
        }).onConflict('id').ignore();
      }
    }
    
    // Migrate users
    if (localStorageData.users) {
      console.log('Migrating users...');
      const users = JSON.parse(localStorageData.users);
      
      for (const user of users) {
        await db('users').insert({
          id: user.id,
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          password_hash: user.passwordHash,
          role: user.role,
          department_id: user.departmentId,
          is_active: user.isActive !== false,
          created_at: new Date(user.createdAt || Date.now()),
          updated_at: new Date(user.updatedAt || Date.now())
        }).onConflict('id').ignore();
      }
    }
    
    // Continue with other entities: projects, tasks, risks, issues, etc.
    // Follow similar pattern for each entity
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.destroy();
  }
}

// Run migration
migrateFromLocalStorage();
```

## Step 4: Create a LocalStorage Dump Tool

Create a tool to extract localStorage data from the browser:

```javascript
// client-side script to dump localStorage
(function() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  
  console.log(JSON.stringify(data, null, 2));
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  a.download = 'localStorage_dump.json';
  a.href = URL.createObjectURL(blob);
  a.click();
})();
```

## Step 5: Run the Migration

1. Export localStorage data from the browser using the script in Step 4.
2. Save the JSON file as `localStorage_dump.json` in your server directory.
3. Run the migration script:

```bash
cd server
npx ts-node scripts/migrateFromLocalStorage.ts
```

## Step 6: Update API Service in the Frontend

Replace the localStorage API service with the new PostgreSQL-based API:

```typescript
// Before: services/api.ts (localStorage version)
export const getProjects = (): Project[] => {
  const projectsJson = localStorage.getItem('projects') || '[]';
  return JSON.parse(projectsJson);
};

// After: services/api.ts (API version)
export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch('/api/projects');
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  return response.json();
};
```

## Step 7: Update Components to Handle Async Data

Update React components to handle asynchronous data fetching:

```typescript
// Before
const ProjectList = () => {
  const projects = api.getProjects();
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

// After
const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        setError('Failed to load projects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};
```

## Step 8: Create Backend API Routes

Create Express routes for each entity:

```typescript
// server/src/routes/projectRoutes.ts
import express from 'express';
import * as projectModel from '../models/Project';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await projectModel.getProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get project by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await projectModel.getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const project = await projectModel.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await projectModel.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await projectModel.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
```

## Step 9: Create Main Server File

Create the main Express server file:

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
import projectRoutes from './routes/projectRoutes';
import userRoutes from './routes/userRoutes';
// Import other routes...

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
// Use other routes...

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../themis-client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../themis-client/build/index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

## Step 10: Testing and Rollback Plan

1. Test all API endpoints thoroughly before switching completely from localStorage
2. Set up a rollback mechanism in case of migration issues:

```typescript
// Add a localStorage fallback to your API service
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) throw new Error('API error');
    return response.json();
  } catch (error) {
    console.error('Falling back to localStorage:', error);
    // Fallback to localStorage
    const projectsJson = localStorage.getItem('projects') || '[]';
    return JSON.parse(projectsJson);
  }
};
```

## Step 11: Monitor and Validate

After deployment, monitor the system closely for any issues:

1. Check database connections and performance
2. Monitor API response times
3. Watch for any data integrity issues
4. Validate that all features work as expected

## Additional Resources

For more information, refer to:
- [Knex.js Documentation](https://knexjs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)

For assistance with this migration, contact the development team. 