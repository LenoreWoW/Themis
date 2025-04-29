using Microsoft.Extensions.DependencyInjection;
using Themis.Core.Interfaces;
using Themis.Infrastructure.Services;

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