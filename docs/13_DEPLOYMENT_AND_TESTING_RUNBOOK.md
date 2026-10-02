# Deployment, Operations & Testing Runbook
## PharmaGrid™ Cloud Distribution ERP (.NET 9 + Next.js 14 + PostgreSQL 16)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Engineering Runbook) |
| **Target Audience** | DevOps Engineers, SREs, QA Automation Engineers, Backend/Frontend Developers |
| **Supported Environments**| Local Development, Docker Staging, AWS Mumbai (`ap-south-1`) Production |
| **Performance SLA** | Sales Invoicing $\le 2.0$s under 200 concurrent counters; Read APIs $\le 500$ms |

---

## 1. Prerequisites & Environment Configuration

### 1.1 Software Requirements Matrix
| Component | Minimum Version | Production Specification | Purpose |
| :--- | :--- | :--- | :--- |
| **.NET SDK** | `9.0.100+` | .NET 9 LTS Runtime (`aspnet:9.0-alpine`) | Core Clean Architecture Web API |
| **Node.js** | `20.12.0 LTS` | Node.js 20 Alpine Linux | Next.js 14 App Router Frontend |
| **PostgreSQL** | `16.2+` | AWS RDS Aurora PostgreSQL 16 Multi-AZ | Multi-tenant relational storage & audit triggers |
| **Redis** | `7.0+` | AWS ElastiCache for Redis 7 Cluster | RedLock distributed locking & metric cache |
| **RabbitMQ** | `3.13+` | Amazon MQ RabbitMQ Quorum Cluster | Async NIC E-Invoice & PDF generator worker |
| **Docker** | `25.0+` | Docker Engine & Docker Compose v2 | Containerized local & staging environments |

---

### 1.2 Environment Variable Configuration Schema

#### Backend Configuration (`backend/src/PharmaGrid.WebApi/appsettings.json` or Environment Variables)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=127.0.0.1;Port=5432;Database=pharmagrid_db;Username=postgres;Password=YourSecurePassword;Pooling=true;Minimum Pool Size=10;Maximum Pool Size=100;"
  },
  "Redis": {
    "ConnectionString": "127.0.0.1:6379,abortConnect=false"
  },
  "JwtSettings": {
    "SecretKey": "PHARMAGRID_SECURE_KEY_REPLACE_WITH_HIGH_ENTROPY_512_BIT_STRING_FOR_PRODUCTION_SIGNING",
    "Issuer": "https://api.pharmagrid.cloud",
    "Audience": "https://app.pharmagrid.cloud",
    "ExpiryMinutes": 480
  },
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://127.0.0.1:5050"
      }
    }
  }
}
```

#### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:5050/api/v1
NEXT_PUBLIC_TENANT_HEADER_KEY=X-Tenant-Id
NEXT_PUBLIC_DEFAULT_TENANT_ID=11111111-1111-1111-1111-111111111111
NEXT_PUBLIC_DEFAULT_BRANCH_ID=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
NEXT_PUBLIC_APP_NAME=PharmaGrid
```

---

## 2. Local Development & Seeding Runbook

Follow these exact steps to run the complete solution locally:

### Step 2.1: Initialize PostgreSQL Database & Run Schema DDL
Ensure PostgreSQL 16 is running on port 5432, then execute the schema DDL:
```powershell
# Using psql CLI to execute DDL script
psql -U postgres -d postgres -c "CREATE DATABASE pharmagrid_db;"
psql -U postgres -d pharmagrid_db -f "d:\Training\working\Cognivectra\cybe-pharma\docs\03_DATABASE_SCHEMA_POSTGRESQL.sql"
```

### Step 2.2: Launch .NET 9 Backend Web API
The backend automatically seeds essential master records (authentic SKUs, multi-tier expiry batches, chemists, suppliers, and promotional schemes) via `DataSeeder.cs` on startup.

```powershell
# Navigate to WebApi directory
cd d:\Training\working\Cognivectra\cybe-pharma\backend\src\PharmaGrid.WebApi

# Restore, build and run Kestrel on port 5050
dotnet build --configuration Release
dotnet run --no-build --configuration Release
```
*Verification*: Open browser or curl `http://127.0.0.1:5050/swagger` to inspect OpenAPI documentation.

