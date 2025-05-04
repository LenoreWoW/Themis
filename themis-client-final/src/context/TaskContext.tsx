import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Define the context type
interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<any>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  refreshTasks: () => Promise<Task[]>;
  loading: boolean;
  error: string | null;
}

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Create the provider component
export const TaskProvider: React.FC<{ children: React.ReactNode, projectId?: string }> = ({ children, projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Add a task
  const addTask = async (taskData: any): Promise<any> => {
    if (!token) {
      console.error('TaskContext: No authentication token available');
      return { success: false, error: 'No authentication token' };
    }
    
    try {
      console.log('TaskContext: Starting to add task with data:', taskData);
      
      // Ensure task has all required fields
      const taskProjectId = taskData.projectId || projectId || 'default';
      
      // Make sure we have a valid title
      if (!taskData.title || taskData.title.trim() === '') {
        return { success: false, error: 'Task title is required' };
      }
      
      const completeTaskData = {
        // Default values
        id: `task-${Date.now()}`,
        status: 'TODO',
        priority: 'MEDIUM',
        startDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        projectId: taskProjectId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...taskData, // Override defaults with provided data
        title: taskData.title.trim() // Ensure cleaned title
      };
      
      console.log('TaskContext: Prepared complete task data:', completeTaskData);
      
      // Call API to create task
      console.log('TaskContext: Calling API to create task with projectId:', taskProjectId);
      const response = await api.tasks.createTask(taskProjectId, completeTaskData, token) as any;
      console.log('TaskContext: API response for task creation:', response);
      
      if (response.success) {
        console.log('TaskContext: Task added successfully:', response.data);
        
        // Add the new task to our local state without a full refresh
        // This avoids race conditions with refreshTasks
        setTasks(prevTasks => {
          // Only add if it doesn't already exist
          const exists = prevTasks.some(t => t.id === response.data.id);
          if (!exists) {
            return [...prevTasks, response.data];
          }
          return prevTasks;
        });
        
        return { success: true, data: response.data };
      } else {
        console.error('TaskContext: Error adding task:', response.error);
        return { success: false, error: response.error || 'Failed to add task' };
      }
    } catch (err) {
      console.error('TaskContext: Error in addTask:', err);
      return { success: false, error: err };
    }
  };

  const updateTask = async (taskId: string, updatedTask: Partial<Task>): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      // Call the API to update the task
      const taskProjectId = projectId || updatedTask.projectId || 'default';
      const response = await api.tasks.updateTask(taskProjectId, taskId, updatedTask, token) as any;
      
      if (response?.success) {
        // Update the local state
        setTasks(prev => prev.map(task => 
          task.id === taskId ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() } : task
        ));
        
        // Refresh tasks to ensure consistency
        await refreshTasks();
      } else {
        // Safely access error property
        const errorMessage = response && typeof response === 'object' && 'error' in response 
          ? response.error 
          : 'Unknown error';
        console.error('Error updating task:', errorMessage);
        setError('Failed to update task: ' + errorMessage);
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      // Call the API to delete the task
      const taskProjectId = projectId || 'default';
      const response = await api.tasks.deleteTask(taskProjectId, taskId, token) as any;
      
      if (response?.success) {
        // Update the local state
        setTasks(prev => prev.filter(task => task.id !== taskId));
        
        // Refresh tasks to ensure consistency
        await refreshTasks();
      } else {
        // Safely access error property with type checking
        const errorMessage = response && typeof response === 'object' && 'error' in response 
          ? response.error 
          : 'Unknown error';
        console.error('Error deleting task:', errorMessage);
        setError('Failed to delete task: ' + errorMessage);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    await updateTask(taskId, { status: newStatus });
  };

  // Create a function to manually refresh tasks
  const refreshTasks = useCallback(async (): Promise<Task[]> => {
    if (!token) {
      console.error('TaskContext: No token available for refreshTasks');
      return [];
    }
    
    setLoading(true);
    
    try {
      console.log('TaskContext: Manually refreshing tasks with projectId:', projectId);
      const currentProjectId = projectId || 'default';
      const response = await api.tasks.getAllTasks(currentProjectId, token) as any;
      
      if (response && response.success && Array.isArray(response.data)) {
        console.log('TaskContext: Tasks refreshed successfully:', response.data);
        // Ensure each task has a projectId
        const tasksWithProjectId = response.data.map((task: any) => ({
          ...task,
          projectId: task.projectId || currentProjectId
        }));
        
        // Double-check the data before updating state
        if (Array.isArray(tasksWithProjectId)) {
          // If we have a specific project ID, filter tasks for that project only
          const relevantTasks = currentProjectId !== 'default' 
            ? tasksWithProjectId.filter((task: Task) => 
                task.projectId === currentProjectId || 
                String(task.projectId) === String(currentProjectId)
              )
            : tasksWithProjectId;
          
          console.log('TaskContext: Setting tasks with filtered list:', relevantTasks.length, 'tasks');
          setTasks(relevantTasks);
          return relevantTasks;
        } else {
          console.error('TaskContext: Received non-array data from API:', tasksWithProjectId);
          return [];
        }
      } else {
        console.error('TaskContext: Invalid response from API:', response);
        return [];
      }
    } catch (err) {
      console.error('TaskContext: Error refreshing tasks:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [token, projectId]);

  // Fetch tasks when component mounts or when projectId changes
  useEffect(() => {
    const fetchInitialTasks = async () => {
      try {
        await refreshTasks();
      } catch (err) {
        console.error('Error fetching initial tasks:', err);
      }
    };
    
    if (token) {
      fetchInitialTasks();
    }
  }, [token, projectId, refreshTasks]); // Added refreshTasks to dependency array

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      moveTask,
      refreshTasks,
      loading,
      error
    }}>
      {children}
    </TaskContext.Provider>
  );
};

// Create a hook to use the task context
export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext; 