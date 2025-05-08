import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { undoCanvas as undo, redoCanvas as redo } from '../../store/slices/canvasSlice';

/**
 * Custom hook for managing canvas history (undo/redo)
 * 
 * This hook provides:
 * - Undo functionality
 * - Redo functionality
 * - History state information
 */
export const useCanvasHistory = () => {
  const dispatch = useDispatch();
  const history = useSelector((state: RootState) => state.canvas.history);
  
  // Check if undo is available
  const canUndo = history.past.length > 0;
  
  // Check if redo is available
  const canRedo = history.future.length > 0;
  
  // Perform undo
  const handleUndo = useCallback(() => {
    if (canUndo) {
      dispatch(undo());
    }
  }, [canUndo, dispatch]);
  
  // Perform redo
  const handleRedo = useCallback(() => {
    if (canRedo) {
      dispatch(redo());
    }
  }, [canRedo, dispatch]);
  
  // Handle keyboard shortcuts
  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    // Undo: Ctrl/Cmd + Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    }
    
    // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
    if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
      e.preventDefault();
      handleRedo();
    }
  }, [handleUndo, handleRedo]);
  
  return {
    canUndo,
    canRedo,
    undo: handleUndo,
    redo: handleRedo,
    handleKeyboardShortcut,
    historySize: {
      past: history.past.length,
      future: history.future.length
    }
  };
};

export default useCanvasHistory; 