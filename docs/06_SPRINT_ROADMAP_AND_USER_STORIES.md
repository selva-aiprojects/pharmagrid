# Agile Product Backlog & Sprint Execution Plan
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Agile Engineering Delivery Blueprint) |
| **Release Target** | MVP v1.0.0 Production Release |
| **Sprint Cadence** | 6 Sprints $\times$ 2-Week Sprints = 12 Calendar Weeks |
| **Story Format** | Standard User Story with Gherkin Acceptance Criteria (`Given-When-Then`) |

---

## 1. Phased Sprint Delivery Roadmap

```
Week  1 - 2  [Sprint 1: Multi-Tenancy Core, RBAC & Organization Foundation]
Week  3 - 4  [Sprint 2: Pharma Master Catalog, Customer 20B/21B & Supplier Registry]
Week  5 - 6  [Sprint 3: Procurement, Goods Receipt (GRN) & Inward Batch Ingestion]
Week  7 - 8  [Sprint 4: FEFO Engine, Batch Splitting & Expiry Horizons]
Week  9 - 10 [Sprint 5: 2-Second Sales Invoicing, Dual GST Engine & Scheme Matrix]
Week 11 - 12 [Sprint 6: Customer Ledgers, Executive Dashboard, Audit & Hardening]
```

---

## 2. Sprint 1: Multi-Tenancy Core, RBAC & Security Foundation

### Story 1.1: Multi-Tenant Data Isolation & Query Interception
- **As an** Enterprise Platform Architect
- **I want** all Entity Framework Core database operations to automatically enforce tenant scoping based on the JWT token
- **So that** no tenant can ever read, update, or corrupt another tenant's pharmaceutical or financial records.
- **Story Points**: `8`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Tenant Isolation on Record Fetch
    Given an authenticated API request with JWT claim "tenant_id: 11111111-1111-1111-1111-111111111111"
    When the query "DbContext.Products.ToListAsync()" is executed
    Then the generated SQL MUST contain "WHERE TenantId = '11111111-1111-1111-1111-111111111111'"
    And zero records belonging to Tenant 22222222-2222-2222-2222-222222222222 are returned.

  Scenario: Tenant Scope on Entity Insert
    Given a new Product entity instantiated without an explicit TenantId
    When "DbContext.SaveChangesAsync()" is invoked in the context of Tenant 11111111-1111-1111-1111-111111111111
    Then the entity's TenantId property is automatically populated with "11111111-1111-1111-1111-111111111111".
  ```

---

## 3. Sprint 2: Pharma Master Catalog & Regulatory Validation

### Story 2.1: Drug Schedule Classification & Cold Chain Attributes
- **As a** Compliance Officer / Catalog Manager
- **I want** every SKU defined in the product master to capture Schedule Classification (H, H1, X, G) and Storage Requirements (Cold Chain 2-8°C)
- **So that** subsequent sales and warehouse operations enforce statutory safety rules.
- **Story Points**: `5`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Validating Schedule H1 Antibiotic Registration
    Given a user creating a new product "Meropenem 1g Injection"
    When the user submits the form with ScheduleClass = "H1" and StorageCondition = "Cold Chain (2-8°C)"
    Then the product is saved successfully with HSNCode "30049099" and GSTPercentage 12.00
    And the product is flagged as requiring customer drug license verification during invoicing.
  ```

### Story 2.2: Customer Registration with Drug License Expiry Verification
- **As a** Billing Supervisor
- **I want** the system to validate the customer's Drug License 20B/21B expiry date
- **So that** the company does not violate CDSCO drug distribution laws by supplying unlicensed chemists.
- **Story Points**: `5`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Attempting to bill a customer with expired Drug License
    Given Customer "Apollo Pharmacy - Alandur" has a Drug License expiring on "2026-08-31"
    And the current system date is "2026-09-28"
    When the billing executive attempts to create a Sales Invoice for this customer
    Then the invoice generation is BLOCKED with error "DRUG_LICENSE_EXPIRED"
    And an administrative override prompt requires Manager PIN approval.
  ```

---

## 4. Sprint 3: Procurement & Inward GRN Batch Ingestion

### Story 3.1: Physical GRN Processing with Expiry Verification
- **As a** Warehouse Goods Receipt Clerk
- **I want** to record incoming supplier shipments with mandatory Batch Number, Manufacturing Date, and Expiry Date
- **So that** new physical batches are registered in the batch ledger and inventory balances are incremented.
- **Story Points**: `8`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Ingesting valid medicine batches from Supplier Invoice
    Given a verified Supplier "Sun Pharma Ltd"
    When the clerk enters GRN for Product "Pan 40mg" with Batch "AUG-PAN40-102", MFG "2026-08-01", EXP "2028-07-31", Qty = 500, Free = 50
    Then a new record is created in T_Batches with location "Z1-R02-S03-B01"
    And T_Inventory_Balances.QuantityAvailable increases by 550
    And Supplier current payable balance increases by the invoice net payable amount.

  Scenario: Rejecting invalid batch dates
    When the clerk enters a batch with ExpiryDate "2026-05-01" and ManufacturingDate "2026-08-01"
    Then the system rejects the line with error "EXPIRY_CANNOT_PRECEDE_MFG".
  ```

