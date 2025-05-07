import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  Card, 
  CardContent,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tab,
  Tabs,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
  AssignmentTurnedIn as AssignmentIcon,
  Description as DocumentIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { Project, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

// Define interfaces for our closure request data
interface ClosureRequestFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface ClosureRequestComment {
  id: string;
  text: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface ClosureRequestApprover {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  reviewedAt?: string;
}

interface ClosureRequest {
  id: string;
  projectId: string;
  requestType: string;
  requestReason: string;
  description: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  requestDate: string;
  status: string;
  approvers: ClosureRequestApprover[];
  comments: ClosureRequestComment[];
  attachments: ClosureRequestFile[];
}

interface ProjectClosureApprovalProps {
  project: Project;
  onApprove: (requestId: string, comments: string) => Promise<void>;
  onReject: (requestId: string, comments: string) => Promise<void>;
  onAddComment: (requestId: string, comment: string) => Promise<void>;
  refreshProject: () => void;
}

const ProjectClosureApproval: React.FC<ProjectClosureApprovalProps> = ({
  project,
  onApprove,
  onReject,
  onAddComment,
  refreshProject
}) => {
  const { user } = useAuth();
  const [closureRequests, setClosureRequests] = useState<ClosureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ClosureRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionComment, setRejectionComment] = useState('');
  const [generalComment, setGeneralComment] = useState('');
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch closure requests
  useEffect(() => {
    const fetchClosureRequests = () => {
      try {
        setLoading(true);
        setError(null);

        // Get requests from localStorage
        const closureRequestsKey = `project_${project.id}_closure_requests`;
        const requestsJson = localStorage.getItem(closureRequestsKey);
        
        if (requestsJson) {
          const requests = JSON.parse(requestsJson) as ClosureRequest[];
          setClosureRequests(requests);
          
          // If there's at least one request, select it
          if (requests.length > 0) {
            setSelectedRequest(requests[0]);
          }
        } else {
          setClosureRequests([]);
        }
      } catch (err) {
        console.error('Error fetching closure requests:', err);
        setError('Failed to load closure requests');
      } finally {
        setLoading(false);
      }
    };

    fetchClosureRequests();
  }, [project.id]);

  // Check if user can approve requests
  const canApprove = () => {
    if (!user || !selectedRequest) return false;
    
    // Only SUB_PMO and MAIN_PMO can approve
    if (user.role !== UserRole.SUB_PMO && user.role !== UserRole.MAIN_PMO && user.role !== UserRole.ADMIN) {
      return false;
    }
    
    // Check if this user is in the approvers list and pending
    const approver = selectedRequest.approvers.find(a => a.id === user.id);
    if (approver && approver.status === 'PENDING') {
      return true;
    }
    
    // If there are no approvers yet, SUB_PMO can approve
    if (selectedRequest.approvers.length === 0 && (user.role === UserRole.SUB_PMO || user.role === UserRole.ADMIN)) {
      return true;
    }
    
    // If SUB_PMO has approved, MAIN_PMO can approve next
    const subPmoApproved = selectedRequest.approvers.some(
      a => (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && a.status === 'APPROVED'
    );
    
    if (subPmoApproved && (user.role === UserRole.MAIN_PMO || user.role === UserRole.ADMIN)) {
      return true;
    }
    
    return false;
  };

  // Handle approve action
  const handleApprove = async () => {
    if (!selectedRequest || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the parent's onApprove function
      await onApprove(selectedRequest.id, approvalComment);
      
      // Update local state
      const updatedRequests = closureRequests.map(req => {
        if (req.id === selectedRequest.id) {
          // Find if the user is already an approver
          const existingApproverIndex = req.approvers.findIndex(a => a.id === user.id);
          
          let newApprovers = [...req.approvers];
          const newApprover: ClosureRequestApprover = {
            id: user.id || 'system',
            role: user.role || UserRole.ADMIN,
            firstName: user.firstName || 'System',
            lastName: user.lastName || 'User',
            status: 'APPROVED',
            comments: approvalComment,
            reviewedAt: new Date().toISOString()
          };
          
          if (existingApproverIndex >= 0) {
            // Update existing approver
            newApprovers[existingApproverIndex] = newApprover;
          } else {
            // Add new approver
            newApprovers = [...newApprovers, newApprover];
          }
          
          // Determine if all required approvers have approved
          const hasSubPmoApproval = newApprovers.some(
            a => (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && a.status === 'APPROVED'
          );
          
          const hasMainPmoApproval = newApprovers.some(
            a => (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && a.status === 'APPROVED'
          );
          
          // If both levels have approved, mark as fully approved
          const newStatus = (hasSubPmoApproval && hasMainPmoApproval) ? 'APPROVED' : 'PENDING';
          
          return {
            ...req,
            approvers: newApprovers,
            status: newStatus,
            // Add a comment about the approval
            comments: [
              {
                id: `comment-${Date.now()}`,
                text: `Request ${newStatus === 'APPROVED' ? 'fully approved' : 'approved by ' + user.role}. ${approvalComment ? `Comment: ${approvalComment}` : ''}`,
                author: {
                  id: user.id || 'system',
                  firstName: user.firstName || 'System',
                  lastName: user.lastName || 'User'
                },
                createdAt: new Date().toISOString()
              },
              ...req.comments
            ]
          };
        }
        return req;
      });
      
      // Update localStorage
      const closureRequestsKey = `project_${project.id}_closure_requests`;
      localStorage.setItem(closureRequestsKey, JSON.stringify(updatedRequests));
      
      // Update state
      setClosureRequests(updatedRequests);
      setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id) || null);
      
      // If the request is now fully approved, update the project status
      const approvedRequest = updatedRequests.find(r => r.id === selectedRequest.id);
      if (approvedRequest && approvedRequest.status === 'APPROVED') {
        // Trigger a project status update
        refreshProject();
      }
      
      // Reset and close dialog
      setApprovalComment('');
      setIsApproveDialogOpen(false);
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!selectedRequest || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Call the parent's onReject function
      await onReject(selectedRequest.id, rejectionComment);
      
      // Update local state
      const updatedRequests = closureRequests.map(req => {
        if (req.id === selectedRequest.id) {
          // Find if the user is already an approver
          const existingApproverIndex = req.approvers.findIndex(a => a.id === user.id);
          
          let newApprovers = [...req.approvers];
          const newApprover: ClosureRequestApprover = {
            id: user.id || 'system',
            role: user.role || UserRole.ADMIN,
            firstName: user.firstName || 'System',
            lastName: user.lastName || 'User',
            status: 'REJECTED',
            comments: rejectionComment,
            reviewedAt: new Date().toISOString()
          };
          
          if (existingApproverIndex >= 0) {
            // Update existing approver
            newApprovers[existingApproverIndex] = newApprover;
          } else {
            // Add new approver
            newApprovers = [...newApprovers, newApprover];
          }
          
          return {
            ...req,
            approvers: newApprovers,
            status: 'REJECTED',
            // Add a comment about the rejection
            comments: [
              {
                id: `comment-${Date.now()}`,
                text: `Request rejected by ${user.role}. ${rejectionComment ? `Reason: ${rejectionComment}` : ''}`,
                author: {
                  id: user.id || 'system',
                  firstName: user.firstName || 'System',
                  lastName: user.lastName || 'User'
                },
                createdAt: new Date().toISOString()
              },
              ...req.comments
            ]
          };
        }
        return req;
      });
      
      // Update localStorage
      const closureRequestsKey = `project_${project.id}_closure_requests`;
      localStorage.setItem(closureRequestsKey, JSON.stringify(updatedRequests));
      
      // Update state
      setClosureRequests(updatedRequests);
      setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id) || null);
      
      // Reset and close dialog
      setRejectionComment('');
      setIsRejectDialogOpen(false);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle comment submission
  const handleAddComment = async () => {
    if (!selectedRequest || !generalComment.trim() || !user) return;
    
    try {
      // Call the parent's onAddComment function
      await onAddComment(selectedRequest.id, generalComment);
      
      // Update local state
      const updatedRequests = closureRequests.map(req => {
        if (req.id === selectedRequest.id) {
          return {
            ...req,
            comments: [
              {
                id: `comment-${Date.now()}`,
                text: generalComment,
                author: {
                  id: user.id || 'system',
                  firstName: user.firstName || 'System',
                  lastName: user.lastName || 'User'
                },
                createdAt: new Date().toISOString()
              },
              ...req.comments
            ]
          };
        }
        return req;
      });
      
      // Update localStorage
      const closureRequestsKey = `project_${project.id}_closure_requests`;
      localStorage.setItem(closureRequestsKey, JSON.stringify(updatedRequests));
      
      // Update state
      setClosureRequests(updatedRequests);
      setSelectedRequest(updatedRequests.find(r => r.id === selectedRequest.id) || null);
      
      // Reset comment
      setGeneralComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status chip color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading closure requests...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (closureRequests.length === 0) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Project Closure Approval</Typography>
        <Alert severity="info">
          No closure requests have been submitted for this project yet.
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ mb: 3 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Project Closure Approval</Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Closure Requests</Typography>
              <List>
                {closureRequests.map((request) => (
                  <ListItem 
                    key={request.id}
                    button
                    selected={selectedRequest?.id === request.id}
                    onClick={() => setSelectedRequest(request)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon>
                      <AssignmentIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Request from ${request.requestedBy.firstName} ${request.requestedBy.lastName}`} 
                      secondary={formatDate(request.requestDate)}
                    />
                    <Chip 
                      label={request.status} 
                      size="small" 
                      color={getStatusColor(request.status) as any}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            {selectedRequest && (
              <Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs value={tabValue} onChange={handleTabChange}>
                    <Tab label="Details" />
                    <Tab label="Comments" />
                    <Tab label="Approvals" />
                    <Tab label="Attachments" />
                  </Tabs>
                </Box>
                
                {/* Request Details Tab */}
                <Box hidden={tabValue !== 0}>
                  {tabValue === 0 && (
                    <Box>
                      <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Closure Request Details</Typography>
                            <Chip 
                              label={selectedRequest.status}
                              color={getStatusColor(selectedRequest.status) as any}
                            />
                          </Box>
                          
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Requested By
                              </Typography>
                              <Typography>
                                {selectedRequest.requestedBy.firstName} {selectedRequest.requestedBy.lastName}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Request Date
                              </Typography>
                              <Typography>
                                {formatDate(selectedRequest.requestDate)}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Request Reason
                              </Typography>
                              <Typography>
                                {selectedRequest.requestReason.replace(/_/g, ' ')}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Description
                              </Typography>
                              <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                                {selectedRequest.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                      
                      {/* Actions Card */}
                      {canApprove() && selectedRequest.status === 'PENDING' && (
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="h6" gutterBottom>Actions</Typography>
                            <Stack direction="row" spacing={2}>
                              <Button 
                                variant="contained" 
                                color="success" 
                                startIcon={<ApproveIcon />}
                                onClick={() => setIsApproveDialogOpen(true)}
                              >
                                Approve
                              </Button>
                              <Button 
                                variant="contained" 
                                color="error" 
                                startIcon={<RejectIcon />}
                                onClick={() => setIsRejectDialogOpen(true)}
                              >
                                Reject
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      )}
                    </Box>
                  )}
                </Box>
                
                {/* Comments Tab */}
                <Box hidden={tabValue !== 1}>
                  {tabValue === 1 && (
                    <Box>
                      <Box sx={{ mb: 3 }}>
                        <TextField
                          fullWidth
                          label="Add a comment"
                          multiline
                          rows={3}
                          value={generalComment}
                          onChange={(e) => setGeneralComment(e.target.value)}
                        />
                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="contained" 
                            startIcon={<CommentIcon />}
                            onClick={handleAddComment}
                            disabled={!generalComment.trim()}
                          >
                            Add Comment
                          </Button>
                        </Box>
                      </Box>
                      
                      <List>
                        {selectedRequest.comments.length > 0 ? (
                          selectedRequest.comments.map((comment) => (
                            <ListItem key={comment.id} alignItems="flex-start" divider>
                              <ListItemAvatar>
                                <Avatar>
                                  {comment.author.firstName[0]}
                                  {comment.author.lastName[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography>
                                      {comment.author.firstName} {comment.author.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {formatDate(comment.createdAt)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={comment.text}
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="No comments yet." />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  )}
                </Box>
                
                {/* Approvals Tab */}
                <Box hidden={tabValue !== 2}>
                  {tabValue === 2 && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>Approval Status</Typography>
                      
                      <List>
                        {selectedRequest.approvers.length > 0 ? (
                          selectedRequest.approvers.map((approver) => (
                            <ListItem key={approver.id} divider>
                              <ListItemAvatar>
                                <Avatar>
                                  {approver.firstName[0]}
                                  {approver.lastName[0]}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography>
                                      {approver.firstName} {approver.lastName}
                                    </Typography>
                                    <Chip 
                                      label={approver.role} 
                                      size="small"
                                      variant="outlined"
                                    />
                                  </Box>
                                }
                                secondary={
                                  <>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                      <Chip 
                                        label={approver.status}
                                        size="small"
                                        color={getStatusColor(approver.status) as any}
                                      />
                                      {approver.reviewedAt && (
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                          {formatDate(approver.reviewedAt)}
                                        </Typography>
                                      )}
                                    </Box>
                                    {approver.comments && (
                                      <Typography variant="body2" sx={{ mt: 1 }}>
                                        "{approver.comments}"
                                      </Typography>
                                    )}
                                  </>
                                }
                              />
                            </ListItem>
                          ))
                        ) : (
                          <ListItem>
                            <ListItemText primary="No approvals yet." />
                          </ListItem>
                        )}
                      </List>
                      
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Required Approvals</Typography>
                        
                        <List dense>
                          <ListItem>
                            <ListItemIcon><CheckCircle /></ListItemIcon>
                            <ListItemText
                              primary="Sub PMO Approval"
                              secondary={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "Approved" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "Rejected"
                                : "Pending"
                              }
                            />
                            <Chip 
                              label={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "Approved" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "Rejected"
                                : "Pending"
                              }
                              size="small"
                              color={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "success" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.SUB_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "error"
                                : "warning"
                              }
                            />
                          </ListItem>
                          
                          <ListItem>
                            <ListItemIcon><CheckCircle /></ListItemIcon>
                            <ListItemText
                              primary="Main PMO Approval"
                              secondary={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "Approved" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "Rejected"
                                : "Pending"
                              }
                            />
                            <Chip 
                              label={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "Approved" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "Rejected"
                                : "Pending"
                              }
                              size="small"
                              color={
                                selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'APPROVED'
                                ) 
                                ? "success" 
                                : selectedRequest.approvers.some(a => 
                                  (a.role === UserRole.MAIN_PMO || a.role === UserRole.ADMIN) && 
                                  a.status === 'REJECTED'
                                )
                                ? "error"
                                : "warning"
                              }
                            />
                          </ListItem>
                        </List>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Attachments Tab */}
                <Box hidden={tabValue !== 3}>
                  {tabValue === 3 && (
                    <List>
                      {selectedRequest.attachments.length > 0 ? (
                        selectedRequest.attachments.map((file) => (
                          <ListItem 
                            key={file.id} 
                            divider
                            secondaryAction={
                              <IconButton edge="end" onClick={() => window.open(file.url, '_blank')}>
                                <DownloadIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <DocumentIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={file.name}
                              secondary={
                                <>
                                  <Typography variant="body2" component="span">
                                    Uploaded by {file.uploadedBy.firstName} {file.uploadedBy.lastName}
                                  </Typography>
                                  <Typography variant="body2" component="span" sx={{ ml: 2 }}>
                                    {new Date(file.createdAt).toLocaleString()}
                                  </Typography>
                                </>
                              }
                            />
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText primary="No attachments found." />
                        </ListItem>
                      )}
                    </List>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onClose={() => !isSubmitting && setIsApproveDialogOpen(false)}>
        <DialogTitle>Approve Closure Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
            Are you sure you want to approve this closure request?
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Comments (Optional)"
            fullWidth
            multiline
            rows={4}
            value={approvalComment}
            onChange={(e) => setApprovalComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsApproveDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            variant="contained"
            color="success"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <ApproveIcon />}
          >
            {isSubmitting ? 'Approving...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onClose={() => !isSubmitting && setIsRejectDialogOpen(false)}>
        <DialogTitle>Reject Closure Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
            Please provide a reason for rejecting this closure request.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionComment}
            onChange={(e) => setRejectionComment(e.target.value)}
            required
            error={!rejectionComment.trim()}
            helperText={!rejectionComment.trim() ? "Rejection reason is required" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsRejectDialogOpen(false)} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReject}
            variant="contained"
            color="error"
            disabled={isSubmitting || !rejectionComment.trim()}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <RejectIcon />}
          >
            {isSubmitting ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// Function needed for the component
function CheckCircle() {
  return <CheckCircle />;
}

export default ProjectClosureApproval; 