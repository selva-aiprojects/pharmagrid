# PharmaGrid™ Product Development Engineering Documentation Suite
## Cognivectra • PharmaGrid™ (Next-Gen Pharma Distribution Cloud ERP)

Welcome to the official, production-grade Engineering Documentation suite for **PharmaGrid™**. This repository contains the complete formal requirements, technical architecture design, database schema specifications, REST API contracts, security architectures, AI safety guardrails, agile delivery backlog, and operational runbooks.

---

## 📚 Master Documentation Index & Alignment Matrix

Below is the complete mapping of core architecture and operational documents aligned with enterprise engineering standards:

| # | Requested Document Domain | Specification Document Link | Primary Audience | Contents Summary |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **PRD (Product Requirements Document)** | **[01. Product Requirements Specification](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/01_PRODUCT_REQUIREMENTS_SPECIFICATION.md)** | Product Managers, Engineering Leads, QA | Executive vision, user personas, CDSCO Schedules H/H1/X/G compliance, Form 20B/21B validities, 13 core modules scope, performance SLAs, and failure edge cases. |
| **2** | **TRD FE/BE/DB Hosting Details** | **[08. Technical Requirements & Hosting Architecture (TRD)](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/08_TECHNICAL_REQUIREMENTS_DOCUMENT_TRD.md)** | Architects, SREs, DevOps Engineers | Comprehensive hosting architecture: FE (Next.js 14 on ECS / Vercel), BE (.NET 9 Kestrel on Linux / ECS), DB (PostgreSQL 16 Aurora RDS Multi-AZ + Redis 7 + RabbitMQ), VPC topology, subnets, and env vars. |
| **3** | **App Flow Document & User Navigation** | **[09. Application Flow & User Navigation](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/09_APP_FLOW_AND_USER_NAVIGATION.md)** | UX Designers, Frontend Leads, Operations | Complete site map, 100% Zero-Mouse keyboard shortcuts (`F1` to `F8`), role-based navigation trees, and 5 detailed Mermaid operational state machines (Billing, GRN, Logistics, Stock Master, Forecast). |
| **4** | **UI/UX Typography, Details & Color Palettes** | **[07. UI/UX Design System, Typography & Palettes](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/07_UI_UX_DESIGN_SYSTEM_AND_COMPETITIVE_ANALYSIS.md)** | Product Designers, Frontend Developers | Typographic hierarchy (Inter, Outfit, JetBrains Mono `tabular-nums`), Obsidian Slate dark palette, CDSCO drug schedule badges, 4-tier expiry radar colors, credit health meters, and component anatomy. |
| **5** | **Backend Schema Document** | **[03. Backend Database Schema Specification](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/03_BACKEND_DATABASE_SCHEMA_DOCUMENT.md)**<br>*(Companion: [03_DATABASE_SCHEMA_POSTGRESQL.sql](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/03_DATABASE_SCHEMA_POSTGRESQL.sql))* | Database Engineers, Backend Developers | Complete ER diagram, data dictionary for 16 core master/transactional tables, columns, constraints, foreign keys, multi-tenant EF Core isolation, composite B-Trees, and immutable audit triggers. |
| **6** | **API Integration and Spec** | **[05. REST API Contract Specification](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/05_REST_API_SPECIFICATION.md)** | Frontend Developers, API Consumers, QA | HTTP endpoints across all 16 controllers, mandatory headers, RFC 7807 problem details, JSON request/response schemas, status codes, and client integration guide. |
| **7** | **User Security, RBAC & Error Handling** | **[10. User Security, RBAC & Error Governance](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/10_USER_SECURITY_RBAC_AND_ERROR_HANDLING.md)** | Security Engineers, Tech Leads, QA | HMAC-SHA256 JWT lifecycle, 6-role enterprise RBAC matrix, registered pharmacist verification, React 19 error boundaries, crash-proof data grids, and ASP.NET Core RFC 7807 middleware. |
| **8** | **AI Guardrails (Product Specific)** | **[11. Product-Specific AI Guardrails & Clinical Safety](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/11_AI_GUARDRAILS_PRODUCT_SPECIFIC.md)** | AI Engineers, Compliance Officers, Pharmacists | 7 domain-specific guardrails: Zero Autonomous Dispensing of Schedule H/H1/X, Pharmacopoeia zero-hallucination gate, NPPA/DPCO ceiling price limits, cold-chain bounds, DPDP patient PHI redaction, and prompt injection defense. |
| **9** | **Feature Ticket List from PRD** | **[12. Feature Ticket Catalog from PRD](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/12_FEATURE_TICKET_LIST_FROM_PRD.md)**<br>*(Companion: [06_SPRINT_ROADMAP_AND_USER_STORIES.md](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/06_SPRINT_ROADMAP_AND_USER_STORIES.md))* | Scrum Masters, Tech Leads, Developers | Jira/Linear-ready backlog of 36 production tickets across 12 Epics, story points (191 total points), roles, components, and Gherkin acceptance criteria. |
| **10** | **Deployment and Testing Runbook** | **[13. Deployment, Operations & Testing Runbook](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/13_DEPLOYMENT_AND_TESTING_RUNBOOK.md)** | DevOps, SREs, QA Automation | Step-by-step local setup, Docker Compose orchestrations, AWS Mumbai (`ap-south-1`) production rollout, automated 10-step E2E integration test script, k6 load testing for sub-2s SLA, and PITR backup drill. |

