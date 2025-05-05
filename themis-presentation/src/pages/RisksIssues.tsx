import React from 'react';
import { Container, Typography, Paper, Box, Button, Tabs, Tab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const RisksIssues: React.FC = () => {
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" component="h1" gutterBottom>
          Risks & Issues
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          {tabIndex === 0 ? 'New Risk' : 'New Issue'}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Risks" />
          <Tab label="Issues" />
        </Tabs>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {tabIndex === 0 ? (
          <>
            <Typography variant="h6" gutterBottom>
              Risks Register
            </Typography>
            <Typography>
              This is a placeholder for the risks register. In a real implementation, 
              this would display a table of all risks with severity, probability, impact, 
              and mitigation plan information.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              Issues List
            </Typography>
            <Typography>
              This is a placeholder for the issues list. In a real implementation, 
              this would display a table of all issues with severity, status, owner, 
              and resolution plan information.
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default RisksIssues;
