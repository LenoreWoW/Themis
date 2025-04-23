import { User, UserRole } from '../types';
import { ChangeRequest, ChangeRequestType } from '../types/index';
import { canApproveProjects } from './permissions';

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
      // Budget changes require EXECUTIVE or ADMIN approval
      if (approver.role !== UserRole.EXECUTIVE && approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Budget changes must be approved by an Executive or Admin');
      }
      break;
    case ChangeRequestType.SCOPE:
      // Scope changes require PROJECT_MANAGER, MAIN_PMO, EXECUTIVE or ADMIN approval
      if (
        approver.role !== UserRole.PROJECT_MANAGER &&
        approver.role !== UserRole.MAIN_PMO &&
        approver.role !== UserRole.EXECUTIVE &&
        approver.role !== UserRole.ADMIN
      ) {
        result.passed = false;
        result.issues.push('Scope changes must be approved by a Project Manager, Main PMO, Executive or Admin');
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
      // Project closure requires EXECUTIVE or ADMIN approval
      if (approver.role !== UserRole.EXECUTIVE && approver.role !== UserRole.ADMIN) {
        result.passed = false;
        result.issues.push('Project closure must be approved by an Executive or Admin');
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

  // The full audit could check:
  // 1. All projects have valid managers with appropriate roles
  // 2. All change requests have followed the proper approval flow
  // 3. All closed projects have proper closure documentation
  // 4. All budget changes are properly justified
  // 5. All delegated projects have transition plans
  
  // This is a placeholder for a full implementation that would
  // query the application's data store and perform detailed checks

  // For example:
  // Check if all current change requests follow approval flows
  const changeRequests = JSON.parse(localStorage.getItem('changeRequests') || '[]');
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (changeRequests.length > 0) {
    changeRequests.forEach((cr: ChangeRequest) => {
      if (cr.approvedByDirector) {
        const approver = users.find((u: User) => u.id === cr.approvedByDirector?.id);
        if (approver) {
          const crAudit = validateChangeRequestApproval(cr, approver);
          if (!crAudit.passed) {
            result.passed = false;
            result.issues.push(`Change request ${cr.id} has approval issues: ${crAudit.issues.join(', ')}`);
          }
        } else {
          result.passed = false;
          result.issues.push(`Change request ${cr.id} was approved by a director that no longer exists`);
        }
      }
    });
  }

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