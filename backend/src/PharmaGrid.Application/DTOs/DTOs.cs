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

// ==========================================
// 1. ORDERS MODULE (VENDOR PO & CUSTOMER PRE-ORDERS)
// ==========================================
public record VendorPoItemDto(
    Guid ProductId,
    string ProductName,
    string ProductCode,
    int QuantityOrdered,
    decimal UnitPrice,
    decimal GstRate,
    decimal LineTotal);

public record VendorPoDto(
    Guid Id,
    string PoNumber,
    Guid SupplierId,
    string SupplierName,
    DateTime OrderDate,
    DateTime ExpectedDeliveryDate,
    string Status, // Draft, Submitted, PartiallyReceived, Fulfilled, Cancelled
    string PaymentTerms,
    decimal TotalAmount,
    string Notes,
    List<VendorPoItemDto> Items);

public record CreateVendorPoRequest(
    Guid SupplierId,
    string SupplierName,
    DateTime ExpectedDeliveryDate,
    string PaymentTerms,
    string Notes,
    List<VendorPoItemDto> Items);

public record CustomerOrderItemDto(
    Guid ProductId,
    string ProductName,
    string ProductCode,
    int QuantityOrdered,
    decimal UnitPrice,
    decimal GstRate,
    decimal LineTotal);

public record CustomerOrderDto(
    Guid Id,
    string OrderNumber,
    Guid CustomerId,
    string CustomerName,
    DateTime OrderDate,
    string SalesRepName,
    string Priority, // Normal, Urgent, ColdChain
    string Status,   // Booked, Approved, Dispatched, Invoiced, Cancelled
    decimal TotalAmount,
    string DeliveryAddress,
    string Notes,
    List<CustomerOrderItemDto> Items);

public record CreateCustomerOrderRequest(
    Guid CustomerId,
    string CustomerName,
    string SalesRepName,
    string Priority,
    string DeliveryAddress,
    string Notes,
    List<CustomerOrderItemDto> Items);

public record OrdersSummaryDto(
    int TotalVendorPos,
    decimal TotalPoValue,
    int PendingPoDeliveries,
    int TotalCustomerOrders,
    decimal TotalOrderValue,
    int UrgentBookings);

// ==========================================
// 2. SHIPMENT & LOGISTICS (DELIVERY MANIFESTS & COD)
// ==========================================
public record DeliveryChallanDto(
    Guid Id,
    string ChallanNumber,
    string InvoiceNumber,
    string CustomerName,
    string DeliveryAddress,
    string ContactPhone,
    int CartonCount,
    decimal CodAmount,
    string PaymentMode, // Credit, COD_Cash, COD_UPI, Prepaid
    string DeliveryStatus, // Pending, OutForDelivery, Delivered, AttemptedFailed, Returned
    string? PodReceiverName,
    DateTime? PodTimestamp,
    string? PodRemarks);

public record DeliveryManifestDto(
    Guid Id,
    string ManifestNumber,
    string RouteName,
    string VehicleNumber,
    string DriverName,
    string DriverPhone,
    DateTime DispatchDate,
    string Status, // Scheduled, InTransit, Completed, Reconciled
    int TotalInvoices,
    int TotalCartons,
    decimal TotalCodAmount,
    decimal CollectedCodAmount,
    List<DeliveryChallanDto> Challans);

public record CreateManifestRequest(
    string RouteName,
    string VehicleNumber,
    string DriverName,
    string DriverPhone,
    List<DeliveryChallanDto> Challans);

public record UpdateChallanPodRequest(
    string DeliveryStatus,
    string? PodReceiverName,
    decimal? CollectedAmount,
    string? PodRemarks);

public record LogisticsSummaryDto(
    int ActiveManifests,
    int DispatchedParcels,
    int DeliveredToday,
    decimal PendingCodCollections,
    decimal ReconciledCodToday);

// ==========================================
// 3. UNIFIED STOCK MASTER & PHYSICAL ADJUSTMENTS
// ==========================================
public record StockMasterBatchDto(
    Guid BatchId,
    string BatchNumber,
    DateTime ExpiryDate,
    int PhysicalStock,
    int BookStock,
    int AllocatedStock,
    int QuarantineStock,
    int AvailableStock,
    decimal PurchasePrice,
    decimal Mrp,
    string LocationBin);

