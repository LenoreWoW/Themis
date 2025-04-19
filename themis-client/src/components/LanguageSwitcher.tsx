import React, { useState } from 'react';
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

interface LanguageSwitcherProps {
  onDirectionChange: (direction: Direction) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ onDirectionChange }) => {
  const { i18n, t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const currentLanguage = i18n.language;
  
  const languages = [
    { code: 'en', name: t('language.english'), dir: 'ltr' },
    { code: 'ar', name: t('language.arabic'), dir: 'rtl' }
  ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageChange = (langCode: string, direction: Direction) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('themisLanguage', langCode);
    onDirectionChange(direction);
    handleClose();
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