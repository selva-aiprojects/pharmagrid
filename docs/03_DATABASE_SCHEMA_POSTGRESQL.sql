-- ============================================================================
-- CYBELINX PHARMA DISTRIBUTION (PHARMAFLOW) - PRODUCTION DATABASE SCHEMA
-- Target Database: PostgreSQL 16+
-- Architecture: Logical Multi-Tenancy with Tenant-Scoped Query Isolation
-- Compliance: Indian GST, Drugs & Cosmetics Act 1940 (Schedules H, H1, X, G)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- CREATE EXTENSION IF NOT EXISTS "vector"; -- Enable for Phase 2 AI Vector Embeddings

-- ============================================================================
-- 2. ENUMERATION TYPES
-- ============================================================================
CREATE TYPE schedule_class_enum AS ENUM ('Regular', 'G', 'H', 'H1', 'X');
CREATE TYPE storage_condition_enum AS ENUM ('Room Temperature', 'Cold Chain (2-8°C)', 'Controlled (15-25°C)', 'Deep Freeze (-20°C)');
CREATE TYPE invoice_mode_enum AS ENUM ('CASH', 'CREDIT', 'UPI', 'CARD');
CREATE TYPE invoice_status_enum AS ENUM ('Draft', 'Finalized', 'Dispatched', 'Delivered', 'Cancelled');
CREATE TYPE payment_status_enum AS ENUM ('Unpaid', 'PartiallyPaid', 'Paid', 'Overdue');
CREATE TYPE scheme_type_enum AS ENUM ('VolumetricFree', 'FinancialDiscount', 'ManufacturerRebate');
CREATE TYPE transaction_type_enum AS ENUM ('INVOICE', 'PAYMENT', 'CREDIT_NOTE', 'DEBIT_NOTE', 'RETURN');

-- ============================================================================
-- 3. CORE MULTI-TENANT & ORGANIZATIONAL MASTER TABLES
-- ============================================================================

