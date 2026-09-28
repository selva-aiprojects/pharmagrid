# REST API Contract Specification
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **API Version** | `v1.0` |
| **Base URL** | `https://api.pharmaflow.cybelinx.com/api/v1` |
| **Standard Authentication** | JWT Bearer Token via Header `Authorization: Bearer <token>` |
| **Tenant Routing Header** | `X-Tenant-Id: <UUID>` (or resolved from JWT claim `tenant_id`) |
| **Data Format** | Standard JSON (`application/json; charset=utf-8`) |
| **Error Handling Standard** | RFC 7807 Problem Details for HTTP APIs |

---

## 1. Global Request & Response Standards

### 1.1 Mandatory Headers
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
X-Tenant-Id: b3cf8912-3490-410a-8bf7-df84918e4732
Content-Type: application/json
Accept: application/json
```

### 1.2 Standard RFC 7807 Error Response
```json
{
  "type": "https://errors.pharmaflow.com/insufficient-stock",
  "title": "Insufficient Stock Allocation Conflict",
  "status": 409,
  "detail": "Batch AUG-PAN40-102 has only 35 units available. Requested 50 units.",
  "instance": "/api/v1/sales/invoices",
  "traceId": "00-84a1e94b281cf7198e3b-d102",
  "errors": {
    "QuantityBilled": ["Requested quantity exceeds available batch balance."]
  }
}
```

---

## 2. Inventory & Batch Verification Endpoints

### 2.1 Get Product Stock Breakdown
- **Method & Route**: `GET /api/v1/inventory/products/{productId}/stock`
- **Description**: Returns consolidated stock and individual batch balances with expiry and rack locations across all warehouses.

#### Response Body (`200 OK`)
```json
{
  "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
  "productName": "Pan 40mg Injection",
  "totalAvailableQuantity": 4250,
  "warehouseBreakdown": [
    {
      "warehouseId": "b3cf8912-3490-410a-8bf7-df84918e4732",
      "warehouseName": "Main Chennai Depot",
      "batches": [
        {
          "batchId": "651f8a20-3b41-482a-a53f-4e09d1234abc",
          "batchNumber": "AUG-PAN40-102",
          "manufacturingDate": "2026-08-01",
          "expiryDate": "2028-07-31",
          "mrp": 75.00,
          "ptr": 42.50,
          "availableQty": 550,
          "rackLocation": "Z1-R02-S03-B01"
        },
        {
          "batchId": "7e2a9b31-4c52-493b-b64e-5f10e2345bcd",
          "batchNumber": "SEP-PAN40-103",
          "manufacturingDate": "2026-09-01",
          "expiryDate": "2028-08-31",
          "mrp": 75.00,
          "ptr": 42.50,
          "availableQty": 3700,
          "rackLocation": "Z1-R02-S03-B02"
        }
      ]
    }
  ]
}
```

### 2.2 Preview FEFO Allocation (Pre-Billing)
- **Method & Route**: `POST /api/v1/inventory/allocate-preview`
- **Description**: Simulates FEFO allocation for ordered SKUs without reserving stock. Identifies split batch allocations in advance.

#### Request Body
```json
{
  "warehouseId": "b3cf8912-3490-410a-8bf7-df84918e4732",
  "items": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "requestedQuantity": 600
    }
  ]
}
```

#### Response Body (`200 OK`)
```json
{
  "allocations": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "requestedQuantity": 600,
      "isSplitAllocation": true,
      "splitCount": 2,
      "batchesAllocated": [
        {
          "batchId": "651f8a20-3b41-482a-a53f-4e09d1234abc",
          "batchNumber": "AUG-PAN40-102",
          "expiryDate": "2028-07-31",
          "allocatedQuantity": 550,
          "locationRackBin": "Z1-R02-S03-B01"
        },
        {
          "batchId": "7e2a9b31-4c52-493b-b64e-5f10e2345bcd",
          "batchNumber": "SEP-PAN40-103",
          "expiryDate": "2028-08-31",
          "allocatedQuantity": 50,
          "locationRackBin": "Z1-R02-S03-B02"
        }
      ]
    }
  ]
}
```

---

## 3. Procurement & Goods Receipt (GRN) Inbound Endpoints

### 3.1 Inbound Purchase Entry & Batch Ingestion
- **Method & Route**: `POST /api/v1/purchases/invoices`
- **Description**: Records physical inward goods receipt, registers new batch entities with manufacturing/expiry dates, increments physical inventory balances, and generates supplier payables ledger entry.

#### Request Body
```json
{
  "supplierId": "8f828a2b-dc74-4b51-8975-d16ba6ec89d8",
  "supplierInvoiceNumber": "INV-2026-9874",
  "invoiceDate": "2026-09-28T00:00:00Z",
  "warehouseId": "b3cf8912-3490-410a-8bf7-df84918e4732",
  "lineItems": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "batchNumber": "AUG-PAN40-102",
      "manufacturingDate": "2026-08-01",
      "expiryDate": "2028-07-31",
      "quantityReceived": 500,
      "freeQuantityReceived": 50,
      "purchaseRate": 42.50,
      "mrp": 75.00,
      "hsnCode": "30049099",
      "gstPercentage": 12.00,
      "putAwayLocationRackBin": "Z1-R02-S03-B01"
    }
  ]
}
```

#### Response Body (`201 Created`)
```json
{
  "purchaseInvoiceId": "c4df19ab-8732-411a-bf41-cd83921b47ff",
  "grnNumber": "GRN-2026-00481",
  "status": "Processed",
  "totalGrossAmount": 21250.00,
  "totalGstAmount": 2550.00,
  "netPayableAmount": 23800.00,
  "batchesCreated": 1,
  "inventoryUpdated": true,
  "systemTimestamp": "2026-09-28T12:08:00Z"
}
```

---

## 4. High-Velocity Sales Billing Execution Endpoints

### 4.1 Create & Commit Sales Invoice (Sub-2-Second Checkout)
- **Method & Route**: `POST /api/v1/sales/invoices`
- **Description**: Atomic transactional sales invoice execution. Locks stock, verifies balances, writes sales and customer ledgers, enqueues async E-Invoice and PDF tasks.

#### Request Body
```json
{
  "branchId": "e1f18a20-3b41-482a-a53f-4e09d1234001",
  "customerId": "7a328a2b-dc74-4b51-8975-d16ba6ec8911",
  "invoiceMode": "CREDIT",
  "lineItems": [
    {
      "productId": "4a42b10a-1123-4c8d-b3b0-2b123d456789",
      "batchId": "651f8a20-3b41-482a-a53f-4e09d1234abc",
      "quantityBilled": 100,
      "unitPricePtr": 38.00,
      "tradeDiscountPercentage": 5.00
    }
  ]
}
```

#### Response Body (`201 Created`)
```json
{
  "invoiceId": "9b12a84e-53c1-4f92-a1b7-cd348123ef90",
  "invoiceNumber": "INV-2026-08942",
  "invoiceDate": "2026-09-28T12:15:30Z",
  "customerId": "7a328a2b-dc74-4b51-8975-d16ba6ec8911",
  "totalGrossAmount": 3800.00,
  "totalTradeDiscountAmount": 190.00,
  "totalSchemeDiscountAmount": 0.00,
  "totalTaxableAmount": 3610.00,
  "totalCgstAmount": 216.60,
  "totalSgstAmount": 216.60,
  "totalIgstAmount": 0.00,
  "roundOffAmount": -0.20,
  "netPayableAmount": 4043.00,
  "customerNewOutstandingBalance": 54043.00,
  "einvoiceQueued": true,
  "pdfDownloadUrl": "/api/v1/sales/invoices/9b12a84e-53c1-4f92-a1b7-cd348123ef90/pdf",
  "executionDurationMs": 142
}
```

---

## 5. Executive Dashboard Aggregates

### 5.1 Real-Time Business & Risk KPI Summary
- **Method & Route**: `GET /api/v1/dashboard/summary`
- **Description**: Returns pre-computed and Redis-cached enterprise metrics, operational queues, and risk alerts. Target latency: $< 250\text{ ms}$.

#### Response Body (`200 OK`)
```json
{
  "branchId": "e1f18a20-3b41-482a-a53f-4e09d1234001",
  "branchName": "Main Chennai Depot",
  "timestamp": "2026-09-28T12:15:00Z",
  "financialKpis": {
    "todaysSalesValue": 842500.00,
    "salesGrowthVsYesterdayPct": 14.0,
    "inventoryAssetValue": 14250000.00,
    "totalInventoryUnits": 84200,
    "overdueReceivables": 1240000.00,
    "receivablesOverdueCustomerCount": 17
  },
  "expiryRiskKpis": {
    "critical0To30DaysValue": 85000.00,
    "warning31To60DaysValue": 195000.00,
    "promo61To90DaysValue": 200000.00,
    "totalNearExpiryValue": 480000.00
  },
  "lowStockAlerts": [
    {
      "productId": "1a2b3c4d-0001-4c8d-b3b0-2b123d456789",
      "productName": "Paracetamol 650mg",
      "currentAvailableUnits": 12,
      "reorderLevel": 50,
      "uom": "Strips"
    },
    {
      "productId": "1a2b3c4d-0002-4c8d-b3b0-2b123d456789",
      "productName": "Amoxicillin 500mg",
      "currentAvailableUnits": 4,
      "reorderLevel": 20,
      "uom": "Boxes"
    }
  ],
  "liveOperationalQueue": [
    {
      "orderId": "10843",
      "customerName": "Apollo Pharmacy - Alandur",
      "status": "Active Picking",
      "zone": "Zone B"
    },
    {
      "orderId": "10842",
      "customerName": "MedPlus Chemist - Guindy",
      "status": "Verified Route Loaded",
      "zone": "Dock 2"
    },
    {
      "orderId": "10841",
      "customerName": "Kauvery Hospital Pharmacy",
      "status": "Delivered (POD Signed)",
      "zone": "Central"
    }
  ]
}
```
