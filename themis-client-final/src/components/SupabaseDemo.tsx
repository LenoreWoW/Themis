import React, { useEffect, useState } from 'react';
import { 
  fetchData, 
  insertData, 
  updateData, 
  deleteData,
  signIn,
  signOut,
  getCurrentUser
} from '../lib/supabase-examples';

// Define types for your data
interface Item {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

interface FormData {
  name: string;
  description: string;
  email?: string;
  password?: string;
}

const SupabaseDemo: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    email: '',
    password: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    checkCurrentUser();
  }, []);

  // Check if user is already logged in
  const checkCurrentUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData?.user || null);
    } catch (err) {
      console.error("Error checking user:", err);
    }
  };

  // Load data from Supabase
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace 'your_table_name' with your actual table name
      const data = await fetchData('your_table_name');
      setItems(data as Item[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add a new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    setLoading(true);
    try {
      // Replace 'your_table_name' with your actual table name
      await insertData('your_table_name', {
        name: formData.name,
        description: formData.description
      });
      setFormData(prev => ({ ...prev, name: '', description: '' }));
      loadData(); // Reload data after adding
    } catch (err: any) {
      setError(err.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  // Update an item
  const handleUpdateItem = async (id: number, newData: Partial<Item>) => {
    setLoading(true);
    try {
      // Replace 'your_table_name' with your actual table name
      await updateData('your_table_name', id, newData);
      loadData(); // Reload data after updating
    } catch (err: any) {
      setError(err.message || 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  // Delete an item
  const handleDeleteItem = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    setLoading(true);
    try {
      // Replace 'your_table_name' with your actual table name
      await deleteData('your_table_name', id);
      loadData(); // Reload data after deleting
    } catch (err: any) {
      setError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      const response = await signIn(formData.email, formData.password);
      setUser(response?.user || null);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed');
    }
  };

  return (
    <div className="supabase-demo">
      <h1>Supabase Demo</h1>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Authentication UI */}
      <div className="auth-section">
        <h2>Authentication</h2>
        {user ? (
          <div>
            <p>Logged in as: {user.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit">Login</button>
          </form>
        )}
      </div>

      {/* Data management UI */}
      <div className="data-section">
        <h2>Data Management</h2>
        
        {/* Add new item form */}
        <form onSubmit={handleAddItem}>
          <div>
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Item'}
          </button>
        </form>
        
        {/* Display items */}
        <div className="items-list">
          <h3>Items:</h3>
          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p>No items found</p>
          ) : (
            <ul>
              {items.map(item => (
                <li key={item.id}>
                  <div>
                    <strong>{item.name}</strong>
                    {item.description && <p>{item.description}</p>}
                    <p>Created: {new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleUpdateItem(item.id, {
                        name: `${item.name} (updated)`
                      })}
                      disabled={loading}
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseDemo; 