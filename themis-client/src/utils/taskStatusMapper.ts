import { TaskStatus } from '../types';

// Backend task status enum values matching the C# enum
export enum BackendTaskStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  Delayed = 3,
  Blocked = 4,
  Cancelled = 5
}

/**
 * Maps frontend TaskStatus to backend TaskStatus values
 * @param status Frontend task status
 * @returns Backend task status value
 */
export const mapToBackendStatus = (frontendStatus: TaskStatus): BackendTaskStatus => {
  switch (frontendStatus) {
    case TaskStatus.TODO:
      return BackendTaskStatus.NotStarted;
    case TaskStatus.IN_PROGRESS:
      return BackendTaskStatus.InProgress;
    case TaskStatus.REVIEW:
      return BackendTaskStatus.InProgress; // Map REVIEW to InProgress in backend
    case TaskStatus.DONE:
      return BackendTaskStatus.Completed;
    default:
      console.warn(`Unknown frontend task status: ${frontendStatus}`);
      return BackendTaskStatus.NotStarted;
  }
};

/**
 * Maps backend TaskStatus values to frontend TaskStatus
 * @param status Backend task status value
 * @returns Frontend task status
 */
export const mapToFrontendStatus = (backendStatus: number): TaskStatus => {
  switch (backendStatus) {
    case BackendTaskStatus.NotStarted:
      return TaskStatus.TODO;
    case BackendTaskStatus.InProgress:
      return TaskStatus.IN_PROGRESS;
    case BackendTaskStatus.Completed:
      return TaskStatus.DONE;
    case BackendTaskStatus.Delayed:
      return TaskStatus.IN_PROGRESS; // Map Delayed to IN_PROGRESS in frontend
    case BackendTaskStatus.Blocked:
      return TaskStatus.IN_PROGRESS; // Map Blocked to IN_PROGRESS in frontend
    case BackendTaskStatus.Cancelled:
      return TaskStatus.DONE; // Map Cancelled to DONE in frontend
    default:
      console.warn(`Unknown backend task status: ${backendStatus}`);
      return TaskStatus.TODO;
  }
}; 