---

## 🔬 Additional Architectural References

- **[02. System Architecture & Technical Design (TDD)](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/02_SYSTEM_ARCHITECTURE_AND_TDD.md)**: Clean Architecture (.NET 9 Web API), EF Core Global Query Filter interceptors, Redis RedLock distributed locking, 2-second checkout guarantee, RabbitMQ async pipelines, and Next.js 14 POS UI architecture.
- **[04. Business Logic & Algorithmic Engines](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/04_BUSINESS_LOGIC_AND_ALGORITHMIC_ENGINES.md)**: Mathematical formulas, flowcharts, and C# implementations for FEFO allocation, split batch resolution, Indian Dual GST engine (Intra vs Inter-state), pharma scheme matrices, and 4-tier expiry horizons.

---

## 🚀 Quick Technical Summary

```
                       ┌──────────────────────────────────────────────┐
                       │   Next.js 14 App Router (Tailwind CSS v4)    │
                       │   - Real-time Executive Dashboard            │
                       │   - F1-F8 100% Zero-Mouse Rapid Billing      │
                       │   - SmartPharma Clinical Remarks Assistant   │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTPS (JWT + Tenant-Id)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          .NET 9 Clean Web API Core           │
                       │   - Multi-Tenant Global Query Filter         │
                       │   - FEFO Engine & Dual Indian GST (18ms)     │
                       │   - CDSCO Schedule & Drug License Gatekeeper │
                       │   - RedLock Distributed Concurrency Lock     │
                       └──────────────┬───────────────┬───────────────┘
                                      │               │
                     ┌────────────────┴────┐     ┌────┴────────────────┐
                     ▼                     ▼     ▼                     ▼
          ┌─────────────────────┐ ┌───────────────┐ ┌─────────────────────────┐
          │   PostgreSQL 16     │ │ Redis 7 Cache │ │ RabbitMQ 3.13 Broker    │
          │ - Logical Isolation │ │ - RedLock     │ │ - Async NIC E-Invoice   │
          │ - xmin Concurrency  │ │ - Aggregates  │ │ - Async PDF Generator   │
          │ - Immutable Audit   │ │ - Sessions    │ │ - WhatsApp/SMS Queue    │
          └─────────────────────┘ └───────────────┘ └─────────────────────────┘
```

### Key Performance SLAs:
- **Sales Invoice Commit Processing**: $\le 2.0$ seconds under 200 concurrent active billing counters (Benchmark actual: **18ms - 150ms**).
- **Operational Read APIs**: $\le 500$ ms (p95).
- **Executive Dashboard Render**: $\le 3.0$ seconds with cached Redis aggregates.
- **System Availability**: $99.9\%$ in production.
- **Data Residency**: Cloud hosting exclusively within Indian data centers (AWS Mumbai `ap-south-1` / Azure Central India).
