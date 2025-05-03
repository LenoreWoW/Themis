import React from 'react';
import { Container, Typography, Paper, Box, Tabs, Tab } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tabIndex, setTabIndex] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Project Detail
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Project ID: {id}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Tasks" />
          <Tab label="Risks & Issues" />
          <Tab label="Financial" />
          <Tab label="Team" />
          <Tab label="Documents" />
        </Tabs>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        {tabIndex === 0 && (
          <Typography>
            Project overview and details would be displayed here.
          </Typography>
        )}
        {tabIndex === 1 && (
          <Typography>
            Tasks and Gantt chart would be displayed here.
          </Typography>
        )}
        {tabIndex === 2 && (
          <Typography>
            Risks and issues register would be displayed here.
          </Typography>
        )}
        {tabIndex === 3 && (
          <Typography>
            Financial information would be displayed here.
          </Typography>
        )}
        {tabIndex === 4 && (
          <Typography>
            Team members and roles would be displayed here.
          </Typography>
        )}
        {tabIndex === 5 && (
          <Typography>
            Project documents would be displayed here.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ProjectDetail;
