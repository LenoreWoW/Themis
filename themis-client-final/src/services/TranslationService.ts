/**
 * Service responsible for translating user-generated content
 * and caching translations for performance.
 */
class TranslationService {
  private static instance: TranslationService;
  private translationCache: Map<string, Record<string, string>> = new Map();
  private static readonly CACHE_KEY = 'themis_translations_cache';
  private static readonly MAX_CACHE_SIZE = 500; // Maximum entries before pruning
  
  private constructor() {
    // Load cached translations from localStorage
    this.loadCacheFromStorage();
    
    // Set up interval to save cache to storage periodically
    setInterval(() => {
      this.saveCacheToStorage();
    }, 5 * 60 * 1000); // Save every 5 minutes
  }
  
  /**
   * Get the singleton instance of the TranslationService
   */
  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }
  
  /**
   * Load the translation cache from localStorage
   */
  private loadCacheFromStorage(): void {
    try {
      const cachedData = localStorage.getItem(TranslationService.CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Convert the plain object back to a Map
        Object.entries(parsed).forEach(([key, translations]) => {
          this.translationCache.set(key, translations as Record<string, string>);
        });
        console.log(`Loaded ${this.translationCache.size} items from translation cache`);
      }
    } catch (error) {
      console.error('Error loading translation cache:', error);
      // If there's an error, create a fresh cache
      this.translationCache = new Map();
    }
  }
  
  /**
   * Save the translation cache to localStorage
   */
  private saveCacheToStorage(): void {
    try {
      // Prune cache if it's too large
      this.pruneCache();
      
      // Convert Map to plain object for storage
      const cacheObject: Record<string, Record<string, string>> = {};
      this.translationCache.forEach((translations, key) => {
        cacheObject[key] = translations;
      });
      
      localStorage.setItem(TranslationService.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      console.error('Error saving translation cache:', error);
    }
  }
  
  /**
   * Reduce cache size if it exceeds the maximum allowed entries
   */
  private pruneCache(): void {
    if (this.translationCache.size <= TranslationService.MAX_CACHE_SIZE) {
      return; // No pruning needed
    }
    
    // Convert to array for sorting
    const entries = Array.from(this.translationCache.entries());
    
    // Sort by access frequency or latest access (would need to add these metrics)
    // For now, we'll just remove the oldest entries
    const itemsToKeep = entries.slice(entries.length - TranslationService.MAX_CACHE_SIZE);
    
    // Rebuild cache with only the items we want to keep
    this.translationCache = new Map(itemsToKeep);
    
    console.log(`Pruned translation cache to ${this.translationCache.size} items`);
  }
  
  /**
   * Create a cache key from the given content and language pair
   */
  private getCacheKey(content: string, fromLang: string, toLang: string): string {
    return `${fromLang}_${toLang}_${content.substring(0, 50)}`;
  }
  
  /**
   * Translate text from one language to another
   * Uses cache if available, otherwise makes API call
   */
  public async translateText(
    content: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    // If languages are the same, no translation needed
    if (fromLang === toLang || !content.trim()) {
      return content;
    }
    
    // Generate cache key
    const cacheKey = this.getCacheKey(content, fromLang, toLang);
    
    // Check if we have a cached translation
    const languagePair = `${fromLang}_${toLang}`;
    const cachedTranslations = this.translationCache.get(languagePair);
    
    if (cachedTranslations && cachedTranslations[content]) {
      return cachedTranslations[content];
    }
    
    // For now, we'll implement a mock translation
    // In production, this would call a real translation API
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock translation (in production, call an actual translation API)
      let translatedText: string;
      
      if (toLang === 'ar') {
        // English to Arabic (mock)
        translatedText = `${content} [مترجم]`;
      } else {
        // Arabic to English (mock)
        translatedText = `[Translated] ${content}`;
      }
      
      // Cache the result
      if (!cachedTranslations) {
        this.translationCache.set(languagePair, { [content]: translatedText });
      } else {
        cachedTranslations[content] = translatedText;
      }
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return content; // Return original on error
    }
  }
  
  /**
   * Translate an object with translatable fields
   * Creates a new object with translations of specified fields
   */
  public async translateObject<T extends Record<string, any>>(
    obj: T,
    translatableFields: (keyof T)[],
    fromLang: string,
    toLang: string
  ): Promise<T> {
    // If languages are the same, return original object
    if (fromLang === toLang) {
      return { ...obj };
    }
    
    // Create a copy of the object
    const translated = { ...obj };
    
    // Translate each field
    await Promise.all(
      translatableFields.map(async (field) => {
        const content = obj[field];
        if (typeof content === 'string' && content.trim()) {
          // Use type assertion to fix the TypeScript error
          translated[field] = await this.translateText(content, fromLang, toLang) as any as T[typeof field];
        }
      })
    );
    
    return translated;
  }
  
  /**
   * Pre-translate an array of objects for batch processing
   * This is useful for translating a list of items at once
   */
  public async preTranslateCollection<T extends Record<string, any>>(
    items: T[],
    translatableFields: (keyof T)[],
    fromLang: string,
    toLang: string
  ): Promise<T[]> {
    // If languages are the same, return original array
    if (fromLang === toLang) {
      return [...items];
    }
    
    // Translate all items in parallel
    const translatedItems = await Promise.all(
      items.map(item => this.translateObject(item, translatableFields, fromLang, toLang))
    );
    
    return translatedItems;
  }
  
  /**
   * Clear the translation cache
   */
  public clearCache(): void {
    this.translationCache.clear();
    localStorage.removeItem(TranslationService.CACHE_KEY);
    console.log('Translation cache cleared');
  }
}

// Export singleton instance
const translationService = TranslationService.getInstance();
export default translationService; 