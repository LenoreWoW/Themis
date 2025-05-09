import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { 
  Box, 
  Direction,
  useTheme
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CollapsibleSidebar from './CollapsibleSidebar';
import { useEasterEgg } from '../context/EasterEggContext';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

interface LayoutProps {
  direction?: Direction;
  onDirectionChange: (direction: Direction) => void;
}

const Layout: React.FC<LayoutProps> = ({ direction = 'ltr', onDirectionChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
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
      </Box>
    </Box>
  );
};

export default Layout; 