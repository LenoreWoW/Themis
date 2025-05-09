import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchQuests, 
  fetchUserQuests, 
  completeQuestStep,
  completeQuest,
  resetQuest,
  setActiveQuest,
  archiveQuest,
  startQuest,
  completeQuestStepLocal
} from '../store/slices/onboardingSlice';
import { Quest, QuestStatus } from '../types/Onboarding';
import { UserRole } from '../types/index';

export const useOnboarding = (userId: string, userRole: UserRole) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    quests, 
    userQuests, 
    activeQuest,
    loading: isLoading,
    error 
  } = useSelector((state: RootState) => state.onboarding);

  // Initialize onboarding system with quests for user role
  useEffect(() => {
    // Load quests for this role
    dispatch(fetchQuests(userRole));
    
    // Fetch user progress
    if (userId) {
      dispatch(fetchUserQuests(userId));
    }
  }, [dispatch, userId, userRole]);

  // Set active quest
  const handleSetActiveQuest = useCallback((quest: Quest | null) => {
    dispatch(setActiveQuest(quest));
  }, [dispatch]);

  // Begin a quest
  const handleStartQuest = useCallback((questKey: string) => {
    dispatch(startQuest({ userId, questKey }));
  }, [dispatch, userId]);

  // Complete a step in a quest
  const handleCompleteQuestStep = useCallback((questKey: string, stepId: string) => {
    // Update locally first for immediate feedback
    dispatch(completeQuestStepLocal({ questKey, stepId }));
    
    // Sync with backend
    if (userId) {
      dispatch(completeQuestStep({ userId, questKey, stepId }));
    }
  }, [dispatch, userId]);

  // Complete an entire quest
  const handleCompleteQuest = useCallback((questKey: string) => {
    if (userId) {
      dispatch(completeQuest({ userId, questKey }));
    }
  }, [dispatch, userId]);

  // Reset a quest
  const handleResetQuest = useCallback((questKey: string) => {
    if (userId) {
      dispatch(resetQuest({ userId, questKey }));
    }
  }, [dispatch, userId]);

  // Archive a completed quest
  const handleArchiveQuest = useCallback((questKey: string) => {
    dispatch(archiveQuest({ userId, questKey }));
  }, [dispatch, userId]);

  // Convert quest arrays to objects for easier lookups
  const questsWithProgress: Quest[] = quests.map(quest => {
    const userQuest = userQuests.find(uq => uq.questKey === quest.key);
    
    if (userQuest) {
      return {
        ...quest,
        status: userQuest.status,
        completedAt: userQuest.completedAt,
        steps: quest.steps.map(step => ({
          ...step,
          completed: userQuest.completedSteps.includes(step.id)
        }))
      };
    }
    
    return quest;
  });

  // Filter quests by status
  const activeQuests = questsWithProgress.filter(
    quest => quest.status === QuestStatus.IN_PROGRESS || quest.status === QuestStatus.NOT_STARTED
  );
  
  const completedQuests = questsWithProgress.filter(
    quest => quest.status === QuestStatus.COMPLETED
  );
  
  const archivedQuests = questsWithProgress.filter(
    quest => quest.status === QuestStatus.ARCHIVED
  );

  return {
    isLoading,
    error,
    quests: questsWithProgress,
    activeQuests,
    completedQuests,
    archivedQuests,
    activeQuest,
    setActiveQuest: handleSetActiveQuest,
    startQuest: handleStartQuest,
    completeQuestStep: handleCompleteQuestStep,
    completeQuest: handleCompleteQuest,
    resetQuest: handleResetQuest,
    archiveQuest: handleArchiveQuest
  };
}; 