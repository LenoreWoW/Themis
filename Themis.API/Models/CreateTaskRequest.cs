using System;
using System.ComponentModel.DataAnnotations;
using Themis.Core.Enums;

namespace Themis.API.Models
{
    public class CreateTaskRequest
    {
        [Required]
        public Guid ProjectId { get; set; }

        public Guid? AssignedUserId { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 3)]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public Themis.Core.Enums.TaskStatus Status { get; set; } = Themis.Core.Enums.TaskStatus.NotStarted;

        public bool IsMilestone { get; set; }

        public Guid? ParentTaskId { get; set; }
    }
} 