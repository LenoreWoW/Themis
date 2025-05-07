import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

// Create an extended options type that includes numberingSystem
interface ExtendedNumberFormatOptions extends Intl.NumberFormatOptions {
  numberingSystem?: string;
}

/**
 * Custom hook that wraps useTranslation with performance optimizations
 * and provides additional utility functions for working with localized text.
 * 
 * - Memoizes translation function to reduce re-renders
 * - Provides helper methods for working with RTL/LTR text
 */
const useLocalizedText = () => {
  const { t, i18n } = useTranslation();
  
  // Current language and direction
  const isRTL = i18n.language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';
  
  // Memoize expensive operations to prevent unnecessary re-renders
  const utils = useMemo(() => ({
    // Translate text with optional interpolation
    translate: (key: string, options?: Record<string, any>) => t(key, options),
    
    // Format numbers to always use Western digits
    formatNumber: (num: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(
        isRTL ? 'ar-QA' : 'en-US', 
        {
          useGrouping: true,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
          ...options,
          numberingSystem: 'latn', // Force Western digits
        } as ExtendedNumberFormatOptions
      ).format(num);
    },
    
    // Format dates according to the current locale
    formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(
        isRTL ? 'ar-QA' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          ...options
        }
      ).format(date);
    },
    
    // Get the appropriate CSS class for text direction
    getDirectionClass: () => isRTL ? 'rtl arabic-text' : 'ltr',
    
    // Get the appropriate CSS class for aligning text
    getAlignClass: () => isRTL ? 'text-right' : 'text-left',
    
    // Get the flex direction based on current language
    getFlexDirection: (defaultDirection = 'row') => {
      if (defaultDirection === 'row') return isRTL ? 'row-reverse' : 'row';
      if (defaultDirection === 'row-reverse') return isRTL ? 'row' : 'row-reverse';
      return defaultDirection; // Don't change column directions
    },
    
    // Conditionally append 'arabic-text' class for RTL mode
    getTextClass: (baseClass = '') => {
      return isRTL ? `${baseClass} arabic-text`.trim() : baseClass;
    },
    
    // Get current language code
    currentLang: i18n.language,
    
    // Direction string for use with dir attribute
    dir,
    
    // Boolean for RTL mode
    isRTL,
    
    // Used to conditionally swap margin/padding in RTL mode
    getStartValue: (start: any, end: any) => isRTL ? end : start,
    getEndValue: (start: any, end: any) => isRTL ? start : end,
  }), [t, i18n.language, isRTL, dir]);
  
  return { ...utils, t, i18n };
};

export default useLocalizedText; 