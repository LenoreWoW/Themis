import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Quest, QuestStatus, UserQuest } from '../../types/Onboarding';
import TutorialService from '../../services/TutorialService';
import { RootState } from '../../redux/store';

// Tutorial service instance
const tutorialService = TutorialService.getInstance();

interface OnboardingState {
  quests: Quest[];
  userQuests: UserQuest[];
  activeQuest: Quest | null;
  loading: boolean;
  error: string | null;
}

const initialState: OnboardingState = {
  quests: [],
  userQuests: [],
  activeQuest: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchQuests = createAsyncThunk(
  'onboarding/fetchQuests',
  async (userRole: string, { rejectWithValue }) => {
    try {
      const quests = await tutorialService.getAvailableQuests(userRole as any);
      return quests;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch quests');
    }
  }
);

export const fetchUserQuests = createAsyncThunk(
  'onboarding/fetchUserQuests',
  async (userId: string, { rejectWithValue }) => {
    try {
      const userQuests = await tutorialService.getUserQuestProgress(userId);
      return userQuests;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user quests');
    }
  }
);

export const completeQuestStep = createAsyncThunk(
  'onboarding/completeQuestStep',
  async ({ userId, questKey, stepId }: { userId: string; questKey: string; stepId: string }, { rejectWithValue }) => {
    try {
      await tutorialService.completeQuestStep(userId, questKey, stepId);
      return { userId, questKey, stepId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete quest step');
    }
  }
);

export const completeQuest = createAsyncThunk(
  'onboarding/completeQuest',
  async ({ userId, questKey }: { userId: string; questKey: string }, { rejectWithValue }) => {
    try {
      await tutorialService.completeQuest(userId, questKey);
      return { userId, questKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete quest');
    }
  }
);

export const resetQuest = createAsyncThunk(
  'onboarding/resetQuest',
  async ({ userId, questKey }: { userId: string; questKey: string }, { rejectWithValue }) => {
    try {
      await tutorialService.resetQuest(userId, questKey);
      return { userId, questKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reset quest');
    }
  }
);

export const archiveQuest = createAsyncThunk(
  'onboarding/archiveQuest',
  async ({ userId, questKey }: { userId: string; questKey: string }, { rejectWithValue }) => {
    try {
      await tutorialService.archiveQuest(userId, questKey);
      return { userId, questKey };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to archive quest');
    }
  }
);

// Slice definition
const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setActiveQuest: (state, action: PayloadAction<Quest | null>) => {
      state.activeQuest = action.payload;
    },
    clearOnboardingErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quests
      .addCase(fetchQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.quests = action.payload;
      })
      .addCase(fetchQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user quests
      .addCase(fetchUserQuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserQuests.fulfilled, (state, action) => {
        state.loading = false;
        state.userQuests = action.payload;
      })
      .addCase(fetchUserQuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Complete quest step
      .addCase(completeQuestStep.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeQuestStep.fulfilled, (state, action) => {
        state.loading = false;
        // This will trigger a re-fetch of user quests in the component
      })
      .addCase(completeQuestStep.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Complete quest
      .addCase(completeQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeQuest.fulfilled, (state, action) => {
        state.loading = false;
        // This will trigger a re-fetch of user quests in the component
      })
      .addCase(completeQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Reset quest
      .addCase(resetQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetQuest.fulfilled, (state, action) => {
        state.loading = false;
        const { questKey } = action.payload;
        state.userQuests = state.userQuests.filter(q => q.questKey !== questKey);
      })
      .addCase(resetQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Archive quest
      .addCase(archiveQuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveQuest.fulfilled, (state, action) => {
        state.loading = false;
        const { questKey } = action.payload;
        const questIndex = state.userQuests.findIndex(q => q.questKey === questKey);
        if (questIndex >= 0) {
          state.userQuests[questIndex].status = QuestStatus.ARCHIVED;
        }
      })
      .addCase(archiveQuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectOnboardingQuests = (state: RootState) => state.onboarding.quests;
export const selectUserQuests = (state: RootState) => state.onboarding.userQuests;
export const selectActiveQuest = (state: RootState) => state.onboarding.activeQuest;
export const selectOnboardingLoading = (state: RootState) => state.onboarding.loading;
export const selectOnboardingError = (state: RootState) => state.onboarding.error;

// Get quests by status
export const selectActiveQuests = (state: RootState) => {
  const { quests, userQuests } = state.onboarding;
  
  // Get quests that are in progress
  const inProgressQuests = userQuests
    .filter(uq => uq.status === QuestStatus.IN_PROGRESS)
    .map(uq => {
      const quest = quests.find(q => q.key === uq.questKey);
      return quest ? { ...quest, progress: uq.progress, completedSteps: uq.completedSteps } : null;
    })
    .filter(Boolean) as (Quest & { progress: number, completedSteps: string[] })[];
  
  // Get quests that haven't been started
  const notStartedQuests = quests
    .filter(q => !userQuests.some(uq => uq.questKey === q.key))
    .map(q => ({ ...q, progress: 0, completedSteps: [] }));
  
  return [...inProgressQuests, ...notStartedQuests];
};

export const selectCompletedQuests = (state: RootState) => {
  const { quests, userQuests } = state.onboarding;
  
  return userQuests
    .filter(uq => uq.status === QuestStatus.COMPLETED)
    .map(uq => {
      const quest = quests.find(q => q.key === uq.questKey);
      return quest ? { ...quest, progress: 100, completedSteps: uq.completedSteps } : null;
    })
    .filter(Boolean) as (Quest & { progress: number, completedSteps: string[] })[];
};

export const selectArchivedQuests = (state: RootState) => {
  const { quests, userQuests } = state.onboarding;
  
  return userQuests
    .filter(uq => uq.status === QuestStatus.ARCHIVED)
    .map(uq => {
      const quest = quests.find(q => q.key === uq.questKey);
      return quest ? { ...quest, progress: uq.progress, completedSteps: uq.completedSteps } : null;
    })
    .filter(Boolean) as (Quest & { progress: number, completedSteps: string[] })[];
};

// Actions
export const { setActiveQuest, clearOnboardingErrors } = onboardingSlice.actions;

export default onboardingSlice.reducer; 