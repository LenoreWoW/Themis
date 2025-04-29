using System;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class RiskIssue : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public RiskIssueType Type { get; set; }
        public RiskSeverity Severity { get; set; }
        public RiskProbability Probability { get; set; }
        public bool IsIssue { get; set; }
        public string Status { get; set; }
        public string MitigationPlan { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
    }
} 