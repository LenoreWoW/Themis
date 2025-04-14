using System;
using System.Collections.Generic;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class User : BaseEntity
    {
        public string Username { get; set; }
        public UserRole Role { get; set; }
        public Guid? DepartmentId { get; set; }
        public string ADIdentifier { get; set; }

        // Navigation properties
        public virtual Department Department { get; set; }
        public virtual ICollection<Project> ManagedProjects { get; set; } = new List<Project>();
        public virtual ICollection<ProjectTask> AssignedTasks { get; set; } = new List<ProjectTask>();
        public virtual ICollection<Approval> RequestedApprovals { get; set; } = new List<Approval>();
        public virtual ICollection<Approval> GivenApprovals { get; set; } = new List<Approval>();
    }
} 