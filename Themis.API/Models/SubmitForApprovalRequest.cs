using System.ComponentModel.DataAnnotations;
using Themis.Core.Enums;

namespace Themis.API.Models
{
    public class SubmitForApprovalRequest
    {
        [Required]
        public RequestType RequestType { get; set; }

        [Required]
        public string Comments { get; set; }
    }
} 