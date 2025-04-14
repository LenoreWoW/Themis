using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Models;

namespace Themis.Core.Interfaces
{
    public interface IProjectClosureService
    {
        // Core closure operations
        Task<ProjectClosure> GetClosureByProjectIdAsync(Guid projectId);
        Task<ProjectClosure> InitiateClosureProcessAsync(Guid projectId, Guid userId);
        Task<ProjectClosure> UpdateClosureAsync(ProjectClosure closure, Guid userId);
        Task<bool> CompleteClosureAsync(Guid projectId, Guid userId);
        Task<bool> ArchiveProjectAsync(Guid projectId, Guid userId);
        
        // Checklist operations
        Task<bool> UpdateClosureChecklistAsync(Guid projectId, ProjectClosureChecklist checklist, Guid userId);
        
        // Stakeholder sign-off operations
        Task<List<ProjectClosureSignOff>> GetSignOffsByClosureIdAsync(Guid closureId);
        Task<ProjectClosureSignOff> AddStakeholderSignOffAsync(Guid closureId, Guid stakeholderId, string role, Guid userId);
        Task<ProjectClosureSignOff> ApproveSignOffAsync(Guid signOffId, string comments, Guid userId);
        Task<ProjectClosureSignOff> RejectSignOffAsync(Guid signOffId, string comments, Guid userId);
        
        // Attachment operations
        Task<List<ProjectClosureAttachment>> GetAttachmentsByClosureIdAsync(Guid closureId);
        Task<ProjectClosureAttachment> AddAttachmentAsync(ProjectClosureAttachment attachment);
        Task<bool> DeleteAttachmentAsync(Guid attachmentId);
        
        // Final report operations
        Task<bool> GenerateFinalReportAsync(Guid projectId, Guid userId);
        Task<bool> ExportFinalReportAsync(Guid projectId, string format);
    }
} 