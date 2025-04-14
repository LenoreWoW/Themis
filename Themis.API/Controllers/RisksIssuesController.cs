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
    public class RisksIssuesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IProjectService _projectService;

        public RisksIssuesController(ApplicationDbContext context, IProjectService projectService)
        {
            _context = context;
            _projectService = projectService;
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<RiskIssue>>> GetRisksIssuesByProject(Guid projectId)
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

                var risksIssues = await _context.RisksIssues
                    .Where(r => r.ProjectId == projectId)
                    .ToListAsync();

                return Ok(risksIssues);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RiskIssue>> GetRiskIssue(Guid id)
        {
            try
            {
                var riskIssue = await _context.RisksIssues
                    .Include(r => r.Project)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (riskIssue == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can view this project
                bool canView = await _projectService.CanUserViewProjectAsync(riskIssue.ProjectId, userId, userRole);
                if (!canView)
                {
                    return Forbid();
                }

                return Ok(riskIssue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<RiskIssue>> CreateRiskIssue([FromBody] CreateRiskIssueRequest request)
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

                var riskIssue = new RiskIssue
                {
                    ProjectId = request.ProjectId,
                    Name = request.Name,
                    Description = request.Description,
                    Severity = request.Severity,
                    Probability = request.Probability,
                    IsIssue = request.IsIssue,
                    Status = request.Status,
                    MitigationPlan = request.MitigationPlan
                };

                await _context.RisksIssues.AddAsync(riskIssue);
                
                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = request.IsIssue ? "Issue" : "Risk",
                    EntityId = riskIssue.Id,
                    UserId = userId,
                    Action = "Create",
                    Details = $"Created {(request.IsIssue ? "issue" : "risk")}: {riskIssue.Name} for Project ID: {riskIssue.ProjectId}",
                    Timestamp = DateTime.UtcNow
                });
                
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetRiskIssue), new { id = riskIssue.Id }, riskIssue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRiskIssue(Guid id, [FromBody] UpdateRiskIssueRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var riskIssue = await _context.RisksIssues.FindAsync(id);
                if (riskIssue == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit this project
                bool canEdit = await _projectService.CanUserEditProjectAsync(riskIssue.ProjectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                // Update properties
                riskIssue.Name = request.Name;
                riskIssue.Description = request.Description;
                riskIssue.Severity = request.Severity;
                riskIssue.Probability = request.Probability;
                riskIssue.IsIssue = request.IsIssue;
                riskIssue.Status = request.Status;
                riskIssue.MitigationPlan = request.MitigationPlan;

                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = request.IsIssue ? "Issue" : "Risk",
                    EntityId = riskIssue.Id,
                    UserId = userId,
                    Action = "Update",
                    Details = $"Updated {(request.IsIssue ? "issue" : "risk")}: {riskIssue.Name}",
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
        public async Task<IActionResult> DeleteRiskIssue(Guid id)
        {
            try
            {
                var riskIssue = await _context.RisksIssues.FindAsync(id);
                if (riskIssue == null)
                {
                    return NotFound();
                }

                var userId = GetCurrentUserId();
                var userRole = GetCurrentUserRole();

                // Check if user can edit this project
                bool canEdit = await _projectService.CanUserEditProjectAsync(riskIssue.ProjectId, userId, userRole);
                if (!canEdit)
                {
                    return Forbid();
                }

                // Create audit log
                await _context.AuditLogs.AddAsync(new AuditLog
                {
                    EntityType = riskIssue.IsIssue ? "Issue" : "Risk",
                    EntityId = riskIssue.Id,
                    UserId = userId,
                    Action = "Delete",
                    Details = $"Deleted {(riskIssue.IsIssue ? "issue" : "risk")}: {riskIssue.Name}",
                    Timestamp = DateTime.UtcNow
                });
                
                _context.RisksIssues.Remove(riskIssue);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("summary/project/{projectId}")]
        public async Task<ActionResult<RiskIssueSummary>> GetRiskIssueSummary(Guid projectId)
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

                var risksIssues = await _context.RisksIssues
                    .Where(r => r.ProjectId == projectId)
                    .ToListAsync();

                var summary = new RiskIssueSummary
                {
                    ProjectId = projectId,
                    TotalRisks = risksIssues.Count(r => !r.IsIssue),
                    TotalIssues = risksIssues.Count(r => r.IsIssue),
                    HighSeverityCount = risksIssues.Count(r => r.Severity == RiskSeverity.High || r.Severity == RiskSeverity.Critical),
                    MediumSeverityCount = risksIssues.Count(r => r.Severity == RiskSeverity.Medium),
                    LowSeverityCount = risksIssues.Count(r => r.Severity == RiskSeverity.Low),
                    OpenItemsCount = risksIssues.Count(r => r.Status != "Closed" && r.Status != "Resolved")
                };

                return Ok(summary);
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