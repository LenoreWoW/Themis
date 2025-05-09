import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface MetricCardProps {
  title: string;
  value: string | number;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | string;
  progress?: number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

/**
 * Standardized metric card component for dashboards
 * Used to display KPIs and other metrics in a consistent format
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  color = 'primary',
  progress,
  subtitle,
  trend,
  trendLabel,
  onClick,
  icon
}) => {
  const theme = useTheme();
  
  // Determine color for the card
  const getColor = () => {
    if (color === 'primary') return theme.palette.primary.main;
    if (color === 'secondary') return theme.palette.secondary.main;
    if (color === 'success') return theme.palette.success.main;
    if (color === 'error') return theme.palette.error.main;
    if (color === 'info') return theme.palette.info.main;
    if (color === 'warning') return theme.palette.warning.main;
    return color; // Custom color
  };
  
  const cardColor = getColor();
  
  // Determine trend icon and color
  const renderTrend = () => {
    if (trend === undefined) return null;
    
    const isPositive = trend >= 0;
    const trendColor = isPositive ? theme.palette.success.main : theme.palette.error.main;
    const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
        <TrendIcon sx={{ color: trendColor, fontSize: '1rem', mr: 0.5 }} />
        <Typography variant="body2" sx={{ color: trendColor, fontWeight: 500 }}>
          {Math.abs(trend)}% {trendLabel || (isPositive ? 'increase' : 'decrease')}
        </Typography>
      </Box>
    );
  };
  
  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(cardColor, 0.2)}`,
        } : {},
        borderTop: `4px solid ${cardColor}`,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, pb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {icon && (
            <Box sx={{ 
              bgcolor: alpha(cardColor, 0.1), 
              color: cardColor,
              borderRadius: '50%',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {icon}
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" component="div" sx={{ fontWeight: 600, mb: 1 }}>
          {value}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="textSecondary">
                Progress
              </Typography>
              <Typography variant="caption" color={progress > 100 ? 'error' : 'textSecondary'}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(progress, 100)} 
              color={
                progress > 100 ? 'error' : 
                progress > 75 ? 'warning' : 
                'primary'
              }
              sx={{ 
                height: 6, 
                borderRadius: 3,
                backgroundColor: alpha(cardColor, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: cardColor,
                }
              }}
            />
          </Box>
        )}
        
        {renderTrend()}
      </CardContent>
    </Card>
  );
};

export default MetricCard; 