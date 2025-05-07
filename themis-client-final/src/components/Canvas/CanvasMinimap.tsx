import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setPan } from '../../store/slices/canvasSlice';
import { Box, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { createCanvasContentBBox } from '../../utils/canvas/bboxUtils';

const MinimapContainer = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: '200px',
  height: '150px',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  overflow: 'hidden',
  zIndex: 100,
  cursor: 'pointer',
}));

const Viewport = styled(Box)(({ theme }) => ({
  position: 'absolute',
  border: `2px solid ${theme.palette.primary.main}`,
  backgroundColor: `${theme.palette.primary.main}20`,
  pointerEvents: 'none',
}));

interface CanvasMinimapProps {
  width?: number;
  height?: number;
}

/**
 * Canvas Minimap Component
 * 
 * Provides a miniature view of the entire canvas:
 * - Shows all cards and groups
 * - Displays the current viewport area
 * - Allows clicking to navigate to different areas
 */
const CanvasMinimap: React.FC<CanvasMinimapProps> = ({ 
  width = 200, 
  height = 150 
}) => {
  const dispatch = useDispatch();
  const { cards, groups, connections, viewport } = useSelector((state: RootState) => state.canvas);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [minimapScale, setMinimapScale] = useState(1);
  const [contentBounds, setContentBounds] = useState({ 
    minX: 0, minY: 0, maxX: 0, maxY: 0, 
    width: 0, height: 0 
  });
  
  // Calculate the canvas content bounds
  useEffect(() => {
    // Skip if there are no items
    if (Object.keys(cards).length === 0 && Object.keys(groups).length === 0) {
      setContentBounds({ minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 });
      return;
    }
    
    // Create bbox from all content
    const bbox = createCanvasContentBBox(
      Object.values(cards), 
      Object.values(connections), 
      Object.values(groups)
    );
    
    // Add padding
    const padding = 100;
    const paddedBbox = {
      minX: bbox.minX - padding,
      minY: bbox.minY - padding,
      maxX: bbox.maxX + padding,
      maxY: bbox.maxY + padding
    };
    
    // Calculate dimensions
    const contentWidth = paddedBbox.maxX - paddedBbox.minX;
    const contentHeight = paddedBbox.maxY - paddedBbox.minY;
    
    // Calculate scale to fit the minimap
    const scaleX = width / contentWidth;
    const scaleY = height / contentHeight;
    const scale = Math.min(scaleX, scaleY);
    
    setMinimapScale(scale);
    setContentBounds({
      ...paddedBbox,
      width: contentWidth,
      height: contentHeight
    });
  }, [cards, groups, connections, width, height]);
  
  // Handle clicking on the minimap to navigate
  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    // Get minimap container bounds
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate click position relative to minimap
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // Convert click position to canvas position
    const canvasX = contentBounds.minX + (clickX / minimapScale);
    const canvasY = contentBounds.minY + (clickY / minimapScale);
    
    // Get canvas container size
    const canvasWidth = document.querySelector('.MuiPaper-root')?.clientWidth || 800;
    const canvasHeight = document.querySelector('.MuiPaper-root')?.clientHeight || 600;
    
    // Calculate new pan position to center on the clicked point
    const newPan = {
      x: (canvasWidth / 2) - (canvasX * viewport.zoom),
      y: (canvasHeight / 2) - (canvasY * viewport.zoom)
    };
    
    // Dispatch new pan position
    dispatch(setPan(newPan));
    
    // Start dragging
    setDragging(true);
  }, [contentBounds, minimapScale, viewport.zoom, dispatch]);
  
  // Handle dragging on the minimap
  const handleMinimapMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !containerRef.current) return;
    
    // Get minimap container bounds
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate click position relative to minimap
    const clickX = e.clientX - containerRect.left;
    const clickY = e.clientY - containerRect.top;
    
    // Convert click position to canvas position
    const canvasX = contentBounds.minX + (clickX / minimapScale);
    const canvasY = contentBounds.minY + (clickY / minimapScale);
    
    // Get canvas container size
    const canvasWidth = document.querySelector('.MuiPaper-root')?.clientWidth || 800;
    const canvasHeight = document.querySelector('.MuiPaper-root')?.clientHeight || 600;
    
    // Calculate new pan position to center on the clicked point
    const newPan = {
      x: (canvasWidth / 2) - (canvasX * viewport.zoom),
      y: (canvasHeight / 2) - (canvasY * viewport.zoom)
    };
    
    // Dispatch new pan position
    dispatch(setPan(newPan));
  }, [dragging, contentBounds, minimapScale, viewport.zoom, dispatch]);
  
  // Handle mouse up to stop dragging
  const handleMinimapMouseUp = useCallback(() => {
    setDragging(false);
  }, []);
  
  // Calculate viewport rectangle
  const viewportRect = (() => {
    // Get canvas container size
    const canvasWidth = document.querySelector('.MuiPaper-root')?.clientWidth || 800;
    const canvasHeight = document.querySelector('.MuiPaper-root')?.clientHeight || 600;
    
    // Calculate the corners of the viewport in canvas coordinates
    const viewportLeft = (-viewport.pan.x / viewport.zoom);
    const viewportTop = (-viewport.pan.y / viewport.zoom);
    const viewportRight = viewportLeft + (canvasWidth / viewport.zoom);
    const viewportBottom = viewportTop + (canvasHeight / viewport.zoom);
    
    // Convert to minimap coordinates
    const minimapLeft = (viewportLeft - contentBounds.minX) * minimapScale;
    const minimapTop = (viewportTop - contentBounds.minY) * minimapScale;
    const minimapRight = (viewportRight - contentBounds.minX) * minimapScale;
    const minimapBottom = (viewportBottom - contentBounds.minY) * minimapScale;
    
    return {
      left: minimapLeft,
      top: minimapTop,
      width: minimapRight - minimapLeft,
      height: minimapBottom - minimapTop
    };
  })();
  
  // Render minimap items
  const renderMinimapItems = () => {
    const items = [];
    
    // Render groups
    for (const group of Object.values(groups)) {
      const left = (group.position.x - contentBounds.minX) * minimapScale;
      const top = (group.position.y - contentBounds.minY) * minimapScale;
      const width = group.size.width * minimapScale;
      const height = group.size.height * minimapScale;
      
      items.push(
        <Box
          key={`group-${group.id}`}
          sx={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            backgroundColor: 'transparent',
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: '2px'
          }}
        />
      );
    }
    
    // Render cards
    for (const card of Object.values(cards)) {
      const left = (card.position.x - contentBounds.minX) * minimapScale;
      const top = (card.position.y - contentBounds.minY) * minimapScale;
      const width = card.size.width * minimapScale;
      const height = card.size.height * minimapScale;
      
      items.push(
        <Box
          key={`card-${card.id}`}
          sx={{
            position: 'absolute',
            left,
            top,
            width,
            height,
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '2px'
          }}
        />
      );
    }
    
    return items;
  };
  
  // Skip rendering if there are no items
  if (contentBounds.width === 0 || contentBounds.height === 0) {
    return null;
  }
  
  return (
    <MinimapContainer
      ref={containerRef}
      onClick={handleMinimapClick}
      onMouseMove={handleMinimapMouseMove}
      onMouseUp={handleMinimapMouseUp}
      onMouseLeave={handleMinimapMouseUp}
    >
      {renderMinimapItems()}
      
      <Viewport
        style={{
          left: viewportRect.left,
          top: viewportRect.top,
          width: viewportRect.width,
          height: viewportRect.height
        }}
      />
    </MinimapContainer>
  );
};

export default CanvasMinimap; 