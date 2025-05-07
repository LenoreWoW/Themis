import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  addCard, 
  addConnection, 
  removeCard, 
  removeConnection, 
  clearSelection,
  addGroup,
  selectGroup,
  removeGroup
} from '../../store/slices/canvasSlice';
import { v4 as uuidv4 } from 'uuid';
import CanvasSurface from './CanvasSurface';
import CanvasCard from './CanvasCard';
import CanvasConnection from './CanvasConnection';
import CanvasCardGroup from './CanvasCardGroup';
import CanvasToolbar from './CanvasToolbar';
import { Box, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import GroupIcon from '@mui/icons-material/Folder';
import UngroupIcon from '@mui/icons-material/FolderOpen';
import { Position } from '../../store/slices/canvasSlice';
import CanvasSearch from './CanvasSearch';
import CanvasMinimap from './CanvasMinimap';

const CanvasContainer = styled(Box)({
  position: 'relative',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const CanvasArea = styled(Box)({
  flex: 1,
  position: 'relative',
  overflow: 'hidden'
});

const SVGContainer = styled('svg')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'auto'
  }
});

/**
 * Main Canvas Component
 * 
 * A complete canvas that integrates all the subcomponents:
 * - Canvas surface for panning, zooming, and selection
 * - Cards that can be created, moved, resized, and deleted
 * - Connections between cards
 * - Card groups for organizing cards
 * - Context menu for various actions
 */
