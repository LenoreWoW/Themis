import React from 'react';
import { Container, Typography, Paper, Box, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Tasks: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tasks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Task
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tasks List Goes Here
        </Typography>
        <Typography>
          This is a placeholder for the tasks list view. In a real implementation, 
          this would display a table of all tasks with filtering, sorting, and grouping options.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Tasks;
