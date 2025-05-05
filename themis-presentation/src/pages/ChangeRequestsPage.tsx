import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  Button,
  LinearProgress,
  useTheme, 
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from '../types/change-request';
import ChangeRequestListItem from '../components/ChangeRequests/ChangeRequestListItem';
import { useAuth } from '../context/AuthContext';
import apiRoutes from '../services/api';

const ChangeRequestsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // In a real implementation, this would likely fetch from a backend endpoint
      // that returns all change requests the user can access
      const response = await apiRoutes.changeRequests.getAllChangeRequests(token);
      setChangeRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Error fetching change requests:', error);
      setError('Failed to load change requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  useEffect(() => {
    let result = [...changeRequests];
    
    // Filter by tab (status)
    if (tabValue === 0) {
      // All requests
    } else if (tabValue === 1) {
      result = result.filter(cr => cr.status === ChangeRequestStatus.PENDING);
    } else if (tabValue === 2) {
      result = result.filter(cr => cr.status === ChangeRequestStatus.APPROVED);
    } else if (tabValue === 3) {
      result = result.filter(cr => cr.status === ChangeRequestStatus.REJECTED);
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      result = result.filter(cr => cr.projectId === projectFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(cr => cr.type === typeFilter);
    }
    
    setFilteredRequests(result);
  }, [changeRequests, tabValue, projectFilter, typeFilter]);

  const handleChangeTab = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProjectFilterChange = (event: SelectChangeEvent) => {
    setProjectFilter(event.target.value);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  const handleViewChangeRequest = (id: string) => {
    navigate(`/change-requests/${id}`);
  };

  const handleCreateChangeRequest = () => {
    navigate('/change-requests/new');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('changeRequest.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateChangeRequest}
        >
          {t('changeRequest.add')}
        </Button>
      </Box>

      {loading && <LinearProgress />}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="project-filter-label">{t('project.title')}</InputLabel>
            <Select
              labelId="project-filter-label"
              id="project-filter"
              value={projectFilter}
              onChange={handleProjectFilterChange}
              label={t('project.title')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              {/* In a real app, we would map through available projects */}
              <MenuItem value="project1">Project 1</MenuItem>
              <MenuItem value="project2">Project 2</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth variant="outlined" size="small">
            <InputLabel id="type-filter-label">{t('changeRequest.type')}</InputLabel>
            <Select
              labelId="type-filter-label"
              id="type-filter"
              value={typeFilter}
              onChange={handleTypeFilterChange}
              label={t('changeRequest.type')}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value={ChangeRequestType.SCHEDULE}>{t('changeRequest.schedule')}</MenuItem>
              <MenuItem value={ChangeRequestType.BUDGET}>{t('changeRequest.budget')}</MenuItem>
              <MenuItem value={ChangeRequestType.SCOPE}>{t('changeRequest.scope')}</MenuItem>
              <MenuItem value={ChangeRequestType.RESOURCE}>{t('changeRequest.resource')}</MenuItem>
              <MenuItem value={ChangeRequestType.CLOSURE}>{t('changeRequest.closure')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleChangeTab}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label={t('common.all')} />
          <Tab label={t('changeRequest.pending')} />
          <Tab label={t('changeRequest.approved')} />
          <Tab label={t('changeRequest.rejected')} />
        </Tabs>

        {!loading && filteredRequests.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body1" color="textSecondary">
              {t('changeRequest.noChangeRequests')}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredRequests.map((changeRequest) => (
              <ChangeRequestListItem
                key={changeRequest.id}
                changeRequest={changeRequest}
                onClick={handleViewChangeRequest}
              />
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default ChangeRequestsPage; 