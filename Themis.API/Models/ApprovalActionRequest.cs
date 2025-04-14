using System.ComponentModel.DataAnnotations;

namespace Themis.API.Models
{
    public class ApprovalActionRequest
    {
        [Required]
        public string Comments { get; set; }
    }
} 