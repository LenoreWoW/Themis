import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import api from '../services/api';
import { useAuth } from './AuthContext';

// Define the context type
interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Create the provider component
export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  // Mock implementation of task operations
  const addTask = async (task: Task): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would call API here
      // const response = await api.tasks.createTask(task, token);
      // Mock successful response
      const newTask = { ...task, id: Date.now().toString() };
      setTasks(prev => [...prev, newTask]);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId: string, updatedTask: Partial<Task>): Promise<void> => {
    if (!token) return;
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, you would call API here
      // const response = await api.tasks.updateTask(taskId, updatedTask, token);
      // Mock successful update
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
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
      // In a real app, you would call API here
      // await api.tasks.deleteTask(taskId, token);
      // Mock successful delete
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus): Promise<void> => {
    updateTask(taskId, { status: newStatus });
  };

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      
      try {
        // In a real app, you would fetch tasks from API
        // const response = await api.tasks.getTasks(token);
        // setTasks(response.data || []);
        
        // For now, just use empty array
        setTasks([]);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [token]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask, 
      moveTask,
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