// Define the possible change request types
export enum ChangeRequestType {
  SCHEDULE = 'SCHEDULE',
  BUDGET = 'BUDGET',
  SCOPE = 'SCOPE',
  RESOURCE = 'RESOURCE',
  STATUS = 'STATUS',
  CLOSURE = 'CLOSURE',
  OTHER = 'OTHER'
}

export enum ChangeRequestStatus {
  DRAFT = 'DRAFT',
  PENDING_SUB_PMO = 'PENDING_SUB_PMO',
  APPROVED_BY_SUB_PMO = 'APPROVED_BY_SUB_PMO',
  REJECTED_BY_SUB_PMO = 'REJECTED_BY_SUB_PMO',
  PENDING_MAIN_PMO = 'PENDING_MAIN_PMO',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED'
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  type: ChangeRequestType | string;
  description: string;
  justification: string;
  newEndDate?: string;
  newBudget?: number;
  newStatus?: string;
  newManager?: string;
  documentsAffected?: string;
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  requestedAt: string;
  status: ChangeRequestStatus;
  department: {
    id: string;
    name: string;
  };
  reviewHistory?: {
    id: string;
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
    comments: string;
    timestamp: string;
    reviewer: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
  }[];
  approvedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  rejectedAt?: string;
  rejectionReason?: string;
  changesRequested?: string;
  lastReviewedAt?: string;
  submissionDate?: string;
  implementedAt?: string;
  implemented: boolean;
}

export interface ChangeRequestSubmitData {
  projectId: string;
  type: ChangeRequestType | string;
  description: string;
  justification: string;
  newEndDate?: string;
  newBudget?: number;
  newStatus?: string;
  newManager?: string;
  documentsAffected?: string;
  approvalLevel?: 'SUB_PMO' | 'MAIN_PMO';
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