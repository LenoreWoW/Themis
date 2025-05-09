/**
 * Initialize services for the application
 * This file is imported in index.tsx to ensure services are initialized when the app loads
 */

import logger from '../utils/logger';

// Import services that need initialization
import SchedulerService from './SchedulerService';
import DailyBriefService from './DailyBriefService';

// Initialize services if authenticated
const initializeServices = () => {
  try {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (token) {
      logger.info('Initializing services...');
      
      // Initialize Daily Brief Service
      const dailyBriefService = DailyBriefService.getInstance();
      
      // Initialize Scheduler Service
      const schedulerService = SchedulerService.getInstance();
      schedulerService.initialize();
      
      logger.info('Services initialized successfully');
      return true;
    } else {
      logger.info('User not authenticated, services will be initialized after login');
      return false;
    }
  } catch (error) {
    logger.error('Error initializing services:', error);
    return false;
  }
};

// Run initialization when the module loads
initializeServices();

// Listen for login events
window.addEventListener('storage', (event) => {
  // When token changes in localStorage (login/logout)
  if (event.key === 'token' && event.newValue) {
    logger.info('Auth token changed, initializing services...');
    initializeServices();
  }
});

// Create a custom event that components can dispatch on login
window.addEventListener('themis:login', () => {
  logger.info('Login event detected, initializing services...');
  initializeServices();
});

// Check periodically for authentication to recover from page reloads
const checkInterval = setInterval(() => {
  const token = localStorage.getItem('token');
  if (token) {
    initializeServices();
    clearInterval(checkInterval);
  }
}, 5000); // Check every 5 seconds

export { initializeServices }; 