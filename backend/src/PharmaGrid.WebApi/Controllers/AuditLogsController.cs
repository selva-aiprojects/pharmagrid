using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuditLogsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public AuditLogsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// CDSCO 21 CFR Part 11 Immutable Audit Trail
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int limit = 50)
    {
        var logs = await _context.AuditLogs
            .OrderByDescending(a => a.OperationTimestamp)
            .Take(limit)
            .Select(a => new
            {
                auditLogId = a.AuditLogId,
                tenantId = a.TenantId,
                userId = a.UserId,
                userIpAddress = a.UserIpAddress,
                clientDeviceUserAgent = a.ClientDeviceUserAgent,
                operationTimestamp = a.OperationTimestamp,
                actionType = a.ActionType,
                targetEntity = a.TargetEntity,
                recordId = a.RecordId,
                payloadBeforeChanges = a.PayloadBeforeChanges,
                payloadAfterChanges = a.PayloadAfterChanges
            })
            .ToListAsync();

        return Ok(logs);
    }
}