public record StockMasterItemDto(
    Guid ProductId,
    string ProductCode,
    string BrandName,
    string GenericName,
    string Manufacturer,
    string Category,
    string HsnCode,
    decimal GstRate,
    int TotalPhysicalStock,
    int TotalBookStock,
    int TotalAllocatedStock,
    int TotalQuarantineStock,
    int TotalAvailableStock,
    int BatchCount,
    string StorageCondition,
    string ScheduleClass,
    int ReorderLevel,
    decimal StockValue,
    List<StockMasterBatchDto> Batches);

public record StockAdjustmentDto(
    Guid Id,
    string AdjustmentNumber,
    Guid ProductId,
    string ProductName,
    string BatchNumber,
    string AdjustmentType, // Breakage, Leakage, ExpiryQuarantine, PhysicalVariance, Sample
    int Quantity,
    decimal UnitCost,
    decimal TotalValueLoss,
    string ReasonCode,
    string ApprovedBy,
    DateTime CreatedDate,
    string Notes);

public record CreateStockAdjustmentRequest(
    Guid ProductId,
    string ProductName,
    string BatchNumber,
    string AdjustmentType,
    int Quantity,
    string ReasonCode,
    string ApprovedBy,
    string Notes);

public record StockMasterSummaryDto(
    int TotalSkus,
    int TotalBatches,
    decimal TotalValuation,
    int LowStockCount,
    int ExpiredQuarantineCount,
    decimal MonthlyBreakageLoss);

// ==========================================
// 4. DEMAND FORECASTING & STOCKOUT RADAR
// ==========================================
public record DemandForecastItemDto(
    Guid ProductId,
    string ProductCode,
    string BrandName,
    string Manufacturer,
    int CurrentAvailableStock,
    decimal DailySalesRunRate,
    int MonthlySalesRunRate,
    decimal DaysOfInventoryRemaining,
    string StockoutRisk, // Critical_Stockout, Low_Stock_Warning, Adequate, Overstocked
    int ReorderLevel,
    int RecommendedReorderQuantity,
    int LeadTimeDays,
    Guid SupplierId,
    string SupplierName,
    decimal EstimatedPoValue);

public record DemandForecastSummaryDto(
    int CriticalStockoutsCount,
    int LowStockWarningsCount,
    int HealthyStockCount,
    decimal TotalRecommendedPoValue,
    decimal AverageInventoryDays,
    List<DemandForecastItemDto> Items);

// ==========================================
// 5. STAFF PAYROLL & SALARY SLIPS
// ==========================================
public record SalarySlipDto(
    Guid Id,
    Guid EmployeeId,
    string EmployeeName,
    string RoleName,
    string PanNumber,
    string UanNumber,
    string MonthYear,
    int TotalWorkingDays,
    int DaysWorked,
    int LopDays,
    decimal BasicSalary,
    decimal Hra,
    decimal ConveyanceAllowance,
    decimal MedicalAllowance,
    decimal SpecialAllowance,
    decimal GrossEarnings,
    decimal PfEmployeeDeduction,
    decimal EsiEmployeeDeduction,
    decimal ProfessionalTax,
    decimal TdsDeduction,
    decimal TotalDeductions,
    decimal NetSalary,
    string NetSalaryInWords,
    string PaymentStatus, // Draft, Approved, Paid
    string? PaymentReference,
    DateTime ProcessedDate);

public record PayrollRunSummaryDto(
    string MonthYear,
    int TotalEmployees,
    decimal TotalGrossSalary,
    decimal TotalNetDisbursement,
    decimal TotalPfContribution,
    decimal TotalEsiContribution,
    string Status,
    List<SalarySlipDto> Slips);

public record ProcessPayrollRequest(
    string MonthYear,
    int WorkingDaysInMonth);

// ==========================================
// 6. STATUTORY CDSCO COMPLIANCE REGISTERS
// ==========================================
public record ScheduleH1EntryDto(
    Guid Id,
    string SupplyDate,
    string InvoiceNumber,
    string CustomerName,
    string DrugLicenseNumber,
    string CustomerCity,
    string DoctorName,
    string DoctorRegistrationNumber,
    string ProductName,
    string GenericName,
    string BatchNumber,
    string ExpiryDate,
    int QuantitySold,
    string PackagingUnit);

