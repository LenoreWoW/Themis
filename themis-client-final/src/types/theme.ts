// Theme mode type definition
export type ThemeMode = 'light' | 'dark';

// Theme context type definition
export interface ThemeContextType {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  isLightMode: boolean;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
} 