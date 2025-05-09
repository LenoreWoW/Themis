import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Paper, Typography, CircularProgress, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';

// Types
interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface NodeData {
  id: string;
  title: string;
  type: string; // 'project' | 'goal'
  status: string;
  category?: string;
  progress?: number;
}

interface Node {
  id: string;
  position: Position;
  size: Size;
  data: NodeData;
}

interface ConnectionData {
  type: string; // 'supports' | 'supportedBy' | 'relatedTo'
  weight: number;
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
  data: ConnectionData;
}

interface MindMapCanvasProps {
  nodes: Node[];
  connections: Connection[];
  centerNodeId?: string;
  loading?: boolean;
  onNodeClick?: (nodeId: string) => void;
}

// Styled components
const CanvasContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

const CanvasContent = styled(Box)(() => ({
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
  transformOrigin: '0 0'
}));

const NodeBox = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>(({ theme, selected }) => ({
  position: 'absolute',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
  cursor: 'pointer',
  transition: 'transform 0.1s, box-shadow 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[6],
    zIndex: 2
  },
  zIndex: selected ? 2 : 1,
  border: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
}));

const ProjectNode = styled(NodeBox)(({ theme }) => ({
  backgroundColor: `${theme.palette.secondary.light}40`,
  borderLeft: `4px solid ${theme.palette.secondary.main}`,
}));

const GoalNode = styled(NodeBox)(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.light}40`,
  borderLeft: `4px solid ${theme.palette.primary.main}`,
}));

const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  nodes,
  connections,
  centerNodeId,
  loading = false,
  onNodeClick,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState<Position | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Center the canvas on the specified node
  useEffect(() => {
    if (centerNodeId && canvasRef.current) {
      const centerNode = nodes.find(node => node.id === centerNodeId);
      if (centerNode) {
        const containerRect = canvasRef.current.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        setPan({
          x: centerX - centerNode.position.x * zoom,
          y: centerY - centerNode.position.y * zoom
        });
      }
    }
  }, [centerNodeId, nodes, zoom]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle mouse button (wheel click) or right mouse button
    if (e.button === 1 || e.button === 2) {
      e.preventDefault();
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && startPanPoint) {
      setPan({
        x: e.clientX - startPanPoint.x,
        y: e.clientY - startPanPoint.y
      });
    }
  }, [isPanning, startPanPoint]);

  // Handle mouse up to end panning
  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setStartPanPoint(null);
  }, []);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.1, Math.min(2, zoom + delta));
    
    // Get mouse position relative to the canvas
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new pan values to zoom towards/away from cursor position
    const newPan = {
      x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
      y: mouseY - (mouseY - pan.y) * (newZoom / zoom)
    };
    
    setZoom(newZoom);
    setPan(newPan);
  }, [zoom, pan]);

  // Handle node click
  const handleNodeClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
    if (onNodeClick) {
      onNodeClick(nodeId);
    }
  }, [onNodeClick]);

  // Transform style for the canvas content
  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  // Render each node
  const renderNodes = useCallback(() => {
    return nodes.map(node => {
      const NodeComponent = node.data.type === 'project' ? ProjectNode : GoalNode;
      const isSelected = node.id === selectedNodeId;
      
      // Calculate status color
      let statusColor = '#888';
      switch (node.data.status) {
        case 'COMPLETED':
        case 'completed':
          statusColor = '#4caf50';
          break;
        case 'IN_PROGRESS':
        case 'in_progress':
          statusColor = '#2196f3';
          break;
        case 'NOT_STARTED':
        case 'not_started':
          statusColor = '#f44336';
          break;
        case 'ON_HOLD':
        case 'on_hold':
          statusColor = '#ff9800';
          break;
      }
      
      return (
        <Tooltip
          key={node.id}
          title={`${node.data.title} (${node.data.status})`}
          arrow
        >
          <NodeComponent
            selected={isSelected}
            style={{
              left: node.position.x,
              top: node.position.y,
              width: node.size.width,
              height: node.size.height
            }}
            onClick={(e) => handleNodeClick(e, node.id)}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                mb: 0.5
              }}
            >
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  mr: 1
                }}
              />
              <Typography variant="subtitle2" noWrap>
                {node.data.title}
              </Typography>
            </Box>
            <Typography variant="caption" color="textSecondary" component="div">
              {node.data.type === 'project' ? 'Project' : 'Goal'}
              {node.data.progress !== undefined && `: ${node.data.progress}%`}
            </Typography>
          </NodeComponent>
        </Tooltip>
      );
    });
  }, [nodes, selectedNodeId, handleNodeClick]);

  // Calculate a curved path between two nodes
  const getCurvedPath = useCallback((from: Position, to: Position) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    return `M${from.x},${from.y}A${dr},${dr} 0 0,1 ${to.x},${to.y}`;
  }, []);

  // Get center position of a node
  const getNodeCenter = useCallback((nodeId: string): Position => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    return {
      x: node.position.x + node.size.width / 2,
      y: node.position.y + node.size.height / 2
    };
  }, [nodes]);

  // Render connections between nodes
  const renderConnections = useCallback(() => {
    return connections.map(connection => {
      const fromCenter = getNodeCenter(connection.fromId);
      const toCenter = getNodeCenter(connection.toId);
      
      if (!fromCenter || !toCenter) return null;
      
      // Determine line color based on connection type
      let strokeColor = '#888';
      let markerEnd = '';
      
      switch (connection.data.type) {
        case 'supports':
          strokeColor = '#4caf50';
          markerEnd = 'url(#arrowSupports)';
          break;
        case 'supportedBy':
          strokeColor = '#2196f3';
          markerEnd = 'url(#arrowSupportedBy)';
          break;
        case 'relatedTo':
          strokeColor = '#ff9800';
          markerEnd = '';
          break;
      }
      
      // Line width based on weight
      const strokeWidth = 1 + (connection.data.weight / 30);
      
      // Create path
      const path = getCurvedPath(fromCenter, toCenter);
      
      return (
        <path
          key={connection.id}
          d={path}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          markerEnd={markerEnd}
          style={{ pointerEvents: 'none' }}
        />
      );
    });
  }, [connections, getNodeCenter, getCurvedPath]);

  return (
    <CanvasContainer
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      sx={{
        cursor: isPanning ? 'grabbing' : 'default'
      }}
    >
      <CanvasContent
        style={{
          transform
        }}
      >
        {/* SVG layer for connections */}
        <svg
          width="100%"
          height="100%"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            overflow: 'visible',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <marker
              id="arrowSupports"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4caf50" />
            </marker>
            <marker
              id="arrowSupportedBy"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#2196f3" />
            </marker>
          </defs>
          {renderConnections()}
        </svg>
        
        {/* Node layer */}
        {renderNodes()}
      </CanvasContent>
      
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 999
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </CanvasContainer>
  );
};

export default MindMapCanvas; 