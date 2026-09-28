using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;
using PharmaGrid.Domain.Entities;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PurchasesController : ControllerBase
{
    private readonly IApplicationDbContext _context;

    public PurchasesController(IApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Inbound Purchase Entry & Batch Ingestion (Matches PRD Section 5.1 API contract)
    /// </summary>
    [HttpPost("invoices")]
    public async Task<ActionResult<InboundGrnResponse>> ProcessInboundInvoice([FromBody] InboundGrnRequest request)
    {
        var supplier = await _context.Suppliers.FirstOrDefaultAsync(s => s.Id == request.SupplierId);
        if (supplier == null)
            return BadRequest(new { message = $"Supplier with ID '{request.SupplierId}' not found." });

        decimal totalGross = 0;
        decimal totalGst = 0;
        int batchesCreated = 0;

        foreach (var item in request.LineItems)
        {
            var lineGross = item.QuantityReceived * item.PurchaseRate;
            var lineGst = lineGross * (item.GSTPercentage / 100m);

            totalGross += lineGross;
            totalGst += lineGst;

            // Ingest physical batch
            var batch = new Batch
            {
                TenantId = supplier.TenantId,
                ProductId = item.ProductId,
                BatchNumber = item.BatchNumber,
                ManufacturingDate = DateOnly.Parse(item.ManufacturingDate),
                ExpiryDate = DateOnly.Parse(item.ExpiryDate),
                PurchaseRate = item.PurchaseRate,
                MRP = item.MRP,
                PTR = item.PurchaseRate * 1.18m, // Retailer PTR margin
                WarehouseId = request.WarehouseId,
                LocationRackBin = item.PutAwayRackLocation,
                AvailableQuantity = item.QuantityReceived + item.FreeQuantityReceived,
                IsQuarantined = false
            };

            _context.Batches.Add(batch);
            batchesCreated++;
        }

        var netPayable = totalGross + totalGst;
        supplier.CurrentPayableBalance += netPayable;

        // Log audit trail
        var grnNumber = $"GRN-2026-{Random.Shared.Next(10000, 99999)}";
        _context.AuditLogs.Add(new AuditLog
        {
            TenantId = supplier.TenantId,
            UserId = Guid.NewGuid(),
            UserIpAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1",
            ClientDeviceUserAgent = Request.Headers.UserAgent.ToString(),
            OperationTimestamp = DateTime.UtcNow,
            ActionType = "GRN_COMMITTED",
            TargetEntity = "T_Purchase_Invoices",
            RecordId = grnNumber,
            PayloadAfterChanges = $"{{\"Supplier\": \"{supplier.SupplierName}\", \"GRN\": \"{grnNumber}\", \"Batches\": {batchesCreated}, \"NetPayable\": {netPayable}}}"
        });

        await _context.SaveChangesAsync();

        var response = new InboundGrnResponse(
            PurchaseInvoiceId: Guid.NewGuid(),
            GrnNumber: grnNumber,
            Status: "Processed",
            TotalGrossAmount: totalGross,
            TotalGstAmount: totalGst,
            NetPayableAmount: netPayable,
            BatchesCreated: batchesCreated,
            SystemTimestamp: DateTime.UtcNow.ToString("o"));

        return CreatedAtAction(nameof(ProcessInboundInvoice), response);
    }

    [HttpGet("suppliers")]
    public async Task<IActionResult> GetSuppliers()
    {
        var suppliers = await _context.Suppliers
            .Select(s => new
            {
                supplierId = s.Id,
                supplierCode = s.SupplierCode,
                supplierName = s.SupplierName,
                gstinNumber = s.GstinNumber,
                stateCode = s.StateCode,
                drugLicenseNo = s.DrugLicenseNo,
                currentPayableBalance = s.CurrentPayableBalance,
                creditPeriodDays = s.CreditPeriodDays
            })
            .ToListAsync();

        return Ok(suppliers);
    }

    [HttpGet("grn-history")]
    public async Task<IActionResult> GetGrnHistory()
    {
        var grnAuditLogs = await _context.AuditLogs
            .Where(a => a.ActionType == "GRN_COMMITTED")
            .OrderByDescending(a => a.OperationTimestamp)
            .Take(20)
            .Select(a => new
            {
                grnNumber = a.RecordId,
                timestamp = a.OperationTimestamp,
                details = a.PayloadAfterChanges
            })
            .ToListAsync();

        return Ok(grnAuditLogs);
    }
}
