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
  Collapse,
  Avatar,
  Badge,
  Slide,
  Paper
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
import ChatIcon from '@mui/icons-material/Chat';
import LanguageIcon from '@mui/icons-material/Language';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StorageIcon from '@mui/icons-material/Storage';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import {
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import useNotifications from '../hooks/useNotifications';
import AddIcon from '@mui/icons-material/Add';

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

const UserProfileSection = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(1),
  marginTop: 'auto',
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
  backgroundColor: qatarMaroon.dark,
}));

// Create a styled settings icon that matches Discord's design
const DiscordSettingsIcon = styled(SettingsIcon)(({ theme }) => ({
  strokeWidth: 1.5,
  transform: 'scale(1)', // for animation
  transition: 'transform 150ms ease-out, opacity 150ms ease-out, background-color 150ms ease-out',
  '&:hover': {
    opacity: 1,
    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))'
  },
  '&:active': {
    transform: 'scale(0.96)',
  }
}));

// Interface for menu items
interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  role?: string[];
  submenu?: boolean;
  children?: MenuItem[];
}

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
  const [openWorkspace, setOpenWorkspace] = useState(false);
  const [openMyWork, setOpenMyWork] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { themeMode, toggleThemeMode } = useThemeContext();
  const isDark = theme.palette.mode === 'dark';
  const isRtl = theme.direction === 'rtl';
  const navigate = useNavigate();
  const { unreadCount } = useNotifications(user?.id);

  const handleDrawerToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSettingsClick = () => {
    setOpenSettings(!openSettings);
  };

  const handleWorkspaceClick = () => {
    setOpenWorkspace(!openWorkspace);
  };
  
  const handleMyWorkClick = () => {
    setOpenMyWork(!openMyWork);
  };
  
  const handleSettingsPanelOpen = () => {
    setSettingsPanelOpen(true);
  };
  
  const handleSettingsPanelClose = () => {
    setSettingsPanelOpen(false);
  };
  
  const handleNavigateToSettings = (path: string) => {
    navigate(path);
    setSettingsPanelOpen(false);
  };
  
  const handleLanguageChange = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('pmsLanguage', newLang);
    
    // Dispatch event for layout to catch
    const event = new Event('i18n-updated');
    document.dispatchEvent(event);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems: MenuItem[] = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard', role: ['ADMIN', 'EXECUTIVE', 'DEPARTMENT_DIRECTOR'] },
    { 
      text: t('navigation.workspaceMain'), 
      icon: <FolderIcon />, 
      path: '/workspace-main',
      submenu: true,
      children: [
        { text: t('navigation.projects'), icon: <FolderIcon />, path: '/projects' },
        { text: t('navigation.approvals'), icon: <CheckCircleIcon />, path: '/approvals' },
        { text: t('navigation.risksIssues'), icon: <WarningIcon />, path: '/risks-issues' },
        { text: t('navigation.dependencies'), icon: <AccountTreeIcon />, path: '/dependencies' },
        { text: t('navigation.repository'), icon: <StorageIcon />, path: '/repository' },
        { text: t('navigation.chat'), icon: <ChatIcon />, path: '/chat' },
        { 
          text: t('navigation.myWork'), 
          icon: <WorkIcon />, 
          path: '/workspace',
          submenu: true,
          children: [
            { text: t('navigation.ideation'), icon: <LightbulbIcon />, path: '/ideation' },
            { text: t('navigation.assignments'), icon: <WorkIcon />, path: '/assignments' },
            { text: t('navigation.tasks'), icon: <AssignmentIcon />, path: '/tasks' },
            { text: t('navigation.taskBoard'), icon: <AssignmentIcon />, path: '/task-board' },
            { text: t('navigation.meetings'), icon: <GroupsIcon />, path: '/meetings' },
            { text: t('navigation.actionItems'), icon: <PlaylistAddCheckIcon />, path: '/action-items' },
          ]
        },
      ]
    },
    { text: t('navigation.onboarding'), icon: <EmojiEventsIcon />, path: '/onboarding' },
  ];

  // Settings menu items - for the slide-in panel
  const settingsMenuItems: MenuItem[] = [
    { 
      text: t('navigation.userManagement', 'User Management'), 
      icon: <PeopleIcon />, 
      path: '/users'
    },
    { 
      text: t('navigation.departments'), 
      icon: <BusinessIcon />, 
      path: '/departments'
    },
    { 
      text: t('navigation.faculty'), 
      icon: <SchoolIcon />, 
      path: '/faculty'
    },
    { 
      text: t('navigation.tutorials'), 
      icon: <SchoolIcon />, 
      path: '/settings/tutorials',
      role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE', 'PROJECT_MANAGER'] 
    },
    { 
      text: t('navigation.help', 'Help'), 
      icon: <HelpIcon />, 
      path: '/help',
      role: ['ADMIN', 'DEPARTMENT_DIRECTOR', 'SUB_PMO', 'MAIN_PMO', 'EXECUTIVE', 'PROJECT_MANAGER', 'TEAM_MEMBER'] 
    },
    { 
      text: t('navigation.auditLogs'), 
      icon: <VerifiedUserIcon />, 
      path: '/audit-logs',
      role: ['ADMIN', 'MAIN_PMO', 'SUB_PMO'] 
    },
    { 
      text: t('navigation.complianceAudit', 'Compliance Audit'), 
      icon: <VerifiedUserIcon />, 
      path: '/audit',
      role: ['ADMIN', 'MAIN_PMO'] 
    }
  ];

  const drawer = (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        backgroundColor: qatarMaroon.main,
        color: 'white'
      }}
    >
      <DrawerHeader 
        sx={{ 
          justifyContent: isOpen ? 'space-between' : 'center',
          backgroundColor: qatarMaroon.dark,
          color: 'white'
        }}
      >
        {isOpen ? (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                color: 'white',
              }}
            >
              {t('app.title')}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Avatar 
              src="/Finallogo.jpg" 
              alt="نظام ادارة المشاريع"
              sx={{ width: 32, height: 32 }} 
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Discord-style Settings Icon */}
          <Tooltip 
            title={t('navigation.systemSettings', 'System Settings')} 
            placement={isRtl ? "bottom-end" : "bottom-start"}
            enterDelay={250}
          >
            <IconButton 
              onClick={handleSettingsPanelOpen} 
              sx={{ 
                color: alpha('#fff', 0.7), 
                '&:hover': { 
                  color: 'white',
                },
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px'
                },
                mr: 0.5,
                padding: '6px'
              }}
              aria-label="Open system settings"
              tabIndex={0}
            >
              <DiscordSettingsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            {!isOpen ? (isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />) : 
              (isRtl ? <ChevronRightIcon /> : <ChevronLeftIcon />)}
          </IconButton>
        </Box>
      </DrawerHeader>
      
      <List sx={{ px: 0, pt: 1 }}>
        {/* Notifications button at the top */}
        {isOpen ? (
          <>
            <ListItem 
              button 
              component={NavLink} 
              to="/notifications"
              sx={{
                py: 1.5,
                px: 2,
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary={t('common.notifications', 'Notifications')} />
            </ListItem>
            
            {/* Calendar item */}
            <ListItem 
              button 
              component={NavLink} 
              to="/calendar"
              sx={{
                py: 1.5,
                px: 2,
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <CalendarTodayIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.calendar', 'Calendar')} />
            </ListItem>
            
            {/* Goals item */}
            <ListItem 
              button 
              component={NavLink} 
              to="/goals"
              sx={{
                py: 1.5,
                px: 2,
                borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
                mb: 0,
                color: 'white',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                <FlagIcon />
              </ListItemIcon>
              <ListItemText primary={t('navigation.goals', 'Goals')} />
            </ListItem>
          </>
        ) : (
          <>
            <Tooltip title={t('common.notifications', 'Notifications')} placement={isRtl ? "left" : "right"}>
              <ListItem 
                button 
                component={NavLink} 
                to="/notifications"
                sx={{
                  justifyContent: 'center',
                  py: 1.5,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItem>
            </Tooltip>
            
            {/* Calendar item (collapsed) */}
            <Tooltip title={t('navigation.calendar', 'Calendar')} placement={isRtl ? "left" : "right"}>
              <ListItem 
                button 
                component={NavLink} 
                to="/calendar"
                sx={{
                  justifyContent: 'center',
                  py: 1.5,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                <CalendarTodayIcon />
              </ListItem>
            </Tooltip>
            
            {/* Goals item (collapsed) */}
            <Tooltip title={t('navigation.goals', 'Goals')} placement={isRtl ? "left" : "right"}>
              <ListItem 
                button 
                component={NavLink} 
                to="/goals"
                sx={{
                  justifyContent: 'center',
                  py: 1.5,
                  borderBottom: `1px solid ${alpha('#fff', 0.1)}`,
                  mb: 0,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.1),
                  }
                }}
              >
                <FlagIcon />
              </ListItem>
            </Tooltip>
          </>
        )}
        
        {/* Menu items */}
        {menuItems.map((item) => {
          // Skip Goals item as it's now placed at the top
          if (item.text === t('navigation.goals')) {
            return null;
          }
          
          // Check if the route requires a specific role
          if (item.role && user?.role && !item.role.includes(user.role)) {
            return null;
          }

          // Check if the current path starts with this menu item's path
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));

          // Handle submenu items differently
          if (item.submenu) {
            const isSubmenuOpen = item.path === '/workspace-main' 
              ? openWorkspace 
              : (item.path === '/workspace' ? openMyWork : openSettings);
              
            const handleSubmenuClick = item.path === '/workspace-main'
              ? handleWorkspaceClick
              : (item.path === '/workspace' ? handleMyWorkClick : handleSettingsClick);
            
            return isOpen ? (
              <React.Fragment key={item.text}>
                <ListItem
                  component="div"
                  onClick={handleSubmenuClick}
                  sx={{
                    borderRadius: 0,
                    mb: 0.5,
                    px: 1.5,
                    color: 'white',
                    backgroundColor: (isSubmenuOpen || isActive)
                      ? alpha('#fff', 0.15)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.2),
                    },
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: 'white',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontWeight: (isSubmenuOpen || isActive) ? 600 : 400,
                      fontSize: '0.9rem'
                    }}
                  />
                  {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ background: alpha('#000', 0.1) }}>
                    {item.children?.map((child) => {
                      // Check if the child route requires a specific role
                      // Skip role checks for workspace items
                      if (child.role && user?.role && !child.role.includes(user.role) && 
                          item.text !== t('navigation.workspaceMain')) {
                        return null;
                      }

                      // If the child has its own submenu (My Work)
                      if (child.submenu) {
                        const isChildSubmenuOpen = openMyWork;
                        const isChildActive = location.pathname === child.path || 
                          (child.path !== '/' && location.pathname.startsWith(child.path));
                          
                        return (
                          <React.Fragment key={child.text}>
                            <ListItem
                              component="div"
                              onClick={handleMyWorkClick}
                              sx={{
                                borderRadius: 0,
                                mb: 0.5,
                                ml: 2,
                                pl: 2,
                                pr: 1.5,
                                color: 'white',
                                backgroundColor: (isChildSubmenuOpen || isChildActive)
                                  ? alpha('#fff', 0.1)
                                  : 'transparent',
                                '&:hover': {
                                  backgroundColor: alpha('#fff', 0.15),
                                },
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                              }}
                            >
                              <ListItemIcon sx={{ 
                                minWidth: 40, 
                                color: 'white',
                              }}>
                                {child.icon}
                              </ListItemIcon>
                              <ListItemText 
                                primary={child.text} 
                                primaryTypographyProps={{ 
                                  fontWeight: (isChildSubmenuOpen || isChildActive) ? 600 : 400,
                                  fontSize: '0.9rem'
                                }}
                              />
                              {isChildSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                            <Collapse in={isChildSubmenuOpen} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding sx={{ background: alpha('#000', 0.1) }}>
                                {child.children?.map((grandchild) => {
                                  // Check if the grandchild route requires a specific role
                                  // Skip role checks for workspace submenu items
                                  if (grandchild.role && user?.role && !grandchild.role.includes(user.role) && 
                                      item.text !== t('navigation.workspaceMain')) {
                                    return null;
                                  }

                                  const isGrandchildActive = location.pathname === grandchild.path || 
                                    (grandchild.path !== '/' && location.pathname.startsWith(grandchild.path));

                                  return (
                                    <ListItem 
                                      key={grandchild.text} 
                                      component={NavLink} 
                                      to={grandchild.path}
                                      sx={{
                                        borderRadius: 0,
                                        mb: 0.5,
                                        ml: 4,
                                        pl: 2,
                                        pr: 1.5,
                                        color: 'white',
                                        backgroundColor: isGrandchildActive 
                                          ? alpha('#fff', 0.1)
                                          : 'transparent',
                                        '&:hover': {
                                          backgroundColor: alpha('#fff', 0.15),
                                        },
                                        transition: 'all 0.2s ease',
                                      }}
                                    >
                                      <ListItemIcon sx={{ 
                                        minWidth: 40, 
                                        color: 'white',
                                      }}>
                                        {grandchild.icon}
                                      </ListItemIcon>
                                      <ListItemText 
                                        primary={grandchild.text} 
                                        primaryTypographyProps={{ 
                                          fontWeight: isGrandchildActive ? 600 : 400,
                                          fontSize: '0.9rem'
                                        }}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </Collapse>
                          </React.Fragment>
                        );
                      }

                      const isChildActive = location.pathname === child.path || 
                        (child.path !== '/' && location.pathname.startsWith(child.path));

                      return (
                        <ListItem 
                          key={child.text} 
                          component={NavLink} 
                          to={child.path}
                          sx={{
                            borderRadius: 0,
                            mb: 0.5,
                            ml: 2,
                            pl: 2,
                            pr: 1.5,
                            color: 'white',
                            backgroundColor: isChildActive 
                              ? alpha('#fff', 0.1)
                              : 'transparent',
                            '&:hover': {
                              backgroundColor: alpha('#fff', 0.15),
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 40, 
                            color: 'white',
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
                    borderRadius: 0,
                    mb: 0.5,
                    px: 1.5,
                    color: 'white',
                    backgroundColor: (isSubmenuOpen || isActive)
                      ? alpha('#fff', 0.1)
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha('#fff', 0.15),
                    },
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 'auto', 
                    color: 'white',
                  }}>
                    {item.icon}
                  </ListItemIcon>
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
                borderRadius: 0,
                mb: 0.5,
                px: 1.5,
                color: 'white',
                backgroundColor: isActive 
                  ? alpha('#fff', 0.1)
                  : 'transparent',
                '&:hover': {
                  backgroundColor: alpha('#fff', 0.15),
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: 'white',
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
            </ListItem>
          ) : (
            <Tooltip title={item.text} placement={isRtl ? "left" : "right"} key={item.text}>
              <ListItem 
                component={NavLink}
                to={item.path}
                sx={{
                  justifyContent: 'center',
                  borderRadius: 0,
                  mb: 0.5,
                  px: 1.5,
                  color: 'white',
                  backgroundColor: isActive 
                    ? alpha('#fff', 0.1)
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.15),
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 'auto', 
                  color: 'white',
                }}>
                  {item.icon}
                </ListItemIcon>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
      
      {/* User profile section at the bottom - Discord style */}
      <UserProfileSection>
        {isOpen ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            px: 0.5,
            py: 0.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: alpha('#fff', 0.1),
            }
          }}>
            <Avatar 
              sx={{ 
                bgcolor: 'secondary.main',
                mr: 1.5,
                width: 32,
                height: 32
              }}
            >
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.1, fontSize: '0.85rem' }}>
                {`${user?.firstName || ''} ${user?.lastName || ''}`}
              </Typography>
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.7), lineHeight: 1, fontSize: '0.7rem' }}>
                {user?.role}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton 
                size="small" 
                onClick={toggleThemeMode} 
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                {themeMode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleLanguageChange} 
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small" 
                onClick={handleLogout} 
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 0.5 }}>
            <Tooltip title={`${user?.firstName || ''} ${user?.lastName || ''}`} placement={isRtl ? "left" : "right"}>
              <Avatar 
                sx={{ 
                  bgcolor: 'secondary.main',
                  width: 32,
                  height: 32
                }}
              >
                {user?.firstName?.charAt(0) || 'U'}
              </Avatar>
            </Tooltip>
            <Divider sx={{ width: '70%', backgroundColor: alpha('#fff', 0.1) }} />
            <Tooltip title={i18n.language === 'ar' ? 'English' : 'العربية'} placement={isRtl ? "left" : "right"}>
              <IconButton 
                size="small" 
                onClick={handleLanguageChange}
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                <LanguageIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={themeMode === 'dark' ? t('theme.lightMode') : t('theme.darkMode')} placement={isRtl ? "left" : "right"}>
              <IconButton 
                size="small" 
                onClick={toggleThemeMode}
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                {themeMode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t('auth.signout')} placement={isRtl ? "left" : "right"}>
              <IconButton 
                size="small" 
                onClick={handleLogout}
                sx={{ color: alpha('#fff', 0.7), '&:hover': { color: 'white' }, padding: 0.5 }}
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </UserProfileSection>
      
      {/* Settings Panel Slide-in */}
      <Slide direction={isRtl ? "left" : "right"} in={settingsPanelOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            position: 'fixed',
            top: 0,
            [isRtl ? 'left' : 'right']: 0,
            width: { xs: '100%', sm: 360 },
            height: '100%',
            backgroundColor: theme.palette.background.paper,
            zIndex: 1300,
            boxShadow: '0 0 15px rgba(0,0,0,0.2)',
            overflow: 'auto'
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`
          }}>
            <Typography variant="h6">{t('navigation.systemSettings', 'System Settings')}</Typography>
            <IconButton onClick={handleSettingsPanelClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Box>
          
          <List sx={{ pt: 1 }}>
            {settingsMenuItems.map((item) => {
              // Check if the route requires a specific role
              // Skip role check for User Management, Faculty, and Departments
              const isAdminItem = item.text === t('navigation.userManagement', 'User Management') ||
                                  item.text === t('navigation.faculty') ||
                                  item.text === t('navigation.departments');
                                  
              if (item.role && user?.role && !item.role.includes(user.role) && !isAdminItem) {
                return null;
              }
              
              return (
                <ListItem 
                  key={item.text} 
                  button
                  onClick={() => handleNavigateToSettings(item.path)}
                  sx={{
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    }
                  }}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      </Slide>
    </Box>
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
              backgroundColor: qatarMaroon.main,
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
            borderRight: 'none',
            boxShadow: isOpen ? `1px 0 10px 0 ${alpha('#000', 0.2)}` : 'none',
            padding: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: qatarMaroon.main,
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