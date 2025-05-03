import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  Stack,
  Snackbar
} from '@mui/material';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import { useAuth } from '../context/AuthContext';
import { Task, Project, ProjectStatus, User, UserRole, TaskStatus } from '../types';
import { TaskService } from '../services/TaskService';
import AddTaskDialog from '../components/Task/AddTaskDialog';
import { ProjectPriority, ProjectTemplateType } from '../types/index';

// Need to define our own interface for KanbanBoard props that includes tasks
interface CustomKanbanBoardProps {
  project: Project;
  tasks: Task[];
  onTaskUpdate: (taskId: string, updatedStatus: TaskStatus) => Promise<void>;
  onTaskClick: (taskId: string) => void;
}

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
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: UserRole.ADMIN,
          department: {
            id: '1',
            name: 'IT',
            description: 'Information Technology Department',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        const project: Project = {
          id: '0',
          name: 'All Tasks',
          description: 'View and manage all tasks across projects',
          status: ProjectStatus.IN_PROGRESS,
          priority: ProjectPriority.MEDIUM,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          progress: 0,
          budget: 0,
          actualCost: 0,
          projectManager: mockUser,
          department: {
            id: '0',
            name: 'All Departments',
            description: 'Tasks from all departments',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          templateType: ProjectTemplateType.DEFAULT
        };

        setProject(project);
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

  // Handle task update (status change from drag and drop)
  const handleTaskUpdate = async (taskId: string, updatedStatus: TaskStatus) => {
    if (!projectId || !token) return;
    
    try {
      // Find the task that was updated
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;
      
      // Create an updated task object with the new status
      const updatedTask: Task = {
        ...taskToUpdate,
        status: updatedStatus
      };
      
      // Optimistically update the UI
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      
      // Send the update to the server
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
  const handleTaskClick = (taskId: string) => {
    // Find the task that was clicked
    const clickedTask = tasks.find(t => t.id === taskId);
    if (!clickedTask) return;
    
    // In a real app, you would open a task detail dialog or navigate to a task detail page
    console.log('Task clicked:', clickedTask);
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
      </Stack>

      {/* Kanban Board */}
      <KanbanBoard
        {...{
          project: project as Project,
          tasks: tasks,
          onTaskUpdate: handleTaskUpdate,
          onTaskClick: handleTaskClick
        } as CustomKanbanBoardProps}
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