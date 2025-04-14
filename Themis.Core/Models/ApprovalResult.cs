using System;
using Themis.Core.Entities;
using Themis.Core.Enums;

namespace Themis.Core.Models
{
    public class ApprovalResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public Approval Approval { get; set; }
        public ProjectStatus? NewProjectStatus { get; set; }
    }
} 