# PharmaGrid Cloud ERP — Enterprise Phased Roadmap & Implementation Progress

| Document Information | Specifications |
| :--- | :--- |
| **Project** | PharmaGrid™ Next-Gen Pharma Distribution Cloud ERP |
| **Benchmark Standard** | Marg ERP 9+ Diamond, C-Square EcoGreen Enterprise, SAP S/4HANA Life Sciences |
| **Compliance Level** | CDSCO Drug Rules 1945, Indian Dual GST (Rule 46/53), Schedule H1/X Regs |
| **Last Updated** | October 2026 |
| **Live Production URL** | [https://frontend-ashy-rho-31.vercel.app](https://frontend-ashy-rho-31.vercel.app) |
| **GitHub Repository** | [selva-aiprojects/pharmagrid](https://github.com/selva-aiprojects/pharmagrid) |

---

## 1. Executive Implementation Status Across Phases

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHARMAGRID COMMERCIAL ERP MATURITY MATRIX                       │
├─────────┬─────────────────────────────────────────────────┬──────────────┬─────────────┤
│ Phase   │ Capability & Scope                              │ Status       │ Environment │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase A │ Commercial Enterprise Core & Compliance         │ COMPLETED    │ Production  │
│         │ • Statutory CDSCO Registers (H1, X, Recall, CC) │              │ (Vercel +   │
│         │ • Chemist Collections & Bill-by-Bill Knockoff   │              │ .NET 9 API) │
│         │ • Returns & Claims Engine (Form 53 CN / DN)     │              │             │
│         │ • Financial Accounting, GSTR-1 (4A/12) & Cash   │              │             │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase B │ Field Force Automation (SFA) & Beat Planner     │ COMPLETED    │ Production  │
│         │ • Chemist Daily Beat Itinerary & Sequence       │              │ (Vercel +   │
│         │ • Mobile Field Order Booking (MR App)           │              │ .NET 9 API) │
│         │ • Geofence GPS Check-In & Verification          │              │             │
│         │ • On-Field Payment Collections & Receipt Punch  │              │             │
│         │ • Strike Rate & Order Booker Performance KPIs   │              │             │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase C │ Chemist Self-Service Portal & WhatsApp Bot      │ PLANNED      │ Staging     │
│         │ • Chemist Login & Digital Product Catalog       │              │ Backlog     │
│         │ • WhatsApp Natural Language Order Parser        │              │             │
│         │ • Razorpay / UPI QR Instant Payment Gateway     │              │             │
│         │ • Self-Service Statement & Tax Invoice Download │              │             │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase D │ Advanced Warehouse HHT Barcoding & Wave Pick    │ PLANNED      │ Architecture│
│         │ • Android HHT / 2D GS1 DataMatrix Scanner       │              │ Backlog     │
│         │ • Optimized Warehouse Wave Picking Routes       │              │             │
│         │ • Crate Packing Station & Tamper-Evident Seals  │              │             │
│         │ • Zero-Error Double-Check Dispatch Scanning     │              │             │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase E │ Direct NIC E-Way Bill, E-Invoice & Banking      │ PLANNED      │ Interface   │
│         │ • Direct NIC E-Way Bill Portal API Integration  │              │ Backlog     │
│         │ • Live 64-char IRN Hash & Signed QR Code        │              │             │
│         │ • Connected Banking (ICICI/HDFC Virtual Accounts│              │             │
│         │ • Automated Bank Statement Receipt Matching     │              │             │
├─────────┼─────────────────────────────────────────────────┼──────────────┼─────────────┤
│ Phase F │ Autonomous AI Intelligence & Demand Markdown    │ PLANNED      │ R&D         │
│         │ • Handwritten Chemist Indent Vision OCR         │              │ Backlog     │
│         │ • Seasonal Disease Spike Predictive Purchasing  │              │             │
│         │ • Autonomous Vendor Replenishment (Auto-PO)     │              │             │
│         │ • 60-90 Day Near-Expiry Markdown Clearances     │              │             │
└─────────┴─────────────────────────────────────────────────┴──────────────┴─────────────┘
```

---

## 2. Phase-by-Phase Technical Specifications

### Phase A: Commercial Enterprise Core & Compliance (COMPLETED)
- **Delivered Capabilities**:
  1. **Statutory CDSCO Registers**:
     - Schedule H1 Register (`Rule 65(9)` / `Form 35`) tracking Prescriber, Patient, Drug License, and Batch details.
     - Schedule X Bound Register (`Form 20F/21F`) tracking Class-X narcotics with Council Registered Pharmacist sign-off.
     - 24-Hour Batch Recall & Forward Traceability Matrix with 1-click Chemist Broadcast Dispatch.
     - Twice-daily Cold-Chain (2°C–8°C) temperature logger with calibrated sensor telemetry.
  2. **Chemist Collections & Bill-by-Bill Knockoff**:
     - Bill-by-bill knockoff engine with Auto FIFO allocation and manual selection.
     - Multi-mode receipt punching: Cheque (number, bank), UPI (UTR reference), NEFT/RTGS, and Cash.
     - Marg ERP 5-bucket overdue aging matrix (`0-15d`, `16-30d`, `31-45d`, `46-60d`, `>60d`) with automated billing lockout flags.
  3. **Returns & Claims Engine**:
     - Customer Sales Return Credit Notes (`Form 53`) with automatic stock routing (`EXPIRY_RETURN` -> Quarantine Dump Rack D-01, `BREAKAGE_LEAKAGE` -> Non-Saleable Dump Rack D-02, `GOOD_STOCK` -> Active Picking Bins A-01).
     - Dual GST reversal computation (CGST+SGST / IGST).
     - Supplier Purchase Return Debit Notes raised against pharmaceutical companies (Alkem, Cipla, Sun Pharma).
     - 3-Phase Manufacturer Expiry Claims lifecycle tracker.
  4. **Financial Accounting & GST Reports**:
     - Chemist Statement of Account with printable confirmation format and Dr/Cr running balance.
     - GSTR-1 Table 4A (Taxable B2B Invoices) and Table 12 (HSN-wise Outward Summary) with JSON portal export.
     - Daily Cash Book and physical denomination drawer counter (₹500, ₹200, ₹100, ₹50, ₹20, ₹10) with variance audit.
- **Artifacts**:
  - Backend: `CdscoRegistersController.cs`, `CollectionsController.cs`, `ReturnsController.cs`, `FinancialReportsController.cs`
  - Frontend: `CdscoRegistersView.tsx`, `PaymentCollectionsView.tsx`, `ReturnsManagementView.tsx`, `FinancialLedgersView.tsx`

---

### Phase B: Field Force Automation (SFA) & Chemist Beat Planner (IN PROGRESS)
- **Objective**: Digitize medical reps (MR) and field order bookers visiting retail pharmacies on daily route beats.
- **Key Modules**:
  1. **Chemist Beat Planner & Daily Route Itinerary**:
     - Daily beat scheduler assigning reps to geographical clusters (e.g. Beat #1: T. Nagar - 15 pharmacies, Beat #2: Anna Nagar - 20 pharmacies).
     - Sequential visit queue with pharmacy GPS coordinates, drug license status, and target collection.
  2. **Mobile Quick-Order Punching (Field POS)**:
     - Touch/mobile-optimized order pad for taking orders inside chemist shops.
     - Overdue credit guardrail: Automatically halts order placement if chemist is >60 days overdue or requires Manager PIN override.
     - Real-time scheme calculation (e.g. 10+1 free, 5% cash prompt discount).
  3. **GPS Geofence Check-in**:
     - Validates order booker physical location within 50 meters of pharmacy coordinates to eliminate proxy visits.
  4. **On-Field Payment Collections**:
     - Rep collects cash/cheque on-site, enters cheque photo/UTR, and issues instant receipt SMS to chemist.
  5. **Representative Daily Strike Rate Analytics**:
     - Metrics: Total Visits, Effective Coverage %, Strike Rate (Booked / Visited), Total Daily Booking Value, Average Order Value (AOV).

---

### Phase C: Chemist B2B Self-Service Portal & WhatsApp AI Commerce (PLANNED)
- **Objective**: Empower retail chemists to order 24/7 and pay digitally without waiting for field representatives.
- **Key Modules**:
  1. **Chemist Web & Mobile App**:
     - Secure chemist login with mobile OTP.
     - Live stock availability search across 10,000+ formulations.
     - View active pharmaceutical schemes and quantity breaks.
  2. **WhatsApp AI Order Bot**:
     - Chemist sends photo of handwritten purchase indent or texts item list on WhatsApp.
     - LLM parses handwritten/text inputs, matches brand names to master SKUs, checks stock, and replies with a draft invoice confirmation.
  3. **Integrated Digital Payments**:
     - Dynamic UPI QR code generated on delivery invoice for instant GooglePay/PhonePe payment.
     - Webhook updates ERP collections immediately upon settlement.

---

### Phase D: Advanced Warehouse Barcoding & HHT Wave Picking (PLANNED)
- **Objective**: Zero-error fulfillment in high-volume distribution warehouses shipping 2,000+ invoices daily.
- **Key Modules**:
  1. **Android Handheld Terminal (HHT) Integration**:
     - Native Zebra/Honeywell barcode scanner support reading 2D GS1 DataMatrix.
     - Put-away verification: Scans inward batch barcode and target shelf barcode to confirm bin storage.
  2. **Wave Picking Route Optimization**:
     - Groups multiple chemist orders into a single warehouse picking wave.
     - Directs picker along the shortest aisle-by-aisle route to eliminate backtracking.
  3. **Packing Station Double-Check & Crate Sealing**:
     - Chemist shipping crate barcode scanned and sealed with tamper-evident serial numbers.
     - Zero dispatch discrepancy guarantee.

---

### Phase E: Live NIC E-Way Bill, E-Invoice & Connected Banking (PLANNED)
- **Objective**: Complete end-to-end automation with Indian tax portals and core banking systems.
- **Key Modules**:
  1. **Direct NIC E-Way Bill API**:
     - Direct generation of Part-A and Part-B E-Way bills for consignments exceeding ₹50,000.
     - Printable E-Way Bill with QR Code for transport vehicles.
  2. **NIC Live E-Invoice (IRN)**:
     - Real-time generation of 64-character IRN Hash and signed QR code via GSP.
  3. **Connected Banking (ICICI / HDFC / RazorpayX)**:
     - Virtual Account Number (VAN) for each chemist.
     - Automatic ledger reconciliation when NEFT/IMPS funds hit distributor account.

---

### Phase F: Autonomous AI Intelligence & Demand Markdown Engine (PLANNED)
- **Objective**: AI-driven inventory optimization preventing pharmaceutical stock expiry and stockouts.
- **Key Modules**:
  1. **Handwritten Indent Vision OCR**:
     - Advanced multi-modal AI parsing messy doctor/chemist prescription slips into structured order lines.
  2. **Seasonal Disease Outbreak Forecasting**:
     - Predicts spikes in demand for antipyretics, anti-malarials, antibiotics, and IV fluids based on monsoon and local epidemiological trends.
  3. **Autonomous Replenishment (Auto-PO)**:
     - Automatically generates supplier purchase indents when stock drops below dynamic safety days.
  4. **Dynamic Near-Expiry Clearance Markdown**:
     - Suggests promotional discounts (10%–25%) for batches entering the 60–90 day expiry horizon to minimize dump write-offs.

---

## 3. Active Release Milestone Summary
- **Current Milestone**: Phase B (Field Force Automation & Chemist Beat Planner) — COMPLETED & DEPLOYED
- **Next Milestone**: Phase C (Chemist B2B Self-Service Portal & WhatsApp AI Commerce)
- **Target Deployment**: Vercel Production + .NET 9 Backend
- **Repository Branch**: `main`
