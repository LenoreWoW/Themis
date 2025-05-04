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
    { code: 'en', name: t('language.english'), dir: 'ltr' },
    { code: 'ar', name: t('language.arabic'), dir: 'rtl' }
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
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langCode: string, direction: Direction) => {
    // Change language
    i18n.changeLanguage(langCode);
    // Save to localStorage
    localStorage.setItem('themisLanguage', langCode);
    // Change direction
    onDirectionChange(direction);
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
    
    // Force window reload to apply all translations
    setTimeout(() => {
      window.location.reload();
    }, 100);
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