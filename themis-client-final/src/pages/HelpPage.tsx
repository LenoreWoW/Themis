import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
  Grid,
  Button
} from '@mui/material';
import { MDXProvider } from '@mdx-js/react';
import {
  Home as HomeIcon,
  School as TutorialIcon,
  Help as FAQIcon,
  Lightbulb as TipsIcon,
  ContactSupport as SupportIcon,
  Book as GuideIcon,
  PlayArrow as GettingStartedIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import Joyride, { CallBackProps, STATUS } from 'react-joyride';

// MDX content components - these would be imported from .mdx files in a real implementation
const GettingStartedGuide = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Getting Started</Typography>
    <Typography paragraph>
      Welcome to Themis! This guide will help you get started with the system and learn how to navigate through the various features.
    </Typography>
    
    <Typography variant="h5" gutterBottom>First Steps</Typography>
    <Typography paragraph>
      1. Create your profile in the system by clicking on your avatar and selecting "Edit Profile".
    </Typography>
    <Typography paragraph>
      2. Explore the dashboard to get a high-level overview of all projects and tasks.
    </Typography>
    <Typography paragraph>
      3. Navigate to the Projects section to view all ongoing projects or create new ones.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Interface Overview</Typography>
    <Typography paragraph>
      The main navigation is on the left side of the screen. Here you can access all major sections of the application.
    </Typography>
    <Typography paragraph>
      The Quick-Create button (+ icon) in the bottom-right corner lets you create new projects and tasks quickly from anywhere in the application.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Need More Help?</Typography>
    <Typography paragraph>
      If you need additional assistance, you can:
    </Typography>
    <Typography paragraph>
      - Take the interactive tour (click "Start Tour" below)
    </Typography>
    <Typography paragraph>
      - Check out the other sections in this help guide
    </Typography>
    <Typography paragraph>
      - Contact support for personalized assistance
    </Typography>
    
    <Button 
      variant="contained" 
      color="primary" 
      startIcon={<TutorialIcon />}
      onClick={() => window.dispatchEvent(new CustomEvent('start-tour'))}
      sx={{ mt: 2 }}
    >
      Start Interactive Tour
    </Button>
  </Box>
);

const ProjectsTasksGuide = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Projects & Tasks</Typography>
    <Typography paragraph>
      Learn how to manage projects and tasks effectively within the Themis system.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Creating a New Project</Typography>
    <Typography paragraph>
      1. Navigate to the Projects section from the main sidebar.
    </Typography>
    <Typography paragraph>
      2. Click the "New Project" button at the top right of the page.
    </Typography>
    <Typography paragraph>
      3. Fill in the required project details in the form.
    </Typography>
    <Typography paragraph>
      4. Submit the form to create your project.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Managing Tasks</Typography>
    <Typography paragraph>
      Tasks are the core units of work within a project. To create a new task:
    </Typography>
    <Typography paragraph>
      1. Navigate to a project's detail page.
    </Typography>
    <Typography paragraph>
      2. Click on the "Tasks" tab.
    </Typography>
    <Typography paragraph>
      3. Click "Add Task" to create a new task.
    </Typography>
    <Typography paragraph>
      4. Fill in the task details and assign it to a team member if needed.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Task Statuses</Typography>
    <Typography paragraph>
      Tasks can have the following statuses:
    </Typography>
    <Typography paragraph>
      - To Do: Tasks that haven't been started yet
    </Typography>
    <Typography paragraph>
      - In Progress: Tasks currently being worked on
    </Typography>
    <Typography paragraph>
      - Review: Tasks that need review before completion
    </Typography>
    <Typography paragraph>
      - Done: Completed tasks
    </Typography>
  </Box>
);

const CollaborationGuide = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Collaboration</Typography>
    <Typography paragraph>
      Learn how to use Themis's collaboration features to work effectively with your team.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Chat</Typography>
    <Typography paragraph>
      The chat feature allows you to communicate with your team members in real-time:
    </Typography>
    <Typography paragraph>
      1. Access the Chat section from the main sidebar.
    </Typography>
    <Typography paragraph>
      2. Select an existing channel or create a new one.
    </Typography>
    <Typography paragraph>
      3. Use the "Share Document" button to share files with your team.
    </Typography>
    <Typography paragraph>
      4. Use the "Start Call" button to initiate a video call with channel members.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Document Sharing</Typography>
    <Typography paragraph>
      Sharing documents within Themis is easy:
    </Typography>
    <Typography paragraph>
      1. In chat, click the "Share Document" button near the message input.
    </Typography>
    <Typography paragraph>
      2. Select the document you want to share from the library.
    </Typography>
    <Typography paragraph>
      3. The document will be shared in the chat for all members to access.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Video Calls</Typography>
    <Typography paragraph>
      To start a video call:
    </Typography>
    <Typography paragraph>
      1. Click the "Start Call" button in a chat channel or on a task detail page.
    </Typography>
    <Typography paragraph>
      2. The system will create a call room and notify channel members.
    </Typography>
    <Typography paragraph>
      3. Others can join by clicking the call notification or link.
    </Typography>
  </Box>
);

