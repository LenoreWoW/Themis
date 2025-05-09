import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  CircularProgress, 
  Tooltip, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import FocusService from '../../services/FocusService';

// Define FocusTimerState enum directly in this component until we fix the types
enum FocusTimerState {
  IDLE = 'IDLE',
  FOCUSING = 'FOCUSING',
  BREAK = 'BREAK',
  PAUSED = 'PAUSED'
}

interface PomodoroTimerProps {
  taskId: string;
  disabled?: boolean;
  onSessionComplete?: (sessionData: any) => void;
  nextCheckpoint?: string | null; // Text of the next uncompleted checkpoint
}

// Constants for timer durations (in seconds)
const FOCUS_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 minutes
const BREAKS_BEFORE_LONG = 3; // Number of short breaks before a long break

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  taskId,
  disabled = false,
  onSessionComplete,
  nextCheckpoint
}) => {
  const { user } = useAuth();
  const [timerState, setTimerState] = useState<FocusTimerState>(FocusTimerState.IDLE);
  const [timeRemaining, setTimeRemaining] = useState<number>(FOCUS_DURATION);
  const [breakCount, setBreakCount] = useState<number>(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [totalFocusTime, setTotalFocusTime] = useState<number>(0);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0);
  const [infoDialogOpen, setInfoDialogOpen] = useState<boolean>(false);
  const [notificationOpen, setNotificationOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for circular display
  const calculateProgress = (): number => {
    if (timerState === FocusTimerState.FOCUSING) {
      return ((FOCUS_DURATION - timeRemaining) / FOCUS_DURATION) * 100;
    } else if (timerState === FocusTimerState.BREAK) {
      const breakDuration = breakCount % BREAKS_BEFORE_LONG === 0 
        ? LONG_BREAK_DURATION 
        : SHORT_BREAK_DURATION;
      return ((breakDuration - timeRemaining) / breakDuration) * 100;
    }
    return 0;
  };

  // Show notification
  const showNotification = (message: string, severity: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setNotificationOpen(true);
  };

  // Timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerState === FocusTimerState.FOCUSING || timerState === FocusTimerState.BREAK) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up
            if (timerState === FocusTimerState.FOCUSING) {
              // Focus period ended, start break
              const nextBreakCount = breakCount + 1;
              const isLongBreak = nextBreakCount % BREAKS_BEFORE_LONG === 0;
              const breakDuration = isLongBreak ? LONG_BREAK_DURATION : SHORT_BREAK_DURATION;
              
              setBreakCount(nextBreakCount);
              setTimerState(FocusTimerState.BREAK);
              setTimeRemaining(breakDuration);
              
              // Track focus time
              setTotalFocusTime(prev => prev + FOCUS_DURATION);
              
              // Show notification
              showNotification(
                isLongBreak 
                  ? 'Time for a long break! Take 15 minutes to recharge.' 
                  : 'Time for a short break! Take 5 minutes to rest.',
                'success'
              );
              
              // Play sound if available
              try {
                new Audio('/notification-sound.mp3').play();
              } catch (error) {
                console.log('Could not play notification sound');
              }
              
              // Request browser notification permission if not already granted
              if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
                Notification.requestPermission();
              }
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                  body: isLongBreak 
                    ? 'Time for a long break! Take 15 minutes to recharge.' 
                    : 'Time for a short break! Take 5 minutes to rest.',
                  icon: '/favicon.ico'
                });
              }
              
              return breakDuration;
            } else {
              // Break period ended, start focus time
              setTimerState(FocusTimerState.FOCUSING);
              setTimeRemaining(FOCUS_DURATION);
              
              // Track break time
              const breakDuration = breakCount % BREAKS_BEFORE_LONG === 0 
                ? LONG_BREAK_DURATION 
                : SHORT_BREAK_DURATION;
              setTotalBreakTime(prev => prev + breakDuration);
              
              // Show notification
              showNotification('Break over! Time to focus again.', 'info');
              
              // Play sound if available
              try {
                new Audio('/notification-sound.mp3').play();
              } catch (error) {
                console.log('Could not play notification sound');
              }
              
              // Show browser notification if permission granted
              if (Notification.permission === 'granted') {
                new Notification('Pomodoro Timer', {
                  body: 'Break over! Time to focus again.',
                  icon: '/favicon.ico'
                });
              }
              
              return FOCUS_DURATION;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [timerState, breakCount]);

  // Start the focus session
  const startFocusSession = () => {
    setTimerState(FocusTimerState.FOCUSING);
    setTimeRemaining(FOCUS_DURATION);
    setSessionStartTime(new Date());
    setBreakCount(0);
    setTotalFocusTime(0);
    setTotalBreakTime(0);
    showNotification('Focus session started! Stay productive for the next 25 minutes.', 'success');
  };

  // Pause the timer
  const pauseTimer = () => {
    setTimerState(FocusTimerState.PAUSED);
  };

  // Resume the timer
  const resumeTimer = () => {
    if (timerState === FocusTimerState.PAUSED) {
      setTimerState(timeRemaining === FOCUS_DURATION ? FocusTimerState.FOCUSING : FocusTimerState.BREAK);
    }
  };

  // Reset the timer
  const resetTimer = () => {
    setTimerState(FocusTimerState.IDLE);
    setTimeRemaining(FOCUS_DURATION);
    setBreakCount(0);
    setTotalFocusTime(0);
    setTotalBreakTime(0);
    setSessionStartTime(null);
  };

  // End the session and record it
  const endSession = useCallback(async () => {
    if (!user || !sessionStartTime) return;
    
    const sessionData = {
      userId: user.id,
      taskId,
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString(),
      breakCount,
      totalFocusTime,
      totalBreakTime
    };
    
    try {
      const focusService = FocusService.getInstance();
      const result = await focusService.recordFocusSession(sessionData);
      
      if (result) {
        showNotification('Focus session recorded successfully!', 'success');
        if (onSessionComplete) {
          onSessionComplete(result);
        }
      } else {
        showNotification('Failed to record focus session.', 'error');
      }
    } catch (error) {
      console.error('Error recording focus session:', error);
      showNotification('Error recording focus session.', 'error');
    }
    
    resetTimer();
  }, [user, sessionStartTime, taskId, breakCount, totalFocusTime, totalBreakTime, onSessionComplete]);

  // Stop the session
  const stopSession = () => {
    if (timerState !== FocusTimerState.IDLE) {
      endSession();
    }
  };

  // Handle dialog open/close
  const handleInfoDialogOpen = () => {
    setInfoDialogOpen(true);
  };

  const handleInfoDialogClose = () => {
    setInfoDialogOpen(false);
  };

  // Get the color for the timer based on its state
  const getTimerColor = (): string => {
    switch (timerState) {
      case FocusTimerState.FOCUSING:
        return '#8A1538'; // Primary brand color
      case FocusTimerState.BREAK:
        return '#4CAF50'; // Green for break
      case FocusTimerState.PAUSED:
        return '#FFC107'; // Yellow for paused
      default:
        return '#757575'; // Grey for idle
    }
  };

  return (
    <Box sx={{ mt: 2, mb: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Focus Timer
        </Typography>
        <Tooltip title="Learn about the Pomodoro technique">
          <IconButton size="small" onClick={handleInfoDialogOpen} sx={{ ml: 1 }}>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {nextCheckpoint && timerState !== FocusTimerState.IDLE && (
        <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Next focus:
          </Typography>
          <Typography variant="body2" fontWeight="medium">
            {nextCheckpoint}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', position: 'relative' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', m: 2 }}>
          <CircularProgress
            variant="determinate"
            value={calculateProgress()}
            size={80}
            thickness={4}
            sx={{ color: getTimerColor() }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" component="div" color="text.primary">
              {formatTime(timeRemaining)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
          {timerState === FocusTimerState.IDLE && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={startFocusSession}
              disabled={disabled}
            >
              Start Focus
            </Button>
          )}

          {timerState === FocusTimerState.FOCUSING && (
            <>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<PauseIcon />}
                onClick={pauseTimer}
              >
                Pause
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopSession}
              >
                Stop
              </Button>
            </>
          )}

          {timerState === FocusTimerState.BREAK && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<StopIcon />}
              onClick={stopSession}
            >
              End Session
            </Button>
          )}

          {timerState === FocusTimerState.PAUSED && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<PlayIcon />}
                onClick={resumeTimer}
              >
                Resume
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopIcon />}
                onClick={stopSession}
              >
                Stop
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={resetTimer}
              >
                Reset
              </Button>
            </>
          )}
        </Box>

        {timerState !== FocusTimerState.IDLE && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {timerState === FocusTimerState.FOCUSING
                ? 'Stay focused! 🧠'
                : timerState === FocusTimerState.BREAK
                ? breakCount % BREAKS_BEFORE_LONG === 0
                  ? 'Enjoy your long break! 🌿'
                  : 'Take a short break! ☕'
                : 'Timer paused'
              }
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Sessions: {Math.floor(breakCount / BREAKS_BEFORE_LONG)}.{breakCount % BREAKS_BEFORE_LONG}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={handleInfoDialogClose}>
        <DialogTitle>About the Pomodoro Technique</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>How it works:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            <ol>
              <li>Work for 25 minutes (one "Pomodoro")</li>
              <li>Take a 5-minute break</li>
              <li>After 4 Pomodoros, take a longer 15-minute break</li>
              <li>Repeat the cycle</li>
            </ol>
          </Typography>
          <Typography variant="body2" paragraph>
            This technique helps improve focus and reduce mental fatigue by encouraging regular breaks.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInfoDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notificationOpen} 
        autoHideDuration={6000} 
        onClose={() => setNotificationOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setNotificationOpen(false)} severity={notificationSeverity}>
          {notificationMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PomodoroTimer; 