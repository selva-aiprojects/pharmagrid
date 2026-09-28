# UI/UX Design System & Competitive Analysis (vs C-Square / Marg ERP)
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production UI/UX Architecture) |
| **Primary Benchmark** | C-Square (Pharmasoft / EcoGreen) & Marg ERP 9+ |
| **UX Objective** | High-velocity keyboard-only counter billing with modern cloud aesthetics & zero cognitive fatigue |
| **Design Language** | Enterprise Dark/Light Slate & Medical Teal/Cyan with Glassmorphic Card Elevation |
| **Accessibility & Usability** | Sub-second visual feedback, color-coded regulatory badges, inline FEFO split pills, single-key navigation |

---

## 1. Competitive UX Teardown: PharmaFlow vs C-Square & Marg ERP

Indian pharmaceutical stockists have historically relied on desktop software like **C-Square (Pharmasoft / EcoGreen)** and **Marg ERP**. While these legacy platforms are known for fast raw data entry, their architecture and UX suffer from fundamental flaws that PharmaFlow eliminates:

| Feature Dimension | Legacy C-Square / Marg ERP | PharmaFlow Cloud Advantage | Usability Leap |
| :--- | :--- | :--- | :--- |
| **Visual Architecture** | Windows 95/XP style dense monochrome grey/blue grids. Overwhelming visual clutter. | Clean, high-contrast dark/light mode with curated slate tones, medical cyan/teal accents, and clear visual hierarchy. | **80% reduction in eye fatigue** for billing clerks operating 8–10 hours daily. |
| **Speed & Keyboard Workflow** | Fast keyboard navigation, but requires memorizing obscure multi-key codes (e.g., `Ctrl+Alt+F7`). | Preserves 100% keyboard-only billing (`F1` to `F8`, `Enter`, `Tab`), complemented by on-screen accelerator pills and a modern Command Palette (`Ctrl + K`). | **Zero learning curve** for junior staff; veteran billing operators feel instantly at home. |
| **Batch & Expiry Context** | Buried in nested popups; hard to compare multiple batches quickly. | **Inline FEFO Badge & Dropdown**: Displays expiry dates, available quantities, and rack locations directly in the table row. | Prevents billing expired/near-expiry stock without interrupting typing rhythm. |
| **Split-Batch Allocation** | Unintuitive modal prompt when stock in a single batch is insufficient; operators often cancel the line. | **Automatic Inline Split-Pill**: Seamlessly resolves split lines (e.g. 40 units Batch A + 60 units Batch B) with an amber badge showing exact fulfillment. | Eliminates order drop-offs and human calculation errors during peak billing hours. |
| **Scheme Transparency** | Unclear scheme logic; operators must manually check paper deal slips or type override rates. | **Real-Time Deal Matrix Badge**: Shows "Auto-applies Buy 10 Get 1 Free" or turnover discounts dynamically as quantities change. | Real-time margin assurance for both distributor and retail customer. |
| **Customer Credit & License Risk** | Static text warnings easily bypassed by operators without oversight. | **Visual Credit Meter & License Pill**: Real-time progress bar showing outstanding balance vs credit limit + green/red badge for Drug License Form 20B/21B. | Zero revenue leakage and strict compliance with CDSCO regulatory audits. |
| **Business Oversight** | Owner must physically sit at the main server PC to print end-of-day reports. | **Cloud-Native Executive Dashboard**: Real-time sales, live warehouse picking queues, and a 4-tier expiry radar accessible on mobile or desktop. | Instant decision-making from anywhere in the world. |

---

## 2. Core UI Design Patterns & Interfaces

### 2.1 Rapid Sales Invoicing UI
The sales billing screen is the core engine of a pharma distributor. In PharmaFlow, it combines the lightning speed of desktop terminal billing with the visual elegance of a modern web application:

