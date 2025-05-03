import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox
} from '@mui/material';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { 
  AutoAwesome as AIIcon,
  InfoOutlined as InfoIcon,
  Assignment as TaskIcon,
  Summarize as SummarizeIcon,
  FormatListBulleted as ListIcon,
  Add as AddIcon,
  EventNote as MeetingIcon,
  CheckCircleOutline as CompletedIcon
} from '@mui/icons-material';
import aiService from '../../services/AIService';
import { Task, TaskPriority, TaskStatus, Project } from '../../types';

interface MeetingNoteTakerProps {
  projectId: string;
  onTasksExtracted: (tasks: Partial<Task>[]) => void;
  projects?: Project[];
}

/**
 * AI Meeting Note Taker component that extracts action items from meeting notes
 */
const MeetingNoteTaker: React.FC<MeetingNoteTakerProps> = ({ 
  projectId, 
  onTasksExtracted,
  projects = []
}) => {
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [loading, setLoading] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<Partial<Task>[]>([]);
  const [summary, setSummary] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<{[key: string]: boolean}>({});
  const [processComplete, setProcessComplete] = useState(false);
  
  useEffect(() => {
    // Reset state when projectId changes
    setSelectedProjectId(projectId);
  }, [projectId]);
  
  const handleProjectChange = (event: SelectChangeEvent) => {
    setSelectedProjectId(event.target.value);
  };
  
  const handleExtractTasks = () => {
    if (!meetingNotes.trim()) return;
    
    setLoading(true);
    
    try {
      // Extract action items from meeting notes
      const tasks = aiService.extractActionItems(meetingNotes, selectedProjectId);
      
      // Get meeting summary
      const generatedSummary = aiService.summarizeMeetingNotes(meetingNotes);
      
      // Initialize selectedTasks with all tasks selected
      const initialSelection: {[key: string]: boolean} = {};
      tasks.forEach((task, index) => {
        initialSelection[`task-${index}`] = true;
      });
      
      setTimeout(() => {
        setExtractedTasks(tasks);
        setSummary(generatedSummary);
        setSelectedTasks(initialSelection);
        setLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error extracting tasks:', error);
      setLoading(false);
    }
  };
  
  const handleTaskSelection = (taskIndex: number) => {
    setSelectedTasks({
      ...selectedTasks,
      [`task-${taskIndex}`]: !selectedTasks[`task-${taskIndex}`]
    });
  };
  
  const handleCreateTasks = () => {
    // Filter selected tasks
    const tasksToCreate = extractedTasks.filter((_, index) => 
      selectedTasks[`task-${index}`]
    );
    
    // Add meeting title to task description if available
    const tasksWithMeetingContext = tasksToCreate.map(task => ({
      ...task,
      description: meetingTitle ? 
        `${task.description}\n\nFrom meeting: ${meetingTitle}` : 
        task.description
    }));
    
    onTasksExtracted(tasksWithMeetingContext);
    setProcessComplete(true);
  };
  
  const handleReset = () => {
    setMeetingNotes('');
    setMeetingTitle('');
    setExtractedTasks([]);
    setSummary('');
    setSelectedTasks({});
    setProcessComplete(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <MeetingIcon color="primary" />
        <Typography variant="h6" component="h2">
          AI Meeting Note Taker
        </Typography>
        <Tooltip title="The AI Meeting Note Taker extracts action items from your meeting notes and converts them to tasks">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      
      {!processComplete ? (
        <>
          <GridContainer spacing={3}>
            <GridItem xs={12} md={6}>
              <TextField
                label="Meeting Title"
                fullWidth
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                margin="normal"
                placeholder="Weekly Project Status Meeting"
              />
              
              {projects.length > 0 && (
                <FormControl fullWidth margin="normal">
                  <InputLabel id="project-select-label">Associated Project</InputLabel>
                  <Select
                    labelId="project-select-label"
                    value={selectedProjectId}
                    label="Associated Project"
                    onChange={handleProjectChange}
                  >
                    {projects.map(project => (
                      <MenuItem key={project.id} value={project.id}>
                        {project.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              
              <TextField
                label="Meeting Notes"
                fullWidth
                multiline
                rows={12}
                value={meetingNotes}
                onChange={(e) => setMeetingNotes(e.target.value)}
                margin="normal"
                placeholder={`Enter your meeting notes here...\n\nTip: Format action items like this:\nAction: Prepare project timeline @John by 2023-06-15\nTODO: Schedule follow-up meeting with design team by next week`}
              />
              
              <Button
                variant="contained"
                fullWidth
                disabled={loading || !meetingNotes.trim()}
                onClick={handleExtractTasks}
                sx={{ mt: 2 }}
                startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
              >
                {loading ? 'Processing...' : 'Extract Action Items & Summarize'}
              </Button>
            </GridItem>
            
            <GridItem xs={12} md={6}>
              {summary ? (
                <>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <SummarizeIcon color="primary" />
                        <Typography variant="h6" component="h3">
                          Meeting Summary
                        </Typography>
                      </Stack>
                      
                      <Divider sx={{ mb: 2 }} />
                      
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {summary}
                      </Typography>
                    </CardContent>
                  </Card>
                  
                  {extractedTasks.length > 0 ? (
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <ListIcon color="primary" />
                          <Typography variant="h6" component="h3">
                            Extracted Action Items
                          </Typography>
                        </Stack>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Select the items you want to convert to tasks
                        </Typography>
                        
                        <List>
                          {extractedTasks.map((task, index) => (
                            <ListItem 
                              key={index} 
                              sx={{ 
                                bgcolor: 'background.default', 
                                mb: 1, 
                                borderRadius: 1,
                                opacity: selectedTasks[`task-${index}`] ? 1 : 0.6 
                              }}
                            >
                              <ListItemIcon>
                                <Checkbox
                                  edge="start"
                                  checked={selectedTasks[`task-${index}`] || false}
                                  onChange={() => handleTaskSelection(index)}
                                  inputProps={{ 'aria-labelledby': `task-item-${index}` }}
                                  color="primary"
                                />
                              </ListItemIcon>
                              <ListItemText
                                id={`task-item-${index}`}
                                primary={task.title}
                                secondary={
                                  <>
                                    {task.dueDate && (
                                      <Typography component="span" variant="body2" color="text.secondary">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                        
                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<AddIcon />}
                          onClick={handleCreateTasks}
                          disabled={Object.values(selectedTasks).every(v => !v)}
                          sx={{ mt: 2 }}
                        >
                          Create Tasks from Selected Items
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Alert severity="info">
                      No action items found in the meeting notes. Try formatting your tasks as "Action: [task description]" or "TODO: [task description]".
                    </Alert>
                  )}
                </>
              ) : (
                <Box 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center'
                  }}
                >
                  <AIIcon sx={{ fontSize: 48, color: 'primary.light', mb: 2, opacity: 0.7 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    AI Meeting Notes Assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Paste your meeting notes on the left and click "Extract Action Items & Summarize" to automatically identify tasks and create a summary.
                  </Typography>
                </Box>
              )}
            </GridItem>
          </GridContainer>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CompletedIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Tasks Successfully Created
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {Object.values(selectedTasks).filter(v => v).length} tasks have been created from your meeting notes.
          </Typography>
          <Button variant="outlined" onClick={handleReset}>
            Process Another Meeting
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default MeetingNoteTaker; 