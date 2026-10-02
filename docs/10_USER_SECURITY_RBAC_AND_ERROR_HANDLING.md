# User Security, RBAC, Error Boundaries & Exception Architecture
## PharmaGrid™ Cloud Distribution ERP (Security & Resilience Specification)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Security & Error Governance) |
| **Security Standard** | OWASP Top 10 (2025), ISO 27001, Indian DPDP Act 2023 |
| **Statutory Mandate** | CDSCO Drugs & Cosmetics Rules 1945, 21 CFR Part 11 Electronic Records |
| **Authentication Core**| HMAC-SHA256 Signed JSON Web Tokens (JWT) with Sliding Window Refresh |
| **Error Handling Protocol**| RFC 7807 Problem Details for HTTP APIs + React 19 Error Boundaries |

---

## 1. Authentication Architecture & Token Governance

### 1.1 JSON Web Token (JWT) Schema
Authentication is stateless and secured using HMAC-SHA256 (or RS256 in high-assurance multi-region setups). Tokens encode tenant context, branch scoping, user role, and statutory CDSCO pharmacist qualifications:

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
.
{
  "sub": "u-4a42b10a-1123-4c8d-b3b0-2b123d456789",
  "name": "Karthik Raja, B.Pharm",
  "email": "karthik.r@pharmagrid.cloud",
  "role": "RegisteredPharmacist",
  "tenant_id": "11111111-1111-1111-1111-111111111111",
  "branch_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  "pharmacist_reg_no": "TN-PC-48912-A",
  "max_discount_cap": "10.00",
  "iat": 1790580000,
  "exp": 1790580900,
  "iss": "https://api.pharmagrid.cloud",
  "aud": "https://app.pharmagrid.cloud"
}
```

### 1.2 Session Lifecycle & Sliding Window
- **Access Token Validity**: 15 minutes (`exp = iat + 900s`).
- **Refresh Token Lifecycle**: 7 days, persisted in encrypted HTTP-only, SameSite=Strict cookies.
- **Sliding Window Rotation**: Upon each refresh token exchange, the old refresh token is cryptographically invalidated and replaced with a single-use nonce.
- **Session Revocation**: A tenant administrator can immediately invalidate all active sessions for a compromised user ID by updating the `User.SecurityStamp` in PostgreSQL, causing immediate rejection on the next API call.

---

## 2. Role-Based Access Control (RBAC) Matrix

PharmaGrid enforces granular role separation across six enterprise personas to maintain statutory compliance and prevent unauthorized discounting:

### 2.1 Personas Definition
1. **Super Admin**: Enterprise owner, tenant provisioning, system configurations.
2. **Depot Manager**: Branch general manager, credit override authority, route dispatch approvals.
3. **Billing Cashier**: Counter sales, customer receipt punching, cash settlement.
4. **Registered Pharmacist**: CDSCO statutory signatory, Schedule X verification, batch release, breakage write-off.
5. **Warehouse Dispatcher**: Inward GRN receipt, pallet put-away, delivery challans, van trip sheets.
6. **Accountant**: Financial ledger reconciliation, GST return exports, monthly payroll execution.

### 2.2 Granular Permissions Matrix

| ERP Module | Privilege Action | Super Admin | Depot Manager | Billing Cashier | Reg. Pharmacist | Warehouse Dispatcher | Accountant |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Rapid Billing** | Create / Commit Bill | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Apply Standard Scheme | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | Override Cash Discount ($> 5\%$) | ✅ | ✅ | ❌ (Blocked) | ❌ | ❌ | ❌ |
| | Cancel Finalized Bill | ✅ | ✅ | ❌ (Blocked) | ❌ | ❌ | ❌ |
| **CDSCO Schedules** | Dispense Schedule H / H1 | ✅ | ✅ | ✅ (Auto-logged)| ✅ (Signatory) | ❌ | ❌ |
| | Authorize Schedule X (Narcotics)| ✅ | ❌ | ❌ (Blocked) | ✅ (Mandatory) | ❌ | ❌ |
| **Procurement & GRN** | Ingest Vendor Inward GRN | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| | Approve Vendor Invoice Payment| ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Stock & Adjustments**| View Physical Bins / Stock | ✅ | ✅ | ✅ (Read-only) | ✅ | ✅ | ✅ (Read-only)|
| | Breakage / Leakage Write-off | ✅ | ✅ | ❌ (Blocked) | ✅ (Mandatory) | ❌ | ❌ |
| **Logistics & Dispatch**| Create Route Trip Sheet | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| | Update POD & COD Collection | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| **Stakeholder CRM** | Override Chemist Credit Limit | ✅ | ✅ (Signed) | ❌ (Hard Stop) | ❌ | ❌ | ❌ |
| | Register Chemist Drug License | ✅ | ✅ | ❌ | ✅ (Verified) | ❌ | ❌ |
| **Payroll & HR** | Run Monthly Salary Disbursal | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Audit Logs** | View 21 CFR Part 11 Audit Trail| ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| | Modify / Delete Audit Log | ⛔ Prohibited | ⛔ Prohibited | ⛔ Prohibited | ⛔ Prohibited | ⛔ Prohibited | ⛔ Prohibited |

---

## 3. Statutory CDSCO Security Controls

### 3.1 Registered Pharmacist Verification
- Every wholesale distributor operating under Indian Drug License Forms 20B/21B must have a registered pharmacist on record.
- In PharmaGrid, high-risk actions (authorizing Schedule X shipments, writing off damaged ampoules, updating SKU generic molecules) require entering the pharmacist's State Pharmacy Council Registration Number (`pharmacist_reg_no`).

### 3.2 Automated Drug License Gatekeeper
Before any sales invoice is committed, the backend executes an automatic check against the customer's Drug License record:
- **Case 1: License Valid ($\ge 30$ days remaining)** $\rightarrow$ Transaction proceeds unimpeded.
- **Case 2: License Expiring within 30 days** $\rightarrow$ Soft warning tag displayed on invoice header: `"⚠️ Customer DL expires in 12 days. Renewal mandatory before Nov 1."`
- **Case 3: License Expired** $\rightarrow$ **HARD BLOCK**. System raises `DrugLicenseExpiredException` and rejects the HTTP request with status `400 Bad Request`. No billing operator can bypass this constraint.

---

## 4. Frontend Error Boundaries & Resilience (Next.js 14 / React 19)

### 4.1 React Error Boundary Hierarchy
To guarantee zero lost bills during high-velocity counter operations, PharmaGrid isolates runtime exceptions:

```
[Root Error Boundary: app/error.tsx] ── Captures fatal global crashes & displays enterprise recovery screen
       │
       ├── [Header & Navigation Boundary] ── Keeps top brand header and server latency ticker online
       │
       └── [Module View Error Boundary] ── Isolates individual operational views
              │
              ├── [RapidBillingWorkspace Error Boundary]
              │      ├── Prevents entire table unmounting on malformed SKU data
              │      ├── Retains dirty order lines in local indexed state
              │      └── Displays "Recover Active Order" recovery pill
              │
              └── [ExecutiveDashboardView Error Boundary]
                     └── Displays fallback skeleton KPI cards without crashing the page
