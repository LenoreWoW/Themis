import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  CheckCircleOutline as CheckIcon,
  Close as CloseIcon,
  Flag as FlagIcon,
  ArrowForward as NextIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { Quest, QuestStep, QuestStatus, UserQuest } from '../../types/Onboarding';

interface QuestModalProps {
  open: boolean;
  onClose: () => void;
  quest: Quest | null;
  userQuest?: UserQuest | null;
  onCompleteStep: (stepId: string) => void;
  onCompleteQuest: () => void;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  open,
  onClose,
  quest,
  userQuest,
  onCompleteStep,
  onCompleteQuest
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);
  
  // Reset active step when quest changes
  useEffect(() => {
    if (quest && userQuest) {
      // Find the first uncompleted step
      const firstIncompleteIndex = quest.steps.findIndex(
        step => !userQuest.completedSteps.includes(step.id)
      );
      setActiveStep(firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0);
    } else if (quest) {
      // If no user progress, start at first step
      setActiveStep(0);
    }
  }, [quest, userQuest]);
  
  if (!quest) return null;
  
  const handleNext = () => {
    if (activeStep < quest.steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleMarkComplete = (step: QuestStep) => {
    onCompleteStep(step.id);
    
    // Auto-advance to next step
    if (activeStep < quest.steps.length - 1) {
      handleNext();
    }
  };
  
  const activeStepData = quest.steps[activeStep];
  const isLastStep = activeStep === quest.steps.length - 1;
  
  // Check if a step is completed based on user progress
  const isStepCompleted = (stepId: string): boolean => {
    if (!userQuest) return false;
    return userQuest.completedSteps.includes(stepId);
  };
  
  // Check if all steps are completed
  const allStepsCompleted = userQuest ? 
    userQuest.completedSteps.length === quest.steps.length :
    quest.steps.every(step => step.completed);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="div">
            {quest.title}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            {quest.description}
          </Typography>
          
          <Box display="flex" alignItems="center" sx={{ mt: 1 }}>
            <FlagIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle2" color="primary">
              {quest.category} Quest
            </Typography>
          </Box>
        </Box>
        
        <Stepper activeStep={activeStep} orientation="vertical">
          {quest.steps.map((step, index) => {
            const stepCompleted = isStepCompleted(step.id);
            
            return (
              <Step key={step.id} completed={stepCompleted}>
                <StepLabel>
                  <Box display="flex" alignItems="center">
                    <Typography variant="subtitle1">{step.title}</Typography>
                    {stepCompleted && (
                      <CheckIcon color="success" sx={{ ml: 1 }} />
                    )}
                  </Box>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" paragraph>
                    {step.description}
                  </Typography>
                  
                  {step.targetComponent && (
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        Target: {step.targetComponent}
                      </Typography>
                      <Tooltip title="This step involves interacting with this component">
                        <HelpIcon fontSize="small" color="disabled" />
                      </Tooltip>
                    </Box>
                  )}
                  
                  <Box sx={{ mb: 2, mt: 1 }}>
                    <div>
                      <Button
                        variant="contained"
                        onClick={() => handleMarkComplete(step)}
                        disabled={stepCompleted}
                        startIcon={<CheckIcon />}
                        sx={{ mr: 1 }}
                      >
                        {stepCompleted ? 'Completed' : 'Mark Complete'}
                      </Button>
                      {index < quest.steps.length - 1 && (
                        <Button
                          endIcon={<NextIcon />}
                          onClick={handleNext}
                          sx={{ mr: 1 }}
                        >
                          Next Step
                        </Button>
                      )}
                      {index > 0 && (
                        <Button
                          onClick={handleBack}
                        >
                          Back
                        </Button>
                      )}
                    </div>
                  </Box>
                </StepContent>
              </Step>
            );
          })}
        </Stepper>
        
        {allStepsCompleted && (
          <Paper square elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              All steps completed!
            </Typography>
            <Typography paragraph>
              You have successfully completed all steps in this quest. Mark the entire quest as complete to continue.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={onCompleteQuest}
              disabled={userQuest?.status === QuestStatus.COMPLETED}
            >
              Complete Quest
            </Button>
          </Paper>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}; 