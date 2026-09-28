# Cybelinx Pharma Distribution (PharmaFlow)
## Product Development Engineering Specifications & Blueprint Suite

Welcome to the official Product Development Engineering Documentation suite for **PharmaFlow (Cybelinx Pharma Distribution)**. This repository contains the complete formal requirements, technical architecture design, database schema, algorithmic specifications, REST API contracts, and agile delivery backlog approved for production development.

---

## 📚 Documentation Index

| Document | Primary Audience | Contents Summary |
| :--- | :--- | :--- |
| **[01. Product Requirements Specification](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/01_PRODUCT_REQUIREMENTS_SPECIFICATION.md)** | Product Managers, Engineering Leads, QA | Executive vision, user personas, regulatory compliance (CDSCO Schedules H/H1/X, Drug License 20B/21B, Indian GST), functional scope, SLAs, and failure edge cases. |
| **[02. System Architecture & Technical Design (TDD)](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/02_SYSTEM_ARCHITECTURE_AND_TDD.md)** | Architects, Backend & Frontend Developers | Clean Architecture (.NET 8 Web API), multi-tenant logical isolation with EF Core interceptors, Redis RedLock distributed locking, 2-second checkout guarantee, RabbitMQ async pipelines, and Next.js 14 POS UI. |
| **[03. PostgreSQL Database Schema (DDL)](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/03_DATABASE_SCHEMA_POSTGRESQL.sql)** | Database Engineers, DevOps, Backend Developers | Production-ready PostgreSQL 16 DDL script defining 16 core master and transactional tables, multi-column composite indexes, check constraints, foreign keys, and immutable audit log trigger. |
| **[04. Business Logic & Algorithmic Engines](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/04_BUSINESS_LOGIC_AND_ALGORITHMIC_ENGINES.md)** | Core Backend & Domain Developers | Mathematical formulas, flowcharts, and C# implementations for FEFO allocation, split batch resolution, Indian Dual GST engine (Intra vs Inter-state), pharma scheme matrices, and 4-tier expiry horizons. |
| **[05. REST API Contract Specification](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/05_REST_API_SPECIFICATION.md)** | Frontend Developers, API Consumers, QA | HTTP endpoints, mandatory JWT/Tenant headers, RFC 7807 error structures, request/response JSON schemas for inventory verification, GRN inbound ingestion, and checkout. |
| **[06. Agile Product Backlog & Sprints](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/06_SPRINT_ROADMAP_AND_USER_STORIES.md)** | Scrum Masters, Tech Leads, Developers | 12-week MVP roadmap across 6 two-week sprints. User stories with story point estimations and formal Gherkin (`Given-When-Then`) acceptance criteria. |
| **[07. UI/UX Design System & Competitive Analysis](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/07_UI_UX_DESIGN_SYSTEM_AND_COMPETITIVE_ANALYSIS.md)** | Product Designers, Frontend Developers | Usability teardown vs C-Square and Marg ERP, F1-F8 zero-mouse keyboard design, design tokens, and inline split-allocation patterns. |
| **[08. Technical Requirements Document (TRD)](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/08_TECHNICAL_REQUIREMENTS_DOCUMENT_TRD.md)** | Architects, SREs, Security & DevOps Engineers | Infrastructure sizing, Indian cloud residency (AWS Mumbai), ESC/POS & Dot-Matrix printing standards, NIC GST E-Invoicing gateway, OWASP/CDSCO security postures, and DR SLAs. |

---

## 🚀 Quick Technical Summary

```
                       ┌──────────────────────────────────────────────┐
                       │   Next.js 14 App Router (Tailwind + shadcn)  │
                       │   - Real-time Executive Dashboard            │
                       │   - F1-F8 Keyboard High-Speed POS Billing    │
                       └──────────────────────┬───────────────────────┘
                                              │ HTTPS (JWT + Tenant-Id)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          .NET 8 Clean Web API Core           │
                       │   - Multi-Tenant Query Filter Interceptor    │
                       │   - FEFO Engine & Dual GST Calculation       │
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
- **Sales Invoice Commit Processing**: $\le 2.0$ seconds under 200 concurrent active billing counters.
- **Operational Read APIs**: $\le 500$ ms (p95).
- **Executive Dashboard Render**: $\le 3.0$ seconds with cached Redis aggregates.
- **System Availability**: $99.5\%$ in initial deployment.
- **Data Residency**: Cloud hosting exclusively within Indian data centers (AWS Mumbai / Azure Central India).
