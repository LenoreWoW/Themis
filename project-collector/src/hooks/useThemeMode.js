import { useState, useEffect } from 'react';

/**
 * Custom hook to manage theme mode (light/dark)
 * @returns {Object} Theme mode state and functions
 */
const useThemeMode = () => {
  // Get the initial theme mode from localStorage or use 'light' as default
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('projectCollector_themeMode');
    return savedMode || 'light';
  });

  const isDarkMode = themeMode === 'dark';
  const isLightMode = themeMode === 'light';

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Save the theme mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('projectCollector_themeMode', themeMode);
    
    // Update the document's class for potential global styling
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [themeMode]);

  return {
    themeMode,
    isDarkMode,
    isLightMode,
    toggleThemeMode,
    setThemeMode,
  };
};

export default useThemeMode; 