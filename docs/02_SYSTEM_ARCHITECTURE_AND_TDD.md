# Technical Design Document (TDD) & System Architecture
## Cybelinx Pharma Distribution (PharmaFlow)

| Attribute | Specification Details |
| :--- | :--- |
| **Document Version** | `1.0.0` (Production Architecture Blueprint) |
| **System Architecture Pattern** | Clean Architecture / Modular Monolith with Event-Driven Decoupling |
| **Target Runtime** | .NET 8 LTS (ASP.NET Core Web API) on Linux Containers (Docker / K8s) |
| **Frontend Framework** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui |
| **Primary Persistence** | PostgreSQL 16 with B-Tree composite indexes & pgvector extension |
| **Cache & Distributed Lock** | Redis 7 Cluster (StackExchange.Redis + RedLock.net) |
| **Asynchronous Message Broker** | RabbitMQ 3.13 (AMQP 0-9-1 with Quorum Queues and Dead Letter Exchange) |

---

## 1. High-Level Architectural Topology

```
                              ┌───────────────────────────────────┐
                              │  Next.js 14 Web Portal & POS UI  │
                              │ (Tailwind, shadcn/ui, TanStack)   │
                              └─────────────────┬─────────────────┘
                                                │ HTTPS / WSS
                                                ▼
                              ┌───────────────────────────────────┐
                              │     Reverse Proxy / API Gateway   │
                              │    (YARP / Nginx / Envoy Ingress) │
                              └─────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 ▼                                                             ▼
┌─────────────────────────────────┐                           ┌─────────────────────────────────┐
│  PharmaFlow .NET 8 Web API Node │                           │  PharmaFlow .NET 8 Web API Node │
│ (Tenant & Auth Middleware)      │                           │ (Tenant & Auth Middleware)      │
└────────────────┬────────────────┘                           └────────────────┬────────────────┘
                 │                                                             │
                 ├──────────────────────────────┬──────────────────────────────┤
                 ▼                              ▼                              ▼
┌─────────────────────────────────┐ ┌───────────────────────────┐ ┌─────────────────────────────┐
│       PostgreSQL 16 DB          │ │       Redis 7 Cache       │ │     RabbitMQ 3.13 Broker    │
│  - Logical Tenant Isolation     │ │  - Session Tokens         │ │  - Async GST E-Invoice      │
│  - Optimistic Concurrency(xmin) │ │  - Stock Lock (RedLock)   │ │  - Async PDF Invoicing      │
│  - Immutable Audit Logs         │ │  - Cached Aggregates      │ │  - WhatsApp/SMS Dispatch    │
└─────────────────────────────────┘ └───────────────────────────┘ └──────────────┬──────────────┘
                                                                                 │ AMQP Consumer
                                                                                 ▼
                                                              ┌─────────────────────────────────┐
                                                              │  PharmaFlow Background Workers  │
                                                              │ (.NET 8 Hosted Services)        │
                                                              └─────────────────────────────────┘
```

---

## 2. Multi-Tenancy & Data Isolation Model

### 2.1 Logical Isolation Principle
PharmaFlow adopts a **Shared Database, Shared Schema with Logical Tenant Isolation** pattern. This optimizes compute costs for hundreds of stockists while maintaining strict data boundaries:
1. Every multi-tenant entity implements the `ITenantEntity` interface with a mandatory `TenantId (Guid)` property.
2. The `TenantId` is extracted from the cryptographically signed JWT token claim (`tenant_id`) during API gateway/middleware execution.
3. Every database query is automatically intercepted and appended with `WHERE TenantId = @CurrentTenantId` via Entity Framework Core Global Query Filters.
4. Multi-column composite indexes are always prefixed with `TenantId` (e.g., `(TenantId, ProductId, BatchNumber)`).

### 2.2 EF Core Global Tenant Interceptor (.NET 8)
```csharp
namespace PharmaFlow.Infrastructure.Persistence;

public interface ITenantEntity
{
    Guid TenantId { get; set; }
}

public interface ICurrentTenantService
{
    Guid TenantId { get; }
    bool IsTenantResolved { get; }
}

public class ApplicationDbContext : DbContext
{
    private readonly ICurrentTenantService _tenantService;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        ICurrentTenantService tenantService) : base(options)
    {
        _tenantService = tenantService;
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<InventoryBalance> InventoryBalances => Set<InventoryBalance>();
    public DbSet<SalesInvoice> SalesInvoices => Set<SalesInvoice>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply automatic tenant filtering to all entities implementing ITenantEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(ITenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = Expression.Parameter(entityType.ClrType, "e");
                var property = Expression.Property(parameter, nameof(ITenantEntity.TenantId));
                var tenantIdProperty = Expression.Property(
                    Expression.Constant(_tenantService),
                    nameof(ICurrentTenantService.TenantId));

                var filter = Expression.Lambda(
                    Expression.Equal(property, tenantIdProperty),
                    parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(filter);
            }
        }
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Enforce TenantId on all newly added entities
        foreach (var entry in ChangeTracker.Entries<ITenantEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                if (entry.Entity.TenantId == Guid.Empty)
                {
                    entry.Entity.TenantId = _tenantService.TenantId;
                }
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
```

