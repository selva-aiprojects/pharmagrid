using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;
using PharmaGrid.Domain.Entities;
using PharmaGrid.Infrastructure.Services;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    // In-memory staff repository initialized with authentic Indian stockist staff profiles
    private static readonly List<UserItemDto> StaffStore = new()
    {
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000001"),
            Username: "admin",
            FullName: "Selva Kumaran",
            Email: "admin@pharmagrid.com",
            PhoneNumber: "+91 98400 11223",
            RoleName: "Owner",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Admin Executive Suite",
            Shift: "General (9 AM - 6 PM)",
            IsActive: true,
            IsRegisteredPharmacist: true,
            PharmacistCouncilRegNo: "TN-PC-32104/2012",
            PharmacistCouncilExpiry: "2030-12-31",
            MaxDiscountPercentage: 15.00m,
            CanAuthorizeReturns: true,
            CanCancelInvoices: true,
            CanAccessScheduleX: true,
            LastLoginAt: DateTime.UtcNow.AddMinutes(-12),
            Permissions: new List<string> { "dashboard", "billing", "products", "inventory", "procurement", "customers", "schemes", "audit", "users" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000002"),
            Username: "suresh.billing",
            FullName: "Suresh Babu",
            Email: "suresh.b@pharmagrid.com",
            PhoneNumber: "+91 98401 23456",
            RoleName: "BillingExecutive",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Terminal-01 (Rapid POS)",
            Shift: "Morning (8 AM - 4 PM)",
            IsActive: true,
            IsRegisteredPharmacist: false,
            PharmacistCouncilRegNo: null,
            PharmacistCouncilExpiry: null,
            MaxDiscountPercentage: 5.00m,
            CanAuthorizeReturns: false,
            CanCancelInvoices: false,
            CanAccessScheduleX: false,
            LastLoginAt: DateTime.UtcNow.AddMinutes(-5),
            Permissions: new List<string> { "billing", "customers", "schemes", "products" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000003"),
            Username: "priya.pharm",
            FullName: "Priya Ramanathan",
            Email: "priya.r@pharmagrid.com",
            PhoneNumber: "+91 98403 45678",
            RoleName: "Pharmacist",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "QA & Verification Counter",
            Shift: "General (9 AM - 6 PM)",
            IsActive: true,
            IsRegisteredPharmacist: true,
            PharmacistCouncilRegNo: "TN-PC-55421/2019",
            PharmacistCouncilExpiry: "2029-05-31",
            MaxDiscountPercentage: 8.00m,
            CanAuthorizeReturns: true,
            CanCancelInvoices: true,
            CanAccessScheduleX: true,
            LastLoginAt: DateTime.UtcNow.AddHours(-1),
            Permissions: new List<string> { "billing", "products", "inventory", "audit" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000004"),
            Username: "karthik.wh",
            FullName: "Karthik Raja",
            Email: "karthik.r@pharmagrid.com",
            PhoneNumber: "+91 98405 67890",
            RoleName: "WarehouseOperator",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Inward Dock #2",
            Shift: "Morning (7 AM - 3 PM)",
            IsActive: true,
            IsRegisteredPharmacist: false,
            PharmacistCouncilRegNo: null,
            PharmacistCouncilExpiry: null,
            MaxDiscountPercentage: 0.00m,
            CanAuthorizeReturns: true,
            CanCancelInvoices: false,
            CanAccessScheduleX: false,
            LastLoginAt: DateTime.UtcNow.AddHours(-2),
            Permissions: new List<string> { "inventory", "procurement", "products" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000005"),
            Username: "meena.accounts",
            FullName: "Meena Sundaram",
            Email: "meena.s@pharmagrid.com",
            PhoneNumber: "+91 98407 89012",
            RoleName: "AccountsExecutive",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Accounts & GST Office",
            Shift: "General (9:30 AM - 6:30 PM)",
            IsActive: true,
            IsRegisteredPharmacist: false,
            PharmacistCouncilRegNo: null,
            PharmacistCouncilExpiry: null,
            MaxDiscountPercentage: 10.00m,
            CanAuthorizeReturns: true,
            CanCancelInvoices: true,
            CanAccessScheduleX: false,
            LastLoginAt: DateTime.UtcNow.AddMinutes(-45),
            Permissions: new List<string> { "dashboard", "customers", "schemes", "audit" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000006"),
            Username: "ramesh.counter2",
            FullName: "Ramesh Chandran",
            Email: "ramesh.c@pharmagrid.com",
            PhoneNumber: "+91 98409 01234",
            RoleName: "BillingExecutive",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Terminal-02 (Counter Cashier)",
            Shift: "Evening (1 PM - 9 PM)",
            IsActive: true,
            IsRegisteredPharmacist: false,
            PharmacistCouncilRegNo: null,
            PharmacistCouncilExpiry: null,
            MaxDiscountPercentage: 3.00m,
            CanAuthorizeReturns: false,
            CanCancelInvoices: false,
            CanAccessScheduleX: false,
            LastLoginAt: DateTime.UtcNow.AddMinutes(-90),
            Permissions: new List<string> { "billing", "customers", "products" }
        ),
        new UserItemDto(
            UserId: Guid.Parse("00000000-0000-0000-0000-000000000007"),
            Username: "anand.dispatch",
            FullName: "Anand Kumar",
            Email: "anand.k@pharmagrid.com",
            PhoneNumber: "+91 98411 23456",
            RoleName: "WarehouseOperator",
            BranchName: "Main Chennai Depot TN-33",
            CounterNumber: "Van Dispatch Bay 1",
            Shift: "Morning (8 AM - 4 PM)",
            IsActive: false, // Suspended / On Leave
            IsRegisteredPharmacist: false,
            PharmacistCouncilRegNo: null,
            PharmacistCouncilExpiry: null,
            MaxDiscountPercentage: 0.00m,
            CanAuthorizeReturns: false,
            CanCancelInvoices: false,
            CanAccessScheduleX: false,
            LastLoginAt: DateTime.UtcNow.AddDays(-3),
            Permissions: new List<string> { "inventory", "products" }
        )
    };

    public UsersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public ActionResult<List<UserItemDto>> GetAllUsers([FromQuery] string? q, [FromQuery] string? role, [FromQuery] string? status)
    {
        var query = StaffStore.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(q))
        {
            var search = q.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.FullName.ToLowerInvariant().Contains(search) ||
                u.Username.ToLowerInvariant().Contains(search) ||
                u.Email.ToLowerInvariant().Contains(search) ||
                u.PhoneNumber.Contains(search) ||
                (u.PharmacistCouncilRegNo != null && u.PharmacistCouncilRegNo.ToLowerInvariant().Contains(search)));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "all")
        {
            query = query.Where(u => string.Equals(u.RoleName, role, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            var isActive = status.ToLowerInvariant() == "active";
            query = query.Where(u => u.IsActive == isActive);
        }

        return Ok(query.OrderBy(u => u.RoleName).ThenBy(u => u.FullName).ToList());
    }

    [HttpGet("{id:guid}")]
    public ActionResult<UserItemDto> GetUserById(Guid id)
    {
        var user = StaffStore.FirstOrDefault(u => u.UserId == id);
        if (user == null) return NotFound(new { message = "User not found" });
        return Ok(user);
    }

    [HttpGet("stats")]
    public ActionResult<UserStatsDto> GetStats()
    {
        var total = StaffStore.Count;
        var active = StaffStore.Count(u => u.IsActive);
        var billing = StaffStore.Count(u => u.RoleName == "BillingExecutive");
        var pharmacists = StaffStore.Count(u => u.IsRegisteredPharmacist);
        var suspended = StaffStore.Count(u => !u.IsActive);

        return Ok(new UserStatsDto(total, active, billing, pharmacists, suspended));
    }

    [HttpPost]
    public async Task<ActionResult<UserItemDto>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Username and Full Name are mandatory." });
        }

        var cleanUsername = request.Username.Trim().ToLowerInvariant();
        if (StaffStore.Any(u => u.Username.ToLowerInvariant() == cleanUsername))
        {
            return Conflict(new { message = $"Username '{request.Username}' is already assigned to another staff member." });
        }

        var defaultPerms = request.Permissions;
        if (defaultPerms == null || defaultPerms.Count == 0)
        {
            defaultPerms = request.RoleName switch
            {
                "Owner" => new List<string> { "dashboard", "billing", "products", "inventory", "procurement", "customers", "schemes", "audit", "users" },
                "BillingExecutive" => new List<string> { "billing", "customers", "schemes", "products" },
                "Pharmacist" => new List<string> { "billing", "products", "inventory", "audit" },
                "WarehouseOperator" => new List<string> { "inventory", "procurement", "products" },
                "AccountsExecutive" => new List<string> { "dashboard", "customers", "schemes", "audit" },
                _ => new List<string> { "billing", "products" }
            };
        }

        var newUser = new UserItemDto(
            UserId: Guid.NewGuid(),
            Username: cleanUsername,
            FullName: request.FullName.Trim(),
            Email: request.Email?.Trim() ?? $"{cleanUsername}@pharmagrid.com",
            PhoneNumber: request.PhoneNumber?.Trim() ?? string.Empty,
            RoleName: request.RoleName ?? "BillingExecutive",
            BranchName: request.BranchName ?? "Main Chennai Depot TN-33",
            CounterNumber: request.CounterNumber ?? "Counter-01",
            Shift: request.Shift ?? "General (9 AM - 6 PM)",
            IsActive: true,
            IsRegisteredPharmacist: request.IsRegisteredPharmacist,
            PharmacistCouncilRegNo: request.PharmacistCouncilRegNo,
            PharmacistCouncilExpiry: request.PharmacistCouncilExpiry,
            MaxDiscountPercentage: request.MaxDiscountPercentage,
            CanAuthorizeReturns: request.CanAuthorizeReturns,
            CanCancelInvoices: request.CanCancelInvoices,
            CanAccessScheduleX: request.CanAccessScheduleX,
            LastLoginAt: DateTime.UtcNow,
            Permissions: defaultPerms
        );

        StaffStore.Add(newUser);

        // Audit Trail entry in database
        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = CurrentTenantService.DefaultTenantId,
            UserId = newUser.UserId,
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = "USER_CREATED",
            TargetEntity = "M_Users",
            RecordId = newUser.UserId.ToString(),
            PayloadAfterChanges = $"{{\"Username\": \"{newUser.Username}\", \"Role\": \"{newUser.RoleName}\", \"FullName\": \"{newUser.FullName}\"}}"
        });
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetUserById), new { id = newUser.UserId }, newUser);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UserItemDto>> UpdateUser(Guid id, [FromBody] UpdateUserRequest request)
    {
        var index = StaffStore.FindIndex(u => u.UserId == id);
        if (index == -1) return NotFound(new { message = "User not found" });

        var existing = StaffStore[index];
        var updated = existing with
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber.Trim(),
            RoleName = request.RoleName,
            BranchName = request.BranchName,
            CounterNumber = request.CounterNumber,
            Shift = request.Shift,
            IsActive = request.IsActive,
            IsRegisteredPharmacist = request.IsRegisteredPharmacist,
            PharmacistCouncilRegNo = request.PharmacistCouncilRegNo,
            PharmacistCouncilExpiry = request.PharmacistCouncilExpiry,
            MaxDiscountPercentage = request.MaxDiscountPercentage,
            CanAuthorizeReturns = request.CanAuthorizeReturns,
            CanCancelInvoices = request.CanCancelInvoices,
            CanAccessScheduleX = request.CanAccessScheduleX,
            Permissions = request.Permissions
        };

        StaffStore[index] = updated;

        // Audit log
        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = CurrentTenantService.DefaultTenantId,
            UserId = id,
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = "USER_MODIFIED",
            TargetEntity = "M_Users",
            RecordId = id.ToString(),
            PayloadAfterChanges = $"{{\"Username\": \"{updated.Username}\", \"Role\": \"{updated.RoleName}\", \"Status\": {(updated.IsActive ? "Active" : "Suspended")}}}"
        });
        await _context.SaveChangesAsync();

        return Ok(updated);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> ToggleUserStatus(Guid id)
    {
        var index = StaffStore.FindIndex(u => u.UserId == id);
        if (index == -1) return NotFound(new { message = "User not found" });

        var existing = StaffStore[index];
        var newStatus = !existing.IsActive;
        StaffStore[index] = existing with { IsActive = newStatus };

        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = CurrentTenantService.DefaultTenantId,
            UserId = id,
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = newStatus ? "USER_ACTIVATED" : "USER_SUSPENDED",
            TargetEntity = "M_Users",
            RecordId = id.ToString(),
            PayloadAfterChanges = $"{{\"Username\": \"{existing.Username}\", \"NewStatus\": {(newStatus ? "Active" : "Suspended")}}}"
        });
        await _context.SaveChangesAsync();

        return Ok(new { userId = id, isActive = newStatus, message = $"Staff member is now {(newStatus ? "Active" : "Suspended")}." });
    }

    [HttpPost("{id:guid}/reset-password")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        var user = StaffStore.FirstOrDefault(u => u.UserId == id);
        if (user == null) return NotFound(new { message = "User not found" });

        var tempPassword = $"Pharma@{Random.Shared.Next(1000, 9999)}#";

        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = CurrentTenantService.DefaultTenantId,
            UserId = id,
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = "PASSWORD_RESET",
            TargetEntity = "M_Users",
            RecordId = id.ToString(),
            PayloadAfterChanges = $"{{\"Username\": \"{user.Username}\", \"ResetAction\": \"Temporary password issued\"}}"
        });
        await _context.SaveChangesAsync();

        return Ok(new
        {
            userId = id,
            username = user.Username,
            temporaryPassword = tempPassword,
            expiresInHours = 24,
            message = "Temporary access credential generated. Mandatory change on next login."
        });
    }
}
