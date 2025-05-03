import React from 'react';
import { 
  ListItem, 
  ListItemText, 
  Chip, 
  Typography, 
  IconButton, 
  Box 
} from '@mui/material';
import { 
  ChangeRequest, 
  ChangeRequestStatus, 
  ChangeRequestType 
} from '../../types/change-request';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ChangeRequestListItemProps {
  changeRequest: ChangeRequest;
  onClick: (id: string) => void;
}

const getStatusColor = (status: ChangeRequestStatus) => {
  switch (status) {
    case ChangeRequestStatus.PENDING:
      return 'warning';
    case ChangeRequestStatus.APPROVED:
      return 'success';
    case ChangeRequestStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

const getTypeColor = (type: ChangeRequestType) => {
  switch (type) {
    case ChangeRequestType.SCHEDULE:
      return '#FFA726'; // Orange
    case ChangeRequestType.BUDGET:
      return '#66BB6A'; // Green
    case ChangeRequestType.SCOPE:
      return '#42A5F5'; // Blue
    case ChangeRequestType.RESOURCE:
      return '#AB47BC'; // Purple
    case ChangeRequestType.CLOSURE:
      return '#EF5350'; // Red
    default:
      return '#78909C'; // Blue Grey
  }
};

const ChangeRequestListItem: React.FC<ChangeRequestListItemProps> = ({ 
  changeRequest, 
  onClick 
}) => {
  const { t } = useTranslation();
  
  return (
    <ListItem
      alignItems="flex-start"
      divider
      secondaryAction={
        <IconButton edge="end" onClick={() => changeRequest.id && onClick(changeRequest.id)}>
          <VisibilityIcon />
        </IconButton>
      }
      sx={{ cursor: 'pointer' }}
      onClick={() => changeRequest.id && onClick(changeRequest.id)}
    >
      <ListItemText
        primary={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle1" component="span">
              {changeRequest.title}
            </Typography>
            <Chip
              label={t(`changeRequest.type.${changeRequest.type.toLowerCase()}`)}
              size="small"
              sx={{ 
                backgroundColor: getTypeColor(changeRequest.type),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        }
        secondary={
          <React.Fragment>
            <Box component="span" display="flex" flexDirection="column" mt={1}>
              <Typography variant="body2" color="text.secondary" component="span">
                {changeRequest.description.length > 100 
                  ? `${changeRequest.description.substring(0, 100)}...` 
                  : changeRequest.description}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={2} mt={1}>
                <Chip
                  label={t(`changeRequest.status.${changeRequest.status.toLowerCase()}`)}
                  size="small"
                  color={getStatusColor(changeRequest.status)}
                />
                
                <Typography variant="caption" color="text.secondary">
                  {t('common.submitted')}: {format(new Date(changeRequest.submittedDate), 'dd/MM/yyyy')}
                </Typography>
              </Box>
            </Box>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default ChangeRequestListItem; 