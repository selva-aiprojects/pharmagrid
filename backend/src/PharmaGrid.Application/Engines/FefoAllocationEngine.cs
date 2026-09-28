using PharmaGrid.Domain.Entities;

namespace PharmaGrid.Application.Engines;

public record BatchAllocation(
    Guid BatchId,
    string BatchNumber,
    DateOnly ExpiryDate,
    int AllocatedQuantity,
    string LocationRackBin,
    decimal PTR,
    decimal MRP);

public record FefoAllocationResult(
    bool IsFullyAllocated,
    bool IsSplitAllocation,
    int TotalAllocated,
    int UnfulfilledQuantity,
    IReadOnlyList<BatchAllocation> Allocations);

public class FefoAllocationEngine
{
    private const int MinRemainingShelfLifeDays = 60;

    public FefoAllocationResult AllocateStock(
        IEnumerable<Batch> availableBatches,
        int requestedQuantity,
        DateOnly currentDate)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(requestedQuantity);

        var expiryCutoff = currentDate.AddDays(MinRemainingShelfLifeDays);

        // Filter out batches expiring in <= 60 days, and zero stock
        var eligibleBatches = availableBatches
            .Where(b => b.ExpiryDate > expiryCutoff && b.AvailableQuantity > 0 && !b.IsQuarantined)
            .OrderBy(b => b.ExpiryDate)
            .ThenBy(b => b.BatchNumber)
            .ToList();

        var allocations = new List<BatchAllocation>();
        int remainingToAllocate = requestedQuantity;

        foreach (var batch in eligibleBatches)
        {
            int allocatable = Math.Min(remainingToAllocate, batch.AvailableQuantity);

            allocations.Add(new BatchAllocation(
                batch.Id,
                batch.BatchNumber,
                batch.ExpiryDate,
                allocatable,
                batch.LocationRackBin,
                batch.PTR,
                batch.MRP));

            remainingToAllocate -= allocatable;

            if (remainingToAllocate == 0)
                break;
        }

        return new FefoAllocationResult(
            IsFullyAllocated: remainingToAllocate == 0,
            IsSplitAllocation: allocations.Count > 1,
            TotalAllocated: requestedQuantity - remainingToAllocate,
            UnfulfilledQuantity: remainingToAllocate,
            Allocations: allocations.AsReadOnly());
    }
}
