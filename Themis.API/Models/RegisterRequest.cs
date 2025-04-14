using System.ComponentModel.DataAnnotations;

namespace Themis.API.Models
{
    public class RegisterRequest
    {
        [Required]
        public string Username { get; set; }

        [Required]
        public string ADIdentifier { get; set; }
    }
} 