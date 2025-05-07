import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { updateViewport } from '../../store/slices/canvasSlice';

interface UseCanvasViewportProps {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export interface ViewportState {
  pan: { x: number; y: number };
  zoom: number;
  isPanning: boolean;
}

/**
 * Custom hook for managing canvas viewport (pan, zoom)
 * 
 * This hook provides smooth viewport management with:
 * - Infinite pan
 * - Smooth zoom with configurable range
 * - Zoom centered on mouse position
 * - Viewport constraints
 */
export const useCanvasViewport = ({
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1
}: UseCanvasViewportProps = {}) => {
  const dispatch = useDispatch();
  const { pan, zoom } = useSelector((state: RootState) => state.canvas.viewport);
  
  // Local state for active panning
  const [isPanning, setIsPanning] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement | null>(null);
  
  // Start panning
  const startPan = useCallback((e: React.MouseEvent | MouseEvent) => {
    setIsPanning(true);
    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  }, []);
  
  // Pan during mouse move
  const doPan = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!isPanning) return;
    
    const dx = e.clientX - lastMousePosition.x;
    const dy = e.clientY - lastMousePosition.y;
    
    dispatch(updateViewport({
      pan: {
        x: pan.x + dx,
        y: pan.y + dy
      }
    }));
    
    setLastMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  }, [isPanning, lastMousePosition, pan, dispatch]);
  
  // End panning
  const endPan = useCallback(() => {
    setIsPanning(false);
  }, []);
  
  // Zoom centered on mouse position
  const zoomToPoint = useCallback((e: React.WheelEvent | WheelEvent, delta: number) => {
    if (!canvasRef.current) return;
    
    // Get canvas bounds
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate mouse position in world space (before zoom)
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    
    // Calculate new zoom level
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom + delta));
    
    // Calculate new pan to keep mouse over same world position
    const newPan = {
      x: mouseX - worldX * newZoom,
      y: mouseY - worldY * newZoom
    };
    
    // Update viewport
    dispatch(updateViewport({
      pan: newPan,
      zoom: newZoom
    }));
  }, [pan, zoom, minZoom, maxZoom, dispatch]);
  
  // Handle wheel event for zooming
  const handleWheel = useCallback((e: React.WheelEvent | WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * zoomStep;
      zoomToPoint(e, delta);
    }
  }, [zoomStep, zoomToPoint]);
  
  // Zoom in (centered on canvas)
  const zoomIn = useCallback(() => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const center = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      preventDefault: () => {}
    };
    
    zoomToPoint(center as unknown as WheelEvent, zoomStep);
  }, [zoomStep, zoomToPoint]);
  
  // Zoom out (centered on canvas)
  const zoomOut = useCallback(() => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const center = {
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      preventDefault: () => {}
    };
    
    zoomToPoint(center as unknown as WheelEvent, -zoomStep);
  }, [zoomStep, zoomToPoint]);
  
  // Reset viewport to initial state
  const resetViewport = useCallback(() => {
    dispatch(updateViewport({
      pan: { x: 0, y: 0 },
      zoom: 1
    }));
  }, [dispatch]);
  
  // Fit content to viewport
  const fitToContent = useCallback((bbox: { minX: number; minY: number; maxX: number; maxY: number }, padding = 50) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    
    const contentWidth = bbox.maxX - bbox.minX + padding * 2;
    const contentHeight = bbox.maxY - bbox.minY + padding * 2;
    
    // Calculate zoom to fit content
    const zoomX = containerWidth / contentWidth;
    const zoomY = containerHeight / contentHeight;
    const newZoom = Math.min(
      Math.min(zoomX, zoomY), // Take the smallest zoom that fits
      maxZoom // Don't exceed max zoom
    );
    
    // Calculate center of content
    const contentCenterX = (bbox.minX + bbox.maxX) / 2;
    const contentCenterY = (bbox.minY + bbox.maxY) / 2;
    
    // Calculate new pan to center content
    const newPan = {
      x: containerWidth / 2 - contentCenterX * newZoom,
      y: containerHeight / 2 - contentCenterY * newZoom
    };
    
    // Update viewport
    dispatch(updateViewport({
      pan: newPan,
      zoom: newZoom
    }));
  }, [dispatch, maxZoom]);
  
  // Current viewport state
  const viewport: ViewportState = {
    pan,
    zoom,
    isPanning
  };
  
  // Calculated CSS transform for canvas
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;
  
  return {
    canvasRef,
    viewport,
    transform,
    startPan,
    doPan,
    endPan,
    zoomToPoint,
    handleWheel,
    zoomIn,
    zoomOut,
    resetViewport,
    fitToContent,
    isPanning
  };
};

export default useCanvasViewport; 