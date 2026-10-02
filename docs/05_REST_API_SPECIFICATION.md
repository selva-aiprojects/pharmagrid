# REST API Contract Specification & Integration Guide
## PharmaGrid™ Cloud Distribution ERP (.NET 9 Web API)

| Attribute | Specification Details |
| :--- | :--- |
| **API Version** | `v1.0.0` (Production Release) |
| **Base URL (Local)** | `http://127.0.0.1:5050/api/v1` |
| **Base URL (Production)** | `https://api.pharmagrid.cloud/api/v1` |
| **Authentication** | Bearer Token via Header `Authorization: Bearer <JWT>` (HMAC-SHA256) |
| **Multi-Tenancy** | Header `X-Tenant-Id: <UUID>` (or inferred from JWT claim `tenant_id`) |
| **Data Format** | JSON (`Content-Type: application/json; charset=utf-8`) |
| **Error Handling Standard** | RFC 7807 Problem Details (`application/problem+json`) |
| **Swagger / OpenAPI** | `/swagger/v1/swagger.json` |

---

## 1. Global Request Standards & Error Protocol

### 1.1 Mandatory HTTP Headers
Every request to PharmaGrid APIs (except public auth login) must include:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Tenant-Id: 11111111-1111-1111-1111-111111111111
Content-Type: application/json
Accept: application/json
```

### 1.2 RFC 7807 Problem Details Specification
When an error occurs (such as a regulatory block, insufficient stock, or credit limit breach), PharmaGrid returns an RFC 7807 compliant problem details object:

```json
{
  "type": "https://pharmagrid.cloud/errors/cdsco-license-expired",
  "title": "Statutory Drug License Expired",
  "status": 400,
  "detail": "Billing blocked: Customer 'MedPlus Pharmacy - Anna Nagar' has an expired Form 20B/21B Drug License (expired on 2026-06-30). Under CDSCO Rules, sales to uncertified chemists are strictly prohibited.",
  "instance": "/api/v1/sales/invoices",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00",
  "extensions": {
    "customerId": "88888888-8888-8888-8888-888888888888",
    "licenseNo": "TN-CHE-20B-98745",
    "expiredDaysAgo": 94
  }
}
```

### 1.3 Common HTTP Status Codes
| Status Code | Reason | Meaning in PharmaGrid |
| :--- | :--- | :--- |
| `200 OK` | Success | Query executed, returns entity or list. |
| `201 Created` | Resource Created | Invoice, Order, Product, or Batch successfully committed. |
| `400 Bad Request` | Validation / CDSCO Block | Expired Drug License, negative stock requested, or malformed data. |
| `401 Unauthorized` | Missing / Invalid Token | JWT expired, invalid signature, or missing `Authorization` header. |
| `403 Forbidden` | RBAC Insufficient Privileges| Operator lacks role permissions (e.g., cashier creating a user). |
| `404 Not Found` | Resource Absent | Product, Batch, or Customer ID does not exist in tenant partition. |
| `409 Conflict` | Concurrency Lock | Stock allocation conflict (concurrent checkout race condition). |
| `500 Server Error` | Unhandled Error | Caught by Global Exception Middleware; sanitized trace ID logged. |

---

## 2. Authentication & Identity Endpoints (`/api/v1/auth`)

### 2.1 Authenticate User & Issue JWT
- **Route**: `POST /api/v1/auth/login`
- **Description**: Verifies terminal credentials, validates CDSCO Pharmacist registration if applicable, and generates signed HMAC-SHA256 JWT with tenant and role claims.
- **Request Body**:
```json
{
  "username": "admin@pharmagrid.com",
  "password": "Password123!",
  "terminalId": "TERM-POS-01"
}
```
- **Response Body (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2026-10-02T20:51:00Z",
  "user": {
    "id": "11111111-2222-3333-4444-555555555555",
    "name": "Karthik Raja",
    "email": "karthik.r@pharmagrid.com",
    "role": "SuperAdmin",
    "tenantId": "11111111-1111-1111-1111-111111111111",
    "branchId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    "pharmacistRegistrationNumber": "TN-PC-48912-A"
  }
}
```

