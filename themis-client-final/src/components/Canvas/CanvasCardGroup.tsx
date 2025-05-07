import React, { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateGroup, selectGroup } from '../../store/slices/canvasSlice';
import { CardGroup } from '../../store/slices/canvasSlice';
import useCanvasSnap from '../../hooks/canvas/useCanvasSnap';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';

const GroupWrapper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>(({ theme, selected }) => ({
  position: 'absolute',
  cursor: 'move',
  backgroundColor: 'transparent',
  border: selected 
    ? `2px dashed ${theme.palette.primary.main}` 
    : `1px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: 'none',
  padding: theme.spacing(1),
  transition: 'border 0.2s ease',
  '&:hover': {
    border: selected 
      ? `2px dashed ${theme.palette.primary.main}` 
      : `1px dashed ${theme.palette.primary.light}`,
  }
}));

const GroupHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  cursor: 'move',
  position: 'absolute',
  top: -28,
  left: 8,
  zIndex: 3,
  boxShadow: theme.shadows[1]
}));

const ResizeHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  zIndex: 10,
  
  // Bottom right
  '&.br': { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' }
}));

interface CanvasCardGroupProps {
  group: CardGroup;
  selected: boolean;
  zoom: number;
  onSelect: (id: string, multi: boolean) => void;
}

/**
 * Canvas Card Group Component
 * 
 * Renders a movable, resizable group on the canvas that can contain multiple cards
 */
const CanvasCardGroup: React.FC<CanvasCardGroupProps> = ({
  group,
  selected,
  zoom,
  onSelect
}) => {
  const dispatch = useDispatch();
  const { calculateSnapPosition } = useCanvasSnap();
  const groupRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragStartGroupPosition, setDragStartGroupPosition] = useState({ x: 0, y: 0 });
  
  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  
  // Handle mouse down on group
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If not already selected, select this group
    if (!selected) {
      onSelect(group.id, e.shiftKey);
    }
    
    // Start drag
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    setDragStartGroupPosition({ x: group.position.x, y: group.position.y });
  }, [group.id, group.position.x, group.position.y, onSelect, selected]);
  
  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If not already selected, select this group
    if (!selected) {
      onSelect(group.id, e.shiftKey);
    }
    
    setIsResizing(true);
    setResizeStartPosition({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: group.size.width, height: group.size.height });
  }, [group.id, group.size.height, group.size.width, onSelect, selected]);
  
  // Handle mouse move for drag and resize
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStartPosition.x) / zoom;
      const dy = (e.clientY - dragStartPosition.y) / zoom;
      
      const newPosition = {
        x: dragStartGroupPosition.x + dx,
        y: dragStartGroupPosition.y + dy
      };
      
      const snappedPosition = calculateSnapPosition(newPosition, group.size);
      
      dispatch(updateGroup({
        id: group.id,
        changes: {
          position: snappedPosition
        }
      }));
    }
    
    if (isResizing) {
      const dx = (e.clientX - resizeStartPosition.x) / zoom;
      const dy = (e.clientY - resizeStartPosition.y) / zoom;
      
      dispatch(updateGroup({
        id: group.id,
        changes: {
          size: { 
            width: Math.max(100, resizeStartSize.width + dx),
            height: Math.max(50, resizeStartSize.height + dy)
          }
        }
      }));
    }
  }, [calculateSnapPosition, dispatch, dragStartGroupPosition.x, dragStartGroupPosition.y, dragStartPosition.x, dragStartPosition.y, group.id, group.size, isDragging, isResizing, resizeStartPosition.x, resizeStartPosition.y, resizeStartSize.height, resizeStartSize.width, zoom]);
  
  // Handle mouse up for drag and resize
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);
  
  // Register global mouse event handlers for drag and resize
  React.useEffect(() => {
    if (isDragging || isResizing) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleMouseMove(e as unknown as React.MouseEvent);
      };
      
      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };
      
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  
  return (
    <GroupWrapper
      ref={groupRef}
      selected={selected}
      style={{
        left: group.position.x,
        top: group.position.y,
        width: group.size.width,
        height: group.size.height,
        zIndex: selected ? 1 : 0
      }}
      onMouseDown={handleMouseDown}
    >
      <GroupHeader>
        <Typography variant="subtitle2">{group.title}</Typography>
      </GroupHeader>
      
      {/* Resize handle - only show when selected */}
      {selected && (
        <ResizeHandle 
          className="br" 
          onMouseDown={handleResizeStart} 
        />
      )}
    </GroupWrapper>
  );
};

export default CanvasCardGroup; 