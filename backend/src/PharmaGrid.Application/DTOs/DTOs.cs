namespace PharmaGrid.Application.DTOs;

public record ProductDto(
    Guid ProductId,
    string Code,
    string ProductName,
    string GenericName,
    string ManufacturerName,
    string DosageForm,
    string PackSize,
    string UOM,
    string HSNCode,
    decimal GSTPercentage,
    decimal PTR,
    decimal MRP,
    string ScheduleClass,
    string StorageCondition,
    int TotalAvailableQuantity);

public record ProductCreateRequest(
    string ProductCode,
    string ProductName,
    string GenericName,
    string ManufacturerName,
    string DosageForm,
    string PackSize,
    string UOM,
    string HSNCode,
    decimal GSTPercentage,
    decimal PTR,
    decimal PTS,
    decimal MRP,
    decimal PurchaseRate,
    string ScheduleClass,
    string StorageCondition,
    int ReorderLevel);

public record BatchDto(
    Guid BatchId,
    string BatchNumber,
    string ManufacturingDate,
    string ExpiryDate,
    decimal PTR,
    decimal MRP,
    string RackLocation,
    int AvailableQty);

public record CustomerDto(
    Guid CustomerId,
    string Code,
    string Name,
    string CustomerType,
    string GSTIN,
    string StateCode,
    string DrugLicense20B,
    string DrugLicense21B,
    string LicenseExpiryDate,
    bool IsLicenseValid,
    decimal CreditLimit,
    decimal CurrentOutstanding);

public record CreateSalesInvoiceLineRequest(
    string ProductId,
    string BatchId,
    int QuantityBilled,
    decimal UnitPricePTR,
    decimal DiscountPercentage = 0);

public record CreateSalesInvoiceRequest(
    string CustomerId,
    string InvoiceMode,
    List<CreateSalesInvoiceLineRequest> LineItems);

public record SalesInvoiceItemDto(
    Guid ProductId,
    string ProductName,
    Guid BatchId,
    string BatchNumber,
    int QuantityBilled,
    int QuantityFree,
    decimal UnitPricePTR,
    decimal MRP,
    decimal DiscountPercentage,
    decimal DiscountAmount,
    decimal TaxableAmount,
    string HSNCode,
    decimal GSTPercentage,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount,
    decimal NetLineTotal);

public record SalesInvoiceDto(
    Guid InvoiceId,
    string InvoiceNumber,
    DateTime InvoiceDate,
    string CustomerName,
    decimal TotalGrossAmount,
    decimal TotalTradeDiscountAmount,
    decimal TotalTaxableAmount,
    decimal TotalCgstAmount,
    decimal TotalSgstAmount,
    decimal TotalIgstAmount,
    decimal RoundOffAmount,
    decimal NetPayableAmount,
    string IrnHash,
    int ExecutionDurationMs);

public record SalesInvoiceDetailDto(
    Guid InvoiceId,
    string InvoiceNumber,
    DateTime InvoiceDate,
    string CustomerName,
    string CustomerGstin,
    string CustomerDrugLicense,
    string PlaceOfSupplyStateCode,
    string InvoiceMode,
    decimal TotalGrossAmount,
    decimal TotalTradeDiscountAmount,
    decimal TotalTaxableAmount,
    decimal TotalCgstAmount,
    decimal TotalSgstAmount,
    decimal TotalIgstAmount,
    decimal RoundOffAmount,
    decimal NetPayableAmount,
    string IrnHash,
    List<SalesInvoiceItemDto> Items);

public record SalesReturnLineRequest(
    string ProductId,
    string BatchId,
    int ReturnQuantity,
    decimal UnitPricePTR,
    string ReturnReason);

public record CreateSalesReturnRequest(
    string CustomerId,
    string OriginalInvoiceNumber,
    List<SalesReturnLineRequest> ReturnLines);

public record SalesReturnResponse(
    Guid CreditNoteId,
    string CreditNoteNumber,
    DateTime CreditNoteDate,
    decimal TotalCreditAmount,
    string CustomerName,
    decimal CustomerNewOutstandingBalance,
    string Status);

public record InboundGrnLineRequest(
    Guid ProductId,
    string BatchNumber,
    string ManufacturingDate,
    string ExpiryDate,
    int QuantityReceived,
    int FreeQuantityReceived,
    decimal PurchaseRate,
    decimal MRP,
    string HSNCode,
    decimal GSTPercentage,
    string PutAwayRackLocation);

public record InboundGrnRequest(
    Guid SupplierId,
    string SupplierInvoiceNumber,
    DateTime InvoiceDate,
    Guid WarehouseId,
    List<InboundGrnLineRequest> LineItems);

public record InboundGrnResponse(
    Guid PurchaseInvoiceId,
    string GrnNumber,
    string Status,
    decimal TotalGrossAmount,
    decimal TotalGstAmount,
    decimal NetPayableAmount,
    int BatchesCreated,
    string SystemTimestamp);

public record DashboardSummaryDto(
    string BranchName,
    decimal TodaysSalesValue,
    decimal SalesGrowthPct,
    decimal TotalInventoryAssetValue,
    int TotalInventoryUnits,
    decimal OverdueReceivables,
    int OverdueCustomerCount,
    decimal ActiveExpiryRiskHorizonValue);

public record LoginRequest(string Username, string Password);
public record UserProfileDto(Guid UserId, string Username, string FullName, string RoleName, string Email, List<string> Permissions);
public record LoginResponse(string Token, UserProfileDto User);
public record DemoPersonaDto(string Username, string RoleName, string FullName, string Description, string AvatarInitials);

public record UserItemDto(
    Guid UserId,
    string Username,
    string FullName,
    string Email,
    string PhoneNumber,
    string RoleName,
    string BranchName,
    string CounterNumber,
    string Shift,
    bool IsActive,
    bool IsRegisteredPharmacist,
    string? PharmacistCouncilRegNo,
    string? PharmacistCouncilExpiry,
    decimal MaxDiscountPercentage,
    bool CanAuthorizeReturns,
    bool CanCancelInvoices,
    bool CanAccessScheduleX,
    DateTime LastLoginAt,
    List<string> Permissions);

public record CreateUserRequest(
    string Username,
    string FullName,
    string Email,
    string PhoneNumber,
    string RoleName,
    string BranchName,
    string CounterNumber,
    string Shift,
    bool IsRegisteredPharmacist,
    string? PharmacistCouncilRegNo,
    string? PharmacistCouncilExpiry,
    decimal MaxDiscountPercentage,
    bool CanAuthorizeReturns,
    bool CanCancelInvoices,
    bool CanAccessScheduleX,
    List<string>? Permissions);

public record UpdateUserRequest(
    string FullName,
    string Email,
    string PhoneNumber,
    string RoleName,
    string BranchName,
    string CounterNumber,
    string Shift,
    bool IsActive,
    bool IsRegisteredPharmacist,
    string? PharmacistCouncilRegNo,
    string? PharmacistCouncilExpiry,
    decimal MaxDiscountPercentage,
    bool CanAuthorizeReturns,
    bool CanCancelInvoices,
    bool CanAccessScheduleX,
    List<string> Permissions);

public record UserStatsDto(
    int TotalStaff,
    int ActiveNow,
    int BillingExecutives,
    int LicensedPharmacists,
    int SuspendedAccounts);

