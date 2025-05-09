/**
 * Simple logger utility for the application
 * Wraps console methods with extra features
 */
const logger = {
  /**
   * Log info message
   */
  info: (message: string, ...args: any[]): void => {
    console.info(`[INFO] ${message}`, ...args);
  },
  
  /**
   * Log warning message
   */
  warn: (message: string, ...args: any[]): void => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  
  /**
   * Log error message
   */
  error: (message: string, ...args: any[]): void => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  /**
   * Log debug message (only in dev mode)
   */
  debug: (message: string, ...args: any[]): void => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  /**
   * Log performance timing
   */
  time: (label: string): void => {
    console.time(`[PERFORMANCE] ${label}`);
  },
  
  /**
   * End performance timing
   */
  timeEnd: (label: string): void => {
    console.timeEnd(`[PERFORMANCE] ${label}`);
  }
};

export default logger; 