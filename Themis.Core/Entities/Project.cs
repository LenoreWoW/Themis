using System;
using System.Collections.Generic;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class Project : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid PMUserId { get; set; }
        public ProjectStatus Status { get; set; }
        public decimal Budget { get; set; }
        public string GoalsLink { get; set; }
        
        // Navigation properties
        public virtual Department Department { get; set; }
        public virtual User ProjectManager { get; set; }
        public virtual ICollection<ProjectTask> Tasks { get; set; } = new List<ProjectTask>();
        public virtual ICollection<Approval> Approvals { get; set; } = new List<Approval>();
        public virtual ICollection<RiskIssue> RisksIssues { get; set; } = new List<RiskIssue>();
        public virtual ICollection<ProjectAttachment> Attachments { get; set; } = new List<ProjectAttachment>();
        public virtual Financial Financial { get; set; }
        public virtual ICollection<ProjectTeamMember> TeamMembers { get; set; } = new List<ProjectTeamMember>();
        public virtual ICollection<Project> DependentProjects { get; set; } = new List<Project>();
        public virtual ICollection<Project> DependsOnProjects { get; set; } = new List<Project>();
    }
} 