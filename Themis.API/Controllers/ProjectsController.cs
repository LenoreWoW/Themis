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

namespace Themis.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;
        private readonly IRepository<Department> _departmentRepository;

        public ProjectsController(IProjectService projectService, IRepository<Department> departmentRepository)
        {
            _projectService = projectService;
            _departmentRepository = departmentRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects([FromQuery] Guid? departmentId = null, [FromQuery] ProjectStatus? status = null)
        {
            try
            {
                IReadOnlyList<Project> projects;

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                if (departmentId.HasValue)
                {
                    projects = await _projectService.GetProjectsByDepartmentAsync(departmentId.Value);
                }
                else if (status.HasValue)
                {
                    projects = await _projectService.GetProjectsByStatusAsync(status.Value);
                }
                else if (userRole == UserRole.ProjectManager)
                {
                    // Project Managers only see their projects by default
                    projects = await _projectService.GetProjectsManagedByUserAsync(userId);
                }
                else if (userRole == UserRole.DepartmentDirector || userRole == UserRole.SubPMO)
                {
                    // Department Director and Sub PMO see department projects
                    var departmentIdClaim = User.Claims.FirstOrDefault(c => c.Type == "DepartmentId")?.Value;
                    if (departmentIdClaim != null && Guid.TryParse(departmentIdClaim, out var deptId))
                    {
                        projects = await _projectService.GetProjectsByDepartmentAsync(deptId);
                    }
                    else
                    {
                        projects = new List<Project>();
                    }
                }
                else
                {
                    // Admin, Executive, and Main PMO see all projects
                    projects = await _projectService.GetAllProjectsAsync();
                }

                return Ok(projects);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Project>> GetProject(Guid id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view this project
                bool canView = await _projectService.CanUserViewProjectAsync(id, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                var project = await _projectService.GetProjectByIdAsync(id);
                if (project == null)
                {
                    return NotFound();
                }

                return Ok(project);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [Authorize(Roles = "ProjectManager,Admin,Executive,MainPMO")]
        public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Verify department exists
                var department = await _departmentRepository.GetByIdAsync(request.DepartmentId);
                if (department == null)
                {
                    return BadRequest("Invalid department ID.");
                }

                // Create project entity
                var project = new Project
                {
                    Title = request.Title,
                    Description = request.Description,
                    DepartmentId = request.DepartmentId,
                    Budget = request.Budget,
                    GoalsLink = request.GoalsLink,
                    Financial = new Financial
                    {
                        PlannedCost = request.Budget,
                        ActualCost = 0
                    }
                };

                var createdProject = await _projectService.CreateProjectAsync(project, userId);
                return CreatedAtAction(nameof(GetProject), new { id = createdProject.Id }, createdProject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit this project
                bool canEdit = await _projectService.CanUserEditProjectAsync(id, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                var existingProject = await _projectService.GetProjectByIdAsync(id);
                if (existingProject == null)
                {
                    return NotFound();
                }

                // Update properties
                existingProject.Title = request.Title;
                existingProject.Description = request.Description;
                existingProject.Budget = request.Budget;
                existingProject.GoalsLink = request.GoalsLink;

                // Only update department if it's a draft project
                if (existingProject.Status == ProjectStatus.Draft)
                {
                    existingProject.DepartmentId = request.DepartmentId;
                }

                var updatedProject = await _projectService.UpdateProjectAsync(existingProject, userId);
                return Ok(updatedProject);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,Executive,MainPMO")]
        public async Task<IActionResult> DeleteProject(Guid id)
        {
            try
            {
                var result = await _projectService.DeleteProjectAsync(id);
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

        [HttpPost("{id}/submit")]
        [Authorize(Roles = "ProjectManager")]
        public async Task<IActionResult> SubmitForApproval(Guid id, [FromBody] SubmitForApprovalRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var result = await _projectService.SubmitForApprovalAsync(
                    id, 
                    request.RequestType, 
                    request.Comments, 
                    userId);

                if (!result.Success)
                {
                    return BadRequest(result.Message);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("approvals/{approvalId}/approve")]
        [Authorize(Roles = "SubPMO,MainPMO")]
        public async Task<IActionResult> ApproveRequest(Guid approvalId, [FromBody] ApprovalActionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var result = await _projectService.ApproveRequestAsync(
                    approvalId, 
                    request.Comments, 
                    userId);

                if (!result.Success)
                {
                    return BadRequest(result.Message);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("approvals/{approvalId}/reject")]
        [Authorize(Roles = "SubPMO,MainPMO")]
        public async Task<IActionResult> RejectRequest(Guid approvalId, [FromBody] ApprovalActionRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var userId = GetCurrentUserId();
                var result = await _projectService.RejectRequestAsync(
                    approvalId, 
                    request.Comments, 
                    userId);

                if (!result.Success)
                {
                    return BadRequest(result.Message);
                }

                return Ok(result);
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
            return Guid.Parse(userIdClaim);
        }

        private UserRole GetCurrentUserRole()
        {
            var roleClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            return Enum.Parse<UserRole>(roleClaim);
        }
        #endregion
    }
} 