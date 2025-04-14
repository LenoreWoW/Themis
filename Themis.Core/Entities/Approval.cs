using System;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class Approval : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public RequestType RequestType { get; set; }
        public Guid RequestedByUserId { get; set; }
        public Guid? ApprovedByUserId { get; set; }
        public ApprovalStatus ApprovalStatus { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string Comments { get; set; }
        public string PreviousStatus { get; set; }
        public string NewStatus { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
        public virtual User RequestedByUser { get; set; }
        public virtual User ApprovedByUser { get; set; }
    }
} 