# Feature Ticket Catalog (Derived from PRD)
## PharmaGrid™ Cloud Distribution ERP (Engineering Delivery Backlog)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Agile Feature Backlog) |
| **Backlog Schema** | Jira / Linear Enterprise Ticket Specification |
| **Total Epics** | 12 Operational & Regulatory Epics |
| **Total Feature Tickets** | 36 Production Feature Tickets |
| **Estimation Unit** | Story Points (Fibonacci Scale: 1, 2, 3, 5, 8, 13) |
| **Target Release** | Version 1.0.0 Production Release |

---

## 1. Epic Overview & Story Point Distribution

```
┌─────────────────────────────────────────────────────────────┬──────────┬────────┐
│ Epic Identifier & Name                                      │ Tickets  │ Points │
├─────────────────────────────────────────────────────────────┼──────────┼────────┤
│ EPIC-01: Multi-Tenancy, Organization & RBAC Core            │ 4        │ 24     │
│ EPIC-02: Product Master Catalog & CDSCO Schedules           │ 3        │ 13     │
│ EPIC-03: Stakeholder CRM & Drug License 20B/21B Gateway     │ 4        │ 18     │
│ EPIC-04: Upstream Procurement & Inward GRN Put-Away         │ 3        │ 16     │
│ EPIC-05: Unified Stock Master & Physical Warehousing        │ 3        │ 16     │
│ EPIC-06: High-Velocity Rapid Counter Billing Engine         │ 5        │ 29     │
│ EPIC-07: Outward Logistics, Challans & Route Dispatch       │ 3        │ 16     │
│ EPIC-08: Pharmaceutical Schemes & Commercial Rebates        │ 2        │ 10     │
│ EPIC-09: Expiry Defense Radar & Algorithmic Forecasting     │ 3        │ 16     │
│ EPIC-10: Human Capital & Statutory Staff Payroll            │ 2        │ 10     │
│ EPIC-11: Regulatory Audit Trail & Security Governance       │ 2        │ 13     │
│ EPIC-12: Executive Analytics & Operational Telemetry        │ 2        │ 10     │
├─────────────────────────────────────────────────────────────┼──────────┼────────┤
│ TOTAL PRODUCTION BACKLOG                                    │ 36       │ 191    │
└─────────────────────────────────────────────────────────────┴──────────┴────────┘
```

---

## 2. EPIC-01: Multi-Tenancy, Organization & RBAC Core

