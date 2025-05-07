import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Toolbar,
  InputAdornment,
  SelectChangeEvent,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Container,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  VerifiedUser as VerifiedUserIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  RestartAlt as ResetIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { useTranslation } from 'react-i18next';
import { AuditAction, AuditLog, fetchAuditLogsWithFilters, getAuditActionDescription, getEntityTypeName } from '../utils/auditLogUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';

// Simple Grid wrapper components
const GridContainer = (props: any) => (
  <Grid container spacing={props.spacing || 2} {...props}>
    {props.children}
  </Grid>
);

const GridItem = (props: any) => (
  <Grid item xs={props.xs || 12} sm={props.sm} md={props.md} lg={props.lg} xl={props.xl} {...props}>
    {props.children}
  </Grid>
);

// Simple PageHeader component
const PageHeader: React.FC<{ title: string }> = ({ title }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h4" component="h1">
      {title}
    </Typography>
  </Box>
);

const AuditLogPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)); // 30 days ago
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [userFilter, setUserFilter] = useState<string>('all');
  const [users, setUsers] = useState<any[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [statsData, setStatsData] = useState({
    total: 0,
    byAction: {} as Record<string, number>,
    byEntity: {} as Record<string, number>,
    byUser: {} as Record<string, number>
  });

  // All users should have access to the audit logs page, but with different visibility
  // Each role has different level of access:
  // - PROJECT_MANAGER can see only logs related to their projects
  // - DEPARTMENT_DIRECTOR & SUB_PMO can see logs for their department
  // - MAIN_PMO & EXECUTIVE can see all logs
  // - ADMIN can see all logs
  const hasPermission = user && [
    UserRole.ADMIN,
    UserRole.EXECUTIVE,
    UserRole.MAIN_PMO,
    UserRole.SUB_PMO,
    UserRole.PROJECT_MANAGER,
    UserRole.DEPARTMENT_DIRECTOR
  ].includes(user.role as UserRole);

  // Page title based on user role
  const getPageTitle = () => {
    if (!user) return t('auditLogs.title', 'Audit Logs');
    
    switch (user.role) {
      case UserRole.PROJECT_MANAGER:
        return t('auditLogs.projectManagerTitle', 'My Projects Audit Logs');
      case UserRole.SUB_PMO:
      case UserRole.DEPARTMENT_DIRECTOR:
        return t('auditLogs.departmentTitle', 'Department Audit Logs');
      case UserRole.MAIN_PMO:
      case UserRole.EXECUTIVE:
        return t('auditLogs.allTitle', 'Organization Audit Logs');
      default:
        return t('auditLogs.title', 'Audit Logs');
    }
  };

  useEffect(() => {
    if (hasPermission && token) {
      fetchLogs();
    }
  }, [token, hasPermission]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, fetch all logs 
      const response = await api.auditLogs.getAuditLogs(token || '');
      
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch audit logs');
      }
      
      let fetchedLogs = response.data;
      
      // Filter logs based on user role
      if (user) {
        if (user.role === UserRole.PROJECT_MANAGER) {
          // Project managers can only see logs related to their projects
          const userProjects = await api.projects.getProjectsByManagerId(user.id, token || '');
          
          if (userProjects.success && userProjects.data) {
            const projectIds = userProjects.data.map((project: any) => project.id);
            fetchedLogs = fetchedLogs.filter((log: any) => 
              projectIds.includes(log.projectId) || // Project is managed by the user
              (log.userId === user.id) // User created the log
            );
          } else {
            // If couldn't get projects, at least show logs created by the user
            fetchedLogs = fetchedLogs.filter((log: any) => log.userId === user.id);
          }
        } else if (user.role === UserRole.SUB_PMO || user.role === UserRole.DEPARTMENT_DIRECTOR) {
          // Department directors and Sub PMOs can see logs for their department
          if (user.department) {
            const departmentProjects = await api.projects.getProjectsByDepartment(
              user.department.id, 
              token || ''
            );
            
            if (departmentProjects.success && departmentProjects.data) {
              const projectIds = departmentProjects.data.map((project: any) => project.id);
              fetchedLogs = fetchedLogs.filter((log: any) => 
                projectIds.includes(log.projectId) || // Project is in user's department
                (log.departmentId && log.departmentId === user.department.id) || // Log is for user's department
                (log.userId === user.id) // User created the log
              );
            }
          }
        }
        // EXECUTIVE, MAIN_PMO, and ADMIN see all logs (no additional filtering)
      }

      setLogs(fetchedLogs);
      setFilteredLogs(fetchedLogs);

      // Extract unique users, entity types, and action types for filters
      const uniqueUsers = Array.from(new Set(fetchedLogs.map((log: any) => log.userId || (log.user && log.user.id))));
      const uniqueEntityTypes = Array.from(new Set(fetchedLogs.map((log: any) => log.entityType)));
      const uniqueActionTypes = Array.from(new Set(fetchedLogs.map((log: any) => log.action)));

      setUsers(uniqueUsers.map((userId: string) => {
        const log = fetchedLogs.find((l: any) => (l.userId || (l.user && l.user.id)) === userId);
        let name = userId;
        
        if (log) {
          if (log.username) {
            name = log.username;
          } else if (log.user) {
            name = `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || userId;
          }
        }
        
        return {
          id: userId,
          name: name
        };
      }));
      
      // Use type assertions to handle the unknown type
      const safeEntityTypes = uniqueEntityTypes.filter(
        (item): item is string => typeof item === 'string'
      );
      setEntityTypes(safeEntityTypes);
      
      const safeActionTypes = uniqueActionTypes.filter(
        (item): item is string => typeof item === 'string'
      );
      setActionTypes(safeActionTypes);

      // Calculate statistics
      const stats = {
        total: fetchedLogs.length,
        byAction: {} as Record<string, number>,
        byEntity: {} as Record<string, number>,
        byUser: {} as Record<string, number>
      };

      fetchedLogs.forEach((log: any) => {
        // Count by action
        if (stats.byAction[log.action]) {
          stats.byAction[log.action]++;
        } else {
          stats.byAction[log.action] = 1;
        }

        // Count by entity
        if (stats.byEntity[log.entityType]) {
          stats.byEntity[log.entityType]++;
        } else {
          stats.byEntity[log.entityType] = 1;
        }

        // Count by user
        const userId = log.userId || (log.user && log.user.id) || 'unknown';
        if (stats.byUser[userId]) {
          stats.byUser[userId]++;
        } else {
          stats.byUser[userId] = 1;
        }
      });

      setStatsData(stats);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, actionFilter, entityTypeFilter, userFilter, startDate, endDate, logs]);

  const applyFilters = () => {
    let result = [...logs];

    // Filter by date range
    if (startDate && endDate) {
      result = result.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    }

    // Filter by action
    if (actionFilter !== 'all') {
      result = result.filter(log => log.action === actionFilter);
    }

    // Filter by entity type
    if (entityTypeFilter !== 'all') {
      result = result.filter(log => log.entityType === entityTypeFilter);
    }

    // Filter by user
    if (userFilter !== 'all') {
      result = result.filter(log => log.userId === userFilter);
    }

    // Search query (search across all fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log =>
        log.action.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query) ||
        log.entityId.toLowerCase().includes(query) ||
        log.username.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(result);
    setPage(0); // Reset to first page when filters change
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleActionFilterChange = (event: SelectChangeEvent) => {
    setActionFilter(event.target.value);
  };

  const handleEntityTypeFilterChange = (event: SelectChangeEvent) => {
    setEntityTypeFilter(event.target.value);
  };

  const handleUserFilterChange = (event: SelectChangeEvent) => {
    setUserFilter(event.target.value);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setActionFilter('all');
    setEntityTypeFilter('all');
    setUserFilter('all');
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
  };

  const exportToCSV = () => {
    // Convert logs to CSV
    const headers = ['Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.username,
        log.action,
        log.entityType,
        log.entityId,
        `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in details
        log.ipAddress
      ].join(','))
    ];

    // Create and download the CSV file
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionChipColor = (action: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (action.includes('CREATE') || action.includes('_created')) return 'success';
    if (action.includes('UPDATE') || action.includes('_updated')) return 'info';
    if (action.includes('DELETE') || action.includes('_deleted')) return 'error';
    if (action.includes('APPROVE') || action.includes('_approved')) return 'success';
    if (action.includes('REJECT') || action.includes('_rejected')) return 'error';
    if (action.includes('LOGIN')) return 'primary';
    if (action.includes('LOGOUT')) return 'secondary';
    if (action.includes('ERROR') || action.includes('_error')) return 'error';
    return 'default';
  };

  if (!hasPermission) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">{t('common.accessDenied')}</Typography>
          <Typography>{t('common.noPermission')}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader title={getPageTitle()} />
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedUserIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              {t('auditLogs.title', 'System Audit Logs')}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
              disabled={loading || filteredLogs.length === 0}
              sx={{ mr: 1 }}
            >
              {t('common.export', 'Export')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ResetIcon />}
              onClick={resetFilters}
              disabled={loading}
            >
              {t('common.resetFilters', 'Reset Filters')}
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
        <GridContainer spacing={2} sx={{ mb: 3 }}>
          <GridItem xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {t('auditLogs.totalEvents', 'Total Events')}
                </Typography>
                <Typography variant="h4">{statsData.total}</Typography>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {t('auditLogs.mostFrequentAction', 'Most Frequent Action')}
                </Typography>
                {Object.keys(statsData.byAction).length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={getAuditActionDescription(
                        Object.entries(statsData.byAction)
                          .sort((a, b) => b[1] - a[1])[0][0] as AuditAction
                      )} 
                      color={getActionChipColor(
                        Object.entries(statsData.byAction)
                          .sort((a, b) => b[1] - a[1])[0][0]
                      ) as any}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography>
                      {Object.entries(statsData.byAction)
                        .sort((a, b) => b[1] - a[1])[0][1]}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">No data</Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {t('auditLogs.mostActiveEntity', 'Most Active Entity')}
                </Typography>
                {Object.keys(statsData.byEntity).length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>
                      {getEntityTypeName(
                        Object.entries(statsData.byEntity)
                          .sort((a, b) => b[1] - a[1])[0][0]
                      )}:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>
                      {Object.entries(statsData.byEntity)
                        .sort((a, b) => b[1] - a[1])[0][1]}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">No data</Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
          <GridItem xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {t('auditLogs.mostActiveUser', 'Most Active User')}
                </Typography>
                {Object.keys(statsData.byUser).length > 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>
                      {users.find(
                        u => u.id === Object.entries(statsData.byUser)
                          .sort((a, b) => b[1] - a[1])[0][0]
                      )?.name || 'Unknown'}:
                    </Typography>
                    <Typography sx={{ ml: 1 }}>
                      {Object.entries(statsData.byUser)
                        .sort((a, b) => b[1] - a[1])[0][1]}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2">No data</Typography>
                )}
              </CardContent>
            </Card>
          </GridItem>
        </GridContainer>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t('common.filters', 'Filters')}
          </Typography>
          <GridContainer spacing={2}>
            <GridItem xs={12} sm={6} md={3}>
              <TextField
                label={t('common.search', 'Search')}
                fullWidth
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </GridItem>
            <GridItem xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('auditLogs.action', 'Action')}</InputLabel>
                <Select
                  value={actionFilter}
                  label={t('auditLogs.action', 'Action')}
                  onChange={handleActionFilterChange}
                >
                  <MenuItem value="all">{t('common.all', 'All')}</MenuItem>
                  {actionTypes.map((action) => (
                    <MenuItem key={action} value={action}>
                      {getAuditActionDescription(action as AuditAction)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('auditLogs.entityType', 'Entity Type')}</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label={t('auditLogs.entityType', 'Entity Type')}
                  onChange={handleEntityTypeFilterChange}
                >
                  <MenuItem value="all">{t('common.all', 'All')}</MenuItem>
                  {entityTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {getEntityTypeName(type)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>{t('auditLogs.user', 'User')}</InputLabel>
                <Select
                  value={userFilter}
                  label={t('auditLogs.user', 'User')}
                  onChange={handleUserFilterChange}
                >
                  <MenuItem value="all">{t('common.all', 'All')}</MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('auditLogs.startDate', 'Start Date')}
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </GridItem>
            <GridItem xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('auditLogs.endDate', 'End Date')}
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </GridItem>
          </GridContainer>
        </Paper>

        {/* Logs Table */}
        <Paper>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  {t('auditLogs.showing', 'Showing')}{' '}
                  <strong>{filteredLogs.length}</strong>{' '}
                  {t('auditLogs.outOf', 'out of')}{' '}
                  <strong>{logs.length}</strong>{' '}
                  {t('auditLogs.events', 'events')}
                </Typography>
              </Box>
              <Divider />
              <TableContainer>
                <Table sx={{ minWidth: 650 }} aria-label="audit logs table">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('auditLogs.timestamp', 'Timestamp')}</TableCell>
                      <TableCell>{t('auditLogs.user', 'User')}</TableCell>
                      <TableCell>{t('auditLogs.action', 'Action')}</TableCell>
                      <TableCell>{t('auditLogs.entityType', 'Entity Type')}</TableCell>
                      <TableCell>{t('auditLogs.entityId', 'Entity ID')}</TableCell>
                      <TableCell>{t('auditLogs.details', 'Details')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                  {log.username.charAt(0)}
                                </Avatar>
                                {log.username}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={getAuditActionDescription(log.action as AuditAction)}
                                size="small"
                                color={getActionChipColor(log.action) as any}
                              />
                            </TableCell>
                            <TableCell>{getEntityTypeName(log.entityType)}</TableCell>
                            <TableCell>{log.entityId}</TableCell>
                            <TableCell>{log.details}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Box sx={{ py: 3 }}>
                            <Typography variant="body1" gutterBottom>
                              {t('auditLogs.noLogsFound', 'No logs found')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {t('auditLogs.tryChangingFilters', 'Try changing your filters to see more results')}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredLogs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default AuditLogPage; 