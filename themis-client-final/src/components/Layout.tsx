import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Direction,
  useTheme
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
  onDirectionChange: (direction: Direction) => void;
}

const Layout: React.FC<LayoutProps> = ({ direction = 'ltr', onDirectionChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { easterEggActive } = useEasterEgg();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

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
                {t('app.title')}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <LanguageSwitcher />
              
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
            mt: 8,
            transition: (theme) => theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            ...(isRtl ? {
              marginRight: { sm: `${DRAWER_WIDTH}px` },
              marginLeft: 0,
              borderLeft: 'none',
            } : {
              marginLeft: { sm: `${DRAWER_WIDTH}px` },
              marginRight: 0,
              borderRight: 'none',
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