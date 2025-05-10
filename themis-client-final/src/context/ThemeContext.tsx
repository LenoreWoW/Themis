import React, { createContext, useContext, useMemo } from 'react';
import useThemeMode, { ThemeMode } from '../hooks/useThemeMode';

// Define the context type
interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create the context with default values
const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'light',
  isDarkMode: false,
  isLightMode: true,
  toggleThemeMode: () => {},
  setThemeMode: () => {},
});

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get theme state and functions
  const themeHook = useThemeMode();
  
  // Create memoized context value
  const contextValue = useMemo(() => ({
    themeMode: themeHook.themeMode,
    isDarkMode: themeHook.isDarkMode,
    isLightMode: themeHook.isLightMode,
    toggleThemeMode: themeHook.toggleThemeMode,
    setThemeMode: themeHook.setThemeMode
  }), [
    themeHook.themeMode,
    themeHook.isDarkMode,
    themeHook.isLightMode,
    themeHook.toggleThemeMode,
    themeHook.setThemeMode
  ]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext; 