using System;
using Themis.Core.Common;

namespace Themis.Core.Entities
{
    public class ProjectAttachment : BaseEntity
    {
        public Guid ProjectId { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public Guid UploadedByUserId { get; set; }
        
        // Navigation properties
        public virtual Project Project { get; set; }
        public virtual User UploadedByUser { get; set; }
    }
} 