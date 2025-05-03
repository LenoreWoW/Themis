import React, { createContext, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import useThemeMode, { ThemeMode } from '../hooks/useThemeMode';
import { lightTheme, darkTheme } from '../theme/modernTheme';

// Define the context type
interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create the context with a default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeHook = useThemeMode();
  
  // Use the appropriate theme based on the current mode
  const theme = themeHook.themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={themeHook}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Create a custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider; 