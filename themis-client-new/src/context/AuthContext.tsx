import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMainPMO: boolean;
  isSubPMO: boolean;
  isExecutive: boolean;
  isDirector: boolean;
  isProjectManager: boolean;
  isPending: boolean;
  isMember: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (adIdentifier: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JwtPayload {
  nameid: string;
  unique_name: string;
  role: string;
  departmentId?: string;
  exp: number;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  // Check if token is valid on initial load
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const decodedToken = jwtDecode<JwtPayload>(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          } else {
            // Valid token, set user from token
            setUser({
              id: decodedToken.nameid,
              username: decodedToken.unique_name,
              role: decodedToken.role as UserRole,
              departmentId: decodedToken.departmentId,
              adIdentifier: '',  // Not included in token
              approved: true,
            });
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token]);

  const handleLogin = async (adIdentifier: string) => {
    setLoading(true);
    try {
      const response = await login(adIdentifier);
      localStorage.setItem('token', response.token);
      setToken(response.token);
      
      const decodedToken = jwtDecode<JwtPayload>(response.token);
      setUser({
        id: decodedToken.nameid,
        username: decodedToken.unique_name,
        role: decodedToken.role as UserRole,
        departmentId: decodedToken.departmentId,
        adIdentifier,
        approved: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === UserRole.Admin;
  const isMainPMO = user?.role === UserRole.MainPMO;
  const isSubPMO = user?.role === UserRole.SubPMO;
  const isExecutive = user?.role === UserRole.Executive;
  const isDirector = user?.role === UserRole.DepartmentDirector;
  const isProjectManager = user?.role === UserRole.ProjectManager;
  const isPending = user?.role === UserRole.Pending;
  const isMember = isProjectManager || isSubPMO || isMainPMO || isDirector || isExecutive || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isMainPMO,
        isSubPMO,
        isExecutive,
        isDirector,
        isProjectManager,
        isPending,
        isMember,
        hasRole,
        login: handleLogin,
        logout: handleLogout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 