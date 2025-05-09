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
  Slider,
  Stack,
  TextField,
  Typography,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { GridContainer, GridItem } from '../common/MuiGridWrapper';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { 
  Autorenew as RegenerateIcon,
  AutoAwesome as AIIcon,
  InfoOutlined as InfoIcon,
  BiotechOutlined as AnalysisIcon
} from '@mui/icons-material';
import aiService from '../../services/AIService';
import { Project, ProjectPriority, ProjectStatus, UserRole } from '../../types';

interface ProjectGeneratorProps {
  onProjectGenerated: (project: Partial<Project>) => void;
  existingProjects?: Project[];
}

/**
 * AI Project Generator component that creates project templates based on requirements
 */
const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({ 
  onProjectGenerated, 
  existingProjects = [] 
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectBudget, setProjectBudget] = useState<number | ''>('');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<ProjectPriority>(ProjectPriority.MEDIUM);
  const [complexity, setComplexity] = useState<number>(50);
  
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<Partial<Project> & { suggestedRoles?: UserRole[] } | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  
  // Find similar projects when description changes
  useEffect(() => {
    if (projectDescription.length > 10 && existingProjects.length > 0) {
      // Simple keyword matching for similar projects
      // In a real implementation, this would use semantic similarity
      const keywords = projectDescription.toLowerCase().split(/\s+/);
      const matchingProjects = existingProjects.filter(project => {
        if (!project.description) return false;
        
        const projectDesc = project.description.toLowerCase();
        return keywords.some(keyword => 
          keyword.length > 4 && projectDesc.includes(keyword)
        );
      });
      
      setSimilarProjects(matchingProjects.slice(0, 3));
    } else {
      setSimilarProjects([]);
    }
  }, [projectDescription, existingProjects]);
  
  const handlePriorityChange = (event: SelectChangeEvent) => {
    setPriority(event.target.value as ProjectPriority);
  };
  
  const handleComplexityChange = (_: Event, newValue: number | number[]) => {
    setComplexity(newValue as number);
  };

  const generateProject = () => {
    setLoading(true);
    
    try {
      // Prepare requirements object
      const requirements = {
        name: projectName,
        description: projectDescription,
        budget: projectBudget === '' ? undefined : projectBudget,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        priority,
        complexity: complexity / 100
      };
      
      // Generate project template using AI service
      const generatedTemplate = aiService.generateProjectTemplate(requirements, similarProjects);
      setGeneratedProject(generatedTemplate);
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating project:', error);
      setLoading(false);
    }
  };
  
  const handleUseTemplate = () => {
    if (generatedProject) {
      onProjectGenerated(generatedProject);
    }
  };
  
  const handleRegenerate = () => {
    generateProject();
  };
  
  const toggleAnalysis = () => {
    setAnalysisOpen(!analysisOpen);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AIIcon color="primary" />
          <Typography variant="h6" component="h2">
            AI Project Generator
          </Typography>
          <Tooltip title="The AI Project Generator uses historical project data to create optimal project templates based on your requirements">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        
        <GridContainer spacing={3}>
          <GridItem xs={12} md={6}>
            <TextField
              label="Project Name"
              fullWidth
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              margin="normal"
            />
            
            <TextField
              label="Project Description"
              fullWidth
              multiline
              rows={4}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              margin="normal"
              helperText="Describe the project goals, scope, and deliverables"
            />
            
            <TextField
              label="Budget"
              fullWidth
              type="number"
              value={projectBudget}
              onChange={(e) => setProjectBudget(e.target.value === '' ? '' : Number(e.target.value))}
              margin="normal"
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={priority}
                label="Priority"
                onChange={handlePriorityChange}
              >
                <MenuItem value={ProjectPriority.LOW}>Low</MenuItem>
                <MenuItem value={ProjectPriority.MEDIUM}>Medium</MenuItem>
                <MenuItem value={ProjectPriority.HIGH}>High</MenuItem>
                <MenuItem value={ProjectPriority.CRITICAL}>Critical</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography gutterBottom>Project Complexity</Typography>
              <Slider
                value={complexity}
                onChange={handleComplexityChange}
                aria-label="Project Complexity"
                valueLabelDisplay="auto"
                marks={[
                  { value: 0, label: 'Simple' },
                  { value: 50, label: 'Medium' },
                  { value: 100, label: 'Complex' }
                ]}
              />
            </Box>
            
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
              />
              
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                minDate={startDate || undefined}
              />
            </Stack>
            
            {similarProjects.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AnalysisIcon />}
                  onClick={toggleAnalysis}
                  sx={{ mb: 1 }}
                >
                  {analysisOpen ? 'Hide Analysis' : 'Show Similar Projects'}
                </Button>
                
                {analysisOpen && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Found {similarProjects.length} similar projects that will be used to optimize your template:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {similarProjects.map(project => (
                        <Chip 
                          key={project.id} 
                          label={project.name} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      ))}
                    </Stack>
                  </Alert>
                )}
              </Box>
            )}
            
            <Button
              variant="contained"
              fullWidth
              disabled={loading || !projectName || !projectDescription}
              onClick={generateProject}
              sx={{ mt: 3 }}
              startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
            >
              {loading ? 'Generating...' : 'Generate Project Template'}
            </Button>
          </GridItem>
          
          <GridItem xs={12} md={6}>
            {generatedProject ? (
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6" component="h3">
                      Generated Template
                    </Typography>
                    <Tooltip title="Regenerate with current settings">
                      <span>
                        <IconButton onClick={handleRegenerate} disabled={loading}>
                          <RegenerateIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle1">{generatedProject.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {generatedProject.description}
                  </Typography>
                  
                  <GridContainer spacing={2}>
                    <GridItem xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body2">
                        {generatedProject.startDate ? new Date(generatedProject.startDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </GridItem>
                    
                    <GridItem xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        End Date
                      </Typography>
                      <Typography variant="body2">
                        {generatedProject.endDate ? new Date(generatedProject.endDate).toLocaleDateString() : 'Not set'}
                      </Typography>
                    </GridItem>
                    
                    <GridItem xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Priority
                      </Typography>
                      <Typography variant="body2">
                        {generatedProject.priority}
                      </Typography>
                    </GridItem>
                    
                    <GridItem xs={6}>
                      <Typography variant="caption" color="text.secondary">
                        Budget
                      </Typography>
                      <Typography variant="body2">
                        ${generatedProject.budget?.toLocaleString()}
                      </Typography>
                    </GridItem>
                  </GridContainer>
                  
                  {generatedProject.suggestedRoles && generatedProject.suggestedRoles.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Suggested Team Roles
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                        {generatedProject.suggestedRoles.map((role, index) => (
                          <Chip key={index} label={role.replace('_', ' ')} size="small" />
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  <Button 
                    variant="contained" 
                    fullWidth 
                    onClick={handleUseTemplate}
                    sx={{ mt: 3 }}
                  >
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
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
                  AI Project Template
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in the project details and click "Generate Project Template" to create an optimized project structure based on AI analysis.
                </Typography>
              </Box>
            )}
          </GridItem>
        </GridContainer>
      </Paper>
    </LocalizationProvider>
  );
};

export default ProjectGenerator; 