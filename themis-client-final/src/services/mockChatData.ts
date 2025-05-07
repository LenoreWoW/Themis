import { v4 as uuidv4 } from 'uuid';
import { ChatChannel, ChatMessage, ChannelType, ChatMessageStatus } from '../types/ChatTypes';
import { mockUsers, mockDepartments } from './mockData';
import { UserRole } from '../types';

// Generate a random date in the past week
const randomRecentDate = () => {
  const now = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 7);
  const randomHoursAgo = Math.floor(Math.random() * 24);
  const randomMinutesAgo = Math.floor(Math.random() * 60);
  const randomDate = new Date(now);
  
  randomDate.setDate(now.getDate() - randomDaysAgo);
  randomDate.setHours(now.getHours() - randomHoursAgo);
  randomDate.setMinutes(now.getMinutes() - randomMinutesAgo);
  
  return randomDate.toISOString();
};

// Generate mock messages for a channel
const generateMockMessages = (channelId: string, count: number = 5): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  
  for (let i = 0; i < count; i++) {
    const sender = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const createdAt = randomRecentDate();
    
    messages.push({
      id: uuidv4(),
      channelId,
      senderId: sender.id,
      body: `This is a test message ${i + 1} in this channel.`,
      isEdited: Math.random() > 0.8,
      isDeleted: false,
      createdAt,
      updatedAt: createdAt,
      status: ChatMessageStatus.Delivered,
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        role: sender.role
      }
    });
  }
  
  // Sort messages by date
  return messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Generate announcement messages with more formal content
const generateAnnouncementMessages = (channelId: string, isGeneral: boolean = true): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const count = isGeneral ? 3 : 2;
  
  const announcementTexts = isGeneral ? [
    "**Important Announcement:** The PMO office will be closed on July 15th for system upgrades. Please plan accordingly.",
    "**New Project Guidelines:** All new project submissions must include a detailed risk assessment starting next month. See the Documentation section for templates.",
    "**Q3 Review Meeting:** The quarterly project review meeting will be held on August 5th at 10:00 AM in the main conference room. All project managers are required to attend."
  ] : [
    `**Department Update:** The ${mockDepartments[0].name} team will be conducting a skills assessment workshop next week. Please check your email for details.`,
    `**Resource Allocation:** Due to increased project load, we'll be bringing in two additional resources to the ${mockDepartments[0].name} team starting next month.`
  ];
  
  // For general announcements, only executives and main PMO can post
  const senders = isGeneral 
    ? mockUsers.filter(u => u.role === UserRole.MAIN_PMO || u.role === UserRole.EXECUTIVE)
    : mockUsers.filter(u => u.role === UserRole.DEPARTMENT_DIRECTOR || u.role === UserRole.SUB_PMO);
  
  for (let i = 0; i < count; i++) {
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const createdAt = randomRecentDate();
    
    messages.push({
      id: uuidv4(),
      channelId,
      senderId: sender.id,
      body: announcementTexts[i],
      isEdited: false,
      isDeleted: false,
      createdAt,
      updatedAt: createdAt,
      status: ChatMessageStatus.Delivered,
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        role: sender.role
      }
    });
  }
  
  // Sort messages by date
  return messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Generate mock project messages with project-specific content
const generateProjectMessages = (channelId: string, projectName: string): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  
  const projectMessageTexts = [
    `I've updated the timeline for ${projectName}. We need to push back milestone 2 by a week due to dependency issues.`,
    `The client meeting for ${projectName} went well. They're happy with our progress so far.`,
    `Does anyone have the latest requirements document for ${projectName}? I can't find it in the shared folder.`,
    `I've identified a potential risk for ${projectName} regarding the third-party integration. We should discuss this in the next standup.`,
    `Just pushed the latest code changes for ${projectName}. Please review when you get a chance.`
  ];
  
  // Project managers and team members can post in project channels
  const projectTeamUsers = mockUsers.filter(u => 
    u.role === UserRole.PROJECT_MANAGER || 
    u.role === UserRole.SUB_PMO
  );
  
  for (let i = 0; i < projectMessageTexts.length; i++) {
    const sender = projectTeamUsers[Math.floor(Math.random() * projectTeamUsers.length)];
    const createdAt = randomRecentDate();
    
    messages.push({
      id: uuidv4(),
      channelId,
      senderId: sender.id,
      body: projectMessageTexts[i],
      isEdited: Math.random() > 0.9,
      isDeleted: false,
      createdAt,
      updatedAt: createdAt,
      status: ChatMessageStatus.Delivered,
      sender: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        role: sender.role
      }
    });
  }
  
  // Sort messages by date
  return messages.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Define mock channels
export const mockChannels: ChatChannel[] = [
  // General Announcements
  {
    id: 'channel-general-announcements',
    name: 'General Announcements',
    type: ChannelType.General,
    isArchived: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date().toISOString()
  },
  
  // Department Announcements
  {
    id: 'channel-dept-it',
    name: 'IT Department Announcements',
    type: ChannelType.Department,
    departmentId: mockDepartments[0].id,
    isArchived: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    department: {
      id: mockDepartments[0].id,
      name: mockDepartments[0].name
    }
  },
  
  // Project Channels - Active
  {
    id: 'channel-project-erp',
    name: 'ERP Implementation',
    type: ChannelType.Project,
    projectId: 'project-1',
    isArchived: false,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    project: {
      id: 'project-1',
      name: 'ERP Implementation'
    }
  },
  {
    id: 'channel-project-website',
    name: 'Website Redesign',
    type: ChannelType.Project,
    projectId: 'project-2',
    isArchived: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    project: {
      id: 'project-2',
      name: 'Website Redesign'
    }
  },
  
  // Project Channel - Archived
  {
    id: 'channel-project-data-migration',
    name: 'Data Migration (archived)',
    type: ChannelType.Project,
    projectId: 'project-3',
    isArchived: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    project: {
      id: 'project-3',
      name: 'Data Migration'
    }
  },
  
  // Direct Message Channel
  {
    id: 'channel-dm-1',
    name: `${mockUsers[0].firstName} ${mockUsers[0].lastName}, ${mockUsers[1].firstName} ${mockUsers[1].lastName}`,
    type: ChannelType.DirectMessage,
    isArchived: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Generate mock messages for each channel
export const mockMessages: Record<string, ChatMessage[]> = {
  'channel-general-announcements': generateAnnouncementMessages('channel-general-announcements'),
  'channel-dept-it': generateAnnouncementMessages('channel-dept-it', false),
  'channel-project-erp': generateProjectMessages('channel-project-erp', 'ERP Implementation'),
  'channel-project-website': generateProjectMessages('channel-project-website', 'Website Redesign'),
  'channel-project-data-migration': generateProjectMessages('channel-project-data-migration', 'Data Migration'),
  'channel-dm-1': generateMockMessages('channel-dm-1', 8)
};

// Generate mock unread counts for some channels
export const mockUnreadCounts = [
  { channelId: 'channel-general-announcements', count: 1 },
  { channelId: 'channel-project-website', count: 3 }
]; 