### Ticket `PG-TKT-101`: Multi-Tenant Query Interception & Data Sandboxing
- **Epic**: EPIC-01
- **Component**: Backend (`PharmaGrid.Infrastructure`), Database (`PostgreSQL 16`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `8`
- **Dependencies**: None (Foundational)
- **Description**: Implement EF Core Global Query Filter on all `ITenantEntity` implementations to automatically partition SQL queries by `TenantId` derived from the active JWT context.
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Tenant Partition Isolation on Products Fetch
    Given an authenticated request with JWT tenant_id "11111111-1111-1111-1111-111111111111"
    When DbContext.Products.ToListAsync() executes
    Then the SQL WHERE clause must contain "TenantId = '11111111-1111-1111-1111-111111111111'"
    And zero records belonging to other tenants are returned.
  ```
- **Definition of Done**: Automated integration test verifies zero cross-tenant leakage across all 16 entities.

---

### Ticket `PG-TKT-102`: Multi-Persona HMAC-SHA256 JWT Authentication
- **Epic**: EPIC-01
- **Component**: Backend (`AuthController.cs`), Frontend (`AuthContext.tsx`, `LoginView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-101
- **Description**: Secure terminal credential sign-in endpoint issuing HMAC-SHA256 tokens with claims for `tenant_id`, `role`, and `pharmacist_reg_no`. Provide frontend multi-persona switcher for counter testing.
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Successful Terminal Login
    Given valid terminal credentials for "admin@pharmagrid.com"
    When POST /api/v1/auth/login is called
    Then HTTP 200 is returned with a signed JWT valid for 15 minutes
    And the frontend AuthContext loads user details and permission state.
  ```

---

### Ticket `PG-TKT-103`: Staff User Management & CDSCO Pharmacist Verification
- **Epic**: EPIC-01
- **Component**: Backend (`UsersController.cs`), Frontend (`UserManagementView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-102
- **Description**: Admin management interface to create staff users, assign terminal roles, specify max discount percentages, and enforce State Pharmacy Council registration numbers for pharmacists.

---

### Ticket `PG-TKT-104`: Cashier Discount Capping & Action Authorization
- **Epic**: EPIC-01
- **Component**: Backend (`SalesController.cs`), Frontend (`RapidBillingWorkspace.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-103
- **Description**: Hard block billing cashiers from entering line or invoice cash discounts exceeding their authorized cap without Depot Manager authorization credentials.

---

## 3. EPIC-02: Product Master Catalog & CDSCO Schedules

### Ticket `PG-TKT-201`: Pharma SKU Catalog & High-Velocity Typeahead
- **Epic**: EPIC-02
- **Component**: Backend (`ProductsController.cs`), Frontend (`ProductCatalogView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-101
- **Description**: Product master capturing brand name, generic molecule, manufacturer, dosage form, pack size, PTR, PTS, MRP, and HSN code with sub-100ms multi-column search.

---

### Ticket `PG-TKT-202`: CDSCO Schedule Classification & Cold-Chain Rules
- **Epic**: EPIC-02
- **Component**: Backend (`PharmaGrid.Domain`), Frontend (`ProductCatalogView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-201
- **Description**: Enforce statutory schedule categorization (Schedule Regular, G, H, H1, X) and storage conditions (Room Temperature, Cold-Chain 2-8°C, Deep Freeze). Display visual regulatory pills.

---

### Ticket `PG-TKT-203`: Indian Dual GST Slab & HSN Configuration
- **Epic**: EPIC-02
- **Component**: Backend (`IndianGstTaxCalculator.cs`)
- **Priority**: `P1 (Critical)` | **Story Points**: `3`
- **Dependencies**: PG-TKT-201
- **Description**: Configure standard pharmaceutical GST rates (0%, 5%, 12%, 18%) per HSN code with automated split between CGST+SGST (Intra-state) and IGST (Inter-state).

---

## 4. EPIC-03: Stakeholder CRM & Drug License 20B/21B Gateway

### Ticket `PG-TKT-301`: Pharmacy Chemist & Hospital CRM
- **Epic**: EPIC-03
- **Component**: Backend (`CustomersController.cs`), Frontend (`CustomersView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-101
- **Description**: Chemist directory capturing legal trade name, GSTIN, billing state code, Form 20B/21B license numbers, expiry dates, credit limit, and credit period days.

---

### Ticket `PG-TKT-302`: Automated CDSCO Form 20B/21B Gatekeeper
- **Epic**: EPIC-03
- **Component**: Backend (`SalesController.cs`), Frontend (`RapidBillingWorkspace.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-301
- **Description**: Hard block invoice commitment if the target customer's Drug License is expired. Return RFC 7807 problem details with HTTP status 400.
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Invoicing Blocked on Expired Drug License
    Given a customer with Form 20B license expired on "2026-06-30"
    When POST /api/v1/sales/invoices is attempted for this customer
    Then HTTP 400 Bad Request is returned
    And the error code is "ERR_CDSCO_LICENSE_EXPIRED"
    And zero stock is deducted from batches.
  ```

---

### Ticket `PG-TKT-303`: Real-Time Credit Limit Health Meter
- **Epic**: EPIC-03
- **Component**: Frontend (`RapidBillingWorkspace.tsx`, `CustomersView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-301
- **Description**: Dynamic visual progress bar displaying chemist credit limit utilization with automated color shifts (Emerald $<70\%$, Amber $70-90\%$, Rose $>90\%$).

---

### Ticket `PG-TKT-304`: Supplier & C&F Vendor Master
- **Epic**: EPIC-03
- **Component**: Backend (`PurchasesController.cs`)
- **Priority**: `P2 (High)` | **Story Points**: `3`
- **Dependencies**: PG-TKT-101
- **Description**: Inward vendor registry maintaining supplier GSTIN, payment terms, and payable balance ledgers.

---

## 5. EPIC-04: Upstream Procurement & Inward GRN Put-Away

### Ticket `PG-TKT-401`: Vendor Purchase Orders & Indent Management
- **Epic**: EPIC-04
- **Component**: Backend (`OrdersController.cs`), Frontend (`OrdersManagementView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-201, PG-TKT-304
- **Description**: Create, track, and approve supplier purchase orders with manufacturer scheme terms and delivery target dates.

---

### Ticket `PG-TKT-402`: Inward Goods Receipt Note (GRN) Multi-SKU Ingestion
- **Epic**: EPIC-04
- **Component**: Backend (`PurchasesController.cs`), Frontend (`ProcurementGrnView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `8`
- **Dependencies**: PG-TKT-401
- **Description**: Inward stock receipt matching supplier invoice. Generates new physical batches, assigns rack locations, increments `QuantityAvailable`, and credits vendor ledger.

---

### Ticket `PG-TKT-403`: Mandatory CDSCO Expiry > MFG Date Validation
- **Epic**: EPIC-04
- **Component**: Backend (`PurchasesController.cs`), Database (`PostgreSQL 16`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `3`
- **Dependencies**: PG-TKT-402
- **Description**: Database constraint and backend validation preventing ingestion of batches where `ExpiryDate <= ManufacturingDate`.

---

## 6. EPIC-05: Unified Stock Master & Physical Warehousing

### Ticket `PG-TKT-501`: Consolidated Stock Master Balance View
- **Epic**: EPIC-05
- **Component**: Backend (`StockMasterController.cs`), Frontend (`StockMasterView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-402
- **Description**: Real-time multi-dimensional view of Physical, Book, Allocated, Damaged, and Quarantined stock across all warehouse bins.

---

### Ticket `PG-TKT-502`: Physical Zone-Rack-Shelf-Bin Put-Away Map
- **Epic**: EPIC-05
- **Component**: Backend (`InventoryController.cs`), Frontend (`WarehouseInventoryView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-501
- **Description**: Exact physical coordinate tracking (`Z1-R02-S03-B01`) displayed in billing and picking drawers to optimize warehouse fulfillment speed.

---

### Ticket `PG-TKT-503`: CDSCO Form 20B Breakage & Leakage Write-Off Register
- **Epic**: EPIC-05
- **Component**: Backend (`StockMasterController.cs`), Frontend (`StockMasterView.tsx`, `SmartPharmaTextArea.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `6`
- **Dependencies**: PG-TKT-501
- **Description**: Statutory write-off workflow for ampoule hairline fractures and transit crushing with registered pharmacist sign-off and append-only audit trail logging.

---

## 7. EPIC-06: High-Velocity Rapid Counter Billing Engine

### Ticket `PG-TKT-601`: 100% Zero-Mouse F1-F8 Keyboard Ergonomics
- **Epic**: EPIC-06
- **Component**: Frontend (`RapidBillingWorkspace.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `8`
- **Dependencies**: PG-TKT-201, PG-TKT-301
- **Description**: Full keyboard-only counter billing with global shortcuts (`F1` Customer, `F2` Add Line, `F3` Batch Drawer, `F8` Commit, `Enter`, `Tab`, `Esc`).

---

### Ticket `PG-TKT-602`: Mathematical FEFO Stock Allocation Engine
- **Epic**: EPIC-06
- **Component**: Backend (`FefoAllocationEngine.cs`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-501
- **Description**: Mathematical First-Expiry-First-Out stock allocator prioritizing batches with earliest expiry while excluding near-expiry batches under the 60-day safety horizon.

---

### Ticket `PG-TKT-603`: Automatic Multi-Batch Split-Allocation Indicator
- **Epic**: EPIC-06
- **Component**: Backend (`FefoAllocationEngine.cs`), Frontend (`RapidBillingWorkspace.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-602
- **Description**: Automatically split an order line across multiple physical batches when requested quantity exceeds the earliest expiring batch balance. Display amber visual split tag.

---

### Ticket `PG-TKT-604`: Sub-2-Second Atomic Invoice Commit
- **Epic**: EPIC-06
- **Component**: Backend (`SalesController.cs`), Database (`PostgreSQL 16`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `8`
- **Dependencies**: PG-TKT-602, PG-TKT-603
- **Description**: Commit atomic sales invoice in $\le 2000$ms (target $< 150$ms) under 200 concurrent counters with Redis distributed locking and stock deduction.

---

### Ticket `PG-TKT-605`: Statutory Rule 46 GST Tax Invoice Print Modal
- **Epic**: EPIC-06
- **Component**: Frontend (`TaxInvoiceModal.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `3`
- **Dependencies**: PG-TKT-604
- **Description**: A4 and 80-column thermal/dot-matrix printable invoice format featuring CDSCO Section 18 declaration, Dual GST slabs, and Indian Rupee word translations.

---

## 8. EPIC-07: Outward Logistics, Challans & Route Dispatch

### Ticket `PG-TKT-701`: Customer Pre-Orders & 1-Click Invoice Conversion
- **Epic**: EPIC-07
- **Component**: Backend (`OrdersController.cs`), Frontend (`OrdersManagementView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-604
- **Description**: Ingest field sales bookings and pre-orders, and convert approved bookings into finalized sales invoices with 1-click.

---

### Ticket `PG-TKT-702`: Delivery Challans & Route Picking Slips
- **Epic**: EPIC-07
- **Component**: Backend (`LogisticsController.cs`), Frontend (`LogisticsDispatchView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-701
- **Description**: Generate delivery challans, carton count manifests, and warehouse picking slips grouped by route zones.

---

### Ticket `PG-TKT-703`: Electronic Proof of Delivery (POD) & COD Collection
- **Epic**: EPIC-07
- **Component**: Backend (`LogisticsController.cs`), Frontend (`LogisticsDispatchView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `6`
- **Dependencies**: PG-TKT-702
- **Description**: Capture chemist electronic signature/stamp upon delivery and track COD cash/UPI collections with automated driver reconciliation.

---

## 9. EPIC-08: Pharmaceutical Schemes & Commercial Rebates

### Ticket `PG-TKT-801`: Volumetric Deal Engine ("Buy 10 Get 1 Free")
- **Epic**: EPIC-08
- **Component**: Backend (`PharmaGrid.Domain`), Frontend (`SchemesView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-201
- **Description**: Configure volumetric bonus deals (10+1, 20+2) and manufacturer cash discounts with automatic calculation during billing.

---

### Ticket `PG-TKT-802`: Manufacturer Rebate Claim Accrual Tracking
- **Epic**: EPIC-08
- **Component**: Backend (`SchemesController.cs`)
- **Priority**: `P2 (High)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-801
- **Description**: Calculate manufacturer reimbursement receivables on free stock issued to chemists and generate monthly debit note claims.

---

## 10. EPIC-09: Expiry Defense Radar & Algorithmic Forecasting

### Ticket `PG-TKT-901`: 4-Tier Expiry Defense Radar View
- **Epic**: EPIC-09
- **Component**: Backend (`InventoryController.cs`), Frontend (`ExecutiveDashboardView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-501
- **Description**: Interactive radar classifying warehouse stock into 4 horizons (0-30d Quarantine, 31-60d Supplier Return, 61-90d Clearance Deal, 91+d Safe).

---

### Ticket `PG-TKT-902`: 30-Day Sales Run Rate & Days of Inventory (DOI)
- **Epic**: EPIC-09
- **Component**: Backend (`DemandForecastController.cs`), Frontend (`DemandForecastView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `6`
- **Dependencies**: PG-TKT-501
- **Description**: Calculate daily sales velocity, Days of Inventory Remaining ($\text{DOI}$), and stockout risk tiers.

---

### Ticket `PG-TKT-903`: 1-Click Automated Purchase Order Generation
- **Epic**: EPIC-09
- **Component**: Backend (`DemandForecastController.cs`), Frontend (`DemandForecastView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-902, PG-TKT-401
- **Description**: Automatically populate vendor purchase orders with calculated Economic Order Quantities (EOQ) for items in critical stockout status.

---

## 11. EPIC-10: Human Capital & Statutory Staff Payroll

### Ticket `PG-TKT-1001`: Monthly Staff Payroll Processing
- **Epic**: EPIC-10
- **Component**: Backend (`PayrollController.cs`), Frontend (`PayrollView.tsx`)
- **Priority**: `P2 (High)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-103
- **Description**: Monthly salary register calculating gross earnings, overtime, and salary advances.

---

### Ticket `PG-TKT-1002`: Statutory PF, ESI & Printable Salary Slips
- **Epic**: EPIC-10
- **Component**: Backend (`PayrollController.cs`), Frontend (`PayrollView.tsx`)
- **Priority**: `P2 (High)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-1001
- **Description**: Statutory Provident Fund (12%), Employee State Insurance (0.75%), and Professional Tax calculations with printable A4 salary certificate.

---

## 12. EPIC-11: Regulatory Audit Trail & Security Governance

### Ticket `PG-TKT-1101`: Immutable 21 CFR Part 11 Audit Trail
- **Epic**: EPIC-11
- **Component**: Database (`PostgreSQL 16`), Backend (`AuditLogsController.cs`), Frontend (`AuditLogView.tsx`)
- **Priority**: `P0 (Blocker)` | **Story Points**: `8`
- **Dependencies**: PG-TKT-101
- **Description**: PostgreSQL database trigger preventing `UPDATE` and `DELETE` on `T_Audit_Logs`. Record user ID, IP address, and JSON before/after snapshots.

---

### Ticket `PG-TKT-1102`: Redis RedLock Distributed Stock Locking
- **Epic**: EPIC-11
- **Component**: Backend (`PharmaGrid.Infrastructure`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-604
- **Description**: Distributed key lock `lock:stock:{tenantId}:{productId}:{batchId}` with 3000ms TTL to prevent double-sell race conditions between concurrent billing counters.

---

## 13. EPIC-12: Executive Analytics & Operational Telemetry

### Ticket `PG-TKT-1201`: Executive Command Center & Financial KPIs
- **Epic**: EPIC-12
- **Component**: Backend (`DashboardController.cs`), Frontend (`ExecutiveDashboardView.tsx`)
- **Priority**: `P1 (Critical)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-604, PG-TKT-501
- **Description**: Real-time executive dashboard displaying Today's Sales, Inventory Asset Valuation, Overdue Receivables, and Expiry Risk Horizon.

---

### Ticket `PG-TKT-1202`: Live Warehouse Picking Queue & Latency SLA Pill
- **Epic**: EPIC-12
- **Component**: Frontend (`Header.tsx`, `ExecutiveDashboardView.tsx`)
- **Priority**: `P2 (High)` | **Story Points**: `5`
- **Dependencies**: PG-TKT-1201
- **Description**: Live header polling displaying backend API latency (`● 18ms .NET 9 API`) and warehouse order packing queue status.
