import React, { useCallback, useEffect, useState } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS, Step } from 'react-joyride';
import { useTour, TourStep } from '../../context/TourContext';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, Typography, createTheme, ThemeProvider } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Create a theme for the tour with formal styling
const createTourTheme = (baseTheme: any) => createTheme({
  ...baseTheme,
  components: {
    ...baseTheme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// Convert our TourStep to Joyride Step
const convertSteps = (tourSteps: TourStep[]): Step[] => {
  return tourSteps.map(step => ({
    target: step.target,
    content: (
      <div>
        {step.title && <Typography variant="h6" gutterBottom>{step.title}</Typography>}
        <Typography variant="body1">{step.content}</Typography>
      </div>
    ),
    disableBeacon: step.disableBeacon,
    placement: step.placement,
    styles: {
      options: {
        zIndex: 10000,
      },
    },
  }));
};

const TourManager: React.FC = () => {
  const {
    steps: tourSteps,
    isWelcomeOpen,
    isTourRunning,
    isTourComplete,
    startTour,
    closeTour,
    closeWelcome,
    markTourComplete,
  } = useTour();
  
  const [joyrideSteps, setJoyrideSteps] = useState<Step[]>([]);
  const [runTour, setRunTour] = useState(false);
  const baseTheme = useTheme();
  const tourTheme = createTourTheme(baseTheme);

  useEffect(() => {
    if (tourSteps.length > 0) {
      setJoyrideSteps(convertSteps(tourSteps));
    }
  }, [tourSteps]);
  
  useEffect(() => {
    setRunTour(isTourRunning);
  }, [isTourRunning]);
  
  const handleJoyrideCallback = useCallback((data: any) => {
    const { action, index, status, type } = data;
    
    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      // Update progress when moving between steps
      console.log(`Current step: ${index + 1} / ${joyrideSteps.length}`);
    }
    
    // Tour has ended
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      closeTour();
      markTourComplete();
    }
    
    // User has closed tour prematurely
    if (action === ACTIONS.CLOSE) {
      setRunTour(false);
      closeTour();
    }
  }, [joyrideSteps.length, closeTour, markTourComplete]);
  
  const handleStartTour = () => {
    startTour();
    closeWelcome();
  };
  
  // Welcome dialog shown to first-time users
  const WelcomeDialog = () => (
    <Dialog
      open={isWelcomeOpen}
      onClose={closeWelcome}
      aria-labelledby="welcome-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="welcome-dialog-title">
        Welcome to Themis
      </DialogTitle>
      <DialogContent>
        <Typography paragraph>
          Welcome to the Themis Project Management System. This guided tour will walk you through the key features and functionalities available to you based on your role.
        </Typography>
        <Typography paragraph>
          The tour will highlight important navigation elements and provide information about what each component does, helping you quickly become familiar with the system.
        </Typography>
        <Typography>
          You can stop the tour at any time. If you need to revisit it later, you can restart it from the Settings page.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeWelcome} color="primary">
          Skip Tour
        </Button>
        <Button 
          onClick={handleStartTour} 
          variant="contained" 
          color="primary"
          autoFocus
        >
          Begin Guided Tour
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <ThemeProvider theme={tourTheme}>
      <WelcomeDialog />
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={runTour}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={joyrideSteps}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: baseTheme.palette.primary.main,
            arrowColor: baseTheme.palette.background.paper,
            backgroundColor: baseTheme.palette.background.paper,
            textColor: baseTheme.palette.text.primary,
            width: 400,
            beaconSize: 36,
          },
          tooltip: {
            padding: 16,
            borderRadius: 8,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
          },
          buttonNext: {
            backgroundColor: baseTheme.palette.primary.main,
            color: '#fff',
            fontSize: 14,
            padding: '8px 16px',
          },
          buttonBack: {
            color: baseTheme.palette.text.secondary,
            fontSize: 14,
            marginRight: 8,
          },
          buttonSkip: {
            color: baseTheme.palette.text.secondary,
            fontSize: 14,
          },
        }}
        locale={{
          back: 'Previous',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />
    </ThemeProvider>
  );
};

export default TourManager; 