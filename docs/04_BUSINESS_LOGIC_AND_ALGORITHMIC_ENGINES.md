# Business Logic & Algorithmic Engines Specification
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Algorithmic Logic Blueprint) |
| **Target Engine Scope** | FEFO Stock Allocator, Split Batch Resolver, Dual GST Engine, Scheme Processor, Expiry Horizons |
| **Deterministic Precision** | Fixed-point arithmetic (`decimal` / `NUMERIC(14,2)`) — zero floating-point drift |

---

## 1. FEFO (First Expiry, First Out) Stock Allocation Engine

### 1.1 Core Business Rules
Pharmaceutical wholesalers must guarantee that retail pharmacies receive stock with sufficient remaining shelf life. Supplying expired or near-expiry drugs is a major regulatory offense under the Drugs and Cosmetics Act.
1. **Expiry Threshold Filter**: Any batch expiring in $\le 60$ days from system date ($T_{\text{system}} + 60\text{ days}$) is automatically blacklisted from sales allocation.
2. **Earliest Expiry Sort**: Eligible batches are sorted in strict ascending order of `ExpiryDate`.
3. **Split Allocation Behavior**: If the earliest expiring batch cannot satisfy the entire ordered quantity, the engine splits the allocation into multiple batch assignments across distinct invoice lines.

### 1.2 Algorithm Flowchart & Pseudocode

```
[Input: TenantId, WarehouseId, ProductId, RequestedQty]
                          │
                          ▼
[Fetch Batches from T_Inventory_Balances JOIN T_Batches]
  WHERE ProductId = @ProductId 
    AND WarehouseId = @WarehouseId
    AND QuantityAvailable > 0
    AND ExpiryDate > (CurrentDate + 60 Days)
  ORDER BY ExpiryDate ASC, BatchNumber ASC
                          │
                          ▼
             [Is Available Batches Empty?]
                     │               │
               YES   │               │ NO
                     ▼               ▼
           [Return OUT_OF_STOCK]    [Initialize: Remaining = RequestedQty]
                                    [Initialize: AllocationsList = []]
                                             │
                                             ▼
                                  ┌───[Loop Each Batch]◀────────────────┐
                                  │                                     │
                                  ▼                                     │
                 [AllocQty = Min(Remaining, Batch.QtyAvail)]            │
                 [Append to AllocationsList(Batch, AllocQty)]           │
                 [Remaining = Remaining - AllocQty]                     │
                                  │                                     │
                                  ▼                                     │
                         [Is Remaining == 0?]                           │
                           │               │                            │
                     YES   │               │ NO                         │
                           ▼               └────────────────────────────┘
                 [Return ALLOCATION_OK]                     │ (No more batches)
                                                            ▼
                                                 [Return PARTIAL_ALLOCATION]
```

#### C# Domain Implementation
```csharp
public record BatchAllocation(Guid BatchId, string BatchNumber, DateOnly ExpiryDate, int AllocatedQuantity, string LocationRackBin);

public record AllocationResult(
    bool IsFullyAllocated,
    int TotalAllocated,
    int UnfulfilledQuantity,
    IReadOnlyList<BatchAllocation> Allocations);

public class FefoAllocationEngine
{
    private const int MinShelfLifeBufferDays = 60;

    public AllocationResult AllocateStock(
        IEnumerable<BatchInventoryView> availableBatches,
        int requestedQuantity,
        DateOnly currentDate)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(requestedQuantity);

        var expiryCutoff = currentDate.AddDays(MinShelfLifeBufferDays);

        // Filter out expired or near-expiry batches, then sort by ExpiryDate ascending
        var eligibleBatches = availableBatches
            .Where(b => b.ExpiryDate > expiryCutoff && b.QuantityAvailable > 0)
            .OrderBy(b => b.ExpiryDate)
            .ThenBy(b => b.BatchNumber)
            .ToList();

        var allocations = new List<BatchAllocation>();
        int remainingToAllocate = requestedQuantity;

        foreach (var batch in eligibleBatches)
        {
            int allocatable = Math.Min(remainingToAllocate, batch.QuantityAvailable);
            
            allocations.Add(new BatchAllocation(
                batch.BatchId,
                batch.BatchNumber,
                batch.ExpiryDate,
                allocatable,
                batch.LocationRackBin));

            remainingToAllocate -= allocatable;

            if (remainingToAllocate == 0)
                break;
        }

        return new AllocationResult(
            IsFullyAllocated: remainingToAllocate == 0,
            TotalAllocated: requestedQuantity - remainingToAllocate,
            UnfulfilledQuantity: remainingToAllocate,
            Allocations: allocations.AsReadOnly());
    }
}
```

---

## 2. Indian Dual GST Tax Calculation Engine

### 2.1 State Classification & Rates
Every state and union territory in India is designated a 2-digit GST state code (e.g., `33` = Tamil Nadu, `29` = Karnataka, `27` = Maharashtra, `07` = Delhi).

1. **Intra-State Supply**: `SupplierStateCode == CustomerPlaceOfSupplyStateCode`
   - Split tax equally between Central Government (CGST) and State Government (SGST):
     $$\text{CGSTRate} = \frac{\text{GSTPercentage}}{2}, \quad \text{SGSTRate} = \frac{\text{GSTPercentage}}{2}, \quad \text{IGSTRate} = 0$$
