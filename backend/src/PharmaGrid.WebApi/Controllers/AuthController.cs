using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.DTOs;
using PharmaGrid.Infrastructure.Services;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private static readonly string JwtSecret = "PharmaGrid_SuperSecret_Enterprise_Key_2026_CDSCO_GST_Security_Key_9918237";
    
    // Enterprise Pre-Configured Personas
    private static readonly List<DemoPersonaDto> Personas = new()
    {
        new DemoPersonaDto("admin", "Owner", "Selva Kumaran", "Managing Director & Stockist Owner (Full P&L and All Modules)", "SK"),
        new DemoPersonaDto("billing", "BillingExecutive", "Suresh Babu", "Senior Counter Billing Operator (Rapid Invoicing & Retailer CRM)", "SB"),
        new DemoPersonaDto("warehouse", "WarehouseOperator", "Karthik Raja", "Warehouse & Inward Put-Away Lead (FEFO Batches & Cold Chain)", "KR"),
        new DemoPersonaDto("accounts", "AccountsExecutive", "Meena Sundaram", "Finance & GST Controller (Dual GST, Ledgers & Scheme Claims)", "MS")
    };

    [HttpGet("personas")]
    public ActionResult<List<DemoPersonaDto>> GetPersonas()
    {
        return Ok(Personas);
    }

    [HttpPost("login")]
    public ActionResult<LoginResponse> Login([FromBody] LoginRequest request)
    {
        var persona = Personas.FirstOrDefault(p => 
            string.Equals(p.Username, request.Username, StringComparison.OrdinalIgnoreCase) ||
            string.Equals(p.Username, request.Username?.Split('@')[0], StringComparison.OrdinalIgnoreCase));

        // Fallback default persona if arbitrary string provided
        persona ??= Personas[0];

        var permissions = persona.RoleName switch
        {
            "Owner" => new List<string> { "dashboard", "billing", "products", "inventory", "procurement", "customers", "schemes", "audit", "users" },
            "BillingExecutive" => new List<string> { "billing", "customers", "schemes", "products" },
            "WarehouseOperator" => new List<string> { "inventory", "procurement", "products" },
            "AccountsExecutive" => new List<string> { "dashboard", "customers", "schemes", "audit" },
            _ => new List<string> { "billing", "products" }
        };

        var userId = Guid.NewGuid();
        var tenantId = CurrentTenantService.DefaultTenantId;
        var token = GenerateJwt(userId, persona.Username, persona.FullName, persona.RoleName, tenantId);

        var userProfile = new UserProfileDto(
            UserId: userId,
            Username: persona.Username,
            FullName: persona.FullName,
            RoleName: persona.RoleName,
            Email: $"{persona.Username}@pharmagrid.com",
            Permissions: permissions
        );

        return Ok(new LoginResponse(token, userProfile));
    }

    [HttpGet("me")]
    public ActionResult<UserProfileDto> GetCurrentUser()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            // Default active persona
            var p = Personas[0];
            return Ok(new UserProfileDto(
                Guid.NewGuid(),
                p.Username,
                p.FullName,
                p.RoleName,
                $"{p.Username}@pharmagrid.com",
                new List<string> { "dashboard", "billing", "products", "inventory", "procurement", "customers", "schemes", "audit" }
            ));
        }

        var token = authHeader["Bearer ".Length..].Trim();
        var claims = ParseJwtPayload(token);
        if (claims == null)
        {
            return Unauthorized(new { message = "Invalid or expired JWT token" });
        }

        var role = claims.TryGetValue("role", out var r) ? r.GetString() ?? "Owner" : "Owner";
        var name = claims.TryGetValue("name", out var n) ? n.GetString() ?? "Staff Member" : "Staff Member";
        var username = claims.TryGetValue("unique_name", out var u) ? u.GetString() ?? "user" : "user";
        var userIdStr = claims.TryGetValue("sub", out var s) ? s.GetString() : null;
        var userId = Guid.TryParse(userIdStr, out var g) ? g : Guid.NewGuid();

        var permissions = role switch
        {
            "Owner" => new List<string> { "dashboard", "billing", "products", "inventory", "procurement", "customers", "schemes", "audit", "users" },
            "BillingExecutive" => new List<string> { "billing", "customers", "schemes", "products" },
            "WarehouseOperator" => new List<string> { "inventory", "procurement", "products" },
            "AccountsExecutive" => new List<string> { "dashboard", "customers", "schemes", "audit" },
            _ => new List<string> { "billing", "products" }
        };

        return Ok(new UserProfileDto(userId, username, name, role, $"{username}@pharmagrid.com", permissions));
    }

    private static string GenerateJwt(Guid userId, string username, string fullName, string role, Guid tenantId)
    {
        var header = new { alg = "HS256", typ = "JWT" };
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var exp = now + (30 * 86400); // 30 days validity

        var payload = new Dictionary<string, object>
        {
            ["sub"] = userId.ToString(),
            ["unique_name"] = username,
            ["name"] = fullName,
            ["role"] = role,
            ["tenant_id"] = tenantId.ToString(),
            ["iat"] = now,
            ["exp"] = exp
        };

        var headerJson = JsonSerializer.Serialize(header);
        var payloadJson = JsonSerializer.Serialize(payload);

        var headerB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payloadB64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

        var dataToSign = $"{headerB64}.{payloadB64}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(JwtSecret));
        var signature = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(dataToSign)));

        return $"{dataToSign}.{signature}";
    }

    private static Dictionary<string, JsonElement>? ParseJwtPayload(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length != 3) return null;

            var payloadBytes = Base64UrlDecode(parts[1]);
            return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(payloadBytes);
        }
        catch
        {
            return null;
        }
    }

    private static string Base64UrlEncode(byte[] input)
    {
        var output = Convert.ToBase64String(input);
        output = output.Split('=')[0]; // Remove any trailing '='s
        output = output.Replace('+', '-'); // 62nd char of encoding
        output = output.Replace('/', '_'); // 63rd char of encoding
        return output;
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var output = input;
        output = output.Replace('-', '+');
        output = output.Replace('_', '/');
        switch (output.Length % 4)
        {
            case 0: break;
            case 2: output += "=="; break;
            case 3: output += "="; break;
            default: throw new FormatException("Illegal base64url string!");
        }
        return Convert.FromBase64String(output);
    }
}
