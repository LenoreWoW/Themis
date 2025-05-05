import i18n from '../i18n';
import axios from 'axios';

/**
 * A utility for translating user input between languages
 * This helps maintain bilingual content across the application
 */

// In-memory cache for quick repeated translations
const translationCache = {
  en: {}, // English to other languages
  ar: {}  // Arabic to other languages
};

/**
 * Detects the language of a given text
 * @param {string} text - The text to detect language for
 * @returns {Promise<string>} - The detected language code (e.g., 'en', 'ar')
 */
export const detectLanguage = async (text) => {
  if (!text || text.trim() === '') return i18n.language;
  
  // Simple local detection for common cases
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) return 'ar';
  
  // Fallback to current UI language
  return i18n.language;
};

/**
 * Translates user input to the target language
 * @param {string} text - The text to translate
 * @param {string} targetLang - The target language code (e.g., 'en', 'ar')
 * @returns {Promise<string>} - The translated text
 */
export const translateUserInput = async (text, targetLang = null) => {
  if (!text || text.trim() === '') return text;
  
  // Default to the opposite of the current UI language if not specified
  const target = targetLang || (i18n.language === 'ar' ? 'en' : 'ar');
  
  // Detect the source language
  const sourceLang = await detectLanguage(text);
  
  // Don't translate if source and target are the same
  if (sourceLang === target) return text;
  
  // Check cache first
  if (translationCache[sourceLang]?.[text]?.[target]) {
    return translationCache[sourceLang][text][target];
  }
  
  try {
    // Here you would integrate with a translation API
    // This is a placeholder for demonstration purposes
    // In a real implementation, you would call a translation service API
    
    // Example with a hypothetical translation API:
    // const response = await axios.post('https://translation-api.example.com/translate', {
    //   text,
    //   sourceLang,
    //   targetLang: target
    // });
    // const translatedText = response.data.translatedText;
    
    // For now, we'll use a mock translation for demonstration
    const translatedText = mockTranslation(text, sourceLang, target);
    
    // Store in cache
    if (!translationCache[sourceLang]) translationCache[sourceLang] = {};
    if (!translationCache[sourceLang][text]) translationCache[sourceLang][text] = {};
    translationCache[sourceLang][text][target] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if translation fails
  }
};

/**
 * Mocks a translation service for demonstration purposes
 * In a production environment, replace this with an actual translation API call
 */
const mockTranslation = (text, sourceLang, targetLang) => {
  // This is just a placeholder that would be replaced with a real translation service
  // Options include:
  // 1. Google Cloud Translation API
  // 2. Microsoft Azure Translator
  // 3. DeepL API
  // 4. Amazon Translate
  
  return `[${targetLang.toUpperCase()}] ${text}`;
};

/**
 * Stores bilingual content for a specific content key
 * @param {string} contentKey - Unique identifier for this content
 * @param {string} text - The text entered by the user
 * @param {string} sourceLang - The language of the input text
 */
export const storeBilingualContent = async (contentKey, text, sourceLang = null) => {
  // Detect language if not provided
  const source = sourceLang || await detectLanguage(text);
  
  // Get the alternate language
  const targetLang = source === 'ar' ? 'en' : 'ar';
  
  // Translate to the other language
  const translatedText = await translateUserInput(text, targetLang);
  
  // Store both versions
  const bilingualData = {
    [source]: text,
    [targetLang]: translatedText,
    timestamp: new Date().toISOString()
  };
  
  // Save to local storage for persistence
  try {
    const existingData = JSON.parse(localStorage.getItem('themis_bilingual_content') || '{}');
    existingData[contentKey] = bilingualData;
    localStorage.setItem('themis_bilingual_content', JSON.stringify(existingData));
  } catch (error) {
    console.error('Error storing bilingual content:', error);
  }
  
  return bilingualData;
};

/**
 * Retrieves bilingual content for a specific key in the current language
 * @param {string} contentKey - The unique content identifier
 * @returns {string} - The content in the current UI language
 */
export const getBilingualContent = (contentKey) => {
  try {
    const existingData = JSON.parse(localStorage.getItem('themis_bilingual_content') || '{}');
    const content = existingData[contentKey];
    
    if (!content) return null;
    
    // Return the content in the current UI language
    return content[i18n.language] || content[Object.keys(content)[0]] || '';
  } catch (error) {
    console.error('Error retrieving bilingual content:', error);
    return null;
  }
};

export default {
  translateUserInput,
  detectLanguage,
  storeBilingualContent,
  getBilingualContent
}; 