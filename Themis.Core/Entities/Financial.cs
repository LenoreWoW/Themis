using System;
using Themis.Core.Common;

namespace Themis.Core.Entities
{
    public class Financial : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public decimal PlannedCost { get; set; }
        public decimal ActualCost { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
    }
} 