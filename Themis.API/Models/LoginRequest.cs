using System.ComponentModel.DataAnnotations;

namespace Themis.API.Models
{
    public class LoginRequest
    {
        [Required]
        public string ADIdentifier { get; set; }
    }
} 