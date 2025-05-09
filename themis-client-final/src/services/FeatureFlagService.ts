/**
 * Feature Flag Service
 * 
 * This service manages feature flags for the application, allowing features
 * to be enabled or disabled based on configuration.
 */

// Define available feature flags
export enum FeatureFlag {
  ENHANCED_NOTIFICATIONS = 'enhanced_notifications',
  // Add more feature flags here as needed
}

interface FeatureFlagConfig {
  [key: string]: {
    enabled: boolean;
    userPercentage?: number; // For gradual rollout (0-100)
    userIds?: string[]; // Specific users to enable feature for
  };
}

class FeatureFlagService {
  private static instance: FeatureFlagService;
  private featureFlags: FeatureFlagConfig;
  private analytics: Record<string, { views: number; dismisses: number }> = {};

  private constructor() {
    // Initialize with default configuration
    this.featureFlags = {
      [FeatureFlag.ENHANCED_NOTIFICATIONS]: {
        enabled: true, // Set to false to disable globally
        userPercentage: 100, // Gradually roll out to x% of users
        userIds: [] // Specific user IDs to enable for (regardless of percentage)
      }
    };

    // Initialize analytics
    Object.keys(this.featureFlags).forEach(flag => {
      this.analytics[flag] = { views: 0, dismisses: 0 };
    });

    // Try to load any stored config
    this.loadConfiguration();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if a feature flag is enabled
   * 
   * @param flag The feature flag to check
   * @param userId Optional user ID for user-specific checks
   * @returns true if the feature is enabled, false otherwise
   */
  public isEnabled(flag: FeatureFlag, userId?: string): boolean {
    const config = this.featureFlags[flag];
    
    // If flag doesn't exist or is globally disabled
    if (!config || !config.enabled) {
      return false;
    }
    
    // Check if user is in the specific user list
    if (userId && config.userIds && config.userIds.includes(userId)) {
      return true;
    }
    
    // Check percentage rollout
    if (config.userPercentage !== undefined && config.userPercentage < 100) {
      // Use userId or generate a random number for anonymous users
      const seed = userId || Math.random().toString();
      
      // Simple hash function to get a value between 0-100
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      const normalizedHash = Math.abs(hash % 100);
      
      return normalizedHash < config.userPercentage;
    }
    
    // Default to enabled if all checks pass
    return true;
  }

  /**
   * Track a view event for analytics
   */
  public trackView(flag: FeatureFlag): void {
    if (this.analytics[flag]) {
      this.analytics[flag].views++;
      this.saveAnalytics();
    }
  }

  /**
   * Track a dismiss event for analytics
   */
  public trackDismiss(flag: FeatureFlag): void {
    if (this.analytics[flag]) {
      this.analytics[flag].dismisses++;
      this.saveAnalytics();
    }
  }

  /**
   * Get analytics data for a feature flag
   */
  public getAnalytics(flag: FeatureFlag): { views: number; dismisses: number } {
    return this.analytics[flag] || { views: 0, dismisses: 0 };
  }

  /**
   * Update feature flag configuration
   * 
   * @param config New feature flag configuration
   */
  public updateConfiguration(config: FeatureFlagConfig): void {
    this.featureFlags = {
      ...this.featureFlags,
      ...config
    };
    this.saveConfiguration();
  }

  /**
   * Save configuration to localStorage
   */
  private saveConfiguration(): void {
    try {
      localStorage.setItem('feature_flags', JSON.stringify(this.featureFlags));
    } catch (error) {
      console.error('Failed to save feature flag configuration:', error);
    }
  }

  /**
   * Load configuration from localStorage
   */
  private loadConfiguration(): void {
    try {
      const storedConfig = localStorage.getItem('feature_flags');
      if (storedConfig) {
        this.featureFlags = {
          ...this.featureFlags,
          ...JSON.parse(storedConfig)
        };
      }
      
      const storedAnalytics = localStorage.getItem('feature_flag_analytics');
      if (storedAnalytics) {
        this.analytics = JSON.parse(storedAnalytics);
      }
    } catch (error) {
      console.error('Failed to load feature flag configuration:', error);
    }
  }

  /**
   * Save analytics to localStorage
   */
  private saveAnalytics(): void {
    try {
      localStorage.setItem('feature_flag_analytics', JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Failed to save feature flag analytics:', error);
    }
  }
}

export default FeatureFlagService; 