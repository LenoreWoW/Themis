using System.ComponentModel.DataAnnotations;
using Themis.Core.Entities;

namespace Themis.API.Models
{
    public class CreateChannelRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        public ChannelType Type { get; set; }
        
        public string DepartmentId { get; set; }
        
        public string ProjectId { get; set; }
    }
    
    public class AddChannelMemberRequest
    {
        [Required]
        public string UserId { get; set; }
    }
    
    public class CreateMessageRequest
    {
        [Required]
        public string Body { get; set; }
        
        public string FileUrl { get; set; }
        
        public string FileType { get; set; }
        
        public long? FileSize { get; set; }
    }
    
    public class UpdateMessageRequest
    {
        [Required]
        public string Body { get; set; }
    }
    
    public class CreateDMRequest
    {
        [Required]
        public string RecipientId { get; set; }
    }
} 