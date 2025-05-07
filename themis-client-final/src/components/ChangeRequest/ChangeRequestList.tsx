import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  TablePagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import BuildIcon from '@mui/icons-material/Build';
import CloseIcon from '@mui/icons-material/Close';

import { useAuth } from '../../context/AuthContext';
import { ChangeRequest, ChangeRequestStatus, ChangeRequestType } from '../../types/change-request';
import { UserRole } from '../../types';
import changeRequestService from '../../services/change-request';
import { formatDate } from '../../utils/formatters';
import { isFromSameDepartment } from '../../context/AuthContext';

const ChangeRequestList: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  useEffect(() => {
    const fetchChangeRequests = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        let response;
        
        // Fetch change requests based on user role
        if (currentUser.role === UserRole.SUB_PMO && currentUser.department?.id) {
          // Sub PMO only sees requests from their department
          response = await changeRequestService.getPendingChangeRequests(UserRole.SUB_PMO, currentUser.department.id);
        } else if (currentUser.role === UserRole.MAIN_PMO) {
          // Main PMO sees requests from all departments that were approved by Sub PMO
          response = await changeRequestService.getPendingChangeRequests(UserRole.MAIN_PMO, '');
        } else if (currentUser.role === UserRole.ADMIN) {
          // Admin sees all requests
          response = await changeRequestService.getAllChangeRequests();
        } else {
          // Project Manager or other roles see their own requests
          response = await changeRequestService.getAllChangeRequests();
        }
        
        if (response.success && response.data) {
          setChangeRequests(response.data);
        } else {
          setError('Failed to load change requests');
        }
      } catch (err) {
        setError('An error occurred while fetching change requests');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChangeRequests();
  }, [currentUser]);
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const getStatusChipColor = (status: ChangeRequestStatus) => {
    switch (status) {
      case ChangeRequestStatus.DRAFT:
        return 'default';
      case ChangeRequestStatus.PENDING_SUB_PMO:
      case ChangeRequestStatus.PENDING_MAIN_PMO:
        return 'warning';
      case ChangeRequestStatus.APPROVED_BY_SUB_PMO:
        return 'info';
      case ChangeRequestStatus.APPROVED:
        return 'success';
      case ChangeRequestStatus.REJECTED:
      case ChangeRequestStatus.REJECTED_BY_SUB_PMO:
        return 'error';
      case ChangeRequestStatus.CHANGES_REQUESTED:
        return 'secondary';
      default:
        return 'default';
    }
  };
  
  const getChangeTypeIcon = (type: ChangeRequestType | string) => {
    switch (type) {
      case ChangeRequestType.SCHEDULE:
        return <AccessTimeIcon />;
      case ChangeRequestType.BUDGET:
        return <AttachMoneyIcon />;
      case ChangeRequestType.SCOPE:
        return <CategoryIcon />;
      case ChangeRequestType.RESOURCE:
        return <PersonIcon />;
      case ChangeRequestType.STATUS:
        return <EventNoteIcon />;
      case ChangeRequestType.CLOSURE:
        return <CloseIcon />;
      default:
        return <BuildIcon />;
    }
  };
  
  const canReview = (changeRequest: ChangeRequest) => {
    if (!currentUser) return false;
    
    const sameDepartment = isFromSameDepartment(currentUser, changeRequest.department?.id);
    
    if (changeRequest.status === ChangeRequestStatus.PENDING_SUB_PMO) {
      return (currentUser.role === UserRole.SUB_PMO && sameDepartment) || 
             currentUser.role === UserRole.MAIN_PMO || 
             currentUser.role === UserRole.ADMIN;
    }
    
    if (changeRequest.status === ChangeRequestStatus.PENDING_MAIN_PMO) {
      return currentUser.role === UserRole.MAIN_PMO || currentUser.role === UserRole.ADMIN;
    }
    
    return false;
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  if (changeRequests.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h5" align="center" py={5}>
          No change requests found.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom display="flex" alignItems="center">
        <BuildIcon sx={{ mr: 1 }} /> Change Requests
      </Typography>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Project ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Requested By</TableCell>
                  <TableCell>Requested On</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {changeRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((changeRequest) => (
                    <TableRow key={changeRequest.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          {getChangeTypeIcon(changeRequest.type)}
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {changeRequest.type}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{changeRequest.projectId}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: 250,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {changeRequest.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{changeRequest.department?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {changeRequest.requestedBy ?
                          `${changeRequest.requestedBy.firstName} ${changeRequest.requestedBy.lastName}` :
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        {changeRequest.requestedAt ? formatDate(new Date(changeRequest.requestedAt)) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={changeRequest.status}
                          color={getStatusChipColor(changeRequest.status) as any}
                          size="small"
                          icon={
                            changeRequest.status === ChangeRequestStatus.APPROVED ? <CheckCircleIcon /> :
                            (changeRequest.status === ChangeRequestStatus.REJECTED || 
                             changeRequest.status === ChangeRequestStatus.REJECTED_BY_SUB_PMO) ? <ErrorIcon /> :
                            undefined
                          }
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => navigate(`/change-requests/${changeRequest.id}`)}
                          title="View details"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        
                        {canReview(changeRequest) && (
                          <Button 
                            variant="contained" 
                            size="small" 
                            color="primary" 
                            onClick={() => navigate(`/change-requests/${changeRequest.id}/review`)}
                            sx={{ ml: 1 }}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={changeRequests.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ChangeRequestList; 