### 2.2 Switch User Persona (Testing / Multi-Role)
- **Route**: `POST /api/v1/auth/switch-persona`
- **Request Body**:
```json
{
  "targetRole": "BillingCashier"
}
```
- **Response Body (`200 OK`)**: Returns updated JWT scoped to requested persona with role-based permissions.

---

## 3. High-Velocity Sales & Invoicing (`/api/v1/sales`)

### 3.1 Commit Sales Invoice (Atomic Checkout $\le 2.0$s SLA)
- **Route**: `POST /api/v1/sales/invoices`
- **Description**: Commits an atomic sales invoice in 2ms - 150ms. Performs:
  1. CDSCO Form 20B/21B validity check on customer (hard-stop if expired).
  2. Customer Credit Limit verification.
  3. Batch deduction with optimistic concurrency lock.
  4. Dual Indian GST resolution (CGST+SGST for Intra-state vs IGST for Inter-state).
  5. 64-character Government NIC E-Invoice IRN hash generation.
  6. Customer ledger balance debit and immutable regulatory audit log insertion.
- **Request Body**:
```json
{
  "customerId": "88888888-8888-8888-8888-888888888881",
  "branchId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "invoiceMode": "CREDIT",
  "customerStateCode": "33",
  "items": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "batchId": "651f8a20-3b41-482a-a53f-4e09d1234abc",
      "quantityBilled": 20,
      "quantityFree": 2,
      "unitPricePTR": 42.50,
      "mrp": 75.00,
      "discountPercentage": 5.00,
      "gstPercentage": 12.00,
      "hsnCode": "30049099"
    }
  ]
}
```
- **Response Body (`201 Created`)**:
```json
{
  "invoiceId": "f7c9e012-789a-4bc1-9012-def345678901",
  "invoiceNumber": "INV-2026-00412",
  "invoiceDate": "2026-10-02T12:51:30Z",
  "customerName": "Apollo Pharmacy - T. Nagar",
  "totalGrossAmount": 850.00,
  "totalTradeDiscountAmount": 42.50,
  "totalTaxableAmount": 807.50,
  "totalCgstAmount": 48.45,
  "totalSgstAmount": 48.45,
  "totalIgstAmount": 0.00,
  "roundOffAmount": -0.40,
  "netPayableAmount": 904.00,
  "irnHash": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
  "executionDurationMs": 18
}
```

### 3.2 Get Invoice Print Details (Rule 46 A4 / Thermal ESC-POS)
- **Route**: `GET /api/v1/sales/invoices/{id}/details`
- **Description**: Returns itemized breakdown, Dual GST tax slabs, CDSCO Section 18 declaration text, bank details, and Indian Rupee word translation for printing.

---

## 4. Upstream Procurement & Inward GRN (`/api/v1/purchases`)

### 4.1 Inward Goods Receipt Note (GRN) Ingestion
- **Route**: `POST /api/v1/purchases/invoices`
- **Description**: Ingests incoming shipment from manufacturer/C&F. Validates CDSCO condition `ExpiryDate > ManufacturingDate`. Creates new physical batches and increments `QuantityAvailable`.
- **Request Body**:
```json
{
  "supplierId": "99999999-9999-9999-9999-999999999999",
  "supplierInvoiceNo": "ALKM-CHN-8921",
  "supplierInvoiceDate": "2026-10-01",
  "warehouseId": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "items": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "batchNumber": "OCT-PAN40-104",
      "manufacturingDate": "2026-10-01",
      "expiryDate": "2028-09-30",
      "purchaseRate": 38.00,
      "mrp": 75.00,
      "ptr": 42.50,
      "quantityReceived": 1000,
      "quantityBonus": 100,
      "rackLocation": "Z1-R02-S03-B04"
    }
  ]
}
```
- **Response Body (`201 Created`)**: Returns inward GRN receipt confirmation with updated warehouse inventory balances.

---

## 5. Orders Lifecycle & Indenting (`/api/v1/orders`)

