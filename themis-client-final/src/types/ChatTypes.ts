import { User as AppUser } from './index';

// Re-export User to avoid circular dependencies
export type User = AppUser;

export enum ChannelType {
  General = 'GENERAL',
  Department = 'DEPARTMENT',
  Project = 'PROJECT',
  DirectMessage = 'DIRECT_MESSAGE',
  System = 'SYSTEM'
}

export enum ChatMessageStatus {
  Sent = 'SENT',
  Delivered = 'DELIVERED',
  Read = 'READ'
}

// Message type for specialized system messages
export enum SystemMessageType {
  DailyBrief = 'DAILY_BRIEF',
  Alert = 'ALERT',
  Notification = 'NOTIFICATION'
}

// Interactive actions for system messages
export enum SystemMessageAction {
  MarkDone = 'MARK_DONE',
  ReportIssue = 'REPORT_ISSUE',
  ViewTask = 'VIEW_TASK',
  Dismiss = 'DISMISS'
}

// Payload structure for Daily Brief items
export interface DailyBriefItem {
  id: string;
  title: string;
  type: 'task' | 'alert';
  dueTime?: string;
  projectId?: string;
  projectName?: string;
  assigneeId?: string;
  assigneeName?: string;
  priority?: string;
  status?: string;
  isCompleted?: boolean;
  completedBy?: string;
  completedAt?: string;
}

// Payload for system messages with structured data
export interface SystemMessagePayload {
  type: SystemMessageType;
  title: string;
  summary?: string;
  items?: DailyBriefItem[];
  availableActions?: SystemMessageAction[];
  metadata?: Record<string, any>;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  departmentId?: string;
  projectId?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
  };
  project?: {
    id: string;
    name: string;
    projectManager?: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    teamMembers?: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    }[];
  };
  members?: {
    userId: string;
    channelId: string;
    role: string;
  }[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  status: ChatMessageStatus;
  tempId?: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  isSystemMessage?: boolean;
  systemPayload?: SystemMessagePayload;
}

export interface ChatChannelMember {
  userId: string;
  channelId: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: {
      id: string;
      name: string;
    };
  };
}

export interface UnreadCount {
  channelId: string;
  count: number;
}

export interface CreateChannelRequest {
  name: string;
  type: ChannelType;
  departmentId?: string;
  projectId?: string;
}

export interface CreateMessageRequest {
  body: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
}

export interface UpdateMessageRequest {
  body: string;
}

export interface CreateDMRequest {
  recipientId: string;
}

export interface ChatNotification {
  id: string;
  messageId: string;
  channelId: string;
  userId: string;
  senderName: string;
  preview: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
} 