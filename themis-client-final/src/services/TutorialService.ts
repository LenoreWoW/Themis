import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Quest, QuestStatus, UserQuest } from '../types/Onboarding';
import { allQuests, getQuestsForRole } from '../data/quests';
import { UserRole } from '../types/index';
import { apiRequest } from './api';

// API helper for this service
const apiHelper = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
apiHelper.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Service to handle tutorial-related operations
 */
class TutorialService {
  private static instance: TutorialService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL || '';
  }

  public static getInstance(): TutorialService {
    if (!TutorialService.instance) {
      TutorialService.instance = new TutorialService();
    }
    return TutorialService.instance;
  }

  /**
   * Get all available quests
   * @param userRole The user's role
   * @returns Promise<Quest[]> Available quests for the user's role
   */
  public async getAvailableQuests(userRole: UserRole): Promise<Quest[]> {
    try {
      // In a real implementation, this would call the API
      // For now, use the static data based on user role
      const quests = getQuestsForRole(userRole);
      return quests;
    } catch (error) {
      console.error('Error fetching available quests:', error);
      throw error;
    }
  }

  /**
   * Get user's quest progress
   * @param userId The user's ID
   * @returns Promise<UserQuest[]> The user's quest progress
   */
  public async getUserQuestProgress(userId: string): Promise<UserQuest[]> {
    try {
      // In a real implementation, this would call the API
      // For now, return mocked data from localStorage
      const progressKey = `tutorial_progress_${userId}`;
      const storedProgress = localStorage.getItem(progressKey);
      
      if (storedProgress) {
        return JSON.parse(storedProgress);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching user quest progress:', error);
      throw error;
    }
  }

  /**
   * Get user's tutorial status
   * @param userId The user's ID
   * @returns Promise<boolean> True if the tutorial is complete, false otherwise
   */
  public async getUserTutorialStatus(userId: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/users/${userId}/tutorial-status`, 'GET');
      return response.data?.tutorial_complete || false;
    } catch (error) {
      console.error('Error fetching tutorial status:', error);
      return true; // Default to true if error
    }
  }

  /**
   * Set user's tutorial status
   * @param userId The user's ID
   * @param complete True if the tutorial is complete, false otherwise
   * @returns Promise<void>
   */
  public async setTutorialComplete(userId: string, complete: boolean): Promise<void> {
    try {
      await apiRequest(`/users/${userId}/tutorial-complete`, 'POST', {
        tutorial_complete: complete
      });
    } catch (error) {
      console.error('Error updating tutorial status:', error);
      throw error;
    }
  }

  /**
   * Start a quest
   * @param userId The user's ID
   * @param questKey The quest key
   * @returns Promise<void> Success status
   */
  public async startQuest(userId: string, questKey: string): Promise<void> {
    try {
      await apiRequest(`/users/${userId}/quests/${questKey}/start`, 'POST');
    } catch (error) {
      console.error('Error starting quest:', error);
      throw error;
    }
  }

  /**
   * Complete a quest step
   * @param userId The user's ID
   * @param questKey The quest key
   * @param stepId The step ID
   * @returns Promise<void> Success status
   */
  public async completeQuestStep(userId: string, questKey: string, stepId: string): Promise<void> {
    try {
      await apiRequest(`/users/${userId}/quests/${questKey}/steps/${stepId}/complete`, 'POST');
    } catch (error) {
      console.error('Error completing quest step:', error);
      throw error;
    }
  }

  /**
   * Complete a quest
   * @param userId The user's ID
   * @param questKey The quest key
   * @returns Promise<void> Success status
   */
  public async completeQuest(userId: string, questKey: string): Promise<void> {
    try {
      await apiRequest(`/users/${userId}/quests/${questKey}/complete`, 'POST');
    } catch (error) {
      console.error('Error completing quest:', error);
      throw error;
    }
  }

  /**
   * Reset a quest
   * @param userId The user's ID
   * @param questKey The quest key
   * @returns Promise<any> Success status
   */
  public async resetQuest(userId: string, questKey: string): Promise<any> {
    try {
      // In a real implementation, this would call the API
      // For now, update localStorage
      const progressKey = `tutorial_progress_${userId}`;
      let progress: UserQuest[] = [];
      const storedProgress = localStorage.getItem(progressKey);
      
      if (storedProgress) {
        progress = JSON.parse(storedProgress);
      }
      
      // Find the user quest
      const userQuestIndex = progress.findIndex(q => q.questKey === questKey);
      
      if (userQuestIndex >= 0) {
        // Remove the quest from progress
        progress.splice(userQuestIndex, 1);
        
        // Save the updated progress
        localStorage.setItem(progressKey, JSON.stringify(progress));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting quest:', error);
      throw error;
    }
  }

  /**
   * Archive a quest
   * @param userId The user's ID
   * @param questKey The quest key
   * @returns Promise<any> Success status
   */
  public async archiveQuest(userId: string, questKey: string): Promise<any> {
    try {
      // In a real implementation, this would call the API
      // For now, update localStorage
      const progressKey = `tutorial_progress_${userId}`;
      let progress: UserQuest[] = [];
      const storedProgress = localStorage.getItem(progressKey);
      
      if (storedProgress) {
        progress = JSON.parse(storedProgress);
      }
      
      // Find the user quest
      const userQuestIndex = progress.findIndex(q => q.questKey === questKey);
      
      if (userQuestIndex >= 0) {
        const userQuest = progress[userQuestIndex];
        userQuest.status = QuestStatus.ARCHIVED;
        userQuest.lastUpdatedAt = new Date().toISOString();
        
        // Save the updated progress
        localStorage.setItem(progressKey, JSON.stringify(progress));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error archiving quest:', error);
      throw error;
    }
  }

  /**
   * Reset user's tutorial
   * @param userId The user's ID
   * @returns Promise<void> Success status
   */
  public async resetTutorial(userId: string): Promise<void> {
    try {
      await apiRequest(`/users/${userId}/tutorial-reset`, 'POST');
    } catch (error) {
      console.error('Error resetting tutorial:', error);
      throw error;
    }
  }
}

export default TutorialService; 