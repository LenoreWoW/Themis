using System;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class ProjectClosureSignOff : BaseEntity
    {
        public Guid ProjectClosureId { get; set; }
        public Guid StakeholderId { get; set; }
        public string Role { get; set; }
        public SignOffStatus Status { get; set; }
        public DateTime? SignOffDate { get; set; }
        public string Comments { get; set; }
        
        // Navigation properties
        public virtual ProjectClosure ProjectClosure { get; set; }
        public virtual User Stakeholder { get; set; }
    }
} 