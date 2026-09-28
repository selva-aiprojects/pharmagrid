# PharmaGrid™ Cloud ERP
### Enterprise Pharmaceutical Distribution, Rapid Counter Billing & CDSCO Compliance Engine

![PharmaGrid Platform](https://img.shields.io/badge/Platform-PharmaGrid-1d4ed8?style=for-the-badge&logo=medicare)
![Backend](https://img.shields.io/badge/.NET_9-Web_API-512BD4?style=for-the-badge&logo=dotnet)
![Frontend](https://img.shields.io/badge/Next.js_16-React_19-000000?style=for-the-badge&logo=nextdotjs)
![Database](https://img.shields.io/badge/PostgreSQL_16-Tenant_Isolation-336791?style=for-the-badge&logo=postgresql)
![Compliance](https://img.shields.io/badge/CDSCO_Compliant-Schedules_H%2FH1%2FX-059669?style=for-the-badge)

---

## 🔬 Overview

**PharmaGrid™** is a mission-critical cloud ERP engineered specifically for Indian pharmaceutical C&F (Carrying & Forwarding) agents, stockists, super-distributors, and multi-branch pharmacy chains.

Built to solve the throughput bottlenecks of high-volume wholesale operations, PharmaGrid delivers a **Sub-2-Second Counter Billing Guarantee**, automated **FEFO (First-Expiry-First-Out)** batch allocation, multi-tiered Indian GST calculation, and strict CDSCO statutory compliance.

---

## ⚡ Key Capabilities

### 1. Rapid Counter Billing (100% Zero-Mouse POS)
- **Keyboard-Driven Accelerator Dock**: Full transaction flow executed using standard POS shortcuts (`F1` Customer Search, `F2` Add Medicine, `F3` Batch Selection, `F8` Finalize & Generate E-Invoice, `Esc` Dismiss).
- **Sub-2-Second Checkout SLA**: Atomic stock reservation with pessimistic Redis distributed locking (`RedLock`) preventing batch race conditions.
- **Dynamic Scheme & Bonus Deals**: Automatic calculation and allocation of manufacturer promotional schemes (e.g. 10+1 free, 20+2 bonus) with margin adjustment.

### 2. Statutory FEFO Batch Engine & Inventory Management
- **Automated Expiry Optimization**: Enforces FIFO/FEFO dispatch to prevent near-expiry stock losses.
- **Warehouse 4-Tier Coordinate Tracking**: Precise physical location indexing `[Zone]-[Rack]-[Shelf]-[Bin]` (e.g. `Z1-R02-S03-B01`).
- **Cold-Chain Assurance**: Dedicated flagging and monitoring for 2°C–8°C thermo-sensitive SKUs (Insulins, Biologicals, Vaccines).

### 3. Indian Dual GST & Tax Compliance
- **Dual GST Calculation**: Dynamic taxation splitting Intra-State transactions into CGST + SGST (e.g., 6% + 6%) and Inter-State transactions into IGST (12% / 18%).
- **E-Invoice IRN & QR Code Generation**: 64-character SHA-256 digital signature hash simulation for compliance.
- **Statutory Schedule Validation**: Hard enforcement for Schedule H, H1, X, and G drugs requiring mandatory doctor registration and license tracking.

### 4. Credit Risk & Customer Drug License Registry
- **Real-Time Credit Limit Checking**: Instant validation of customer credit exposure and overdue payment locks prior to billing.
- **CDSCO License Form 20B/21B Verification**: Automated blocks on expired chemist licenses.

### 5. Inward Goods Receipt Note (GRN) & Procurement
- Ingestion of supplier invoices with manufacturing dates, expiry dates, purchase PTR, and MRP validation.
- Put-away bin assignment and inventory ledger update.

### 6. Regulatory Audit & Immutable Log
- Append-only compliance log capturing every state mutation, user ID, IP address, and timestamp.

---

## 🏗️ Architecture & Technology Stack

```
pharmagrid/
├── backend/                              # .NET 9 Web API (Clean Architecture)
│   ├── PharmaGrid.sln                    # Unified Solution File
│   └── src/
│       ├── PharmaGrid.Domain/            # Entities, Enums, Value Objects
│       ├── PharmaGrid.Application/       # DTOs, Tax Calculators, Scheme Engines
│       ├── PharmaGrid.Infrastructure/    # EF Core, PostgreSQL Persistence, In-Memory Seed
│       └── PharmaGrid.WebApi/            # Controllers, Swagger, Middlewares, Health Checks
│
├── frontend/                             # Next.js 16 (App Router + Turbopack)
│   ├── src/
│   │   ├── app/                          # App Layout, Globals CSS & Theme Provider
│   │   ├── components/                   # Rapid Billing, Inventory, Catalog, Dashboard
│   │   ├── context/                      # Clinical Light / Dark Theme Context
│   │   ├── services/                     # Typed REST API Client & SLA Benchmarks
│   │   └── data/                         # High-fidelity mock fallback data
│   ├── package.json
│   └── .env.example
│
└── docs/                                 # Architectural Specifications & TRD
```

### Backend (.NET 9 C#)
- **Target Framework**: .NET 9.0 (`net9.0`)
- **Architecture**: Domain-Driven Clean Architecture
- **ORM & Data**: Entity Framework Core 9.0 with In-Memory / PostgreSQL providers
- **API Documentation**: OpenAPI / Swagger UI at `/swagger`
- **Health Check Endpoint**: `/healthz`

### Frontend (Next.js 16 + React 19)
- **Framework**: Next.js 16.3.6 (Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + Clinical Healthcare Design System
- **Icons**: Lucide React
- **Theme**: Clinical Light Mode (Default) + High-Tech Night Shift Mode

---

## 🚀 Quick Start Guide

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 20+ LTS](https://nodejs.org/) & npm

### 1. Run the Backend Web API

```bash
cd backend/src/PharmaGrid.WebApi
dotnet restore
dotnet run
```
*API will start listening at `http://127.0.0.1:5050` with interactive Swagger docs at `http://127.0.0.1:5050/swagger`.*

### 2. Run the Frontend Web Application

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## ⌨️ POS Keyboard Accelerators

| Shortcut | Description |
|:---|:---|
| <kbd>F1</kbd> | Customer Pharmacy & Hospital Registry Search |
| <kbd>F2</kbd> | Add New Medicine Item Row to Invoice |
| <kbd>F3</kbd> | FEFO Batch & Rack Location Selector |
| <kbd>F8</kbd> | Lock Stock, Sign IRN & Commit Sales Invoice |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | Expand / Collapse Navigation Sidebar |
| <kbd>Esc</kbd> | Dismiss Active Modal / Drawer |

---

## 📄 License & Compliance

Developed for enterprise pharmaceutical distribution in compliance with **Central Drugs Standard Control Organisation (CDSCO)** and **Goods and Services Tax (GST)** regulations under the Ministry of Health and Family Welfare, Government of India.
