import { useState, useEffect, useContext, createContext, ReactNode } from 'react';

// Define the user type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
}

// Define the auth context state
interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextState>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  loading: false,
  error: null,
});

// Create the auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      // Mock API call - replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login with hardcoded user
      if (email === 'admin@example.com' && password === 'password') {
        const mockUser: User = {
          id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'ADMIN',
          department: 'IT',
        };

        const mockToken = 'mock-jwt-token';

        // Save to localStorage
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        // Update state
        setUser(mockUser);
        setToken(mockToken);
        setLoading(false);
        return true;
      } else {
        setError('Invalid email or password');
        setLoading(false);
        return false;
      }
    } catch (err) {
      setError('Failed to login. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  };

  const contextValue: AuthContextState = {
    isAuthenticated: !!user,
    user,
    token,
    login,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
}; 