1. **Header Zone**:
   - Customer search with instant typeahead (`F1`).
   - Visual Credit Health Meter (e.g., ₹12,400 used of ₹50,000 credit limit).
   - Drug License Form 20B/21B validity badge (Green = Valid, Amber = Expiring in 15 days, Red = Blocked).
2. **Interactive Data Grid (`F2` to add row)**:
   - Medicine name and generic strength lookup with instant search.
   - Batch selector populated automatically by the FEFO algorithm with earliest expiry date pre-selected.
   - **Split-Allocation Indicator**: Visually flags when an order line spans multiple physical batches.
   - **Scheme Pill**: Cyan tag showing active bonus deals (e.g., `Auto-applies Buy 10 Get 1 Free`).
   - Dynamic calculations: Quantity, PTR rate, Trade Discount %, Taxable Value, and Dual GST (CGST + SGST or IGST).
3. **Bottom Summary Bar**:
   - Live computation of Gross Value, CGST, SGST, IGST, Round-off, and Net Payable.
   - Prominent single-stroke action: `F8` or `Ctrl + Enter` to Save & Print Invoice in $< 2$ seconds.
   - Sticky keyboard accelerator chips along the bottom edge for immediate discoverability.

### 2.2 Executive Dashboard & Expiry Radar
Designed for the distributor owner and general manager:
1. **Four Critical Financial KPI Cards**:
   - **Today's Sales**: Current day revenue with comparison percentage vs yesterday.
   - **Total Inventory Asset**: Valuation of physically held stock across all depots.
   - **Overdue Receivables**: Outstanding balance exceeding approved credit terms with action trigger.
   - **Expiry Risk Horizon**: Real-time valuation of stock expiring within the next 90 days.
2. **Interactive Near-Expiry Radar Chart**:
   - **0–30 Days (Critical Red)**: Quarantined stock pending disposal or credit note.
   - **31–60 Days (Supplier Return Amber)**: Stock stopped from sales allocation; return proposal generated.
   - **61–90 Days (Promo Clearance Blue)**: Fast-track clearance deals pushed to ordering channels.
3. **Live Operations Center**:
   - Real-time picking and packing queue with assigned warehouse staff and dock status.
   - Top under-stocked products with automated one-click purchase reorder triggers.

---

## 3. Keyboard Accelerator & Usability Architecture

Pharma billing operators type with both hands on the numeric keypad and function keys. Mouse clicks are treated as secondary fallback:

```
[F1] Focus Customer Search   ──▶ Type 'Apollo' ──▶ [Enter] (Loads credit status & license)
  │
[F2] Add Medicine Line        ──▶ Type 'Pan 40' ──▶ [Enter]
  │
[Automatic FEFO Allocation]   ──▶ Pre-selects earliest valid batch (Batch #, Exp Date, Rack Bin)
  │
[F3] Batch Override (Optional)──▶ Opens batch comparison drawer
  │
[Enter / Tab] Quantity Input  ──▶ Type '100' ──▶ Scheme badge auto-calculates bonus (+10 free)
  │
[F8 / Ctrl+Enter] Save & Print──▶ Locks stock, commits PG atomic txn, dispatches print payload (<2s)
```

---

## 4. Design Tokens & Component Styling

```css
:root {
  /* Core Brand Colors */
  --bg-primary: #0a0f1d;        /* Deep obsidian slate */
  --bg-secondary: #111827;      /* Surface elevated card */
  --bg-tertiary: #1f293d;       /* Input & table row hover */
  
  --accent-cyan: #06b6d4;       /* Medical cyan / primary action */
  --accent-teal: #14b8a6;       /* Success / valid license pill */
  --accent-emerald: #10b981;    /* Financial growth indicator */
  --accent-amber: #f59e0b;      /* Split allocation / warning */
  --accent-rose: #f43f5e;       /* Critical expiry / blocked customer */
  
  /* Typography */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', monospace; /* Used for Batch #, HSN, Tax */
  
  /* Borders & Shadows */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(6, 182, 212, 0.6);
  --shadow-elevation: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
}
```
