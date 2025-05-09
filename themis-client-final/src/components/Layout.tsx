import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  Direction,
  useTheme,
  Fab,
  Zoom,
  Tooltip,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CollapsibleSidebar from './CollapsibleSidebar';
import { useEasterEgg } from '../context/EasterEggContext';
import {
  Add as AddIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

interface LayoutProps {
  direction?: Direction;
  onDirectionChange: (direction: Direction) => void;
}

const Layout: React.FC<LayoutProps> = ({ direction = 'ltr', onDirectionChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const [openNewTaskModal, setOpenNewTaskModal] = useState(false);
  const { t, i18n } = useTranslation();
  const { easterEggActive } = useEasterEgg();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const { user } = useAuth();

  // Handle language changes through the i18n system
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newDirection = lng === 'ar' ? 'rtl' : 'ltr';
      onDirectionChange(newDirection as Direction);
    };

    // Listen for language changes triggered by our LanguageSwitcher
    document.addEventListener('i18n-updated', () => {
      handleLanguageChange(i18n.language);
    });

    return () => {
      document.removeEventListener('i18n-updated', () => {
        handleLanguageChange(i18n.language);
      });
    };
  }, [i18n, onDirectionChange]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleQuickActionsToggle = () => {
    setQuickActionsOpen(!quickActionsOpen);
  };

  const handleOpenNewProject = () => {
    setOpenNewProjectModal(true);
    setQuickActionsOpen(false);
  };

  const handleOpenNewTask = () => {
    setOpenNewTaskModal(true);
    setQuickActionsOpen(false);
  };

  const handleCloseNewProject = () => {
    setOpenNewProjectModal(false);
  };

  const handleCloseNewTask = () => {
    setOpenNewTaskModal(false);
  };

  const quickActions = [
    { icon: <ProjectIcon />, name: t('quickActions.newProject', 'New Project'), action: handleOpenNewProject },
    { icon: <TaskIcon />, name: t('quickActions.newTask', 'New Task'), action: handleOpenNewTask },
  ];

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      width: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>        
      {/* Sidebar */}
      <CollapsibleSidebar
        isMobile={true}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(isRtl ? {
            marginRight: { sm: 0 },
            marginLeft: 0,
            borderLeft: 'none',
          } : {
            marginLeft: { sm: 0 },
            marginRight: 0,
            borderRight: 'none',
          }),
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Outlet />

        {/* Floating Quick-Create Action Button */}
        {user && (
          <SpeedDial
            ariaLabel="Quick Create Actions"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            icon={<SpeedDialIcon />}
            onClose={() => setQuickActionsOpen(false)}
            onOpen={() => setQuickActionsOpen(true)}
            open={quickActionsOpen}
          >
            {quickActions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                tooltipOpen
                onClick={action.action}
              />
            ))}
          </SpeedDial>
        )}
      </Box>

      {/* Project Creation Modal */}
      {openNewProjectModal && (
        <NewProjectModal 
          open={openNewProjectModal} 
          onClose={handleCloseNewProject} 
        />
      )}

      {/* Task Creation Modal */}
      {openNewTaskModal && (
        <NewTaskModal 
          open={openNewTaskModal} 
          onClose={handleCloseNewTask} 
        />
      )}
    </Box>
  );
};

// Import these components at the top of the file when available
const NewProjectModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  // This is a placeholder. In a real app, you would implement a proper project creation modal
  // or import an existing component
  return <div>Project Modal</div>;
};

const NewTaskModal = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
  // This is a placeholder. In a real app, you would implement a proper task creation modal
  // or import an existing component
  return <div>Task Modal</div>;
};

export default Layout; 