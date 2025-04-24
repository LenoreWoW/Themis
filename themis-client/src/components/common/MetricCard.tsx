import React from 'react';
import { Paper, Typography, LinearProgress, Box } from '@mui/material';
import { Theme } from '@mui/material/styles';

// Qatar flag colors
const qatarMaroon = {
  main: '#8A1538',
  light: '#A43A59',
  dark: '#6E0020',
};

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
        p: 2.5,
        textAlign: 'center',
        height: '100%',
        borderRadius: 2,
        boxShadow: 2,
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${qatarMaroon.main}15`,
        transition: 'all 0.3s ease',
        '&:hover': onClick ? { 
          boxShadow: 6,
          borderColor: `${qatarMaroon.main}40`,
          transform: 'translateY(-2px)',
        } : {},
        '&::after': onClick ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '4px',
          backgroundColor: qatarMaroon.main,
          opacity: 0.7,
        } : {},
        ...customSx,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
        {icon && <Box sx={{ mr: 1.5, color: qatarMaroon.main }}>{icon}</Box>}
        <Typography 
          variant="h3" 
          color={color === 'primary' ? qatarMaroon.main : color}
          sx={{ fontWeight: 'bold' }}
        >
          {value}
        </Typography>
      </Box>
      
      <Typography 
        variant="body1" 
        sx={{ 
          fontWeight: 500,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      
      {subtitle && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ mt: 0.5, fontSize: '0.75rem', opacity: 0.8 }}
        >
          {subtitle}
        </Typography>
      )}
      
      {progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          color={progressColor || (color as any)}
          sx={{ 
            mt: 2, 
            height: 6, 
            borderRadius: 3,
            backgroundColor: `${qatarMaroon.main}15`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: qatarMaroon.main,
            }
          }}
        />
      )}
    </Paper>
  );
};

export default MetricCard; 