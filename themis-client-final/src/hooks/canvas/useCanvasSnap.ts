import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Card, Position, Size } from '../../store/slices/canvasSlice';

/**
 * Custom hook for canvas snapping functionality
 * 
 * This hook provides:
 * - Snap-to-grid functionality
 * - Snap-to-objects functionality
 * - Utilities for calculating snap positions
 */
export const useCanvasSnap = () => {
  const { snapToGrid, gridSize, snapToObjects, cards } = useSelector((state: RootState) => state.canvas);
  
  // Get all cards except the ones with the given IDs
  const getOtherCards = useCallback((excludeIds: string[] = []): Card[] => {
    return cards.filter(card => !excludeIds.includes(card.id));
  }, [cards]);
  
  // Calculate snap position for snap-to-grid
  const calculateGridSnapPosition = useCallback((position: Position): Position => {
    if (!snapToGrid) return position;
    
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);
  
  // Calculate snap position for snap-to-objects
  const calculateObjectSnapPosition = useCallback((
    position: Position, 
    size: Size, 
    excludeIds: string[] = []
  ): Position => {
    if (!snapToObjects) return position;
    
    const SNAP_THRESHOLD = 10; // Pixels
    const otherCards = getOtherCards(excludeIds);
    
    if (otherCards.length === 0) return position;
    
    // Points to check for snapping
    const pointsToCheck = [
      // Current element points
      { x: position.x, y: position.y }, // Top-left
      { x: position.x + size.width, y: position.y }, // Top-right
      { x: position.x, y: position.y + size.height }, // Bottom-left
      { x: position.x + size.width, y: position.y + size.height }, // Bottom-right
      { x: position.x + size.width / 2, y: position.y }, // Top-middle
      { x: position.x + size.width / 2, y: position.y + size.height }, // Bottom-middle
      { x: position.x, y: position.y + size.height / 2 }, // Left-middle
      { x: position.x + size.width, y: position.y + size.height / 2 } // Right-middle
    ];
    
    let bestSnap = { 
      x: position.x, 
      y: position.y, 
      xDistance: Infinity, 
      yDistance: Infinity 
    };
    
    // Check each other card for potential snap points
    for (const card of otherCards) {
      // Other card's snap points
      const otherPoints = [
        // Other element points
        { x: card.position.x, y: card.position.y }, // Top-left
        { x: card.position.x + card.size.width, y: card.position.y }, // Top-right
        { x: card.position.x, y: card.position.y + card.size.height }, // Bottom-left
        { x: card.position.x + card.size.width, y: card.position.y + card.size.height }, // Bottom-right
        { x: card.position.x + card.size.width / 2, y: card.position.y }, // Top-middle
        { x: card.position.x + card.size.width / 2, y: card.position.y + card.size.height }, // Bottom-middle
        { x: card.position.x, y: card.position.y + card.size.height / 2 }, // Left-middle
        { x: card.position.x + card.size.width, y: card.position.y + card.size.height / 2 } // Right-middle
      ];
      
      // Check all combinations of points
      for (const point of pointsToCheck) {
        for (const otherPoint of otherPoints) {
          const xDistance = Math.abs(point.x - otherPoint.x);
          const yDistance = Math.abs(point.y - otherPoint.y);
          
          // Check for horizontal snap (x-axis)
          if (
            xDistance < SNAP_THRESHOLD && 
            xDistance < bestSnap.xDistance
          ) {
            const offsetX = point.x - position.x;
            bestSnap.x = otherPoint.x - offsetX;
            bestSnap.xDistance = xDistance;
          }
          
          // Check for vertical snap (y-axis)
          if (
            yDistance < SNAP_THRESHOLD && 
            yDistance < bestSnap.yDistance
          ) {
            const offsetY = point.y - position.y;
            bestSnap.y = otherPoint.y - offsetY;
            bestSnap.yDistance = yDistance;
          }
        }
      }
    }
    
    return {
      x: bestSnap.xDistance < SNAP_THRESHOLD ? bestSnap.x : position.x,
      y: bestSnap.yDistance < SNAP_THRESHOLD ? bestSnap.y : position.y
    };
  }, [snapToObjects, getOtherCards]);
  
  // Calculate final snap position using both grid and object snapping
  const calculateSnapPosition = useCallback((
    position: Position, 
    size: Size, 
    excludeIds: string[] = []
  ): Position => {
    // First snap to grid
    let snappedPosition = calculateGridSnapPosition(position);
    
    // Then snap to objects if needed
    snappedPosition = calculateObjectSnapPosition(snappedPosition, size, excludeIds);
    
    return snappedPosition;
  }, [calculateGridSnapPosition, calculateObjectSnapPosition]);
  
  // Check if we should show snap indicators
  const shouldShowSnapIndicators = useCallback((
    position: Position,
    size: Size,
    snappedPosition: Position
  ): { horizontal: boolean, vertical: boolean } => {
    return {
      horizontal: position.x !== snappedPosition.x,
      vertical: position.y !== snappedPosition.y
    };
  }, []);
  
  return {
    snapToGrid,
    snapToObjects,
    gridSize,
    calculateGridSnapPosition,
    calculateObjectSnapPosition,
    calculateSnapPosition,
    shouldShowSnapIndicators
  };
};

export default useCanvasSnap; 