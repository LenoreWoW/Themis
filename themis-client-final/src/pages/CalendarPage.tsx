import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  useTheme,
  Tooltip,
  IconButton,
  Chip,
  Grid,
  Alert,
  Snackbar
} from '@mui/material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/common';
import { useAuth } from '../context/AuthContext';
import CalendarService, { CalendarEvent, CalendarEventType } from '../services/CalendarService';
import { Info as InfoIcon } from '@mui/icons-material';

/**
 * Calendar Page Component
 * Displays a unified calendar with tasks, assignments, meetings, and project deadlines
 */
const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        const calendarEvents = await CalendarService.getCalendarEvents(user);
        setEvents(calendarEvents);
      } catch (error) {
        setError('Failed to load calendar events. Please try again later.');
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle clicking on an event
  const handleEventClick = (arg: EventClickArg) => {
    const eventType = arg.event.extendedProps.type;
    const eventId = arg.event.id;
    
    // Navigate to the appropriate detail page based on event type
    switch (eventType) {
      case CalendarEventType.TASK:
        // Open task detail modal or navigate to task detail page
        console.log('Open task detail:', eventId);
        break;
      case CalendarEventType.ASSIGNMENT:
        // Open assignment detail modal
        console.log('Open assignment detail:', eventId);
        break;
      case CalendarEventType.MEETING:
        // Open meeting detail modal
        console.log('Open meeting detail:', eventId);
        break;
      case CalendarEventType.DEADLINE:
        // Navigate to project detail page
        const projectId = arg.event.extendedProps.projectId;
        if (projectId) {
          window.location.href = `/projects/${projectId}`;
        }
        break;
    }
  };

  // Handle event drop (reschedule via drag and drop)
  const handleEventDrop = async (info: EventDropArg) => {
    const eventId = info.event.id;
    const eventType = info.event.extendedProps.type as CalendarEventType;
    const newStart = info.event.start?.toISOString() || '';
    const newEnd = info.event.end?.toISOString() || newStart;
    
    // Don't allow dragging project deadlines
    if (eventType === CalendarEventType.DEADLINE) {
      info.revert();
      setSnackbarMessage('Project deadlines cannot be rescheduled via drag and drop. Please update the project end date instead.');
      setSnackbarOpen(true);
      return;
    }
    
    if (user) {
      try {
        const success = await CalendarService.updateCalendarEvent(
          eventId,
          eventType,
          newStart,
          newEnd,
          user
        );
        
        if (!success) {
          info.revert();
          setSnackbarMessage('You do not have permission to update this item.');
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage('Calendar item updated successfully.');
          setSnackbarOpen(true);
        }
      } catch (error) {
        info.revert();
        setSnackbarMessage('Failed to update calendar item.');
        setSnackbarOpen(true);
        console.error('Error updating event:', error);
      }
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Render the calendar legend
  const renderLegend = () => (
    <Box 
      display="flex" 
      flexWrap="wrap" 
      gap={1} 
      mb={2} 
      p={2} 
      bgcolor={theme.palette.background.paper}
      borderRadius={1}
      boxShadow={1}
    >
      <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>
        Calendar Legend:
      </Typography>
      <Chip
        label="Tasks"
        size="small"
        sx={{ bgcolor: '#3788d8', color: 'white' }}
      />
      <Chip
        label="Assignments"
        size="small"
        sx={{ bgcolor: '#2e7d32', color: 'white' }}
      />
      <Chip
        label="Meetings"
        size="small"
        sx={{ bgcolor: '#9c27b0', color: 'white' }}
      />
      <Chip
        label="Project Deadlines"
        size="small"
        sx={{ bgcolor: '#f44336', color: 'white' }}
      />
    </Box>
  );

  // If still loading, show loading indicator
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  // If there was an error, show error message
  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Calendar</Typography>
        <Tooltip title="All items are color-coded based on type. You can drag and drop to reschedule tasks, assignments, and meetings if you have edit rights. Project deadlines cannot be changed via drag and drop.">
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {renderLegend()}

      <Paper sx={{ p: 2, height: 'calc(100vh - 230px)' }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          events={events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start,
            end: event.end,
            allDay: event.allDay,
            backgroundColor: event.color,
            borderColor: event.color,
            textColor: '#ffffff',
            editable: event.editable,
            extendedProps: {
              ...event.extendedProps,
              type: event.type,
              projectId: event.projectId
            }
          }))}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          height="100%"
        />
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default CalendarPage; 