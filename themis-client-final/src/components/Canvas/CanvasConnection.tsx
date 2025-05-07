import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Connection } from '../../store/slices/canvasSlice';
import { styled } from '@mui/material/styles';

const ConnectionPath = styled('path')<{ selected?: boolean }>(({ theme, selected }) => ({
  stroke: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  strokeWidth: selected ? 2 : 1,
  fill: 'none',
  pointerEvents: 'stroke',
  cursor: 'pointer',
  transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
  '&:hover': {
    stroke: theme.palette.primary.main,
    strokeWidth: 2,
  }
}));

const EndpointCircle = styled('circle')<{ selected?: boolean }>(({ theme, selected }) => ({
  fill: selected ? theme.palette.primary.main : theme.palette.background.paper,
  stroke: selected ? theme.palette.primary.main : theme.palette.text.secondary,
  strokeWidth: selected ? 2 : 1,
  cursor: 'pointer',
  pointerEvents: 'all',
  '&:hover': {
    fill: theme.palette.primary.main,
    stroke: theme.palette.primary.main,
  }
}));

const ConnectionLabel = styled('text')(({ theme }) => ({
  fill: theme.palette.text.primary,
  fontSize: '12px',
  textAnchor: 'middle',
  pointerEvents: 'none',
  userSelect: 'none',
}));

interface CanvasConnectionProps {
  connection: Connection;
  selected: boolean;
  onSelect: (id: string, multi: boolean) => void;
}

/**
 * Canvas Connection Component
 * 
 * Renders a connection line between two cards on the canvas
 */
const CanvasConnection: React.FC<CanvasConnectionProps> = ({
  connection,
  selected,
  onSelect
}) => {
  const cards = useSelector((state: RootState) => state.canvas.cards);
  
  // Calculate the connection path points
  const { path, midPoint } = useMemo(() => {
    const fromCard = cards[connection.fromId];
    const toCard = cards[connection.toId];
    
    if (!fromCard || !toCard) {
      return { path: '', midPoint: { x: 0, y: 0 } };
    }
    
    // Calculate center points of cards
    const fromCenter = {
      x: fromCard.position.x + fromCard.size.width / 2,
      y: fromCard.position.y + fromCard.size.height / 2
    };
    
    const toCenter = {
      x: toCard.position.x + toCard.size.width / 2,
      y: toCard.position.y + toCard.size.height / 2
    };
    
    // Calculate direction vector
    const dx = toCenter.x - fromCenter.x;
    const dy = toCenter.y - fromCenter.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Normalize direction
    const dirX = dx / length;
    const dirY = dy / length;
    
    // Get the intersection points of the line with the card boundaries
    // This simplified approach calculates points at the edge of each card in the direction of the other card
    const fromIntersect = getIntersectionPoint(fromCard, { x: dirX, y: dirY });
    const toIntersect = getIntersectionPoint(toCard, { x: -dirX, y: -dirY });
    
    // Calculate bezier control points (for a slight curve)
    const midPoint = {
      x: (fromIntersect.x + toIntersect.x) / 2,
      y: (fromIntersect.y + toIntersect.y) / 2
    };
    
    // Create the SVG path
    const path = `M ${fromIntersect.x} ${fromIntersect.y} 
                  Q ${midPoint.x + dirY * 30} ${midPoint.y - dirX * 30} ${toIntersect.x} ${toIntersect.y}`;
    
    return { path, midPoint };
  }, [cards, connection.fromId, connection.toId]);
  
  // Calculate intersection point of line from center of card in direction dir
  const getIntersectionPoint = (card: any, dir: { x: number, y: number }) => {
    const center = {
      x: card.position.x + card.size.width / 2,
      y: card.position.y + card.size.height / 2
    };
    
    const halfWidth = card.size.width / 2;
    const halfHeight = card.size.height / 2;
    
    // Calculate potential intersection distances
    let tX = dir.x !== 0 ? (dir.x > 0 ? halfWidth : -halfWidth) / dir.x : Infinity;
    let tY = dir.y !== 0 ? (dir.y > 0 ? halfHeight : -halfHeight) / dir.y : Infinity;
    
    // Choose smallest positive t
    const t = Math.min(Math.abs(tX), Math.abs(tY));
    
    return {
      x: center.x + dir.x * t,
      y: center.y + dir.y * t
    };
  };
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(connection.id, e.shiftKey);
  };
  
  // If path is empty (cards not found), don't render
  if (!path) return null;
  
  return (
    <g onClick={handleClick}>
      <ConnectionPath selected={selected} d={path} />
      
      {/* Connection endpoints */}
      <EndpointCircle 
        selected={selected} 
        cx={path.split(' ')[1]} 
        cy={path.split(' ')[2]} 
        r="4" 
      />
      <EndpointCircle 
        selected={selected} 
        cx={path.split(' ')[path.split(' ').length - 2]} 
        cy={path.split(' ')[path.split(' ').length - 1]} 
        r="4" 
      />
      
      {/* Label (if applicable) */}
      {connection.label && (
        <ConnectionLabel x={midPoint.x} y={midPoint.y - 10}>
          {connection.label}
        </ConnectionLabel>
      )}
    </g>
  );
};

export default CanvasConnection; 