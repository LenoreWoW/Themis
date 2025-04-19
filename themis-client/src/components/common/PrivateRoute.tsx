import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roleRequired?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  roleRequired 
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If the user is not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if the user has the required role
  if (roleRequired && user) {
    const requiredRoles = Array.isArray(roleRequired) ? roleRequired : [roleRequired];
    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect to dashboard or access denied page if the user doesn't have required role
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Otherwise, render the protected content
  return <>{children}</>;
};

export default PrivateRoute; 