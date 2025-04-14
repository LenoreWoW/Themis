using System;
using System.ComponentModel.DataAnnotations;

namespace Themis.API.Models
{
    public class CreateProjectRequest
    {
        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public Guid DepartmentId { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Budget { get; set; }

        public string GoalsLink { get; set; }
    }
} 