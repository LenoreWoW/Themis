import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { arTranslations } from "./ar";
import { enTranslations } from "./en";

// Get saved language preference from localStorage
const savedLanguage = localStorage.getItem('themisLanguage') || 'en';

// Initialize i18next
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    lng: savedLanguage, // Use the saved language or default to fallbackLng
    fallbackLng: "en",
    debug: process.env.NODE_ENV === "development",
    
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    
    // Detect language from localStorage, URL, or browser settings
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "themisLanguage",
      caches: ["localStorage"],
    },
    
    // Important: these settings will fix the x.x display issue
    keySeparator: ".",       // Enables the use of dots as separators in translation keys
    nsSeparator: ":",        // Enables the use of colons to separate namespaces
    returnNull: false,       // Return key instead of null when key is missing
    returnEmptyString: false,// Return key instead of empty string when value is empty
    returnObjects: true,     // Allows returning objects
    saveMissing: false,      // Don't save missing keys
    missingKeyHandler: (lng, ns, key) => {
      // For missing keys, return the last part after the dot
      // This way "navigation.projects" will display as "projects" when missing
      return key.split('.').pop() || key;
    }
  });

// Apply the correct direction immediately
const currentLang = i18n.language || savedLanguage;
document.documentElement.lang = currentLang;
document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

// Add RTL support
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  
  // Update Material-UI direction
  const body = document.body;
  if (lng === "ar") {
    body.classList.add("rtl");
    body.classList.remove("ltr");
    
    // Load Arabic font
    if (!document.getElementById('arabic-font')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap';
      link.id = 'arabic-font';
      document.head.appendChild(link);
    }
  } else {
    body.classList.add("ltr");
    body.classList.remove("rtl");
  }
  
  // Store the language preference
  localStorage.setItem('themisLanguage', lng);
});

export default i18n;
