import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { arTranslations } from "./ar";
import { enTranslations } from "./en";

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

// Add RTL support
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
  
  // Update Material-UI direction
  const body = document.body;
  if (lng === "ar") {
    body.classList.add("rtl");
    body.classList.remove("ltr");
  } else {
    body.classList.add("ltr");
    body.classList.remove("rtl");
  }
});

export default i18n;