---

## 5. Sprint 4: FEFO Engine, Batch Splitting & Expiry Horizons

### Story 4.1: FEFO Auto-Allocation & Split Batch Resolution
- **As a** Billing Executive
- **I want** the system to automatically allocate inventory from the earliest expiring batch and split quantities when necessary
- **So that** customer orders are fulfilled with fresh stock without manual batch hunting.
- **Story Points**: `8`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Split allocation across two sequential batches
    Given Product "Amoxicillin 500mg" has two batches:
      | BatchNumber | ExpiryDate | Available |
      | BATCH-A     | 2026-12-31 | 40        |
      | BATCH-B     | 2027-06-30 | 100       |
    When an order is placed for 100 units of "Amoxicillin 500mg"
    Then the FEFO engine creates two allocation lines:
      | Allocation Line | Batch   | Quantity |
      | Line 1a         | BATCH-A | 40       |
      | Line 1b         | BATCH-B | 60       |
    And the UI displays an amber badge indicating a split batch allocation.

  Scenario: Near-Expiry 60-day exclusion
    Given a batch "BATCH-C" with ExpiryDate in 45 days
    When the FEFO engine evaluates stock for a sales order
    Then BATCH-C is excluded from allocation and marked as "Supplier Return Candidate".
  ```

---

## 6. Sprint 5: 2-Second Sales Invoicing, Dual GST & Schemes

### Story 5.1: 2-Second Checkout SLA with Redis RedLock
- **As a** Sales Billing Executive
- **I want** invoice confirmation to commit in under 2 seconds even under high counter concurrency
- **So that** counter billing has zero customer queue bottlenecks.
- **Story Points**: `13`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: High-concurrency checkout execution
    Given 200 concurrent active billing counter sessions
    When an executive clicks "Save & Generate Invoice"
    Then the API acquires Redis distributed locks on the allocated batches
    And executes the PostgreSQL atomic transaction
    And returns HTTP 201 Created with invoice number in <= 2000 milliseconds (p95 <= 500ms).
  ```

### Story 5.2: Indian Dual GST Calculation (Intra-State vs Inter-State)
- **As an** Accounts Manager
- **I want** GST automatically apportioned into CGST/SGST or IGST based on the customer's state code
- **So that** our monthly GSTR-1 and GSTR-3B filings are 100% compliant.
- **Story Points**: `5`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Intra-state invoice in Tamil Nadu (State Code 33)
    Given Distributor branch state code is "33"
    And Customer "Apollo Pharmacy" state code is "33"
    When an invoice is generated with Taxable Value ₹10,000 and GST Rate 12%
    Then CGST is calculated as ₹600.00 (6.00%)
    And SGST is calculated as ₹600.00 (6.00%)
    And IGST is ₹0.00.

  Scenario: Inter-state invoice to Karnataka (State Code 29)
    Given Distributor branch state code is "33"
    And Customer "Manipal Hospital" state code is "29"
    When an invoice is generated with Taxable Value ₹10,000 and GST Rate 12%
    Then IGST is calculated as ₹1,200.00 (12.00%)
    And CGST is ₹0.00 and SGST is ₹0.00.
  ```

### Story 5.3: Pharma Scheme Matrix ("Buy 10 Get 1" + Rebates)
- **As a** Marketing / Sales Coordinator
- **I want** volumetric free goods and financial discounts applied automatically to sales lines
- **So that** billing staff don't have to calculate manufacturer schemes manually.
- **Story Points**: `8`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Applying "Buy 10 Get 1" Volumetric Scheme
    Given an active scheme for "Pan 40mg" configured as "Min 10, Free 1"
    When the customer orders 35 strips of "Pan 40mg"
    Then the system bills 35 strips at PTR
    And automatically adds 3 free strips (Floor(35/10) * 1)
    And total inventory deducted from the batch is 38 strips.
  ```

---

## 7. Sprint 6: Ledgers, Dashboard & Hardening

### Story 6.1: Real-Time Executive Dashboard & Expiry Alerts
- **As a** Stockist Owner
- **I want** a unified business dashboard showing Today's Sales, Inventory Asset Value, Overdue Receivables, and Near-Expiry Risk
- **So that** I have immediate situational awareness of my cash flow and operational risk.
- **Story Points**: `8`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Loading executive dashboard
    Given an authenticated Owner session
    When the Owner opens "/dashboard"
    Then the page loads within 3.0 seconds
    And displays the 4 core metric cards (Sales, Inventory, Receivables, Expiry)
    And lists top under-stocked items and live operational picking queues.
  ```

### Story 6.2: Immutable Regulatory Audit Trail
- **As a** Chief Information Security Officer (CISO) / Drug Inspector
- **I want** every state mutation (invoice creation, cancellation, credit limit change) logged in an append-only table
- **So that** transactional data cannot be repudiated or tampered with.
- **Story Points**: `5`
- **Acceptance Criteria**:
  ```gherkin
  Scenario: Attempting to delete an audit record
    Given a logged record in T_Audit_Logs
    When any database user executes "DELETE FROM T_Audit_Logs WHERE AuditLogId = 1"
    Then the PostgreSQL trigger blocks the query with exception "Audit records are strictly immutable".
  ```
