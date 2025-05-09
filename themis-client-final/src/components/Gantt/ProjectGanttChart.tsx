import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper, 
  IconButton, 
  Tooltip, 
  Button,
  Menu,
  MenuItem,
  Stack,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Today as TodayIcon,
  FilterList as FilterIcon,
  ViewWeek as ViewWeekIcon,
  ViewDay as ViewDayIcon,
  CalendarViewMonth as ViewMonthIcon
} from '@mui/icons-material';
import { Chart } from 'react-google-charts';
import { format, addDays, subDays, differenceInDays } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

// Define the view type for the Gantt chart
type GanttViewType = 'day' | 'week' | 'month';

// Define interfaces for Gantt data
interface GanttProject {
  id: string;
  name: string;
  start: Date;
  end: Date;
  departmentId: string;
  departmentName: string;
  status: string;
  progress: number;
  color?: string;
}

interface GanttMeeting {
  id: string;
  title: string;
  start: Date;
  end: Date;
  projectId: string;
  meetingLink?: string;
}

// Sample data for testing
const SAMPLE_PROJECTS: GanttProject[] = [
  {
    id: 'p1',
    name: 'ERP System Implementation',
    start: new Date(2023, 0, 15), // Jan 15, 2023
    end: new Date(2023, 5, 30),   // June 30, 2023
    departmentId: 'd1',
    departmentName: 'IT',
    status: 'IN_PROGRESS',
    progress: 0.3
  },
  {
    id: 'p2',
    name: 'Marketing Campaign',
    start: new Date(2023, 3, 1),  // April 1, 2023
    end: new Date(2023, 6, 15),   // July 15, 2023
    departmentId: 'd2',
    departmentName: 'Marketing',
    status: 'PLANNING',
    progress: 0.1
  },
  {
    id: 'p3',
    name: 'Office Relocation',
    start: new Date(2023, 1, 10),  // Feb 10, 2023
    end: new Date(2023, 2, 30),    // March 30, 2023
    departmentId: 'd3',
    departmentName: 'Operations',
    status: 'COMPLETED',
    progress: 1.0
  },
];

const SAMPLE_MEETINGS: GanttMeeting[] = [
  {
    id: 'm1',
    title: 'ERP Kickoff Meeting',
    start: new Date(2023, 0, 17),
    end: new Date(2023, 0, 17, 2), // 2 hours later
    projectId: 'p1'
  },
  {
    id: 'm2',
    title: 'Marketing Strategy Session',
    start: new Date(2023, 3, 5),
    end: new Date(2023, 3, 5, 3), // 3 hours later
    projectId: 'p2'
  },
  {
    id: 'm3',
    title: 'Relocation Planning',
    start: new Date(2023, 1, 15),
    end: new Date(2023, 1, 15, 2), // 2 hours later
    projectId: 'p3'
  }
];