---

## 3. Backend Clean Architecture Layering (.NET 8)

The backend solution structure is divided into four distinct concentric layers following Domain-Driven Design (DDD) principles:

```
src/
├── PharmaFlow.Domain/                 # Enterprise Business Rules & Entities
│   ├── Common/                       # BaseEntity, AggregateRoot, ValueObjects
│   ├── Entities/                     # Product, Batch, InventoryBalance, SalesInvoice, Customer
│   ├── Enums/                        # ScheduleClass, StorageCondition, InvoiceStatus, ReturnStatus
│   └── Exceptions/                   # DomainValidationException, InsufficientStockException
│
├── PharmaFlow.Application/            # Application Business Rules (CQRS & Use Cases)
│   ├── Common/                       # Interfaces, Behaviors, Models, Mappings
│   │   ├── Behaviors/                # ValidationBehavior, LoggingBehavior, TransactionBehavior
│   │   └── Interfaces/               # IApplicationDbContext, ICacheService, IMessageBus
│   ├── Features/
│   │   ├── Products/                 # Commands: CreateProduct, Queries: GetProductsList
│   │   ├── Inventory/                # Commands: AdjustStock, Queries: GetFefoAllocations
│   │   ├── Purchases/                # Commands: ProcessGrnInvoice, Queries: GetPurchaseOrders
│   │   └── Sales/                    # Commands: CreateSalesInvoice, Queries: GetInvoiceById
│   └── Specifications/               # Query Specifications for FEFO filtering
│
├── PharmaFlow.Infrastructure/         # External Concerns & Infrastructure Implementations
│   ├── Persistence/                  # DbContext, EntityConfigurations, Migrations, SeedData
│   ├── Caching/                      # RedisCacheService, RedLockDistributedLockManager
│   ├── Messaging/                    # RabbitMqProducer, RabbitMqConsumerService
│   ├── Tax/                          # IndianGstTaxCalculationEngine
│   └── Audit/                        # ImmutableAuditLogSink
│
└── PharmaFlow.WebApi/                 # Presentation / HTTP Entrypoints
    ├── Controllers/                  # ProductsController, SalesController, PurchasesController
    ├── Middleware/                   # TenantMiddleware, GlobalExceptionHandlerMiddleware
    ├── Extensions/                   # ServiceCollectionExtensions, SwaggerConfigurations
    └── Program.cs                    # Dependency Injection & Pipeline Setup
```

---

## 4. The 2-Second Checkout Guarantee Architecture

High-velocity pharmaceutical stockists handle continuous customer footfall, counter billing, and phone orders. A checkout delay causes severe counter bottlenecking. The PharmaFlow 2-second SLA is achieved via a dedicated execution pipeline:

```
[Billing Executive clicks "Save & Generate Invoice"]
                      │
                      ▼
[POST /api/v1/sales/invoices with Payload]
                      │
                      ├─▶ 1. Validate JWT & Resolve TenantId (~5ms)
                      ├─▶ 2. FluentValidation for Schema & Tax Attributes (~5ms)
                      │
                      ▼
[Acquire Distributed Locks via Redis RedLock]
  Key: `lock:stock:{tenantId}:{productId}:{batchId}` for all ordered lines
                      │ (Timeout: 1500ms, TTL: 3000ms)
                      ▼
[In-Memory Balance Verification & FEFO Matching against DB]
                      │ (Verify QuantityAvailable >= RequestedQty)
                      ▼
[Begin PostgreSQL Atomic Transaction]
  - Deduct QuantityAvailable in T_Inventory_Balances (Rowversion / xmin check)
  - Increment QuantityReserved / Dispatched
  - Insert SalesInvoice & Line Items into T_Sales_Invoices
  - Insert Debit entry in T_Customer_Ledger
  - Insert Audit record in T_Audit_Logs
                      │ (Commit duration: ~65-120ms)
                      ▼
[Release Redis Distributed Locks]
                      │
                      ▼
[Enqueue Async Job to RabbitMQ]
  Message: `pharma.invoice.finalized`
  - Async PDF generation & thermal receipt formatting
  - Async NIC E-Invoice JSON dispatch
  - Async WhatsApp / SMS notification
                      │ (< 5ms)
                      ▼
[Return HTTP 201 Created to Frontend Client with Invoice DTO]
Total Roundtrip Target: < 450ms (Well within 2000ms SLA)
```

