using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class LogisticsController : ControllerBase
{
    private static readonly List<DeliveryManifestDto> ManifestStore = new()
    {
        new DeliveryManifestDto(
            Id: Guid.Parse("30000000-0000-0000-0000-000000000001"),
            ManifestNumber: "MNF-2026-0419",
            RouteName: "Route 1: Central & South Chennai Loop (T. Nagar - Guindy - Saidapet)",
            VehicleNumber: "TN-09-CB-4821 (Tata Ace Pharma Van)",
            DriverName: "K. Ramanathan",
            DriverPhone: "+91 98402 99881",
            DispatchDate: DateTime.UtcNow.Date.AddHours(8).AddMinutes(30),
            Status: "InTransit",
            TotalInvoices: 3,
            TotalCartons: 8,
            TotalCodAmount: 24500.00m,
            CollectedCodAmount: 14500.00m,
            Challans: new List<DeliveryChallanDto>
            {
                new DeliveryChallanDto(
                    Id: Guid.Parse("31000000-0000-0000-0000-000000000001"),
                    ChallanNumber: "DC-2026-0881",
                    InvoiceNumber: "INV-2026-0041",
                    CustomerName: "MedPlus Medicals - T. Nagar Loop",
                    DeliveryAddress: "14 Usman Road, Panagal Park, T. Nagar, Chennai 600017",
                    ContactPhone: "+91 98401 22334",
                    CartonCount: 3,
                    CodAmount: 14500.00m,
                    PaymentMode: "COD_UPI",
                    DeliveryStatus: "Delivered",
                    PodReceiverName: "G. Murugan (Chief Pharmacist)",
                    PodTimestamp: DateTime.UtcNow.AddHours(-1),
                    PodRemarks: "Cold chain ice pack intact. Received in good order."
                ),
                new DeliveryChallanDto(
                    Id: Guid.Parse("31000000-0000-0000-0000-000000000002"),
                    ChallanNumber: "DC-2026-0882",
                    InvoiceNumber: "INV-2026-0042",
                    CustomerName: "Apollo Pharmacy - Guindy Branch",
                    DeliveryAddress: "45 GST Road, Guindy, Chennai 600032",
                    ContactPhone: "+91 98405 55667",
                    CartonCount: 2,
                    CodAmount: 10000.00m,
                    PaymentMode: "COD_Cash",
                    DeliveryStatus: "OutForDelivery",
                    PodReceiverName: null,
                    PodTimestamp: null,
                    PodRemarks: null
                ),
                new DeliveryChallanDto(
                    Id: Guid.Parse("31000000-0000-0000-0000-000000000003"),
                    ChallanNumber: "DC-2026-0883",
                    InvoiceNumber: "INV-2026-0043",
                    CustomerName: "Shanti Chemist & Druggists",
                    DeliveryAddress: "12 Bazaar Road, Saidapet, Chennai 600015",
                    ContactPhone: "+91 98403 77889",
                    CartonCount: 3,
                    CodAmount: 0.00m,
                    PaymentMode: "Credit",
                    DeliveryStatus: "OutForDelivery",
                    PodReceiverName: null,
                    PodTimestamp: null,
                    PodRemarks: null
                )
            }
        ),
        new DeliveryManifestDto(
            Id: Guid.Parse("30000000-0000-0000-0000-000000000002"),
            ManifestNumber: "MNF-2026-0420",
            RouteName: "Route 2: North Chennai & Port Zone (Parrys - Royapuram - Washermanpet)",
            VehicleNumber: "TN-04-AK-7190 (Mahindra Bolero Maxi)",
            DriverName: "M. Saravanan",
            DriverPhone: "+91 98404 33221",
            DispatchDate: DateTime.UtcNow.Date.AddHours(9).AddMinutes(0),
            Status: "Scheduled",
            TotalInvoices: 2,
            TotalCartons: 6,
            TotalCodAmount: 38200.00m,
            CollectedCodAmount: 0.00m,
            Challans: new List<DeliveryChallanDto>
            {
                new DeliveryChallanDto(
                    Id: Guid.Parse("32000000-0000-0000-0000-000000000001"),
                    ChallanNumber: "DC-2026-0884",
                    InvoiceNumber: "INV-2026-0044",
                    CustomerName: "Madras Medical Hall",
                    DeliveryAddress: "101 Armenian Street, Parrys, Chennai 600001",
                    ContactPhone: "+91 98407 11229",
                    CartonCount: 4,
                    CodAmount: 25000.00m,
                    PaymentMode: "COD_Cash",
                    DeliveryStatus: "Pending",
                    PodReceiverName: null,
                    PodTimestamp: null,
                    PodRemarks: null
                ),
                new DeliveryChallanDto(
                    Id: Guid.Parse("32000000-0000-0000-0000-000000000002"),
                    ChallanNumber: "DC-2026-0885",
                    InvoiceNumber: "INV-2026-0045",
                    CustomerName: "Bharath Drug Lines",
                    DeliveryAddress: "77 MS Koil St, Royapuram, Chennai 600013",
                    ContactPhone: "+91 98408 88990",
                    CartonCount: 2,
                    CodAmount: 13200.00m,
                    PaymentMode: "COD_UPI",
                    DeliveryStatus: "Pending",
                    PodReceiverName: null,
                    PodTimestamp: null,
                    PodRemarks: null
                )
            }
        )
    };

    [HttpGet("summary")]
    public ActionResult<LogisticsSummaryDto> GetSummary()
    {
        var active = ManifestStore.Count(m => m.Status == "InTransit" || m.Status == "Scheduled");
        var totalParcels = ManifestStore.SelectMany(m => m.Challans).Count();
        var delivered = ManifestStore.SelectMany(m => m.Challans).Count(c => c.DeliveryStatus == "Delivered");
        var pendingCod = ManifestStore.Sum(m => m.TotalCodAmount - m.CollectedCodAmount);
        var reconciledCod = ManifestStore.Sum(m => m.CollectedCodAmount);

        return Ok(new LogisticsSummaryDto(
            ActiveManifests: active,
            DispatchedParcels: totalParcels,
            DeliveredToday: delivered,
            PendingCodCollections: pendingCod,
            ReconciledCodToday: reconciledCod
        ));
    }

    [HttpGet("manifests")]
    public ActionResult<List<DeliveryManifestDto>> GetManifests()
    {
        return Ok(ManifestStore.OrderByDescending(m => m.DispatchDate).ToList());
    }

    [HttpPost("manifests")]
    public ActionResult<DeliveryManifestDto> CreateManifest([FromBody] CreateManifestRequest req)
    {
        if (req.Challans == null || !req.Challans.Any())
            return BadRequest("At least one delivery challan is required to create a dispatch manifest.");

        var manifestNum = $"MNF-2026-{0420 + ManifestStore.Count + 1}";
        var totalCartons = req.Challans.Sum(c => c.CartonCount);
        var totalCod = req.Challans.Sum(c => c.CodAmount);

        var newManifest = new DeliveryManifestDto(
            Id: Guid.NewGuid(),
            ManifestNumber: manifestNum,
            RouteName: req.RouteName,
            VehicleNumber: req.VehicleNumber,
            DriverName: req.DriverName,
            DriverPhone: req.DriverPhone,
            DispatchDate: DateTime.UtcNow,
            Status: "InTransit",
            TotalInvoices: req.Challans.Count,
            TotalCartons: totalCartons,
            TotalCodAmount: totalCod,
            CollectedCodAmount: 0.00m,
            Challans: req.Challans
        );

        ManifestStore.Insert(0, newManifest);
        return Created($"/api/v1/logistics/manifests/{newManifest.Id}", newManifest);
    }

    [HttpPatch("manifests/{manifestId}/challans/{challanId}")]
    public IActionResult UpdateChallanPod(Guid manifestId, Guid challanId, [FromBody] UpdateChallanPodRequest req)
    {
        var manifest = ManifestStore.FirstOrDefault(m => m.Id == manifestId);
        if (manifest == null) return NotFound("Manifest not found");

        var challan = manifest.Challans.FirstOrDefault(c => c.Id == challanId);
        if (challan == null) return NotFound("Challan not found in specified manifest");

        var updatedChallan = challan with
        {
            DeliveryStatus = req.DeliveryStatus,
            PodReceiverName = req.PodReceiverName ?? challan.PodReceiverName,
            PodTimestamp = req.DeliveryStatus == "Delivered" ? DateTime.UtcNow : challan.PodTimestamp,
            PodRemarks = req.PodRemarks ?? challan.PodRemarks
        };

        var challanIndex = manifest.Challans.IndexOf(challan);
        manifest.Challans[challanIndex] = updatedChallan;

        // Recalculate collected COD
        var newCollectedCod = manifest.Challans
            .Where(c => c.DeliveryStatus == "Delivered")
            .Sum(c => c.CodAmount);

        var manifestIndex = ManifestStore.IndexOf(manifest);
        var isAllDelivered = manifest.Challans.All(c => c.DeliveryStatus == "Delivered" || c.DeliveryStatus == "Returned");
        
        ManifestStore[manifestIndex] = manifest with
        {
            CollectedCodAmount = newCollectedCod,
            Status = isAllDelivered ? "Completed" : manifest.Status
        };

        return Ok(ManifestStore[manifestIndex]);
    }

    [HttpPost("manifests/{id}/complete")]
    public IActionResult CompleteManifest(Guid id)
    {
        var manifest = ManifestStore.FirstOrDefault(m => m.Id == id);
        if (manifest == null) return NotFound("Manifest not found");

        var manifestIndex = ManifestStore.IndexOf(manifest);
        ManifestStore[manifestIndex] = manifest with { Status = "Reconciled" };

        return Ok(new
        {
            success = true,
            message = $"Delivery manifest {manifest.ManifestNumber} reconciled successfully.",
            reconciledAmount = manifest.CollectedCodAmount,
            driver = manifest.DriverName
        });
    }
}
