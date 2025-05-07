# Obsidian Advanced Canvas Integration Plan

This document outlines the implementation strategy for integrating the key features from Obsidian Advanced Canvas into the Themis IdeationCanvas component.

## 1. Architecture Alignment

### Component Mapping

| Obsidian Component | Themis Equivalent | Implementation Notes |
|-------------------|-------------------|---------------------|
| Canvas | CanvasSurface | Core canvas container with viewport management |
| CanvasNode | CanvasCard | Card component with multiple content types |
| CanvasEdge | CanvasConnector | Connection between cards with styling options |
| - | CanvasMinimap | New component to implement minimap functionality |
| - | CanvasToolbar | Enhanced toolbar with new features |
| CanvasGroupNode | CanvasGroup | Group container with collapsible functionality |
| - | CanvasExport | New component for export functionality |

### State Management

1. Create a `canvasSlice` in Redux store with these key sections:
   - `nodes`: Array of card data
   - `edges`: Array of connection data
   - `groups`: Array of group data
   - `viewport`: Current pan/zoom state
   - `selection`: Currently selected elements
   - `history`: Undo/redo stack

2. Implement autosave middleware that:
   - Tracks changes to canvas state
   - Debounces save operations
   - Writes to `.canvas.json` format
   - Handles error recovery

3. Map Obsidian canvas data format to Themis data model:
   ```typescript
   // Themis Card to Obsidian Node mapping
   const mapCardToCanvasNode = (card: Card): CanvasNodeData => ({
     id: card.id,
     type: mapCardType(card.type),
     x: card.position.x,
     y: card.position.y,
     width: card.size.width,
     height: card.size.height,
     color: card.color,
     // Map other properties
   });
   
   // Obsidian Node to Themis Card mapping
   const mapCanvasNodeToCard = (node: CanvasNodeData): Card => ({
     id: node.id,
     type: mapNodeType(node.type),
     position: { x: node.x, y: node.y },
     size: { width: node.width, height: node.height },
     color: node.color,
     // Map other properties
   });
   ```

## 2. Feature Implementation Plan

### Phase 1: Core Canvas Engine (Week 1)

1. **Enhanced Viewport Management**
   - Implement infinite pan-zoom with smooth scaling
   - Support zoom ranges from 0.1x to 5x
   - Add viewport constraints and boundaries
   - Port relevant code from `src/canvas-extensions/variable-breakpoint-canvas-extension.ts`

2. **Performance Optimization**
   - Implement viewport culling (only render visible elements)
   - Add element pooling for large canvases
   - Optimize redraw cycles
   - Implement efficient DOM updates

3. **Snap Utilities**
   - Add snap-to-grid functionality with configurable grid size
   - Implement snap-to-objects with magnetic alignment
   - Create visual indicators for snapping
   - Port from `CanvasHelper` utilities

### Phase 2: Card Types and Interactions (Week 2)

1. **Enhanced Card Types**
   - Implement all required card types:
     - Text cards with rich formatting
     - Markdown note cards with preview/edit modes
     - Media cards (image, video)
     - URL preview cards with fetch/cache system
     - File reference cards with one-click conversion
   - Port relevant code from Obsidian node types

2. **Connection System**
   - Implement bidirectional connections
   - Add connection styles (solid, dashed, dotted)
   - Support connection labels with editing
   - Add arrow markers with customization
   - Port from `src/canvas-extensions/floating-edge-canvas-extension.ts`

3. **Selection System**
   - Implement multi-select with shift/ctrl modifiers
   - Add drag-select (marquee) tool
   - Improve bounding-box math for selections
   - Add group selection utilities
   - Port from selection system in Canvas

### Phase 3: Advanced Features (Week 3)

1. **Minimap Navigation**
   - Implement minimap component showing entire canvas
   - Add viewport rectangle indicating current view
   - Support click-to-navigate functionality
   - Implement efficient rendering for large canvases
   - Create custom implementation based on canvas state

2. **Export Functionality**
   - Implement export to PNG with resolution options
   - Add SVG export with settings
   - Integrate with backend for PDF generation
   - Add export dialog with options
   - Port from `src/canvas-extensions/export-canvas-extension.ts`

3. **Group Containers**
   - Implement collapsible groups
   - Add drag-select creation of groups
   - Support nested groups
   - Implement proper z-ordering for groups
   - Port from `src/canvas-extensions/group-canvas-extension.ts` and `src/canvas-extensions/collapsible-groups-canvas-extension.ts`

### Phase 4: Integration and Polish (Week 4)

1. **State Integration**
   - Finalize Redux integration
   - Implement undo/redo functionality
   - Add autosave middleware
   - Create migration utilities for existing data

2. **UI Refinements**
   - Align styling with Themis design system
   - Enhance visual feedback for interactions
   - Improve accessibility features
   - Add comprehensive keyboard shortcuts

3. **Testing and Optimization**
   - Stress test with 500+ nodes
   - Verify 60fps performance on mid-tier hardware
   - Test loading/saving performance
   - Fix any console warnings or errors

## 3. Implementation Details

### Key Files to Create/Modify

```
src/
  components/
    Canvas/
      CanvasSurface.tsx       # Main canvas component
      CanvasCard.tsx          # Card component with multiple types
      CanvasConnector.tsx     # Connection component
      CanvasMinimap.tsx       # Minimap navigation component
      CanvasToolbar.tsx       # Enhanced toolbar
      CanvasGroup.tsx         # Group container component
      CanvasExport.tsx        # Export dialog and functionality
  hooks/
    canvas/
      useCanvasViewport.ts    # Viewport management hook
      useCanvasSelection.ts   # Selection management hook
      useCanvasHistory.ts     # Undo/redo functionality
      useCanvasSnap.ts        # Snapping utilities
      useCanvasExport.ts      # Export functionality
  store/
    slices/
      canvasSlice.ts          # Redux slice for canvas state
  utils/
    canvas/
      connectorUtils.ts       # Connection calculation utilities
      bboxUtils.ts            # Bounding box math
      exportUtils.ts          # Export utilities
      canvasFormatUtils.ts    # Format conversion utilities
```

### Dependencies to Add

```json
{
  "dependencies": {
    "html-to-image": "^1.11.11",     // For canvas export
    "konva": "^8.4.3",               // Canvas rendering library
    "react-konva": "^18.2.5",        // React wrapper for Konva
    "file-saver": "^2.0.5",          // For saving exported files
    "jspdf": "^2.5.1"                // For PDF generation (client-side)
  }
}
```

## 4. Migration Strategy

1. **Initial Setup**
   - Create parallel implementation without disrupting existing functionality
   - Develop and test in isolation

2. **Legacy Data Migration**
   - Create a conversion script to translate existing canvas data
   - Implement format validation and error handling
   - Add fallback for incompatible data

3. **Gradual Rollout**
   - Replace components one by one starting with non-user-facing ones
   - Implement feature flags for new functionality
   - Add telemetry for performance monitoring

4. **Testing**
   - Create automated tests for core functionality
   - Manual testing for UI/UX features
   - Performance benchmarking

## 5. Documentation

1. **User Documentation**
   - Update user guide with new features
   - Create tutorial videos/GIFs
   - Add keyboard shortcut reference

2. **Developer Documentation**
   - Document component APIs
   - Create integration guide for future extensions
   - Add code comments for complex algorithms

## Completion Criteria

The integration will be considered complete when:
1. All features listed in the requirements are implemented
2. Performance meets or exceeds the target metrics
3. All existing canvas data is successfully migrated
4. Export functions work flawlessly with all formats
5. Documentation is complete and accurate 