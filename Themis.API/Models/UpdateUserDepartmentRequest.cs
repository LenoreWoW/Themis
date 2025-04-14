using System;
using System.ComponentModel.DataAnnotations;

namespace Themis.API.Models
{
    public class UpdateUserDepartmentRequest
    {
        [Required]
        public Guid DepartmentId { get; set; }
    }
} 