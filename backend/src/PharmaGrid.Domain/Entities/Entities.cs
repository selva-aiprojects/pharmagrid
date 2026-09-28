using PharmaGrid.Domain.Common;
using PharmaGrid.Domain.Enums;

namespace PharmaGrid.Domain.Entities;

public class Product : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string GenericName { get; set; } = string.Empty;
    public string? BrandName { get; set; }
    public string ManufacturerName { get; set; } = string.Empty;
    public string DosageForm { get; set; } = string.Empty; // Tablet, Injection, Syrup
    public string? Strength { get; set; }
    public string PackSize { get; set; } = string.Empty;
    public string UOM { get; set; } = string.Empty; // Strips, Vials, Bottles
    public string HSNCode { get; set; } = "30049099";
    public decimal GSTPercentage { get; set; } = 12.00m;
    public decimal MRP { get; set; }
    public decimal PTR { get; set; } // Price to Retailer
    public decimal PTS { get; set; } // Price to Stockist
    public decimal PurchaseRate { get; set; }
    public ScheduleClass ScheduleClass { get; set; } = ScheduleClass.Regular;
    public StorageCondition StorageCondition { get; set; } = StorageCondition.RoomTemperature;
    public int ReorderLevel { get; set; } = 50;
    public bool IsActive { get; set; } = true;

    public ICollection<Batch> Batches { get; set; } = new List<Batch>();
}

public class Batch : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public DateOnly ManufacturingDate { get; set; }
    public DateOnly ExpiryDate { get; set; }
    public decimal PurchaseRate { get; set; }
    public decimal MRP { get; set; }
    public decimal PTR { get; set; }
    public Guid WarehouseId { get; set; }
    public string LocationRackBin { get; set; } = string.Empty; // Z-R-S-B
    public int AvailableQuantity { get; set; }
    public bool IsQuarantined { get; set; } = false;
}

public class InventoryBalance : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid ProductId { get; set; }
    public Guid BatchId { get; set; }
    public Guid WarehouseId { get; set; }
    public int QuantityAvailable { get; set; }
    public int QuantityReserved { get; set; }
    public int QuantityDamaged { get; set; }
    public int QuantityExpired { get; set; }
    public int QuantityQuarantined { get; set; }
}

public class Customer : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerType { get; set; } = "Retail Pharmacy";
    public string GstinNumber { get; set; } = string.Empty;
    public string StateCode { get; set; } = "33"; // Tamil Nadu
    public string DrugLicense20B { get; set; } = string.Empty;
    public string DrugLicense21B { get; set; } = string.Empty;
    public DateOnly LicenseExpiryDate { get; set; }
    public bool IsLicenseValid => LicenseExpiryDate >= DateOnly.FromDateTime(DateTime.UtcNow);
    public decimal CreditLimit { get; set; } = 50000.00m;
    public decimal CurrentOutstandingBalance { get; set; } = 0.00m;
    public int CreditPeriodDays { get; set; } = 21;
    public bool IsBlockedForBilling { get; set; } = false;
    public string Address { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class Supplier : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public string GstinNumber { get; set; } = string.Empty;
    public string StateCode { get; set; } = "33";
    public string DrugLicenseNo { get; set; } = string.Empty;
    public decimal CurrentPayableBalance { get; set; } = 0.00m;
    public int CreditPeriodDays { get; set; } = 30;
}

public class SalesInvoice : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid BranchId { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public InvoiceMode InvoiceMode { get; set; } = InvoiceMode.CREDIT;
    public string PlaceOfSupplyStateCode { get; set; } = "33";
    public decimal TotalGrossAmount { get; set; }
    public decimal TotalTradeDiscountAmount { get; set; }
    public decimal TotalSchemeDiscountAmount { get; set; }
    public decimal TotalTaxableAmount { get; set; }
    public decimal TotalCgstAmount { get; set; }
    public decimal TotalSgstAmount { get; set; }
    public decimal TotalIgstAmount { get; set; }
    public decimal RoundOffAmount { get; set; }
    public decimal NetPayableAmount { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Finalized;
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;
    public string? IrnHash { get; set; }
    public string? QrCodePayload { get; set; }
    public string CreatedByUserId { get; set; } = string.Empty;

    public ICollection<SalesInvoiceItem> Items { get; set; } = new List<SalesInvoiceItem>();
}

public class SalesInvoiceItem : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public Guid InvoiceId { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid BatchId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public int QuantityBilled { get; set; }
    public int QuantityFree { get; set; }
    public decimal UnitPricePTR { get; set; }
    public decimal MRP { get; set; }
    public decimal DiscountPercentage { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TaxableAmount { get; set; }
    public string HSNCode { get; set; } = "30049099";
    public decimal GSTPercentage { get; set; }
    public decimal CgstAmount { get; set; }
    public decimal SgstAmount { get; set; }
    public decimal IgstAmount { get; set; }
    public decimal NetLineTotal { get; set; }
}

public class Scheme : BaseEntity, ITenantEntity
{
    public Guid TenantId { get; set; }
    public string SchemeName { get; set; } = string.Empty;
    public SchemeType SchemeType { get; set; }
    public string ManufacturerName { get; set; } = string.Empty;
    public Guid? ProductId { get; set; }
    public int MinOrderQuantityThreshold { get; set; } = 10;
    public int FreeQuantityUnits { get; set; } = 1;
    public decimal DiscountPercentage { get; set; } = 0.00m;
    public decimal ReimbursementRatePerUnit { get; set; }
    public DateOnly ValidFrom { get; set; }
    public DateOnly ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
}

public class AuditLog
{
    public long AuditLogId { get; set; }
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string UserIpAddress { get; set; } = string.Empty;
    public string ClientDeviceUserAgent { get; set; } = string.Empty;
    public DateTime OperationTimestamp { get; set; } = DateTime.UtcNow;
    public string ActionType { get; set; } = string.Empty;
    public string TargetEntity { get; set; } = string.Empty;
    public string RecordId { get; set; } = string.Empty;
    public string? PayloadBeforeChanges { get; set; }
    public string? PayloadAfterChanges { get; set; }
}
