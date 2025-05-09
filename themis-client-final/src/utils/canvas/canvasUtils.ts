import { Card, Connection, BBox } from '../../types/Canvas';

/**
 * Creates an empty bounding box
 */
export const createEmptyBBox = (): BBox => ({
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0
});

/**
 * Create a bounding box for a connection
 */
export const createConnectionBBox = (connection: Connection, cards: Card[]): BBox => {
  // Use sourceId/targetId if available, otherwise fallback to fromId/toId
  const sourceId = connection.sourceId || connection.fromId;
  const targetId = connection.targetId || connection.toId;
  
  const sourceCard = cards.find(card => card.id === sourceId);
  const targetCard = cards.find(card => card.id === targetId);
  
  if (!sourceCard || !targetCard) return createEmptyBBox();
  
  // Calculate bounding box that encompasses both cards
  return {
    minX: Math.min(sourceCard.position.x, targetCard.position.x),
    minY: Math.min(sourceCard.position.y, targetCard.position.y),
    maxX: Math.max(
      sourceCard.position.x + sourceCard.size.width,
      targetCard.position.x + targetCard.size.width
    ),
    maxY: Math.max(
      sourceCard.position.y + sourceCard.size.height,
      targetCard.position.y + targetCard.size.height
    )
  };
}; 