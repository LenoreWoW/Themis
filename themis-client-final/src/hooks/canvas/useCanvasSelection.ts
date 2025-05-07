import { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { 
  clearSelection, 
  selectCard, 
  selectConnection, 
  selectGroup, 
  selectMultipleCards,
  Position
} from '../../store/slices/canvasSlice';
import { BBox, createBBoxFromPositionAndSize, isPointInBBox } from '../../utils/canvas/bboxUtils';

/**
 * Custom hook for managing canvas selection
 * 
 * This hook provides:
 * - Multi-select functionality
 * - Drag-select (marquee selection)
 * - Selection utilities
 * - Selection rectangle visualization
 */
export const useCanvasSelection = () => {
  const dispatch = useDispatch();
  const { cards, connections, groups } = useSelector((state: RootState) => state.canvas);
  const { cardIds, connectionIds, groupIds } = useSelector(
    (state: RootState) => state.canvas.selection
  );
  
  // Selection box state
  const [selectionBox, setSelectionBox] = useState<BBox | null>(null);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const selectionStartRef = useRef<Position | null>(null);
  
  // Start a drag selection
  const startDragSelection = useCallback((position: Position, addToSelection: boolean = false) => {
    selectionStartRef.current = position;
    setSelectionBox({
      minX: position.x,
      minY: position.y,
      maxX: position.x,
      maxY: position.y
    });
    setIsDraggingSelection(true);
    
    if (!addToSelection) {
      dispatch(clearSelection());
    }
  }, [dispatch]);
  
  // Update the drag selection
  const updateDragSelection = useCallback((position: Position, zoom: number) => {
    if (!selectionStartRef.current || !isDraggingSelection) return;
    
    const startPos = selectionStartRef.current;
    const newSelectionBox = {
      minX: Math.min(startPos.x, position.x),
      minY: Math.min(startPos.y, position.y),
      maxX: Math.max(startPos.x, position.x),
      maxY: Math.max(startPos.y, position.y)
    };
    
    setSelectionBox(newSelectionBox);
    
    // Select cards that are inside the selection box
    const selectedCardIds = cards.filter(card => {
      const cardBBox = createBBoxFromPositionAndSize(card.position, card.size);
      
      // Check if card is completely inside selection box
      return (
        cardBBox.minX >= newSelectionBox.minX &&
        cardBBox.maxX <= newSelectionBox.maxX &&
        cardBBox.minY >= newSelectionBox.minY &&
        cardBBox.maxY <= newSelectionBox.maxY
      );
    }).map(card => card.id);
    
    if (selectedCardIds.length > 0) {
      dispatch(selectMultipleCards({
        ids: selectedCardIds,
        addToSelection: true
      }));
    }
  }, [cards, dispatch, isDraggingSelection]);
  
  // End the drag selection
  const endDragSelection = useCallback(() => {
    setIsDraggingSelection(false);
    setSelectionBox(null);
    selectionStartRef.current = null;
  }, []);
  
  // Select a card
  const handleSelectCard = useCallback((id: string, addToSelection: boolean = false) => {
    dispatch(selectCard({ id, addToSelection }));
  }, [dispatch]);
  
  // Select a connection
  const handleSelectConnection = useCallback((id: string, addToSelection: boolean = false) => {
    dispatch(selectConnection({ id, addToSelection }));
  }, [dispatch]);
  
  // Select a group
  const handleSelectGroup = useCallback((id: string, addToSelection: boolean = false) => {
    dispatch(selectGroup({ id, addToSelection }));
  }, [dispatch]);
  
  // Clear the selection
  const handleClearSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);
  
  // Check if clicking on a point should select something
  const handleSelectionClick = useCallback((point: Position, addToSelection: boolean = false) => {
    // Check in reverse order of z-index (top to bottom)
    // Groups first, then cards, then connections
    
    // Check if clicked on a group
    const clickedGroup = groups.find(group => {
      const groupBBox = createBBoxFromPositionAndSize(group.position, group.size);
      return isPointInBBox(point, groupBBox);
    });
    
    if (clickedGroup) {
      dispatch(selectGroup({ id: clickedGroup.id, addToSelection }));
      return true;
    }
    
    // Check if clicked on a card
    const clickedCard = cards.find(card => {
      const cardBBox = createBBoxFromPositionAndSize(card.position, card.size);
      return isPointInBBox(point, cardBBox);
    });
    
    if (clickedCard) {
      dispatch(selectCard({ id: clickedCard.id, addToSelection }));
      return true;
    }
    
    // Check if clicked near a connection
    // This is just a simple distance check, could be improved
    const clickedConnection = connections.find(connection => {
      const sourceCard = cards.find(card => card.id === connection.sourceId);
      const targetCard = cards.find(card => card.id === connection.targetId);
      
      if (!sourceCard || !targetCard) return false;
      
      const sourceCenter = {
        x: sourceCard.position.x + sourceCard.size.width / 2,
        y: sourceCard.position.y + sourceCard.size.height / 2
      };
      
      const targetCenter = {
        x: targetCard.position.x + targetCard.size.width / 2,
        y: targetCard.position.y + targetCard.size.height / 2
      };
      
      // This is a basic line-point distance check
      // It could be improved with a more sophisticated algorithm
      const a = point.x - sourceCenter.x;
      const b = point.y - sourceCenter.y;
      const c = targetCenter.x - sourceCenter.x;
      const d = targetCenter.y - sourceCenter.y;
      
      const dot = a * c + b * d;
      const len_sq = c * c + d * d;
      let param = -1;
      
      if (len_sq !== 0) param = dot / len_sq;
      
      let xx, yy;
      
      if (param < 0) {
        xx = sourceCenter.x;
        yy = sourceCenter.y;
      } else if (param > 1) {
        xx = targetCenter.x;
        yy = targetCenter.y;
      } else {
        xx = sourceCenter.x + param * c;
        yy = sourceCenter.y + param * d;
      }
      
      const dx = point.x - xx;
      const dy = point.y - yy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      return distance < 10; // Threshold distance in pixels
    });
    
    if (clickedConnection) {
      dispatch(selectConnection({ id: clickedConnection.id, addToSelection }));
      return true;
    }
    
    // If nothing was clicked and not adding to selection, clear the selection
    if (!addToSelection) {
      dispatch(clearSelection());
    }
    
    return false;
  }, [cards, connections, groups, dispatch]);
  
  return {
    selectedCardIds: cardIds,
    selectedConnectionIds: connectionIds,
    selectedGroupIds: groupIds,
    selectionBox,
    isDraggingSelection,
    startDragSelection,
    updateDragSelection,
    endDragSelection,
    selectCard: handleSelectCard,
    selectConnection: handleSelectConnection,
    selectGroup: handleSelectGroup,
    clearSelection: handleClearSelection,
    handleSelectionClick
  };
};

export default useCanvasSelection; 