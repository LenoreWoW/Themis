import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { 
  fetchAvailableQuests, 
  fetchUserQuestProgress, 
  completeQuestStep,
  completeQuest,
  resetQuest,
  setActiveQuest,
  startQuest,
  completeQuestStepLocal,
  archiveQuest
} from '../store/slices/onboardingSlice';
import { Quest, QuestStatus } from '../types/Onboarding';
import { UserRole } from '../types/index';
import { getQuestsForRole } from '../data/quests';

export const useOnboarding = (userId: string, userRole: UserRole) => {
  const dispatch = useDispatch();
  const { 
    availableQuests, 
    userQuests, 
    activeQuestKey,
    isLoading,
    error 
  } = useSelector((state: RootState) => state.onboarding);

  // Initialize onboarding system with quests for user role
  useEffect(() => {
    // Load quests for this role
    const roleQuests = getQuestsForRole(userRole);
    
    // Fetch user progress
    if (userId) {
      dispatch(fetchUserQuestProgress(userId));
    }
  }, [dispatch, userId, userRole]);

  // Set active quest
  const handleSetActiveQuest = useCallback((questKey: string | null) => {
    dispatch(setActiveQuest(questKey));
  }, [dispatch]);

  // Begin a quest
  const handleStartQuest = useCallback((questKey: string) => {
    dispatch(startQuest(questKey));
  }, [dispatch]);

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
    dispatch(archiveQuest(questKey));
  }, [dispatch]);

  // Get active quest
  const activeQuest = activeQuestKey 
    ? availableQuests.find(q => q.key === activeQuestKey) 
    : null;

  // Get user progress for active quest
  const activeQuestProgress = activeQuestKey && userQuests[activeQuestKey] 
    ? userQuests[activeQuestKey] 
    : null;

  // Get all quests with user progress data merged in
  const questsWithProgress: Quest[] = availableQuests.map(quest => {
    const userProgress = userQuests[quest.key];
    
    if (userProgress) {
      return {
        ...quest,
        status: userProgress.status,
        completedAt: userProgress.completedAt,
        steps: quest.steps.map(step => ({
          ...step,
          completed: userProgress.completedSteps.includes(step.id)
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
    activeQuestProgress,
    setActiveQuest: handleSetActiveQuest,
    startQuest: handleStartQuest,
    completeQuestStep: handleCompleteQuestStep,
    completeQuest: handleCompleteQuest,
    resetQuest: handleResetQuest,
    archiveQuest: handleArchiveQuest
  };
}; 