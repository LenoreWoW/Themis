using System;
using System.ComponentModel.DataAnnotations;

namespace Themis.Core.Entities
{
    public class ChatMessage
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string ChannelId { get; set; }
        
        [Required]
        public string SenderId { get; set; }
        
        [Required]
        public string Body { get; set; }
        
        public bool IsEdited { get; set; }
        
        public bool IsDeleted { get; set; }
        
        public string FileUrl { get; set; }
        
        public string FileType { get; set; }
        
        public long? FileSize { get; set; }
        
        public virtual ChatChannel Channel { get; set; }
        
        public virtual User Sender { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
} 