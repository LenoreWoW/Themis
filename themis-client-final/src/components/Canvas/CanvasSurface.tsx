import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import useCanvasViewport from '../../hooks/canvas/useCanvasViewport';
import useCanvasSelection from '../../hooks/canvas/useCanvasSelection';
import useCanvasHistory from '../../hooks/canvas/useCanvasHistory';
import useCanvasSnap from '../../hooks/canvas/useCanvasSnap';
import { BBox } from '../../utils/canvas/bboxUtils';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Position } from '../../store/slices/canvasSlice';

const StyledCanvas = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.default,
  cursor: 'default',
  
  '&.panning': {
    cursor: 'grabbing'
  }
}));

const CanvasContent = styled(Box)(() => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  transformOrigin: '0 0'
}));

const GridOverlay = styled(Box)<{ $gridSize: number }>(({ theme, $gridSize }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  backgroundImage: `
    linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
    linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)
  `,
  backgroundSize: `${$gridSize}px ${$gridSize}px`,
  opacity: 0.2,
  zIndex: 0
}));

const SelectionRect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  border: `1px dashed ${theme.palette.primary.main}`,
  backgroundColor: `${theme.palette.primary.main}20`,
  pointerEvents: 'none',
  zIndex: 10
}));

interface CanvasSurfaceProps {
  children?: React.ReactNode;
  onCardCreate?: (position: Position) => void;
  onContextMenu?: (event: React.MouseEvent, position: Position) => void;
}

/**
 * The main canvas surface component
 * 
 * This component provides:
 * - Infinite pan-zoom canvas with high performance
 * - Grid overlay for alignment
 * - Selection rectangle
 * - Keyboard shortcuts for navigation and editing
 */
const CanvasSurface: React.FC<CanvasSurfaceProps> = ({
  children,
  onCardCreate,
  onContextMenu
}) => {
  const dispatch = useDispatch();
  const { snapToGrid, gridSize } = useSelector((state: RootState) => state.canvas);
  
  // Custom hooks
  const {
    canvasRef,
    viewport,
    transform,
    startPan,
    doPan,
    endPan,
    handleWheel,
    zoomIn,
    zoomOut,
    resetViewport
  } = useCanvasViewport();
  
  const {
    selectionBox,
    isDraggingSelection,
    startDragSelection,
    updateDragSelection,
    endDragSelection,
    handleSelectionClick
  } = useCanvasSelection();
  
  const { handleKeyboardShortcut } = useCanvasHistory();
  const { calculateSnapPosition } = useCanvasSnap();
  
  // Get world position from mouse event
  const getWorldPosition = useCallback((e: React.MouseEvent): Position => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.pan.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.pan.y) / viewport.zoom;
    
    return { x, y };
  }, [canvasRef, viewport]);
  
  // Mouse down handler
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Right-click for context menu
    if (e.button === 2) {
      e.preventDefault();
      e.stopPropagation();
      
      if (onContextMenu) {
        const worldPos = getWorldPosition(e);
        onContextMenu(e, worldPos);
      }
      return;
    }
    
    // Middle mouse button (or space+click) for panning
    if (e.button === 1 || (e.button === 0 && e.currentTarget.classList.contains('panning'))) {
      e.preventDefault();
      startPan(e);
      return;
    }
    
    // Left click on canvas background
    if (e.button === 0 && e.target === canvasRef.current) {
      const worldPos = getWorldPosition(e);
      
      // Check if we clicked on something
      const clickedOnSomething = handleSelectionClick(worldPos, e.shiftKey);
      
      // If nothing was clicked, start drag selection
      if (!clickedOnSomething) {
        startDragSelection(worldPos, e.shiftKey);
      }
    }
  }, [canvasRef, getWorldPosition, handleSelectionClick, onContextMenu, startDragSelection, startPan]);
  
  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle panning
    if (viewport.isPanning) {
      doPan(e);
      return;
    }
    
    // Handle drag selection
    if (isDraggingSelection) {
      const worldPos = getWorldPosition(e);
      updateDragSelection(worldPos, viewport.zoom);
    }
  }, [doPan, getWorldPosition, isDraggingSelection, updateDragSelection, viewport.isPanning, viewport.zoom]);
  
  // Mouse up handler
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // End panning
    if (viewport.isPanning) {
      endPan();
    }
    
    // End drag selection
    if (isDraggingSelection) {
      endDragSelection();
    }
    
    // Double click to create a card
    if (e.detail === 2 && e.button === 0 && e.target === canvasRef.current && onCardCreate) {
      const worldPos = getWorldPosition(e);
      const snappedPos = calculateSnapPosition(worldPos, { width: 0, height: 0 });
      onCardCreate(snappedPos);
    }
  }, [calculateSnapPosition, endDragSelection, endPan, getWorldPosition, isDraggingSelection, onCardCreate, viewport.isPanning]);
  
  // Handle keyboard events for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle history keyboard shortcuts
      handleKeyboardShortcut(e);
      
      // Space key for panning
      if (e.code === 'Space' && !e.repeat && canvasRef.current) {
        canvasRef.current.classList.add('panning');
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      // Space key released
      if (e.code === 'Space' && canvasRef.current) {
        canvasRef.current.classList.remove('panning');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyboardShortcut]);
  
  // Render selection rectangle
  const renderSelectionRect = () => {
    if (!selectionBox) return null;
    
    return (
      <SelectionRect
        style={{
          left: selectionBox.minX,
          top: selectionBox.minY,
          width: selectionBox.maxX - selectionBox.minX,
          height: selectionBox.maxY - selectionBox.minY,
          transform: `scale(${1/viewport.zoom})`
        }}
      />
    );
  };
  
  return (
    <StyledCanvas>
      <Paper
        ref={canvasRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'none',
          borderRadius: 0
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()} // Prevent default context menu
      >
        {/* Grid overlay */}
        {snapToGrid && (
          <GridOverlay $gridSize={gridSize * viewport.zoom} />
        )}
        
        {/* Canvas content with transform */}
        <CanvasContent
          style={{
            transform
          }}
        >
          {children}
          {renderSelectionRect()}
        </CanvasContent>
      </Paper>
    </StyledCanvas>
  );
};

export default CanvasSurface; 