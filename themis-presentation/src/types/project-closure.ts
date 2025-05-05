import { User } from './index';

// Project Closure Status
export enum ProjectClosureStatus {
  INITIATED = 'INITIATED',
  CHECKLIST_IN_PROGRESS = 'CHECKLIST_IN_PROGRESS',
  PENDING_SIGN_OFF = 'PENDING_SIGN_OFF',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

// Sign Off Status
export enum SignOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Attachment Category
export enum AttachmentCategory {
  DOCUMENTATION = 'DOCUMENTATION',
  CLIENT_SIGN_OFF = 'CLIENT_SIGN_OFF',
  FINAL_REPORT = 'FINAL_REPORT',
  LESSONS_LEARNED = 'LESSONS_LEARNED',
  FINANCIAL_DOCUMENT = 'FINANCIAL_DOCUMENT',
  OTHER = 'OTHER'
}

// Project Closure
export interface ProjectClosure {
  id: string;
  projectId: string;
  status: ProjectClosureStatus;
  completionDate?: string;
  archiveDate?: string;
  lessonsLearned?: string;
  finalReport?: string;
  closureSummary?: string;
  tasksCompleted: boolean;
  deliverableAccepted: boolean;
  resourcesReleased: boolean;
  documentationComplete: boolean;
  financialsClosed: boolean;
  stakeholderSignOff: boolean;
  stakeholderSignOffs: ProjectClosureSignOff[];
  attachments: ProjectClosureAttachment[];
  createdAt: string;
  updatedAt: string;
}

// Project Closure Sign Off
export interface ProjectClosureSignOff {
  id: string;
  projectClosureId: string;
  stakeholderId: string;
  stakeholder?: User;
  role: string;
  status: SignOffStatus;
  signOffDate?: string;
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

// Project Closure Attachment
export interface ProjectClosureAttachment {
  id: string;
  projectClosureId: string;
  fileName: string;
  fileType: string;
  filePath: string;
  fileSize: number;
  description?: string;
  category: AttachmentCategory;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Project Closure Checklist
export interface ProjectClosureChecklist {
  tasksCompleted: boolean;
  tasksCompletedNotes?: string;
  deliverableAccepted: boolean;
  deliverableAcceptedNotes?: string;
  resourcesReleased: boolean;
  resourcesReleasedNotes?: string;
  documentationComplete: boolean;
  documentationCompleteNotes?: string;
  financialsClosed: boolean;
  financialsClosedNotes?: string;
  lessonsLearned: boolean;
  lessonsLearnedNotes?: string;
  clientFeedbackCollected: boolean;
  clientFeedbackNotes?: string;
  teamPerformanceReviewed: boolean;
  teamPerformanceNotes?: string;
} 