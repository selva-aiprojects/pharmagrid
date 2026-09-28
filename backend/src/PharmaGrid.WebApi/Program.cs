using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using PharmaGrid.Application.Common;
using PharmaGrid.Infrastructure.Persistence;
using PharmaGrid.Infrastructure.Services;

// 0. Load Environment Variables from .env files if present
var currentDir = Directory.GetCurrentDirectory();
var candidateEnvFiles = new[]
{
    Path.Combine(currentDir, ".env"),
    Path.Combine(currentDir, "..", ".env"),
    Path.Combine(currentDir, "..", "..", ".env"),
    Path.Combine(currentDir, "..", "..", "frontend", ".env")
};

foreach (var envPath in candidateEnvFiles)
{
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith("#")) continue;
            var splitIdx = trimmed.IndexOf('=');
            if (splitIdx > 0)
            {
                var key = trimmed.Substring(0, splitIdx).Trim();
                var val = trimmed.Substring(splitIdx + 1).Trim().Trim('"').Trim('\'');
                if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
    }
}

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://127.0.0.1:5050");

// 1. Add Controllers & JSON Serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 2. Add Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "PharmaGrid • Enterprise Cloud REST API",
        Version = "v1.0",
        Description = "Next-generation cloud ERP Web API for Indian Pharmaceutical Stockists & Wholesalers. Features sub-2-second checkout, FEFO allocation engine, and Dual GST calculations."
    });
});

// 3. Register HTTP Context & Multi-Tenant Service
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentTenantService, CurrentTenantService>();

// 4. Register Entity Framework Core (Aiven PostgreSQL or In-Memory fallback)
var rawConnection = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

string? npgsqlConnString = null;

if (!string.IsNullOrWhiteSpace(rawConnection))
{
    if (rawConnection.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        rawConnection.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        try
        {
            var uri = new Uri(rawConnection);
            var userInfo = uri.UserInfo.Split(':');
            var user = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "";
            var pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
            var host = uri.Host;
            var port = uri.Port > 0 ? uri.Port : 5432;
            var dbName = uri.AbsolutePath.TrimStart('/');

            npgsqlConnString = $"Host={host};Port={port};Database={dbName};Username={user};Password={pass};SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true;";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Failed to parse DATABASE_URL URI: {ex.Message}. Falling back to raw string.");
            npgsqlConnString = rawConnection;
        }
    }
    else
    {
        npgsqlConnString = rawConnection;
        if (!npgsqlConnString.Contains("Trust Server Certificate", StringComparison.OrdinalIgnoreCase))
        {
            npgsqlConnString += ";Trust Server Certificate=true;";
        }
    }
}

if (!string.IsNullOrWhiteSpace(npgsqlConnString))
{
    Console.WriteLine("🐘 Configuring Entity Framework Core with Aiven PostgreSQL...");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseNpgsql(npgsqlConnString, npgsqlOpts =>
        {
            npgsqlOpts.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null);
        });
    });
}
else
{
    Console.WriteLine("💾 Configuring Entity Framework Core with In-Memory Database...");
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseInMemoryDatabase("PharmaGrid_DevDb");
    });
}

builder.Services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

// 5. Configure CORS for Next.js Web App
builder.Services.AddCors(options =>
{
    options.AddPolicy("PharmaGridCorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// 6. Automatic Database Schema Sync & Data Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    if (db.Database.IsRelational())
    {
        Console.WriteLine("🔄 Synchronizing database tables on Aiven PostgreSQL...");
        var creator = db.Database.GetService<IDatabaseCreator>() as IRelationalDatabaseCreator;
        if (creator != null)
        {
            try
            {
                await creator.CreateTablesAsync();
                Console.WriteLine("✅ Database schema synchronized successfully.");
            }
            catch (PostgresException pex) when (pex.SqlState == "42P07")
            {
                Console.WriteLine("ℹ️ Tables already present in database.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ℹ️ Database table initialization note: {ex.Message}");
            }
        }
    }
    Console.WriteLine("🌱 Checking and seeding initial master data...");
    await DataSeeder.SeedAsync(db);
    Console.WriteLine("✅ Master data verified.");
}

// 7. Configure HTTP Request Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PharmaGrid API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("PharmaGridCorsPolicy");

app.MapControllers();

// Root route - redirect to interactive Swagger documentation
app.MapGet("/", () => Results.Redirect("/swagger"));

// Health check endpoint
app.MapGet("/healthz", () => Results.Ok(new
{
    status = "Healthy",
    product = "PharmaGrid",
    version = "1.0.0",
    engineSla = "< 2.0s",
    timestamp = DateTime.UtcNow
}));

Console.WriteLine("🚀 PharmaGrid Web API successfully listening on http://127.0.0.1:5050");
app.Run("http://127.0.0.1:5050");
