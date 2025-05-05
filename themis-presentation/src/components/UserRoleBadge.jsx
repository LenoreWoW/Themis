import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import GroupsIcon from '@mui/icons-material/Groups';
import CodeIcon from '@mui/icons-material/Code';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import { useTestAuth } from '../context/TestAuthContext';
import { TEST_USER_ROLES } from '../context/TestAuthContext';

/**
 * Component to display a badge with the user's role
 */
const UserRoleBadge = ({ showTooltip = true, size = 'medium' }) => {
  const { t } = useTranslation();
  const { testUser } = useTestAuth();
  
  if (!testUser) return null;
  
  // Define role icons and colors
  const roleConfig = {
    [TEST_USER_ROLES.ADMIN]: {
      icon: <AdminPanelSettingsIcon />,
      color: 'error',
      label: 'Administrator'
    },
    [TEST_USER_ROLES.PROJECT_MANAGER]: {
      icon: <SupervisorAccountIcon />,
      color: 'primary',
      label: 'Project Manager'
    },
    [TEST_USER_ROLES.TEAM_LEAD]: {
      icon: <GroupsIcon />,
      color: 'success',
      label: 'Team Lead'
    },
    [TEST_USER_ROLES.DEVELOPER]: {
      icon: <CodeIcon />,
      color: 'info',
      label: 'Developer'
    },
    [TEST_USER_ROLES.STAKEHOLDER]: {
      icon: <VisibilityIcon />,
      color: 'warning',
      label: 'Stakeholder'
    },
    [TEST_USER_ROLES.GUEST]: {
      icon: <PersonIcon />,
      color: 'default',
      label: 'Guest'
    }
  };
  
  // Get configuration for current role
  const config = roleConfig[testUser.role] || {
    icon: <PersonIcon />,
    color: 'default',
    label: 'Unknown Role'
  };
  
  // Generate permission list for tooltip
  const generatePermissionsList = () => {
    if (!testUser.permissions) return '';
    
    const permissions = Object.entries(testUser.permissions)
      .filter(([key, value]) => value === true && key !== 'name')
      .map(([key]) => {
        // Format the permission name for readability
        return key
          .replace('can', '')
          .replace(/([A-Z])/g, ' $1')
          .trim();
      });
    
    return permissions.join('\n• ');
  };
  
  const chip = (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      size={size}
      sx={{ fontWeight: 500 }}
    />
  );

  return showTooltip ? (
    <Tooltip 
      title={
        <Box component="div" sx={{ whiteSpace: 'pre-line', p: 1 }}>
          <strong>{t('Role Permissions')}:</strong>
          <br />
          • {generatePermissionsList()}
        </Box>
      }
      arrow
    >
      {chip}
    </Tooltip>
  ) : chip;
};

export default UserRoleBadge; 