const ProjectGanttChart: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<GanttProject[]>([]);
  const [meetings, setMeetings] = useState<GanttMeeting[]>([]);
  const [viewType, setViewType] = useState<GanttViewType>('week');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);
  
  // Load sample data (in a real app, this would fetch from API)
  useEffect(() => {
    // Simulate API loading
    setLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      setProjects(SAMPLE_PROJECTS);
      setMeetings(SAMPLE_MEETINGS);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format data for Google Charts
  const formatGanttData = () => {
    let filteredProjects = projects;
    
    // Apply filters
    if (statusFilter) {
      filteredProjects = filteredProjects.filter(project => project.status === statusFilter);
    }
    
    if (departmentFilter) {
      filteredProjects = filteredProjects.filter(project => project.departmentId === departmentFilter);
    }
    
    // Format data for Google Charts
    const data: any[] = [
      [
        { type: 'string', label: 'Task ID' },
        { type: 'string', label: 'Task Name' },
        { type: 'string', label: 'Resource' },
        { type: 'date', label: 'Start Date' },
        { type: 'date', label: 'End Date' },
        { type: 'number', label: 'Duration' },
        { type: 'number', label: 'Percent Complete' },
        { type: 'string', label: 'Dependencies' },
      ],
    ];
    
    // Add projects to the data
    filteredProjects.forEach(project => {
      data.push([
        project.id,
        project.name,
        project.departmentName,
        project.start,
        project.end,
        Math.max(1, differenceInDays(project.end, project.start)),
        Math.round(project.progress * 100),
        null
      ]);
      
      // Add related meetings to the data
      const projectMeetings = meetings.filter(meeting => meeting.projectId === project.id);
      projectMeetings.forEach(meeting => {
        data.push([
          `meeting_${meeting.id}`,
          `📅 ${meeting.title}`,
          `Meeting for ${project.name}`,
          meeting.start,
          meeting.end,
          Math.max(1, differenceInDays(meeting.end, meeting.start)),
          100,
          project.id // Dependency on the project
        ]);
      });
    });
    
    return data;
  };
  
  // Gantt chart options
  const getChartOptions = () => {
    const height = Math.max(500, projects.length * 50 + 100);
    
    return {
      height,
      gantt: {
        trackHeight: 40,
        barHeight: 30,
        labelStyle: {
          fontName: 'Arial',
          fontSize: 12
        },
        percentEnabled: true,
        shadowEnabled: true,
        innerGridHorizLine: {
          stroke: '#e0e0e0'
        },
        innerGridVertLine: {
          stroke: '#e0e0e0'
        },
        criticalPathEnabled: false,
        barCornerRadius: 3,
        arrow: {
          angle: 20,
          width: 2,
          color: '#757575',
          radius: 3
        }
      }
    };
  };
  
  // Handle view mode change
  const handleViewChange = (mode: GanttViewType) => {
    setViewType(mode);
  };
  
  // Handle zoom
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  // Handle filter menu
  const handleFilterMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };
  
  // Handle status filter
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status);
    handleFilterMenuClose();
  };
  
  // Handle department filter
  const handleDepartmentFilter = (departmentId: string | null) => {
    setDepartmentFilter(departmentId);
    handleFilterMenuClose();
  };
  
  // Get unique departments for filtering
  const uniqueDepartments = Array.from(new Set(projects.map(p => p.departmentId))).map(
    deptId => {
      const project = projects.find(p => p.departmentId === deptId);
      return {
        id: deptId,
        name: project ? project.departmentName : 'Unknown Department'
      };
    }
  );
  
  // Get unique statuses for filtering
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status)));
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Project Timeline</Typography>
        
        <Stack direction="row" spacing={1}>
          {/* View Type Buttons */}
          <Box>
            <Tooltip title="Day View">
              <IconButton 
                color={viewType === 'day' ? 'primary' : 'default'}
                onClick={() => handleViewChange('day')}
              >
                <ViewDayIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Week View">
              <IconButton 
                color={viewType === 'week' ? 'primary' : 'default'}
                onClick={() => handleViewChange('week')}
              >
                <ViewWeekIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Month View">
              <IconButton 
                color={viewType === 'month' ? 'primary' : 'default'}
                onClick={() => handleViewChange('month')}
              >
                <ViewMonthIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Zoom Controls */}
          <Box>
            <Tooltip title="Zoom Out">
              <IconButton onClick={handleZoomOut}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Zoom In">
              <IconButton onClick={handleZoomIn}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Filters */}
          <Tooltip title="Filter">
            <IconButton onClick={handleFilterMenuOpen}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterMenuClose}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Typography variant="subtitle2">Filter by Status</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => handleStatusFilter(null)}>
              <Typography variant="body2" fontWeight={statusFilter === null ? 'bold' : 'normal'}>
                All Statuses
              </Typography>
            </MenuItem>
            
            {uniqueStatuses.map(status => (
              <MenuItem key={status} onClick={() => handleStatusFilter(status)}>
                <Typography variant="body2" fontWeight={statusFilter === status ? 'bold' : 'normal'}>
                  {status.replace('_', ' ')}
                </Typography>
              </MenuItem>
            ))}
            
            <Divider />
            
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Typography variant="subtitle2">Filter by Department</Typography>
            </MenuItem>
            
            <MenuItem onClick={() => handleDepartmentFilter(null)}>
              <Typography variant="body2" fontWeight={departmentFilter === null ? 'bold' : 'normal'}>
                All Departments
              </Typography>
            </MenuItem>
            
            {uniqueDepartments.map(dept => (
              <MenuItem key={dept.id} onClick={() => handleDepartmentFilter(dept.id)}>
                <Typography variant="body2" fontWeight={departmentFilter === dept.id ? 'bold' : 'normal'}>
                  {dept.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Box>
      
      {/* Active Filters Display */}
      {(statusFilter || departmentFilter) && (
        <Box display="flex" gap={1} mb={2}>
          <Typography variant="body2">Active Filters:</Typography>
          
          {statusFilter && (
            <Chip 
              label={`Status: ${statusFilter.replace('_', ' ')}`}
              size="small"
              onDelete={() => setStatusFilter(null)}
            />
          )}
          
          {departmentFilter && (
            <Chip 
              label={`Department: ${uniqueDepartments.find(d => d.id === departmentFilter)?.name || ''}`}
              size="small"
              onDelete={() => setDepartmentFilter(null)}
            />
          )}
        </Box>
      )}
      
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={400}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        <Box p={4} textAlign="center">
          <Typography color="textSecondary">
            No project timeline data available
          </Typography>
        </Box>
      ) : (
        <Box 
          sx={{ 
            overflowX: 'auto',
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top left',
            transition: 'transform 0.3s ease'
          }}
        >
          <Chart
            chartType="Gantt"
            width="100%"
            data={formatGanttData()}
            options={getChartOptions()}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectGanttChart; 