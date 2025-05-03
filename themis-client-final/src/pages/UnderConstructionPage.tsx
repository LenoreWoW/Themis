import React from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { useNavigate } from 'react-router-dom';

interface UnderConstructionPageProps {
  title: string;
}

const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({ title }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <ConstructionIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            {title}
          </Typography>
          
          <Typography variant="h6" color="textSecondary" paragraph>
            This feature is currently under construction
          </Typography>
          
          <Typography variant="body1" color="textSecondary" paragraph>
            We're working hard to build this feature. Please check back soon!
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default UnderConstructionPage; 