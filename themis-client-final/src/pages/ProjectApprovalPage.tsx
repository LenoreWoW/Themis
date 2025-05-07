import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Paper, Typography, CircularProgress, Alert, Divider, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ProjectApprovalForm from '../components/Project/ProjectApprovalForm';
import { useAuth } from '../context/AuthContext';
import { WorkflowAction } from '../components/shared/WorkflowForm';
import { Project, Department, User } from '../types';
import { ApprovalStatus, getNextApprovalStatus } from '../context/AuthContext';
import api from '../services/api';
import PermissionGuard, { Permission } from '../components/shared/PermissionGuard';
import { UserRole } from '../types';

const ProjectApprovalPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch project, departments, and users data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('You must be logged in to view this page');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch departments
        const departmentsResponse = await api.departments.getAllDepartments(token);
        setDepartments(departmentsResponse.data || []);
        
        // Fetch users
        const usersResponse = await api.users.getAllUsers(token);
        setUsers(usersResponse.data || []);
        
        // Fetch project details if in edit mode
        if (projectId) {
          const projectResponse = await api.projects.getProjectById(projectId, token);
          
          if (projectResponse.data) {
            setProject(projectResponse.data);
          } else {
            setError('Project not found');
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, token]);
  
  // Handle form submission
  const handleSubmit = async (data: any, action: WorkflowAction) => {
    if (!token) {
      setError('You must be logged in to perform this action');
      return;
    }
    
    // Executives cannot take approval actions
    if (user?.role === UserRole.EXECUTIVE && action !== 'SAVE_DRAFT') {
      setError('As an Executive, you have view-only access and cannot take approval actions');
      return;
    }
    
    try {
      // Get current approval status
      const currentStatus = (project as any)?.approvalStatus || ApprovalStatus.DRAFT;
      
      // Determine if the user is from the same department as the project
      const isSameDepartment = user?.department?.id === project?.department?.id;
      
      // Determine next approval status based on current status and action
      let nextStatus: ApprovalStatus;
      
      if (action === 'SAVE_DRAFT') {
        nextStatus = ApprovalStatus.DRAFT;
      } else if (action === 'SUBMIT') {
        nextStatus = getNextApprovalStatus(
          ApprovalStatus.DRAFT,
          user?.role,
          'SUBMIT',
          isSameDepartment,
          'PROJECT'
        ) || ApprovalStatus.DRAFT;
      } else {
        // For APPROVE, REJECT, REQUEST_CHANGES
        const nextApprovalStatus = getNextApprovalStatus(
          currentStatus,
          user?.role,
          action as 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
          isSameDepartment,
          'PROJECT'
        );
        
        if (!nextApprovalStatus) {
          setError('Invalid status transition');
          return;
        }
        
        nextStatus = nextApprovalStatus;
      }
      
      // Add review details if provided
      const reviewData = data.reviewComments ? {
        reviewHistory: [
          ...((project as any)?.reviewHistory || []),
          {
            id: Date.now().toString(),
            text: data.reviewComments,
            createdAt: new Date().toISOString(),
            user: user,
            action: action
          }
        ],
        lastReviewedBy: user,
        lastReviewedAt: new Date().toISOString(),
        comments: data.reviewComments
      } : {};
      
      // Prepare project data
      const projectData = {
        ...data,
        approvalStatus: nextStatus,
        ...reviewData,
        startDate: data.startDate.toISOString(),
        endDate: data.endDate.toISOString()
      };
      
      // Remove temporary fields
      delete projectData.reviewComments;
      
      let response;
      
      if (projectId) {
        // Update existing project
        response = await api.projects.updateProject(projectId, projectData, token);
      } else {
        // Create new project
        response = await api.projects.createProject(projectData, token);
      }
      
      if (response.data) {
        // Redirect to projects page
        navigate('/projects');
      } else {
        setError('Failed to save project');
      }
    } catch (err) {
      console.error('Error saving project:', err);
      setError('An error occurred while saving the project');
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If user doesn't have permission to create/edit projects
  const canCreate = !projectId; // Creating new project
  const canEdit = !!projectId; // Editing existing project
  
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
          {projectId ? 'Edit Project' : 'Create New Project'}
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <PermissionGuard 
        permission={projectId ? Permission.EDIT_PROJECT : Permission.CREATE_PROJECT}
        isOwnItem={project?.projectManager?.id === user?.id}
        fallback={
          <Alert severity="warning">
            You don't have permission to {projectId ? 'edit this project' : 'create a new project'}.
          </Alert>
        }
      >
        <ProjectApprovalForm
          project={project || undefined}
          departments={departments}
          users={users}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/projects')}
        />
      </PermissionGuard>
    </Container>
  );
};

export default ProjectApprovalPage; 