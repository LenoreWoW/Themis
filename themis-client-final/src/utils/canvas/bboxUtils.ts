import { Card, CardGroup, Connection, Position, Size, BBox } from '../../types/Canvas';

/**
 * Creates an empty bounding box
 */
export const createEmptyBBox = (): BBox => ({
  minX: Infinity,
  minY: Infinity,
  maxX: -Infinity,
  maxY: -Infinity
});

/**
 * Checks if a bounding box is empty (has no area)
 */
export const isEmptyBBox = (bbox: BBox): boolean => {
  return bbox.minX === Infinity || bbox.minY === Infinity || 
         bbox.maxX === -Infinity || bbox.maxY === -Infinity ||
         bbox.minX >= bbox.maxX || bbox.minY >= bbox.maxY;
};

/**
 * Creates a bounding box from a position and size
 */
export const createBBoxFromPositionAndSize = (position: Position, size: Size): BBox => ({
  minX: position.x,
  minY: position.y,
  maxX: position.x + size.width,
  maxY: position.y + size.height
});

/**
 * Creates a bounding box for a card
 */
export const createCardBBox = (card: Card): BBox => 
  createBBoxFromPositionAndSize(card.position, card.size);

/**
 * Creates a bounding box for a group
 */
export const createGroupBBox = (group: CardGroup): BBox => 
  createBBoxFromPositionAndSize(group.position, group.size);

/**
 * Creates a bounding box for a connection
 */
export const createConnectionBBox = (connection: Connection, cards: Card[]): BBox => {
  const sourceCard = cards.find(card => card.id === connection.sourceId);
  const targetCard = cards.find(card => card.id === connection.targetId);
  
  if (!sourceCard || !targetCard) return createEmptyBBox();
  
  const sourceCenter = {
    x: sourceCard.position.x + sourceCard.size.width / 2,
    y: sourceCard.position.y + sourceCard.size.height / 2
  };
  
  const targetCenter = {
    x: targetCard.position.x + targetCard.size.width / 2,
    y: targetCard.position.y + targetCard.size.height / 2
  };
  
  return {
    minX: Math.min(sourceCenter.x, targetCenter.x),
    minY: Math.min(sourceCenter.y, targetCenter.y),
    maxX: Math.max(sourceCenter.x, targetCenter.x),
    maxY: Math.max(sourceCenter.y, targetCenter.y)
  };
};

/**
 * Checks if a point is inside a bounding box
 */
export const isPointInBBox = (point: Position, bbox: BBox): boolean => {
  return (
    point.x >= bbox.minX &&
    point.x <= bbox.maxX &&
    point.y >= bbox.minY &&
    point.y <= bbox.maxY
  );
};

/**
 * Checks if a bounding box is fully contained within another bounding box
 */
export const isBBoxContainedIn = (inner: BBox, outer: BBox): boolean => {
  return (
    inner.minX >= outer.minX &&
    inner.maxX <= outer.maxX &&
    inner.minY >= outer.minY &&
    inner.maxY <= outer.maxY
  );
};

/**
 * Checks if two bounding boxes intersect
 */
export const doBBoxesIntersect = (a: BBox, b: BBox): boolean => {
  return !(
    a.maxX < b.minX ||
    a.minX > b.maxX ||
    a.maxY < b.minY ||
    a.minY > b.maxY
  );
};

/**
 * Combines multiple bounding boxes into a single bounding box that contains all of them
 */
export const combineBBoxes = (bboxes: BBox[]): BBox => {
  if (bboxes.length === 0) return createEmptyBBox();
  
  return bboxes.reduce((combined, current) => ({
    minX: Math.min(combined.minX, current.minX),
    minY: Math.min(combined.minY, current.minY),
    maxX: Math.max(combined.maxX, current.maxX),
    maxY: Math.max(combined.maxY, current.maxY)
  }), createEmptyBBox());
};

/**
 * Scales a bounding box by a factor, keeping the center in place
 */
export const scaleBBox = (bbox: BBox, scale: number): BBox => {
  if (isEmptyBBox(bbox)) return bbox;
  
  const centerX = (bbox.minX + bbox.maxX) / 2;
  const centerY = (bbox.minY + bbox.maxY) / 2;
  
  const halfWidth = (bbox.maxX - bbox.minX) / 2 * scale;
  const halfHeight = (bbox.maxY - bbox.minY) / 2 * scale;
  
  return {
    minX: centerX - halfWidth,
    minY: centerY - halfHeight,
    maxX: centerX + halfWidth,
    maxY: centerY + halfHeight
  };
};

/**
 * Expands a bounding box by a fixed amount in all directions
 */
export const expandBBox = (bbox: BBox, amount: number): BBox => {
  if (isEmptyBBox(bbox)) return bbox;
  
  return {
    minX: bbox.minX - amount,
    minY: bbox.minY - amount,
    maxX: bbox.maxX + amount,
    maxY: bbox.maxY + amount
  };
};

/**
 * Creates a bounding box for all the given cards
 */
export const createCardsCollectiveBBox = (cards: Card[]): BBox => {
  if (cards.length === 0) return createEmptyBBox();
  
  const bboxes = cards.map(createCardBBox);
  return combineBBoxes(bboxes);
};

/**
 * Creates a bounding box for all the given cards, connections, and groups
 */
export const createCanvasContentBBox = (
  cards: Card[], 
  connections: Connection[], 
  groups: CardGroup[]
): BBox => {
  const cardBBoxes = cards.map(createCardBBox);
  const connectionBBoxes = connections.map(conn => createConnectionBBox(conn, cards));
  const groupBBoxes = groups.map(createGroupBBox);
  
  return combineBBoxes([...cardBBoxes, ...connectionBBoxes, ...groupBBoxes]);
}; 