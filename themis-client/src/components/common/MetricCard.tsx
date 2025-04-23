import React from 'react';
import { Paper, Typography, LinearProgress, Box } from '@mui/material';
import { Theme } from '@mui/material/styles';

export interface MetricCardProps {
  title: string;
  value: number | string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | string;
  progress?: number;
  progressColor?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  onClick?: () => void;
  icon?: React.ReactNode;
  subtitle?: string;
  customSx?: React.CSSProperties | Record<string, any>;
}

/**
 * A reusable card component for displaying metrics with optional progress indicator
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  color = 'primary',
  progress,
  progressColor,
  onClick,
  icon,
  subtitle,
  customSx = {},
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        textAlign: 'center',
        height: '100%',
        borderRadius: 2,
        boxShadow: 2,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        ...customSx,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
        {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
        <Typography 
          variant="h3" 
          color={color}
          sx={{ fontWeight: 'bold' }}
        >
          {value}
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary">
        {title}
      </Typography>
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.75rem' }}>
          {subtitle}
        </Typography>
      )}
      
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progressColor || (color as any)}
          sx={{ mt: 2, height: 4, borderRadius: 2 }}
        />
      )}
    </Paper>
  );
};

export default MetricCard; 