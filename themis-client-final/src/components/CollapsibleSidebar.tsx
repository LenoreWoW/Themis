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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import SchoolIcon from '@mui/icons-material/School';
import { useLocation, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import {
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

// Qatar flag colors
const qatarMaroon = {
  main: '#8A1538',
  light: '#A43A59',
  dark: '#6E0020',
};

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
  const [openApprovals, setOpenApprovals] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setOpenSettings(!openSettings);
  };

  const handleApprovalsClick = () => {
    setOpenApprovals(!openApprovals);
  };

  const menuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard', role: ['ADMIN', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR'] },
    { text: t('navigation.calendar'), icon: <CalendarTodayIcon />, path: '/calendar' },
    { text: t('navigation.projects'), icon: <FolderIcon />, path: '/projects' },
    { 
      text: t('navigation.approvals'), 
      icon: <CheckCircleIcon />, 
      path: '/approvals',
          role: ['ADMIN', 'MAIN_PMO', 'SUB_PMO', 'PROJECT_MANAGER', 'EXECUTIVE']
    },
    { text: t('navigation.tasks'), icon: <AssignmentIcon />, path: '/tasks' },
    { text: t('navigation.assignments'), icon: <WorkIcon />, path: '/assignments' },
    { text: t('navigation.goals'), icon: <FlagIcon />, path: '/goals' },
    { text: t('navigation.risksIssues'), icon: <WarningIcon />, path: '/risks-issues' },
    { text: t('navigation.meetings'), icon: <GroupsIcon />, path: '/meetings' },
    { 
      text: t('navigation.faculty'), 
      icon: <SchoolIcon />, 
      path: '/faculty',
      role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE'] 
    },
    { 
      text: t('navigation.auditLogs'), 
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
          text: t('navigation.userManagement', 'User Management'), 
          icon: <PeopleIcon />, 
          path: '/users',
          role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'EXECUTIVE'] 
        },
        { 
          text: t('navigation.departments'), 
          icon: <BusinessIcon />, 
          path: '/departments',
          role: ['ADMIN', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR'] 
        },
        { 
          text: t('navigation.complianceAudit', 'Compliance Audit'), 
          icon: <VerifiedUserIcon />, 
          path: '/audit',
          role: ['ADMIN', 'MAIN_PMO'] 
        }
      ]
    },
    { 
      text: t('navigation.ideation'), 
      icon: <LightbulbIcon />,
      path: '/ideation',
      role: ['ADMIN', 'PROJECT_MANAGER', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR', 'TEAM_MEMBER']
    }
  ];

  const drawer = (
    <>
      <DrawerHeader sx={{ justifyContent: isOpen ? 'space-between' : 'center' }}>
        {isOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Box 
              component="img" 
              src="/Finallogo.jpg" 
              alt="نظام ادارة المشاريع"
              sx={{ 
                width: 32,
                height: 32,
                mr: 1,
                borderRadius: '4px'
              }} 
            />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                background: theme.palette.mode === 'dark' 
                  ? `linear-gradient(45deg, ${qatarMaroon.light}, #FFFFFF)`
                  : `linear-gradient(45deg, ${qatarMaroon.main}, ${qatarMaroon.dark})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {t('app.title')}
            </Typography>
          </Box>
        )}
        <IconButton onClick={handleDrawerToggle}>
          {!isOpen ? (isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />) : 
            (isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
        </IconButton>
      </DrawerHeader>
      <Divider sx={{ borderColor: alpha(qatarMaroon.main, 0.2) }} />
      <List sx={{ px: 0, py: 1 }}>
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
            const isSubmenuActive = item.path === '/approvals' ? openApprovals : openSettings;
            const handleSubmenuClick = item.path === '/approvals' ? handleApprovalsClick : handleSettingsClick;
            
            return isOpen ? (
              <React.Fragment key={item.text}>
                <ListItem
                  component="div"
                  onClick={handleSubmenuClick}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    color: (isSubmenuActive || isActive) ? qatarMaroon.main : 'text.primary',
                    backgroundColor: (isSubmenuActive || isActive)
                      ? alpha(qatarMaroon.main, isDark ? 0.15 : 0.08)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: (isSubmenuActive || isActive)
                        ? alpha(qatarMaroon.main, isDark ? 0.25 : 0.12)
                        : alpha(theme.palette.action.hover, 0.8),
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: (isSubmenuActive || isActive) ? qatarMaroon.main : 'inherit',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: (isSubmenuActive || isActive) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                  {isSubmenuActive ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={item.path === '/approvals' ? openApprovals : openSettings} timeout="auto" unmountOnExit>
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
                            px: 1.5,
                            color: isChildActive ? qatarMaroon.main : 'text.primary',
                            backgroundColor: isChildActive 
                              ? alpha(qatarMaroon.main, isDark ? 0.1 : 0.05)
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: isChildActive 
                                ? alpha(qatarMaroon.main, isDark ? 0.15 : 0.075)
                                : alpha(theme.palette.action.hover, 0.8),
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 40, 
                            color: isChildActive ? qatarMaroon.main : 'inherit',
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
                                backgroundColor: qatarMaroon.main,
                                position: 'absolute',
                                right: isRtl ? 'auto' : 0,
                                left: isRtl ? 0 : 'auto',
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
              <Tooltip title={item.text} placement={isRtl ? "left" : "right"} key={item.text}>
                <ListItem 
                  component="div"
                  onClick={handleSubmenuClick}
                  sx={{
                    justifyContent: 'center',
                    borderRadius: 2,
                    mb: 0.5,
                    px: 1.5,
                    color: (isSubmenuActive || isActive) ? qatarMaroon.main : 'text.primary',
                    backgroundColor: (isSubmenuActive || isActive)
                      ? alpha(qatarMaroon.main, isDark ? 0.1 : 0.05)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: (isSubmenuActive || isActive)
                        ? alpha(qatarMaroon.main, isDark ? 0.15 : 0.075)
                        : alpha(theme.palette.action.hover, 0.8),
                    },
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 'auto', 
                    color: (isSubmenuActive || isActive) ? qatarMaroon.main : 'inherit',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {(isSubmenuActive || isActive) && (
                    <Box
                      sx={{
                        width: 4,
                        height: 32,
                        borderRadius: 4,
                        backgroundColor: qatarMaroon.main,
                        position: 'absolute',
                        right: isRtl ? 'auto' : 0,
                        left: isRtl ? 0 : 'auto',
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
                px: 1.5,
                color: isActive ? qatarMaroon.main : 'text.primary',
                backgroundColor: isActive 
                  ? alpha(qatarMaroon.main, isDark ? 0.1 : 0.05)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActive 
                    ? alpha(qatarMaroon.main, isDark ? 0.15 : 0.075)
                    : alpha(theme.palette.action.hover, 0.8),
                },
                transition: 'all 0.3s ease',
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: isActive ? qatarMaroon.main : 'inherit',
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
                    backgroundColor: qatarMaroon.main,
                    position: 'absolute',
                    right: isRtl ? 'auto' : 0,
                    left: isRtl ? 0 : 'auto',
                  }}
                />
              )}
            </ListItem>
          ) : (
            <Tooltip title={item.text} placement={isRtl ? "left" : "right"} key={item.text}>
              <ListItem 
                component={NavLink}
                to={item.path}
                sx={{
                  justifyContent: 'center',
                  borderRadius: 2,
                  mb: 0.5,
                  px: 1.5,
                  color: isActive ? qatarMaroon.main : 'text.primary',
                  backgroundColor: isActive 
                    ? alpha(qatarMaroon.main, isDark ? 0.1 : 0.05)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? alpha(qatarMaroon.main, isDark ? 0.15 : 0.075)
                      : alpha(theme.palette.action.hover, 0.8),
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 'auto', 
                  color: isActive ? qatarMaroon.main : 'inherit',
                }}>
                  {item.icon}
                </ListItemIcon>
                {isActive && (
                  <Box
                    sx={{
                      width: 4,
                      height: 32,
                      borderRadius: 4,
                      backgroundColor: qatarMaroon.main,
                      position: 'absolute',
                      right: isRtl ? 'auto' : 0,
                      left: isRtl ? 0 : 'auto',
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
              padding: 0,
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
            padding: 0,
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