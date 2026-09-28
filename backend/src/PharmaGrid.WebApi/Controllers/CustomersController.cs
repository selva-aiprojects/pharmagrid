using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public CustomersController(IApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
    {
        var customers = await _context.Customers
            .Select(c => new CustomerDto(
                c.Id,
                c.CustomerCode,
                c.CustomerName,
                c.CustomerType,
                c.GstinNumber,
                c.StateCode,
                c.DrugLicense20B,
                c.DrugLicense21B,
                c.LicenseExpiryDate.ToString("yyyy-MM-dd"),
                c.IsLicenseValid,
                c.CreditLimit,
                c.CurrentOutstandingBalance))
            .ToListAsync();

        return Ok(customers);
    }
}
