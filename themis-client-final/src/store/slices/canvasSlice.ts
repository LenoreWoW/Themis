import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Types
export type CardType = 'basic' | 'note' | 'image' | 'file';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CardData {
  title?: string;
  content?: string;
  color?: string;
  [key: string]: any;
}

export interface Card {
  id: string;
  type: CardType;
  position: Position;
  size: Size;
  groupId?: string | null;
  data?: CardData;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  label?: string;
}

export interface CardGroup {
  id: string;
  title: string;
  color?: string;
  cardIds: string[];
  position: Position;
  size: Size;
}

export interface Viewport {
  pan: Position;
  zoom: number;
  isPanning: boolean;
}

export interface HistoryEntry {
  cards: Record<string, Card>;
  connections: Record<string, Connection>;
  groups: Record<string, CardGroup>;
}

export interface CanvasState {
  id: string;
  name: string;
  cards: Record<string, Card>;
  connections: Record<string, Connection>;
  groups: Record<string, CardGroup>;
  selectedCardIds: string[];
  selectedConnectionIds: string[];
  selectedGroupIds: string[];
  viewport: Viewport;
  gridSize: number;
  snapToGrid: boolean;
  snapToObjects: boolean;
  showGrid: boolean;
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
  isModified: boolean;
}

const initialState: CanvasState = {
  id: uuidv4(),
  name: 'Untitled Canvas',
  cards: {},
  connections: {},
  groups: {},
  selectedCardIds: [],
  selectedConnectionIds: [],
  selectedGroupIds: [],
  viewport: {
    pan: { x: 0, y: 0 },
    zoom: 1,
    isPanning: false
  },
  gridSize: 20,
  snapToGrid: true,
  snapToObjects: true,
  showGrid: true,
  history: {
    past: [],
    future: []
  },
  isModified: false,
};

