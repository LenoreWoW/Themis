import i18n from "i18next";
import { InitOptions } from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
// Import JSON translations directly
import enTranslation from "./locales/en/translation.json";
import arTranslation from "./locales/ar/translation.json";

// Get the saved language from local storage
const savedLanguage = localStorage.getItem('pmsLanguage') || 'en';

// Performance optimizations
const options: Partial<InitOptions> = {
  // Reduce re-renders by optimizing change detection
  react: {
    useSuspense: true,
    bindI18n: 'languageChanged loaded',
    bindI18nStore: 'added removed',
    nsMode: 'default' as const,
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'span'],
  },
  
  // Add support for Arabic pluralization rules
  pluralSeparator: '_',
  contextSeparator: '_',
  
  // Enable performance logging in development mode
  debug: process.env.NODE_ENV === 'development',
};

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      ar: {
        translation: arTranslation
      }
    },
    lng: savedLanguage, // Use the saved language or default to fallbackLng
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
      // Ensure numbers are always formatted with Western digits regardless of language
      format: (value, format, lng) => {
        if (format === 'number' && typeof value === 'number') {
          return value.toString().replace(/[٠-٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
        }
        return value;
      }
    },
    
    // Detect language from localStorage, URL, or browser settings
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: "pmsLanguage",
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      caches: ['localStorage']
    },
    
    // Important settings for correct localization
    keySeparator: ".",      // Enables the use of dots as separators in translation keys
    nsSeparator: ":",       // Enables the use of colons to separate namespaces
    returnNull: false,      // Return key instead of null when key is missing
    returnEmptyString: false,// Return key instead of empty string when value is empty
    returnObjects: true,    // Allows returning objects
    saveMissing: true,      // Save missing keys
    missingKeyHandler: (lng, ns, key) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
      // For missing keys, return the last part after the dot
      // This way "navigation.projects" will display as "projects" when missing
      return key.split('.').pop() || key;
    },
    
    // Apply performance optimizations
    react: options.react,
  });

// Apply the correct direction immediately
const currentLang = i18n.language || savedLanguage;
document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

// Add RTL support
i18n.on("languageChanged", (lng) => {
  const direction = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
  document.documentElement.dir = direction;
  
  // Update Material-UI direction
  const body = document.body;
  if (lng === "ar") {
    body.classList.add("rtl");
    body.classList.remove("ltr");
    
    // Load Arabic font - Cairo for best Arabic display
    if (!document.getElementById('arabic-font')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      link.id = 'arabic-font';
      document.head.appendChild(link);
    }
    
    // Apply RTL-specific CSS variables for better Arabic UI
    document.documentElement.style.setProperty('--text-align', 'right');
    document.documentElement.style.setProperty('--reverse-direction', 'row-reverse');
    document.documentElement.style.setProperty('--start-direction', 'right');
    document.documentElement.style.setProperty('--end-direction', 'left');
  } else {
    body.classList.add("ltr");
    body.classList.remove("rtl");
    
    // Apply LTR-specific CSS variables
    document.documentElement.style.setProperty('--text-align', 'left');
    document.documentElement.style.setProperty('--reverse-direction', 'row');
    document.documentElement.style.setProperty('--start-direction', 'left');
    document.documentElement.style.setProperty('--end-direction', 'right');
  }
  
  // Store the language preference
  localStorage.setItem('pmsLanguage', lng);
  
  // Force re-render of all translated components in a single batch
  // This improves performance by avoiding multiple re-renders
  document.dispatchEvent(new Event('i18n-updated'));
});

// Add utility functions for translated number handling
const formatNumber = (num: number): string => {
  // Always use Western digits regardless of language
  return num.toString();
};

// Augment i18n with our custom function
export { formatNumber };
export default i18n;
