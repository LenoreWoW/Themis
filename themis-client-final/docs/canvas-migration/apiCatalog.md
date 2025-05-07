# Obsidian Advanced Canvas API Catalog

This document outlines the main interfaces, types, and APIs exposed by the Obsidian Advanced Canvas plugin.

## Core Interfaces and Types

### Canvas Data Types

```typescript
// Basic geometric types
interface Size {
  width: number
  height: number
}

interface Position {
  x: number
  y: number
}

interface BBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

// Core canvas data structure
interface CanvasData {
  nodes: AnyCanvasNodeData[]
  edges: CanvasEdgeData[]
  metadata?: CanvasMetadata
}

// Elements data (subset of CanvasData)
interface CanvasElementsData {
  nodes: CanvasNodeData[]
  edges: CanvasEdgeData[]
}

// Canvas options
interface CanvasOptions {
  snapToObjects: boolean
  snapToGrid: boolean
}
```

### Node Types

```typescript
// Base node data
interface CanvasNodeData {
  id: string
  x: number
  y: number
  width: number
  height: number
  color?: string
  zIndex?: number
  // Advanced properties added by extensions
  style?: NodeStyle
  ratio?: number
}

// Different node types
interface CanvasTextNodeData extends CanvasNodeData {
  type: 'text'
  text: string
}

interface CanvasFileNodeData extends CanvasNodeData {
  type: 'file'
  file: string
  subpath?: string
  // Portal-specific properties
  isPortalLoaded?: boolean
}

interface CanvasLinkNodeData extends CanvasNodeData {
  type: 'link'
  url: string
}

interface CanvasGroupNodeData extends CanvasNodeData {
  type: 'group'
  label?: string
  collapsedData?: CanvasElementsData
}

// Union type for any node data
type AnyCanvasNodeData = CanvasTextNodeData | CanvasFileNodeData | CanvasLinkNodeData | CanvasGroupNodeData
```

### Edge Types

```typescript
// Edge (connection) data
interface CanvasEdgeData {
  id: string
  fromNode: string
  fromSide: Side
  toNode: string
  toSide: Side
  color?: string
  label?: string
  // Advanced properties
  style?: EdgeStyle
  floating?: boolean
  fromEnd?: EndType  // arrow, dot, etc.
  toEnd?: EndType    // arrow, dot, etc.
}

// Side of node for edge connection
type Side = 'top' | 'right' | 'bottom' | 'left'

// Type of edge endpoint style
type EndType = 'none' | 'arrow' | 'dot' | 'square'
```

### Style Types

```typescript
// Node styling
interface NodeStyle {
  backgroundColor?: string
  backgroundOpacity?: number
  backgroundStyle?: 'solid' | 'gradient'
  borderColor?: string
  borderWidth?: number
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  borderRadius?: number
  textColor?: string
  fontSize?: number
  fontFamily?: string
  shadow?: boolean
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

// Edge styling
interface EdgeStyle {
  lineStyle?: 'solid' | 'dashed' | 'dotted' 
  lineWidth?: number
  textColor?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: 'normal' | 'italic' | 'bold'
  labelBackgroundColor?: string
  labelBackgroundOpacity?: number
}
```

## Canvas Class API

The main Canvas class exposes these key methods:

```typescript
interface Canvas {
  // Data management
  getData(): CanvasData
  setData(data: CanvasData): void
  importData(data: CanvasElementsData, clearCanvas?: boolean, silent?: boolean): void
  clear(): void
  
  // Element management
  getEdgesForNode(node: CanvasNode): CanvasEdge[]
  createTextNode(options: { [key: string]: any }): CanvasNode
  createGroupNode(options: { [key: string]: any }): CanvasNode
  createFileNode(options: { [key: string]: any }): CanvasNode
  createLinkNode(options: { [key: string]: any }): CanvasNode
  addNode(node: CanvasNode): void
  removeNode(node: CanvasNode): void
  addEdge(edge: CanvasEdge): void
  removeEdge(edge: CanvasEdge): void
  
  // Selection
  selection: Set<CanvasElement>
  getSelectionData(): SelectionData
  updateSelection(update: () => void): void
  deselectAll(): void
  
  // Viewport management
  getViewportBBox(): BBox
  setViewport(tx: number, ty: number, tZoom: number): void
  zoomToFit(): void
  zoomToSelection(): void
  zoomToBbox(bbox: BBox): void
  posFromClient(clientPos: Position): Position
  
  // History
  history: CanvasHistory
  pushHistory(data: CanvasElementsData): void
  undo(): void
  redo(): void
  
  // Utilities
  getContainingNodes(bbox: BBox): CanvasNode[]
  getViewportNodes(): CanvasNode[]
  requestSave(): void
  onResize(): void
}
```

