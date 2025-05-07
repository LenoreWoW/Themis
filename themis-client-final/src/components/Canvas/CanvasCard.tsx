import React, { useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { updateCard, selectCard } from '../../store/slices/canvasSlice';
import { Card } from '../../store/slices/canvasSlice';
import useCanvasSnap from '../../hooks/canvas/useCanvasSnap';
import { styled } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';

const CardWrapper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>(({ theme, selected }) => ({
  position: 'absolute',
  cursor: 'pointer',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  border: selected 
    ? `2px solid ${theme.palette.primary.main}` 
    : `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: selected 
    ? `0 0 0 2px ${theme.palette.primary.main}40` 
    : theme.shadows[1],
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: selected 
      ? `0 0 0 4px ${theme.palette.primary.main}40` 
      : theme.shadows[3],
  }
}));

const ResizeHandle = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '8px',
  height: '8px',
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  zIndex: 10,
  
  // Top left
  '&.tl': { top: '-4px', left: '-4px', cursor: 'nwse-resize' },
  // Top right
  '&.tr': { top: '-4px', right: '-4px', cursor: 'nesw-resize' },
  // Bottom left
  '&.bl': { bottom: '-4px', left: '-4px', cursor: 'nesw-resize' },
  // Bottom right
  '&.br': { bottom: '-4px', right: '-4px', cursor: 'nwse-resize' }
}));

const ContentWrapper = styled(Box)({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative'
});

interface CanvasCardProps {
  card: Card;
  selected: boolean;
  zoom: number;
  onSelect: (id: string, multi: boolean) => void;
}

/**
 * Canvas Card Component
 * 
 * Renders a movable, resizable card on the canvas
 */
const CanvasCard: React.FC<CanvasCardProps> = ({
  card,
  selected,
  zoom,
  onSelect
}) => {
  const dispatch = useDispatch();
  const { calculateSnapPosition } = useCanvasSnap();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dragStartCardPosition, setDragStartCardPosition] = useState({ x: 0, y: 0 });
  
  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState<'tl' | 'tr' | 'bl' | 'br' | null>(null);
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  
  // Handle mouse down on card
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If not already selected, select this card
    if (!selected) {
      onSelect(card.id, e.shiftKey);
    }
    
    // Start drag
    setIsDragging(true);
    setDragStartPosition({ x: e.clientX, y: e.clientY });
    setDragStartCardPosition({ x: card.position.x, y: card.position.y });
  }, [card.id, card.position.x, card.position.y, onSelect, selected]);
  
  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent, type: 'tl' | 'tr' | 'bl' | 'br') => {
    e.stopPropagation();
    
    // If not already selected, select this card
    if (!selected) {
      onSelect(card.id, e.shiftKey);
    }
    
    setIsResizing(true);
    setResizeType(type);
    setResizeStartPosition({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: card.size.width, height: card.size.height });
    setDragStartCardPosition({ x: card.position.x, y: card.position.y });
  }, [card.id, card.position.x, card.position.y, card.size.height, card.size.width, onSelect, selected]);
  
  // Handle mouse move for drag and resize
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStartPosition.x) / zoom;
      const dy = (e.clientY - dragStartPosition.y) / zoom;
      
      const newPosition = {
        x: dragStartCardPosition.x + dx,
        y: dragStartCardPosition.y + dy
      };
      
      const snappedPosition = calculateSnapPosition(newPosition, card.size);
      
      dispatch(updateCard({
        id: card.id,
        changes: {
          position: snappedPosition
        }
      }));
    }
    
    if (isResizing && resizeType) {
      const dx = (e.clientX - resizeStartPosition.x) / zoom;
      const dy = (e.clientY - resizeStartPosition.y) / zoom;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = card.position.x;
      let newY = card.position.y;
      
      // Handle different resize handles
      switch (resizeType) {
        case 'br':
          newWidth = Math.max(100, resizeStartSize.width + dx);
          newHeight = Math.max(50, resizeStartSize.height + dy);
          break;
        case 'bl':
          newWidth = Math.max(100, resizeStartSize.width - dx);
          newHeight = Math.max(50, resizeStartSize.height + dy);
          newX = dragStartCardPosition.x + (resizeStartSize.width - newWidth);
          break;
        case 'tr':
          newWidth = Math.max(100, resizeStartSize.width + dx);
          newHeight = Math.max(50, resizeStartSize.height - dy);
          newY = dragStartCardPosition.y + (resizeStartSize.height - newHeight);
          break;
        case 'tl':
          newWidth = Math.max(100, resizeStartSize.width - dx);
          newHeight = Math.max(50, resizeStartSize.height - dy);
          newX = dragStartCardPosition.x + (resizeStartSize.width - newWidth);
          newY = dragStartCardPosition.y + (resizeStartSize.height - newHeight);
          break;
      }
      
      const snappedPosition = calculateSnapPosition({ x: newX, y: newY }, { width: newWidth, height: newHeight });
      
      dispatch(updateCard({
        id: card.id,
        changes: {
          position: snappedPosition,
          size: { width: newWidth, height: newHeight }
        }
      }));
    }
  }, [isDragging, isResizing, resizeType, dragStartPosition.x, dragStartPosition.y, dragStartCardPosition.x, dragStartCardPosition.y, resizeStartPosition.x, resizeStartPosition.y, resizeStartSize.width, resizeStartSize.height, zoom, calculateSnapPosition, card.size, dispatch, card.id, card.position.x, card.position.y]);
  
  // Handle mouse up for drag and resize
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeType(null);
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
  
  // Determine card title and content from card data
  const cardTitle = card.data?.title || 'Untitled Card';
  const cardContent = card.data?.content || 'No content';
  
  return (
    <CardWrapper
      ref={cardRef}
      selected={selected}
      style={{
        left: card.position.x,
        top: card.position.y,
        width: card.size.width,
        height: card.size.height,
        zIndex: selected ? 2 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <ContentWrapper>
        {/* Card content */}
        <Typography variant="h6" gutterBottom>{cardTitle}</Typography>
        <Typography variant="body2">{cardContent}</Typography>
      </ContentWrapper>
      
      {/* Resize handles - only show when selected */}
      {selected && (
        <>
          <ResizeHandle 
            className="tl" 
            onMouseDown={(e) => handleResizeStart(e, 'tl')} 
          />
          <ResizeHandle 
            className="tr" 
            onMouseDown={(e) => handleResizeStart(e, 'tr')} 
          />
          <ResizeHandle 
            className="bl" 
            onMouseDown={(e) => handleResizeStart(e, 'bl')} 
          />
          <ResizeHandle 
            className="br" 
            onMouseDown={(e) => handleResizeStart(e, 'br')} 
          />
        </>
      )}
    </CardWrapper>
  );
};

export default CanvasCard; 