### 5.1 Purchase Orders & Conversion
- `GET /api/v1/orders/purchase`: List open, partially received, and closed supplier POs.
- `POST /api/v1/orders/purchase`: Create purchase indent with manufacturer scheme terms.
- `POST /api/v1/orders/purchase/{id}/convert-to-grn`: 1-Click conversion of approved PO into inward GRN draft.

### 5.2 Customer Sales Pre-Orders & Field Booking
- `GET /api/v1/orders/sales`: List pre-orders punched by sales reps or retail portal.
- `POST /api/v1/orders/sales`: Punch bulk booking order.
- `POST /api/v1/orders/sales/{id}/convert-to-invoice`: Seamlessly converts sales order to active billing invoice with FEFO batch allocation.

---

## 6. Logistics, Delivery Challans & Dispatch (`/api/v1/logistics`)

### 6.1 Dispatch Manifests & Delivery Challans
- `GET /api/v1/logistics/challans`: Query delivery challans by status (`Pending`, `InTransit`, `Delivered`).
- `POST /api/v1/logistics/challans`: Generate delivery challan and route picking slip.
- `PUT /api/v1/logistics/challans/{id}/status`: Update transit status, record COD cash/UPI payment collection, and capture electronic Proof of Delivery (POD) signature.

### 6.2 Van Route Trip Sheets
- `GET /api/v1/logistics/tripsheets`: Consolidated route manifest for delivery vehicles (driver assignment, total carton count, scheduled stops).

---

## 7. Unified Stock Master & Physical Adjustments (`/api/v1/stockmaster`)

### 7.1 Consolidated Stock Balance
- `GET /api/v1/stockmaster/summary`: Real-time stock audit across Physical, Book, Allocated, Damaged, and Quarantined balances per SKU and batch.

### 7.2 Physical Stock Adjustments & Breakage Write-Off
- `POST /api/v1/stockmaster/adjustments`: Records physical audit variance, CDSCO Form 20B breakage write-offs, or hairline ampoule leakage under registered pharmacist supervision.

---

## 8. Algorithmic Demand Forecasting & Stockout Radar (`/api/v1/demandforecast`)

### 8.1 30-Day Sales Run Rate & Stockout Horizon
- `GET /api/v1/demandforecast/summary`: Computes:
  - 30-day velocity / daily run-rate
  - Days of Inventory Remaining ($\text{DOI} = \frac{\text{CurrentStock}}{\text{DailyRunRate}}$)
  - Risk classification: `CRITICAL_STOCKOUT` ($\text{DOI} \le 7\text{d}$), `REORDER_RECOMMENDED` ($\text{DOI} \le 15\text{d}$), `HEALTHY` ($\text{DOI} > 15\text{d}$).

### 8.2 1-Click Automated PO Generation
- `POST /api/v1/demandforecast/generate-po`: Auto-populates supplier PO quantities based on EOQ (Economic Order Quantity) formulas to prevent stockouts.

---

## 9. Staff & RBAC Administration (`/api/v1/users`)

- `GET /api/v1/users`: List organization employees with roles, terminal assignments, and CDSCO registration numbers.
- `POST /api/v1/users`: Register new staff member with role and max billing discount permissions.
- `PUT /api/v1/users/{id}/status`: Activate or suspend user account.
- `POST /api/v1/users/{id}/reset-password`: Administrator-initiated credential reset.

---

## 10. Human Capital & Statutory Payroll (`/api/v1/payroll`)

- `GET /api/v1/payroll/summary`: Monthly payroll summary with Gross, PF (12%), ESI (0.75%), Professional Tax, and Net Disbursals.
- `GET /api/v1/payroll/slips/{id}`: Generates printable statutory salary certificate with earnings and deduction breakdown.

---

## 11. Regulatory Compliance & Audit Logs (`/api/v1/auditlogs`)

- `GET /api/v1/auditlogs`: 21 CFR Part 11 compliant tamper-evident audit trail with IP address, user ID, delta payload, and CDSCO compliance flags.
