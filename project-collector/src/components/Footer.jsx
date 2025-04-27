import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} Themis Project Collector - All rights reserved
          </Typography>
          
          <Box sx={{ mt: { xs: 2, sm: 0 } }}>
            <Typography variant="body2" color="text.secondary" align="center">
              This is a temporary data collection tool. All projects will be migrated to Themis when available.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 