using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Infrastructure.Persistence;
using PharmaGrid.Infrastructure.Services;

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

// 4. Register Entity Framework Core (In-Memory for development & PostgreSQL ready)
builder.Services.AddDbContext<ApplicationDbContext>((sp, options) =>
{
    options.UseInMemoryDatabase("PharmaGrid_DevDb");
});
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

// 6. Automatic Data Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DataSeeder.SeedAsync(db);
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
