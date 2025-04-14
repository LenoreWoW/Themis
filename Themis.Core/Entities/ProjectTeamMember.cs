using System;
using Themis.Core.Common;

namespace Themis.Core.Entities
{
    public class ProjectTeamMember : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public Guid UserId { get; set; }
        public string Role { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
        public virtual User User { get; set; }
    }
} 