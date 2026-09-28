# Technical Requirements Document (TRD)
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Engineering Baseline) |
| **Target Audience** | Enterprise Architects, DevOps, Site Reliability Engineers (SRE), Security Engineers, Backend/Frontend Leads |
| **Document Purpose** | Defines non-functional, infrastructure, hardware, security, integration, and operational technical requirements |
| **Compliance Standards** | CDSCO Electronic Recordkeeping, Indian Data Protection Act (DPDP), Indian GST E-Invoicing (NIC API Schema), ISO 27001 / OWASP Top 10 |

---

## 1. Executive Rationale: Why a Separate TRD is Essential

While the **[System Architecture & TDD](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/02_SYSTEM_ARCHITECTURE_AND_TDD.md)** specifies the *code structure and architectural patterns* (Clean Architecture, Entity Framework interceptors, React state), the **Technical Requirements Document (TRD)** specifies the *engineering constraints, operational capabilities, network boundaries, hardware protocols, security postures, and deployment targets* that guarantee competitive dominance over legacy desktop software (C-Square, Marg ERP).

```
┌────────────────────────────────────────────────────────┐
│  Product Requirements (PRS)   ──▶ WHAT the business needs
├────────────────────────────────────────────────────────┤
│  Architecture & TDD           ──▶ HOW the code is structured
├────────────────────────────────────────────────────────┤
│  Technical Requirements (TRD) ──▶ HOW the system OPERATES,
│                                   SCALES, PROTECTS & INTEGRATES
└────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure, Cloud Sizing & Hosting Specifications

### 2.1 Geographic Data Residency & Regional Hosting
- **Mandate**: Under Indian pharmaceutical regulatory oversight and GST compliance, all transactional ledgers, customer records, and tax payloads must be stored and processed strictly within Indian sovereign borders.
- **Primary Cloud Region**: AWS Mumbai (`ap-south-1`) or Microsoft Azure Central India (Pune).
- **Secondary Disaster Recovery (DR) Region**: AWS Hyderabad (`ap-south-2`) or Azure South India (Chennai).

### 2.2 Containerization & Compute Resource Matrix

| Component / Service | Technology Runtime | Minimum CPU / RAM (Single Node) | Production Cluster Sizing | Auto-Scaling Policy |
| :--- | :--- | :--- | :--- | :--- |
| **Web Portal & POS Frontend** | Next.js 14 / Node.js 20 LTS | 2 vCPU / 4 GB RAM | 3 Replicas behind Nginx / ALB | CPU > 70% or Latency > 300ms |
| **Core API Web Service** | .NET 8 LTS (Kestrel) | 4 vCPU / 8 GB RAM | 4 Replicas (HPA 2 to 12 nodes) | CPU > 65% or Active Conn > 800 |
| **Async Background Workers** | .NET 8 Hosted Services | 2 vCPU / 4 GB RAM | 2 Replicas per queue category | Queue depth > 500 messages |
| **Relational Database** | PostgreSQL 16 (Managed RDS) | 8 vCPU / 32 GB RAM, Provisioned IOPS (3000) | Multi-AZ Primary + 2 Read Replicas | Storage auto-growth enabled |
| **Distributed Cache & Locks** | Redis 7 Cluster | 4 vCPU / 16 GB RAM | 3 Master + 3 Replica Shards | Memory utilization > 75% |
| **Message Broker** | RabbitMQ 3.13 | 4 vCPU / 8 GB RAM | 3-Node Quorum Queue Cluster | Disk space alarm < 20% |

### 2.3 Network, Ingress & Gateway Architecture
- **Reverse Proxy / API Gateway**: Envoy / YARP / Cloudflare Enterprise.
- **TLS Protocol**: TLS 1.3 mandatory; fallback to TLS 1.2 permitted. TLS 1.0/1.1 strictly blocked at edge.
- **HTTP Version**: HTTP/2 enabled for all REST APIs; WebSocket support enabled for live warehouse picking queues.
- **Edge CDN**: Cloudflare Indian Edge (Mumbai, Delhi, Chennai, Bangalore, Hyderabad) for static Next.js assets (`/_next/static/*`).

---

## 3. Performance, Concurrency & High-Availability SLAs

```
                      ┌────────────────────────────────────────┐
                      │    END-TO-END PERFORMANCE BUDGETS      │
                      └──────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│  Sales Checkout  │            │  Read API Calls  │            │  Dashboard Paint │
│   < 2.0 Seconds  │            │     < 500 ms     │            │   < 3.0 Seconds  │
│  (Target: 142ms) │            │     (p95: 85ms)  │            │  (Cached Redis)  │
└──────────────────┘            └──────────────────┘            └──────────────────┘
```

### 3.1 Specific Latency & Concurrency Targets
1. **Sales Checkout Transaction**: Under 200 concurrent active counter sessions, invoice commitment must complete in $\le 2000\text{ ms}$ (p99) and $\le 500\text{ ms}$ (p95).
2. **Search & Typeahead Latency**: Product and Customer lookup typeahead endpoints must respond in $\le 120\text{ ms}$ to maintain seamless typing rhythm for billing operators.
3. **Database Connection Pooling**:
   - Connection pool managed via **PgBouncer** in transaction pooling mode.
   - Max client connections: `5,000`. Server connection pool per node: `50–100`.
4. **Redis Cache Eviction & Key Expiry Policies**:
   - Eviction policy: `volatile-lru` (Least Recently Used with explicit TTL).
   - Stock lock TTL: `3,000 ms` with deterministic alphabetical acquisition to prevent deadlocks.
   - Dashboard KPI cache TTL: `60 seconds` with background worker refresh.

---

## 4. Hardware Interfaces & Peripheral Device Standards

Legacy systems (C-Square, Marg) force operators into proprietary print drivers and USB dongles. PharmaFlow abstracts hardware through open, standard web and network protocols:

### 4.1 Thermal Receipt & Dot-Matrix Invoicing Specifications
Distributors in India use two printing formats: 80mm/58mm high-speed thermal rolls for cash counter receipts and 80-column 24-pin continuous Dot-Matrix printers (TVS, Epson) for statutory multi-part GST tax invoices.

| Printer Category | Interface Standard | Format / Protocol | Technical Requirement |
| :--- | :--- | :--- | :--- |
| **80mm Thermal Printer** | USB / Network LAN (TCP Port 9100) | ESC/POS raw command stream | Direct browser printing via WebUSB or silent LAN print spooler agent. |
| **Dot-Matrix 80-Col** | Parallel / USB / Virtual COM | Epson ESC/P2 raw text mode | Plain-text fixed-width ASCII rendering (10 CPI, 12 CPI) to minimize print head wear and achieve $\le 1.5\text{s}$ print time per bill. |
| **Standard Laser / Inkjet** | OS Spooler (PDF Driver) | Standard A4 / Half-A4 (A5) | Generated via QuestPDF / Chromium worker using pre-rendered vector templates. |

### 4.2 Barcode & 2D DataMatrix Scanner Compatibility
- **Hardware Profile**: 1D Laser and 2D Imager Scanners (Honeywell, Zebra, TVS-E).
- **Emulation Mode**: USB Keyboard Wedge Emulation (HID Mode).
- **Scanner Configuration**:
  - Preamble/Prefix: Standard (none required).
  - Postamble/Suffix: `[Enter]` or `[Tab]` character.
  - Scanning Speed: The frontend input handler must ingest rapid keystroke bursts ($< 25\text{ ms}$ inter-character interval) without losing characters or dropping focus.
- **GS1 DataMatrix Parsing**: Support GS1 pharmaceutical standards (Application Identifiers: `(01)` GTIN, `(10)` Batch Number, `(17)` Expiry Date, `(21)` Serial Number) for automated inward GRN scanning.

---

## 5. Security, Cryptography & Statutory Audit Engineering

### 5.1 Authentication & Session Token Management
- **Token Mechanism**: Dual-Token JWT architecture (Short-lived Access Token: 15-minute validity; Long-lived Refresh Token: 7-day validity with sliding window).
- **Signing Algorithm**: Asymmetric `RS256` (RSA 2048-bit private key signing, public key verification) or HMAC `HS256` with high-entropy 512-bit secrets stored in AWS Secrets Manager / Azure Key Vault.
- **Claims Embedded**:
  ```json
  {
    "sub": "user_uuid",
    "tenant_id": "tenant_uuid",
    "branch_id": "branch_uuid",
    "role": "BillingExecutive",
    "iat": 1790580000,
    "exp": 1790580900
  }
  ```

### 5.2 Cryptography Standards & Data Encryption
- **Encryption at Rest**: PostgreSQL transparent data encryption (TDE) or AWS KMS / Azure Key Vault volume encryption with AES-256.
- **Sensitive Field Level Encryption**: Customer PAN, Bank Account details, and GST API secret keys encrypted using AES-GCM-256 before database insertion.
- **Password Hashing**: PBKDF2 with SHA-256 (600,000 iterations) or Argon2id with 64 MB memory cost and 3 iterations.

### 5.3 Tamper-Evident Audit Logging (CDSCO Compliance)
- **Mandate**: Drugs & Cosmetics Act and CDSCO electronic audit trail requirements prohibit non-traceable edits to batch, sales, or financial records.
- **Architecture**:
  - Centralized table `T_Audit_Logs` enforced with a PostgreSQL trigger prohibiting `UPDATE` and `DELETE` queries.
  - Changes record `PayloadBeforeChanges` and `PayloadAfterChanges` in indexed `JSONB` columns.
  - Minimum retention period: **5 calendar years** with cold tier S3/Azure Blob Glacier archiving.

---

## 6. External B2B Integrations & Protocol Gateways

### 6.1 National Informatics Centre (NIC) GST E-Invoice Integration
All pharmaceutical distributors with annual turnover exceeding the statutory threshold must generate an official Invoice Reference Number (IRN) and signed QR code for every B2B sales invoice.

```
[Sales Invoice Committed]
           │
           ▼
[RabbitMQ Queue: q.einvoice.nic]
           │
           ▼
[NIC E-Invoice Worker Service]
  - Formats JSON payload adhering to NIC Schema v1.04 (Govt. of India)
  - Signs payload using distributor's GST API credentials
  - Calls NIC REST Endpoint: `POST /api/invoice/v1.04/genirn`
  - Receives IRN (64-char hex hash) + SignedQRCode string
           │
           ▼
[Persists IRN in T_Sales_Invoices & updates UI via Server-Sent Events (SSE)]
```

### 6.2 Omnichannel Messaging Gateways (WhatsApp / SMS / Email)
- **WhatsApp Cloud API / Gupshup / Exotel**: Used for instantaneous dispatch of invoice PDF download links and payment receipt acknowledgments directly to pharmacy chemist mobile phones.
- **SMS Gateway (DLT Approved)**: Mandatory India DLT (Distributed Ledger Technology) compliant SMS templates for OTPs and high-priority credit limit alerts.
- **Email Gateway (SendGrid / AWS SES)**: End-of-day sales summaries, supplier purchase orders, and monthly ledger statements in PDF format.

### 6.3 Accounting Software Export Gateways (Tally / Zoho Books)
While PharmaFlow provides a full native double-entry ledger, many Indian distributors' chartered accountants (CAs) mandate monthly data export to Tally Prime:
- **Tally XML Bridge**: Automated export of Sales Invoices, Credit Notes, Purchase GRNs, and Bank Receipts formatted in standard Tally XML schema for seamless import via Tally ODBC / Server import.

---

## 7. Observability, Telemetry & Disaster Recovery (DR)

### 7.1 Distributed Tracing & Health Monitoring
- **Tracing Standard**: OpenTelemetry (OTel) instrumentation across all .NET 8 Web API microservices and Next.js frontend calls.
- **Metrics Collection**: Prometheus exporter scraping `/metrics` endpoint every 15 seconds.
- **Critical Alert Triggers**:
  - `HighErrorRate`: > 1% HTTP 5xx responses over 5 minutes.
  - `CheckoutSlaBreach`: Invoice commit latency > 2.0s for > 5 consecutive requests.
  - `StockLockContention`: Redis lock wait timeout rate > 2%.
  - `DiskSpaceLow`: Database or RabbitMQ volume > 80% capacity.

### 7.2 Disaster Recovery (DR) & Backup Matrix
- **Recovery Point Objective (RPO)**: **$\le$ 5 minutes** (achieved via PostgreSQL Write-Ahead Log (WAL) continuous archiving to multi-region cloud object storage).
- **Recovery Time Objective (RTO)**: **$\le$ 30 minutes** (automated failover to standby replica in secondary cloud zone).
- **Backup Schedule**:
  - Full automated snapshot: Daily at 02:00 IST.
  - Continuous incremental WAL streaming: Every 60 seconds.
  - Retention: 30 days daily backups, 12 monthly archives, 5 annual statutory archives.
