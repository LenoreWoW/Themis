import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';
import { User } from '../../types';

interface AddTeamMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (userIds: string[]) => void;
  availableUsers: User[];
  loading?: boolean;
}

const AddTeamMemberDialog: React.FC<AddTeamMemberDialogProps> = ({
  open,
  onClose,
  onAdd,
  availableUsers,
  loading = false
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = () => {
    onAdd(selectedUsers);
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Team Members</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : availableUsers.length === 0 ? (
          <Typography>No available users to add.</Typography>
        ) : (
          <List>
            {availableUsers.map(user => (
              <ListItem
                key={user.id}
                component="div"
                onClick={() => handleToggle(user.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Checkbox
                  edge="start"
                  checked={selectedUsers.includes(user.id)}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={`${user.role} - ${user.department.name}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={selectedUsers.length === 0}
        >
          Add Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTeamMemberDialog; 