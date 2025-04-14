using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Themis.Core.Entities;
using Themis.Core.Enums;
using Themis.Core.Interfaces;
using Themis.Core.Models;
using Themis.Infrastructure.Data;

namespace Themis.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> LoginAsync(string adIdentifier)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ADIdentifier == adIdentifier);
            
            if (user == null)
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User not found."
                };
            }

            var token = await GenerateJwtTokenAsync(adIdentifier);

            return new AuthResponse
            {
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role,
                DepartmentId = user.DepartmentId,
                Token = token,
                Success = true,
                Message = "Login successful"
            };
        }

        public async Task<AuthResponse> RegisterAsync(string username, string adIdentifier)
        {
            if (await _context.Users.AnyAsync(u => u.ADIdentifier == adIdentifier))
            {
                return new AuthResponse
                {
                    Success = false,
                    Message = "User with this AD identifier already exists."
                };
            }

            // Get the Hold department ID for new users
            var holdDepartment = await _context.Departments
                .FirstOrDefaultAsync(d => d.Name == "Hold");

            // If Hold department doesn't exist, create it
            if (holdDepartment == null)
            {
                holdDepartment = new Department
                {
                    Name = "Hold",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                await _context.Departments.AddAsync(holdDepartment);
                await _context.SaveChangesAsync();
            }

            var user = new User
            {
                Username = username,
                ADIdentifier = adIdentifier,
                Role = UserRole.Pending, // New users start with Pending role
                DepartmentId = holdDepartment.Id, // Assign to Hold department
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            var token = await GenerateJwtTokenAsync(adIdentifier);

            return new AuthResponse
            {
                UserId = user.Id,
                Username = user.Username,
                Role = user.Role,
                DepartmentId = user.DepartmentId,
                Token = token,
                Success = true,
                Message = "Registration successful"
            };
        }

        public async Task<string> GenerateJwtTokenAsync(string adIdentifier)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ADIdentifier == adIdentifier);
            
            if (user == null)
            {
                return null;
            }

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("ADIdentifier", user.ADIdentifier)
            };

            if (user.DepartmentId.HasValue)
            {
                claims.Add(new Claim("DepartmentId", user.DepartmentId.Value.ToString()));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.Now.AddMinutes(Convert.ToDouble(_configuration["Jwt:ExpiryInMinutes"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: expires,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
} 