const Canvas: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    cards, 
    connections, 
    groups,
    selectedCardIds, 
    selectedConnectionIds,
    selectedGroupIds,
    viewport
  } = useSelector((state: RootState) => state.canvas);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    position: { x: number, y: number };
    worldPosition: Position;
    mouseX: number;
    mouseY: number;
  } | null>(null);
  
  // State for connection creation
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  
  // Group dialog state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  
  // Handle card creation
  const handleCreateCard = useCallback((position: Position) => {
    const id = uuidv4();
    dispatch(addCard({
      id,
      position,
      size: { width: 200, height: 150 },
      data: {
        title: 'New Card',
        content: 'Add content here'
      },
      type: 'basic'
    }));
  }, [dispatch]);
  
  // Handle selection
  const handleSelectCard = useCallback((id: string, multi: boolean) => {
    if (!multi) {
      dispatch(clearSelection());
    }
    dispatch({ type: 'canvas/selectCard', payload: id });
  }, [dispatch]);
  
  const handleSelectConnection = useCallback((id: string, multi: boolean) => {
    if (!multi) {
      dispatch(clearSelection());
    }
    dispatch({ type: 'canvas/selectConnection', payload: id });
  }, [dispatch]);
  
  const handleSelectGroup = useCallback((id: string, multi: boolean) => {
    if (!multi) {
      dispatch(clearSelection());
    }
    dispatch(selectGroup(id));
  }, [dispatch]);
  
  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, worldPosition: Position) => {
    e.preventDefault();
    setContextMenu({
      position: worldPosition,
      worldPosition,
      mouseX: e.clientX,
      mouseY: e.clientY
    });
  }, []);
  
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);
  
  // Context menu actions
  const handleCreateCardFromContextMenu = useCallback(() => {
    if (contextMenu) {
      handleCreateCard(contextMenu.worldPosition);
      handleCloseContextMenu();
    }
  }, [contextMenu, handleCreateCard, handleCloseContextMenu]);
  
  const handleStartConnection = useCallback(() => {
    if (selectedCardIds.length === 1) {
      setConnectingFrom(selectedCardIds[0]);
      handleCloseContextMenu();
    }
  }, [selectedCardIds, handleCloseContextMenu]);
  
  const handleFinishConnection = useCallback((cardId: string) => {
    if (connectingFrom && connectingFrom !== cardId) {
      const id = uuidv4();
      dispatch(addConnection({
        id,
        fromId: connectingFrom,
        toId: cardId,
        type: 'basic'
      }));
      setConnectingFrom(null);
    }
  }, [connectingFrom, dispatch]);
  
  const handleDeleteItems = useCallback(() => {
    // Delete selected groups first
    selectedGroupIds.forEach(id => {
      dispatch(removeGroup(id));
    });
    
    // Delete selected cards
    selectedCardIds.forEach(id => {
      dispatch(removeCard(id));
    });
    
    // Delete selected connections
    selectedConnectionIds.forEach(id => {
      dispatch(removeConnection(id));
    });
    
    handleCloseContextMenu();
  }, [dispatch, selectedCardIds, selectedConnectionIds, selectedGroupIds, handleCloseContextMenu]);
  
  // Group actions
  const handleCreateGroup = useCallback(() => {
    if (selectedCardIds.length > 0) {
      setNewGroupName('');
      setGroupDialogOpen(true);
      handleCloseContextMenu();
    }
  }, [selectedCardIds, handleCloseContextMenu]);
  
  const handleSaveGroup = useCallback(() => {
    if (selectedCardIds.length > 0 && newGroupName.trim()) {
      // Calculate group position and size based on selected cards
      const selectedCards = selectedCardIds.map(id => cards[id]).filter(Boolean);
      
      if (selectedCards.length > 0) {
        // Find bounding box for all selected cards
        const minX = Math.min(...selectedCards.map(card => card.position.x));
        const minY = Math.min(...selectedCards.map(card => card.position.y));
        const maxX = Math.max(...selectedCards.map(card => card.position.x + card.size.width));
        const maxY = Math.max(...selectedCards.map(card => card.position.y + card.size.height));
        
        // Create a new group with padding
        const padding = 20;
        dispatch(addGroup({
          id: uuidv4(),
          title: newGroupName,
          cardIds: [...selectedCardIds],
          position: { 
            x: minX - padding, 
            y: minY - padding 
          },
          size: { 
            width: maxX - minX + (padding * 2), 
            height: maxY - minY + (padding * 2) 
          }
        }));
        
        setGroupDialogOpen(false);
      }
    }
  }, [cards, dispatch, newGroupName, selectedCardIds]);
  
  const handleUngroupCards = useCallback(() => {
    // If a group is selected, remove it (but keep the cards)
    if (selectedGroupIds.length > 0) {
      selectedGroupIds.forEach(id => {
        dispatch(removeGroup(id));
      });
      handleCloseContextMenu();
    }
  }, [dispatch, selectedGroupIds, handleCloseContextMenu]);
  
  // Render groups
  const renderGroups = useCallback(() => {
    return Object.values(groups).map(group => (
      <CanvasCardGroup
        key={group.id}
        group={group}
        selected={selectedGroupIds.includes(group.id)}
        zoom={viewport.zoom}
        onSelect={handleSelectGroup}
      />
    ));
  }, [groups, handleSelectGroup, selectedGroupIds, viewport.zoom]);
  
  // Render cards
  const renderCards = useCallback(() => {
    return Object.values(cards).map(card => (
      <CanvasCard
        key={card.id}
        card={card}
        selected={selectedCardIds.includes(card.id)}
        zoom={viewport.zoom}
        onSelect={
          connectingFrom 
            ? (id) => handleFinishConnection(id) 
            : handleSelectCard
        }
      />
    ));
  }, [cards, selectedCardIds, viewport.zoom, connectingFrom, handleFinishConnection, handleSelectCard]);
  
  // Render connections as SVG
  const renderConnections = useCallback(() => {
    return Object.values(connections).map(connection => (
      <CanvasConnection
        key={connection.id}
        connection={connection}
        selected={selectedConnectionIds.includes(connection.id)}
        onSelect={handleSelectConnection}
      />
    ));
  }, [connections, selectedConnectionIds, handleSelectConnection]);
  
  // Render context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;
    
    const hasSelection = selectedCardIds.length > 0 || selectedConnectionIds.length > 0 || selectedGroupIds.length > 0;
    const singleCardSelected = selectedCardIds.length === 1;
    const multipleCardsSelected = selectedCardIds.length > 1;
    const groupSelected = selectedGroupIds.length > 0;
    
    return (
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={handleCreateCardFromContextMenu}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Card</ListItemText>
        </MenuItem>
        
        {singleCardSelected && (
          <MenuItem onClick={handleStartConnection}>
            <ListItemIcon>
              <LinkIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Create Connection</ListItemText>
          </MenuItem>
        )}
        
        {multipleCardsSelected && !groupSelected && (
          <MenuItem onClick={handleCreateGroup}>
            <ListItemIcon>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Group Cards</ListItemText>
          </MenuItem>
        )}
        
        {groupSelected && (
          <MenuItem onClick={handleUngroupCards}>
            <ListItemIcon>
              <UngroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Ungroup</ListItemText>
          </MenuItem>
        )}
        
        {hasSelection && (
          <MenuItem onClick={handleDeleteItems}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    );
  };
  
  // Render group dialog
  const renderGroupDialog = () => (
    <Dialog
      open={groupDialogOpen}
      onClose={() => setGroupDialogOpen(false)}
    >
      <DialogTitle>Create Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
        <Button 
          onClick={handleSaveGroup} 
          disabled={!newGroupName.trim()}
          variant="contained"
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
  
  return (
    <CanvasContainer>
      <CanvasToolbar />
      
      <CanvasArea>
        <CanvasSurface
          onCardCreate={handleCreateCard}
          onContextMenu={handleContextMenu}
        >
          {renderGroups()}
          
          <SVGContainer>
            {renderConnections()}
          </SVGContainer>
          
          {renderCards()}
          {renderContextMenu()}
          {renderGroupDialog()}
          <CanvasSearch />
          <CanvasMinimap />
        </CanvasSurface>
      </CanvasArea>
    </CanvasContainer>
  );
};

export default Canvas; 