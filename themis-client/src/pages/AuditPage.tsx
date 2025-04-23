import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack
} from '@mui/material';
import { 
  VerifiedUser as VerifiedUserIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CheckCircleOutline as CheckCircleIcon,
  ErrorOutline as WarningIcon,
  Recommend as RecommendIcon 
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { runFullAudit, getAuditRecommendations, AuditResult } from '../utils/auditUtils';

const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission to view this page
  const hasPermission = user?.role === UserRole.ADMIN || user?.role === UserRole.MAIN_PMO;

  const handleRunAudit = async () => {
    if (!hasPermission) return;

    setLoading(true);
    setError(null);

    try {
      // Add a slight delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Run the audit
      const result = runFullAudit();
      setAuditResult(result);
      
      // Get recommendations if there are issues
      if (!result.passed) {
        const recs = getAuditRecommendations(result);
        setRecommendations(recs);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setError('Failed to run audit. Please try again.');
      console.error('Audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Run audit on page load
  useEffect(() => {
    if (hasPermission) {
      handleRunAudit();
    }
  }, []);

  if (!hasPermission) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <VerifiedUserIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
            <Typography variant="h4">Compliance Audit</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRunAudit}
            disabled={loading}
          >
            {loading ? 'Running Audit...' : 'Run Audit'}
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          This tool audits the system for compliance with ClientTerms requirements, including proper role-based approval flows for all change requests.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : auditResult ? (
          <>
            <Card 
              sx={{ 
                mb: 4, 
                borderLeft: 6, 
                borderColor: auditResult.passed ? 'success.main' : 'error.main' 
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {auditResult.passed ? (
                    <CheckCircleIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  ) : (
                    <WarningIcon color="error" sx={{ fontSize: 40, mr: 2 }} />
                  )}
                  <Typography variant="h5">
                    {auditResult.passed 
                      ? 'All systems compliant' 
                      : `${auditResult.issues.length} compliance issues found`
                    }
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  {auditResult.passed 
                    ? 'The system is fully compliant with all ClientTerms requirements.' 
                    : 'The system has compliance issues that need to be addressed.'
                  }
                </Typography>
              </CardContent>
            </Card>

            {!auditResult.passed && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Issues Found
                </Typography>
                <Paper variant="outlined" sx={{ mb: 4 }}>
                  <List>
                    {auditResult.issues.map((issue, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemIcon>
                            <ErrorIcon color="error" />
                          </ListItemIcon>
                          <ListItemText primary={issue} />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>

                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <RecommendIcon sx={{ mr: 1 }} color="primary" />
                  Recommended Actions
                </Typography>
                <Paper variant="outlined">
                  <List>
                    {recommendations.map((rec, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <Divider />}
                        <ListItem>
                          <ListItemIcon>
                            <InfoIcon color="info" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </>
            )}
          </>
        ) : (
          <Alert severity="info">
            No audit results available. Click "Run Audit" to perform a system compliance check.
          </Alert>
        )}
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Audit Details</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          The compliance audit checks the following areas:
        </Typography>
        
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Change Request Approval Flow
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ensures all change requests follow the proper approval workflow based on request type:
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip label="Schedule Extension: Main PMO or Admin approval required" sx={{ m: 0.5 }} />
              <Chip label="Budget Changes: Executive or Admin approval required" sx={{ m: 0.5 }} />
              <Chip label="Scope Changes: Project Manager, Main PMO, or Admin approval required" sx={{ m: 0.5 }} />
              <Chip label="Project Delegation: Main PMO or Admin approval required" sx={{ m: 0.5 }} />
              <Chip label="Project Closure: Executive or Admin approval required" sx={{ m: 0.5 }} />
            </Box>
          </Paper>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Project Management Compliance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verifies that all projects have proper documentation, justified budget changes, 
              and follow ClientTerms requirements for closure and delegation.
            </Typography>
          </Paper>
        </Stack>
      </Box>
    </Container>
  );
};

export default AuditPage; 