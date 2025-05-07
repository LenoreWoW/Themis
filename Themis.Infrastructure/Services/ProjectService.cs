using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Interfaces;
using Themis.Core.Models;
using Themis.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;

namespace Themis.Infrastructure.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAuditLogService _auditLogService;
        private readonly ILogger<ProjectService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public ProjectService(ApplicationDbContext context, IAuditLogService auditLogService, ILogger<ProjectService> logger, IServiceProvider serviceProvider)
        {
            _context = context;
            _auditLogService = auditLogService;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task<Project> GetProjectByIdAsync(Guid id)
        {
            return await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.ProjectManager)
                .Include(p => p.Tasks)
                .Include(p => p.RisksIssues)
                .Include(p => p.Financial)
                .Include(p => p.TeamMembers)
                .ThenInclude(tm => tm.User)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IReadOnlyList<Project>> GetAllProjectsAsync()
        {
            return await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.ProjectManager)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Project>> GetProjectsByDepartmentAsync(Guid departmentId)
        {
            return await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.ProjectManager)
                .Where(p => p.DepartmentId == departmentId)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Project>> GetProjectsByStatusAsync(ProjectStatus status)
        {
            return await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.ProjectManager)
                .Where(p => p.Status == status)
                .ToListAsync();
        }

        public async Task<IReadOnlyList<Project>> GetProjectsManagedByUserAsync(Guid userId)
        {
            return await _context.Projects
                .Include(p => p.Department)
                .Include(p => p.ProjectManager)
                .Where(p => p.PMUserId == userId)
                .ToListAsync();
        }

        public async Task<Project> CreateProjectAsync(Project project, Guid userId)
        {
            // Set initial properties
            project.Status = ProjectStatus.Draft;
            project.PMUserId = userId;
            
            // Create the default financial record
            if (project.Financial == null)
            {
                project.Financial = new Financial
                {
                    PlannedCost = project.Budget,
                    ActualCost = 0
                };
            }

            await _context.Projects.AddAsync(project);
            
            // Create an audit log entry
            await _auditLogService.LogActionAsync(userId, "Project", project.Id.ToString(), "Create", $"Created project: {project.Title}");
            
            // Create a chat channel for the project
            try
            {
                var chatService = _serviceProvider.GetService<IChatService>();
                if (chatService != null)
                {
                    await chatService.CreateProjectChannelAsync(project.Id.ToString());
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the project creation
                _logger.LogError(ex, "Failed to create project chat channel");
            }
            
            await _context.SaveChangesAsync();
            
            return project;
        }

        public async Task<Project> UpdateProjectAsync(Project project, Guid userId)
        {
            var existingProject = await _context.Projects
                .Include(p => p.Financial)
                .FirstOrDefaultAsync(p => p.Id == project.Id);
                
            if (existingProject == null)
            {
                throw new ArgumentException($"Project with ID {project.Id} not found");
            }

            // Don't allow PMO-level status changes through direct updates
            if (existingProject.Status != project.Status && 
                (existingProject.Status == ProjectStatus.SubPMOReview || 
                 existingProject.Status == ProjectStatus.MainPMOApproval))
            {
                project.Status = existingProject.Status;
            }

            // Update properties
            existingProject.Title = project.Title;
            existingProject.Description = project.Description;
            existingProject.Budget = project.Budget;
            existingProject.GoalsLink = project.GoalsLink;
            
            // Only update department if changing is allowed at this stage
            if (existingProject.Status == ProjectStatus.Draft)
            {
                existingProject.DepartmentId = project.DepartmentId;
            }

            // Update Financial
            if (project.Financial != null)
            {
                if (existingProject.Financial == null)
                {
                    existingProject.Financial = new Financial
                    {
                        ProjectId = project.Id,
                        PlannedCost = project.Financial.PlannedCost,
                        ActualCost = project.Financial.ActualCost
                    };
                }
                else
                {
                    existingProject.Financial.PlannedCost = project.Financial.PlannedCost;
                    existingProject.Financial.ActualCost = project.Financial.ActualCost;
                }
            }

            // Create an audit log entry
            await _auditLogService.LogActionAsync(userId, "Project", project.Id.ToString(), "Update", $"Updated project: {project.Title}");
            
            // If project is now completed, archive its chat channel
            bool isCompletingProject = existingProject.Status != "COMPLETED" && project.Status == "COMPLETED";
            if (isCompletingProject)
            {
                try
                {
                    var chatService = _serviceProvider.GetService<IChatService>();
                    if (chatService != null)
                    {
                        await chatService.HandleProjectCompletionAsync(project.Id.ToString());
                    }
                }
                catch (Exception ex)
                {
                    // Log the error but don't fail the project update
                    _logger.LogError(ex, "Failed to archive project chat channel");
                }
            }
            
            await _context.SaveChangesAsync();
            
            return existingProject;
        }

        public async Task<bool> DeleteProjectAsync(Guid id)
        {
            var project = await _context.Projects.FindAsync(id);
            if (project == null)
            {
                return false;
            }

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<bool> CanUserEditProjectAsync(Guid projectId, Guid userId, UserRole userRole)
        {
            // Admin and Executive can edit any project
            if (userRole == UserRole.Admin || userRole == UserRole.Executive)
            {
                return true;
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return false;
            }

            // Project Manager can edit their own projects
            if (userRole == UserRole.ProjectManager && project.PMUserId == userId)
            {
                return true;
            }

            // PMOs can edit projects in certain statuses
            if (userRole == UserRole.SubPMO && project.Status == ProjectStatus.SubPMOReview)
            {
                return true;
            }

            if (userRole == UserRole.MainPMO && 
               (project.Status == ProjectStatus.SubPMOReview || 
                project.Status == ProjectStatus.MainPMOApproval))
            {
                return true;
            }

            // Department Director can view but not edit projects
            return false;
        }

        public async Task<bool> CanUserViewProjectAsync(Guid projectId, Guid userId, UserRole userRole)
        {
            // Admin, Executive, and PMOs can view any project
            if (userRole == UserRole.Admin || 
                userRole == UserRole.Executive || 
                userRole == UserRole.MainPMO)
            {
                return true;
            }

            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return false;
            }

            // Project Manager can view their own projects
            if (userRole == UserRole.ProjectManager && project.PMUserId == userId)
            {
                return true;
            }

            // Sub PMO can view projects in their department
            if (userRole == UserRole.SubPMO)
            {
                var user = await _context.Users.FindAsync(userId);
                return user.DepartmentId.HasValue && user.DepartmentId.Value == project.DepartmentId;
            }

            // Department Director can view projects in their department
            if (userRole == UserRole.DepartmentDirector)
            {
                var user = await _context.Users.FindAsync(userId);
                return user.DepartmentId.HasValue && user.DepartmentId.Value == project.DepartmentId;
            }

            // Team members can view projects they're assigned to
            var isTeamMember = await _context.ProjectTeamMembers
                .AnyAsync(tm => tm.ProjectId == projectId && tm.UserId == userId);
                
            return isTeamMember;
        }

        public async Task<ApprovalResult> SubmitForApprovalAsync(Guid projectId, RequestType requestType, string comments, Guid userId)
        {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null)
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "Project not found." 
                };
            }

            // Verify if the user is the project manager
            var user = await _context.Users.FindAsync(userId);
            if (user.Role != UserRole.ProjectManager && project.PMUserId != userId)
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "Only the project manager can submit for approval." 
                };
            }

            // Validate based on request type
            if (requestType == RequestType.NewProject && project.Status != ProjectStatus.Draft)
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "Only draft projects can be submitted for new project approval." 
                };
            }

            // Update project status based on request type
            var previousStatus = project.Status.ToString();
            var newStatus = ProjectStatus.SubPMOReview;
            
            project.Status = newStatus;
            await _context.SaveChangesAsync();

            // Create approval record
            var approval = new Approval
            {
                ProjectId = projectId,
                RequestType = requestType,
                RequestedByUserId = userId,
                ApprovalStatus = ApprovalStatus.Pending,
                Comments = comments,
                PreviousStatus = previousStatus,
                NewStatus = newStatus.ToString()
            };

            await _context.Approvals.AddAsync(approval);
            
            // Create audit log
            await _auditLogService.LogActionAsync(userId, "Project", projectId.ToString(), "SubmitForApproval", $"Project submitted for {requestType} approval.");
            
            await _context.SaveChangesAsync();

            return new ApprovalResult
            {
                Success = true,
                Message = $"Project submitted for {requestType} approval.",
                Approval = approval,
                NewProjectStatus = newStatus
            };
        }

        public async Task<ApprovalResult> ApproveRequestAsync(Guid approvalId, string comments, Guid userId)
        {
            var approval = await _context.Approvals
                .Include(a => a.Project)
                .FirstOrDefaultAsync(a => a.Id == approvalId);
                
            if (approval == null)
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "Approval request not found." 
                };
            }

            // Get the user and verify role
            var user = await _context.Users.FindAsync(userId);
            var project = approval.Project;

            if (user.Role == UserRole.SubPMO && approval.ApprovalStatus == ApprovalStatus.Pending)
            {
                // Sub PMO can only approve pending requests
                approval.ApprovalStatus = ApprovalStatus.ApprovedBySubPMO;
                approval.ApprovedByUserId = userId;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.Comments += $"\n\nSubPMO Approval Comment: {comments}";
                
                // Project stays in SubPMOReview status until MainPMO approval
                
                await _context.SaveChangesAsync();
                
                return new ApprovalResult
                {
                    Success = true,
                    Message = "Request approved by Sub PMO. Awaiting Main PMO approval.",
                    Approval = approval,
                    NewProjectStatus = project.Status
                };
            }
            else if (user.Role == UserRole.MainPMO && 
                    (approval.ApprovalStatus == ApprovalStatus.Pending || 
                     approval.ApprovalStatus == ApprovalStatus.ApprovedBySubPMO))
            {
                // Main PMO can approve both pending and SubPMO approved requests
                approval.ApprovalStatus = ApprovalStatus.ApprovedByMainPMO;
                approval.ApprovedByUserId = userId;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.Comments += $"\n\nMainPMO Approval Comment: {comments}";

                // Update project status based on request type
                var newStatus = project.Status;
                if (approval.RequestType == RequestType.NewProject)
                {
                    newStatus = ProjectStatus.InProgress;
                }
                
                project.Status = newStatus;
                
                // Create audit log
                await _auditLogService.LogActionAsync(userId, "Project", project.Id.ToString(), "ApproveRequest", $"Project {approval.RequestType} request approved by Main PMO.");
                
                await _context.SaveChangesAsync();
                
                return new ApprovalResult
                {
                    Success = true,
                    Message = "Request fully approved by Main PMO.",
                    Approval = approval,
                    NewProjectStatus = newStatus
                };
            }
            else
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "You don't have permission to approve this request or the request is already approved/rejected." 
                };
            }
        }

        public async Task<ApprovalResult> RejectRequestAsync(Guid approvalId, string comments, Guid userId)
        {
            var approval = await _context.Approvals
                .Include(a => a.Project)
                .FirstOrDefaultAsync(a => a.Id == approvalId);
                
            if (approval == null)
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "Approval request not found." 
                };
            }

            // Get the user and verify role
            var user = await _context.Users.FindAsync(userId);
            var project = approval.Project;

            if (user.Role == UserRole.SubPMO && approval.ApprovalStatus == ApprovalStatus.Pending)
            {
                // Sub PMO can reject pending requests
                approval.ApprovalStatus = ApprovalStatus.RejectedBySubPMO;
                approval.ApprovedByUserId = userId;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.Comments += $"\n\nSubPMO Rejection Comment: {comments}";
                
                // Reset project status to what it was before
                var previousStatus = Enum.Parse<ProjectStatus>(approval.PreviousStatus);
                project.Status = previousStatus;
                
                await _context.SaveChangesAsync();
                
                return new ApprovalResult
                {
                    Success = true,
                    Message = "Request rejected by Sub PMO.",
                    Approval = approval,
                    NewProjectStatus = previousStatus
                };
            }
            else if (user.Role == UserRole.MainPMO && 
                    (approval.ApprovalStatus == ApprovalStatus.Pending || 
                     approval.ApprovalStatus == ApprovalStatus.ApprovedBySubPMO))
            {
                // Main PMO can reject both pending and SubPMO approved requests
                approval.ApprovalStatus = ApprovalStatus.RejectedByMainPMO;
                approval.ApprovedByUserId = userId;
                approval.ApprovalDate = DateTime.UtcNow;
                approval.Comments += $"\n\nMainPMO Rejection Comment: {comments}";

                // Reset project status to what it was before
                var previousStatus = Enum.Parse<ProjectStatus>(approval.PreviousStatus);
                project.Status = previousStatus;
                
                // Create audit log
                await _auditLogService.LogActionAsync(userId, "Project", project.Id.ToString(), "RejectRequest", $"Project {approval.RequestType} request rejected by Main PMO.");
                
                await _context.SaveChangesAsync();
                
                return new ApprovalResult
                {
                    Success = true,
                    Message = "Request rejected by Main PMO.",
                    Approval = approval,
                    NewProjectStatus = previousStatus
                };
            }
            else
            {
                return new ApprovalResult 
                { 
                    Success = false, 
                    Message = "You don't have permission to reject this request or the request is already approved/rejected." 
                };
            }
        }
    }
} 