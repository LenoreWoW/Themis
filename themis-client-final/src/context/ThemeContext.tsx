import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeMode, ThemeContextType } from '../types/theme';

// Create context with default values
const defaultContext: ThemeContextType = {
  themeMode: 'light',
  isDarkMode: false,
  isLightMode: true,
  toggleThemeMode: () => {},
  setThemeMode: () => {},
};

// Create the context
const ThemeContext = createContext<ThemeContextType>(defaultContext);

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the initial theme mode from localStorage or use 'light' as default
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Try to get theme from localStorage, default to 'light'
    try {
      const savedMode = localStorage.getItem('themisThemeMode');
      return (savedMode === 'dark' ? 'dark' : 'light') as ThemeMode;
    } catch (e) {
      return 'light';
    }
  });

  // Derived state
  const isDarkMode = themeMode === 'dark';
  const isLightMode = themeMode === 'light';

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    setThemeModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Set theme mode directly
  const setThemeMode = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
  };

  // Save the theme mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('themisThemeMode', themeMode);
      
      // Update the document's class for potential global styling
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
      }
    } catch (e) {
      console.error('Error setting theme mode:', e);
    }
  }, [themeMode]);

  // Create the context value object
  const contextValue = {
    themeMode,
    isDarkMode,
    isLightMode,
    toggleThemeMode,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 