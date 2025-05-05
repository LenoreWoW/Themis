import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, useTheme, CircularProgressProps } from '@mui/material';

export interface CircularProgressWithLabelProps extends CircularProgressProps {
  value: number;
  size?: number;
  thickness?: number;
  animate?: boolean;
  animationDuration?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  progressColor?: string;
}

const CircularProgressWithLabel: React.FC<CircularProgressWithLabelProps> = ({
  value,
  size = 40,
  thickness = 3.6,
  animate = false,
  animationDuration = 800,
  valuePrefix = '',
  valueSuffix = '%',
  color = 'primary',
  progressColor,
  ...props
}) => {
  const theme = useTheme();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= value) {
            clearInterval(timer);
            return value;
          }
          // Increment by a small amount each time
          const increment = Math.max(1, Math.floor(value / 20));
          return Math.min(prevProgress + increment, value);
        });
      }, animationDuration / (value || 1));

      return () => {
        clearInterval(timer);
      };
    } else {
      setProgress(value);
    }
  }, [value, animate, animationDuration]);

  // Dynamically determine color based on value
  const getColorByValue = () => {
    if (color !== 'primary') return color;
    
    if (value < 30) {
      return 'error';
    } else if (value < 70) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        size={size}
        thickness={thickness}
        value={animate ? progress : value}
        color={getColorByValue()}
        sx={progressColor ? { color: progressColor } : undefined}
        {...props}
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
          color="text.secondary"
          sx={{
            fontWeight: 'medium',
            fontSize: size && size < 45 ? '0.7rem' : '0.875rem',
            paddingLeft: '1px', // Center visually
          }}
        >
          {`${valuePrefix}${Math.round(animate ? progress : value)}${valueSuffix}`}
        </Typography>
      </Box>
    </Box>
  );
};

export default CircularProgressWithLabel; 