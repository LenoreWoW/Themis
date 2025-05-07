# Obsidian Advanced Canvas Module Map

## Core Subsystems

### 1. Rendering System

The rendering system is responsible for drawing and manipulating canvas elements.

#### Key Components:
- **Canvas Class**: Core rendering engine that manages the canvas element and its contents
- **Canvas Elements**: Node and Edge classes for rendering content
- **Viewport Management**: Handles pan, zoom, and viewport transformation
- **Z-Order Management**: Controls layering and stacking of elements
- **Group Rendering**: Special container elements that can hold other nodes
- **Edge Rendering**: Line/connection drawing with arrow markers and path calculation

#### Source Files:
- `src/canvas-extensions/z-ordering-canvas-extension.ts`
- `src/canvas-extensions/node-ratio-canvas-extension.ts`
- `src/canvas-extensions/variable-breakpoint-canvas-extension.ts`
- `src/canvas-extensions/floating-edge-canvas-extension.ts`
- `src/canvas-extensions/auto-resize-node-canvas-extension.ts`
- `src/styles.scss`

### 2. State Management

The state management subsystem handles data flow, state changes, and synchronization.

#### Key Components:
- **Data Model**: Types defined in `src/@types/Canvas.d.ts` and `src/@types/AdvancedJsonCanvas.d.ts`
- **History Management**: Undo/redo functionality with state tracking
- **Selection System**: Manages selected elements and multi-selection
- **Dirty State Tracking**: Tracks elements that need updating
- **Canvas Data**: Central state structure for all canvas elements

#### Source Files:
- `src/@types/Canvas.d.ts`
- `src/@types/AdvancedJsonCanvas.d.ts`
- `src/canvas-extensions/metadata-canvas-extension.ts`
- `src/main.ts` (state initialization and plugin lifecycle)

### 3. Persistence System

The persistence system handles saving, loading, and exporting canvas data.

#### Key Components:
- **Canvas JSON Format**: Serialization format defined in `src/@types/AdvancedJsonCanvas.d.ts`
- **Export Functionality**: Export to PNG, SVG via `export-canvas-extension.ts`
- **Auto-save**: Automatic saving of canvas state
- **File Integration**: Connection to Obsidian's file system

#### Source Files:
- `src/canvas-extensions/export-canvas-extension.ts`
- `src/utils/canvas-helper.ts` (contains utility functions for canvas data)
- `src/canvas-extensions/metadata-canvas-extension.ts`

### 4. User Interface

The UI subsystem provides interaction elements and visual feedback.

#### Key Components:
- **Node Interaction Layer**: Handles node selection, drag, resize
- **Toolbar**: Canvas tools and actions
- **Context Menus**: Right-click menus for elements
- **Minimap**: Navigation overview (implemented in presentation mode)
- **Modal Dialogs**: Configuration and settings dialogs

#### Source Files:
- `src/canvas-extensions/better-readonly-canvas-extension.ts`
- `src/canvas-extensions/commands-canvas-extension.ts`
- `src/canvas-extensions/focus-mode-canvas-extension.ts`
- `src/canvas-extensions/presentation-canvas-extension.ts`
- `src/canvas-extensions/color-palette-canvas-extension.ts`
- `src/canvas-extensions/frontmatter-modal-canvas-extension.ts`

### 5. Advanced Features

Special features that extend basic canvas functionality.

#### Key Components:
- **Group System**: Collapsible groups implementation
- **Presentation Mode**: Slideshow and presentation features
- **Node Styles**: Advanced styling for nodes
- **Edge Styles**: Advanced styling for edges
- **Portal System**: Links between canvases
- **Encapsulation**: Hiding complexity with collapsible groups

#### Source Files:
- `src/canvas-extensions/group-canvas-extension.ts`
- `src/canvas-extensions/collapsible-groups-canvas-extension.ts`
- `src/canvas-extensions/presentation-canvas-extension.ts`
- `src/canvas-extensions/advanced-styles/node-styles.ts`
- `src/canvas-extensions/advanced-styles/edge-styles.ts`
- `src/canvas-extensions/portals-canvas-extension.ts`
- `src/canvas-extensions/encapsulate-canvas-extension.ts`

### 6. Utility Layer

Supporting utilities and helper functions.

#### Key Components:
- **Bbox Helper**: Bounding box calculations and operations
- **Canvas Helper**: General canvas utility functions
- **Icons Helper**: Icon management for the UI
- **Debug Helper**: Debugging tools and helpers

#### Source Files:
- `src/utils/bbox-helper.ts`
- `src/utils/canvas-helper.ts`
- `src/utils/icons-helper.ts`
- `src/utils/debug-helper.ts`

### 7. Extension System

Architecture for extending canvas functionality.

#### Key Components:
- **Canvas Extension Base Class**: Foundation for all extensions
- **Patchers**: System for modifying Obsidian's core functionality
- **Extension Registry**: Management and lifecycle of extensions

#### Source Files:
- `src/canvas-extensions/canvas-extension.ts`
- `src/patchers/patcher.ts`
- `src/patchers/canvas-patcher.ts`
- `src/main.ts` (extension management) 