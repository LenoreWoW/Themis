using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Themis.API.Models;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Infrastructure.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;

namespace Themis.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Executive,MainPMO,DepartmentDirector")]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers([FromQuery] UserRole? role = null)
        {
            var query = _context.Users.Include(u => u.Department).AsQueryable();

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            var users = await query.ToListAsync();
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            var user = await _context.Users.Include(u => u.Department).FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin,Executive,MainPMO,DepartmentDirector")]
        public async Task<ActionResult<IEnumerable<User>>> GetPendingUsers()
        {
            var users = await _context.Users
                .Include(u => u.Department)
                .Where(u => u.Role == UserRole.Pending)
                .ToListAsync();
                
            return Ok(users);
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "Admin,Executive,MainPMO,DepartmentDirector")]
        public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Check authorization based on the caller's role
            var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            if (currentUserRole == null)
            {
                return Forbid();
            }

            if (!CanAssignRole(Enum.Parse<UserRole>(currentUserRole), request.Role))
            {
                return Forbid("You don't have permission to assign this role.");
            }

            user.Role = request.Role;
            
            if (request.DepartmentId.HasValue)
            {
                var department = await _context.Departments.FindAsync(request.DepartmentId.Value);
                if (department == null)
                {
                    return BadRequest("Invalid department ID.");
                }
                user.DepartmentId = request.DepartmentId;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPut("{id}/department")]
        [Authorize(Roles = "Admin,Executive,MainPMO,DepartmentDirector")]
        public async Task<IActionResult> UpdateUserDepartment(Guid id, [FromBody] UpdateUserDepartmentRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            var department = await _context.Departments.FindAsync(request.DepartmentId);
            if (department == null)
            {
                return BadRequest("Invalid department ID.");
            }

            // Check authorization
            var currentUserRole = User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
            if (currentUserRole == null)
            {
                return Forbid();
            }

            // Update user department
            user.DepartmentId = request.DepartmentId;
            user.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("me")]
        public async Task<ActionResult<User>> GetCurrentUser()
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            if (userId == null || !Guid.TryParse(userId, out var userGuid))
            {
                return BadRequest("Invalid user ID in token.");
            }

            var user = await _context.Users
                .Include(u => u.Department)
                .FirstOrDefaultAsync(u => u.Id == userGuid);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("departments")]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            var departments = await _context.Departments.OrderBy(d => d.Name).ToListAsync();
            return Ok(departments);
        }

        // Helper method to check if a user can assign a specific role
        private bool CanAssignRole(UserRole assignerRole, UserRole targetRole)
        {
            switch (assignerRole)
            {
                case UserRole.Admin:
                    // Admin can assign any role
                    return true;
                case UserRole.Executive:
                    // Executive can assign any role except Admin
                    return targetRole != UserRole.Admin;
                case UserRole.MainPMO:
                    // MainPMO can assign PM, SubPMO roles
                    return targetRole == UserRole.ProjectManager || targetRole == UserRole.SubPMO;
                case UserRole.DepartmentDirector:
                    // Department Director can only assign PM role
                    return targetRole == UserRole.ProjectManager;
                default:
                    return false;
            }
        }
    }
} 