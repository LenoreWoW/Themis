using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Models;

namespace Themis.Core.Interfaces
{
    public interface IProjectService
    {
        Task<Project> GetProjectByIdAsync(Guid id);
        Task<IReadOnlyList<Project>> GetAllProjectsAsync();
        Task<IReadOnlyList<Project>> GetProjectsByDepartmentAsync(Guid departmentId);
        Task<IReadOnlyList<Project>> GetProjectsByStatusAsync(ProjectStatus status);
        Task<IReadOnlyList<Project>> GetProjectsManagedByUserAsync(Guid userId);
        Task<Project> CreateProjectAsync(Project project, Guid userId);
        Task<Project> UpdateProjectAsync(Project project, Guid userId);
        Task<bool> DeleteProjectAsync(Guid id);
        Task<bool> CanUserEditProjectAsync(Guid projectId, Guid userId, UserRole userRole);
        Task<bool> CanUserViewProjectAsync(Guid projectId, Guid userId, UserRole userRole);
        Task<ApprovalResult> SubmitForApprovalAsync(Guid projectId, RequestType requestType, string comments, Guid userId);
        Task<ApprovalResult> ApproveRequestAsync(Guid approvalId, string comments, Guid userId);
        Task<ApprovalResult> RejectRequestAsync(Guid approvalId, string comments, Guid userId);
    }
} 