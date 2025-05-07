import { User } from '../types';

export enum ChannelType {
  General = 'General',
  Department = 'Department',
  Project = 'Project',
  DirectMessage = 'DirectMessage'
}

export enum ChatMessageStatus {
  Sending = 'Sending',
  Sent = 'Sent',
  Delivered = 'Delivered',
  Read = 'Read',
  Failed = 'Failed'
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
  };
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  body: string;
  isEdited: boolean;
  isDeleted: boolean;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  tempId?: string;
  status?: ChatMessageStatus;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ChatChannelMember {
  id: string;
  channelId: string;
  userId: string;
  lastReadAt?: string;
  joinedAt: string;
  user: User;
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