```

### 4.2 Crash-Proof Data Grid & Local Draft Caching
- **Numeric Sanitization**: All arithmetic operations on user input use safe fallback functions:
  ```typescript
  export const safeNumber = (val: any, fallback = 0): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
  };
  ```
- **Local Draft Caching**: The rapid billing workspace continuously syncs uncommitted line items into `sessionStorage`. If the billing clerk accidentally refreshes the browser, the workspace instantly restores the customer, selected batches, and quantities with zero data loss.

---

## 5. Backend Error Handling & RFC 7807 Architecture

### 5.1 Global Exception Handling Middleware
The .NET 9 Web API intercepts all unhandled errors via custom middleware:
```csharp
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = exceptionHandlerPathFeature?.Error;

        var problemDetails = exception switch
        {
            DrugLicenseExpiredException ex => new ProblemDetails
            {
                Type = "https://pharmagrid.cloud/errors/cdsco-license-expired",
                Title = "CDSCO Compliance Block: Drug License Expired",
                Status = StatusCodes.Status400BadRequest,
                Detail = ex.Message,
                Instance = context.Request.Path
            },
            InsufficientStockException ex => new ProblemDetails
            {
                Type = "https://pharmagrid.cloud/errors/insufficient-stock",
                Title = "Stock Allocation Conflict",
                Status = StatusCodes.Status409Conflict,
                Detail = ex.Message,
                Instance = context.Request.Path
            },
            CreditLimitExceededException ex => new ProblemDetails
            {
                Type = "https://pharmagrid.cloud/errors/credit-limit-exceeded",
                Title = "Chemist Credit Limit Breach",
                Status = StatusCodes.Status400BadRequest,
                Detail = ex.Message,
                Instance = context.Request.Path
            },
            _ => new ProblemDetails
            {
                Type = "https://pharmagrid.cloud/errors/internal-server-error",
                Title = "An unexpected error occurred",
                Status = StatusCodes.Status500InternalServerError,
                Detail = "An unexpected technical fault occurred. Reference trace ID for IT support.",
                Instance = context.Request.Path
            }
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;
        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = problemDetails.Status ?? 500;
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});
```

### 5.2 Standard Error Taxonomy & Status Code Catalog

| Error Code | HTTP Status | Description & User Remediation |
| :--- | :---: | :--- |
| `ERR_CDSCO_LICENSE_EXPIRED` | `400` | Chemist Form 20B/21B expired. Remediation: Collect renewed license certificate and update CRM. |
| `ERR_CREDIT_LIMIT_EXCEEDED` | `400` | Customer outstanding balance exceeds approved credit ceiling. Remediation: Collect payment or obtain Depot Manager override. |
| `ERR_INSUFFICIENT_STOCK` | `409` | Requested quantity exceeds unreserved batch balance. Remediation: Re-run FEFO allocation or select alternate batch. |
| `ERR_CONCURRENCY_CONFLICT` | `409` | Another cashier invoiced the same batch concurrently. Remediation: System auto-refreshes live stock. |
| `ERR_UNAUTHORIZED_DISCOUNT` | `403` | Cashier inputted discount exceeding their authorized role cap. Remediation: Manager approval required. |
| `ERR_INVALID_BATCH_DATES` | `400` | Inward GRN expiry date is earlier than manufacturing date. Remediation: Verify physical carton markings. |
