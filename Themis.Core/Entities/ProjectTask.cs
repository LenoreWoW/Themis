using System;
using Themis.Core.Common;
using Themis.Core.Enums;
using SystemTasks = System.Threading.Tasks;

namespace Themis.Core.Entities
{
    public class ProjectTask : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public Guid? AssignedUserId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime DueDate { get; set; }
        public global::Themis.Core.Enums.TaskStatus Status { get; set; }
        public bool IsMilestone { get; set; }
        public Guid? ParentTaskId { get; set; }

        // Navigation properties
        public virtual Project Project { get; set; }
        public virtual User AssignedUser { get; set; }
        public virtual ProjectTask ParentTask { get; set; }
    }
} 