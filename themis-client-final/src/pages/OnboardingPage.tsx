import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  useTheme,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  School as TutorialIcon,
  Flag as FlagIcon,
  Extension as QuestIcon,
  Settings as SettingsIcon,
  Launch as ExternalLinkIcon
} from '@mui/icons-material';
import { QuestsList } from '../components/Onboarding/QuestsList';
import { QuestModal } from '../components/Onboarding/QuestModal';
import { Quest, QuestCategory, QuestStatus } from '../types/Onboarding';
import { UserRole } from '../types/index';
import {
  fetchQuests,
  fetchUserQuests,
  completeQuestStep,
  completeQuest,
  setActiveQuest,
  selectOnboardingQuests,
  selectUserQuests,
  selectActiveQuest,
  selectActiveQuests,
  selectCompletedQuests,
  selectArchivedQuests,
  selectOnboardingLoading,
  selectOnboardingError
} from '../store/slices/onboardingSlice';
import { useAuth } from '../context/AuthContext';
import { AppDispatch } from '../redux/store';

// Helper to get color for category
const getCategoryColor = (category: QuestCategory) => {
  switch (category) {
    case QuestCategory.WELCOME:
      return 'success';
    case QuestCategory.PROJECT_MANAGER:
      return 'primary';
    case QuestCategory.SUB_PMO:
      return 'secondary';
    case QuestCategory.MAIN_PMO:
      return 'warning';
    case QuestCategory.DEPARTMENT_DIRECTOR:
      return 'info';
    case QuestCategory.EXECUTIVE:
      return 'error';
    case QuestCategory.COMMON:
      return 'default';
    default:
      return 'default';
  }
};

