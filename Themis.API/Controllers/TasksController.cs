using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Themis.API.Models;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Interfaces;
using Themis.Infrastructure.Data;

namespace Themis.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IProjectService _projectService;

        public TasksController(ApplicationDbContext context, IProjectService projectService)
        {
            _context = context;
            _projectService = projectService;
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByProject(Guid projectId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view this project
                bool canView = await _projectService.CanUserViewProjectAsync(projectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                var tasks = await _context.Tasks
                    .Include(t => t.AssignedUser)
                    .Where(t => t.ProjectId == projectId)
                    .ToListAsync();

                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProjectTask>> GetTask(Guid id)
        {
            try
            {
                var task = await _context.Tasks
                    .Include(t => t.AssignedUser)
                    .Include(t => t.Project)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view this project
                bool canView = await _projectService.CanUserViewProjectAsync(task.ProjectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<ProjectTask>> CreateTask([FromBody] CreateTaskRequest request)
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
                bool canEdit = await _projectService.CanUserEditProjectAsync(request.ProjectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                // Validate project exists
                var project = await _context.Projects.FindAsync(request.ProjectId);
                if (project == null)
                {
                    return BadRequest("Invalid project ID.");
                }

                // Validate assigned user if specified
                if (request.AssignedUserId.HasValue)
                {
                    var assignedUser = await _context.Users.FindAsync(request.AssignedUserId.Value);
                    if (assignedUser == null)
                    {
                        return BadRequest("Invalid assigned user ID.");
                    }
                }

                // Validate parent task if specified
                if (request.ParentTaskId.HasValue)
                {
                    var parentTask = await _context.Tasks.FindAsync(request.ParentTaskId.Value);
                    if (parentTask == null)
                    {
                        return BadRequest("Invalid parent task ID.");
                    }

                    // Parent task must be in the same project
                    if (parentTask.ProjectId != request.ProjectId)
                    {
                        return BadRequest("Parent task must be in the same project.");
                    }
                }

                var task = new ProjectTask
                {
                    ProjectId = request.ProjectId,
                    AssignedUserId = request.AssignedUserId,
                    Title = request.Title,
                    Description = request.Description,
                    StartDate = request.StartDate,
                    DueDate = request.DueDate,
                    Status = Themis.Core.Enums.TaskStatus.NotStarted,
                    IsMilestone = request.IsMilestone,
                    ParentTaskId = request.ParentTaskId
                };

                await _context.Tasks.AddAsync(task);
                
                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = "Task",
                    EntityId = task.Id,
                    UserId = userId,
                    Action = "Create",
                    Details = $"Created task: {task.Title} for Project ID: {task.ProjectId}",
                    Timestamp = DateTime.UtcNow
                });
                
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(Guid id, [FromBody] UpdateTaskRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit this project
                bool canEdit = await _projectService.CanUserEditProjectAsync(task.ProjectId, userId, userRole);
                if (!canEdit && task.AssignedUserId != userId)
                {
                    return Forbid();
                }

                // Validate assigned user if specified
                if (request.AssignedUserId.HasValue)
                {
                    var assignedUser = await _context.Users.FindAsync(request.AssignedUserId.Value);
                    if (assignedUser == null)
                    {
                        return BadRequest("Invalid assigned user ID.");
                    }
                }

                // Validate parent task if specified
                if (request.ParentTaskId.HasValue)
                {
                    var parentTask = await _context.Tasks.FindAsync(request.ParentTaskId.Value);
                    if (parentTask == null)
                    {
                        return BadRequest("Invalid parent task ID.");
                    }

                    // Parent task must be in the same project
                    if (parentTask.ProjectId != task.ProjectId)
                    {
                        return BadRequest("Parent task must be in the same project.");
                    }

                    // Prevent circular dependencies
                    if (parentTask.Id == task.Id)
                    {
                        return BadRequest("Task cannot be its own parent.");
                    }
                }

                // Update properties
                task.AssignedUserId = request.AssignedUserId;
                task.Title = request.Title;
                task.Description = request.Description;
                task.StartDate = request.StartDate;
                task.DueDate = request.DueDate;
                task.Status = request.Status;
                task.IsMilestone = request.IsMilestone;
                task.ParentTaskId = request.ParentTaskId;

                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = "Task",
                    EntityId = task.Id,
                    UserId = userId,
                    Action = "Update",
                    Details = $"Updated task: {task.Title}",
                    Timestamp = DateTime.UtcNow
                });
                
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(Guid id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit this project
                bool canEdit = await _projectService.CanUserEditProjectAsync(task.ProjectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = "Task",
                    EntityId = task.Id,
                    UserId = userId,
                    Action = "Delete",
                    Details = $"Deleted task: {task.Title}",
                    Timestamp = DateTime.UtcNow
                });
                
                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByUser(Guid userId)
        {
            try
            {
                var currentUserId = GetCurrentUserId();
                var currentUserRole = GetCurrentUserRole();

                // You can only view your own tasks unless you're in a management role
                if (userId != currentUserId && 
                    currentUserRole != UserRole.Admin && 
                    currentUserRole != UserRole.Executive && 
                    currentUserRole != UserRole.MainPMO)
                {
                    return Forbid();
                }

                var tasks = await _context.Tasks
                    .Include(t => t.Project)
                    .Include(t => t.AssignedUser)
                    .Where(t => t.AssignedUserId == userId)
                    .ToListAsync();

                return Ok(tasks);
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