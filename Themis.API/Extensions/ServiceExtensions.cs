using Microsoft.Extensions.DependencyInjection;
using Themis.Services;

namespace Themis.API.Extensions
{
    public static class ServiceExtensions
    {
        public static void AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IProjectClosureService, ProjectClosureService>();
        }
    }
} 