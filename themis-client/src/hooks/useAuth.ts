import { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { useAuth as useAuthContext } from '../context/AuthContext';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  // Use the existing AuthContext hook
  const auth = useAuthContext();
  
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Load user from local storage on initial load
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Mock the decoding of the token
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          setAuthState({
            user,
            isAuthenticated: true,
          });
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
  }, []);
  
  // Determine if user can view all projects based on role
  const canViewAllProjects = auth.isAdmin || auth.isExecutive || auth.isMainPMO;
  
  return {
    ...auth,
    canViewAllProjects,
    setUser: (user: User | null) => {
      if (user) {
        // Save user and token to local storage
        localStorage.setItem('authToken', 'mock-token');
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({
          user,
          isAuthenticated: true,
        });
      } else {
        // Remove user and token from local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          isAuthenticated: false,
        });
      }
    },
  };
}; 