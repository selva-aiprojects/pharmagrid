using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DemandForecastController : ControllerBase
{
    private static readonly List<DemandForecastItemDto> ForecastStore = new()
    {
        new DemandForecastItemDto(
            ProductId: Guid.Parse("44444444-4444-4444-4444-444444444444"),
            ProductCode: "MED-INS-MIX",
            BrandName: "Insulin Mixtard 30/70 100IU",
            Manufacturer: "Novo Nordisk India Pvt Ltd",
            CurrentAvailableStock: 40,
            DailySalesRunRate: 15.0m,
            MonthlySalesRunRate: 450,
            DaysOfInventoryRemaining: 2.6m,
            StockoutRisk: "Critical_Stockout",
            ReorderLevel: 150,
            RecommendedReorderQuantity: 500,
            LeadTimeDays: 2,
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000003"),
            SupplierName: "Novo Nordisk India Pvt Ltd",
            EstimatedPoValue: 210000.00m
        ),
        new DemandForecastItemDto(
            ProductId: Guid.Parse("22222222-2222-2222-2222-222222222222"),
            ProductCode: "MED-AUG-625",
            BrandName: "Augmentin 625 Duo",
            Manufacturer: "GlaxoSmithKline Pharmaceuticals Ltd",
            CurrentAvailableStock: 520,
            DailySalesRunRate: 65.0m,
            MonthlySalesRunRate: 1950,
            DaysOfInventoryRemaining: 8.0m,
            StockoutRisk: "Low_Stock_Warning",
            ReorderLevel: 600,
            RecommendedReorderQuantity: 1500,
            LeadTimeDays: 3,
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000002"),
            SupplierName: "Cipla Healthcare Distributions",
            EstimatedPoValue: 270000.00m
        ),
        new DemandForecastItemDto(
            ProductId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            ProductCode: "MED-PAN-40",
            BrandName: "Pan 40 Tablet",
            Manufacturer: "Sun Pharma Laboratories Ltd",
            CurrentAvailableStock: 1600,
            DailySalesRunRate: 85.0m,
            MonthlySalesRunRate: 2550,
            DaysOfInventoryRemaining: 18.8m,
            StockoutRisk: "Adequate",
            ReorderLevel: 1000,
            RecommendedReorderQuantity: 2000,
            LeadTimeDays: 4,
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000001"),
            SupplierName: "Sun Pharma Laboratories Ltd",
            EstimatedPoValue: 170000.00m
        ),
        new DemandForecastItemDto(
            ProductId: Guid.Parse("33333333-3333-3333-3333-333333333333"),
            ProductCode: "MED-DOLO-650",
            BrandName: "Dolo 650mg Paracetamol",
            Manufacturer: "Micro Labs Ltd",
            CurrentAvailableStock: 3150,
            DailySalesRunRate: 90.0m,
            MonthlySalesRunRate: 2700,
            DaysOfInventoryRemaining: 35.0m,
            StockoutRisk: "Adequate",
            ReorderLevel: 1500,
            RecommendedReorderQuantity: 2500,
            LeadTimeDays: 3,
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000002"),
            SupplierName: "Cipla Healthcare Distributions",
            EstimatedPoValue: 71250.00m
        )
    };

    [HttpGet("summary")]
    public ActionResult<DemandForecastSummaryDto> GetSummary()
    {
        var critical = ForecastStore.Count(f => f.StockoutRisk == "Critical_Stockout");
        var lowStock = ForecastStore.Count(f => f.StockoutRisk == "Low_Stock_Warning");
        var healthy = ForecastStore.Count(f => f.StockoutRisk == "Adequate" || f.StockoutRisk == "Overstocked");
        var totalPoVal = ForecastStore.Where(f => f.StockoutRisk != "Adequate").Sum(f => f.EstimatedPoValue);
        var avgDoi = ForecastStore.Average(f => f.DaysOfInventoryRemaining);

        return Ok(new DemandForecastSummaryDto(
            CriticalStockoutsCount: critical,
            LowStockWarningsCount: lowStock,
            HealthyStockCount: healthy,
            TotalRecommendedPoValue: totalPoVal,
            AverageInventoryDays: Math.Round(avgDoi, 1),
            Items: ForecastStore.OrderBy(f => f.DaysOfInventoryRemaining).ToList()
        ));
    }

    [HttpPost("generate-po/{productId}")]
    public IActionResult GeneratePoForProduct(Guid productId)
    {
        var item = ForecastStore.FirstOrDefault(f => f.ProductId == productId);
        if (item == null) return NotFound("Forecast item not found");

        var poNum = $"PO-2026-{new Random().Next(3000, 9999)}";
        return Ok(new
        {
            success = true,
            message = $"Vendor Purchase Order {poNum} automatically generated for {item.BrandName}.",
            poNumber = poNum,
            supplierName = item.SupplierName,
            orderedQuantity = item.RecommendedReorderQuantity,
            estimatedAmount = item.EstimatedPoValue,
            leadTimeDays = item.LeadTimeDays,
            deliveryBy = DateTime.UtcNow.AddDays(item.LeadTimeDays).ToString("dd-MMM-yyyy")
        });
    }
}
