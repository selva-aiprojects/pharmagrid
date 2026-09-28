using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class OrdersController : ControllerBase
{
    private static readonly List<VendorPoDto> VendorPosStore = new()
    {
        new VendorPoDto(
            Id: Guid.Parse("10000000-0000-0000-0000-000000000001"),
            PoNumber: "PO-2026-0811",
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000001"),
            SupplierName: "Sun Pharma Laboratories Ltd",
            OrderDate: DateTime.UtcNow.AddDays(-2),
            ExpectedDeliveryDate: DateTime.UtcNow.AddDays(2),
            Status: "Submitted",
            PaymentTerms: "30 Days Net",
            TotalAmount: 145800.00m,
            Notes: "Monthly indent for Pan-40 40mg and Rosuvas 10mg. Ship via temperature controlled cold container.",
            Items: new List<VendorPoItemDto>
            {
                new VendorPoItemDto(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Pan 40 Tablet", "MED-PAN-40", 1500, 85.00m, 12.0m, 142800.00m),
                new VendorPoItemDto(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Augmentin 625 Duo", "MED-AUG-625", 100, 180.00m, 12.0m, 20160.00m)
            }
        ),
        new VendorPoDto(
            Id: Guid.Parse("10000000-0000-0000-0000-000000000002"),
            PoNumber: "PO-2026-0812",
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000002"),
            SupplierName: "Cipla Healthcare Distributions",
            OrderDate: DateTime.UtcNow.AddDays(-5),
            ExpectedDeliveryDate: DateTime.UtcNow.AddDays(-1),
            Status: "PartiallyReceived",
            PaymentTerms: "21 Days Net",
            TotalAmount: 89400.00m,
            Notes: "Dolo 650 urgent seasonal replenishment for flu season. Partial lot received yesterday.",
            Items: new List<VendorPoItemDto>
            {
                new VendorPoItemDto(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Dolo 650mg Paracetamol", "MED-DOLO-650", 2500, 28.50m, 12.0m, 79800.00m)
            }
        ),
        new VendorPoDto(
            Id: Guid.Parse("10000000-0000-0000-0000-000000000003"),
            PoNumber: "PO-2026-0813",
            SupplierId: Guid.Parse("a0000000-0000-0000-0000-000000000003"),
            SupplierName: "Novo Nordisk India Pvt Ltd",
            OrderDate: DateTime.UtcNow.AddDays(-1),
            ExpectedDeliveryDate: DateTime.UtcNow.AddDays(1),
            Status: "Submitted",
            PaymentTerms: "Advance / Immediate RTGS",
            TotalAmount: 235000.00m,
            Notes: "Cold-chain insulin shipment (2°C - 8°C). Must include digital temperature data logger.",
            Items: new List<VendorPoItemDto>
            {
                new VendorPoItemDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Insulin Mixtard 30/70 100IU", "MED-INS-MIX", 500, 420.00m, 5.0m, 220500.00m)
            }
        )
    };

    private static readonly List<CustomerOrderDto> CustomerOrdersStore = new()
    {
        new CustomerOrderDto(
            Id: Guid.Parse("20000000-0000-0000-0000-000000000001"),
            OrderNumber: "SO-2026-1042",
            CustomerId: Guid.Parse("b0000000-0000-0000-0000-000000000001"),
            CustomerName: "Apollo Pharmacy - Anna Nagar East",
            OrderDate: DateTime.UtcNow.AddHours(-3),
            SalesRepName: "R. Vignesh (Field Rep Area 4)",
            Priority: "Urgent",
            Status: "Approved",
            TotalAmount: 34250.00m,
            DeliveryAddress: "Door 42, 2nd Avenue, Anna Nagar East, Chennai 600102",
            Notes: "Deliver before 4:00 PM for evening clinic rush. Collect payment via UPI QR.",
            Items: new List<CustomerOrderItemDto>
            {
                new CustomerOrderItemDto(Guid.Parse("11111111-1111-1111-1111-111111111111"), "Pan 40 Tablet", "MED-PAN-40", 200, 110.00m, 12.0m, 24640.00m),
                new CustomerOrderItemDto(Guid.Parse("33333333-3333-3333-3333-333333333333"), "Dolo 650mg Paracetamol", "MED-DOLO-650", 250, 34.00m, 12.0m, 9520.00m)
            }
        ),
        new CustomerOrderDto(
            Id: Guid.Parse("20000000-0000-0000-0000-000000000002"),
            OrderNumber: "SO-2026-1043",
            CustomerId: Guid.Parse("b0000000-0000-0000-0000-000000000002"),
            CustomerName: "MedPlus Medicals - T. Nagar Loop",
            OrderDate: DateTime.UtcNow.AddHours(-1),
            SalesRepName: "K. Mohan (Field Rep Area 2)",
            Priority: "ColdChain",
            Status: "Booked",
            TotalAmount: 51200.00m,
            DeliveryAddress: "14 Usman Road, Panagal Park, T. Nagar, Chennai 600017",
            Notes: "Requires ice-gel thermocol pack for Insulin cartons.",
            Items: new List<CustomerOrderItemDto>
            {
                new CustomerOrderItemDto(Guid.Parse("44444444-4444-4444-4444-444444444444"), "Insulin Mixtard 30/70 100IU", "MED-INS-MIX", 100, 485.00m, 5.0m, 50925.00m)
            }
        ),
        new CustomerOrderDto(
            Id: Guid.Parse("20000000-0000-0000-0000-000000000003"),
            OrderNumber: "SO-2026-1044",
            CustomerId: Guid.Parse("b0000000-0000-0000-0000-000000000003"),
            CustomerName: "Sri Balaji Chemist & Druggists",
            OrderDate: DateTime.UtcNow.AddHours(-5),
            SalesRepName: "R. Vignesh (Field Rep Area 4)",
            Priority: "Normal",
            Status: "Dispatched",
            TotalAmount: 18760.00m,
            DeliveryAddress: "88 GST Road, Chromepet, Chennai 600044",
            Notes: "Loaded onto Van Route 2 Manifest MNF-2026-0419.",
            Items: new List<CustomerOrderItemDto>
            {
                new CustomerOrderItemDto(Guid.Parse("22222222-2222-2222-2222-222222222222"), "Augmentin 625 Duo", "MED-AUG-625", 80, 210.00m, 12.0m, 18816.00m)
            }
        )
    };

    [HttpGet("summary")]
    public ActionResult<OrdersSummaryDto> GetSummary()
    {
        var totalVendorPos = VendorPosStore.Count;
        var totalPoVal = VendorPosStore.Sum(p => p.TotalAmount);
        var pendingPos = VendorPosStore.Count(p => p.Status == "Submitted" || p.Status == "PartiallyReceived");

        var totalCustOrders = CustomerOrdersStore.Count;
        var totalOrderVal = CustomerOrdersStore.Sum(c => c.TotalAmount);
        var urgentBookings = CustomerOrdersStore.Count(c => c.Priority == "Urgent" || c.Priority == "ColdChain");

        return Ok(new OrdersSummaryDto(
            TotalVendorPos: totalVendorPos,
            TotalPoValue: totalPoVal,
            PendingPoDeliveries: pendingPos,
            TotalCustomerOrders: totalCustOrders,
            TotalOrderValue: totalOrderVal,
            UrgentBookings: urgentBookings
        ));
    }

    [HttpGet("vendor-pos")]
    public ActionResult<List<VendorPoDto>> GetVendorPos()
    {
        return Ok(VendorPosStore.OrderByDescending(p => p.OrderDate).ToList());
    }

    [HttpPost("vendor-pos")]
    public ActionResult<VendorPoDto> CreateVendorPo([FromBody] CreateVendorPoRequest req)
    {
        if (req.Items == null || !req.Items.Any())
            return BadRequest("At least one product line is required to generate a Purchase Order.");

        var poNum = $"PO-2026-{1000 + VendorPosStore.Count + 1}";
        var total = req.Items.Sum(i => i.LineTotal);

        var newPo = new VendorPoDto(
            Id: Guid.NewGuid(),
            PoNumber: poNum,
            SupplierId: req.SupplierId,
            SupplierName: req.SupplierName,
            OrderDate: DateTime.UtcNow,
            ExpectedDeliveryDate: req.ExpectedDeliveryDate,
            Status: "Submitted",
            PaymentTerms: string.IsNullOrWhiteSpace(req.PaymentTerms) ? "30 Days Net" : req.PaymentTerms,
            TotalAmount: total,
            Notes: req.Notes ?? "Indent generated via PharmaGrid Auto-Procurement",
            Items: req.Items
        );

        VendorPosStore.Insert(0, newPo);
        return Created($"/api/v1/orders/vendor-pos/{newPo.Id}", newPo);
    }

    [HttpPost("vendor-pos/{id}/convert-to-grn")]
    public IActionResult ConvertPoToGrn(Guid id)
    {
        var po = VendorPosStore.FirstOrDefault(p => p.Id == id);
        if (po == null) return NotFound("Purchase order not found");

        var updatedPo = po with { Status = "Fulfilled" };
        var index = VendorPosStore.IndexOf(po);
        VendorPosStore[index] = updatedPo;

        return Ok(new
        {
            success = true,
            message = $"Vendor PO {po.PoNumber} converted into Inward Goods Receipt Note (GRN) draft successfully.",
            grnReference = $"GRN-INW-{DateTime.UtcNow:yyyyMMdd}-{new Random().Next(100, 999)}",
            supplierName = po.SupplierName,
            itemCount = po.Items.Count,
            totalValue = po.TotalAmount
        });
    }

    [HttpGet("customer-orders")]
    public ActionResult<List<CustomerOrderDto>> GetCustomerOrders()
    {
        return Ok(CustomerOrdersStore.OrderByDescending(c => c.OrderDate).ToList());
    }

    [HttpPost("customer-orders")]
    public ActionResult<CustomerOrderDto> CreateCustomerOrder([FromBody] CreateCustomerOrderRequest req)
    {
        if (req.Items == null || !req.Items.Any())
            return BadRequest("At least one product line is required to book a customer order.");

        var orderNum = $"SO-2026-{2000 + CustomerOrdersStore.Count + 1}";
        var total = req.Items.Sum(i => i.LineTotal);

        var newOrder = new CustomerOrderDto(
            Id: Guid.NewGuid(),
            OrderNumber: orderNum,
            CustomerId: req.CustomerId,
            CustomerName: req.CustomerName,
            OrderDate: DateTime.UtcNow,
            SalesRepName: string.IsNullOrWhiteSpace(req.SalesRepName) ? "Direct B2B Portal" : req.SalesRepName,
            Priority: req.Priority ?? "Normal",
            Status: "Approved",
            TotalAmount: total,
            DeliveryAddress: req.DeliveryAddress ?? "Registered Pharmacy Premises",
            Notes: req.Notes ?? "Chemist pre-order booked via sales rep mobile app",
            Items: req.Items
        );

        CustomerOrdersStore.Insert(0, newOrder);
        return Created($"/api/v1/orders/customer-orders/{newOrder.Id}", newOrder);
    }

    [HttpPost("customer-orders/{id}/convert-to-invoice")]
    public IActionResult ConvertOrderToInvoice(Guid id)
    {
        var order = CustomerOrdersStore.FirstOrDefault(o => o.Id == id);
        if (order == null) return NotFound("Customer order not found");

        var updatedOrder = order with { Status = "Invoiced" };
        var index = CustomerOrdersStore.IndexOf(order);
        CustomerOrdersStore[index] = updatedOrder;

        return Ok(new
        {
            success = true,
            message = $"Order {order.OrderNumber} converted into Sales Tax Invoice successfully.",
            invoiceNumber = $"INV-2026-{new Random().Next(10000, 99999)}",
            customerName = order.CustomerName,
            amount = order.TotalAmount
        });
    }

    [HttpPatch("vendor-pos/{id}/status")]
    public IActionResult UpdatePoStatus(Guid id, [FromQuery] string status)
    {
        var po = VendorPosStore.FirstOrDefault(p => p.Id == id);
        if (po == null) return NotFound();

        var index = VendorPosStore.IndexOf(po);
        VendorPosStore[index] = po with { Status = status };
        return Ok(VendorPosStore[index]);
    }

    [HttpPatch("customer-orders/{id}/status")]
    public IActionResult UpdateOrderStatus(Guid id, [FromQuery] string status)
    {
        var order = CustomerOrdersStore.FirstOrDefault(o => o.Id == id);
        if (order == null) return NotFound();

        var index = CustomerOrdersStore.IndexOf(order);
        CustomerOrdersStore[index] = order with { Status = status };
        return Ok(CustomerOrdersStore[index]);
    }
}
