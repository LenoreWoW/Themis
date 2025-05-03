// Change Request Types
export enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  SCOPE = 'SCOPE',
  BUDGET = 'BUDGET',
  RESOURCE = 'RESOURCE',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER',
}

export enum ChangeRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface ChangeRequest {
  id?: string;
  projectId: string;
  title: string;
  description: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  submittedDate: string;
  requesterName: string;
  reviewedDate?: string;
  reviewNotes?: string;
  reviewerId?: string;
  
  // Type-specific fields
  // For SCHEDULE type
  currentEndDate?: string;
  proposedEndDate?: string;
  
  // For BUDGET type
  currentBudget?: number;
  proposedBudget?: number;
  
  // For SCOPE type
  scopeChanges?: string;
  
  // For RESOURCE type
  resourceChanges?: string;
  
  // For CLOSURE type
  closureJustification?: string;
  
  // Legacy nested objects for backward compatibility
  scheduleChange?: {
    currentEndDate: string;
    proposedEndDate: string;
  };
  
  budgetChange?: {
    currentBudget: number;
    proposedBudget: number;
  };
  
  scopeChange?: {
    changes: string;
  };
  
  resourceChange?: {
    changes: string;
  };
  
  closureRequest?: {
    justification: string;
  };
  
  // New alternative objects structure
  schedule?: {
    currentEndDate: string;
    proposedEndDate: string;
  };
  
  budget?: {
    currentBudget: number;
    proposedBudget: number;
  };
  
  scope?: {
    changes: string;
  };
  
  resource?: {
    changes: string;
  };
  
  closure?: {
    justification: string;
  };
}

// Additional interfaces for change request related functionality
export interface ChangeRequestFormData {
  title: string;
  description: string;
  type: ChangeRequestType;
  impact: string;
  justification: string;
  alternatives: string;
  currentEndDate?: string;
  proposedEndDate?: string;
  currentBudget?: number;
  proposedBudget?: number;
  scopeChanges?: string;
  resourceChanges?: string;
  closureJustification?: string;
  attachments?: File[];
}

export interface ChangeRequestDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onRequestSubmitted?: () => void;
  changeRequestType?: string | null;
} 