# Technical Requirements Document (TRD) & Hosting Architecture
## PharmaGrid™ Cloud Distribution ERP (.NET 9 + Next.js 14 + PostgreSQL 16)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.1.0` (Production Engineering Baseline) |
| **Target Audience** | Enterprise Architects, DevOps, Site Reliability Engineers (SRE), Security Engineers, Backend/Frontend Leads |
| **Document Purpose** | Defines non-functional, infrastructure, hardware, security, integration, and operational technical hosting requirements |
| **Compliance Standards** | CDSCO Electronic Recordkeeping, Indian Data Protection Act (DPDP), Indian GST E-Invoicing (NIC API Schema), ISO 27001 / OWASP Top 10 |
| **Cloud Target** | Indian Sovereign Cloud Zones: AWS Mumbai (`ap-south-1`) / Microsoft Azure Central India (Pune) |

---

## 1. Executive Rationale & Architectural Scope

While the **[System Architecture & TDD](file:///d:/Training/working/Cognivectra/cybe-pharma/docs/02_SYSTEM_ARCHITECTURE_AND_TDD.md)** specifies the *code structure and architectural patterns*, this Technical Requirements Document specifies the *engineering constraints, operational capabilities, network boundaries, hardware protocols, security postures, and deployment hosting topologies* that guarantee high-availability, sub-2-second checkouts, and regulatory compliance.

```
┌────────────────────────────────────────────────────────┐
│  Product Requirements (PRS)   ──▶ WHAT the business needs
├────────────────────────────────────────────────────────┤
│  Architecture & TDD           ──▶ HOW the code is structured
├────────────────────────────────────────────────────────┤
│  Technical Requirements (TRD) ──▶ HOW the system OPERATES,
│                                   HOSTS, SCALES, PROTECTS & INTEGRATES
└────────────────────────────────────────────────────────┘
```

---

## 2. Infrastructure, Cloud Sizing & Complete Hosting Blueprint

### 2.1 Geographic Data Residency Mandate
- **Sovereign Boundary**: Under Indian pharmaceutical regulatory oversight (CDSCO) and Indian GST compliance rules, all transactional ledgers, customer records, and tax payloads must be stored and processed strictly within Indian sovereign borders.
- **Primary Cloud Region**: AWS Mumbai (`ap-south-1`) or Microsoft Azure Central India (Pune).
- **Secondary Disaster Recovery (DR) Region**: AWS Hyderabad (`ap-south-2`) or Azure South India (Chennai).

---

### 2.2 Frontend (FE) Hosting Architecture
- **Framework & Runtime**: Next.js 14 App Router running on Node.js 20 LTS.
- **Hosting Target (Primary)**:
  - **AWS ECS Fargate**: Dockerized Next.js standalone container deployed behind an AWS Application Load Balancer (ALB).
  - **Alternative Option**: Vercel Enterprise with Edge Network forced to Indian Edge Locations (`bom1` - Mumbai, `del1` - Delhi, `maa1` - Chennai).
- **Static Asset Caching & Edge CDN**:
  - AWS CloudFront or Cloudflare Indian Edge CDN configured for `/_next/static/*` and `/images/*` with cache control `public, max-age=31536000, immutable`.
- **Frontend Compute Specs**:
  - Container Size: 2 vCPU, 4 GB RAM per task.
  - Autoscaling: Minimum 3 replicas across 3 Availability Zones (AZ-1a, AZ-1b, AZ-1c). Scale out when average container CPU > 70% or P95 latency > 300ms.
- **Frontend Environment Variables (`frontend/.env.production`)**:
  ```env
  NEXT_PUBLIC_API_URL=https://api.pharmagrid.cloud/api/v1
  NEXT_PUBLIC_TENANT_HEADER_KEY=X-Tenant-Id
  NEXT_PUBLIC_APP_NAME=PharmaGrid
  NEXT_PUBLIC_DEFAULT_BRANCH_ID=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
  NEXT_PUBLIC_ENABLE_ANALYTICS=true
  NEXT_PUBLIC_ENABLE_OFFLINE_CACHE=true
  ```

---

### 2.3 Backend (BE) Hosting Architecture
- **Framework & Runtime**: ASP.NET Core 9.0 (.NET 9 LTS) compiled in Release mode with Ahead-of-Time (AOT) / optimized JIT compilation.
- **Process & Web Server**: Kestrel reverse-proxied behind AWS Application Load Balancer (ALB) or Nginx on Linux Ubuntu 24.04 LTS / Alpine Linux.
- **Hosting Target (Primary)**:
  - **AWS ECS Fargate Cluster**: Multi-container task running `mcr.microsoft.com/dotnet/aspnet:9.0-alpine`.
  - **Self-Hosted Linux EC2 Option**: 2x `c6i.xlarge` (4 vCPU, 8 GB RAM) instances managed by systemd service `pharmagrid-api.service`.
- **Backend Compute Specs**:
  - Task Sizing: 4 vCPU, 8 GB RAM per container.
  - Autoscaling: Minimum 4 replicas (scaling between 4 and 16 replicas). Scale out trigger: CPU > 65% or Active Concurrent Connections > 800.
- **Kestrel Web Server Tuning**:
  - Max concurrent connections: 25,000.
  - Request body timeout: 10 seconds.
  - Keep-alive timeout: 120 seconds.
- **Health Check Endpoint**: `/healthz` answering HTTP 200 within $\le 10$ms when DB, Redis, and internal thread pools are healthy.
- **Backend Environment Variables (`backend/src/PharmaGrid.WebApi/appsettings.Production.json`)**:
  ```json
  {
    "ConnectionStrings": {
      "DefaultConnection": "Host=rds-aurora-postgres.pharmagrid.internal;Port=5432;Database=pharmagrid_prod;Username=pg_admin;Password=${DB_PASSWORD};Pooling=true;Minimum Pool Size=20;Maximum Pool Size=120;Timeout=15;"
    },
    "Redis": {
      "ConnectionString": "elasticache-cluster.pharmagrid.internal:6379,ssl=true,abortConnect=false"
    },
    "RabbitMQ": {
      "HostName": "mq-cluster.pharmagrid.internal",
      "Port": 5672,
      "UserName": "pg_worker",
      "Password": "${MQ_PASSWORD}"
    },
    "JwtSettings": {
      "SecretKey": "${JWT_SECRET_KEY_MIN_512_BITS}",
      "Issuer": "https://api.pharmagrid.cloud",
      "Audience": "https://app.pharmagrid.cloud",
      "ExpiryMinutes": 480
    }
  }
  ```

---

### 2.4 Database (DB) Hosting Architecture
- **Primary Relational Engine**: PostgreSQL 16.2 on AWS RDS Aurora PostgreSQL (Multi-AZ Deployment).
- **Instance Sizing**:
  - Primary Writer: `db.r6g.2xlarge` (8 vCPU, 64 GB RAM, Provisioned 5,000 IOPS).
  - Read Replicas: 2x `db.r6g.xlarge` (4 vCPU, 32 GB RAM) for read-heavy executive dashboards, customer ledgers, and reporting.
- **Connection Pooling**:
  - **PgBouncer** deployed as a sidecar or dedicated service on AWS EC2 / Fargate in Transaction Pooling mode.
  - Max client connections: 5,000 concurrent billing counters.
  - Server pool size to PostgreSQL: 100 connections.
- **Distributed Caching & RedLock (Redis)**:
  - AWS ElastiCache for Redis 7.1 Cluster (3 Master Shards + 3 Read Replicas).
  - Instance sizing: `cache.m6g.large` (2 vCPU, 6.38 GB RAM per node) with At-Rest & In-Transit TLS encryption.
- **Message Broker (RabbitMQ)**:
  - Amazon MQ for RabbitMQ (3-Node Quorum Queue Cluster) for async e-invoicing and PDF generation.

---

### 2.5 Virtual Private Cloud (VPC) Topology & Networking

```
┌────────────────────────────────────────────────────────────────────────┐
│  AWS Virtual Private Cloud (VPC) - 10.100.0.0/16 (Mumbai ap-south-1)   │
│                                                                        │
│  [PUBLIC SUBNET - 10.100.1.0/24, 10.100.2.0/24]                        │
│  ├── AWS Internet Gateway (IGW)                                        │
│  ├── Application Load Balancer (ALB) - TLS 1.3 Termination             │
│  └── NAT Gateways (AZ-1a, AZ-1b)                                       │
│                                                                        │
│  [PRIVATE COMPUTE SUBNET - 10.100.10.0/24, 10.100.11.0/24]             │
│  ├── ECS Fargate Tasks (Next.js 14 Frontend)                           │
│  ├── ECS Fargate Tasks (.NET 9 Web API Core Engine)                    │
│  └── Background Workers (.NET 9 Queue Consumers)                       │
│                                                                        │
│  [ISOLATED DATA SUBNET - 10.100.20.0/24, 10.100.21.0/24]              │
│  ├── RDS Aurora PostgreSQL 16 (Multi-AZ Primary + Read Replicas)       │
│  ├── ElastiCache Redis 7 Cluster (Stock RedLock & Caching)             │
│  └── Amazon MQ (RabbitMQ Quorum Queue)                                 │
│  (Zero Internet Access - Accessible solely via Compute Security Group) │
└────────────────────────────────────────────────────────────────────────┘
```

#### Security Group Rules
- **ALB Security Group**: Inbound `443` (HTTPS) from `0.0.0.0/0`. Inbound `80` (redirect to `443`).
- **Compute Security Group**: Inbound `5000` (FE) and `5050` (BE) strictly from ALB Security Group.
- **Database Security Group**: Inbound `5432` (PostgreSQL) and `6379` (Redis) strictly from Compute Security Group. All outbound blocked.

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
│  (Actual: 18ms)  │            │    (p95: 45ms)   │            │  (Cached Redis)  │
└──────────────────┘            └──────────────────┘            └──────────────────┘
```

1. **Sales Checkout Transaction**: Under 200 concurrent active counter sessions, invoice commitment must complete in $\le 2000\text{ ms}$ (p99). In actual production testing, the .NET 9 engine commits transactions in **18ms to 150ms**.
2. **Search & Typeahead Latency**: Product and Customer lookup typeahead endpoints must respond in $\le 120\text{ ms}$ to maintain seamless typing rhythm for billing operators.
3. **High Availability**: 99.9% uptime with automated Multi-AZ failover ($\le 30$ seconds).

---

## 4. Hardware Interfaces & Peripheral Device Standards

### 4.1 Thermal Receipt & Dot-Matrix Invoicing Specifications
| Printer Category | Interface Standard | Format / Protocol | Technical Requirement |
| :--- | :--- | :--- | :--- |
| **80mm Thermal Printer** | USB / Network LAN (TCP Port 9100) | ESC/POS raw command stream | Direct browser printing via WebUSB or silent LAN print spooler agent. |
| **Dot-Matrix 80-Col** | Parallel / USB / Virtual COM | Epson ESC/P2 raw text mode | Plain-text fixed-width ASCII rendering (10 CPI, 12 CPI) to minimize print head wear and achieve $\le 1.5\text{s}$ print time per bill. |
| **Standard Laser / Inkjet** | OS Spooler (PDF Driver) | Standard A4 / Half-A4 (A5) | Generated via QuestPDF / Chromium worker using pre-rendered vector templates. |

### 4.2 Barcode & 2D DataMatrix Scanner Compatibility
- **Hardware Profile**: 1D Laser and 2D Imager Scanners (Honeywell, Zebra, TVS-E).
- **Emulation Mode**: USB Keyboard Wedge Emulation (HID Mode).
- **GS1 DataMatrix Parsing**: Support GS1 pharmaceutical standards (Application Identifiers: `(01)` GTIN, `(10)` Batch Number, `(17)` Expiry Date, `(21)` Serial Number) for automated inward GRN scanning.

---

## 5. Security, Cryptography & CDSCO Compliance

- **Authentication**: HMAC-SHA256 JWT tokens with 15-minute access token validity and 7-day refresh token rotation.
- **Encryption at Rest**: PostgreSQL transparent data encryption (TDE) / AWS KMS volume encryption with AES-256.
- **Sensitive Field Encryption**: PAN, bank details, and GST API secrets encrypted using AES-GCM-256.
- **Tamper-Evident Audit Trail**: Enforced via PostgreSQL trigger prohibiting `UPDATE` and `DELETE` queries on `T_Audit_Logs`. Minimum retention period: **5 calendar years**.

---

## 6. Observability, Telemetry & Disaster Recovery (DR)

- **Distributed Tracing**: OpenTelemetry (OTel) instrumentation exporting to Grafana Cloud / AWS CloudWatch.
- **Metrics Scraping**: Prometheus exporter on `/metrics` every 15 seconds.
- **Disaster Recovery SLAs**:
  - **Recovery Point Objective (RPO)**: $\le 5$ minutes via continuous PostgreSQL WAL archiving.
  - **Recovery Time Objective (RTO)**: $\le 30$ minutes via automated Multi-AZ standby failover.
