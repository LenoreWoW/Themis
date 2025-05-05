import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TaskPriority, TaskStatus } from '../types';
import api from '../services/api';

interface TaskRequest {
  id?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  projectId: string;
  requestedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface TaskRequestContextType {
  taskRequests: TaskRequest[];
  loading: boolean;
  error: string | null;
  createTaskRequest: (taskRequest: TaskRequest) => Promise<void>;
  approveTaskRequest: (id: string) => Promise<void>;
  rejectTaskRequest: (id: string, reason: string) => Promise<void>;
}

const TaskRequestContext = createContext<TaskRequestContextType | undefined>(undefined);

export const useTaskRequests = (): TaskRequestContextType => {
  const context = useContext(TaskRequestContext);
  if (!context) {
    throw new Error('useTaskRequests must be used within a TaskRequestProvider');
  }
  return context;
};

export const TaskRequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [taskRequests, setTaskRequests] = useState<TaskRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskRequests = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.get('/task-requests');
      // setTaskRequests(response.data);
      
      // Mock data for now
      const mockRequests: TaskRequest[] = [
        {
          id: '1',
          title: 'Create user documentation',
          description: 'We need comprehensive user documentation for the new features',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
          dueDate: '2024-07-15',
          projectId: '1',
          requestedBy: {
            id: '3',
            firstName: 'Carol',
            lastName: 'Williams'
          },
          createdAt: '2024-06-01',
          updatedAt: '2024-06-01'
        }
      ];
      
      setTaskRequests(mockRequests);
      setError(null);
    } catch (err) {
      console.error('Error fetching task requests:', err);
      setError('Failed to fetch task requests');
    } finally {
      setLoading(false);
    }
  };

  const createTaskRequest = async (taskRequest: TaskRequest): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/task-requests', taskRequest);
      // const newTaskRequest = response.data;
      
      // Mock data for now
      const newTaskRequest: TaskRequest = {
        ...taskRequest,
        id: `req-${Date.now()}`,
        requestedBy: {
          id: '3',
          firstName: 'Carol',
          lastName: 'Williams'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setTaskRequests(prev => [...prev, newTaskRequest]);
      setError(null);
    } catch (err) {
      console.error('Error creating task request:', err);
      setError('Failed to create task request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveTaskRequest = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // await api.put(`/task-requests/${id}/approve`);
      
      // Update local state
      setTaskRequests(prev => 
        prev.map(req => 
          req.id === id 
            ? { ...req, status: TaskStatus.IN_PROGRESS, updatedAt: new Date().toISOString() } 
            : req
        )
      );
      setError(null);
    } catch (err) {
      console.error('Error approving task request:', err);
      setError('Failed to approve task request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectTaskRequest = async (id: string, reason: string): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // await api.put(`/task-requests/${id}/reject`, { reason });
      
      // Update local state
      setTaskRequests(prev => prev.filter(req => req.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error rejecting task request:', err);
      setError('Failed to reject task request');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch task requests on initial load
  React.useEffect(() => {
    fetchTaskRequests();
  }, []);

  return (
    <TaskRequestContext.Provider
      value={{
        taskRequests,
        loading,
        error,
        createTaskRequest,
        approveTaskRequest,
        rejectTaskRequest
      }}
    >
      {children}
    </TaskRequestContext.Provider>
  );
};

export default TaskRequestContext; 