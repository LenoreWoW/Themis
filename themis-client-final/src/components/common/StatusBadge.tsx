import React from 'react';
import { Box, Chip, Tooltip, useTheme, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

type StatusType = 'completed' | 'inProgress' | 'onHold' | 'planning' | 'cancelled' | 'review' | 'todo' | 'overdue';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  tooltipTitle?: string;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  tooltipTitle,
  size = 'small',
  showIcon = true
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Define gradients and colors based on status
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircleIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
          color: theme.palette.success.main,
          bgColor: alpha(theme.palette.success.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.success.main, 0.5),
          label: label || 'Completed'
        };
      case 'inProgress':
        return {
          icon: <AutorenewIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          color: theme.palette.primary.main,
          bgColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.primary.main, 0.5),
          label: label || 'In Progress'
        };
      case 'onHold':
        return {
          icon: <PauseCircleOutlineIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
          color: theme.palette.warning.main,
          bgColor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.warning.main, 0.5),
          label: label || 'On Hold'
        };
      case 'planning':
        return {
          icon: <HourglassEmptyIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
          color: theme.palette.info.main,
          bgColor: alpha(theme.palette.info.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.info.main, 0.5),
          label: label || 'Planning'
        };
      case 'cancelled':
        return {
          icon: <CancelIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.error.main, 0.5),
          label: label || 'Cancelled'
        };
      case 'review':
        return {
          icon: <AccessTimeIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
          color: theme.palette.secondary.main,
          bgColor: alpha(theme.palette.secondary.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.secondary.main, 0.5),
          label: label || 'In Review'
        };
      case 'todo':
        return {
          icon: <AccessTimeIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${isDark ? '#555555' : '#999999'}, ${isDark ? '#777777' : '#cccccc'})`,
          color: isDark ? '#cccccc' : '#666666',
          bgColor: alpha(isDark ? '#cccccc' : '#666666', isDark ? 0.2 : 0.1),
          borderColor: alpha(isDark ? '#cccccc' : '#666666', 0.5),
          label: label || 'To Do'
        };
      case 'overdue':
        return {
          icon: <ErrorIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.error.dark}, #ff6e6e)`,
          color: theme.palette.error.main,
          bgColor: alpha(theme.palette.error.main, isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.error.main, 0.5),
          label: label || 'Overdue'
        };
      default:
        return {
          icon: <AccessTimeIcon fontSize="small" />,
          gradient: `linear-gradient(45deg, ${theme.palette.grey[700]}, ${theme.palette.grey[500]})`,
          color: theme.palette.grey[500],
          bgColor: alpha(theme.palette.grey[500], isDark ? 0.2 : 0.1),
          borderColor: alpha(theme.palette.grey[500], 0.5),
          label: label || status
        };
    }
  };

  const config = getStatusConfig(status);

  const badgeContent = (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: size === 'small' ? 1 : 1.5,
        py: size === 'small' ? 0.5 : 0.75,
        borderRadius: 100,
        fontSize: size === 'small' ? '0.75rem' : '0.875rem',
        fontWeight: 600,
        lineHeight: 1,
        color: 'white',
        background: config.gradient,
        boxShadow: `0 2px 8px ${alpha(config.color, 0.3)}`,
        border: `1px solid ${config.borderColor}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 12px ${alpha(config.color, 0.4)}`,
          transform: 'translateY(-1px)'
        }
      }}
    >
      {showIcon && (
        <Box 
          component="span" 
          sx={{ 
            mr: 0.5, 
            display: 'flex', 
            alignItems: 'center',
            '& svg': {
              fontSize: size === 'small' ? '0.875rem' : '1rem'
            }
          }}
        >
          {config.icon}
        </Box>
      )}
      {config.label}
    </Box>
  );

  if (tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle}>
        {badgeContent}
      </Tooltip>
    );
  }

  return badgeContent;
};

export default StatusBadge; 