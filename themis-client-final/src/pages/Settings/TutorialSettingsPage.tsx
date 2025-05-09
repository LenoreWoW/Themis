import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Alert,
  useTheme
} from '@mui/material';
import {
  Refresh as ResetIcon,
  School as TutorialIcon,
  CheckCircle as CompletedIcon,
  Archive as ArchiveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { UserRole } from '../../types/index';
import { QuestCategory, QuestStatus } from '../../types/Onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';

const TutorialSettingsPage: React.FC = () => {
  const theme = useTheme();
  // Normally this would come from auth context
  const currentUser = {
    id: '1',
    role: UserRole.PROJECT_MANAGER
  };
  
  const {
    quests,
    completedQuests,
    archivedQuests,
    resetQuest
  } = useOnboarding(currentUser.id, currentUser.role);
  
  const [globalTutorialsEnabled, setGlobalTutorialsEnabled] = useState(true);
  const [welcomeTutorialsEnabled, setWelcomeTutorialsEnabled] = useState(true);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [questToReset, setQuestToReset] = useState<string | null>(null);
  
  // Handle resetting a quest
  const handleResetQuest = (questKey: string) => {
    setQuestToReset(questKey);
    setResetConfirmOpen(true);
  };
  
  // Confirm resetting a quest
  const confirmResetQuest = () => {
    if (questToReset) {
      resetQuest(questToReset);
      setResetConfirmOpen(false);
      setQuestToReset(null);
    }
  };
  
  // Get status chip color
  const getStatusColor = (status: QuestStatus) => {
    switch (status) {
      case QuestStatus.COMPLETED:
        return 'success';
      case QuestStatus.IN_PROGRESS:
        return 'primary';
      case QuestStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };
  
  // Get category label
  const getCategoryLabel = (category: QuestCategory) => {
    switch (category) {
      case QuestCategory.WELCOME:
        return 'Welcome';
      case QuestCategory.PROJECT_MANAGER:
        return 'Project Manager';
      case QuestCategory.SUB_PMO:
        return 'Sub PMO';
      case QuestCategory.MAIN_PMO:
        return 'Main PMO';
      case QuestCategory.DEPARTMENT_DIRECTOR:
        return 'Department Director';
      case QuestCategory.EXECUTIVE:
        return 'Executive';
      case QuestCategory.COMMON:
        return 'Common';
      default:
        return 'Unknown';
    }
  };
  
  // Filter out only completed or archived quests
  const resetableQuests = quests.filter(quest => 
    quest.status === QuestStatus.COMPLETED || quest.status === QuestStatus.ARCHIVED
  );
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Button 
          component={RouterLink} 
          to="/settings"
          startIcon={<BackIcon />}
          sx={{ mr: 2 }}
        >
          Back to Settings
        </Button>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center' }}>
          <TutorialIcon sx={{ mr: 2 }} fontSize="large" />
          Tutorial Settings
        </Typography>
      </Box>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Tutorial System Configuration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Configure how the tutorial and onboarding system behaves in the Themis platform.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={globalTutorialsEnabled}
                  onChange={(e) => setGlobalTutorialsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable tutorial system"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              When disabled, no tutorials or quests will be shown to users.
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={welcomeTutorialsEnabled}
                  onChange={(e) => setWelcomeTutorialsEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Show welcome tutorial for new users"
            />
            <Typography variant="caption" color="text.secondary" display="block">
              When enabled, first-time users will be shown the welcome tutorial.
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Manage Completed Tutorials
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon fontSize="small" color="disabled" sx={{ mr: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Reset tutorials to make them available again
            </Typography>
          </Box>
        </Box>
        
        {resetableQuests.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            You don't have any completed tutorials that can be reset.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tutorial Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Completed On</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resetableQuests.map((quest) => (
                  <TableRow key={quest.key}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {quest.status === QuestStatus.COMPLETED && (
                          <CompletedIcon color="success" sx={{ mr: 1 }} />
                        )}
                        {quest.status === QuestStatus.ARCHIVED && (
                          <ArchiveIcon color="disabled" sx={{ mr: 1 }} />
                        )}
                        {quest.title}
                      </Box>
                    </TableCell>
                    <TableCell>{getCategoryLabel(quest.category)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={quest.status} 
                        size="small" 
                        color={getStatusColor(quest.status) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {quest.completedAt ? new Date(quest.completedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ResetIcon />}
                        onClick={() => handleResetQuest(quest.key)}
                      >
                        Reset
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4, bgcolor: theme.palette.warning.light }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon sx={{ mr: 1, color: theme.palette.warning.dark }} />
          <Typography variant="h6" color={theme.palette.warning.dark}>
            Reset All Tutorials
          </Typography>
        </Box>
        <Typography variant="body2" paragraph sx={{ color: theme.palette.warning.dark }}>
          This will reset all tutorial progress for your account. You will need to restart all tutorials from the beginning.
        </Typography>
        <Button
          variant="contained"
          color="warning"
          startIcon={<ResetIcon />}
          disabled={resetableQuests.length === 0}
        >
          Reset All Completed Tutorials
        </Button>
      </Paper>
      
      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
      >
        <DialogTitle>Reset Tutorial?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reset this tutorial? It will be marked as not started, and you'll be able to complete it again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmResetQuest} color="primary" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TutorialSettingsPage; 