2. **Inter-State Supply**: `SupplierStateCode \ne CustomerPlaceOfSupplyStateCode`
   - Apply Integrated GST (IGST) in full:
     $$\text{IGSTRate} = \text{GSTPercentage}, \quad \text{CGSTRate} = 0, \quad \text{SGSTRate} = 0$$

### 2.2 Mathematical Formulae & Round-off Standard
For each line item:
$$\text{GrossLineTotal} = \text{BilledQuantity} \times \text{UnitPricePTR}$$
$$\text{DiscountedAmount} = \text{GrossLineTotal} \times \left(1 - \frac{\text{TradeDiscountPercentage}}{100}\right) - \text{SchemeCashDiscount}$$
$$\text{TaxableValue} = \max(0, \text{DiscountedAmount})$$

$$\text{CGSTAmount} = \text{Round}\left(\text{TaxableValue} \times \frac{\text{CGSTRate}}{100}, 2\right)$$
$$\text{SGSTAmount} = \text{Round}\left(\text{TaxableValue} \times \frac{\text{SGSTRate}}{100}, 2\right)$$
$$\text{IGSTAmount} = \text{Round}\left(\text{TaxableValue} \times \frac{\text{IGSTRate}}{100}, 2\right)$$
$$\text{NetLineTotal} = \text{TaxableValue} + \text{CGSTAmount} + \text{SGSTAmount} + \text{IGSTAmount}$$

At the invoice header level:
$$\text{RawInvoiceTotal} = \sum \text{NetLineTotal}$$
$$\text{NetPayableAmount} = \text{Round}(\text{RawInvoiceTotal}, 0)$$
$$\text{RoundOffAmount} = \text{NetPayableAmount} - \text{RawInvoiceTotal}$$

---

## 3. Pharma Scheme Management Matrix & Accounting Impact

Pharma manufacturers introduce extensive promotional schemes to push inventory through distributors to retailers. PharmaFlow handles three primary scheme models:

### 3.1 Scheme Taxonomy & Computation

| Scheme Class | Typical Industry Example | Computational Formula | Financial & Ledger Posting Impact |
| :--- | :--- | :--- | :--- |
| **Volumetric Free Stock (Bonus)** | *Buy 10 Strips, Get 1 Free* (10 + 1) | $\text{FreeQty} = \left\lfloor \frac{\text{BilledQty}}{\text{Threshold}} \right\rfloor \times \text{FreeUnits}$ | Total stock reduction = $\text{BilledQty} + \text{FreeQty}$. Cost of free units is posted as `Debit: Scheme Promotion Expense`, `Credit: Inventory Value`. |
| **Financial Turnover Discount** | *Order Value > ₹10,000, 5% Special Cash Discount* | $\text{Discount} = \text{OrderTaxableBase} \times \left(\frac{\text{Discount\%}}{100}\right)$ | Deducted directly from invoice taxable subtotal. Posted to `Debit: Sales Discount Allowed`. |
| **Manufacturer Sponsored Rebate** | *Monsoon Clearance: Manufacturer reimburses ₹3.50 per strip sold* | $\text{ClaimAccrual} = \text{BilledQty} \times \text{ReimbursementRatePerUnit}$ | Customer pays net price. Distributor logs asset: `Debit: Manufacturer Scheme Claim Receivable`, `Credit: Scheme Subsidy Income`. |

### 3.2 Double-Entry Accounting Matrix
```
Transaction: Sales Invoice Generated with (10 + 1 Scheme + ₹500 Financial Discount)
1. Debit:   Customer Receivable Account          (Net Payable Invoice Total)
2. Debit:   Sales Discount Allowed Account       (₹500.00 Financial Discount)
3. Credit:  Sales Revenue Account               (Total Taxable Goods Value)
4. Credit:  CGST Output Tax Liability Account   (Central GST component)
5. Credit:  SGST Output Tax Liability Account   (State GST component)

Transaction: Month-End Manufacturer Rebate Claim Settlement
1. Debit:   Bank / Supplier Payable Ledger (Settled via Credit Note)
2. Credit:  Manufacturer Scheme Claim Receivable Account
```

---

## 4. Expiry Horizon & Proactive Quarantine Engine

PharmaFlow classifies all inventory batches into four dynamic operational horizons evaluated on a daily cron schedule at 00:01 IST:

```
[Inventory Batch Health Classification]
  │
  ├── 0 - 30 Days Remaining   ──▶ [CRITICAL / QUARANTINE]
  │                               - Automatically lock from billing
  │                               - Move QuantityAvailable -> QuantityQuarantined
  │                               - Alert Branch Manager for physical segregation
  │
  ├── 31 - 60 Days Remaining  ──▶ [FEFO STOP / SUPPLIER RETURN]
  │                               - Suppress from FEFO sales allocation
  │                               - Generate "Return to Manufacturer / Supplier" Debit Proposal
  │                               - Calculate estimated refundable value based on PurchaseRate
  │
  ├── 61 - 90 Days Remaining  ──▶ [PROMOTIONAL ACCELERATION]
  │                               - Push to B2B Ordering Portal Clearance Channel
  │                               - Suggest automated promotional deal (e.g. 10 + 2 scheme)
  │
  └── 91+ Days Remaining      ──▶ [HEALTHY / NORMAL ROTATION]
                                  - Standard FEFO allocation pipeline
```
