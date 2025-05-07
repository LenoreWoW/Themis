import React from 'react';
import { Link } from 'react-router-dom';
import { ListItem, ListItemIcon, ListItemText, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface ChatNavItemProps {
  selectedIndex: number;
  index: number;
  onClick: (index: number) => void;
}

const ChatNavItem: React.FC<ChatNavItemProps> = ({ selectedIndex, index, onClick }) => {
  // This would be replaced with actual unread message count from your state
  const unreadCount = useSelector((state: RootState) => 
    state.chat?.unreadMessages?.length || 0
  );
  
  return (
    <ListItem
      button
      component={Link}
      to="/chat"
      selected={selectedIndex === index}
      onClick={() => onClick(index)}
      sx={{
        '&.Mui-selected': {
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          '& .MuiListItemIcon-root': {
            color: 'white',
          },
        },
        '&:hover': {
          backgroundColor: 'action.hover',
        },
      }}
    >
      <ListItemIcon>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <ChatIcon />
        </Badge>
      </ListItemIcon>
      <ListItemText primary="Chat & Announcements" />
    </ListItem>
  );
};

export default ChatNavItem; 