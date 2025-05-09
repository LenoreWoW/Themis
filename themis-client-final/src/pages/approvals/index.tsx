import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Simple redirect component to ensure approvals can be accessed directly
 */
const ApprovalsRedirect: React.FC = () => {
  return <Navigate to="/approvals" replace />;
};

export default ApprovalsRedirect; 