const ReportsGuide = () => (
  <Box>
    <Typography variant="h4" gutterBottom>Reports</Typography>
    <Typography paragraph>
      Learn how to create, save, and export reports in Themis.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Analytics Dashboard</Typography>
    <Typography paragraph>
      The Analytics Dashboard provides various metrics to help you track project performance:
    </Typography>
    <Typography paragraph>
      1. Navigate to the Analytics section from the main sidebar.
    </Typography>
    <Typography paragraph>
      2. Select a metric to visualize from the dropdown menu.
    </Typography>
    <Typography paragraph>
      3. Choose a chart type to represent your data.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Saving Reports</Typography>
    <Typography paragraph>
      To save a report for future reference:
    </Typography>
    <Typography paragraph>
      1. Configure your report with the desired metrics and chart type.
    </Typography>
    <Typography paragraph>
      2. Click the "Save" button in the top right of the Analytics Dashboard.
    </Typography>
    <Typography paragraph>
      3. The report will be saved and can be accessed later.
    </Typography>
    
    <Typography variant="h5" gutterBottom>Exporting Reports</Typography>
    <Typography paragraph>
      Reports can be exported in different formats:
    </Typography>
    <Typography paragraph>
      1. Configure your report with the desired metrics.
    </Typography>
    <Typography paragraph>
      2. Click either "PDF" or "Excel" buttons to export in the respective format.
    </Typography>
    <Typography paragraph>
      3. The file will be generated and downloaded to your device.
    </Typography>
  </Box>
);

// Component definitions for other guides would go here...

const tutorialSteps = [
  {
    target: 'body',
    content: 'Welcome to the Themis Help Center! Let\'s take a quick tour.',
    placement: 'center' as const,
  },
  {
    target: '.sidebar',
    content: 'Use the sidebar to navigate to different sections of the application.',
    placement: 'right' as const,
  },
  {
    target: '.quick-create-button',
    content: 'The Quick-Create button lets you create new projects and tasks from anywhere.',
    placement: 'left' as const,
  },
  {
    target: '.help-nav',
    content: 'Use these tabs to navigate through different help topics.',
    placement: 'bottom' as const,
  },
];

const HelpPage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [runTour, setRunTour] = useState(false);

  // Listen for tour start events
  React.useEffect(() => {
    const handleStartTour = () => setRunTour(true);
    window.addEventListener('start-tour', handleStartTour);
    
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
    }
  };

  // Define the content for each tab
  const tabContent = [
    <GettingStartedGuide key="getting-started" />,
    <ProjectsTasksGuide key="projects-tasks" />,
    <CollaborationGuide key="collaboration" />,
    <ReportsGuide key="reports" />,
    // Add other guide components here
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Joyride
        steps={tutorialSteps}
        run={runTour}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#1976d2',
          },
        }}
      />
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Home
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <GuideIcon sx={{ mr: 0.5 }} fontSize="small" />
            User Guide
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <GuideIcon sx={{ mr: 1 }} />
          Themis User Guide
        </Typography>
        
        <Typography variant="body1" paragraph>
          Welcome to the Themis Help Center. Here you'll find comprehensive guides to help you use all the features of our platform.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Topics</Typography>
            <List component="nav" className="help-nav">
              <ListItem button selected={currentTab === 0} onClick={() => setCurrentTab(0)}>
                <ListItemIcon><GettingStartedIcon /></ListItemIcon>
                <ListItemText primary="Getting Started" />
              </ListItem>
              <ListItem button selected={currentTab === 1} onClick={() => setCurrentTab(1)}>
                <ListItemIcon><GuideIcon /></ListItemIcon>
                <ListItemText primary="Projects & Tasks" />
              </ListItem>
              <ListItem button selected={currentTab === 2} onClick={() => setCurrentTab(2)}>
                <ListItemIcon><GuideIcon /></ListItemIcon>
                <ListItemText primary="Collaboration" />
              </ListItem>
              <ListItem button selected={currentTab === 3} onClick={() => setCurrentTab(3)}>
                <ListItemIcon><GuideIcon /></ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItem>
              <Divider sx={{ my: 1 }} />
              <ListItem button>
                <ListItemIcon><FAQIcon /></ListItemIcon>
                <ListItemText primary="FAQ" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><TutorialIcon /></ListItemIcon>
                <ListItemText primary="Tutorials" />
              </ListItem>
              <ListItem button>
                <ListItemIcon><SupportIcon /></ListItemIcon>
                <ListItemText primary="Contact Support" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3 }}>
            <MDXProvider>
              {tabContent[currentTab]}
            </MDXProvider>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HelpPage; 