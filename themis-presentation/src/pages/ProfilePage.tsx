import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as AssignmentIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { GridItem, GridContainer } from '../components/common/MuiGridWrapper';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Partial<User>>(user || {});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">User information not available</Alert>
      </Container>
    );
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset form if canceling
    if (isEditing) {
      setProfileData(user);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would normally call an API to update the user profile
    console.log('Saving profile data:', profileData);
    
    // For demo purposes, we'll just show a success message
    setSaveSuccess(true);
    setIsEditing(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const getInitials = () => {
    return `${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`;
  };

  const getRoleName = (role: string) => {
    return role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2rem',
              mr: 3
            }}
          >
            {getInitials()}
          </Avatar>
          
          <Box>
            <Typography variant="h4">
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {getRoleName(user.role)}
            </Typography>
            <Chip 
              label={user.department?.name || 'No Department'} 
              size="small" 
              sx={{ mt: 1 }}
            />
          </Box>
          
          <Box sx={{ ml: 'auto' }}>
            <IconButton onClick={handleEditToggle} color={isEditing ? 'error' : 'primary'}>
              {isEditing ? <CancelIcon /> : <EditIcon />}
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <form onSubmit={handleSubmit}>
          <GridContainer spacing={3}>
            <GridItem xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={profileData.firstName || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </GridItem>
            <GridItem xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={profileData.lastName || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </GridItem>
            <GridItem xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={profileData.email || ''}
                onChange={handleInputChange}
                disabled={!isEditing}
                variant={isEditing ? "outlined" : "filled"}
              />
            </GridItem>
            
            {isEditing && (
              <GridItem xs={12} sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    startIcon={<SaveIcon />}
                  >
                    Save Changes
                  </Button>
                </Box>
              </GridItem>
            )}
          </GridContainer>
        </form>
      </Paper>
      
      <GridContainer spacing={3}>
        <GridItem xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Full Name"
                    secondary={`${user.firstName} ${user.lastName}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </GridItem>
        
        <GridItem xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Work Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AssignmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Department"
                    secondary={user.department?.name || 'Not Assigned'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Role"
                    secondary={getRoleName(user.role)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
    </Container>
  );
};

export default ProfilePage; 