// Helper function to create a history entry
const createHistoryEntry = (state: CanvasState): HistoryEntry => {
  return {
    cards: { ...state.cards },
    connections: { ...state.connections },
    groups: { ...state.groups }
  };
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    // Canvas settings
    setCanvasName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.isModified = true;
    },
    setSnapToGrid: (state, action: PayloadAction<boolean>) => {
      state.snapToGrid = action.payload;
    },
    setGridSize: (state, action: PayloadAction<number>) => {
      state.gridSize = action.payload;
    },
    setSnapToObjects: (state, action: PayloadAction<boolean>) => {
      state.snapToObjects = action.payload;
    },
    setShowGrid: (state, action: PayloadAction<boolean>) => {
      state.showGrid = action.payload;
    },
    
    // Viewport actions
    setPan: (state, action: PayloadAction<Position>) => {
      state.viewport.pan = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.viewport.zoom = action.payload;
    },
    setIsPanning: (state, action: PayloadAction<boolean>) => {
      state.viewport.isPanning = action.payload;
    },
    
    // Card actions
    addCard: (state, action: PayloadAction<Card>) => {
      // Save current state to history
      state.history.past.push(createHistoryEntry(state));
      state.history.future = [];
      
      // Add new card
      state.cards[action.payload.id] = action.payload;
    },
    updateCard: (state, action: PayloadAction<{ id: string; changes: Partial<Card> }>) => {
      const { id, changes } = action.payload;
      
      if (state.cards[id]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Update card
        state.cards[id] = { ...state.cards[id], ...changes };
      }
    },
    removeCard: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      
      if (state.cards[cardId]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Remove any connections that use this card
        Object.keys(state.connections).forEach(connectionId => {
          const connection = state.connections[connectionId];
          if (connection.fromId === cardId || connection.toId === cardId) {
            delete state.connections[connectionId];
            
            // Remove from selection if needed
            state.selectedConnectionIds = state.selectedConnectionIds.filter(id => id !== connectionId);
          }
        });
        
        // Remove from any groups
        Object.keys(state.groups).forEach(groupId => {
          const group = state.groups[groupId];
          if (group.cardIds.includes(cardId)) {
            state.groups[groupId].cardIds = group.cardIds.filter(id => id !== cardId);
          }
        });
        
        // Remove from selection
        state.selectedCardIds = state.selectedCardIds.filter(id => id !== cardId);
        
        // Delete the card
        delete state.cards[cardId];
      }
    },
    
    // Connection actions
    addConnection: (state, action: PayloadAction<Connection>) => {
      // Save current state to history
      state.history.past.push(createHistoryEntry(state));
      state.history.future = [];
      
      // Add new connection
      state.connections[action.payload.id] = action.payload;
    },
    updateConnection: (state, action: PayloadAction<{ id: string; changes: Partial<Connection> }>) => {
      const { id, changes } = action.payload;
      
      if (state.connections[id]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Update connection
        state.connections[id] = { ...state.connections[id], ...changes };
      }
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      const connectionId = action.payload;
      
      if (state.connections[connectionId]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Remove from selection
        state.selectedConnectionIds = state.selectedConnectionIds.filter(id => id !== connectionId);
        
        // Delete the connection
        delete state.connections[connectionId];
      }
    },
    
    // Group actions
    addGroup: (state, action: PayloadAction<CardGroup>) => {
      // Save current state to history
      state.history.past.push(createHistoryEntry(state));
      state.history.future = [];
      
      // Add new group
      state.groups[action.payload.id] = action.payload;
      
      // Update card groupIds
      action.payload.cardIds.forEach(cardId => {
        if (state.cards[cardId]) {
          state.cards[cardId].groupId = action.payload.id;
        }
      });
    },
    updateGroup: (state, action: PayloadAction<{ id: string; changes: Partial<CardGroup> }>) => {
      const { id, changes } = action.payload;
      
      if (state.groups[id]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Handle cardIds changes (adding/removing cards from group)
        if (changes.cardIds) {
          // Remove groupId from cards no longer in the group
          state.groups[id].cardIds.forEach(cardId => {
            if (state.cards[cardId] && !changes.cardIds!.includes(cardId)) {
              state.cards[cardId].groupId = null;
            }
          });
          
          // Add groupId to new cards in the group
          changes.cardIds.forEach(cardId => {
            if (state.cards[cardId] && !state.groups[id].cardIds.includes(cardId)) {
              state.cards[cardId].groupId = id;
            }
          });
        }
        
        // Update group
        state.groups[id] = { ...state.groups[id], ...changes };
      }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      
      if (state.groups[groupId]) {
        // Save current state to history
        state.history.past.push(createHistoryEntry(state));
        state.history.future = [];
        
        // Remove groupId from cards in this group
        state.groups[groupId].cardIds.forEach(cardId => {
          if (state.cards[cardId]) {
            state.cards[cardId].groupId = null;
          }
        });
        
        // Remove from selection
        state.selectedGroupIds = state.selectedGroupIds.filter(id => id !== groupId);
        
        // Delete the group
        delete state.groups[groupId];
      }
    },
    
    // Selection actions
    selectCard: (state, action: PayloadAction<string>) => {
      const cardId = action.payload;
      if (state.cards[cardId] && !state.selectedCardIds.includes(cardId)) {
        state.selectedCardIds.push(cardId);
      }
    },
    selectConnection: (state, action: PayloadAction<string>) => {
      const connectionId = action.payload;
      if (state.connections[connectionId] && !state.selectedConnectionIds.includes(connectionId)) {
        state.selectedConnectionIds.push(connectionId);
      }
    },
    selectGroup: (state, action: PayloadAction<string>) => {
      const groupId = action.payload;
      if (state.groups[groupId] && !state.selectedGroupIds.includes(groupId)) {
        state.selectedGroupIds.push(groupId);
      }
    },
    deselectCard: (state, action: PayloadAction<string>) => {
      state.selectedCardIds = state.selectedCardIds.filter(id => id !== action.payload);
    },
    deselectConnection: (state, action: PayloadAction<string>) => {
      state.selectedConnectionIds = state.selectedConnectionIds.filter(id => id !== action.payload);
    },
    deselectGroup: (state, action: PayloadAction<string>) => {
      state.selectedGroupIds = state.selectedGroupIds.filter(id => id !== action.payload);
    },
    clearSelection: (state) => {
      state.selectedCardIds = [];
      state.selectedConnectionIds = [];
      state.selectedGroupIds = [];
    },
    
    // History actions
    undoCanvas: (state) => {
      if (state.history.past.length > 0) {
        // Save current state to future
        state.history.future.unshift(createHistoryEntry(state));
        
        // Restore previous state
        const previousState = state.history.past.pop()!;
        state.cards = previousState.cards;
        state.connections = previousState.connections;
        state.groups = previousState.groups;
        
        // Clear selection
        state.selectedCardIds = [];
        state.selectedConnectionIds = [];
        state.selectedGroupIds = [];
      }
    },
    redoCanvas: (state) => {
      if (state.history.future.length > 0) {
        // Save current state to past
        state.history.past.push(createHistoryEntry(state));
        
        // Restore next state
        const nextState = state.history.future.shift()!;
        state.cards = nextState.cards;
        state.connections = nextState.connections;
        state.groups = nextState.groups;
        
        // Clear selection
        state.selectedCardIds = [];
        state.selectedConnectionIds = [];
        state.selectedGroupIds = [];
      }
    },
    
    // Canvas data actions
    loadCanvas: (state) => {
      // This is handled by middleware/thunk in a real implementation
      // Here we just simulate loading by doing nothing
      console.log('Loading canvas data...');
    },
    saveCanvas: (state) => {
      // This is handled by middleware/thunk in a real implementation
      // Here we just simulate saving by doing nothing
      console.log('Saving canvas data...');
    },
    setCanvasSaved: (state) => {
      state.isModified = false;
    },
  },
});

export const {
  setCanvasName,
  setSnapToGrid,
  setGridSize,
  setSnapToObjects,
  setShowGrid,
  setPan,
  setZoom,
  setIsPanning,
  addCard,
  updateCard,
  removeCard,
  addConnection,
  updateConnection,
  removeConnection,
  addGroup,
  updateGroup,
  removeGroup,
  selectCard,
  selectConnection,
  selectGroup,
  deselectCard,
  deselectConnection,
  deselectGroup,
  clearSelection,
  undoCanvas,
  redoCanvas,
  loadCanvas,
  saveCanvas,
  setCanvasSaved,
} = canvasSlice.actions;

export default canvasSlice.reducer; 