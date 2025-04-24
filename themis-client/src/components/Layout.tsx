import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Direction
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import UserMenu from './UserMenu';
import { useTranslation } from 'react-i18next';
import CollapsibleSidebar from './CollapsibleSidebar';
import { useEasterEgg } from '../context/EasterEggContext';
import FlagIcon from '@mui/icons-material/Flag';

// Qatar flag colors
const qatarMaroon = {
  main: '#8A1538',
  light: '#A43A59',
  dark: '#6E0020',
};

const DRAWER_WIDTH = 240;

interface LayoutProps {
  direction?: Direction;
}

const Layout: React.FC<LayoutProps> = ({ direction = 'ltr' }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const { easterEggActive } = useEasterEgg();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: '100%',
            backgroundColor: qatarMaroon.main,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
          }}
          elevation={0}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FlagIcon sx={{ color: 'white', mr: 1.5, fontSize: 24 }} />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  color: 'white',
                  letterSpacing: '0.5px'
                }}
              >
                {t('app.title', 'Themis Project Management')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <LanguageSwitcher onDirectionChange={() => {
                // The parent App component already handles direction changes based on i18n
              }} />
              
              <ThemeToggle />
              
              <NotificationBell />
              <UserMenu />
            </Box>
          </Toolbar>
        </AppBar>
        
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
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            mt: 8,
            transition: (theme) => theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout; 