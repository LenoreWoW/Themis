using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Interfaces;
using Themis.Core.Models;
using Themis.Infrastructure.Data;

namespace Themis.Infrastructure.Services
{
    public class ProjectClosureService : IProjectClosureService
    {
        private readonly ApplicationDbContext _context;
        private readonly INotificationService _notificationService;

        public ProjectClosureService(ApplicationDbContext context, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        public async Task<ProjectClosure> GetClosureByProjectIdAsync(Guid projectId)
        {
            return await _context.ProjectClosures
                .Include(c => c.StakeholderSignOffs)
                .Include(c => c.Attachments)
                .FirstOrDefaultAsync(c => c.ProjectId == projectId);
        }

        public async Task<ProjectClosure> InitiateClosureProcessAsync(Guid projectId, Guid userId)
        {
            // Check if project exists and is in appropriate status
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                throw new ArgumentException("Project not found");
            }

            if (project.Status != ProjectStatus.InProgress && project.Status != ProjectStatus.OnHold)
            {
                throw new InvalidOperationException("Only projects in InProgress or OnHold status can be closed");
            }

            // Check if closure process already initiated
            var existingClosure = await GetClosureByProjectIdAsync(projectId);
            if (existingClosure != null)
            {
                return existingClosure;
            }

            // Create new closure record
            var closure = new ProjectClosure
            {
                ProjectId = projectId,
                Status = ProjectClosureStatus.Initiated,
                CompletionDate = null,
                ArchiveDate = null,
                TasksCompleted = false,
                DeliverableAccepted = false,
                ResourcesReleased = false,
                DocumentationComplete = false,
                FinancialsClosed = false,
                StakeholderSignOff = false
            };

            await _context.ProjectClosures.AddAsync(closure);

            // Update project status
            project.Status = ProjectStatus.Completed;

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "Project",
                EntityId = projectId,
                UserId = userId,
                Action = "InitiateClosure",
                Details = $"Initiated closure process for project: {project.Title}",
                Timestamp = DateTime.UtcNow
            });

            // Save changes
            await _context.SaveChangesAsync();

            // Send notifications
            await NotifyRelevantStakeholders(projectId, "Project Closure Initiated", 
                $"The closure process has been initiated for project {project.Title}");

