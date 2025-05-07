using System;
using System.ComponentModel.DataAnnotations;

namespace Themis.Core.Entities
{
    public class ChatChannelMember
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string ChannelId { get; set; }
        
        [Required]
        public string UserId { get; set; }
        
        public DateTime? LastReadAt { get; set; }
        
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        
        public virtual ChatChannel Channel { get; set; }
        
        public virtual User User { get; set; }
    }
} 