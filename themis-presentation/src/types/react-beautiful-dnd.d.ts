declare module 'react-beautiful-dnd' {
  import * as React from 'react';

  // Draggable
  export interface DraggableProps {
    draggableId: string;
    index: number;
    isDragDisabled?: boolean;
    disableInteractiveElementBlocking?: boolean;
    shouldRespectForcePress?: boolean;
    children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => React.ReactElement;
  }

  export interface DraggableProvided {
    innerRef: (element?: HTMLElement | null) => void;
    draggableProps: {
      style?: React.CSSProperties;
      'data-rbd-draggable-context-id': string;
      'data-rbd-draggable-id': string;
      onTransitionEnd?: (e: React.TransitionEvent<any>) => void;
      [key: string]: any;
    };
    dragHandleProps?: {
      role: string;
      tabIndex: number;
      'aria-grabbed': boolean;
      draggable: boolean;
      onDragStart: (e: React.DragEvent<HTMLElement>) => void;
      [key: string]: any;
    };
  }

  export interface DraggableStateSnapshot {
    isDragging: boolean;
    isDropAnimating: boolean;
    isClone: boolean;
    dropAnimation: DropAnimation | null;
    draggingOver: string | null;
    combineWith: string | null;
    combineTargetFor: string | null;
    mode: MovementMode | null;
  }

  export interface DropAnimation {
    duration: number;
    curve: string;
    moveTo: {
      x: number;
      y: number;
    };
    opacity: number | null;
    scale: number | null;
  }

  export interface DraggableRubric {
    draggableId: string;
    type: string;
    source: {
      index: number;
      droppableId: string;
    };
  }

  export type MovementMode = 'FLUID' | 'SNAP';

  export declare class Draggable extends React.Component<DraggableProps> {}

  // Droppable
  export interface DroppableProps {
    droppableId: string;
    type?: string;
    mode?: 'standard' | 'virtual';
    isDropDisabled?: boolean;
    isCombineEnabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    ignoreContainerClipping?: boolean;
    renderClone?: (provided: DraggableProvided, snapshot: DraggableStateSnapshot, rubric: DraggableRubric) => React.ReactElement;
    getContainerForClone?: () => HTMLElement;
    children: (provided: DroppableProvided, snapshot: DroppableStateSnapshot) => React.ReactElement;
  }

  export interface DroppableProvided {
    innerRef: (element?: HTMLElement | null) => void;
    placeholder: React.ReactElement | null;
    droppableProps: {
      'data-rbd-droppable-context-id': string;
      'data-rbd-droppable-id': string;
      [key: string]: any;
    };
  }

  export interface DroppableStateSnapshot {
    isDraggingOver: boolean;
    draggingOverWith: string | null;
    draggingFromThisWith: string | null;
    isUsingPlaceholder: boolean;
  }

  export declare class Droppable extends React.Component<DroppableProps> {}

  // DragDropContext
  export interface DragDropContextProps {
    onBeforeDragStart?: (initial: DragStart) => void;
    onDragStart?: (initial: DragStart, provided: ResponderProvided) => void;
    onDragUpdate?: (update: DragUpdate, provided: ResponderProvided) => void;
    onDragEnd: (result: DropResult, provided: ResponderProvided) => void;
    children: React.ReactNode;
    enableDefaultSensors?: boolean;
    sensors?: Sensor[];
    nonce?: string;
  }

  export interface DragStart {
    draggableId: string;
    type: string;
    source: {
      droppableId: string;
      index: number;
    };
    mode: MovementMode;
  }

  export interface DragUpdate extends DragStart {
    destination?: {
      droppableId: string;
      index: number;
    };
    combine?: {
      draggableId: string;
      droppableId: string;
    };
  }

  export interface DropResult extends DragUpdate {
    reason: 'DROP' | 'CANCEL';
  }

  export interface ResponderProvided {
    announce: {
      (message: string): void;
    };
  }

  export interface Sensor {
    // To be defined based on your usage
  }

  export declare class DragDropContext extends React.Component<DragDropContextProps> {}
} 