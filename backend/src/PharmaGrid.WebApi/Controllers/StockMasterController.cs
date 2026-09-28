using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class StockMasterController : ControllerBase
{
    private static readonly List<StockMasterItemDto> StockItemsStore = new()
    {
        new StockMasterItemDto(
            ProductId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ProductCode: "MED-PAN-40",
            BrandName: "Pan 40 Tablet",
            GenericName: "Pantoprazole Gastro-resistant Tablets IP 40mg",
            Manufacturer: "Sun Pharma Laboratories Ltd",
            Category: "Gastrointestinal",
            HsnCode: "30049099",
            GstRate: 12.0m,
            TotalPhysicalStock: 1840,
            TotalBookStock: 1840,
            TotalAllocatedStock: 200,
            TotalQuarantineStock: 40,
            TotalAvailableStock: 1600,
            BatchCount: 3,
            StorageCondition: "Cool & Dry (< 25°C)",
            ScheduleClass: "Schedule H",
            ReorderLevel: 500,
            StockValue: 156400.00m,
            Batches: new List<StockMasterBatchDto>
            {
                new StockMasterBatchDto(Guid.Parse("11111111-0001-0000-0000-000000000001"), "PN40-2024-B1", DateTime.UtcNow.AddMonths(18), 1000, 1000, 200, 0, 800, 85.00m, 110.00m, "A-01-02-01"),
                new StockMasterBatchDto(Guid.Parse("11111111-0002-0000-0000-000000000002"), "PN40-2024-B2", DateTime.UtcNow.AddMonths(12), 800, 800, 0, 0, 800, 85.00m, 110.00m, "A-01-02-02"),
                new StockMasterBatchDto(Guid.Parse("11111111-0003-0000-0000-000000000003"), "PN40-2023-DMG", DateTime.UtcNow.AddMonths(6), 40, 40, 0, 40, 0, 85.00m, 110.00m, "Q-00-01-01 (Quarantine)")
            }
        ),
        new StockMasterItemDto(
            ProductId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ProductCode: "MED-AUG-625",
            BrandName: "Augmentin 625 Duo",
            GenericName: "Amoxicillin and Potassium Clavulanate Tablets IP 625mg",
            Manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
            Category: "Anti-infectives",
            HsnCode: "30041010",
            GstRate: 12.0m,
            TotalPhysicalStock: 620,
            TotalBookStock: 620,
            TotalAllocatedStock: 80,
            TotalQuarantineStock: 20,
            TotalAvailableStock: 520,
            BatchCount: 2,
            StorageCondition: "Cool & Dry (< 25°C)",
            ScheduleClass: "Schedule H1",
            ReorderLevel: 250,
            StockValue: 111600.00m,
            Batches: new List<StockMasterBatchDto>
            {
                new StockMasterBatchDto(Guid.Parse("22222222-0001-0000-0000-000000000001"), "AUG-24-099", DateTime.UtcNow.AddMonths(14), 600, 600, 80, 0, 520, 180.00m, 223.50m, "B-03-01-04"),
                new StockMasterBatchDto(Guid.Parse("22222222-0002-0000-0000-000000000002"), "AUG-23-BRK", DateTime.UtcNow.AddMonths(2), 20, 20, 0, 20, 0, 180.00m, 223.50m, "Q-00-01-02 (Quarantine)")
            }
        ),
        new StockMasterItemDto(
            ProductId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            ProductCode: "MED-DOLO-650",
            BrandName: "Dolo 650mg Paracetamol",
            GenericName: "Paracetamol Tablets IP 650mg",
            Manufacturer: "Micro Labs Ltd",
            Category: "Analgesic & Antipyretic",
            HsnCode: "30049060",
            GstRate: 12.0m,
            TotalPhysicalStock: 3400,
            TotalBookStock: 3400,
            TotalAllocatedStock: 250,
            TotalQuarantineStock: 0,
            TotalAvailableStock: 3150,
            BatchCount: 2,
            StorageCondition: "Normal Room Temp",
            ScheduleClass: "OTC / General",
            ReorderLevel: 1000,
            StockValue: 96900.00m,
            Batches: new List<StockMasterBatchDto>
            {
                new StockMasterBatchDto(Guid.Parse("33333333-0001-0000-0000-000000000001"), "DL-650-A24", DateTime.UtcNow.AddMonths(22), 2000, 2000, 150, 0, 1850, 28.50m, 34.00m, "C-02-03-01"),
                new StockMasterBatchDto(Guid.Parse("33333333-0002-0000-0000-000000000002"), "DL-650-B24", DateTime.UtcNow.AddMonths(20), 1400, 1400, 100, 0, 1300, 28.50m, 34.00m, "C-02-03-02")
            }
        ),
        new StockMasterItemDto(
            ProductId: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            ProductCode: "MED-INS-MIX",
            BrandName: "Insulin Mixtard 30/70 100IU",
            GenericName: "Biphasic Isophane Insulin Injection IP (rDNA origin)",
            Manufacturer: "Novo Nordisk India Pvt Ltd",
            Category: "Antidiabetic (Cold Chain)",
            HsnCode: "30043110",
            GstRate: 5.0m,
            TotalPhysicalStock: 140,
            TotalBookStock: 140,
            TotalAllocatedStock: 100,
            TotalQuarantineStock: 0,
            TotalAvailableStock: 40,
            BatchCount: 1,
            StorageCondition: "Cold Storage (2°C - 8°C)",
            ScheduleClass: "Schedule G",
            ReorderLevel: 150,
            StockValue: 58800.00m,
            Batches: new List<StockMasterBatchDto>
            {
                new StockMasterBatchDto(Guid.Parse("44444444-0001-0000-0000-000000000001"), "NV-MIX-889", DateTime.UtcNow.AddMonths(9), 140, 140, 100, 0, 40, 420.00m, 510.00m, "FRG-CHAMBER-01")
            }
        )
    };

    private static readonly List<StockAdjustmentDto> AdjustmentsStore = new()
    {
        new StockAdjustmentDto(
            Id: Guid.Parse("50000000-0000-0000-0000-000000000001"),
            AdjustmentNumber: "ADJ-2026-0091",
            ProductId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ProductName: "Pan 40 Tablet",
            BatchNumber: "PN40-2023-DMG",
            AdjustmentType: "Breakage",
            Quantity: -40,
            UnitCost: 85.00m,
            TotalValueLoss: 3400.00m,
            ReasonCode: "CDSCO-BRK-01 (Carton crushed during inward pallet un-stuffing)",
            ApprovedBy: "Selva Kumaran (Owner/Lic. Pharmacist)",
            CreatedDate: DateTime.UtcNow.AddDays(-3),
            Notes: "Disposed in accordance with CDSCO Form 20B waste protocol."
        ),
        new StockAdjustmentDto(
            Id: Guid.Parse("50000000-0000-0000-0000-000000000002"),
            AdjustmentNumber: "ADJ-2026-0092",
            ProductId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ProductName: "Augmentin 625 Duo",
            BatchNumber: "AUG-23-BRK",
            AdjustmentType: "ExpiryQuarantine",
            Quantity: -20,
            UnitCost: 180.00m,
            TotalValueLoss: 3600.00m,
            ReasonCode: "CDSCO-EXP-04 (Short expiry batch moved to Quarantine bay for vendor credit note)",
            ApprovedBy: "K. Ramanathan (Depot In-charge)",
            CreatedDate: DateTime.UtcNow.AddDays(-1),
            Notes: "Vendor credit note claim CN-GSK-2026-902 initiated."
        )
    };

    [HttpGet("summary")]
    public ActionResult<StockMasterSummaryDto> GetSummary()
    {
        var totalSkus = StockItemsStore.Count;
        var totalBatches = StockItemsStore.Sum(s => s.BatchCount);
        var totalVal = StockItemsStore.Sum(s => s.StockValue);
        var lowStock = StockItemsStore.Count(s => s.TotalAvailableStock <= s.ReorderLevel);
        var quarantine = StockItemsStore.Sum(s => s.TotalQuarantineStock);
        var breakageLoss = AdjustmentsStore.Sum(a => a.TotalValueLoss);

        return Ok(new StockMasterSummaryDto(
            TotalSkus: totalSkus,
            TotalBatches: totalBatches,
            TotalValuation: totalVal,
            LowStockCount: lowStock,
            ExpiredQuarantineCount: quarantine,
            MonthlyBreakageLoss: breakageLoss
        ));
    }

    [HttpGet("items")]
    public ActionResult<List<StockMasterItemDto>> GetItems()
    {
        return Ok(StockItemsStore);
    }

    [HttpGet("adjustments")]
    public ActionResult<List<StockAdjustmentDto>> GetAdjustments()
    {
        return Ok(AdjustmentsStore.OrderByDescending(a => a.CreatedDate).ToList());
    }

    [HttpPost("adjustments")]
    public ActionResult<StockAdjustmentDto> CreateAdjustment([FromBody] CreateStockAdjustmentRequest req)
    {
        var sku = StockItemsStore.FirstOrDefault(s => s.ProductId == req.ProductId);
        if (sku == null) return NotFound("SKU product not found in Master");

        var batch = sku.Batches.FirstOrDefault(b => b.BatchNumber.Equals(req.BatchNumber, StringComparison.OrdinalIgnoreCase));
        var unitCost = batch?.PurchasePrice ?? 100.00m;
        var loss = Math.Abs(req.Quantity) * unitCost;

        var adjNum = $"ADJ-2026-{100 + AdjustmentsStore.Count + 1}";
        var newAdj = new StockAdjustmentDto(
            Id: Guid.NewGuid(),
            AdjustmentNumber: adjNum,
            ProductId: req.ProductId,
            ProductName: sku.BrandName,
            BatchNumber: req.BatchNumber,
            AdjustmentType: req.AdjustmentType,
            Quantity: req.Quantity < 0 ? req.Quantity : -req.Quantity,
            UnitCost: unitCost,
            TotalValueLoss: loss,
            ReasonCode: req.ReasonCode,
            ApprovedBy: req.ApprovedBy ?? "Selva Kumaran (Owner/Lic. Pharmacist)",
            CreatedDate: DateTime.UtcNow,
            Notes: req.Notes ?? "Physical stock audit adjustment committed"
        );

        AdjustmentsStore.Insert(0, newAdj);

        // Adjust in-memory stock
        var idx = StockItemsStore.IndexOf(sku);
        var adjustedStock = Math.Max(0, sku.TotalAvailableStock - Math.Abs(req.Quantity));
        var adjustedQuarantine = req.AdjustmentType == "ExpiryQuarantine" || req.AdjustmentType == "Breakage"
            ? sku.TotalQuarantineStock + Math.Abs(req.Quantity)
            : sku.TotalQuarantineStock;

        StockItemsStore[idx] = sku with
        {
            TotalAvailableStock = adjustedStock,
            TotalQuarantineStock = adjustedQuarantine,
            TotalPhysicalStock = sku.TotalPhysicalStock - (req.AdjustmentType == "Breakage" ? Math.Abs(req.Quantity) : 0),
            StockValue = adjustedStock * unitCost
        };

        return Created($"/api/v1/stockmaster/adjustments/{newAdj.Id}", newAdj);
    }
}
