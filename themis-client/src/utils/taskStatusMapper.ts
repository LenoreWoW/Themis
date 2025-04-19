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
 * @param status Backend task status value or string
 * @returns Frontend task status
 */
export const mapToFrontendStatus = (backendStatus: number | string): TaskStatus => {
  // Handle string status values (sometimes the API returns string values directly)
  if (typeof backendStatus === 'string') {
    switch (backendStatus) {
      case 'TODO':
        return TaskStatus.TODO;
      case 'IN_PROGRESS':
        return TaskStatus.IN_PROGRESS;
      case 'REVIEW':
        return TaskStatus.REVIEW;
      case 'DONE':
        return TaskStatus.DONE;
      case 'NotStarted':
        return TaskStatus.TODO;
      case 'InProgress':
        return TaskStatus.IN_PROGRESS;
      case 'Completed':
        return TaskStatus.DONE;
      case 'Delayed':
      case 'Blocked':
        return TaskStatus.IN_PROGRESS;
      case 'Cancelled':
        return TaskStatus.DONE;
      default:
        console.warn(`Unknown backend task status string: ${backendStatus}`);
        return TaskStatus.TODO;
    }
  }
  
  // Handle numeric status values
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
      console.warn(`Unknown backend task status number: ${backendStatus}`);
      return TaskStatus.TODO;
  }
}; 