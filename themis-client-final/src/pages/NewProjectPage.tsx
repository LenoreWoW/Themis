import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, CircularProgress, Alert, Divider, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ProjectApprovalForm from '../components/Project/ProjectApprovalForm';
import { useAuth } from '../context/AuthContext';
import { Project, Department, User } from '../types';
import api from '../services/api';
import PermissionGuard, { Permission } from '../components/shared/PermissionGuard';
import { UserRole } from '../types';

const NewProjectPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!token) return;
    
    // Fetch departments and users
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch departments
        const departmentsResponse = await api.departments.getAllDepartments(token);
        setDepartments(departmentsResponse.data || []);
        
        // Fetch users
        const usersResponse = await api.users.getAllUsers(token);
        setUsers(usersResponse.data || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
  const handleSubmit = async (formData: any) => {
    try {
      // Create new project
      const response = await api.projects.createProject(formData, token);
      
      if (response.success) {
        // Navigate to the project details page if successful
        navigate(`/projects/${response.data.id}`);
      } else {
        // Use a generic error message if 'message' property is not available
        setError('Failed to create project.');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError('An error occurred while creating the project. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mr: 2 }}
        >
          Back to Projects
        </Button>
        <Typography variant="h4" component="h1">
          Create New Project
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <PermissionGuard 
        permission={Permission.CREATE_PROJECT}
        fallback={
          <Alert severity="warning">
            You don't have permission to create a new project.
          </Alert>
        }
      >
        <ProjectApprovalForm
          departments={departments}
          users={users}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
        />
      </PermissionGuard>
    </Container>
  );
};

export default NewProjectPage; 