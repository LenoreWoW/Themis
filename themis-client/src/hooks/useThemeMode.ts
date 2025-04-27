import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface UseThemeModeReturn {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (newMode: ThemeMode) => void;
}

const useThemeMode = (): UseThemeModeReturn => {
  // Get the initial theme mode from localStorage or use 'light' as default
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem('themisThemeMode');
    return (savedMode as ThemeMode) || 'light';
  });

  const isDarkMode = themeMode === 'dark';
  const isLightMode = themeMode === 'light';

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Save the theme mode to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('themisThemeMode', themeMode);
    
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