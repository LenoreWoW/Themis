import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  AlertTitle,
  Stack,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { useAuth } from '../context/AuthContext';
import { Task, Project, ProjectStatus, User, UserRole } from '../types';
import { TaskService } from '../services/TaskService';
import AddTaskDialog from '../components/Task/AddTaskDialog';

const TaskBoardPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });
  const { user, token } = useAuth();

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Fetch tasks for the current project
  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId || !token) return;

      setLoading(true);
      try {
        const taskData = await TaskService.getAllTasks(projectId, token);
        setTasks(taskData);
        // For simplicity, we're not fetching the project details here
        // In a real app, you would call a project service to get project details
        const mockUser: User = {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: user?.role || UserRole.ADMIN,
          department: '',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setProject({
          id: projectId,
          name: 'Project', // Placeholder
          description: '',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: ProjectStatus.IN_PROGRESS,
          progress: 0,
          budget: 0,
          actualCost: 0,
          department: '',
          projectManager: mockUser,
          createdBy: mockUser,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, token, user]);

  // Handle task updates (from drag-and-drop)
  const handleTaskUpdate = async (updatedTask: Task) => {
    if (!projectId || !token) return;

    try {
      // The TaskService.updateTask method already handles the status mapping
      await TaskService.updateTask(projectId, updatedTask.id, updatedTask, token);
      showSnackbar('Task updated successfully', 'success');
    } catch (err) {
      console.error('Error updating task:', err);
      showSnackbar('Failed to update task', 'error');
      
      // Refresh tasks to get the correct state
      const taskData = await TaskService.getAllTasks(projectId, token);
      setTasks(taskData);
    }
  };

  // Handle task click (view/edit)
  const handleTaskClick = (task: Task) => {
    // In a real app, you would open a task detail dialog or navigate to a task detail page
    console.log('Task clicked:', task);
  };

  // Handle closing the snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Handle adding a new task
  const handleTaskAdded = () => {
    // Reload tasks after a task is added
    if (projectId && token) {
      TaskService.getAllTasks(projectId, token)
        .then(taskData => {
          setTasks(taskData);
          showSnackbar('Task created successfully', 'success');
        })
        .catch(err => {
          console.error('Error refreshing tasks:', err);
        });
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && tasks.length === 0) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          {project?.name || 'Project'} Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddTaskDialogOpen(true)}
        >
          Add Task
        </Button>
      </Stack>

      {/* Kanban Board */}
      <KanbanBoard
        project={project as Project}
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskClick={handleTaskClick}
      />

      {/* Add Task Dialog */}
      {isAddTaskDialogOpen && (
        <AddTaskDialog
          open={isAddTaskDialogOpen}
          onClose={() => setIsAddTaskDialogOpen(false)}
          projectId={projectId || ''}
          projectUsers={[]} // In a real app, you would fetch project users
          onTaskAdded={handleTaskAdded}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbar.message}
      />
    </Box>
  );
};

export default TaskBoardPage; 