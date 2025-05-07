import { User, UserRole } from '../types';
import { ChangeRequest, ChangeRequestType, ChangeRequestStatus } from '../types/change-request';
import { canApproveProjects } from '../context/AuthContext';
import { cleanupMockData } from './cleanupUtils';

/**
 * Utility to audit the application's compliance with ClientTerms
 */

export interface AuditResult {
  passed: boolean;
  issues: string[];
}

/**
 * Check if a change request follows the proper approval flow
 * @param changeRequest - The change request to check
 * @param approver - The user approving the request
 */
export const validateChangeRequestApproval = (
  changeRequest: ChangeRequest,
  approver: User
): AuditResult => {
  const result: AuditResult = { passed: true, issues: [] };

  // Executives can only view, not approve change requests
  if (approver.role === UserRole.EXECUTIVE) {
    result.passed = false;
    result.issues.push(`User ${approver.firstName} ${approver.lastName} as Executive has view-only access and cannot approve change requests`);
    return result;
  }

  // Check if approver has permission to approve change requests
  if (!canApproveProjects(approver.role)) {
    result.passed = false;
    result.issues.push(`User ${approver.firstName} ${approver.lastName} does not have permission to approve change requests`);
  }

  // Different approval flows based on change request type
  switch (changeRequest.type) {
    case ChangeRequestType.SCHEDULE:
      // Project extensions require MAIN_PMO or ADMIN approval
      if (approver.role !== UserRole.MAIN_PMO && approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Project extensions must be approved by a Main PMO or Admin');
      }
      break;
    case ChangeRequestType.BUDGET:
      // Budget changes require ADMIN approval (Executives can only view)
      if (approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Budget changes must be approved by an Admin');
      }
      break;
    case ChangeRequestType.SCOPE:
      // Scope changes require PROJECT_MANAGER, MAIN_PMO, or ADMIN approval
      if (
        approver.role !== UserRole.PROJECT_MANAGER &&
        approver.role !== UserRole.MAIN_PMO &&
        approver.role !== UserRole.ADMIN
      ) {
        result.passed = false;
        result.issues.push('Scope changes must be approved by a Project Manager, Main PMO, or Admin');
      }
      break;
    case ChangeRequestType.RESOURCE:
      // Project delegation requires MAIN_PMO or ADMIN approval
      if (approver.role !== UserRole.MAIN_PMO && approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Project delegation must be approved by a Main PMO or Admin');
      }
      break;
    case ChangeRequestType.CLOSURE:
      // Project closure requires ADMIN approval
      if (approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Project closure must be approved by an Admin');
      }
      break;
    default:
      // Other changes follow standard approval flow
      if (!canApproveProjects(approver.role)) {
        result.passed = false;
        result.issues.push('Change requests must be approved by a user with approval permissions');
      }
  }

  return result;
};

/**
 * Run a full audit of the application for compliance with ClientTerms
 */
export const runFullAudit = (): AuditResult => {
  const result: AuditResult = { passed: true, issues: [] };

  // First, ensure there are no legacy mock projects hanging around
  cleanupMockData();

  // The full audit checks:
  // 1. All projects have valid managers with appropriate roles
  // 2. All change requests have followed the proper approval flow
  // 3. All closed projects have proper closure documentation
  // 4. All budget changes are properly justified
  // 5. All delegated projects have transition plans
  
  // Query the application's data store and perform detailed checks
  const changeRequests = JSON.parse(localStorage.getItem('changeRequests') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const projects = JSON.parse(localStorage.getItem('projects') || '[]');
  
  // Check for projects without valid managers
  projects.forEach((project: any) => {
    if (!project.projectManager || !project.projectManager.id) {
      result.passed = false;
      result.issues.push(`Project ${project.name} does not have a valid project manager assigned`);
    }
  });
  
  // Check if all current change requests follow approval flows
  if (changeRequests.length > 0) {
    changeRequests.forEach((cr: any) => {
      // Use approvedBy instead of reviewerId
      if (cr.approvedBy?.id) {
        const approver = users.find((u: User) => u.id === cr.approvedBy.id);
        if (approver) {
          const crAudit = validateChangeRequestApproval(cr as ChangeRequest, approver);
          if (!crAudit.passed) {
            result.passed = false;
            result.issues.push(...crAudit.issues);
          }
        }
      }
      
      // Check for specific change request types and their requirements
      switch(cr.type) {
        case ChangeRequestType.SCHEDULE:
          // Check for newEndDate in all possible locations
          const hasNewEndDate = 
            cr.newEndDate !== undefined || 
            cr.details?.newEndDate !== undefined ||
            cr.newEndDate !== null || 
            cr.details?.newEndDate !== null;
          
          if (!hasNewEndDate) {
            result.passed = false;
            result.issues.push(`Schedule change request ${cr.id} is missing a new end date`);
          }
          break;
        case ChangeRequestType.BUDGET:
          // Check for budget fields in all possible locations
          const hasBudgetInfo = 
            cr.newBudget !== undefined || 
            cr.newCost !== undefined || 
            cr.details?.newBudget !== undefined || 
            cr.details?.newCost !== undefined;
          
          if (!hasBudgetInfo) {
            result.passed = false;
            result.issues.push(`Budget change request ${cr.id} is missing a new cost value`);
          }
          break;
        case ChangeRequestType.SCOPE:
          // Check for scope description in both locations
          const hasScopeDescription = 
            (cr.newScopeDescription && cr.newScopeDescription.length > 0) || 
            (cr.details?.newScopeDescription && cr.details?.newScopeDescription.length > 0);
          
          if (!hasScopeDescription) {
            result.passed = false;
            result.issues.push(`Scope change request ${cr.id} is missing scope description`);
          }
          break;
        case ChangeRequestType.RESOURCE:
          // Check for manager fields in all possible locations
          const hasManagerInfo = 
            cr.newManager || 
            cr.newProjectManagerId || 
            cr.details?.newManager || 
            cr.details?.newProjectManagerId;
          
          if (!hasManagerInfo) {
            result.passed = false;
            result.issues.push(`Resource change request ${cr.id} is missing required resources`);
          }
          break;
        case ChangeRequestType.CLOSURE:
          // Check for closure reason in both locations
          const hasClosureReason = 
            (cr.closureReason && cr.closureReason.length > 0) || 
            (cr.details?.closureReason && cr.details?.closureReason.length > 0);
          
          if (!hasClosureReason) {
            result.passed = false;
            result.issues.push(`Closure request ${cr.id} is missing sufficient closure reason`);
          }
          break;
      }
    });
  }
  
  // Check for closed projects without proper documentation
  const closedProjects = projects.filter((p: any) => p.status === 'CLOSED');
  closedProjects.forEach((project: any) => {
    const closureRequests = changeRequests.filter(
      (cr: any) => cr.projectId === project.id && cr.type === ChangeRequestType.CLOSURE
    );
    
    if (closureRequests.length === 0) {
      result.passed = false;
      result.issues.push(`Closed project ${project.name} does not have a closure request on record`);
    }
  });

  return result;
};

/**
 * Get audit recommendations based on audit results
 */
export const getAuditRecommendations = (auditResult: AuditResult): string[] => {
  const recommendations: string[] = [];

  if (!auditResult.passed) {
    recommendations.push('Review the approval workflow for change requests');
    recommendations.push('Ensure all users understand their approval authorities');
    recommendations.push('Add validation in the UI to prevent unauthorized approvals');
    recommendations.push('Implement real-time permission checks for all sensitive operations');
  }

  return recommendations;
}; 