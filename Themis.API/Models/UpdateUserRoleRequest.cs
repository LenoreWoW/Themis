using System;
using System.ComponentModel.DataAnnotations;
using Themis.Core.Enums;

namespace Themis.API.Models
{
    public class UpdateUserRoleRequest
    {
        [Required]
        public UserRole Role { get; set; }
        
        public Guid? DepartmentId { get; set; }
    }
} 