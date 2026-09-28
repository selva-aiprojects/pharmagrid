using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.Engines;

namespace PharmaGrid.WebApi.Controllers;

public record AllocatePreviewItemRequest(Guid ProductId, int RequestedQuantity);
public record AllocatePreviewRequest(Guid WarehouseId, List<AllocatePreviewItemRequest> Items);

[ApiController]
[Route("api/v1/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IApplicationDbContext _context;
    private readonly FefoAllocationEngine _fefoEngine = new();

    public InventoryController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Stock Status Verification (Matches PRD Section 5.2 API contract)
    /// </summary>
    [HttpGet("products/{productId:guid}/stock")]
    public async Task<IActionResult> GetProductStock(Guid productId)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null)
            return NotFound(new { message = "Product not found" });

        var batches = await _context.Batches
            .Where(b => b.ProductId == productId && b.AvailableQuantity > 0)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();

        var response = new
        {
            productId = product.Id,
            totalAvailableQuantity = batches.Sum(b => b.AvailableQuantity),
            warehouseBreakdown = new[]
            {
                new
                {
                    warehouseId = Guid.Parse("b3cf8912-3490-410a-8bf7-df84918e4732"),
                    warehouseName = "Main Chennai Depot",
                    batches = batches.Select(b => new
                    {
                        batchId = b.Id,
                        batchNumber = b.BatchNumber,
                        manufacturingDate = b.ManufacturingDate.ToString("yyyy-MM-dd"),
                        expiryDate = b.ExpiryDate.ToString("yyyy-MM-dd"),
                        availableQty = b.AvailableQuantity,
                        ptr = b.PTR,
                        mrp = b.MRP,
                        rackLocation = b.LocationRackBin
                    })
                }
            }
        };

        return Ok(response);
    }

    /// <summary>
    /// Preview FEFO Allocations & Split Batch Resolution before invoicing
    /// </summary>
    [HttpPost("allocate-preview")]
    public async Task<IActionResult> PreviewFefoAllocation([FromBody] AllocatePreviewRequest request)
    {
        var results = new List<object>();
        var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);

        foreach (var item in request.Items)
        {
            var batches = await _context.Batches
                .Where(b => b.ProductId == item.ProductId && b.AvailableQuantity > 0)
                .ToListAsync();

            var allocation = _fefoEngine.AllocateStock(batches, item.RequestedQuantity, currentDate);

            results.Add(new
            {
                productId = item.ProductId,
                requestedQuantity = item.RequestedQuantity,
                isFullyAllocated = allocation.IsFullyAllocated,
                isSplitAllocation = allocation.IsSplitAllocation,
                totalAllocated = allocation.TotalAllocated,
                unfulfilledQuantity = allocation.UnfulfilledQuantity,
                batchesAllocated = allocation.Allocations.Select(a => new
                {
                    batchId = a.BatchId,
                    batchNumber = a.BatchNumber,
                    expiryDate = a.ExpiryDate.ToString("yyyy-MM-dd"),
                    allocatedQuantity = a.AllocatedQuantity,
                    locationRackBin = a.LocationRackBin,
                    ptr = a.PTR,
                    mrp = a.MRP
                })
            });
        }

        return Ok(new { allocations = results });
    }

    /// <summary>
    /// 4-Tier Expiry Horizon Health Classification (0-30d, 31-60d, 61-90d, 91+d)
    /// </summary>
    [HttpGet("expiry-horizons")]
    public async Task<IActionResult> GetExpiryHorizons()
    {
        var currentDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var batches = await _context.Batches.Where(b => b.AvailableQuantity > 0).ToListAsync();

        var horizon0to30 = batches.Where(b => b.ExpiryDate <= currentDate.AddDays(30)).ToList();
        var horizon31to60 = batches.Where(b => b.ExpiryDate > currentDate.AddDays(30) && b.ExpiryDate <= currentDate.AddDays(60)).ToList();
        var horizon61to90 = batches.Where(b => b.ExpiryDate > currentDate.AddDays(60) && b.ExpiryDate <= currentDate.AddDays(90)).ToList();
        var horizon91Plus = batches.Where(b => b.ExpiryDate > currentDate.AddDays(90)).ToList();

        return Ok(new
        {
            asOfDate = currentDate.ToString("yyyy-MM-dd"),
            horizons = new
            {
                critical0To30Days = new
                {
                    batchCount = horizon0to30.Count,
                    totalUnits = horizon0to30.Sum(b => b.AvailableQuantity),
                    assetValue = horizon0to30.Sum(b => b.AvailableQuantity * b.PTR),
                    action = "Automated Quarantine Trigger"
                },
                warning31To60Days = new
                {
                    batchCount = horizon31to60.Count,
                    totalUnits = horizon31to60.Sum(b => b.AvailableQuantity),
                    assetValue = horizon31to60.Sum(b => b.AvailableQuantity * b.PTR),
                    action = "FEFO Stop / Return-to-Supplier Debit Proposal"
                },
                clearance61To90Days = new
                {
                    batchCount = horizon61to90.Count,
                    totalUnits = horizon61to90.Sum(b => b.AvailableQuantity),
                    assetValue = horizon61to90.Sum(b => b.AvailableQuantity * b.PTR),
                    action = "B2B Fast-Clearance Promo Deal Push"
                },
                healthy91PlusDays = new
                {
                    batchCount = horizon91Plus.Count,
                    totalUnits = horizon91Plus.Sum(b => b.AvailableQuantity),
                    assetValue = horizon91Plus.Sum(b => b.AvailableQuantity * b.PTR),
                    action = "Normal Operational Rotation"
                }
            }
        });
    }

    /// <summary>
    /// Master Warehouse Batch Inventory View (Rack/Bin Locations, Cold Chain, Stock)
    /// </summary>
    [HttpGet("batches")]
    public async Task<IActionResult> GetAllBatches()
    {
        var rawBatches = await _context.Batches
            .Include(b => b.Product)
            .OrderBy(b => b.ExpiryDate)
            .ToListAsync();

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var batches = rawBatches.Select(b => new
        {
            batchId = b.Id,
            productId = b.ProductId,
            productCode = b.Product != null ? b.Product.ProductCode : string.Empty,
            productName = b.Product != null ? b.Product.ProductName : "Unknown",
            batchNumber = b.BatchNumber,
            manufacturingDate = b.ManufacturingDate.ToString("yyyy-MM-dd"),
            expiryDate = b.ExpiryDate.ToString("yyyy-MM-dd"),
            availableQuantity = b.AvailableQuantity,
            ptr = b.PTR,
            mrp = b.MRP,
            locationRackBin = b.LocationRackBin,
            isQuarantined = b.IsQuarantined,
            storageCondition = b.Product != null ? b.Product.StorageCondition.ToString() : "RoomTemperature",
            scheduleClass = b.Product != null ? b.Product.ScheduleClass.ToString() : "Regular",
            daysToExpiry = b.ExpiryDate.DayNumber - today.DayNumber
        }).ToList();

        return Ok(batches);
    }
}
