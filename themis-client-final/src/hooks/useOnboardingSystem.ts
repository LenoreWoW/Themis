import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchQuests, 
  fetchUserQuests, 
  selectActiveQuests
} from '../store/slices/onboardingSlice';
import { useAuth } from '../context/AuthContext';
import { AppDispatch } from '../redux/store';

/**
 * Hook to initialize and use the onboarding system
 * This should be called once in App.tsx to set up the onboarding system
 */
export const useOnboardingSystem = () => {
  // Move all hooks to the top level, outside of any conditionals
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Always call useSelector unconditionally at the top level
  const activeQuestsData = useSelector(selectActiveQuests);
  
  // Then handle potential errors or transformations separately
  const activeQuests = Array.isArray(activeQuestsData) ? activeQuestsData : [];

  // Load quests when user logs in
  useEffect(() => {
    if (user) {
      try {
        dispatch(fetchQuests(user.role));
        dispatch(fetchUserQuests(user.id));
      } catch (error) {
        console.error('Error fetching quests:', error);
      }
    }
  }, [dispatch, user]);

  // Check if welcome tutorials should be shown for a new user
  const checkFirstTimeUser = () => {
    try {
      if (!user) return false;
      
      // Get the key for this user's first-time flag
      const firstTimeKey = `first_time_user_${user.id}`;
      const hasVisitedBefore = localStorage.getItem(firstTimeKey);
      
      // If the user hasn't visited before and there are welcome quests
      if (!hasVisitedBefore && activeQuests.some(q => q.category === 'WELCOME')) {
        // Only proceed if we're not already on the onboarding page
        if (!window.location.pathname.includes('/onboarding')) {
          navigate('/onboarding');
        }
        
        // Set the flag so this only happens once
        localStorage.setItem(firstTimeKey, 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in checkFirstTimeUser:', error);
      return false;
    }
  };

  return {
    checkFirstTimeUser,
    hasActiveQuests: activeQuests.length > 0
  };
};

export default useOnboardingSystem; 