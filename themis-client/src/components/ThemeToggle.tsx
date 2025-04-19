import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();
  const { t } = useTranslation();

  return (
    <Tooltip title={mode === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}>
      <IconButton
        color="inherit"
        onClick={toggleTheme}
        size="medium"
        sx={{ ml: 1 }}
        aria-label={mode === 'dark' ? t('theme.lightMode') : t('theme.darkMode')}
      >
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 