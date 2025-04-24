import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  InputBase,
  Paper,
  Stack,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Tooltip,
  alpha,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Search as SearchIcon,
  AutoAwesome as AIIcon,
  Description as DocumentIcon,
  Assignment as TaskIcon,
  Folder as ProjectIcon,
  ChangeCircle as ChangeIcon,
  HistoryEdu as NotesIcon,
  Person as PersonIcon,
  InfoOutlined as InfoIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import aiService from '../../services/AIService';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description?: string;
  projectId?: string;
  relevance: number;
}

interface SearchAssistantProps {
  userRole: UserRole;
  onResultClick?: (result: SearchResult) => void;
}

/**
 * AI Search Assistant component that intelligently searches across different content types
 */
const SearchAssistant: React.FC<SearchAssistantProps> = ({ 
  userRole, 
  onResultClick 
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState({
    projects: true,
    tasks: true,
    changeRequests: true,
    notes: false,
    users: false
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const handleSearch = () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    try {
      // Get content types to search
      const contentTypes = Object.entries(selectedTypes)
        .filter(([_, isSelected]) => isSelected)
        .map(([type]) => type);
      
      // Perform intelligent search
      const searchResults = aiService.intelligentSearch(query, contentTypes, userRole);
      
      setTimeout(() => {
        setResults(searchResults);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error searching:', error);
      setLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
  };
  
  const handleTypeChange = (type: string) => {
    setSelectedTypes({
      ...selectedTypes,
      [type]: !selectedTypes[type as keyof typeof selectedTypes]
    });
  };
  
  const handleSelectAll = () => {
    const allSelected = Object.values(selectedTypes).every(value => value);
    
    setSelectedTypes({
      projects: !allSelected,
      tasks: !allSelected,
      changeRequests: !allSelected,
      notes: !allSelected,
      users: !allSelected
    });
  };
  
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };
  
  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result);
      return;
    }
    
    // Default navigation based on result type
    switch (result.type) {
      case 'project':
        navigate(`/projects/${result.id}`);
        break;
      case 'task':
        if (result.projectId) {
          navigate(`/projects/${result.projectId}?taskId=${result.id}`);
        }
        break;
      case 'changeRequest':
        if (result.projectId) {
          navigate(`/projects/${result.projectId}?changeRequestId=${result.id}`);
        }
        break;
      default:
        // No default navigation
        break;
    }
  };
  
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <ProjectIcon sx={{ color: '#4caf50' }} />;
      case 'task':
        return <TaskIcon sx={{ color: '#2196f3' }} />;
      case 'changeRequest':
        return <ChangeIcon sx={{ color: '#ff9800' }} />;
      case 'note':
        return <NotesIcon sx={{ color: '#9c27b0' }} />;
      case 'user':
        return <PersonIcon sx={{ color: '#f44336' }} />;
      default:
        return <DocumentIcon sx={{ color: '#757575' }} />;
    }
  };
  
  const filteredResults = selectedTab === 0 
    ? results 
    : results.filter(result => {
        switch (selectedTab) {
          case 1: return result.type === 'project';
          case 2: return result.type === 'task';
          case 3: return result.type === 'changeRequest';
          case 4: return result.type === 'note';
          case 5: return result.type === 'user';
          default: return true;
        }
      });

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AIIcon color="primary" />
        <Typography variant="h6" component="h2">
          AI Search Assistant
        </Typography>
        <Tooltip title="The AI Search Assistant helps you find information across projects, tasks, change requests, and more">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      
      <Paper
        component="form"
        sx={{ 
          p: '2px 4px', 
          display: 'flex', 
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          mb: 2
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="search">
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search for projects, tasks, change requests..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        {query && (
          <IconButton 
            sx={{ p: '10px' }} 
            aria-label="clear search"
            onClick={handleClearSearch}
          >
            <ClearIcon />
          </IconButton>
        )}
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <Tooltip title="Filter search">
          <IconButton 
            color={showFilters ? "primary" : "default"}
            sx={{ p: '10px' }} 
            aria-label="filter search"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          disabled={!query.trim() || loading}
          onClick={handleSearch}
          sx={{ ml: 1 }}
          startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
        >
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </Paper>
      
      {showFilters && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Search Filters</Typography>
            <Button 
              size="small" 
              onClick={handleSelectAll}
            >
              {Object.values(selectedTypes).every(value => value) ? 'Deselect All' : 'Select All'}
            </Button>
          </Stack>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedTypes.projects} 
                  onChange={() => handleTypeChange('projects')}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ProjectIcon fontSize="small" sx={{ color: '#4caf50' }} />
                  <Typography variant="body2">Projects</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedTypes.tasks} 
                  onChange={() => handleTypeChange('tasks')}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TaskIcon fontSize="small" sx={{ color: '#2196f3' }} />
                  <Typography variant="body2">Tasks</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedTypes.changeRequests} 
                  onChange={() => handleTypeChange('changeRequests')}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ChangeIcon fontSize="small" sx={{ color: '#ff9800' }} />
                  <Typography variant="body2">Change Requests</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedTypes.notes} 
                  onChange={() => handleTypeChange('notes')}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <NotesIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                  <Typography variant="body2">Notes</Typography>
                </Stack>
              }
            />
            <FormControlLabel
              control={
                <Checkbox 
                  checked={selectedTypes.users} 
                  onChange={() => handleTypeChange('users')}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PersonIcon fontSize="small" sx={{ color: '#f44336' }} />
                  <Typography variant="body2">Users</Typography>
                </Stack>
              }
            />
          </FormGroup>
        </Paper>
      )}
      
      {results.length > 0 && (
        <Box>
          <Tabs 
            value={selectedTab} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2 }}
          >
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2">All Results</Typography>
                  <Chip label={results.length} size="small" />
                </Stack>
              } 
            />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ProjectIcon fontSize="small" sx={{ color: '#4caf50', mr: 0.5 }} />
                  <Typography variant="body2">Projects</Typography>
                  <Chip 
                    label={results.filter(r => r.type === 'project').length} 
                    size="small" 
                  />
                </Stack>
              } 
              disabled={!results.some(r => r.type === 'project')}
            />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TaskIcon fontSize="small" sx={{ color: '#2196f3', mr: 0.5 }} />
                  <Typography variant="body2">Tasks</Typography>
                  <Chip 
                    label={results.filter(r => r.type === 'task').length} 
                    size="small" 
                  />
                </Stack>
              } 
              disabled={!results.some(r => r.type === 'task')}
            />
            <Tab 
              label={
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ChangeIcon fontSize="small" sx={{ color: '#ff9800', mr: 0.5 }} />
                  <Typography variant="body2">Change Requests</Typography>
                  <Chip 
                    label={results.filter(r => r.type === 'changeRequest').length} 
                    size="small" 
                  />
                </Stack>
              } 
              disabled={!results.some(r => r.type === 'changeRequest')}
            />
          </Tabs>
          
          <List>
            {filteredResults.map((result) => (
              <ListItem 
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                sx={{ 
                  mb: 1, 
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha('#000', 0.05),
                    transform: 'translateY(-2px)',
                    boxShadow: 1
                  }
                }}
              >
                <ListItemIcon>
                  {getResultIcon(result.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2">
                      {result.title}
                      <Chip 
                        label={result.type.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} 
                        size="small" 
                        sx={{ ml: 1, textTransform: 'capitalize' }} 
                      />
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {result.description}
                    </Typography>
                  }
                />
                <Chip 
                  label={`Relevance: ${Math.round(result.relevance * 100)}%`}
                  size="small"
                  color={
                    result.relevance > 0.8 ? 'success' : 
                    result.relevance > 0.6 ? 'primary' : 
                    result.relevance > 0.4 ? 'default' : 'default'
                  }
                  variant="outlined"
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {query && !loading && results.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No results found for "{query}"
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try using different keywords or adjusting your search filters
          </Typography>
        </Box>
      )}
      
      {!query && !results.length && (
        <Box 
          sx={{ 
            py: 4,
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
            Intelligent Search
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Search across all your content with AI-powered understanding. Try searching for:
          </Typography>
          <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" justifyContent="center">
            <Chip 
              label="Budget change requests" 
              onClick={() => setQuery('Budget change requests')}
              clickable
            />
            <Chip 
              label="Overdue tasks" 
              onClick={() => setQuery('Overdue tasks')}
              clickable
            />
            <Chip 
              label="Project extensions" 
              onClick={() => setQuery('Project extensions')}
              clickable
            />
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default SearchAssistant; 