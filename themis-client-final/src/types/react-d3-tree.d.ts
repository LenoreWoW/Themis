declare module 'react-d3-tree' {
  import { ComponentType, ReactElement } from 'react';
  
  export interface RawNodeDatum {
    name: string;
    attributes?: Record<string, string | number | boolean>;
    children?: RawNodeDatum[];
    [key: string]: any;
  }
  
  export interface Point {
    x: number;
    y: number;
  }
  
  export interface TreeLinkDatum {
    source: Point;
    target: Point;
  }
  
  export interface TreeNodeDatum extends RawNodeDatum {
    _children?: RawNodeDatum[];
    x: number;
    y: number;
    parent?: TreeNodeDatum;
    data?: RawNodeDatum;
    depth: number;
    id: string;
    [key: string]: any;
  }
  
  export interface CustomNodeElementProps {
    nodeDatum: TreeNodeDatum;
    toggleNode: () => void;
    onNodeClick: (datum: TreeNodeDatum) => void;
    onNodeMouseOver: (datum: TreeNodeDatum) => void;
    onNodeMouseOut: (datum: TreeNodeDatum) => void;
  }
  
  export interface TreeProps {
    data: RawNodeDatum | RawNodeDatum[];
    orientation?: 'horizontal' | 'vertical';
    translate?: Point;
    pathFunc?: 'diagonal' | 'straight' | 'elbow' | 'step' | Function;
    nodeSize?: {
      x: number;
      y: number;
    };
    separation?: {
      siblings?: number;
      nonSiblings?: number;
    };
    zoomable?: boolean;
    zoom?: number;
    draggable?: boolean;
    collapsible?: boolean;
    dimensions?: {
      width: number;
      height: number;
    };
    initialDepth?: number;
    depthFactor?: number;
    renderCustomNodeElement?: (props: CustomNodeElementProps) => ReactElement;
    onNodeClick?: (datum: TreeNodeDatum, evt: React.MouseEvent) => void;
    onNodeMouseOver?: (datum: TreeNodeDatum, evt: React.MouseEvent) => void;
    onNodeMouseOut?: (datum: TreeNodeDatum, evt: React.MouseEvent) => void;
    onLinkClick?: (linkData: TreeLinkDatum, evt: React.MouseEvent) => void;
    onLinkMouseOver?: (linkData: TreeLinkDatum, evt: React.MouseEvent) => void;
    onLinkMouseOut?: (linkData: TreeLinkDatum, evt: React.MouseEvent) => void;
    onUpdate?: (datum: TreeNodeDatum) => void;
    pathClassFunc?: (linkData: TreeLinkDatum) => string;
    enableLegacyTransitions?: boolean;
    transitionDuration?: number;
    svgClassName?: string;
    rootNodeClassName?: string;
    branchNodeClassName?: string;
    leafNodeClassName?: string;
  }
  
  declare const Tree: ComponentType<TreeProps>;
  export default Tree;
} 