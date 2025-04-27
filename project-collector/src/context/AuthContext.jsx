import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('projectCollector_token');
      if (token) {
        try {
          const userData = JSON.parse(localStorage.getItem('projectCollector_user') || 'null');
          if (userData) {
            setUser(userData);
          }
        } catch (error) {
          console.error('Error parsing user data', error);
          logout(); // Clear invalid data
        }
      }
      setLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function - would normally call API
  const login = async (email, password) => {
    // This is a mock implementation
    // In a real app, you would make an API call here
    
    // Validate credentials (mock)
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Store authentication info
    const userData = {
      email,
      name: email.split('@')[0],
      role: 'PROJECT_MANAGER'
    };
    
    localStorage.setItem('projectCollector_token', 'demo-token');
    localStorage.setItem('projectCollector_user', JSON.stringify(userData));
    setUser(userData);
    
    return userData;
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('projectCollector_token');
    localStorage.removeItem('projectCollector_user');
    setUser(null);
  };
  
  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 