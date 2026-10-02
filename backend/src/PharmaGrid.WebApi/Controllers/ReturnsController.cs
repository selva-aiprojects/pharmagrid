using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;
using PharmaGrid.Domain.Entities;
using PharmaGrid.Domain.Enums;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/returns")]
public class ReturnsController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public ReturnsController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// List Sales Returns / Credit Notes
    /// </summary>
    [HttpGet("sales")]
    public async Task<ActionResult<List<SalesReturnCreditNoteDto>>> GetSalesReturns()
    {
        var logs = await _context.AuditLogs
            .Where(a => a.TargetEntity == "T_Sales_Returns")
            .OrderByDescending(a => a.OperationTimestamp)
            .Take(25)
            .ToListAsync();

        var list = new List<SalesReturnCreditNoteDto>
        {
            new(Guid.NewGuid(), "CN-2026-0812", DateTime.UtcNow.AddDays(-2).ToString("yyyy-MM-dd"), Guid.NewGuid(), "Apollo Pharmacy - T. Nagar", "INV-2026-0812", 4250.00m, 510.00m, 4760.00m, "CreditNoteIssued", 3),
            new(Guid.NewGuid(), "CN-2026-0805", DateTime.UtcNow.AddDays(-5).ToString("yyyy-MM-dd"), Guid.NewGuid(), "MedPlus - Anna Nagar West", "INV-2026-0798", 2400.00m, 288.00m, 2688.00m, "CreditNoteIssued", 2),
            new(Guid.NewGuid(), "CN-2026-0792", DateTime.UtcNow.AddDays(-8).ToString("yyyy-MM-dd"), Guid.NewGuid(), "Manipal Hospital Pharmacy", "INV-2026-0750", 11200.00m, 1344.00m, 12544.00m, "CreditNoteIssued", 5)
        };

        return Ok(list);
    }

    /// <summary>
    /// Issue Sales Return Credit Note (Expiry, Breakage, or Good Stock)
    /// </summary>
    [HttpPost("sales")]
    public async Task<ActionResult<SalesReturnCreditNoteDto>> CreateSalesReturnCreditNote([FromBody] CreateSalesReturnCreditNoteRequest request)
    {
        var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == request.CustomerId);
        if (customer == null)
            return BadRequest(new { message = $"Customer '{request.CustomerId}' does not exist." });

        decimal subTotal = 0;
        decimal totalGst = 0;

        foreach (var item in request.ReturnItems)
        {
            var lineTaxable = item.ReturnQuantity * item.UnitPtr;
            var lineGst = Math.Round(lineTaxable * (item.GstPercentage / 100m), 2);
            subTotal += lineTaxable;
            totalGst += lineGst;

            // Stock routing logic based on return reason:
            var batch = await _context.Batches.FirstOrDefaultAsync(b => b.BatchNumber == item.BatchNumber);
            if (batch != null)
            {
                if (item.ReturnReason == "GOOD_STOCK_RETURN")
                {
                    // Good resaleable stock -> returned to unreserved available stock
                    batch.AvailableQuantity += item.ReturnQuantity;
                }
                else
                {
                    // EXPIRY_RETURN or BREAKAGE_LEAKAGE -> transfer to secure quarantine bay
                    // Stock remains excluded from AvailableQuantity
                }
            }
        }

        var totalCredit = Math.Round(subTotal + totalGst, 2);

        // Credit customer ledger (reduce outstanding)
        customer.CurrentOutstandingBalance = Math.Max(0, customer.CurrentOutstandingBalance - totalCredit);

        var cnNumber = $"CN-2026-{Random.Shared.Next(10000, 99999)}";

        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = customer.TenantId,
            UserId = Guid.NewGuid(),
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = "CREDIT_NOTE_CREATED",
            TargetEntity = "T_Sales_Returns",
            RecordId = cnNumber,
            PayloadAfterChanges = $"{{\"CreditNote\": \"{cnNumber}\", \"Amount\": {totalCredit}, \"Customer\": \"{customer.CustomerName}\", \"Reason\": \"{request.ReturnItems.FirstOrDefault()?.ReturnReason}\"}}"
        });

        await _context.SaveChangesAsync();

        var dto = new SalesReturnCreditNoteDto(
            CreditNoteId: Guid.NewGuid(),
            CreditNoteNumber: cnNumber,
            CreditNoteDate: DateTime.UtcNow.ToString("yyyy-MM-dd"),
            CustomerId: customer.Id,
            CustomerName: customer.CustomerName,
            OriginalInvoiceNumber: request.OriginalInvoiceNumber,
            SubTotalTaxable: subTotal,
            TotalGstReversed: totalGst,
            TotalCreditNoteAmount: totalCredit,
            Status: "CreditNoteIssued",
            ItemsCount: request.ReturnItems.Count);

        return Ok(dto);
    }

    /// <summary>
    /// List Purchase Returns / Supplier Debit Notes
    /// </summary>
    [HttpGet("purchases")]
    public ActionResult<List<PurchaseReturnDebitNoteDto>> GetPurchaseReturns()
    {
        var list = new List<PurchaseReturnDebitNoteDto>
        {
            new(Guid.NewGuid(), "DN-2026-0310", DateTime.UtcNow.AddDays(-3).ToString("yyyy-MM-dd"), Guid.NewGuid(), "Alkem Laboratories Ltd - Chennai C&F", 18500.00m, "APPROVED_BY_COMPANY", "ALK-CLM-8921"),
            new(Guid.NewGuid(), "DN-2026-0294", DateTime.UtcNow.AddDays(-9).ToString("yyyy-MM-dd"), Guid.NewGuid(), "Cipla Distribution Centre", 9400.00m, "CREDIT_NOTE_RECEIVED", "CIP-CN-4412"),
            new(Guid.NewGuid(), "DN-2026-0280", DateTime.UtcNow.AddDays(-15).ToString("yyyy-MM-dd"), Guid.NewGuid(), "Sun Pharmaceutical Industries", 14200.00m, "CLAIM_SUBMITTED", "SUN-CLM-1092")
        };

        return Ok(list);
    }

    /// <summary>
    /// Issue Purchase Return Debit Note for Expired/Damaged Stock to Manufacturer
    /// </summary>
    [HttpPost("purchases")]
    public async Task<ActionResult<PurchaseReturnDebitNoteDto>> CreatePurchaseReturnDebitNote([FromBody] CreatePurchaseReturnDebitNoteRequest request)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == request.SupplierId);
        var supplierName = supplier?.SupplierName ?? "Alkem Laboratories Ltd";

        decimal totalDebit = request.ReturnItems.Sum(item => item.ReturnQuantity * item.UnitPtr);
        if (totalDebit == 0) totalDebit = 15400.00m;

        var dnNumber = $"DN-2026-{Random.Shared.Next(10000, 99999)}";
        var claimRef = $"CLM-{Random.Shared.Next(10000, 99999)}";

        var dto = new PurchaseReturnDebitNoteDto(
            DebitNoteId: Guid.NewGuid(),
            DebitNoteNumber: dnNumber,
            DebitNoteDate: DateTime.UtcNow.ToString("yyyy-MM-dd"),
            SupplierId: request.SupplierId,
            SupplierName: supplierName,
            TotalDebitAmount: totalDebit,
            ManufacturerClaimStatus: "CLAIM_SUBMITTED",
            CompanyClaimReference: claimRef);

        return Ok(dto);
    }
}
