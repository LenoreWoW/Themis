import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '../services/api';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';

// Define the step interface used for the tour
export interface TourStep {
  target: string;  // CSS selector for the target element
  content: string; // Description to be shown in the tooltip
  title?: string;  // Optional title for the tooltip
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'right';
  disableBeacon?: boolean;  // Whether to disable the beacon animation
}

// Define tour steps for each user role
const adminTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'Access your dashboard to view a summary of all projects and activities.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.workspace-main-link',
    content: 'Access your workspace to manage projects, tasks, and other items.',
    title: 'Workspace',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'View, create, and manage all projects in the system.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.settings-link',
    content: 'Configure system settings, manage users, departments, and more.',
    title: 'System Settings',
    placement: 'top',
    disableBeacon: true
  }
];

const projectManagerTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'View your project dashboard with key metrics and status indicators.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'Manage your projects, view details, and update status information.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.tasks-link',
    content: 'Create and manage tasks for your projects.',
    title: 'Tasks',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.risks-issues-link',
    content: 'Track and manage project risks and issues.',
    title: 'Risks & Issues',
    placement: 'right',
    disableBeacon: true
  }
];

const subPmoTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'Access your dashboard for departmental project overview.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.approvals-link',
    content: 'Review and process project approval requests from Project Managers.',
    title: 'Approvals',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'View, monitor, and track all projects in your department.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.repository-link',
    content: 'Access the central repository for all project documentation and resources.',
    title: 'Central Repository',
    placement: 'right',
    disableBeacon: true
  }
];

const mainPmoTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'View the enterprise dashboard with all project KPIs and metrics.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.approvals-link',
    content: 'Review and process project approvals after Sub-PMO approval.',
    title: 'Approvals',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'Access all projects across the organization for monitoring and oversight.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.audit-logs-link',
    content: 'Review system audit logs for compliance and monitoring.',
    title: 'Audit Logs',
    placement: 'top',
    disableBeacon: true
  }
];

const departmentDirectorTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'View your department dashboard with key performance indicators.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'View all projects in your department with status information.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.action-items-link',
    content: 'Track action items assigned to your department.',
    title: 'Action Items',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.repository-link',
    content: 'Access department-specific documents and resources.',
    title: 'Repository',
    placement: 'right',
    disableBeacon: true
  }
];

const executiveTourSteps: TourStep[] = [
  {
    target: '.dashboard-link',
    content: 'View the executive dashboard with organizational KPIs and metrics.',
    title: 'Dashboard',
    placement: 'bottom',
    disableBeacon: true
  },
  {
    target: '.projects-link',
    content: 'Access all projects across the organization with high-level status information.',
    title: 'Projects',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.goals-link',
    content: 'Track organizational goals and their alignment with projects.',
    title: 'Goals',
    placement: 'right',
    disableBeacon: true
  },
  {
    target: '.reports-link',
    content: 'Access executive reports and analytics.',
    title: 'Reports',
    placement: 'right',
    disableBeacon: true
  }
];

interface TourContextType {
  steps: TourStep[];
  isWelcomeOpen: boolean;
  isTourRunning: boolean;
  isTourComplete: boolean;
  startTour: () => void;
  closeTour: () => void;
  closeWelcome: () => void;
  resetTour: () => void;
  markTourComplete: () => Promise<void>;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
};

interface TourProviderProps {
  children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(false);
  const [isTourRunning, setIsTourRunning] = useState<boolean>(false);
  const [isTourComplete, setIsTourComplete] = useState<boolean>(true);
  const { t } = useTranslation();
  
  // Set appropriate tour steps based on user role
  useEffect(() => {
    if (!user) return;
    
    let tourSteps: TourStep[] = [];
    
    switch (user.role) {
      case UserRole.ADMIN:
        tourSteps = adminTourSteps;
        break;
      case UserRole.PROJECT_MANAGER:
        tourSteps = projectManagerTourSteps;
        break;
      case UserRole.SUB_PMO:
        tourSteps = subPmoTourSteps;
        break;
      case UserRole.MAIN_PMO:
        tourSteps = mainPmoTourSteps;
        break;
      case UserRole.DEPARTMENT_DIRECTOR:
        tourSteps = departmentDirectorTourSteps;
        break;
      case UserRole.EXECUTIVE:
        tourSteps = executiveTourSteps;
        break;
      default:
        tourSteps = projectManagerTourSteps;
    }
    
    // Translate step content and titles
    const translatedSteps = tourSteps.map(step => ({
      ...step,
      content: t(`tour.${user.role}.${step.target}.content`, step.content),
      title: step.title ? t(`tour.${user.role}.${step.target}.title`, step.title) : undefined
    }));

    setSteps(translatedSteps);
  }, [user, t]);
  
  // Check tour status
  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user) return;
      
      try {
        const response = await apiRequest(`/users/${user.id}/tutorial-status`, 'GET');
        
        // Add null check before destructuring
        if (!response.data) {
          // Default to tutorial not complete if data is missing
          setIsTourComplete(false);
          setIsWelcomeOpen(true);
          return;
        }
        
        const { tutorial_complete } = response.data;
        
        if (tutorial_complete === false) {
          setIsTourComplete(false);
          setIsWelcomeOpen(true);
        } else {
          setIsTourComplete(true);
          setIsWelcomeOpen(false);
        }
      } catch (error) {
        console.error('Error checking tutorial status:', error);
        // Assume complete in case of error
        setIsTourComplete(true);
      }
    };
    
    checkTourStatus();
  }, [user]);
  
  const startTour = () => {
    setIsTourRunning(true);
    setIsWelcomeOpen(false);
  };
  
  const closeTour = () => {
    setIsTourRunning(false);
  };
  
  const closeWelcome = () => {
    setIsWelcomeOpen(false);
  };
  
  const resetTour = () => {
    if (!user) return;
    
    setIsTourComplete(false);
    setIsWelcomeOpen(true);
  };
  
  const markTourComplete = async () => {
    if (!user) return;
    
    try {
      await apiRequest(`/users/${user.id}/tutorial-complete`, 'POST', { 
        tutorial_complete: true 
      });
      setIsTourComplete(true);
      setIsTourRunning(false);
    } catch (error) {
      console.error('Error updating tutorial status:', error);
    }
  };
  
  return (
    <TourContext.Provider value={{
      steps,
      isWelcomeOpen,
      isTourRunning,
      isTourComplete,
      startTour,
      closeTour,
      closeWelcome,
      resetTour,
      markTourComplete
    }}>
      {children}
    </TourContext.Provider>
  );
}; 