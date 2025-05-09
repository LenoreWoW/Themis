import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Button, 
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  InsertChart as ChartIcon,
  ShowChart as ChartLineIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import FocusService from '../../services/FocusService';
import { format, formatDistance } from 'date-fns';

interface FocusAnalyticsProps {
  taskId: string;
}

const FocusAnalytics: React.FC<FocusAnalyticsProps> = ({ taskId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalFocusTime: 0,
    totalBreakTime: 0,
    averageFocusTime: 0,
    longestSession: 0,
    mostRecentSession: '',
    totalCheckpointsCompleted: 0
  });

  // Load focus sessions data on component mount
  useEffect(() => {
    const fetchFocusSessions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const focusService = FocusService.getInstance();
        const sessionData = await focusService.getTaskSessions(taskId);
        
        setSessions(sessionData);
        
        // Calculate stats
        if (sessionData.length > 0) {
          const totalSessions = sessionData.length;
          const totalFocusTime = sessionData.reduce((sum, session) => sum + (session.totalFocusTime || 0), 0);
          const totalBreakTime = sessionData.reduce((sum, session) => sum + (session.totalBreakTime || 0), 0);
          const averageFocusTime = Math.round(totalFocusTime / totalSessions);
          const longestSession = Math.max(...sessionData.map(s => s.totalFocusTime || 0));
          const mostRecentSession = sessionData.sort((a, b) => 
            new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
          )[0].endTime;
          const totalCheckpointsCompleted = sessionData.reduce((sum, session) => 
            sum + (session.checkpointsCompleted?.length || 0), 0
          );
          
          setStats({
            totalSessions,
            totalFocusTime,
            totalBreakTime,
            averageFocusTime,
            longestSession,
            mostRecentSession,
            totalCheckpointsCompleted
          });
        }
      } catch (error) {
        console.error('Error fetching focus sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFocusSessions();
  }, [user, taskId]);

  // Format time in seconds to "X hrs Y mins"
  const formatTimeSpan = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  // Open dialog with detailed analytics
  const handleOpenAnalytics = () => {
    setDialogOpen(true);
  };

  // Close dialog
  const handleCloseAnalytics = () => {
    setDialogOpen(false);
  };

  // If loading or no sessions, show appropriate message
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary" align="center">
          No focus sessions recorded yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Focus Analytics
        </Typography>
        <Button 
          size="small" 
          startIcon={<ChartIcon />} 
          onClick={handleOpenAnalytics}
          variant="outlined"
        >
          Details
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Total Focus Time
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <TimerIcon fontSize="small" sx={{ mr: 0.5 }} />
              {formatTimeSpan(stats.totalFocusTime)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Sessions
            </Typography>
            <Typography variant="h6">
              {stats.totalSessions}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Checkpoints Completed
            </Typography>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircleIcon fontSize="small" sx={{ mr: 0.5 }} />
              {stats.totalCheckpointsCompleted}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Last Session
            </Typography>
            <Typography variant="body1">
              {stats.mostRecentSession ? 
                formatDistance(new Date(stats.mostRecentSession), new Date(), { addSuffix: true }) : 
                'N/A'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Analytics Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseAnalytics}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            <ChartLineIcon sx={{ mr: 1 }} />
            Focus Analytics
          </Typography>
          <IconButton edge="end" onClick={handleCloseAnalytics}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Sessions
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalSessions}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Focus Time
                  </Typography>
                  <Typography variant="h5">
                    {formatTimeSpan(stats.totalFocusTime)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Avg. Focus Time
                  </Typography>
                  <Typography variant="h5">
                    {formatTimeSpan(stats.averageFocusTime)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Longest Session
                  </Typography>
                  <Typography variant="h5">
                    {formatTimeSpan(stats.longestSession)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Break Time
                  </Typography>
                  <Typography variant="h5">
                    {formatTimeSpan(stats.totalBreakTime)}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6} md={4}>
                <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Checkpoints
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalCheckpointsCompleted}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Recent Sessions
          </Typography>

          <List>
            {sessions.slice(0, 5).map((session) => (
              <Paper key={session.id} variant="outlined" sx={{ mb: 1 }}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1">
                          {formatDate(session.startTime)}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={formatTimeSpan(session.totalFocusTime)} 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" display="block">
                          Breaks: {session.breakCount}
                        </Typography>
                        {session.checkpointsCompleted && session.checkpointsCompleted.length > 0 && (
                          <Typography variant="body2" color="success.main">
                            Completed {session.checkpointsCompleted.length} checkpoints
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FocusAnalytics; 