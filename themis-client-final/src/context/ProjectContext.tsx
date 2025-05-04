import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { projectService } from '../services/ProjectService';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to get projects from localStorage
      const storedProjects = localStorage.getItem('themis_projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        setProjects(parsedProjects);
        setLoading(false);
        return;
      }
      
      // If no localStorage data, use the service
      const data = await projectService.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a project to the context and localStorage
  const addProject = (project: Project) => {
    setProjects(prevProjects => {
      const newProjects = [...prevProjects, project];
      // Update localStorage
      localStorage.setItem('themis_projects', JSON.stringify(newProjects));
      return newProjects;
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, loading, error, fetchProjects, addProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}; 