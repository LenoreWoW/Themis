import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Avatar,
  alpha
} from '@mui/material';
import { 
  AutoAwesome as AIIcon,
  InfoOutlined as InfoIcon,
  AccountTree as WorkflowIcon,
  Person as PersonIcon,
  ArrowForward as ArrowIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import aiService from '../../services/AIService';
import { UserRole } from '../../types';
import { ChangeRequestType } from '../../types/index';

interface WorkflowBuilderProps {
  onWorkflowGenerated?: (workflow: {step: number, role: UserRole, description: string}[]) => void;
}

/**
 * AI Workflow Builder component that generates approval workflows based on change request types
 */
const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ 
  onWorkflowGenerated
}) => {
  const [selectedType, setSelectedType] = useState<ChangeRequestType>(ChangeRequestType.SCHEDULE);
  const [workflow, setWorkflow] = useState<{step: number, role: UserRole, description: string}[]>([]);
  const [copied, setCopied] = useState(false);
  
  // Generate workflow when type changes
  useEffect(() => {
    const generatedWorkflow = aiService.generateApprovalWorkflow(selectedType);
    setWorkflow(generatedWorkflow);
    
    if (onWorkflowGenerated) {
      onWorkflowGenerated(generatedWorkflow);
    }
  }, [selectedType, onWorkflowGenerated]);
  
  const handleTypeChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value as ChangeRequestType);
    setCopied(false);
  };
  
  const handleCopyWorkflow = () => {
    const workflowText = workflow.map(step => 
      `Step ${step.step}: ${step.description} (${step.role})`
    ).join('\n');
    
    navigator.clipboard.writeText(workflowText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy workflow:', err);
      });
  };
  
  const getChangeRequestTypeLabel = (type: ChangeRequestType): string => {
    switch(type) {
      case ChangeRequestType.SCHEDULE:
        return 'Project Timeline Extension';
      case ChangeRequestType.BUDGET:
        return 'Budget Change';
      case ChangeRequestType.SCOPE:
        return 'Scope Change';
      case ChangeRequestType.RESOURCE:
        return 'Project Delegation';
      case ChangeRequestType.CLOSURE:
        return 'Project Closure';
      default:
        return 'Other Change Request';
    }
  };
  
  const getRoleColor = (role: UserRole): string => {
    switch(role) {
      case UserRole.PROJECT_MANAGER:
        return '#4caf50'; // green
      case UserRole.SUB_PMO:
        return '#2196f3'; // blue
      case UserRole.MAIN_PMO:
        return '#9c27b0'; // purple
      case UserRole.EXECUTIVE:
        return '#f44336'; // red
      case UserRole.ADMIN:
        return '#ff9800'; // orange
      default:
        return '#757575'; // grey
    }
  };
  
  const formatRoleName = (role: UserRole): string => {
    return role.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <WorkflowIcon color="primary" />
        <Typography variant="h6" component="h2">
          AI Workflow Builder
        </Typography>
        <Tooltip title="The AI Workflow Builder automatically generates approval workflows based on your change request types and client requirements">
          <IconButton size="small">
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      
      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="change-request-type-label">Change Request Type</InputLabel>
          <Select
            labelId="change-request-type-label"
            value={selectedType}
            label="Change Request Type"
            onChange={handleTypeChange}
          >
            <MenuItem value={ChangeRequestType.SCHEDULE}>
              Extend Project Timeline
            </MenuItem>
            <MenuItem value={ChangeRequestType.BUDGET}>
              Change Project Budget
            </MenuItem>
            <MenuItem value={ChangeRequestType.SCOPE}>
              Change Project Scope
            </MenuItem>
            <MenuItem value={ChangeRequestType.RESOURCE}>
              Delegate Project
            </MenuItem>
            <MenuItem value={ChangeRequestType.CLOSURE}>
              Close Project
            </MenuItem>
            <MenuItem value={ChangeRequestType.OTHER}>
              Other Changes
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <AIIcon color="primary" />
            <Typography variant="h6" component="h3">
              Client-Compliant Approval Workflow
            </Typography>
          </Stack>
          
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {getChangeRequestTypeLabel(selectedType)}
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          <Stepper orientation="vertical" activeStep={-1}>
            {workflow.map((step) => (
              <Step key={step.step} expanded>
                <StepLabel 
                  StepIconComponent={() => (
                    <Avatar 
                      sx={{ 
                        bgcolor: alpha(getRoleColor(step.role), 0.1), 
                        color: getRoleColor(step.role),
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        fontWeight: 'bold'
                      }}
                    >
                      {step.step}
                    </Avatar>
                  )}
                >
                  <Typography variant="subtitle2">
                    {step.description}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ color: getRoleColor(step.role), mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" fontWeight="medium">
                      {formatRoleName(step.role)}
                    </Typography>
                  </Box>
                  {step.step < workflow.length && (
                    <Box sx={{ display: 'flex', ml: 1, mt: 1 }}>
                      <ArrowIcon color="action" fontSize="small" />
                    </Box>
                  )}
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>
      
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={handleCopyWorkflow}
          color={copied ? "success" : "primary"}
        >
          {copied ? "Copied!" : "Copy Workflow"}
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => {/* Placeholder for download function */}}
        >
          Export as PDF
        </Button>
      </Stack>
    </Paper>
  );
};

export default WorkflowBuilder; 