### Step 2.3: Launch Next.js 14 Frontend Application
```powershell
# Navigate to frontend directory
cd d:\Training\working\Cognivectra\cybe-pharma\frontend

# Install dependencies if not already installed
npm install

# Start Next.js development server
npm run dev
```
*Verification*: Access `http://localhost:3000` in the browser. The live server latency indicator in the header will display `● 18ms .NET 9 API`.

---

## 3. Containerization & Docker Compose Runbook

For containerized staging and CI/CD pipelines, PharmaGrid provides a unified `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: pharmagrid-db
    environment:
      POSTGRES_DB: pharmagrid_db
      POSTGRES_USER: pg_admin
      POSTGRES_PASSWORD: SecretProductionPassword123!
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./docs/03_DATABASE_SCHEMA_POSTGRESQL.sql:/docker-entrypoint-initdb.d/init.sql
    restart: always

  redis:
    image: redis:7-alpine
    container_name: pharmagrid-redis
    ports:
      - "6379:6379"
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: src/PharmaGrid.WebApi/Dockerfile
    container_name: pharmagrid-api
    environment:
      - ConnectionStrings__DefaultConnection=Host=postgres;Port=5432;Database=pharmagrid_db;Username=pg_admin;Password=SecretProductionPassword123!;Pooling=true;
      - Redis__ConnectionString=redis:6379
      - ASPNETCORE_ENVIRONMENT=Production
      - Kestrel__Endpoints__Http__Url=http://0.0.0.0:5050
    ports:
      - "5050:5050"
    depends_on:
      - postgres
      - redis
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: pharmagrid-ui
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5050/api/v1
    ports:
      - "3000:3000"
    depends_on:
      - backend
    restart: always

volumes:
  pgdata:
```

### Docker Execution Command:
```bash
# Build images and start all services in detached background mode
docker compose up --build -d

# Inspect running container logs
docker compose logs -f backend
```

---

## 4. Production Cloud Deployment Runbook (AWS Mumbai `ap-south-1`)

### 4.1 Production Architecture Blueprint
```
Internet ──▶ AWS CloudFront (CDN) ──▶ AWS ALB (TLS 1.3)
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         AWS ECS Fargate (FE)                            AWS ECS Fargate (BE)
         Next.js 14 Container                            .NET 9 Kestrel Container
         (Port 3000, 3 Replicas)                         (Port 5050, 4 Replicas)
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │ AWS Private Isolated Data Subnet      │
                      │ ├── RDS Aurora PostgreSQL 16 Multi-AZ │
                      │ ├── ElastiCache Redis 7 Cluster       │
                      │ └── Amazon MQ (RabbitMQ 3.13)         │
                      └───────────────────────────────────────┘
```

### 4.2 Nginx Production Reverse Proxy Configuration
If hosting on Ubuntu 24.04 EC2 instances:
```nginx
upstream pharmagrid_api {
    server 127.0.0.1:5050;
    keepalive 64;
}

upstream pharmagrid_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name app.pharmagrid.cloud;

    ssl_certificate /etc/letsencrypt/live/app.pharmagrid.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.pharmagrid.cloud/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API Routing
    location /api/ {
        proxy_pass http://pharmagrid_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }

    # Frontend UI Routing
    location / {
        proxy_pass http://pharmagrid_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
    }
}
```

---

## 5. Comprehensive Testing Runbook

