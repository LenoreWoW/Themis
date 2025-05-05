import React, { useState, useEffect } from 'react';
import { 
  MenuItem, 
  ListItemText,
  IconButton,
  Menu,
} from '@mui/material';
import { 
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Direction } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';

interface LanguageSwitcherProps {
  onDirectionChange: (direction: Direction) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onDirectionChange }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const auth = useAuth();
  
  const currentLanguage = i18n.language;
  
  const languages = [
    { code: 'en', name: t('language.english', 'English'), dir: 'ltr' },
    { code: 'ar', name: t('language.arabic', 'العربية'), dir: 'rtl' }
  ];

  // Initialize language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('themisLanguage');
    if (savedLanguage && savedLanguage !== i18n.language) {
      const langDirection = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      i18n.changeLanguage(savedLanguage);
      onDirectionChange(langDirection as Direction);
      console.log('Initialized language from localStorage:', savedLanguage, langDirection);
    }
  }, [i18n, onDirectionChange]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langCode: string, direction: Direction) => {
    console.log(`Changing language to ${langCode} (${direction})`);
    
    try {
      // Clear i18next cache first to ensure new translations are loaded
      localStorage.removeItem('i18nextLng');
      
      // Change language
      i18n.changeLanguage(langCode);
      
      // Save to localStorage
      localStorage.setItem('themisLanguage', langCode);
      localStorage.setItem('i18nextLng', langCode);
      
      // Change direction
      onDirectionChange(direction);
      
      // Update document direction
      document.documentElement.dir = direction;
      document.documentElement.lang = langCode;
      
      // Apply RTL/LTR class to body
      const body = document.body;
      if (direction === 'rtl') {
        body.classList.add('rtl');
        body.classList.remove('ltr');
      } else {
        body.classList.add('ltr');
        body.classList.remove('rtl');
      }
      
      // Close menu
      handleClose();
      
      // Preserve auth state when changing language
      if (auth.isAuthenticated && auth.user) {
        // Save auth data to sessionStorage
        const authState = {
          isPreserved: true,
          userId: auth.user.id,
          username: auth.user.username,
          token: auth.token,
          user: auth.user
        };
        sessionStorage.setItem('themis_preserve_auth', JSON.stringify(authState));
      }
      
      // Refresh the page to ensure all translations are applied
      window.location.reload();
      
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="change language"
        aria-controls="language-menu"
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
        sx={{ ml: 1 }}
      >
        <LanguageIcon />
      </IconButton>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => handleLanguageChange(lang.code, lang.dir as Direction)}
            selected={currentLanguage === lang.code}
          >
            <ListItemText>{lang.name}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher; 