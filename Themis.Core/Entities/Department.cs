using System.Collections.Generic;
using Themis.Core.Common;

namespace Themis.Core.Entities
{
    public class Department : BaseEntity
    {
        public string Name { get; set; }

        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
    }
} 