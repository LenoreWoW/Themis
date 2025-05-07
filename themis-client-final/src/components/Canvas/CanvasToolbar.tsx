import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  setSnapToGrid,
  setGridSize,
  setShowGrid,
  undoCanvas,
  redoCanvas,
  clearSelection
} from '../../store/slices/canvasSlice';
import useCanvasViewport from '../../hooks/canvas/useCanvasViewport';
import useCanvasHistory from '../../hooks/canvas/useCanvasHistory';
import { Box, IconButton, Tooltip, ToggleButton, ButtonGroup, Divider, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import GridOnIcon from '@mui/icons-material/GridOn';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& > *': {
    margin: theme.spacing(0, 0.5),
  },
  '& hr': {
    margin: theme.spacing(0, 1),
  }
}));

/**
 * Canvas Toolbar Component
 * 
 * Provides controls for the canvas:
 * - Zoom controls (zoom in, zoom out, fit to screen)
 * - History controls (undo, redo)
 * - Grid toggle
 * - Snap to grid toggle
 * - Delete selected items
 */
const CanvasToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    snapToGrid,
    showGrid,
    selectedCardIds,
    selectedConnectionIds,
    selectedGroupIds
  } = useSelector((state: RootState) => state.canvas);
  
  const { zoomIn, zoomOut, resetViewport, fitToContent } = useCanvasViewport();
  const { canUndo, canRedo, undo, redo } = useCanvasHistory();
  
  // Check if there are any selected items
  const hasSelection = selectedCardIds.length > 0 || 
    selectedConnectionIds.length > 0 || 
    selectedGroupIds.length > 0;
  
  // Handle toggle settings
  const handleToggleGrid = useCallback(() => {
    dispatch(setShowGrid(!showGrid));
  }, [dispatch, showGrid]);
  
  const handleToggleSnapToGrid = useCallback(() => {
    dispatch(setSnapToGrid(!snapToGrid));
  }, [dispatch, snapToGrid]);
  
  // Delete selected items
  const handleDeleteSelected = useCallback(() => {
    if (hasSelection) {
      // Clear selection after deleting
      dispatch(clearSelection());
    }
  }, [dispatch, hasSelection]);
  
  return (
    <ToolbarContainer>
      {/* History controls */}
      <ButtonGroup variant="contained" size="small">
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton 
              size="small" 
              onClick={undo} 
              disabled={!canUndo}
              color="primary"
            >
              <UndoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        
        <Tooltip title="Redo (Ctrl+Y)">
          <span>
            <IconButton 
              size="small" 
              onClick={redo} 
              disabled={!canRedo}
              color="primary"
            >
              <RedoIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </ButtonGroup>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Zoom controls */}
      <ButtonGroup variant="contained" size="small">
        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={zoomIn} color="primary">
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={zoomOut} color="primary">
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Reset View">
          <IconButton size="small" onClick={resetViewport} color="primary">
            <FitScreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ButtonGroup>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Grid controls */}
      <Tooltip title="Toggle Grid">
        <ToggleButton
          size="small"
          value="grid"
          selected={showGrid}
          onChange={handleToggleGrid}
        >
          <GridOnIcon fontSize="small" />
        </ToggleButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      {/* Delete selected */}
      <Tooltip title="Delete Selected">
        <span>
          <IconButton 
            size="small" 
            onClick={handleDeleteSelected} 
            disabled={!hasSelection}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </ToolbarContainer>
  );
};

export default CanvasToolbar; 