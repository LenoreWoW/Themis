import DailyBriefService from '../services/DailyBriefService';
import SchedulerService from '../services/SchedulerService';
import logger from '../utils/logger';

const login = async (username: string, password: string) => {
  setIsLoading(true);
  try {
    const response = await api.auth.login(username, password);
    if (response.success && response.data) {
      const { token, user } = response.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('userId', user.id);
      
      // Initialize services after login
      try {
        logger.info('Initializing services after login...');
        
        // Initialize Daily Brief Service
        const dailyBriefService = DailyBriefService.getInstance();
        
        // Initialize Scheduler Service
        const schedulerService = SchedulerService.getInstance();
        schedulerService.initialize();
        
        logger.info('Services initialized successfully after login');
      } catch (error) {
        logger.error('Error initializing services after login:', error);
      }
      
      return { success: true };
    } else {
      return { success: false, error: response.error || 'Authentication failed' };
    }
  } catch (error) {
    return { success: false, error: 'Network error. Please try again.' };
  } finally {
    setIsLoading(false);
  }
}; 