### 5.1 Automated End-to-End Test Suite Execution
PharmaGrid includes an automated test script [`scripts/test_e2e_backend.ps1`](file:///d:/Training/working/Cognivectra/cybe-pharma/scripts/test_e2e_backend.ps1) that verifies the full operational pipeline:

```powershell
# Execute the full 10-step E2E integration test
powershell -ExecutionPolicy Bypass -File "d:\Training\working\Cognivectra\cybe-pharma\scripts\test_e2e_backend.ps1"
```

#### Test Steps Verified:
1. **Server Health Ping**: `GET /api/v1/dashboard/summary` (HTTP 200, checks DB connection).
2. **Terminal Authentication**: `POST /api/v1/auth/login` (verifies HMAC token signature).
3. **Product Search**: `GET /api/v1/products/search?q=Pan` (sub-100ms response).
4. **Pre-Billing FEFO Allocation**: `POST /api/v1/inventory/allocate-preview` (split-batch detection).
5. **Atomic Sales Invoice Commit**: `POST /api/v1/sales/invoices` (sub-2-second benchmark, Dual GST).
6. **CDSCO Drug License Block**: Tests billing against expired customer (asserts HTTP 400 rejection).
7. **Inward GRN Ingestion**: `POST /api/v1/purchases/invoices` (creates batches, verifies `EXP > MFG`).
8. **Delivery Challans & Dispatch**: `GET /api/v1/logistics/challans` (verifies route trip sheets).
9. **Physical Stock Adjustments**: `GET /api/v1/stockmaster/summary` (asserts Physical vs Book).
10. **Statutory Audit Log**: `GET /api/v1/auditlogs` (asserts immutable append-only record creation).

---

### 5.2 Performance & Load Testing with k6 (Sub-2-Second SLA Verification)
Save this script as `load_test_checkout.js` and execute with `k6`:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp-up to 50 concurrent billing counters
    { duration: '1m', target: 200 },   // Stress test at 200 concurrent billing counters
    { duration: '30s', target: 0 },    // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'], // Sub-2-second checkout SLA
    http_req_failed: ['rate<0.01'],                // Less than 1% error rate
  },
};

export default function () {
  const payload = JSON.stringify({
    customerId: '88888888-8888-8888-8888-888888888881',
    branchId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    invoiceMode: 'CREDIT',
    customerStateCode: '33',
    items: [
      {
        productId: '4a42b10a-1123-4c8d-b3b0-2b123d456789',
        batchId: '651f8a20-3b41-482a-a53f-4e09d1234abc',
        quantityBilled: 10,
        unitPricePTR: 42.50,
        mrp: 75.00,
        discountPercentage: 0,
        gstPercentage: 12.00,
        hsnCode: '30049099'
      }
    ]
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': '11111111-1111-1111-1111-111111111111',
    },
  };

  const res = http.post('http://127.0.0.1:5050/api/v1/sales/invoices', payload, params);
  check(res, {
    'status is 201': (r) => r.status === 201,
    'execution under 2s': (r) => r.timings.duration < 2000,
  });

  sleep(0.5);
}
```
Run command: `k6 run load_test_checkout.js`

---

## 6. Operational Runbook, Disaster Recovery & Backup

### 6.1 Database Backup Schedule & Commands
- **Continuous Write-Ahead Log (WAL) Archiving**: Every 60 seconds streamed to private S3 bucket.
- **Daily Full Logical Snapshot**: Scheduled at 02:00 IST via cron job:
```bash
# Execute compressed PostgreSQL backup
pg_dump -h rds-aurora-postgres.pharmagrid.internal -U pg_admin -Fc pharmagrid_prod > /backups/pharmagrid_$(date +\%Y\%m\%d_\%H\%M\%S).dump

# Encrypt and upload to AWS S3 Mumbai
aws s3 cp /backups/pharmagrid_*.dump s3://pharmagrid-backups-mumbai/db/ --sse aws:kms
```

### 6.2 Point-in-Time Recovery (PITR) Drill
To restore database to a specific second before an accidental event:
```bash
# Restore base backup and configure recovery target time
pg_restore -h rds-aurora-postgres.pharmagrid.internal -U pg_admin -d pharmagrid_restored -v /backups/pharmagrid_base.dump
```

### 6.3 Health Checks & Synthetic Monitoring
- **Endpoint**: `GET /healthz`
- **Uptime Monitor Configuration**: Ping every 30 seconds via AWS Route 53 Health Checks. If 3 consecutive failures occur, trigger automated PagerDuty alert to on-call SRE.
