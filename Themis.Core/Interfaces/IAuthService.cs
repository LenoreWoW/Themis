using System.Threading.Tasks;
using Themis.Core.Models;

namespace Themis.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> LoginAsync(string adIdentifier);
        Task<AuthResponse> RegisterAsync(string username, string adIdentifier);
        Task<string> GenerateJwtTokenAsync(string adIdentifier);
    }
} 