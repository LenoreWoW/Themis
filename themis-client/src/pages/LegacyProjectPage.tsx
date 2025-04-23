import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert, Paper } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Department, User, UserRole } from '../types';
import LegacyProjectForm from '../components/Project/LegacyProjectForm';

const LegacyProjectPage: React.FC = () => {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has appropriate role (SUB_PMO, MAIN_PMO, or ADMIN)
  const hasPermission = user?.role === UserRole.SUB_PMO || 
                       user?.role === UserRole.MAIN_PMO || 
                       user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Redirect if user doesn't have permission
    if (!hasPermission) {
      navigate('/dashboard');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch departments
        const departmentsResponse = await api.departments.getAllDepartments(token || '');
        if (departmentsResponse.data) {
          setDepartments(departmentsResponse.data);
        }
        
        // Fetch users
        const usersResponse = await api.users.getAllUsers(token || '');
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('An error occurred while fetching required data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [hasPermission, navigate, token]);

  const handleCancel = () => {
    navigate('/projects');
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if data fetching failed
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Show permission error if user is not authorized
  if (!hasPermission) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <LegacyProjectForm
      departments={departments}
      users={users}
      onCancel={handleCancel}
    />
  );
};

export default LegacyProjectPage; 