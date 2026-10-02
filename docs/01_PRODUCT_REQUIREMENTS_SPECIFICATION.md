# Product Requirements Specification (PRS / Formal PRD)
## Cognivectra • PharmaGrid™ (Next-Gen Pharma Distribution Cloud ERP)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Release Specification) |
| **Status** | Approved for Production Development & Deployment |
| **Product Name** | **PharmaGrid™** (formerly codenamed PharmaFlow) |
| **Product Type** | Multi-Tenant B2B Cloud Distribution ERP & SaaS Platform |
| **Target Market** | Indian Pharmaceutical Stockists, Distributors, Wholesalers, and C&F (Carrying & Forwarding) Operators |
| **Compliance Baseline** | Drugs & Cosmetics Act 1940 & Rules 1945 (Schedules H, H1, X, G), CDSCO Guidelines, Indian GST Rule 46 E-Invoicing (NIC API Schema), 21 CFR Part 11 |
| **Core Technology Stack** | Next.js 14 (App Router) + TypeScript + Tailwind CSS, .NET 9 Web API (C#), PostgreSQL 16, Redis 7 (RedLock), RabbitMQ 3.13 |

---

## 1. Executive Summary & Vision

### 1.1 Core Value Proposition
The Indian pharmaceutical supply chain handles over ₹2,00,000 Crore (~$25B USD) in annual domestic commerce through an estimated 85,000+ stockists and 800,000+ retail pharmacies. Despite high market velocity, over 78% of stockists rely on antiquated, on-premise desktop legacy software (such as Marg ERP or local FoxPro/VB6 tools) constrained to single physical PCs, prone to data corruption, lacking real-time multi-branch visibility, and incapable of programmatic supply chain integration.

**PharmaFlow** is a cloud-native, multi-tenant B2B distribution ERP designed to modernise this ecosystem. It transitions distributors from isolated desktop accounting into a resilient, high-speed, multi-branch, mobile-accessible business operating system with built-in regulatory compliance, automated batch/FEFO inventory management, sub-2-second sales invoicing, and pharmaceutical scheme accounting.

### 1.2 Supply Chain Horizon
PharmaFlow serves as the central operational nexus of the pharmaceutical supply network:

```
[Pharma Manufacturer / C&F Agent]
              │ (Bulk Inward / EDI / PO Dispatch)
              ▼
    ┌──────────────────────────────────────────────┐
    │     CYBELINX PHARMAFLOW CLOUD PLATFORM       │
    │  - Multi-Tenant Core & RBAC                  │
    │  - FEFO Batch Ledger & Cold Chain Tracking   │
    │  - Sub-2-Second Checkout & Dual GST Engine   │
    │  - Pharma Scheme Matrix & Rebate Tracking    │
    │  - Immutable Regulatory Audit Ledger         │
    └──────────────────────────────────────────────┘
              │
              ├───> [B2B Retail Pharmacies & Chemists]
              ├───> [Hospitals & Nursing Homes]
              └───> [Sub-Distributors & Dispensing Clinics]
```

---

## 2. Target Personas & User Journeys

| Persona | Core Responsibilities | Critical Pain Points in Legacy Systems | PharmaFlow Solution |
| :--- | :--- | :--- | :--- |
| **Distributor Owner / Managing Director** | Overall P&L, working capital, supplier credit, receivables aging, regulatory standing. | Blind to consolidated stock across branches; blind to expiry dead-stock until written off. | Real-time executive dashboard, gross margin analytics, automated 90-day expiry horizon alerts, mobile oversight. |
| **Purchase Manager** | Procurement planning, PO creation, price negotiation, manufacturer scheme capture, supplier delivery tracking. | Manual calculation of order quantities based on paper ledgers; missing manufacturer bonus deals. | Reorder-level automation, automated supplier invoice-to-PO reconciliation, integrated purchase scheme matrix. |
| **Warehouse / Goods Receipt Clerk** | Inward unloading, physical verification, batch capture (MFG/EXP), bin-rack put-away, cold-chain checks. | Slow manual batch entry; error-prone recording of expiry dates leading to downstream returns. | Barcode-assisted batch ingestion, mandatory expiry vs MFG validation, automated Zone-Rack-Shelf-Bin assignment. |
| **Sales & Billing Executive** | Counter sales, telephone orders, field rep order punching, invoice generation, credit checking. | Desktop billing queues take 45–90 seconds per bill; inability to look up batch expiry rapidly. | **2-Second Checkout Guarantee**, automated FEFO stock allocation, real-time customer credit limit validation. |
| **Accounts & Finance Executive** | Customer ledgers, payment collections (UPI/NEFT/Cheque), supplier payables, GST filings, credit notes. | Complex reconciliation of "Buy 10 Get 1" free stock; manual GST calculation between state and inter-state. | Automated Dual GST calculation (CGST+SGST / IGST), manufacturer claim accrual ledger, automated customer aging. |
| **System Administrator** | Multi-branch setup, user access control, compliance audits, printer configuration. | Hard to manage role permissions across staff; zero tamper-proof audit trails for cancelled bills. | Granular RBAC, branch-level data sandboxing, immutable `T_Audit_Logs` table capturing all mutations. |

---

## 3. Product Scope & End-to-End Enterprise Module Decomposition

```
PharmaGrid™ Complete Enterprise Distribution Cloud ERP Suite
├── 01. Organization & Multi-Tenancy (Tenant sandboxing, Branch & Depot hierarchy)
├── 02. Identity, RBAC & Security (JWT, CDSCO Registered Pharmacist credentials, Granular guards)
├── 03. Product Master Catalog (Generic, Brand, Pack Size, HSN, Tax %, Schedules H/H1/X/G, Cold Chain)
├── 04. Stakeholder CRM & Vendor Master (Suppliers, Pharmacies, Form 20B/21B validities, Credit limits)
├── 05. Upstream Procurement & Orders Lifecycle
│   ├── 05a. Vendor Purchase Orders (PO) & Customer Sales Pre-Orders (Field booking)
│   └── 05b. Inward GRN & Batch Ingestion (Mandatory EXP > MFG validation, Bonus Scheme Units)
├── 06. Unified Stock Master & Physical Inventory Management
│   ├── 06a. Consolidated Stock Master (Physical vs Book vs Allocated vs Quarantined stock)
│   ├── 06b. Physical Stock Adjustment Center (CDSCO Breakage, Ampoule Leakage, Expiry write-offs)
│   └── 06c. Intelligent FEFO Batch & Rack Allocator (Zone-Rack-Bin put-away, Auto multi-batch split)
├── 07. High-Velocity Sales & Outward Logistics
│   ├── 07a. Rapid Counter Billing Engine (100% Zero-Mouse F1-F8, Sub-2s SLA, Dual Indian GST)
│   ├── 07b. Statutory Rule 46 GST Invoicing & CDSCO Section 18 Declarations (A4 & Thermal Print)
│   └── 07c. Shipment, Delivery Challans & Route Dispatch Manifests (Van trip sheets, COD & POD)
├── 08. Pharmaceutical Scheme Management (10+1, 20+2 Volumetric deals, Rebate claim accruals)
├── 09. Expiry Analytics & Predictive Inventory
│   ├── 09a. 4-Tier Expiry Defense Radar (0-30d Quarantine, 31-60d Return, 61-90d Promo Clearance)
│   └── 09b. Algorithmic Demand Forecasting & Stockout Radar (Days of Inventory DOI, Sales Run Rate)
├── 10. Financial Ledgers & Receivables (Customer Ledger, Supplier Ledger, Aging, Multi-modal Payment)
├── 11. Immutable Audit Logging (Tamper-evident operations trail, 21 CFR Part 11 before/after delta capture)
├── 12. Executive Analytics & Operational Queue (Live picking tracker, Low stock alerts, Real-time P&L KPIs)
└── 13. Internal Human Capital & Staff Payroll (Monthly salary slip generation, Allowances, PF/ESI)
```

---

## 4. Indian Regulatory Compliance & Specialized Pharma Logic

### 4.1 Drug & Cosmetics Act (Schedule Classifications)
Every SKU in `M_Products` must be assigned to one of the statutory Schedule Classes:
1. **Schedule H**: Prescription drugs requiring recording of prescribing doctor and retail pharmacy drug license (Form 20B/21B).
2. **Schedule H1**: Third/fourth generation antibiotics, anti-TB, and psychotropics. Requires mandatory logging of purchaser's Drug License number, contact number, batch number, and generation of a statutory Schedule H1 register export.
3. **Schedule X**: Strictly controlled narcotics/psychotropics. System must enforce double verification, separate warehouse quarantine location, and retention of sales records for a statutory minimum of 2 years.
4. **Schedule G / Regular**: General over-the-counter and standard therapeutic formulations.

### 4.2 Drug License Validation
- Suppliers and Customers must maintain validated drug license records:
  - **Form 20B**: License to sell, stock, or exhibit or distribute by wholesale drugs other than those specified in Schedule C, C(1) and X.
  - **Form 21B**: License to sell, stock, or exhibit or distribute by wholesale drugs specified in Schedule C and C(1).
- Billing system must soft-warn or hard-block orders for customers whose Drug License has expired or is invalid.

### 4.3 Indian Dual GST Architecture
- GST Rates applicable: `0%`, `5%`, `12%`, `18%`, `28%` (Pharma standard: 12% for most medicines, 5% for critical life-saving vaccines/oral rehydration, 18% for nutraceuticals/cosmetics).
- **Intra-State Transaction**: If `Customer.StateCode == TenantBranch.StateCode`:
  $$\text{CGST} = \text{TaxableValue} \times \left(\frac{\text{GSTRate}}{2}\right), \quad \text{SGST} = \text{TaxableValue} \times \left(\frac{\text{GSTRate}}{2}\right)$$
- **Inter-State Transaction**: If `Customer.StateCode \ne TenantBranch.StateCode`:
  $$\text{IGST} = \text{TaxableValue} \times \text{GSTRate}$$
- **NIC E-Invoicing Schema**: B2B sales invoices exceeding the statutory threshold must serialize to NIC IRN (Invoice Reference Number) and QR Code schema specifications.

### 4.4 Pharma Pricing Hierarchy & Margins
Indian pharma pricing follows standard statutory definitions:
- **MRP (Maximum Retail Price)**: Consumer-facing ceiling price inclusive of all taxes.
- **PTR (Price to Retailer)**: Rate charged to the retail pharmacy by the distributor:
  $$\text{PTR} = \frac{\text{MRP}}{1 + (\text{GST\%} / 100)} \times (1 - \text{RetailerMargin\%})$$
  *(Standard Retailer Margin: 20% for unbranded generics, 16% for branded ethical products).*
- **PTS (Price to Stockist)**: Rate charged to the stockist by the manufacturer/C&F:
  $$\text{PTS} = \text{PTR} \times (1 - \text{StockistMargin\%})$$
  *(Standard Stockist Margin: 10% on ethical products).*
- **Purchase Rate**: Actual landing cost after trade discounts and manufacturer schemes.

---

## 5. Non-Functional Requirements & Production SLAs

| Pillar | Metric / Requirement | Target / SLA | Verification Mechanism |
| :--- | :--- | :--- | :--- |
| **Performance** | Sales Invoice Commit Duration | **$\le$ 2.0 Seconds** under 200 concurrent active counter sessions | Load testing via k6 / Locust running against REST `/api/v1/sales/invoices` |
| **Performance** | Operational Read API Latency | **$\le$ 500 ms** (95th percentile) | Prometheus / OpenTelemetry HTTP request duration metrics |
| **Performance** | Executive Dashboard Aggregates | **$\le$ 3.0 Seconds** first-paint | Redis cached metric keys refreshed via background worker |
| **Availability** | System Uptime | **99.5%** in MVP, 99.9% in Phase 2 | Synthetic uptime health pings (`/healthz`) every 30 seconds |
| **Data Residency** | Geographic Hosting Zone | **India Only** (AWS Mumbai `ap-south-1` / Azure Central India) | Cloud infrastructure provisioning policy enforcement |
| **Concurrency** | Stock Allocation Consistency | **Zero Over-allocation / Negative Stock** | PostgreSQL `xmin` optimistic concurrency + Redis distributed locks |
| **Auditability** | Operation Immutability | **100% Append-only** for all financial and inventory mutations | Database trigger preventing `UPDATE` and `DELETE` on `T_Audit_Logs` |
| **Data Isolation** | Multi-Tenant Data Leakage | **Zero cross-tenant record leakage** | EF Core Global Query Filter + Automated multi-tenant integration test suite |

---

## 6. Edge Case Catalog & Failure Modes

1. **Split Batch Allocation**:
   - *Scenario*: Customer orders 100 boxes of Amoxicillin 500mg. Earliest expiring batch `BATCH-01` has only 35 boxes available. Next batch `BATCH-02` has 150 boxes available.
   - *System Action*: FEFO engine splits line into: Line 1a (35 boxes @ BATCH-01, Exp: 11/2026) and Line 1b (65 boxes @ BATCH-02, Exp: 04/2027). The UI highlights the split with an amber visual indicator.
2. **Near-Expiry Gate (FEFO Stop)**:
   - *Scenario*: Batch `AUG-PAN40-102` has 12 boxes with expiry date in 45 days.
   - *System Action*: The engine automatically excludes this batch from normal sales allocation (since retailers reject stock with $< 90$ days shelf life). The batch transitions to `Supplier Return Candidate` status.
3. **Concurrent Order Collision (Double-Sell Prevention)**:
   - *Scenario*: Two billing executives attempt to invoice the last 10 strips of an oncology drug at the exact same millisecond.
   - *System Action*: System acquires a Redis distributed key lock `lock:stock:{tenantId}:{productId}:{batchId}` with a 3000ms TTL. First caller acquires lock, checks balance, decrements balance, and commits. Second caller receives concurrency exception `STOCK_ALLOCATION_CONFLICT` and UI refreshes with live stock.
4. **GST State Misalignment**:
   - *Scenario*: Customer billing address state code differs from warehouse shipping address state code.
   - *System Action*: System automatically applies IGST and logs the place of supply (POS) based on shipping destination GST rules.
