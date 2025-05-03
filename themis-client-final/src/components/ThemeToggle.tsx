import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon } from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { themeMode: mode, toggleThemeMode: toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'dark' ? t('theme.lightMode', 'Switch to Light Mode') : t('theme.darkMode', 'Switch to Dark Mode')}>
      <IconButton 
        color="inherit" 
        onClick={toggleTheme} 
        sx={{ ml: 1 }}
        aria-label={mode === 'dark' ? t('theme.lightMode', 'Switch to Light Mode') : t('theme.darkMode', 'Switch to Dark Mode')}
      >
        {mode === 'dark' ? <LightIcon /> : <DarkIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 