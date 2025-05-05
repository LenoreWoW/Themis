# Supabase Integration for Themis Client

This document provides a guide on how to use Supabase in the Themis client application.

## Setup

1. **Install Supabase Package**: 
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create a Supabase Project**:
   - Sign up at [Supabase](https://supabase.com/) (if you don't have an account)
   - Create a new project 
   - Note your project URL and anon key from the project dashboard

3. **Environment Configuration**:
   - Create a `.env` file in the project root
   - Add the following variables:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_project_url
     REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

## Project Structure

We've set up Supabase in the following files:

- `src/lib/supabase.ts` - The Supabase client configuration
- `src/lib/supabase-examples.ts` - Helper functions for common Supabase operations
- `src/components/SupabaseDemo.tsx` - A demo component showing how to use Supabase

## Usage Examples

### Basic Data Operations

```typescript
import { 
  fetchData, 
  fetchItemById, 
  insertData, 
  updateData, 
  deleteData 
} from '../lib/supabase-examples';

// Fetch all items from a table
const getAllItems = async () => {
  try {
    const items = await fetchData('your_table_name');
    console.log('Items:', items);
  } catch (error) {
    console.error('Error fetching items:', error);
  }
};

// Get a specific item by ID
const getItem = async (id) => {
  try {
    const item = await fetchItemById('your_table_name', id);
    console.log('Item:', item);
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
  }
};

// Add a new item
const addItem = async (data) => {
  try {
    const result = await insertData('your_table_name', data);
    console.log('Added item:', result);
  } catch (error) {
    console.error('Error adding item:', error);
  }
};

// Update an item
const updateItem = async (id, data) => {
  try {
    const result = await updateData('your_table_name', id, data);
    console.log('Updated item:', result);
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
  }
};

// Delete an item
const removeItem = async (id) => {
  try {
    await deleteData('your_table_name', id);
    console.log('Item deleted successfully');
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
  }
};
```

### Authentication

```typescript
import { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser 
} from '../lib/supabase-examples';

// Sign up a new user
const registerUser = async (email, password) => {
  try {
    const result = await signUp(email, password);
    console.log('User registered:', result);
  } catch (error) {
    console.error('Registration error:', error);
  }
};

// Sign in a user
const loginUser = async (email, password) => {
  try {
    const result = await signIn(email, password);
    console.log('User logged in:', result);
  } catch (error) {
    console.error('Login error:', error);
  }
};

// Sign out the current user
const logoutUser = async () => {
  try {
    await signOut();
    console.log('User logged out');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

// Get the current logged-in user
const getUser = async () => {
  try {
    const user = await getCurrentUser();
    console.log('Current user:', user);
  } catch (error) {
    console.error('Error getting user:', error);
  }
};
```

## Database Setup

To properly use Supabase with this application, you'll need to set up your database tables:

1. Go to the Supabase dashboard for your project
2. Navigate to the SQL Editor
3. Create your tables using SQL. For example:

```sql
-- Create a table for items
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX items_name_idx ON items (name);
```

## Common Issues and Troubleshooting

1. **Authentication Issues**:
   - Make sure your Supabase URL and anon key are correct
   - Check if you have enabled the authentication providers you need in Supabase dashboard

2. **Table Permission Issues**:
   - Ensure your Row Level Security (RLS) policies are properly configured
   - By default, tables require authentication to access - set appropriate policies

3. **Deployment Considerations**:
   - Use environment variables for your Supabase credentials
   - Consider different environments (development, staging, production)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [React with Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-react) 