-- Tenants Master Table
CREATE TABLE M_Tenants (
    TenantId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantName VARCHAR(200) NOT NULL,
    LegalBusinessName VARCHAR(255) NOT NULL,
    Subdomain VARCHAR(50) NOT NULL UNIQUE,
    PanNumber VARCHAR(10) NOT NULL,
    GstinNumber VARCHAR(15) NOT NULL,
    StateCode VARCHAR(2) NOT NULL, -- 2-digit Indian State GST Code (e.g., '33' for Tamil Nadu)
    DrugLicense20B VARCHAR(50) NOT NULL,
    DrugLicense21B VARCHAR(50) NOT NULL,
    ContactEmail VARCHAR(150) NOT NULL,
    ContactPhone VARCHAR(20) NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tenants_subdomain ON M_Tenants(Subdomain);

-- Organization Branches Table
CREATE TABLE M_Branches (
    BranchId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    BranchCode VARCHAR(20) NOT NULL,
    BranchName VARCHAR(150) NOT NULL,
    AddressLine1 VARCHAR(255) NOT NULL,
    AddressLine2 VARCHAR(255),
    City VARCHAR(100) NOT NULL,
    StateCode VARCHAR(2) NOT NULL,
    Pincode VARCHAR(10) NOT NULL,
    GstinNumber VARCHAR(15) NOT NULL,
    DrugLicenseNo VARCHAR(50) NOT NULL,
    IsHeadOffice BOOLEAN NOT NULL DEFAULT FALSE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_branch_code UNIQUE(TenantId, BranchCode)
);
CREATE INDEX idx_branches_tenant ON M_Branches(TenantId);

-- Warehouses & Storage Facilities
CREATE TABLE M_Warehouses (
    WarehouseId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES M_Branches(BranchId) ON DELETE RESTRICT,
    WarehouseCode VARCHAR(20) NOT NULL,
    WarehouseName VARCHAR(150) NOT NULL,
    IsColdChainCapable BOOLEAN NOT NULL DEFAULT FALSE,
    TemperatureLogThresholdMax NUMERIC(4,1) DEFAULT 25.0,
    TemperatureLogThresholdMin NUMERIC(4,1) DEFAULT 15.0,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_warehouse_code UNIQUE(TenantId, WarehouseCode)
);
CREATE INDEX idx_warehouses_tenant ON M_Warehouses(TenantId);

-- Warehouse Location Hierarchy (Zone-Rack-Shelf-Bin)
CREATE TABLE M_Locations (
    LocationId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    WarehouseId UUID NOT NULL REFERENCES M_Warehouses(WarehouseId) ON DELETE RESTRICT,
    ZoneCode VARCHAR(10) NOT NULL, -- e.g., 'Z1' (Cold Room), 'Z2' (High Value)
    RackCode VARCHAR(10) NOT NULL, -- e.g., 'R04'
    ShelfCode VARCHAR(10) NOT NULL, -- e.g., 'S02'
    BinCode VARCHAR(10) NOT NULL,   -- e.g., 'B08'
    LocationRackBin VARCHAR(50) GENERATED ALWAYS AS (ZoneCode || '-' || RackCode || '-' || ShelfCode || '-' || BinCode) STORED,
    IsQuarantineZone BOOLEAN NOT NULL DEFAULT FALSE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_warehouse_bin UNIQUE(TenantId, WarehouseId, ZoneCode, RackCode, ShelfCode, BinCode)
);
CREATE INDEX idx_locations_composite ON M_Locations(TenantId, WarehouseId, LocationRackBin);

-- Users & Authentication Table
CREATE TABLE M_Users (
    UserId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES M_Branches(BranchId) ON DELETE RESTRICT,
    Username VARCHAR(50) NOT NULL,
    Email VARCHAR(150) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    FullName VARCHAR(150) NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    RoleName VARCHAR(50) NOT NULL, -- TenantAdmin, Owner, PurchaseManager, BillingExecutive, WarehouseOperator, AccountsExecutive
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_username UNIQUE(TenantId, Username),
    CONSTRAINT unq_tenant_email UNIQUE(TenantId, Email)
);
CREATE INDEX idx_users_tenant_role ON M_Users(TenantId, RoleName);

-- ============================================================================
-- 4. MASTER DATA ENTITIES: PRODUCTS, SUPPLIERS, CUSTOMERS
-- ============================================================================

-- Supplier Master
CREATE TABLE M_Suppliers (
    SupplierId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    SupplierName VARCHAR(200) NOT NULL,
    SupplierCode VARCHAR(50) NOT NULL,
    GstinNumber VARCHAR(15) NOT NULL,
    StateCode VARCHAR(2) NOT NULL,
    DrugLicenseNo VARCHAR(50) NOT NULL,
    PanNumber VARCHAR(10),
    ContactPerson VARCHAR(100),
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(150),
    AddressLine1 VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Pincode VARCHAR(10) NOT NULL,
    CreditPeriodDays INT NOT NULL DEFAULT 30,
    CreditLimit NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    CurrentPayableBalance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_supplier_code UNIQUE(TenantId, SupplierCode)
);
CREATE INDEX idx_suppliers_tenant_name ON M_Suppliers(TenantId, SupplierName);

-- Customer / Retail Pharmacy Master
CREATE TABLE M_Customers (
    CustomerId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    CustomerName VARCHAR(200) NOT NULL,
    CustomerCode VARCHAR(50) NOT NULL,
    CustomerType VARCHAR(50) NOT NULL DEFAULT 'Retail Pharmacy', -- Retail Pharmacy, Hospital, Clinic, Sub-Distributor
    GstinNumber VARCHAR(15),
    StateCode VARCHAR(2) NOT NULL,
    DrugLicense20B VARCHAR(50) NOT NULL,
    DrugLicense21B VARCHAR(50) NOT NULL,
    LicenseExpiryDate DATE NOT NULL,
    ContactPerson VARCHAR(100),
    PhoneNumber VARCHAR(20) NOT NULL,
    Email VARCHAR(150),
    AddressLine1 VARCHAR(255) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Pincode VARCHAR(10) NOT NULL,
    CreditPeriodDays INT NOT NULL DEFAULT 21,
    CreditLimit NUMERIC(14,2) NOT NULL DEFAULT 50000.00,
    CurrentOutstandingBalance NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    IsBlockedForBilling BOOLEAN NOT NULL DEFAULT FALSE,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_customer_code UNIQUE(TenantId, CustomerCode)
);
CREATE INDEX idx_customers_tenant_name ON M_Customers(TenantId, CustomerName);
CREATE INDEX idx_customers_tenant_balance ON M_Customers(TenantId, CurrentOutstandingBalance DESC);

-- Product Master Table (M_Products)
CREATE TABLE M_Products (
    ProductId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    ProductCode VARCHAR(50) NOT NULL,
    ProductName VARCHAR(255) NOT NULL,
    GenericName VARCHAR(255) NOT NULL,
    BrandName VARCHAR(100),
    ManufacturerName VARCHAR(150) NOT NULL,
    DosageForm VARCHAR(50) NOT NULL, -- Tablet, Capsule, Syrup, Injection, Ointment
    Strength VARCHAR(50),             -- e.g., '650mg', '500IU'
    PackSize VARCHAR(30) NOT NULL,   -- e.g., "10x10 Tablets", "100ml"
    UOM VARCHAR(20) NOT NULL,        -- Strips, Bottles, Vials, Boxes
    HSNCode VARCHAR(10) NOT NULL,    -- Indian GST Harmonized System Nomenclature (e.g. 30049099)
    GSTPercentage NUMERIC(5,2) NOT NULL DEFAULT 12.00, -- 0, 5, 12, 18, 28
    MRP NUMERIC(12,2) NOT NULL,
    PTR NUMERIC(12,2) NOT NULL,      -- Price to Retailer
    PTS NUMERIC(12,2) NOT NULL,      -- Price to Stockist
    PurchaseRate NUMERIC(12,2) NOT NULL,
    ScheduleClass schedule_class_enum NOT NULL DEFAULT 'Regular',
    StorageCondition storage_condition_enum NOT NULL DEFAULT 'Room Temperature',
    ReorderLevel INT NOT NULL DEFAULT 50,
    MinStock INT NOT NULL DEFAULT 20,
    MaxStock INT NOT NULL DEFAULT 500,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_product_code UNIQUE(TenantId, ProductCode),
    CONSTRAINT chk_positive_mrp CHECK (MRP > 0),
    CONSTRAINT chk_positive_rates CHECK (PTR >= 0 AND PTS >= 0 AND PurchaseRate >= 0)
);
CREATE INDEX idx_products_tenant_name ON M_Products(TenantId, ProductName);
CREATE INDEX idx_products_tenant_generic ON M_Products(TenantId, GenericName);
CREATE INDEX idx_products_tenant_mfg ON M_Products(TenantId, ManufacturerName);

-- ============================================================================
-- 5. BATCH & PHYSICAL INVENTORY BALANCE TABLES
-- ============================================================================

-- Batch Ledger Table (T_Batches)
CREATE TABLE T_Batches (
    BatchId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    ProductId UUID NOT NULL REFERENCES M_Products(ProductId) ON DELETE RESTRICT,
    BatchNumber VARCHAR(50) NOT NULL,
    ManufacturingDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    PurchaseRate NUMERIC(12,2) NOT NULL,
    MRP NUMERIC(12,2) NOT NULL,
    WarehouseId UUID NOT NULL REFERENCES M_Warehouses(WarehouseId) ON DELETE RESTRICT,
    LocationRackBin VARCHAR(100), -- Zone-Rack-Shelf-Bin
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_product_batch UNIQUE(TenantId, ProductId, BatchNumber),
    CONSTRAINT chk_batch_expiry_gt_mfg CHECK (ExpiryDate > ManufacturingDate)
);
CREATE INDEX idx_batches_expiry ON T_Batches(TenantId, ExpiryDate ASC);
CREATE INDEX idx_batches_product_expiry ON T_Batches(TenantId, ProductId, ExpiryDate ASC);

-- Inventory Balances Table (T_Inventory_Balances)
CREATE TABLE T_Inventory_Balances (
    InventoryBalanceId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    ProductId UUID NOT NULL REFERENCES M_Products(ProductId) ON DELETE RESTRICT,
    BatchId UUID NOT NULL REFERENCES T_Batches(BatchId) ON DELETE RESTRICT,
    WarehouseId UUID NOT NULL REFERENCES M_Warehouses(WarehouseId) ON DELETE RESTRICT,
    QuantityAvailable INT NOT NULL DEFAULT 0,
    QuantityReserved INT NOT NULL DEFAULT 0,
    QuantityDamaged INT NOT NULL DEFAULT 0,
    QuantityExpired INT NOT NULL DEFAULT 0,
    QuantityQuarantined INT NOT NULL DEFAULT 0,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_batch_wh UNIQUE(TenantId, BatchId, WarehouseId),
    CONSTRAINT chk_positive_quantities CHECK (
        QuantityAvailable >= 0 AND 
        QuantityReserved >= 0 AND 
        QuantityDamaged >= 0 AND 
        QuantityExpired >= 0 AND 
        QuantityQuarantined >= 0
    )
);
CREATE INDEX idx_inv_balance_lookup ON T_Inventory_Balances(TenantId, ProductId, WarehouseId, QuantityAvailable);
CREATE INDEX idx_inv_balance_batch ON T_Inventory_Balances(TenantId, BatchId);

-- ============================================================================
-- 6. PROCUREMENT & GOODS RECEIPT (GRN) LIFECYCLE
-- ============================================================================

CREATE TABLE T_Purchase_Orders (
    PurchaseOrderId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    SupplierId UUID NOT NULL REFERENCES M_Suppliers(SupplierId) ON DELETE RESTRICT,
    WarehouseId UUID NOT NULL REFERENCES M_Warehouses(WarehouseId) ON DELETE RESTRICT,
    OrderNumber VARCHAR(50) NOT NULL,
    OrderDate DATE NOT NULL,
    ExpectedDeliveryDate DATE,
    OrderStatus VARCHAR(30) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, PartiallyReceived, Completed, Cancelled
    TotalGrossAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    TotalTaxAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    NetAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    Notes TEXT,
    CreatedByUserId UUID NOT NULL REFERENCES M_Users(UserId) ON DELETE RESTRICT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_po_number UNIQUE(TenantId, OrderNumber)
);

CREATE TABLE T_Goods_Receipts (
    GoodsReceiptId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    PurchaseOrderId UUID REFERENCES T_Purchase_Orders(PurchaseOrderId) ON DELETE SET NULL,
    SupplierId UUID NOT NULL REFERENCES M_Suppliers(SupplierId) ON DELETE RESTRICT,
    WarehouseId UUID NOT NULL REFERENCES M_Warehouses(WarehouseId) ON DELETE RESTRICT,
    GrnNumber VARCHAR(50) NOT NULL,
    SupplierInvoiceNumber VARCHAR(100) NOT NULL,
    InvoiceDate DATE NOT NULL,
    ReceivedDate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TotalGrossAmount NUMERIC(14,2) NOT NULL,
    TotalGstAmount NUMERIC(14,2) NOT NULL,
    NetPayableAmount NUMERIC(14,2) NOT NULL,
    Status VARCHAR(30) NOT NULL DEFAULT 'Processed', -- Draft, Processed, Reconciled
    CreatedByUserId UUID NOT NULL REFERENCES M_Users(UserId) ON DELETE RESTRICT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_grn_number UNIQUE(TenantId, GrnNumber)
);
CREATE INDEX idx_grn_tenant_supplier_inv ON T_Goods_Receipts(TenantId, SupplierInvoiceNumber);

CREATE TABLE T_Goods_Receipt_Items (
    GrnItemId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    GoodsReceiptId UUID NOT NULL REFERENCES T_Goods_Receipts(GoodsReceiptId) ON DELETE CASCADE,
    ProductId UUID NOT NULL REFERENCES M_Products(ProductId) ON DELETE RESTRICT,
    BatchNumber VARCHAR(50) NOT NULL,
    ManufacturingDate DATE NOT NULL,
    ExpiryDate DATE NOT NULL,
    QuantityReceived INT NOT NULL,
    FreeQuantityReceived INT NOT NULL DEFAULT 0,
    PurchaseRate NUMERIC(12,2) NOT NULL,
    MRP NUMERIC(12,2) NOT NULL,
    HSNCode VARCHAR(10) NOT NULL,
    GSTPercentage NUMERIC(5,2) NOT NULL,
    GrossAmount NUMERIC(14,2) NOT NULL,
    GstAmount NUMERIC(14,2) NOT NULL,
    NetAmount NUMERIC(14,2) NOT NULL,
    PutAwayLocationRackBin VARCHAR(50),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. SALES BILLING & CHECKOUT ENGINE
-- ============================================================================

CREATE TABLE T_Sales_Invoices (
    InvoiceId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    BranchId UUID NOT NULL REFERENCES M_Branches(BranchId) ON DELETE RESTRICT,
    CustomerId UUID NOT NULL REFERENCES M_Customers(CustomerId) ON DELETE RESTRICT,
    InvoiceNumber VARCHAR(50) NOT NULL,
    InvoiceDate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    InvoiceMode invoice_mode_enum NOT NULL DEFAULT 'CREDIT',
    PlaceOfSupplyStateCode VARCHAR(2) NOT NULL,
    TotalGrossAmount NUMERIC(14,2) NOT NULL,
    TotalTradeDiscountAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    TotalSchemeDiscountAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    TotalTaxableAmount NUMERIC(14,2) NOT NULL,
    TotalCgstAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    TotalSgstAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    TotalIgstAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    RoundOffAmount NUMERIC(6,2) NOT NULL DEFAULT 0.00,
    NetPayableAmount NUMERIC(14,2) NOT NULL,
    InvoiceStatus invoice_status_enum NOT NULL DEFAULT 'Finalized',
    PaymentStatus payment_status_enum NOT NULL DEFAULT 'Unpaid',
    IrnHash VARCHAR(64),          -- Indian E-Invoice IRN Hash
    QrCodePayload TEXT,           -- Signed QR code string from NIC Portal
    CreatedByUserId UUID NOT NULL REFERENCES M_Users(UserId) ON DELETE RESTRICT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unq_tenant_invoice_number UNIQUE(TenantId, InvoiceNumber)
);
CREATE INDEX idx_invoices_tenant_customer ON T_Sales_Invoices(TenantId, CustomerId);
CREATE INDEX idx_invoices_tenant_date ON T_Sales_Invoices(TenantId, InvoiceDate DESC);

CREATE TABLE T_Sales_Invoice_Items (
    InvoiceItemId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    InvoiceId UUID NOT NULL REFERENCES T_Sales_Invoices(InvoiceId) ON DELETE CASCADE,
    ProductId UUID NOT NULL REFERENCES M_Products(ProductId) ON DELETE RESTRICT,
    BatchId UUID NOT NULL REFERENCES T_Batches(BatchId) ON DELETE RESTRICT,
    QuantityBilled INT NOT NULL,
    QuantityFree INT NOT NULL DEFAULT 0,
    UnitPricePTR NUMERIC(12,2) NOT NULL,
    MRP NUMERIC(12,2) NOT NULL,
    TradeDiscountPercentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    TradeDiscountAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    SchemeDiscountAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    TaxableAmount NUMERIC(12,2) NOT NULL,
    HSNCode VARCHAR(10) NOT NULL,
    GSTPercentage NUMERIC(5,2) NOT NULL,
    CgstAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    SgstAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    IgstAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    NetLineTotal NUMERIC(12,2) NOT NULL,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoice_items_batch ON T_Sales_Invoice_Items(TenantId, BatchId);

-- ============================================================================
-- 8. PHARMACEUTICAL SCHEME MANAGEMENT
-- ============================================================================

CREATE TABLE T_Schemes (
    SchemeId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    SchemeName VARCHAR(200) NOT NULL,
    SchemeType scheme_type_enum NOT NULL,
    ManufacturerName VARCHAR(150),
    ProductId UUID REFERENCES M_Products(ProductId) ON DELETE CASCADE,
    MinOrderQuantityThreshold INT NOT NULL DEFAULT 1,
    FreeQuantityUnits INT NOT NULL DEFAULT 0,
    DiscountPercentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    CashDiscountAmount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    ReimbursementRatePerUnit NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    ValidFrom DATE NOT NULL,
    ValidTo DATE NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_scheme_validity CHECK (ValidTo >= ValidFrom)
);
CREATE INDEX idx_schemes_active ON T_Schemes(TenantId, ProductId, IsActive, ValidFrom, ValidTo);

CREATE TABLE T_Scheme_Claims (
    ClaimId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    SchemeId UUID NOT NULL REFERENCES T_Schemes(SchemeId) ON DELETE RESTRICT,
    InvoiceId UUID NOT NULL REFERENCES T_Sales_Invoices(InvoiceId) ON DELETE RESTRICT,
    ManufacturerName VARCHAR(150) NOT NULL,
    ProductId UUID NOT NULL REFERENCES M_Products(ProductId) ON DELETE RESTRICT,
    BilledQuantity INT NOT NULL,
    FreeQuantityAllocated INT NOT NULL DEFAULT 0,
    ClaimRatePerUnit NUMERIC(12,2) NOT NULL,
    AccruedClaimAmount NUMERIC(14,2) NOT NULL,
    ClaimStatus VARCHAR(30) NOT NULL DEFAULT 'Accrued', -- Accrued, Submitted, Approved, Settled
    SettlementReference VARCHAR(100),
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_claims_mfg ON T_Scheme_Claims(TenantId, ManufacturerName, ClaimStatus);

-- ============================================================================
-- 9. FINANCIAL LEDGERS & RECEIVABLES
-- ============================================================================

CREATE TABLE T_Customer_Ledger (
    LedgerEntryId UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    CustomerId UUID NOT NULL REFERENCES M_Customers(CustomerId) ON DELETE RESTRICT,
    InvoiceId UUID REFERENCES T_Sales_Invoices(InvoiceId) ON DELETE SET NULL,
    TransactionType transaction_type_enum NOT NULL,
    ReferenceNumber VARCHAR(100) NOT NULL,
    DebitAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    CreditAmount NUMERIC(14,2) NOT NULL DEFAULT 0.00,
    RunningBalance NUMERIC(14,2) NOT NULL,
    TransactionDate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_cust_ledger ON T_Customer_Ledger(TenantId, CustomerId, TransactionDate DESC);

-- ============================================================================
-- 10. IMMUTABLE AUDIT LOGGING
-- ============================================================================

CREATE TABLE T_Audit_Logs (
    AuditLogId BIGSERIAL PRIMARY KEY,
    TenantId UUID NOT NULL REFERENCES M_Tenants(TenantId) ON DELETE RESTRICT,
    UserId UUID NOT NULL,
    UserIPAddress VARCHAR(45) NOT NULL,
    ClientDeviceUserAgent VARCHAR(255) NOT NULL,
    OperationTimestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ActionType VARCHAR(50) NOT NULL,
    TargetEntity VARCHAR(100) NOT NULL,
    RecordId VARCHAR(100) NOT NULL,
    PayloadBeforeChanges JSONB,
    PayloadAfterChanges JSONB
);
CREATE INDEX idx_audit_compliance ON T_Audit_Logs(TenantId, ActionType, OperationTimestamp DESC);
CREATE INDEX idx_audit_entity ON T_Audit_Logs(TenantId, TargetEntity, RecordId);

-- Trigger to Prevent Any Updates or Deletions on T_Audit_Logs (Append-Only Enforcer)
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit records are strictly immutable. UPDATE and DELETE actions are prohibited by regulatory policy.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_immutable
BEFORE UPDATE OR DELETE ON T_Audit_Logs
FOR EACH ROW
EXECUTE FUNCTION fn_prevent_audit_tampering();
