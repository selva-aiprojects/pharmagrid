namespace PharmaGrid.Domain.Enums;

public enum ScheduleClass
{
    Regular,
    G,
    H,
    H1,
    X
}

public enum StorageCondition
{
    RoomTemperature,
    ColdChain,
    Controlled,
    DeepFreeze
}

public enum InvoiceMode
{
    CASH,
    CREDIT,
    UPI,
    CARD
}

public enum InvoiceStatus
{
    Draft,
    Finalized,
    Dispatched,
    Delivered,
    Cancelled
}

public enum PaymentStatus
{
    Unpaid,
    PartiallyPaid,
    Paid,
    Overdue
}

public enum SchemeType
{
    VolumetricFree,
    FinancialDiscount,
    ManufacturerRebate
}

public enum TransactionType
{
    INVOICE,
    PAYMENT,
    CREDIT_NOTE,
    DEBIT_NOTE,
    RETURN
}