## Canvas Element API

Canvas elements (nodes and edges) share this common interface:

```typescript
interface CanvasElement {
  id: string
  canvas: Canvas
  initialized: boolean
  isDirty?: boolean
  
  initialize(): void
  setColor(color: string): void
  updateBreakpoint(breakpoint: boolean): void
  setIsEditing(editing: boolean): void
  getBBox(): BBox
  getData(): CanvasNodeData | CanvasEdgeData
  setData(data: CanvasNodeData | CanvasEdgeData): void
}
```

### Canvas Node API

```typescript
interface CanvasNode extends CanvasElement {
  // Core properties
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  color: string
  
  // DOM elements
  nodeEl: HTMLElement
  contentEl: HTMLElement
  labelEl?: HTMLElement
  
  // Optional properties
  file?: TFile
  breakpoint?: number | null
  collapseEl?: HTMLElement
  
  // Methods
  setData(data: AnyCanvasNodeData, addHistory?: boolean): void
  getData(): CanvasNodeData
  updateZIndex(): void
  onConnectionPointerdown(e: PointerEvent, side: Side): void
}
```

### Canvas Edge API

```typescript
interface CanvasEdge extends CanvasElement {
  // Core properties
  label: string
  from: CanvasEdgeEnd
  to: CanvasEdgeEnd
  
  // Rendering elements
  path: {
    interaction: HTMLElement
    display: HTMLElement
  }
  
  // Methods
  getCenter(): Position
  render(): void
  updatePath(): void
  onConnectionPointerdown(e: PointerEvent): void
  setData(data: CanvasEdgeData, addHistory?: boolean): void
  getData(): CanvasEdgeData
}
```

## Extension API

Canvas extensions follow this interface:

```typescript
abstract class CanvasExtension {
  plugin: AdvancedCanvasPlugin
  
  constructor(plugin: AdvancedCanvasPlugin)
  
  // Implement to decide if extension is enabled based on settings
  abstract isEnabled(): BooleanSetting
  
  // Initialize the extension (register commands, events, etc.)
  abstract init(): void
  
  // Optional methods
  onunload?(): void
  onSettingsChange?(): void
  onActiveLeafChange?(): void
  onCanvasCreated?(canvas: Canvas): void
  onCanvasLoaded?(canvas: Canvas): void
  onCanvasDestroyed?(canvas: Canvas): void
}
```

## Export API

The export functionality exposes these methods:

```typescript
interface ExportAPI {
  // Export canvas to image
  exportImage(
    canvas: Canvas, 
    nodesToExport: CanvasNode[] | null, 
    svg: boolean, 
    pixelRatioFactor: number, 
    noFontExport: boolean,
    watermark: boolean,
    garbledText: boolean,
    transparentBackground: boolean
  ): Promise<void>
  
  // Export canvas presentation as PDF
  exportPresentationToPDF(
    canvas: Canvas,
    slides: CanvasNode[],
    options: {
      format: string,
      orientation: string,
      margin: number,
      showPageNumbers: boolean,
      showDate: boolean
    }
  ): Promise<void>
}
```

## Plugin Integration Points

These events can be listened to for plugin integration:

```typescript
// Canvas events
'advanced-canvas:canvas-created'        // (canvas: Canvas) => void
'advanced-canvas:canvas-loaded'         // (canvas: Canvas) => void
'advanced-canvas:canvas-destroyed'      // (canvas: Canvas) => void
'advanced-canvas:canvas-changed'        // (canvas: Canvas) => void
'advanced-canvas:node-changed'          // (canvas: Canvas, node: CanvasNode) => void
'advanced-canvas:edge-changed'          // (canvas: Canvas, edge: CanvasEdge) => void
'advanced-canvas:selection-changed'     // (canvas: Canvas) => void
'advanced-canvas:node-breakpoint-changed' // (canvas: Canvas, node: CanvasNode, breakpointRef: { value: boolean }) => void
``` 