import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Tooltip, Menu, MenuItem, Box } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';

/**
 * A reusable language switcher component that can be placed anywhere in the application
 * Handles switching between Arabic and English with optimized performance
 */
const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  // Track current language and update state when it changes
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (language: string) => {
    // Only change if actually different
    if (language !== currentLang) {
      i18n.changeLanguage(language);
      
      // Set document direction at the page level
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      
      // Store preference
      localStorage.setItem('pmsLanguage', language);
    }
    handleClose();
  };

  // Determine which language to show in the menu
  const getOppositeLanguage = () => {
    return currentLang === 'ar' ? 'en' : 'ar';
  };

  const oppositeLanguage = getOppositeLanguage();
  const oppositeLanguageName = oppositeLanguage === 'ar' ? 'العربية' : 'English';
  const currentLanguageName = currentLang === 'ar' ? 'العربية' : 'English';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Tooltip title={t('common.switchLanguage')} arrow>
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          <LanguageIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem 
          selected={currentLang === 'en'} 
          onClick={() => handleLanguageChange('en')}
        >
          English
        </MenuItem>
        <MenuItem 
          selected={currentLang === 'ar'} 
          onClick={() => handleLanguageChange('ar')}
          sx={{ 
            fontFamily: 'Cairo, sans-serif',
            fontWeight: currentLang === 'ar' ? 700 : 400
          }}
        >
          العربية
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default LanguageSwitcher; 