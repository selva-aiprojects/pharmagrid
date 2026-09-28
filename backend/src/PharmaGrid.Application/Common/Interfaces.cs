using PharmaGrid.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace PharmaGrid.Application.Common;

public interface ICurrentTenantService
{
    Guid TenantId { get; }
    string TenantSubdomain { get; }
    bool IsTenantResolved { get; }
}

public interface IApplicationDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Batch> Batches { get; }
    DbSet<InventoryBalance> InventoryBalances { get; }
    DbSet<Customer> Customers { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<SalesInvoice> SalesInvoices { get; }
    DbSet<SalesInvoiceItem> SalesInvoiceItems { get; }
    DbSet<Scheme> Schemes { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
