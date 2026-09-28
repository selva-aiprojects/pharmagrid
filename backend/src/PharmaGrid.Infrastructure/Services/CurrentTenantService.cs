using Microsoft.AspNetCore.Http;
using PharmaGrid.Application.Common;

namespace PharmaGrid.Infrastructure.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    public static readonly Guid DefaultTenantId = Guid.Parse("b3cf8912-3490-410a-8bf7-df84918e4732");

    public CurrentTenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid TenantId
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context != null)
            {
                // 1. Check custom routing header X-Tenant-Id
                if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantHeader) &&
                    Guid.TryParse(tenantHeader, out var tenantGuid))
                {
                    return tenantGuid;
                }

                // 2. Check JWT Claims
                var userClaim = context.User?.FindFirst("tenant_id")?.Value;
                if (!string.IsNullOrEmpty(userClaim) && Guid.TryParse(userClaim, out var claimGuid))
                {
                    return claimGuid;
                }
            }

            return DefaultTenantId;
        }
    }

    public string TenantSubdomain => "main-chennai";
    public bool IsTenantResolved => true;
}
