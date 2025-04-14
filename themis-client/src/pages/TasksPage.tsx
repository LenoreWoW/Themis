import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  IconButton,
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { Task, TaskStatus, TaskPriority, User } from '../types';
import { TaskService } from '../services/TaskService';

// Mock data for tasks
const mockTasks = [
  { 
    id: '1', 
    title: 'Requirements Gathering', 
    projectName: 'Digital Transformation',
    description: 'Gather and document system requirements from stakeholders.',
    status: 'IN_PROGRESS', 
    priority: 'HIGH',
    startDate: '2023-01-15', 
    dueDate: '2023-01-31',
    assignee: 'admin'
  },
  { 
    id: '2', 
    title: 'Database Schema Design', 
    projectName: 'Digital Transformation',
    description: 'Design the database schema for the new system.',
    status: 'TODO', 
    priority: 'MEDIUM',
    startDate: '2023-02-01', 
    dueDate: '2023-02-15',
    assignee: 'admin'
  },
  { 
    id: '3', 
    title: 'Frontend Prototype', 
    projectName: 'Digital Transformation',
    description: 'Create a prototype of the user interface.',
    status: 'TODO', 
    priority: 'MEDIUM',
    startDate: '2023-02-15', 
    dueDate: '2023-03-01',
    assignee: 'admin'
  },
  { 
    id: '4', 
    title: 'API Documentation', 
    projectName: 'Cloud Migration',
    description: 'Document all API endpoints and their usage.',
    status: 'DONE', 
    priority: 'LOW',
    startDate: '2023-01-10', 
    dueDate: '2023-01-20',
    assignee: 'admin'
  },
  { 
    id: '5', 
    title: 'Security Audit', 
    projectName: 'Cloud Migration',
    description: 'Perform a security audit of the system.',
    status: 'REVIEW', 
    priority: 'HIGH',
    startDate: '2023-01-25', 
    dueDate: '2023-02-10',
    assignee: 'admin'
  }
];

// Helper functions for determining the status and priority display
const getStatusColor = (status: string) => {
  switch(status) {
    case 'TODO': return 'default';
    case 'IN_PROGRESS': return 'primary';
    case 'REVIEW': return 'warning';
    case 'DONE': return 'success';
    default: return 'default';
  }
};

const getStatusLabel = (status: string) => {
  switch(status) {
    case 'TODO': return 'To Do';
    case 'IN_PROGRESS': return 'In Progress';
    case 'REVIEW': return 'In Review';
    case 'DONE': return 'Completed';
    default: return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch(priority) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    default: return 'default';
  }
};

const TasksPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<{id: string, name: string}[]>([]);
  
  const { user, token } = useAuth();
  
  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch tasks from your API
        // For now, we'll use mock data with a delay to simulate loading
        setTimeout(() => {
          setTasks(mockTasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            projectId: '1', // Mock project ID
            status: task.status as TaskStatus,
            priority: task.priority as TaskPriority,
            startDate: task.startDate,
            dueDate: task.dueDate,
            assignee: { username: task.assignee } as User,
            createdBy: { username: 'admin' } as User,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            dependencies: [],
            isMilestone: false
          })));
          
          // Mock projects
          setProjects([
            { id: '1', name: 'Digital Transformation' },
            { id: '2', name: 'Cloud Migration' }
          ]);
          
          setLoading(false);
        }, 500);
        
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };
  
  // Filter tasks based on search query and current user
  const filteredTasks = tasks.filter((task) => {
    // Only show tasks assigned to the current user (for this demo, show all if user is admin)
    const isAssignedToUser = user?.username === task.assignee?.username; // In a real app, check user.id against task.assigneeId
    
    // Check if the search query matches task title, description, or project
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return (isAssignedToUser || user?.role === 'ADMIN') && matchesSearch;
  });
  
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Tasks
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage tasks assigned to you
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            label="Search Tasks"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <Typography>Loading tasks...</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <Typography color="error">{error}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ py: 3 }}>
                      <AssignmentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography variant="h6">No tasks found</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'Try adjusting your search terms' : 'You have no tasks assigned to you'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {task.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {task.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{projects.find(p => p.id === task.projectId)?.name || 'Unknown Project'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(task.status)} 
                          color={getStatusColor(task.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority} 
                          color={getPriorityColor(task.priority) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default TasksPage; 