            return closure;
        }

        public async Task<ProjectClosure> UpdateClosureAsync(ProjectClosure closure, Guid userId)
        {
            var existingClosure = await _context.ProjectClosures.FindAsync(closure.Id);
            if (existingClosure == null)
            {
                throw new ArgumentException("Closure record not found");
            }

            // Update properties
            existingClosure.LessonsLearned = closure.LessonsLearned;
            existingClosure.ClosureSummary = closure.ClosureSummary;
            existingClosure.TasksCompleted = closure.TasksCompleted;
            existingClosure.DeliverableAccepted = closure.DeliverableAccepted;
            existingClosure.ResourcesReleased = closure.ResourcesReleased;
            existingClosure.DocumentationComplete = closure.DocumentationComplete;
            existingClosure.FinancialsClosed = closure.FinancialsClosed;

            // Check if all checklist items are completed
            bool allChecklistItemsCompleted = 
                closure.TasksCompleted && 
                closure.DeliverableAccepted && 
                closure.ResourcesReleased && 
                closure.DocumentationComplete && 
                closure.FinancialsClosed;

            // Update status if all checklist items are completed
            if (allChecklistItemsCompleted && existingClosure.Status == ProjectClosureStatus.Initiated)
            {
                existingClosure.Status = ProjectClosureStatus.ChecklistInProgress;
            }

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosure",
                EntityId = closure.Id,
                UserId = userId,
                Action = "Update",
                Details = $"Updated closure information for project ID: {closure.ProjectId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return existingClosure;
        }

        public async Task<bool> CompleteClosureAsync(Guid projectId, Guid userId)
        {
            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null)
            {
                throw new ArgumentException("Closure record not found");
            }

            // Check if all stakeholders have signed off
            bool allSignedOff = !closure.StakeholderSignOffs.Any(s => s.Status != SignOffStatus.Approved);
            
            if (!allSignedOff)
            {
                throw new InvalidOperationException("All stakeholders must sign off before completing closure");
            }

            // Update closure status
            closure.Status = ProjectClosureStatus.Completed;
            closure.CompletionDate = DateTime.UtcNow;
            closure.StakeholderSignOff = true;

            // Generate final report
            await GenerateFinalReportAsync(projectId, userId);

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosure",
                EntityId = closure.Id,
                UserId = userId,
                Action = "Complete",
                Details = $"Completed closure process for project ID: {projectId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send notifications
            var project = await _context.Projects.FindAsync(projectId);
            await NotifyRelevantStakeholders(projectId, "Project Closure Completed", 
                $"The closure process has been completed for project {project.Title}");

            return true;
        }

        public async Task<bool> ArchiveProjectAsync(Guid projectId, Guid userId)
        {
            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null || closure.Status != ProjectClosureStatus.Completed)
            {
                throw new InvalidOperationException("Project closure must be completed before archiving");
            }

            // Update closure status
            closure.Status = ProjectClosureStatus.Archived;
            closure.ArchiveDate = DateTime.UtcNow;

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosure",
                EntityId = closure.Id,
                UserId = userId,
                Action = "Archive",
                Details = $"Archived project ID: {projectId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send notifications
            var project = await _context.Projects.FindAsync(projectId);
            await NotifyRelevantStakeholders(projectId, "Project Archived", 
                $"Project {project.Title} has been archived");

            return true;
        }

        public async Task<bool> UpdateClosureChecklistAsync(Guid projectId, ProjectClosureChecklist checklist, Guid userId)
        {
            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null)
            {
                throw new ArgumentException("Closure record not found");
            }

            // Update checklist items
            closure.TasksCompleted = checklist.TasksCompleted;
            closure.DeliverableAccepted = checklist.DeliverableAccepted;
            closure.ResourcesReleased = checklist.ResourcesReleased;
            closure.DocumentationComplete = checklist.DocumentationComplete;
            closure.FinancialsClosed = checklist.FinancialsClosed;

            // Check if all checklist items are completed
            bool allChecklistItemsCompleted = 
                checklist.TasksCompleted && 
                checklist.DeliverableAccepted && 
                checklist.ResourcesReleased && 
                checklist.DocumentationComplete && 
                checklist.FinancialsClosed &&
                checklist.LessonsLearned &&
                checklist.ClientFeedbackCollected &&
                checklist.TeamPerformanceReviewed;

            // Update status if all checklist items are completed
            if (allChecklistItemsCompleted && closure.Status == ProjectClosureStatus.ChecklistInProgress)
            {
                closure.Status = ProjectClosureStatus.PendingSignOff;

                // Send notifications for sign offs
                await NotifyForSignOffs(projectId);
            }

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosure",
                EntityId = closure.Id,
                UserId = userId,
                Action = "UpdateChecklist",
                Details = $"Updated closure checklist for project ID: {projectId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<ProjectClosureSignOff>> GetSignOffsByClosureIdAsync(Guid closureId)
        {
            return await _context.ProjectClosureSignOffs
                .Include(s => s.Stakeholder)
                .Where(s => s.ProjectClosureId == closureId)
                .ToListAsync();
        }

        public async Task<ProjectClosureSignOff> AddStakeholderSignOffAsync(Guid closureId, Guid stakeholderId, string role, Guid userId)
        {
            // Check if sign off already exists
            var existingSignOff = await _context.ProjectClosureSignOffs
                .FirstOrDefaultAsync(s => s.ProjectClosureId == closureId && s.StakeholderId == stakeholderId);

            if (existingSignOff != null)
            {
                return existingSignOff;
            }

            // Create new sign off
            var signOff = new ProjectClosureSignOff
            {
                ProjectClosureId = closureId,
                StakeholderId = stakeholderId,
                Role = role,
                Status = SignOffStatus.Pending,
                SignOffDate = null,
                Comments = null
            };

            await _context.ProjectClosureSignOffs.AddAsync(signOff);

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosureSignOff",
                EntityId = signOff.Id,
                UserId = userId,
                Action = "Create",
                Details = $"Added stakeholder sign-off for closure ID: {closureId}, stakeholder ID: {stakeholderId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Send notification to stakeholder
            var closure = await _context.ProjectClosures
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == closureId);
                
            if (closure != null)
            {
                await _notificationService.CreateNotificationAsync(
                    stakeholderId,
                    "SignOffRequired",
                    $"Sign-off required for {closure.Project.Title}",
                    $"Your sign-off is required to complete the closure process for project {closure.Project.Title}."
                );
            }

            return signOff;
        }

        public async Task<ProjectClosureSignOff> ApproveSignOffAsync(Guid signOffId, string comments, Guid userId)
        {
            var signOff = await _context.ProjectClosureSignOffs.FindAsync(signOffId);
            if (signOff == null)
            {
                throw new ArgumentException("Sign-off record not found");
            }

            if (signOff.StakeholderId != userId)
            {
                throw new UnauthorizedAccessException("Only the assigned stakeholder can approve this sign-off");
            }

            signOff.Status = SignOffStatus.Approved;
            signOff.SignOffDate = DateTime.UtcNow;
            signOff.Comments = comments;

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosureSignOff",
                EntityId = signOffId,
                UserId = userId,
                Action = "Approve",
                Details = $"Approved sign-off ID: {signOffId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Check if all sign-offs are complete
            var closure = await _context.ProjectClosures
                .Include(c => c.StakeholderSignOffs)
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == signOff.ProjectClosureId);

            if (closure != null && !closure.StakeholderSignOffs.Any(s => s.Status != SignOffStatus.Approved))
            {
                // All stakeholders have approved, notify project manager
                var projectManager = await _context.Users.FindAsync(closure.Project.PMUserId);
                if (projectManager != null)
                {
                    await _notificationService.CreateNotificationAsync(
                        projectManager.Id,
                        "AllSignOffsComplete",
                        $"All sign-offs complete for {closure.Project.Title}",
                        $"All stakeholders have approved the closure of project {closure.Project.Title}. You can now complete the closure process."
                    );
                }
            }

            return signOff;
        }

        public async Task<ProjectClosureSignOff> RejectSignOffAsync(Guid signOffId, string comments, Guid userId)
        {
            var signOff = await _context.ProjectClosureSignOffs.FindAsync(signOffId);
            if (signOff == null)
            {
                throw new ArgumentException("Sign-off record not found");
            }

            if (signOff.StakeholderId != userId)
            {
                throw new UnauthorizedAccessException("Only the assigned stakeholder can reject this sign-off");
            }

            signOff.Status = SignOffStatus.Rejected;
            signOff.SignOffDate = DateTime.UtcNow;
            signOff.Comments = comments;

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosureSignOff",
                EntityId = signOffId,
                UserId = userId,
                Action = "Reject",
                Details = $"Rejected sign-off ID: {signOffId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();

            // Notify project manager of rejection
            var closure = await _context.ProjectClosures
                .Include(c => c.Project)
                .FirstOrDefaultAsync(c => c.Id == signOff.ProjectClosureId);

            if (closure != null)
            {
                var projectManager = await _context.Users.FindAsync(closure.Project.PMUserId);
                var stakeholder = await _context.Users.FindAsync(signOff.StakeholderId);
                
                if (projectManager != null && stakeholder != null)
                {
                    await _notificationService.CreateNotificationAsync(
                        projectManager.Id,
                        "SignOffRejected",
                        $"Sign-off rejected for {closure.Project.Title}",
                        $"{stakeholder.FirstName} {stakeholder.LastName} has rejected the sign-off for project {closure.Project.Title}. Reason: {comments}"
                    );
                }
            }

            return signOff;
        }

        public async Task<List<ProjectClosureAttachment>> GetAttachmentsByClosureIdAsync(Guid closureId)
        {
            return await _context.ProjectClosureAttachments
                .Include(a => a.UploadedBy)
                .Where(a => a.ProjectClosureId == closureId)
                .ToListAsync();
        }

        public async Task<ProjectClosureAttachment> AddAttachmentAsync(ProjectClosureAttachment attachment)
        {
            await _context.ProjectClosureAttachments.AddAsync(attachment);

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosureAttachment",
                EntityId = attachment.Id,
                UserId = attachment.UploadedById,
                Action = "Upload",
                Details = $"Uploaded attachment {attachment.FileName} for closure ID: {attachment.ProjectClosureId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return attachment;
        }

        public async Task<bool> DeleteAttachmentAsync(Guid attachmentId)
        {
            var attachment = await _context.ProjectClosureAttachments.FindAsync(attachmentId);
            if (attachment == null)
            {
                return false;
            }

            _context.ProjectClosureAttachments.Remove(attachment);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> GenerateFinalReportAsync(Guid projectId, Guid userId)
        {
            var project = await _context.Projects
                .Include(p => p.ProjectManager)
                .Include(p => p.Department)
                .Include(p => p.Tasks)
                .Include(p => p.RisksIssues)
                .Include(p => p.Financial)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
            {
                throw new ArgumentException("Project not found");
            }

            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null)
            {
                throw new ArgumentException("Closure record not found");
            }

            // Generate final report content
            string finalReport = GenerateReportContent(project, closure);
            closure.FinalReport = finalReport;

            // Create audit log
            await _context.AuditLogs.AddAsync(new AuditLog
            {
                EntityType = "ProjectClosure",
                EntityId = closure.Id,
                UserId = userId,
                Action = "GenerateFinalReport",
                Details = $"Generated final report for project ID: {projectId}",
                Timestamp = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExportFinalReportAsync(Guid projectId, string format)
        {
            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null || string.IsNullOrEmpty(closure.FinalReport))
            {
                throw new ArgumentException("Final report not found");
            }

            // Implementation for exporting the report in different formats (PDF, Excel, etc.)
            // This will depend on the specific requirements and available libraries
            
            return true;
        }

        #region Private Helper Methods

        private async Task NotifyRelevantStakeholders(Guid projectId, string title, string message)
        {
            // Get project team members and stakeholders
            var project = await _context.Projects
                .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return;

            // Notify project manager
            await _notificationService.CreateNotificationAsync(
                project.PMUserId,
                "ProjectClosure",
                title,
                message
            );

            // Notify team members
            foreach (var member in project.TeamMembers)
            {
                await _notificationService.CreateNotificationAsync(
                    member.UserId,
                    "ProjectClosure",
                    title,
                    message
                );
            }

            // Notify department director
            var departmentDirectors = await _context.Users
                .Where(u => u.Role == UserRole.DepartmentDirector)
                .Where(u => u.DepartmentId == project.DepartmentId)
                .ToListAsync();

            foreach (var director in departmentDirectors)
            {
                await _notificationService.CreateNotificationAsync(
                    director.Id,
                    "ProjectClosure",
                    title,
                    message
                );
            }

            // Notify PMOs
            var pmos = await _context.Users
                .Where(u => u.Role == UserRole.SubPMO || u.Role == UserRole.MainPMO)
                .ToListAsync();

            foreach (var pmo in pmos)
            {
                await _notificationService.CreateNotificationAsync(
                    pmo.Id,
                    "ProjectClosure",
                    title,
                    message
                );
            }
        }

        private async Task NotifyForSignOffs(Guid projectId)
        {
            var closure = await GetClosureByProjectIdAsync(projectId);
            if (closure == null) return;

            var project = await _context.Projects
                .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null) return;

            // Add key stakeholders for sign-off
            // 1. Project Manager
            await AddStakeholderSignOffAsync(closure.Id, project.PMUserId, "Project Manager", project.PMUserId);

            // 2. Department Director
            var departmentDirectors = await _context.Users
                .Where(u => u.Role == UserRole.DepartmentDirector)
                .Where(u => u.DepartmentId == project.DepartmentId)
                .ToListAsync();

            foreach (var director in departmentDirectors)
            {
                await AddStakeholderSignOffAsync(closure.Id, director.Id, "Department Director", project.PMUserId);
            }

            // 3. Main PMO
            var mainPMOs = await _context.Users
                .Where(u => u.Role == UserRole.MainPMO)
                .ToListAsync();

            foreach (var pmo in mainPMOs.Take(1)) // Only need one Main PMO to sign off
            {
                await AddStakeholderSignOffAsync(closure.Id, pmo.Id, "Main PMO", project.PMUserId);
            }

            // 4. Client/Sponsor if available
            // This would require additional information about who the client/sponsor is
        }

        private string GenerateReportContent(Project project, ProjectClosure closure)
        {
            // This would be a more complex implementation in a real system
            // Here's a simplified version that formats basic project information
            
            return $@"# Final Project Report

## Project Overview
- **Project Name:** {project.Title}
- **Project Description:** {project.Description}
- **Department:** {project.Department?.Name}
- **Project Manager:** {project.ProjectManager?.FirstName} {project.ProjectManager?.LastName}
- **Start Date:** {project.CreatedAt.ToShortDateString()}
- **Completion Date:** {closure.CompletionDate?.ToShortDateString() ?? "N/A"}

## Project Performance
- **Budget:** {project.Budget:C}
- **Actual Cost:** {project.Financial?.ActualCost:C}
- **Budget Variance:** {(project.Budget - (project.Financial?.ActualCost ?? 0)):C}
- **Tasks Completed:** {project.Tasks.Count(t => t.Status == TaskStatus.Completed)} of {project.Tasks.Count}

## Key Accomplishments
{closure.ClosureSummary}

## Lessons Learned
{closure.LessonsLearned}

## Stakeholder Sign-offs
{string.Join("\n", closure.StakeholderSignOffs.Select(s => $"- {s.Role}: {(s.Status == SignOffStatus.Approved ? "Approved" : s.Status.ToString())} on {s.SignOffDate?.ToShortDateString() ?? "N/A"}"))}

## Risks and Issues Summary
- **Total Risks:** {project.RisksIssues.Count(ri => ri.Type == RiskIssueType.Risk)}
- **Total Issues:** {project.RisksIssues.Count(ri => ri.Type == RiskIssueType.Issue)}

## Final Remarks
This project is now officially closed and archived.
";
        }

        #endregion
    }
} 