public record ScheduleXLedgerDto(
    Guid Id,
    string Date,
    string ProductName,
    string BatchNumber,
    int OpeningBalance,
    int InwardReceiptQuantity,
    string InwardSupplierBillNo,
    int OutwardSoldQuantity,
    string OutwardChemistName,
    string ChemistLicenseForm20F21F,
    int ClosingBalance,
    string RegisteredPharmacistName,
    string PharmacistRegNo);

public record BatchRecallChemistDto(
    Guid CustomerId,
    string CustomerName,
    string ContactPhone,
    string City,
    string DrugLicense20B,
    string InvoiceNumber,
    string InvoiceDate,
    int QuantitySupplied,
    string DeliveryStatus);

public record BatchRecallTraceDto(
    string BatchNumber,
    string ProductName,
    string GenericName,
    string ManufacturerName,
    string ManufacturingDate,
    string ExpiryDate,
    int InitialBatchQuantity,
    int TotalUnitsSupplied,
    int CurrentWarehouseStock,
    string WarehouseRackLocation,
    string RecallStatus, // "ACTIVE_RECALL", "QUARANTINED", "CLEARED"
    string SeverityLevel, // "Class I (Life Threatening)", "Class II (Potential Harm)", "Class III (Minor)"
    List<BatchRecallChemistDto> ImpactedPharmacies);

public record IssueRecallNoticeRequest(
    string BatchNumber,
    string ReasonForRecall,
    string AuthorityOrderReference,
    string UrgencyLevel);

public record ColdChainLogDto(
    Guid Id,
    string LogDate,
    string TimeSlot, // "08:00 AM (Morning)", "08:00 PM (Evening)"
    string StorageUnitName, // "Deep Cold Room Unit-A (2-8°C)"
    decimal RecordedTemperatureCelsius,
    bool IsWithinSafeThreshold, // 2.0°C to 8.0°C
    string CalibratedLoggerSerialNumber,
    string InspectorPharmacistName,
    string? ExcursionRemarks);

public record RecordColdChainLogRequest(
    string StorageUnitName,
    string TimeSlot,
    decimal TemperatureCelsius,
    string? Remarks);

// ==========================================
// 7. CHEMIST PAYMENT COLLECTIONS & KNOCKOFF
// ==========================================
public record PendingInvoiceKnockoffDto(
    Guid InvoiceId,
    string InvoiceNumber,
    string InvoiceDate,
    decimal TotalNetPayable,
    decimal AlreadyPaidAmount,
    decimal OutstandingBalance,
    int DaysOverdue,
    decimal PromptPaymentDiscountEligible);

public record InvoiceKnockoffAllocation(
    Guid InvoiceId,
    decimal KnockoffAmount,
    decimal CashDiscountAllowed);

public record CreatePaymentReceiptRequest(
    Guid CustomerId,
    decimal AmountCollected,
    string PaymentMode, // "CASH", "CHEQUE", "NEFT_RTGS", "UPI_QR"
    string? ChequeNumber,
    string? ChequeBankName,
    string? ChequeDate,
    string? UpiTransactionRef,
    string? DepositedToBankAccount,
    string? Remarks,
    List<InvoiceKnockoffAllocation> KnockoffAllocations);

public record PaymentReceiptVoucherDto(
    Guid ReceiptId,
    string ReceiptNumber,
    string ReceiptDate,
    Guid CustomerId,
    string CustomerName,
    string CustomerCode,
    decimal AmountCollected,
    string PaymentMode,
    string? ChequeNumber,
    string? ChequeBankName,
    string? UpiTransactionRef,
    string Status, // "Realized", "Deposited_Pending_Clearance", "Bounced"
    decimal CustomerBalanceAfterReceipt,
    int InvoicesSettledCount);

public record ChemistAgingBucketDto(
    Guid CustomerId,
    string CustomerName,
    string CustomerCode,
    string PhoneNumber,
    decimal TotalOutstanding,
    decimal CurrentNotDue,
    decimal Days1To15,
    decimal Days16To30,
    decimal Days31To45,
    decimal Days46To60,
    decimal DaysOver60,
    bool IsBlockedForBilling);

