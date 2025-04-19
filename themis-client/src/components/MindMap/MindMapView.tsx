import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemText,
  ListItemIcon,
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  Lock as LockIcon,
  PushPin as PinIcon
} from '@mui/icons-material';
import { Project, Task } from '../../types';
import EnhancedMindMap from './EnhancedMindMap';
import ViewsModal, { ViewData } from './ViewsModal';

interface MindMapViewProps {
  project?: Project;
  tasks?: Task[];
}

interface MindMapViewState {
  id: string;
  name: string;
  mode: 'tasks' | 'blank';
  data: any;
  isPrivate: boolean;
  isPinned: boolean;
  isActive: boolean;
}

const MindMapView: React.FC<MindMapViewProps> = ({ project, tasks }) => {
  const [views, setViews] = useState<MindMapViewState[]>([]);
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [viewsModalOpen, setViewsModalOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedViewIndex, setSelectedViewIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Initialize default view if none exist
  useEffect(() => {
    if (views.length === 0 && project) {
      setViews([
        {
          id: `default-${Date.now()}`,
          name: 'Default View',
          mode: 'tasks',
          data: null,
          isPrivate: false,
          isPinned: true,
          isActive: true
        }
      ]);
    }
  }, [project, views.length]);
  
  // Handle opening the menu for a view
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedViewIndex(index);
  };
  
  // Handle menu closing
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedViewIndex(null);
  };
  
  // Handle opening the delete confirmation dialog
  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };
  
  // Handle actually deleting a view
  const handleConfirmDelete = () => {
    if (selectedViewIndex !== null) {
      const newViews = views.filter((_, index) => index !== selectedViewIndex);
      setViews(newViews);
      
      // If we deleted the active view, select another one
      if (selectedViewIndex === activeViewIndex) {
        setActiveViewIndex(Math.min(0, newViews.length - 1));
      } else if (selectedViewIndex < activeViewIndex) {
        // Adjust active index if we deleted a view before it
        setActiveViewIndex(activeViewIndex - 1);
      }
    }
    
    setDeleteDialogOpen(false);
  };
  
  // Handle changing the active view
  const handleViewChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveViewIndex(newValue);
  };
  
  // Handle creating a new view
  const handleCreateView = (viewData: ViewData) => {
    const newView: MindMapViewState = {
      id: `view-${Date.now()}`,
      name: viewData.name,
      mode: viewData.mode,
      data: null,
      isPrivate: viewData.isPrivate,
      isPinned: viewData.isPinned,
      isActive: false
    };
    
    const newViews = [...views, newView];
    setViews(newViews);
    setActiveViewIndex(newViews.length - 1);
  };
  
  // Handle saving mind map data
  const handleSaveMindMap = (viewIndex: number, data: any) => {
    const newViews = [...views];
    newViews[viewIndex] = {
      ...newViews[viewIndex],
      data
    };
    setViews(newViews);
  };
  
  // Determine if there's an active view
  const activeView = views[activeViewIndex];
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Views Bar */}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
          <Tabs 
            value={activeViewIndex} 
            onChange={handleViewChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ flexGrow: 1 }}
          >
            {views.map((view, index) => (
              <Tab 
                key={view.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {view.name}
                    {view.isPrivate && (
                      <LockIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} />
                    )}
                    {view.isPinned && (
                      <PinIcon fontSize="small" sx={{ ml: 0.5, fontSize: '0.8rem' }} />
                    )}
                  </Box>
                }
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center'
                }}
                icon={
                  <Box
                    component="div"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, index);
                    }}
                    sx={{ 
                      ml: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  >
                    <MoreIcon fontSize="small" />
                  </Box>
                }
                iconPosition="end"
              />
            ))}
          </Tabs>
          
          <Button
            startIcon={<AddIcon />}
            onClick={() => setViewsModalOpen(true)}
            sx={{ ml: 1, mr: 1, my: 0.5 }}
          >
            Add
          </Button>
        </Box>
      </Paper>
      
      {/* Active Mind Map View */}
      {activeView && (
        <Box sx={{ flexGrow: 1 }}>
          <EnhancedMindMap 
            project={project}
            tasks={tasks}
            mode={activeView.mode}
            initialData={activeView.data}
            onSave={(data) => handleSaveMindMap(activeViewIndex, data)}
            customizeEnabled={true}
          />
        </Box>
      )}
      
      {/* Views Modal */}
      <ViewsModal 
        open={viewsModalOpen}
        onClose={() => setViewsModalOpen(false)}
        onCreateView={handleCreateView}
      />
      
      {/* View Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Delete View" />
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Mind Map View</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedViewIndex !== null ? views[selectedViewIndex]?.name : ''}"?
            This action cannot be undone and the view cannot be restored.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MindMapView; 