const OnboardingPage: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useAuth();
  const [questModalOpen, setQuestModalOpen] = useState(false);

  // Redux state
  const quests = useSelector(selectOnboardingQuests);
  const userQuests = useSelector(selectUserQuests);
  const activeQuest = useSelector(selectActiveQuest);
  const activeQuests = useSelector(selectActiveQuests);
  const completedQuests = useSelector(selectCompletedQuests);
  const archivedQuests = useSelector(selectArchivedQuests);
  const loading = useSelector(selectOnboardingLoading);
  const error = useSelector(selectOnboardingError);

  // Fetch quests when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchQuests(user.role));
      dispatch(fetchUserQuests(user.id));
    }
  }, [dispatch, user]);

  // Calculate stats
  const totalQuests = quests.length;
  const completedQuestsCount = completedQuests.length;
  const completionPercentage = totalQuests > 0 
    ? Math.floor((completedQuestsCount / totalQuests) * 100) 
    : 0;

  // Group quests by category
  const welcomeQuests = activeQuests.filter(q => q.category === QuestCategory.WELCOME);
  const roleSpecificQuests = activeQuests.filter(q => {
    if (user?.role === UserRole.PROJECT_MANAGER) {
      return q.category === QuestCategory.PROJECT_MANAGER;
    } else if (user?.role === UserRole.SUB_PMO) {
      return q.category === QuestCategory.SUB_PMO;
    } else if (user?.role === UserRole.MAIN_PMO) {
      return q.category === QuestCategory.MAIN_PMO;
    } else if (user?.role === UserRole.DEPARTMENT_DIRECTOR) {
      return q.category === QuestCategory.DEPARTMENT_DIRECTOR;
    } else if (user?.role === UserRole.EXECUTIVE) {
      return q.category === QuestCategory.EXECUTIVE;
    }
    return false;
  });
  const commonQuests = activeQuests.filter(q => q.category === QuestCategory.COMMON);

  // Handlers
  const handleViewQuest = (quest: Quest) => {
    dispatch(setActiveQuest(quest));
    setQuestModalOpen(true);
  };

  const handleStartQuest = (quest: Quest) => {
    dispatch(setActiveQuest(quest));
    setQuestModalOpen(true);
  };

  const handleCloseQuestModal = () => {
    setQuestModalOpen(false);
  };

  const handleCompleteStep = (questKey: string, stepId: string) => {
    if (user) {
      dispatch(completeQuestStep({ 
        userId: user.id,
        questKey, 
        stepId 
      }));
      
      // Refetch user quests to get updated state
      setTimeout(() => {
        dispatch(fetchUserQuests(user.id));
      }, 500);
    }
  };

  const handleCompleteQuest = (questKey: string) => {
    if (user) {
      dispatch(completeQuest({ 
        userId: user.id,
        questKey
      }));
      
      // Refetch user quests to get updated state
      setTimeout(() => {
        dispatch(fetchUserQuests(user.id));
        setQuestModalOpen(false);
      }, 500);
    }
  };

  // Render quest card
  const renderQuestCard = (quest: Quest & { progress?: number }) => {
    const progress = quest.progress || 0;
    const userQuest = userQuests.find(uq => uq.questKey === quest.key);
    const isCompleted = userQuest?.status === QuestStatus.COMPLETED;
    const isInProgress = userQuest?.status === QuestStatus.IN_PROGRESS;

    return (
      <Card 
        key={quest.key}
        variant="outlined"
        sx={{ 
          mb: 2,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="div">
              {quest.title}
            </Typography>
            <Chip 
              label={quest.category} 
              size="small"
              color={getCategoryColor(quest.category) as any}
            />
          </Box>
          
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            {quest.description}
          </Typography>
          
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              color={isCompleted ? "success" : "primary"}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          </Box>
          
          <Box display="flex" justifyContent="flex-end">
            {isCompleted ? (
              <Button 
                size="small" 
                variant="outlined" 
                color="primary"
                onClick={() => handleViewQuest(quest)}
              >
                View
              </Button>
            ) : isInProgress ? (
              <Button 
                size="small" 
                variant="contained" 
                color="primary"
                onClick={() => handleViewQuest(quest)}
              >
                Continue
              </Button>
            ) : (
              <Button 
                size="small" 
                variant="contained" 
                color="primary"
                onClick={() => handleStartQuest(quest)}
              >
                Start
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TutorialIcon sx={{ mr: 2 }} fontSize="large" />
          Tutorial System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Complete quests to learn how to use the Themis system efficiently.
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4, bgcolor: theme.palette.primary.main, color: 'white' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Your Onboarding Progress
            </Typography>
            <Typography variant="body1">
              You've completed {completedQuestsCount} of {totalQuests} quests ({completionPercentage}%)
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<SettingsIcon />}
              href="/settings/tutorials"
            >
              Manage Tutorial Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestIcon sx={{ mr: 1 }} color="primary" />
                Role-Specific Quests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These quests are specific to your role as a {user?.role?.replace('_', ' ')}.
              </Typography>
              <Box>
                <Typography variant="body2">
                  <FlagIcon fontSize="small" sx={{ mr: 1, color: theme.palette.secondary.main }} />
                  {user?.role === UserRole.PROJECT_MANAGER ? 'Project Manager' :
                   user?.role === UserRole.SUB_PMO ? 'Sub PMO' :
                   user?.role === UserRole.MAIN_PMO ? 'Main PMO' :
                   user?.role === UserRole.DEPARTMENT_DIRECTOR ? 'Department Director' :
                   user?.role === UserRole.EXECUTIVE ? 'Executive' : 'Role-Specific'} Quests: {roleSpecificQuests.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestIcon sx={{ mr: 1 }} color="primary" />
                Welcome Quests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Introduction quests to help you get familiar with the system.
              </Typography>
              <Box>
                <Typography variant="body2">
                  <FlagIcon fontSize="small" sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Welcome Quests: {welcomeQuests.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <QuestIcon sx={{ mr: 1 }} color="primary" />
                Common Quests
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                General quests that are useful for all roles.
              </Typography>
              <Box>
                <Typography variant="body2">
                  <FlagIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  Common Quests: {commonQuests.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={4}>
        {/* Welcome Quests */}
        {welcomeQuests.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Welcome
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {welcomeQuests.map(renderQuestCard)}
            </Paper>
          </Grid>
        )}

        {/* Role-specific Quests */}
        {roleSpecificQuests.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {user?.role === UserRole.PROJECT_MANAGER ? 'Project Manager' :
                 user?.role === UserRole.SUB_PMO ? 'Sub PMO' :
                 user?.role === UserRole.MAIN_PMO ? 'Main PMO' :
                 user?.role === UserRole.DEPARTMENT_DIRECTOR ? 'Department Director' :
                 user?.role === UserRole.EXECUTIVE ? 'Executive' : 'Role-Specific'} Quests
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {roleSpecificQuests.map(renderQuestCard)}
            </Paper>
          </Grid>
        )}

        {/* Common Quests */}
        {commonQuests.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Common Skills
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                {commonQuests.map((quest) => (
                  <Grid item xs={12} sm={6} md={4} key={quest.key}>
                    {renderQuestCard(quest)}
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      <Box sx={{ mt: 6 }}>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="text.secondary">
              The tutorial system in Themis allows you to learn at your own pace. All completed tutorials can be re-enabled in the Settings page.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Button 
              variant="outlined" 
              size="small"
              endIcon={<ExternalLinkIcon />}
              href="/help"
            >
              View Documentation
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Box mt={6}>
        <Typography variant="h5" gutterBottom>
          All Quests
        </Typography>
        <QuestsList 
          activeQuests={activeQuests}
          completedQuests={completedQuests}
          archivedQuests={archivedQuests}
          onViewQuest={handleViewQuest}
          onStartQuest={handleStartQuest}
          onArchiveQuest={(questKey) => {}}
          onResetQuest={(questKey) => {}}
        />
      </Box>

      {/* Quest Modal */}
      {activeQuest && (
        <QuestModal
          open={questModalOpen}
          quest={activeQuest}
          userQuest={userQuests.find(uq => uq.questKey === activeQuest.key)}
          onClose={handleCloseQuestModal}
          onCompleteStep={(stepId) => handleCompleteStep(activeQuest.key, stepId)}
          onCompleteQuest={() => handleCompleteQuest(activeQuest.key)}
        />
      )}
    </Container>
  );
};

export default OnboardingPage; 