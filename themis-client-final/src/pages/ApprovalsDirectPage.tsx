import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import ApprovalsPage from './ApprovalsPage';

/**
 * A standalone approvals page that can be accessed directly
 * This component wraps the main ApprovalsPage and ensures it's accessible
 */
const ApprovalsDirectPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <ApprovalsPage />
      </Box>
    </Container>
  );
};

export default ApprovalsDirectPage; 