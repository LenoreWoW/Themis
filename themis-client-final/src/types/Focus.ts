export enum FocusTimerState {
  IDLE = 'IDLE',
  FOCUSING = 'FOCUSING',
  BREAK = 'BREAK',
  PAUSED = 'PAUSED'
}

export interface Checkpoint {
  id: string;
  taskId: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId: string;
  startTime: string;
  endTime: string;
  breakCount: number;
  totalFocusTime: number;
  totalBreakTime: number;
  checkpointsCompleted?: string[]; // IDs of checkpoints completed during session
}

// No default export needed as we're exporting the types directly 