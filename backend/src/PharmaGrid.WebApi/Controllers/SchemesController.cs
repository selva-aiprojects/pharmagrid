using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class SchemesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public SchemesController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSchemes()
    {
        var schemes = await _context.Schemes
            .Where(s => s.IsActive)
            .Select(s => new
            {
                schemeId = s.Id,
                schemeName = s.SchemeName,
                schemeType = s.SchemeType.ToString(),
                manufacturerName = s.ManufacturerName,
                productId = s.ProductId,
                minOrderQuantity = s.MinOrderQuantityThreshold,
                freeQuantity = s.FreeQuantityUnits,
                discountPercentage = s.DiscountPercentage,
                reimbursementRate = s.ReimbursementRatePerUnit,
                validFrom = s.ValidFrom.ToString("yyyy-MM-dd"),
                validTo = s.ValidTo.ToString("yyyy-MM-dd"),
                isActive = s.IsActive
            })
            .ToListAsync();

        return Ok(schemes);
    }
}
