import React from 'react';
import { Snackbar, Alert, AlertProps, SnackbarProps } from '@mui/material';

interface CustomSnackbarProps {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  onClose: () => void;
  autoHideDuration?: number;
}

const CustomSnackbar: React.FC<CustomSnackbarProps> = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      <Alert 
        onClose={onClose}
        severity={severity}
        variant="filled"
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar; 