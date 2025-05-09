import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ArrowForward as SupportsIcon,
  ArrowBack as SupportedByIcon,
  Link as RelatedToIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { formatDate } from '../utils/helpers';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`goal-dependencies-tabpanel-${index}`}
      aria-labelledby={`goal-dependencies-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// Mock data for goal relationships
interface GoalRelationship {
  id: string;
  sourceGoalId: string;
  sourceGoalName: string;
  targetGoalId: string;
  targetGoalName: string;
  type: 'supportedBy' | 'supports' | 'relatedTo';
  status: 'active' | 'completed';
  description: string;
  createdAt: string;
  updatedAt: string;
  weight: number; // 0-100
}

// Goal interface
interface Goal {
  id: string;
  title: string;
  type: string;
  status: string;
}

const GoalRelationshipsPage: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [supportedByRelationships, setSupportedByRelationships] = useState<GoalRelationship[]>([]);
  const [supportsRelationships, setSupportsRelationships] = useState<GoalRelationship[]>([]);
  const [completedRelationships, setCompletedRelationships] = useState<GoalRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<GoalRelationship | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch goals
      const goalsResponse = await api.goals.getAllGoals('');
      
      if (goalsResponse.success && goalsResponse.data) {
        setGoals(goalsResponse.data);
        
        // Generate mock relationship data based on linkedGoals in the goals
        const allRelationships: GoalRelationship[] = [];
        
        goalsResponse.data.forEach(goal => {
          // Assume each goal has linkedGoals array
          if (goal.linkedGoals && goal.linkedGoals.length > 0) {
            goal.linkedGoals.forEach(link => {
              const targetGoal = goalsResponse.data.find(g => g.id === link.goalId);
              
              if (targetGoal) {
                // Create a relation
                const now = new Date();
                const createdDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
                
                allRelationships.push({
                  id: `rel-${goal.id}-${link.goalId}`,
                  sourceGoalId: goal.id,
                  sourceGoalName: goal.title,
                  targetGoalId: link.goalId,
                  targetGoalName: targetGoal.title,
                  type: Math.random() > 0.6 ? 'supports' : (Math.random() > 0.5 ? 'supportedBy' : 'relatedTo'),
                  status: goal.status === 'COMPLETED' && targetGoal.status === 'COMPLETED' ? 'completed' : 'active',
                  description: `This ${goal.title} goal is related to ${targetGoal.title} goal with a weight of ${link.weight}%.`,
                  createdAt: createdDate.toISOString(),
                  updatedAt: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                  weight: link.weight
                });
              }
            });
          }
        });
        
        // Filter relationships by type and status
        setSupportedByRelationships(allRelationships.filter(rel => rel.type === 'supportedBy' && rel.status === 'active'));
        setSupportsRelationships(allRelationships.filter(rel => rel.type === 'supports' && rel.status === 'active'));
        setCompletedRelationships(allRelationships.filter(rel => rel.status === 'completed'));
      } else {
        setError('Failed to fetch goals');
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDetailsDialog = (relationship: GoalRelationship) => {
    setSelectedRelationship(relationship);
    setDetailsDialogOpen(true);
  };

  const handleCloseDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setSelectedRelationship(null);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'supportedBy':
        return t('goals.supportedBy', 'Supported By');
      case 'supports':
        return t('goals.supports', 'Supports');
      case 'relatedTo':
        return t('goals.relatedTo', 'Related To');
      default:
        return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supportedBy':
        return <SupportedByIcon fontSize="small" />;
      case 'supports':
        return <SupportsIcon fontSize="small" />;
      case 'relatedTo':
        return <RelatedToIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('goals.active', 'Active');
      case 'completed':
        return t('goals.completed', 'Completed');
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 75) return t('goals.highImpact', 'High');
    if (weight >= 40) return t('goals.mediumImpact', 'Medium');
    return t('goals.lowImpact', 'Low');
  };

  const getWeightColor = (weight: number) => {
    if (weight >= 75) return 'error';
    if (weight >= 40) return 'warning';
    return 'info';
  };

  const renderRelationshipsTable = (items: GoalRelationship[]) => {
    if (items.length === 0) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="textSecondary">
            {t('goals.noRelationshipsFound', 'No goal relationships found in this category.')}
          </Typography>
        </Paper>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('goals.sourceGoal')}</TableCell>
              <TableCell>{t('goals.relationship')}</TableCell>
              <TableCell>{t('goals.targetGoal')}</TableCell>
              <TableCell>{t('goals.weight')}</TableCell>
              <TableCell>{t('goals.status')}</TableCell>
              <TableCell align="right">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.sourceGoalName}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(item.type)}
                    <Typography variant="body2">
                      {getTypeLabel(item.type)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{item.targetGoalName}</TableCell>
                <TableCell>
                  <Chip 
                    label={`${item.weight}% (${getWeightLabel(item.weight)})`}
                    color={getWeightColor(item.weight) as any}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(item.status)} 
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    onClick={() => handleOpenDetailsDialog(item)}
                  >
                    {t('common.details')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('goals.relationshipsTitle', 'Goal Relationships')}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <RefreshIcon />}
            </IconButton>
          </Box>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={t('goals.supportedBy', 'Supported By')} />
            <Tab label={t('goals.supports', 'Supports')} />
            <Tab label={t('goals.completed', 'Completed')} />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRelationshipsTable(supportedByRelationships)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRelationshipsTable(supportsRelationships)
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            renderRelationshipsTable(completedRelationships)
          )}
        </TabPanel>
      </Box>
      
      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={handleCloseDetailsDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('goals.relationshipDetails', 'Goal Relationship Details')}
          <IconButton
            aria-label="close"
            onClick={handleCloseDetailsDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRelationship && (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.relationship', 'Relationship')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedRelationship.sourceGoalName}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mx: 2 }}>
                      {getTypeIcon(selectedRelationship.type)}
                      <Typography variant="body2" sx={{ mx: 1 }}>
                        {getTypeLabel(selectedRelationship.type)}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedRelationship.targetGoalName}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.status')}
                  </Typography>
                  <Chip 
                    label={getStatusLabel(selectedRelationship.status)} 
                    color={getStatusColor(selectedRelationship.status) as any}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.weight')}
                  </Typography>
                  <Chip 
                    label={`${selectedRelationship.weight}% (${getWeightLabel(selectedRelationship.weight)})`}
                    color={getWeightColor(selectedRelationship.weight) as any}
                    size="small"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.description')}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ mt: 1 }}>
                    {selectedRelationship.description}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.created')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(selectedRelationship.createdAt)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('goals.updated')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {formatDate(selectedRelationship.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailsDialog}>
            {t('common.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GoalRelationshipsPage; 