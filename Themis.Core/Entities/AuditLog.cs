using System;
using Themis.Core.Common;

namespace Themis.Core.Entities
{
    public class AuditLog : BaseEntity
    {
        public string EntityType { get; set; }
        public Guid EntityId { get; set; }
        public Guid UserId { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; }
    }
} 