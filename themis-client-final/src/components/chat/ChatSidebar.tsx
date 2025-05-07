import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemIcon, Collapse, Badge, Divider, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Inbox as InboxIcon,
  Announcement as AnnouncementIcon,
  Forum as ForumIcon,
  People as PeopleIcon,
  ExpandLess,
  ExpandMore,
  Add as AddIcon,
  Folder as FolderIcon,
  FolderSpecial as FolderSpecialIcon,
  Chat as ChatIcon,
  Archive as ArchiveIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { ChatChannel, ChannelType, UnreadCount } from '../../types/ChatTypes';
import { User, UserRole } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const PREFIX = 'ChatSidebar';
const classes = {
  root: `${PREFIX}-root`,
  categoryHeader: `${PREFIX}-categoryHeader`,
  categoryItem: `${PREFIX}-categoryItem`,
  nested: `${PREFIX}-nested`,
  nestedItem: `${PREFIX}-nestedItem`,
  activeItem: `${PREFIX}-activeItem`,
  badge: `${PREFIX}-badge`,
  addButton: `${PREFIX}-addButton`,
  searchButton: `${PREFIX}-searchButton`,
  archivedLabel: `${PREFIX}-archivedLabel`,
};

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    width: '280px',
    height: '100%',
    overflow: 'auto',
    borderRight: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
  },
  [`& .${classes.categoryHeader}`]: {
    padding: theme.spacing(1, 2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  [`& .${classes.categoryItem}`]: {
    fontWeight: 500,
  },
  [`& .${classes.nested}`]: {
    paddingLeft: theme.spacing(2),
  },
  [`& .${classes.nestedItem}`]: {
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  [`& .${classes.activeItem}`]: {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.selected,
    },
  },
  [`& .${classes.badge}`]: {
    marginRight: theme.spacing(1),
  },
  [`& .${classes.addButton}`]: {
    padding: theme.spacing(0.5),
  },
  [`& .${classes.searchButton}`]: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1),
  },
  [`& .${classes.archivedLabel}`]: {
    fontSize: '0.75rem',
    marginLeft: theme.spacing(1),
    color: theme.palette.text.secondary,
  },
}));

interface ChatSidebarProps {
  channels: ChatChannel[];
  selectedChannelId: string | null;
  unreadCounts: Map<string, number>;
  loading: boolean;
  onChannelSelect: (channelId: string) => void;
  onNewChannel: () => void;
  onSearchMessages: () => void;
}

type ChannelCategory = {
  name: string;
  type: 'announcements' | 'projects' | 'completed' | 'direct';
  icon: React.ReactNode;
  channels: ChatChannel[];
  addButton?: boolean;
};

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  selectedChannelId,
  unreadCounts,
  loading,
  onChannelSelect,
  onNewChannel,
  onSearchMessages,
}) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    announcements: true,
    projects: true,
    completed: false,
    direct: true,
  });

  const toggleCategory = (category: string) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Organize channels into categories
  const categories = React.useMemo(() => {
    // Skip if loading or no channels
    if (loading || !channels.length) return [];

    const announcementChannels = channels.filter(
      (c) => c.type === ChannelType.General || (c.type === ChannelType.Department && c.departmentId === user?.department?.id)
    );

    const projectChannels = channels.filter(
      (c) => c.type === ChannelType.Project && !c.isArchived
    );

    const completedChannels = channels.filter(
      (c) => c.type === ChannelType.Project && c.isArchived
    );

    const directMessageChannels = channels.filter(
      (c) => c.type === ChannelType.DirectMessage
    );

    const result: ChannelCategory[] = [
      {
        name: 'Announcements',
        type: 'announcements',
        icon: <AnnouncementIcon />,
        channels: announcementChannels,
      },
      {
        name: 'Projects',
        type: 'projects',
        icon: <FolderIcon />,
        channels: projectChannels,
        addButton: user?.role === UserRole.PROJECT_MANAGER || 
                   user?.role === UserRole.SUB_PMO || 
                   user?.role === UserRole.MAIN_PMO,
      },
      {
        name: 'Completed',
        type: 'completed',
        icon: <ArchiveIcon />,
        channels: completedChannels,
      },
      {
        name: 'Direct Messages',
        type: 'direct',
        icon: <ChatIcon />,
        channels: directMessageChannels,
        addButton: true,
      },
    ];

    return result;
  }, [channels, loading, user]);

  if (loading) {
    return (
      <Root className={classes.root}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <CircularProgress />
        </Box>
      </Root>
    );
  }

  return (
    <Root className={classes.root}>
      <Box display="flex" alignItems="center" p={2} position="relative">
        <Typography variant="h6">Chat</Typography>
        <Tooltip title="Search Messages">
          <IconButton
            className={classes.searchButton}
            size="small"
            onClick={onSearchMessages}
          >
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider />

      {categories.map((category) => (
        <React.Fragment key={category.type}>
          <Box
            className={classes.categoryHeader}
            onClick={() => toggleCategory(category.type)}
          >
            <Box display="flex" alignItems="center">
              <ListItemIcon>{category.icon}</ListItemIcon>
              <Typography className={classes.categoryItem}>{category.name}</Typography>
            </Box>
            <Box display="flex" alignItems="center">
              {category.addButton && (
                <Tooltip title={`Add ${category.type === 'direct' ? 'Direct Message' : 'Channel'}`}>
                  <IconButton
                    className={classes.addButton}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewChannel();
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {expanded[category.type] ? <ExpandLess /> : <ExpandMore />}
            </Box>
          </Box>
          <Collapse in={expanded[category.type]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding className={classes.nested}>
              {category.channels.length === 0 ? (
                <ListItem>
                  <ListItemText 
                    primary={`No ${category.type} channels`} 
                    primaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }} 
                  />
                </ListItem>
              ) : (
                category.channels.map((channel) => {
                  const unreadCount = unreadCounts.get(channel.id) || 0;
                  const isSelected = selectedChannelId === channel.id;
                  
                  return (
                    <ListItem
                      key={channel.id}
                      className={`${classes.nestedItem} ${isSelected ? classes.activeItem : ''}`}
                      button
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      {channel.type === ChannelType.General && <ListItemIcon><AnnouncementIcon fontSize="small" /></ListItemIcon>}
                      {channel.type === ChannelType.Department && <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>}
                      {channel.type === ChannelType.Project && <ListItemIcon><ForumIcon fontSize="small" /></ListItemIcon>}
                      {channel.type === ChannelType.DirectMessage && <ListItemIcon><ChatIcon fontSize="small" /></ListItemIcon>}
                      
                      <ListItemText 
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="body2" noWrap>
                              {channel.name}
                            </Typography>
                            {channel.isArchived && (
                              <Typography className={classes.archivedLabel} component="span">
                                (archived)
                              </Typography>
                            )}
                          </Box>
                        } 
                      />
                      
                      {unreadCount > 0 && (
                        <Badge 
                          className={classes.badge} 
                          badgeContent={unreadCount} 
                          color="primary" 
                          max={99}
                        />
                      )}
                    </ListItem>
                  );
                })
              )}
            </List>
          </Collapse>
        </React.Fragment>
      ))}
    </Root>
  );
};

export default ChatSidebar; 