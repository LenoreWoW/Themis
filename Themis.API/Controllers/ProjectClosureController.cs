using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Themis.API.Models;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Interfaces;
using Themis.Core.Models;

namespace Themis.API.Controllers
{
    [ApiController]
    [Route("api/projects/{projectId}/closure")]
    [Authorize]
    public class ProjectClosureController : ControllerBase
    {
        private readonly IProjectClosureService _closureService;
        private readonly IProjectService _projectService;

        public ProjectClosureController(IProjectClosureService closureService, IProjectService projectService)
        {
            _closureService = closureService;
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<ActionResult<ProjectClosure>> GetProjectClosure(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view the project
                bool canView = await _projectService.CanUserViewProjectAsync(projectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                var closure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (closure == null)
                {
                    return NotFound();
                }

                return Ok(closure);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("initiate")]
        [Authorize(Roles = "ProjectManager,Admin")]
        public async Task<ActionResult<ProjectClosure>> InitiateClosureProcess(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                var closure = await _closureService.InitiateClosureProcessAsync(projectId, userId);
                return Ok(closure);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut]
        [Authorize(Roles = "ProjectManager,Admin")]
        public async Task<ActionResult<ProjectClosure>> UpdateClosure(Guid projectId, [FromBody] UpdateClosureRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                var existingClosure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (existingClosure == null)
                {
                    return NotFound();
                }

                // Update closure properties
                existingClosure.LessonsLearned = request.LessonsLearned;
                existingClosure.ClosureSummary = request.ClosureSummary;
                existingClosure.TasksCompleted = request.TasksCompleted;
                existingClosure.DeliverableAccepted = request.DeliverableAccepted;
                existingClosure.ResourcesReleased = request.ResourcesReleased;
                existingClosure.DocumentationComplete = request.DocumentationComplete;
                existingClosure.FinancialsClosed = request.FinancialsClosed;

                var updatedClosure = await _closureService.UpdateClosureAsync(existingClosure, userId);
                return Ok(updatedClosure);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("checklist")]
        [Authorize(Roles = "ProjectManager,Admin")]
        public async Task<ActionResult> UpdateClosureChecklist(Guid projectId, [FromBody] ProjectClosureChecklist checklist)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                await _closureService.UpdateClosureChecklistAsync(projectId, checklist, userId);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("complete")]
        [Authorize(Roles = "ProjectManager,Admin,ExecutiveManagement,MainPMO")]
        public async Task<ActionResult> CompleteClosure(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Higher level roles or the project manager can complete the closure
                bool canComplete = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canComplete)
                {
                    return Forbid();
                }

                await _closureService.CompleteClosureAsync(projectId, userId);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("archive")]
        [Authorize(Roles = "Admin,ExecutiveManagement,MainPMO")]
        public async Task<ActionResult> ArchiveProject(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();

                await _closureService.ArchiveProjectAsync(projectId, userId);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("signoffs")]
        public async Task<ActionResult<List<ProjectClosureSignOff>>> GetSignOffs(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view the project
                bool canView = await _projectService.CanUserViewProjectAsync(projectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                var closure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (closure == null)
                {
                    return NotFound();
                }

                var signOffs = await _closureService.GetSignOffsByClosureIdAsync(closure.Id);
                return Ok(signOffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("signoffs")]
        [Authorize(Roles = "ProjectManager,Admin")]
        public async Task<ActionResult<ProjectClosureSignOff>> AddStakeholderSignOff(Guid projectId, [FromBody] AddSignOffRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                var closure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (closure == null)
                {
                    return NotFound();
                }

                var signOff = await _closureService.AddStakeholderSignOffAsync(closure.Id, request.StakeholderId, request.Role, userId);
                return Ok(signOff);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("signoffs/{signOffId}/approve")]
        public async Task<ActionResult<ProjectClosureSignOff>> ApproveSignOff(Guid projectId, Guid signOffId, [FromBody] SignOffActionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var signOff = await _closureService.ApproveSignOffAsync(signOffId, request.Comments, userId);
                return Ok(signOff);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("signoffs/{signOffId}/reject")]
        public async Task<ActionResult<ProjectClosureSignOff>> RejectSignOff(Guid projectId, Guid signOffId, [FromBody] SignOffActionRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();

                var signOff = await _closureService.RejectSignOffAsync(signOffId, request.Comments, userId);
                return Ok(signOff);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("attachments")]
        public async Task<ActionResult<List<ProjectClosureAttachment>>> GetAttachments(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view the project
                bool canView = await _projectService.CanUserViewProjectAsync(projectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                var closure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (closure == null)
                {
                    return NotFound();
                }

                var attachments = await _closureService.GetAttachmentsByClosureIdAsync(closure.Id);
                return Ok(attachments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("attachments")]
        public async Task<ActionResult<ProjectClosureAttachment>> AddAttachment(Guid projectId, [FromForm] AddAttachmentRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                var closure = await _closureService.GetClosureByProjectIdAsync(projectId);
                if (closure == null)
                {
                    return NotFound();
                }

                // Handle file upload
                if (request.File == null || request.File.Length == 0)
                {
                    return BadRequest("No file was uploaded");
                }

                // In a real implementation, save the file to the file system or blob storage
                // and get the path to save in the database
                string filePath = $"uploads/{Guid.NewGuid()}-{request.File.FileName}";
                
                // Create the attachment entity
                var attachment = new ProjectClosureAttachment
                {
                    ProjectClosureId = closure.Id,
                    FileName = request.File.FileName,
                    FileType = request.File.ContentType,
                    FilePath = filePath,
                    FileSize = request.File.Length,
                    Description = request.Description,
                    Category = request.Category,
                    UploadedById = userId
                };

                var savedAttachment = await _closureService.AddAttachmentAsync(attachment);
                return Ok(savedAttachment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("attachments/{attachmentId}")]
        public async Task<ActionResult> DeleteAttachment(Guid projectId, Guid attachmentId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                bool result = await _closureService.DeleteAttachmentAsync(attachmentId);
                if (!result)
                {
                    return NotFound();
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("report")]
        [Authorize(Roles = "ProjectManager,Admin,ExecutiveManagement,MainPMO")]
        public async Task<ActionResult> GenerateFinalReport(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit the project
                bool canEdit = await _projectService.CanUserEditProjectAsync(projectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                await _closureService.GenerateFinalReportAsync(projectId, userId);
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("report/export")]
        public async Task<ActionResult> ExportFinalReport(Guid projectId, [FromQuery] string format = "pdf")
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view the project
                bool canView = await _projectService.CanUserViewProjectAsync(projectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                await _closureService.ExportFinalReportAsync(projectId, format);
                
                // In a real implementation, this would return the file for download
                return Ok();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #region Helper Methods

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID in token");
            }
            return userId;
        }

        private UserRole GetCurrentUserRole()
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            if (string.IsNullOrEmpty(roleClaim) || !Enum.TryParse<UserRole>(roleClaim, out var role))
            {
                throw new UnauthorizedAccessException("Invalid role in token");
            }
            return role;
        }

        #endregion
    }
} 