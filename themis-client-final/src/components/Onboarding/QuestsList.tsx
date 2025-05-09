import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Grid,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  Badge,
  Button,
  Divider
} from '@mui/material';
import {
  PlayArrow as StartIcon,
  MoreVert as MoreIcon,
  CheckCircle as CompletedIcon,
  Archive as ArchiveIcon,
  Flag as FlagIcon,
  Extension as QuestIcon,
  TrackChanges as ActiveIcon
} from '@mui/icons-material';
import { Quest, QuestCategory, QuestStatus } from '../../types/Onboarding';

interface QuestsListProps {
  activeQuests: Quest[];
  completedQuests: Quest[];
  archivedQuests: Quest[];
  onStartQuest: (quest: Quest) => void;
  onViewQuest: (quest: Quest) => void;
  onArchiveQuest: (questKey: string) => void;
  onResetQuest: (questKey: string) => void;
}

export const QuestsList: React.FC<QuestsListProps> = ({
  activeQuests,
  completedQuests,
  archivedQuests,
  onStartQuest,
  onViewQuest,
  onArchiveQuest,
  onResetQuest
}) => {
  const [tabValue, setTabValue] = useState(0);
  
  const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Get progress percentage for a quest
  const getQuestProgress = (quest: Quest & { progress?: number }): number => {
    if (quest.status === QuestStatus.NOT_STARTED) return 0;
    if (quest.status === QuestStatus.COMPLETED) return 100;
    
    if (quest.progress !== undefined) {
      return quest.progress;
    }

    const completedSteps = quest.steps.filter(step => step.completed).length;
    return Math.floor((completedSteps / quest.steps.length) * 100);
  };
  
  // Get color for category
  const getCategoryColor = (category: QuestCategory): string => {
    switch (category) {
      case QuestCategory.WELCOME:
        return 'primary';
      case QuestCategory.PROJECT_MANAGER:
        return 'secondary';
      case QuestCategory.SUB_PMO:
        return 'info';
      case QuestCategory.MAIN_PMO:
        return 'warning';
      case QuestCategory.DEPARTMENT_DIRECTOR:
        return 'success';
      case QuestCategory.EXECUTIVE:
        return 'error';
      case QuestCategory.COMMON:
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Render a single quest card
  const renderQuestCard = (quest: Quest) => {
    const progress = getQuestProgress(quest);
    const isActive = quest.status === QuestStatus.IN_PROGRESS;
    const isCompleted = quest.status === QuestStatus.COMPLETED;
    const isArchived = quest.status === QuestStatus.ARCHIVED;
    
    return (
      <Card 
        key={quest.key} 
        sx={{ 
          mb: 2,
          border: isActive ? '1px solid' : 'none',
          borderColor: 'primary.main',
          position: 'relative'
        }}
      >
        {isActive && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              px: 1,
              py: 0.5,
              borderBottomLeftRadius: 8
            }}
          >
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <ActiveIcon fontSize="small" sx={{ mr: 0.5 }} />
              Active
            </Typography>
          </Box>
        )}
        
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              <QuestIcon sx={{ mr: 1 }} />
              {quest.title}
              {isCompleted && <CompletedIcon color="success" sx={{ ml: 1 }} />}
            </Typography>
            
            <Chip 
              size="small" 
              icon={<FlagIcon />}
              label={quest.category} 
              color={getCategoryColor(quest.category) as any}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {quest.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Progress: {progress}%
              </Typography>
              <Box sx={{ width: '100px' }}>
                <LinearProgress variant="determinate" value={progress} />
              </Box>
            </Box>
            
            <Box>
              {isCompleted && !isArchived && (
                <Tooltip title="Archive Quest">
                  <IconButton size="small" onClick={() => onArchiveQuest(quest.key)}>
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              {(isCompleted || isActive) && (
                <Tooltip title="View Quest">
                  <IconButton size="small" color="primary" onClick={() => onViewQuest(quest)}>
                    <MoreIcon />
                  </IconButton>
                </Tooltip>
              )}
              
              {!isActive && !isCompleted && !isArchived && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<StartIcon />}
                  onClick={() => onStartQuest(quest)}
                >
                  Start
                </Button>
              )}
              
              {isActive && (
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onViewQuest(quest)}
                >
                  Continue
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
        
        {progress > 0 && progress < 100 && (
          <LinearProgress variant="determinate" value={progress} sx={{ height: 5 }} />
        )}
      </Card>
    );
  };
  
  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab 
            label={
              <Badge badgeContent={activeQuests.length} color="primary">
                <Box sx={{ pr: activeQuests.length > 0 ? 2 : 0 }}>Active Quests</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={completedQuests.length} color="success">
                <Box sx={{ pr: completedQuests.length > 0 ? 2 : 0 }}>Completed</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={archivedQuests.length} color="default">
                <Box sx={{ pr: archivedQuests.length > 0 ? 2 : 0 }}>Archived</Box>
              </Badge>
            } 
          />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 2 }}>
        {tabValue === 0 && (
          <>
            {activeQuests.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No active quests. Check the completed or archived tabs.
              </Typography>
            ) : (
              activeQuests.map(quest => renderQuestCard(quest))
            )}
          </>
        )}
        
        {tabValue === 1 && (
          <>
            {completedQuests.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No completed quests yet. Complete quests from the active tab.
              </Typography>
            ) : (
              completedQuests.map(quest => renderQuestCard(quest))
            )}
          </>
        )}
        
        {tabValue === 2 && (
          <>
            {archivedQuests.length === 0 ? (
              <Typography variant="body1" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No archived quests. Archive completed quests to move them here.
              </Typography>
            ) : (
              archivedQuests.map(quest => renderQuestCard(quest))
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}; 