---

## 5. Concurrency Control: Optimistic Locking & Deadlock Prevention

### 5.1 Dual-Tier Protection Strategy
1. **Tier 1 (Redis Distributed Lock)**: Serializes concurrent order lines attempting to allocate the same physical batch ID across separate browser tabs or billing counters. Locks are acquired in deterministic alphabetical order of `BatchId` to prevent circular deadlocks.
2. **Tier 2 (PostgreSQL `xmin` Concurrency Token)**: Ensures that even in the unlikely event of a Redis node failover or network partition, the PostgreSQL database rejects stale row updates:

```csharp
public class InventoryBalanceConfiguration : IEntityTypeConfiguration<InventoryBalance>
{
    public void Configure(EntityTypeBuilder<InventoryBalance> builder)
    {
        builder.ToTable("T_Inventory_Balances");
        builder.HasKey(b => b.InventoryBalanceId);

        // Map PostgreSQL system column xmin as concurrency token
        builder.Property<uint>("xmin")
               .HasColumnType("xid")
               .ValueGeneratedOnAddOrUpdate()
               .IsConcurrencyToken();
    }
}
```

---

## 6. RabbitMQ Message Broker Topology

```
                  ┌───────────────────────────────┐
                  │   Direct / Topic Exchange:    │
                  │     "pharma.events.topic"     │
                  └───────────────┬───────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │ Routing Key:           │ Routing Key:           │ Routing Key:
         │ "invoice.created"      │ "invoice.created"      │ "stock.expired"
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Queue:           │    │ Queue:           │    │ Queue:           │
│ q.einvoice.nic   │    │ q.invoice.pdf    │    │ q.expiry.alerts  │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Consumer:        │    │ Consumer:        │    │ Consumer:        │
│ NIC E-Invoice    │    │ Chromium /       │    │ WhatsApp / Email │
│ Sync Service     │    │ QuestPDF Worker  │    │ Dispatcher       │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### Dead Letter Exchange (DLX) Policy
All queues configure an argument `x-dead-letter-exchange: "pharma.dlx"`. Messages that fail execution after 3 exponential backoff retries (1s, 5s, 30s) are automatically routed to `q.deadletter` for manual administrative intervention and alerting.

---

## 7. Frontend UI Architecture (Next.js 14)

### 7.1 Architecture & State Model
- **Next.js 14 App Router**: Route-based organization with `/dashboard`, `/inventory`, `/sales/billing`, `/purchases`, `/schemes`, `/reports`.
- **Server Components (RSC)**: Used for initial page shells, master data pre-fetching, and read-only reports.
- **Client Components ('use client')**: Used for interactive, high-speed interfaces like the Sales Invoicing Grid, Batch Allocator, and Live Picking Queue.
- **State Management**:
  - `Zustand`: Invoicing Cart Store (manages line items, keyboard shortcuts, scheme triggers, live tax subtotals with zero re-render lag).
  - `TanStack Query (React Query v5)`: Server state caching, optimistic updates, and background refetching.

### 7.2 Sales Billing Keyboard Accelerator Matrix
Pharmaceutical billing operators prioritize keyboard-only navigation over mouse interaction:

| Key Binding | Action Triggered | UI Response |
| :--- | :--- | :--- |
| **`F1`** | Focus Customer Search Field | Opens customer modal with recent purchase history & credit balance |
| **`F2`** | Insert New Line Item | Focus jumps to product autocomplete in the active table row |
| **`F3`** | Batch Selection Override | Opens modal showing all available batches with expiry & rack locations |
| **`F4`** | Toggle Scheme Inspector | Shows eligible schemes (Volumetric / Cash discount) for active row |
| **`F8`** / **`Ctrl + Enter`** | Save & Finalize Invoice | Triggers invoice commit pipeline; opens print receipt dialogue |
| **`Escape`** | Cancel / Clear Current Row | Restores previous valid state or closes active lookup overlay |
