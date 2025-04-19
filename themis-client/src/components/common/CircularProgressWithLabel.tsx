import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface CircularProgressWithLabelProps {
  value: number;
  size?: number;
  thickness?: number;
  animate?: boolean;
  label?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
}

const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
  value,
  size = 80,
  thickness = 4,
  animate = true,
  label,
  valuePrefix = '',
  valueSuffix = '%',
  color = 'primary'
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);
  
  // Dynamically determine color based on progress value
  const getColorByValue = () => {
    if (value < 30) return 'error';
    if (value < 70) return 'warning';
    if (value >= 100) return 'success';
    return color;
  };
  
  // Animation effect
  useEffect(() => {
    if (!animate) {
      setProgress(value);
      return;
    }
    
    const timer = setTimeout(() => {
      if (progress < value) {
        setProgress((prevProgress) => Math.min(prevProgress + 1, value));
      }
    }, 20);
    
    return () => {
      clearTimeout(timer);
    };
  }, [value, progress, animate]);
  
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        <CircularProgress
          variant="determinate"
          size={size}
          thickness={thickness}
          value={100}
          sx={{
            color: theme.palette.mode === 'light' 
              ? theme.palette.grey[200] 
              : theme.palette.grey[800],
            position: 'absolute',
            left: 0,
          }}
        />
        <CircularProgress
          variant="determinate"
          size={size}
          thickness={thickness}
          value={animate ? progress : value}
          color={getColorByValue()}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.primary"
            sx={{ fontWeight: 'bold', fontSize: size / 5 }}
          >
            {valuePrefix}{Math.round(animate ? progress : value)}{valueSuffix}
          </Typography>
        </Box>
      </Box>
      {label && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, fontSize: size / 6.5, textAlign: 'center' }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default CircularProgressWithLabel; 