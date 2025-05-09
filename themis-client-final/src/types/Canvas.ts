// Basic types for Canvas visualization

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Card {
  id: string;
  position: Position;
  size: Size;
  content?: any;
  title?: string;
  data?: {
    title?: string;
    content?: string;
  };
  groupId?: string;
}

export interface CardGroup {
  id: string;
  title: string;
  position: Position;
  size: Size;
  cardIds: string[];
}

export interface Connection {
  id: string;
  fromId?: string;
  toId?: string;
  sourceId?: string;
  targetId?: string;
  type?: string;
  points?: Position[];
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} 