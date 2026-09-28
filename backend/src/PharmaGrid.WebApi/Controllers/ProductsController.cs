using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;
using PharmaGrid.Domain.Entities;
using PharmaGrid.Domain.Enums;
using PharmaGrid.Infrastructure.Services;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ProductsController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
    {
        var products = await _context.Products
            .Include(p => p.Batches)
            .Where(p => p.IsActive)
            .Select(p => new ProductDto(
                p.Id,
                p.ProductCode,
                p.ProductName,
                p.GenericName,
                p.ManufacturerName,
                p.DosageForm,
                p.PackSize,
                p.UOM,
                p.HSNCode,
                p.GSTPercentage,
                p.PTR,
                p.MRP,
                p.ScheduleClass.ToString(),
                p.StorageCondition.ToString(),
                p.Batches.Sum(b => b.AvailableQuantity)))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return await GetProducts();

        var query = q.Trim().ToLower();

        var products = await _context.Products
            .Include(p => p.Batches)
            .Where(p => p.IsActive && (
                p.ProductName.ToLower().Contains(query) ||
                p.GenericName.ToLower().Contains(query) ||
                p.ProductCode.ToLower().Contains(query) ||
                p.ManufacturerName.ToLower().Contains(query) ||
                p.HSNCode.Contains(query)))
            .Select(p => new ProductDto(
                p.Id,
                p.ProductCode,
                p.ProductName,
                p.GenericName,
                p.ManufacturerName,
                p.DosageForm,
                p.PackSize,
                p.UOM,
                p.HSNCode,
                p.GSTPercentage,
                p.PTR,
                p.MRP,
                p.ScheduleClass.ToString(),
                p.StorageCondition.ToString(),
                p.Batches.Sum(b => b.AvailableQuantity)))
            .ToListAsync();

        return Ok(products);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> GetProductById(Guid id)
    {
        var product = await _context.Products
            .Include(p => p.Batches)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            return NotFound(new { message = $"Product with ID '{id}' was not found." });

        var dto = new ProductDto(
            product.Id,
            product.ProductCode,
            product.ProductName,
            product.GenericName,
            product.ManufacturerName,
            product.DosageForm,
            product.PackSize,
            product.UOM,
            product.HSNCode,
            product.GSTPercentage,
            product.PTR,
            product.MRP,
            product.ScheduleClass.ToString(),
            product.StorageCondition.ToString(),
            product.Batches.Sum(b => b.AvailableQuantity));

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromBody] ProductCreateRequest request)
    {
        var existing = await _context.Products.AnyAsync(p => p.ProductCode == request.ProductCode);
        if (existing)
            return Conflict(new { message = $"Product with code '{request.ProductCode}' already exists." });

        var product = new Product
        {
            TenantId = CurrentTenantService.DefaultTenantId,
            ProductCode = request.ProductCode,
            ProductName = request.ProductName,
            GenericName = request.GenericName,
            ManufacturerName = request.ManufacturerName,
            DosageForm = request.DosageForm,
            PackSize = request.PackSize,
            UOM = request.UOM,
            HSNCode = request.HSNCode,
            GSTPercentage = request.GSTPercentage,
            PTR = request.PTR,
            PTS = request.PTS,
            MRP = request.MRP,
            PurchaseRate = request.PurchaseRate,
            ScheduleClass = Enum.TryParse<ScheduleClass>(request.ScheduleClass, true, out var sc) ? sc : ScheduleClass.Regular,
            StorageCondition = Enum.TryParse<StorageCondition>(request.StorageCondition, true, out var stc) ? stc : StorageCondition.RoomTemperature,
            ReorderLevel = request.ReorderLevel,
            IsActive = true
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        var dto = new ProductDto(
            product.Id,
            product.ProductCode,
            product.ProductName,
            product.GenericName,
            product.ManufacturerName,
            product.DosageForm,
            product.PackSize,
            product.UOM,
            product.HSNCode,
            product.GSTPercentage,
            product.PTR,
            product.MRP,
            product.ScheduleClass.ToString(),
            product.StorageCondition.ToString(),
            0);

        return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, dto);
    }
}
