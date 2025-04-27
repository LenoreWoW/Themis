import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'projectCollector_projects';

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects from localStorage on initial mount
  useEffect(() => {
    try {
      setLoading(true);
      const storedProjects = localStorage.getItem(STORAGE_KEY);
      if (storedProjects) {
        setProjects(JSON.parse(storedProjects));
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load projects from storage');
      setLoading(false);
    }
  }, []);

  // Save projects to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (err) {
        setError('Failed to save projects to storage');
      }
    }
  }, [projects, loading]);

  const addProject = useCallback((project) => {
    if (!project) {
      throw new Error('Project data is required');
    }
    
    setProjects(prevProjects => [...prevProjects, project]);
    return project;
  }, []);

  const updateProject = useCallback((updatedProject) => {
    if (!updatedProject || !updatedProject.id) {
      throw new Error('Project ID is required for updates');
    }

    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id 
          ? { ...project, ...updatedProject, updatedAt: new Date().toISOString() } 
          : project
      )
    );
    return updatedProject;
  }, []);

  const deleteProject = useCallback((projectId) => {
    if (!projectId) {
      throw new Error('Project ID is required for deletion');
    }

    setProjects(prevProjects => 
      prevProjects.filter(project => project.id !== projectId)
    );
  }, []);

  const getProjectById = useCallback((projectId) => {
    return projects.find(project => project.id === projectId);
  }, [projects]);

  return {
    projects,
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProjectById
  };
};

export default useProjects; 