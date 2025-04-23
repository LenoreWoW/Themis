import React, { useState } from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Tooltip, 
  Drawer, 
  useTheme, 
  Divider,
  Typography,
  alpha,
  Collapse
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import WorkIcon from '@mui/icons-material/Work';
import WarningIcon from '@mui/icons-material/Warning';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import FlagIcon from '@mui/icons-material/Flag';
import BusinessIcon from '@mui/icons-material/Business';
import SettingsIcon from '@mui/icons-material/Settings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface CollapsibleSidebarProps {
  isMobile?: boolean;
  onMobileClose?: () => void;
  mobileOpen?: boolean;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  isMobile = false,
  onMobileClose,
  mobileOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [openSettings, setOpenSettings] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isDark = theme.palette.mode === 'dark';

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setOpenSettings(!openSettings);
  };

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard', role: ['ADMIN'] },
    { text: t('navigation.projects'), icon: <FolderIcon />, path: '/projects' },
    { text: t('navigation.tasks'), icon: <AssignmentIcon />, path: '/tasks' },
    { text: t('navigation.assignments'), icon: <WorkIcon />, path: '/assignments' },
    { text: t('navigation.goals'), icon: <FlagIcon />, path: '/goals' },
    { text: t('navigation.risksIssues'), icon: <WarningIcon />, path: '/risks-issues' },
    { text: t('navigation.meetings'), icon: <GroupsIcon />, path: '/meetings' },
    { 
      text: t('navigation.auditLogs', 'Audit Logs'), 
      icon: <VerifiedUserIcon />, 
      path: '/audit-logs',
      role: ['ADMIN', 'MAIN_PMO', 'SUB_PMO'] 
    },
    { 
      text: t('navigation.users'), 
      icon: <SettingsIcon />, 
      path: '/system-settings',
      role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE', 'MAIN_PMO'],
      submenu: true,
      children: [
        { 
          text: 'User Management', 
          icon: <PeopleIcon />, 
          path: '/users',
          role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE'] 
        },
        { 
          text: 'Departments', 
          icon: <BusinessIcon />, 
          path: '/departments',
          role: ['ADMIN', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR'] 
        },
        { 
          text: 'Compliance Audit', 
          icon: <VerifiedUserIcon />, 
          path: '/audit',
          role: ['ADMIN', 'MAIN_PMO'] 
        }
      ]
    }
  ];

  const drawer = (
    <>
      <DrawerHeader sx={{ justifyContent: isOpen ? 'space-between' : 'center' }}>
        {isOpen && (
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              ml: 2, 
              fontWeight: 600,
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #90caf9, #42a5f5)' 
                : 'linear-gradient(45deg, #1565c0, #0d47a1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('app.title')}
          </Typography>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {!isOpen ? <ChevronRightIcon /> : 
            theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List sx={{ p: 1 }}>
        {menuItems.map((item) => {
          // Check if the route requires a specific role
          if (item.role && user?.role && !item.role.includes(user.role)) {
            return null;
          }

          // Check if the current path starts with this menu item's path
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));

          // Handle submenu items differently
          if (item.submenu) {
            return isOpen ? (
              <React.Fragment key={item.text}>
                <ListItem
                  component="div"
                  onClick={handleSettingsClick}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    color: (openSettings || isActive) ? 'primary.main' : 'text.primary',
                    backgroundColor: (openSettings || isActive)
                      ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: (openSettings || isActive)
                        ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15)
                        : alpha(theme.palette.action.hover, 0.8),
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: (openSettings || isActive) ? 'primary.main' : 'inherit',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: (openSettings || isActive) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                  {openSettings ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={openSettings} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children?.map((child) => {
                      // Check if the child route requires a specific role
                      if (child.role && user?.role && !child.role.includes(user.role)) {
                        return null;
                      }

                      const isChildActive = location.pathname === child.path || 
                        (child.path !== '/' && location.pathname.startsWith(child.path));

                      return (
                        <ListItem 
                          key={child.text} 
                          component={NavLink} 
                          to={child.path}
                          sx={{
                            borderRadius: 2,
                            mb: 0.5,
                            ml: 2,
                            color: isChildActive ? 'primary.main' : 'text.primary',
                            backgroundColor: isChildActive 
                              ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: isChildActive 
                                ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15)
                                : alpha(theme.palette.action.hover, 0.8),
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 40, 
                            color: isChildActive ? 'primary.main' : 'inherit',
                          }}>
                            {child.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={child.text} 
                            primaryTypographyProps={{ 
                              fontWeight: isChildActive ? 600 : 400,
                              fontSize: '0.9rem'
                            }}
                          />
                          {isChildActive && (
                            <Box
                              sx={{
                                width: 4,
                                height: 32,
                                borderRadius: 4,
                                backgroundColor: 'primary.main',
                                position: 'absolute',
                                right: 0,
                              }}
                            />
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </React.Fragment>
            ) : (
              <Tooltip title={item.text} placement="right" key={item.text}>
                <ListItem 
                  component="div"
                  onClick={handleSettingsClick}
                  sx={{
                    justifyContent: 'center',
                    borderRadius: 2,
                    mb: 0.5,
                    color: (openSettings || isActive) ? 'primary.main' : 'text.primary',
                    backgroundColor: (openSettings || isActive)
                      ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: (openSettings || isActive)
                        ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15)
                        : alpha(theme.palette.action.hover, 0.8),
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 'auto', 
                    color: (openSettings || isActive) ? 'primary.main' : 'inherit',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {(openSettings || isActive) && (
                    <Box
                      sx={{
                        width: 4,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: 'primary.main',
                        position: 'absolute',
                        right: 0,
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            );
          }

          return isOpen ? (
            <ListItem 
              key={item.text} 
              component={NavLink} 
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: isActive ? 'primary.main' : 'text.primary',
                backgroundColor: isActive 
                  ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActive 
                    ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15)
                    : alpha(theme.palette.action.hover, 0.8),
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: isActive ? 'primary.main' : 'inherit',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem'
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 4,
                    height: 32,
                    borderRadius: 4,
                    backgroundColor: 'primary.main',
                    position: 'absolute',
                    right: 0,
                  }}
                />
              )}
            </ListItem>
          ) : (
            <Tooltip title={item.text} placement="right" key={item.text}>
              <ListItem 
                component="div"
                onClick={handleSettingsClick}
                sx={{
                  justifyContent: 'center',
                  borderRadius: 2,
                  mb: 0.5,
                  color: isActive ? 'primary.main' : 'text.primary',
                  backgroundColor: isActive 
                    ? alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? alpha(theme.palette.primary.main, isDark ? 0.25 : 0.15)
                      : alpha(theme.palette.action.hover, 0.8),
                  },
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 'auto', 
                  color: isActive ? 'primary.main' : 'inherit',
                }}>
                  {item.icon}
                </ListItemIcon>
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 32,
                      borderRadius: 4,
                      backgroundColor: 'primary.main',
                      position: 'absolute',
                      right: 0,
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH },
        flexShrink: { md: 0 },
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              boxShadow: 'none',
              border: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
            overflowX: 'hidden',
            borderRight: `1px solid ${theme.palette.divider}`,
            boxShadow: isOpen ? `1px 0 5px 0 ${alpha('#000', 0.05)}` : 'none',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default CollapsibleSidebar; 