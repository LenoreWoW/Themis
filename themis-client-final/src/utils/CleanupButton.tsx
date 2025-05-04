import React from 'react';
import { Button } from '@mui/material';
import { cleanupMockData } from './cleanupUtils';

interface CleanupButtonProps {
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

/**
 * A button component that cleans up mock data when clicked
 */
const CleanupButton: React.FC<CleanupButtonProps> = ({
  variant = 'outlined',
  color = 'warning',
  size = 'small',
  fullWidth = false
}) => {
  const handleCleanup = () => {
    cleanupMockData();
    alert('Mock data has been removed from localStorage. Please refresh the page to see changes.');
  };

  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      onClick={handleCleanup}
    >
      Clear Mock Data
    </Button>
  );
};

export default CleanupButton; 