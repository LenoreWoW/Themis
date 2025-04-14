using System;
using System.Collections.Generic;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class ProjectClosure : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public ProjectClosureStatus Status { get; set; }
        public DateTime? CompletionDate { get; set; }
        public DateTime? ArchiveDate { get; set; }
        public string LessonsLearned { get; set; }
        public string FinalReport { get; set; }
        public string ClosureSummary { get; set; }
        public bool TasksCompleted { get; set; }
        public bool DeliverableAccepted { get; set; }
        public bool ResourcesReleased { get; set; }
        public bool DocumentationComplete { get; set; }
        public bool FinancialsClosed { get; set; }
        public bool StakeholderSignOff { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
        public virtual ICollection<ProjectClosureSignOff> StakeholderSignOffs { get; set; } = new List<ProjectClosureSignOff>();
        public virtual ICollection<ProjectClosureAttachment> Attachments { get; set; } = new List<ProjectClosureAttachment>();
    }
} 