public record ChemistAgingSummaryDto(
    decimal TotalReceivables,
    decimal TotalOverdueAmount,
    int TotalOverdueCustomers,
    decimal AmountOver60Days,
    List<ChemistAgingBucketDto> CustomerAgingList);

// ==========================================
// 8. RETURNS & CLAIMS MANAGEMENT
// ==========================================
public record ReturnItemDetailRequest(
    Guid ProductId,
    string BatchNumber,
    int ReturnQuantity,
    decimal UnitPtr,
    decimal GstPercentage,
    string ReturnReason, // "EXPIRY_RETURN", "BREAKAGE_LEAKAGE", "GOOD_STOCK_RETURN"
    string? DamageRemarks);

public record CreateSalesReturnCreditNoteRequest(
    Guid CustomerId,
    string OriginalInvoiceNumber,
    List<ReturnItemDetailRequest> ReturnItems,
    string? Remarks);

public record SalesReturnCreditNoteDto(
    Guid CreditNoteId,
    string CreditNoteNumber,
    string CreditNoteDate,
    Guid CustomerId,
    string CustomerName,
    string OriginalInvoiceNumber,
    decimal SubTotalTaxable,
    decimal TotalGstReversed,
    decimal TotalCreditNoteAmount,
    string Status,
    int ItemsCount);

public record CreatePurchaseReturnDebitNoteRequest(
    Guid SupplierId,
    string OriginalSupplierBillNo,
    List<ReturnItemDetailRequest> ReturnItems,
    string? Remarks);

public record PurchaseReturnDebitNoteDto(
    Guid DebitNoteId,
    string DebitNoteNumber,
    string DebitNoteDate,
    Guid SupplierId,
    string SupplierName,
    decimal TotalDebitAmount,
    string ManufacturerClaimStatus, // "CLAIM_SUBMITTED", "APPROVED_BY_COMPANY", "CREDIT_NOTE_RECEIVED"
    string? CompanyClaimReference);

// ==========================================
// 9. FINANCIAL ACCOUNTING & GST REPORTS
// ==========================================
public record AccountStatementEntryDto(
    string Date,
    string VoucherType, // "SALES_INV", "CREDIT_NOTE", "RECEIPT_VOUCHER", "PURCHASE_GRN", "DEBIT_NOTE"
    string VoucherNumber,
    string Particulars,
    decimal DebitAmount,
    decimal CreditAmount,
    decimal RunningBalance);

public record CustomerStatementDto(
    Guid CustomerId,
    string CustomerName,
    string CustomerCode,
    string Gstin,
    string PeriodFrom,
    string PeriodTo,
    decimal OpeningBalance,
    decimal TotalDebits,
    decimal TotalCredits,
    decimal ClosingBalance,
    List<AccountStatementEntryDto> Entries);

public record GstR1B2BInvoiceDto(
    string ChemistGstin,
    string ChemistLegalTradeName,
    string InvoiceNumber,
    string InvoiceDate,
    decimal InvoiceValue,
    string PlaceOfSupply,
    bool ReverseCharge,
    decimal TaxableValue,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount);

public record GstHsnSummaryDto(
    string HsnCode,
    string Description,
    string UQC,
    int TotalQuantity,
    decimal TotalValue,
    decimal TaxableValue,
    decimal RatePercentage,
    decimal CgstAmount,
    decimal SgstAmount,
    decimal IgstAmount);

public record GstR1SummaryDto(
    string MonthYear,
    int TotalB2BInvoicesCount,
    decimal TotalTaxableTurnover,
    decimal TotalCgstCollected,
    decimal TotalSgstCollected,
    decimal TotalIgstCollected,
    decimal TotalGrossTaxLiability,
    List<GstR1B2BInvoiceDto> B2BInvoices,
    List<GstHsnSummaryDto> HsnSummary);

public record CashBookEntryDto(
    string Date,
    string VoucherNo,
    string Description,
    string CashFlowType, // "INFLOW" / "OUTFLOW"
    decimal Amount,
    decimal CashInHandBalance);

public record CashBookSummaryDto(
    string Date,
    decimal OpeningCashInHand,
    decimal TotalCashCollections,
    decimal TotalCashDisbursements,
    decimal ClosingCashInHand,
    List<CashBookEntryDto> Transactions);

