using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Themis.Core.Enums;

namespace Themis.API.Models
{
    public class UpdateClosureRequest
    {
        public string LessonsLearned { get; set; }
        public string ClosureSummary { get; set; }
        public bool TasksCompleted { get; set; }
        public bool DeliverableAccepted { get; set; }
        public bool ResourcesReleased { get; set; }
        public bool DocumentationComplete { get; set; }
        public bool FinancialsClosed { get; set; }
    }

    public class AddSignOffRequest
    {
        [Required]
        public Guid StakeholderId { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Role { get; set; }
    }

    public class SignOffActionRequest
    {
        [StringLength(500)]
        public string Comments { get; set; }
    }

    public class AddAttachmentRequest
    {
        [Required]
        public IFormFile File { get; set; }
        
        [StringLength(200)]
        public string Description { get; set; }
        
        [Required]
        public AttachmentCategory Category { get; set; }
    }
} 