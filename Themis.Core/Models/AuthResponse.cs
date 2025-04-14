using System;
using Themis.Core.Enums;

namespace Themis.Core.Models
{
    public class AuthResponse
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public UserRole Role { get; set; }
        public Guid? DepartmentId { get; set; }
        public string Token { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }
} 