using System;

namespace Themis.Core.Entities
{
    public class Notification
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Type { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public string RelatedItemId { get; set; }
        public string RelatedItemType { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Navigation properties
        public User User { get; set; }
    }
} 