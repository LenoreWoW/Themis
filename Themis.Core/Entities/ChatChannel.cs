using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Themis.Core.Entities
{
    public class ChatChannel
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        public ChannelType Type { get; set; }
        
        public string DepartmentId { get; set; }
        
        public string ProjectId { get; set; }
        
        public bool IsArchived { get; set; }
        
        public virtual Department Department { get; set; }
        
        public virtual Project Project { get; set; }
        
        public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
        
        public virtual ICollection<ChatChannelMember> Members { get; set; } = new List<ChatChannelMember>();
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public enum ChannelType
    {
        General,
        Department,
        Project,
        DirectMessage
    }
} 