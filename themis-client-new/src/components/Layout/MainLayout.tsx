import React from 'react';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Divider, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  BarChart as ReportIcon,
  Assignment as ProjectIcon,
  Task as TaskIcon,
  Group as UserIcon,
  Warning as RiskIcon,
  Notifications as NotificationIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

const drawerWidth = 240;

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState<null | HTMLElement>(null);
  
  const location = useLocation();
  const { user, logout, isAdmin, isDirector, isExecutive, isMainPMO, isSubPMO, isProjectManager } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleOpenNotification = (id: string) => {
    markAsRead(id);
    handleNotificationClose();
    // Navigate to specific notification target would go here
  };

  const navItems = [
    { 
      title: 'Dashboard', 
      icon: <DashboardIcon />, 
      path: '/',
      visible: true 
    },
    { 
      title: 'Projects', 
      icon: <ProjectIcon />, 
      path: '/projects',
      visible: true 
    },
    { 
      title: 'Tasks', 
      icon: <TaskIcon />, 
      path: '/tasks',
      visible: true 
    },
    { 
      title: 'Risks & Issues', 
      icon: <RiskIcon />, 
      path: '/risks',
      visible: isProjectManager || isSubPMO || isMainPMO || isDirector || isExecutive
    },
    { 
      title: 'Reports', 
      icon: <ReportIcon />, 
      path: '/reports',
      visible: isSubPMO || isMainPMO || isDirector || isExecutive 
    },
    { 
      title: 'User Management', 
      icon: <UserIcon />, 
      path: '/users',
      visible: isAdmin || isDirector || isExecutive
    },
    { 
      title: 'Settings', 
      icon: <SettingsIcon />, 
      path: '/settings',
      visible: isAdmin 
    },
  ];

  const drawer = (
    <div>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Themis PMS
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {navItems
          .filter(item => item.visible)
          .map((item) => (
            <ListItem key={item.title} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={location.pathname === item.path}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Themis Project Management System
          </Typography>

          {/* Notifications */}
          <IconButton
            size="large"
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={notificationAnchor}
            open={Boolean(notificationAnchor)}
            onClose={handleNotificationClose}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={() => handleOpenNotification(notification.id)}
                  sx={{ 
                    opacity: notification.read ? 0.7 : 1,
                    backgroundColor: notification.read ? 'inherit' : 'rgba(66, 165, 245, 0.1)'
                  }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2">{notification.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            ) : (
              <MenuItem>
                <Typography variant="body2">No notifications</Typography>
              </MenuItem>
            )}
          </Menu>

          {/* User Profile */}
          <Tooltip title="Account settings">
            <IconButton
              size="large"
              edge="end"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ width: 32, height: 32 }}
                alt={user?.username || "User"}
              >
                {user?.username?.[0].toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="subtitle2">
                {user?.username || "User"}
              </Typography>
            </MenuItem>
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">
                Role: {user?.role || "Unknown"}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleMenuClose}>My Profile</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginTop: '64px' 
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 