using System;
using Themis.Core.Common;
using Themis.Core.Enums;

namespace Themis.Core.Entities
{
    public class ProjectClosureAttachment : BaseEntity
    {
        public Guid ProjectClosureId { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
        public string FilePath { get; set; }
        public long FileSize { get; set; }
        public string Description { get; set; }
        public AttachmentCategory Category { get; set; }
        public Guid UploadedById { get; set; }
        
        // Navigation properties
        public virtual ProjectClosure ProjectClosure { get; set; }
        public virtual User UploadedBy { get; set; }
    }
} 