using Microsoft.EntityFrameworkCore;
using PharmaGrid.Domain.Entities;
using PharmaGrid.Domain.Enums;
using PharmaGrid.Infrastructure.Services;

namespace PharmaGrid.Infrastructure.Persistence;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.Products.AnyAsync())
            return;

        var tenantId = CurrentTenantService.DefaultTenantId;
        var warehouseId = Guid.Parse("b3cf8912-3490-410a-8bf7-df84918e4732");

        // 1. Seed Master Products
        var pan40 = new Product
        {
            Id = Guid.Parse("4a42b10a-1123-4c8d-b3b0-2b123d456789"),
            TenantId = tenantId,
            ProductCode = "PAN40-INJ",
            ProductName = "Pan 40mg Injection",
            GenericName = "Pantoprazole Sodium 40mg",
            ManufacturerName = "Alkem Laboratories Ltd",
            DosageForm = "Injection",
            PackSize = "1 Vial + Diluent",
            UOM = "Vials",
            HSNCode = "30049099",
            GSTPercentage = 12.00m,
            PTR = 38.00m,
            PTS = 34.20m,
            MRP = 55.00m,
            PurchaseRate = 32.00m,
            ScheduleClass = ScheduleClass.H,
            StorageCondition = StorageCondition.RoomTemperature,
            ReorderLevel = 100
        };

        var augmentin = new Product
        {
            Id = Guid.Parse("4a42b10a-2223-4c8d-b3b0-2b123d456789"),
            TenantId = tenantId,
            ProductCode = "AUG-625-TAB",
            ProductName = "Augmentin 625mg Tablet",
            GenericName = "Amoxicillin 500mg + Potassium Clavulanate 125mg",
            ManufacturerName = "GlaxoSmithKline Pharmaceuticals",
            DosageForm = "Tablet",
            PackSize = "10 Strips x 10 Tablets",
            UOM = "Strips",
            HSNCode = "30041010",
            GSTPercentage = 12.00m,
            PTR = 142.50m,
            PTS = 128.25m,
            MRP = 204.00m,
            PurchaseRate = 120.00m,
            ScheduleClass = ScheduleClass.H1,
            StorageCondition = StorageCondition.Controlled,
            ReorderLevel = 50
        };

        var insulin = new Product
        {
            Id = Guid.Parse("4a42b10a-3323-4c8d-b3b0-2b123d456789"),
            TenantId = tenantId,
            ProductCode = "HUM-MIX-100",
            ProductName = "Human Mixtard 30/70 100IU/ml",
            GenericName = "Biphasic Isophane Insulin Injection IP",
            ManufacturerName = "Novo Nordisk India",
            DosageForm = "Vial",
            PackSize = "10ml Glass Vial",
            UOM = "Vials",
            HSNCode = "30043110",
            GSTPercentage = 5.00m,
            PTR = 155.00m,
            PTS = 139.50m,
            MRP = 198.00m,
            PurchaseRate = 130.00m,
            ScheduleClass = ScheduleClass.G,
            StorageCondition = StorageCondition.ColdChain,
            ReorderLevel = 40
        };

        var dolo = new Product
        {
            Id = Guid.Parse("4a42b10a-4423-4c8d-b3b0-2b123d456789"),
            TenantId = tenantId,
            ProductCode = "DOLO-650",
            ProductName = "Dolo 650mg Tablet",
            GenericName = "Paracetamol 650mg Fast Release",
            ManufacturerName = "Micro Labs Limited",
            DosageForm = "Tablet",
            PackSize = "15 Tablets per Strip",
            UOM = "Strips",
            HSNCode = "30049099",
            GSTPercentage = 12.00m,
            PTR = 22.40m,
            PTS = 20.16m,
            MRP = 31.50m,
            PurchaseRate = 18.00m,
            ScheduleClass = ScheduleClass.Regular,
            StorageCondition = StorageCondition.RoomTemperature,
            ReorderLevel = 200
        };

        context.Products.AddRange(pan40, augmentin, insulin, dolo);

        // 2. Seed Physical Batches with FEFO Expiry (Covers all 4-Tier Horizons)
        // Batch 1A: Pan 40 low quantity to test FEFO split allocation (40 units)
        var batch1A = new Batch
        {
            Id = Guid.Parse("651f8a20-3b41-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = pan40.Id,
            BatchNumber = "P40-AUG26-01",
            ManufacturingDate = new DateOnly(2026, 8, 1),
            ExpiryDate = new DateOnly(2028, 7, 31),
            AvailableQuantity = 40,
            PTR = 38.00m,
            MRP = 55.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z1-R02-S03-B01"
        };

        // Batch 1B: Pan 40 secondary batch for FEFO split resolution
        var batch1B = new Batch
        {
            Id = Guid.Parse("7e2a9b31-4c52-493b-b64e-5f10e2345bcd"),
            TenantId = tenantId,
            ProductId = pan40.Id,
            BatchNumber = "P40-SEP26-02",
            ManufacturingDate = new DateOnly(2026, 9, 1),
            ExpiryDate = new DateOnly(2028, 12, 31),
            AvailableQuantity = 450,
            PTR = 38.00m,
            MRP = 55.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z1-R02-S03-B02"
        };

        // Batch 1C: Near-expiry Pan 40 in 0-30 Days Critical Quarantine Horizon (17 days remaining)
        var batchPanCrit = new Batch
        {
            Id = Guid.Parse("2d3e4f5a-4444-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = pan40.Id,
            BatchNumber = "P40-EXP-CRIT",
            ManufacturingDate = new DateOnly(2024, 10, 1),
            ExpiryDate = new DateOnly(2026, 10, 15),
            AvailableQuantity = 35,
            PTR = 38.00m,
            MRP = 55.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z-QUAR-R01-S01-B01",
            IsQuarantined = false
        };

        // Batch Aug: Safe Augmentin 625 batch
        var batchAug = new Batch
        {
            Id = Guid.Parse("8a1b2c3d-1111-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = augmentin.Id,
            BatchNumber = "AUG-GSK-991",
            ManufacturingDate = new DateOnly(2026, 6, 15),
            ExpiryDate = new DateOnly(2028, 5, 31),
            AvailableQuantity = 180,
            PTR = 142.50m,
            MRP = 204.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z2-R01-S01-B04"
        };

        // Batch Aug Warn: In 31-60 Days Horizon (Return-to-Supplier Debit Proposal)
        var batchAugWarn = new Batch
        {
            Id = Guid.Parse("3e4f5a6b-5555-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = augmentin.Id,
            BatchNumber = "AUG-EXP-WARN",
            ManufacturingDate = new DateOnly(2024, 11, 1),
            ExpiryDate = new DateOnly(2026, 11, 10),
            AvailableQuantity = 60,
            PTR = 142.50m,
            MRP = 204.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z2-R01-S03-B02"
        };

        // Batch Insulin: Cold Chain 2-8°C Batch
        var batchInsulin = new Batch
        {
            Id = Guid.Parse("9b2c3d4e-2222-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = insulin.Id,
            BatchNumber = "MIX-COLD-041",
            ManufacturingDate = new DateOnly(2026, 7, 1),
            ExpiryDate = new DateOnly(2027, 12, 31),
            AvailableQuantity = 120,
            PTR = 155.00m,
            MRP = 198.00m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z-COLD-R01-S01-B01"
        };

        // Batch Dolo Safe: Regular fast-moving stock
        var batchDoloSafe = new Batch
        {
            Id = Guid.Parse("1c2d3e4f-3333-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = dolo.Id,
            BatchNumber = "DOLO-SAFE-28",
            ManufacturingDate = new DateOnly(2026, 8, 10),
            ExpiryDate = new DateOnly(2028, 8, 31),
            AvailableQuantity = 500,
            PTR = 22.40m,
            MRP = 31.50m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z1-R04-S02-B03"
        };

        // Batch Dolo Promo: In 61-90 Days Horizon (B2B Fast-Clearance Promo Deal Push)
        var batchDoloProm = new Batch
        {
            Id = Guid.Parse("4f5a6b7c-6666-482a-a53f-4e09d1234abc"),
            TenantId = tenantId,
            ProductId = dolo.Id,
            BatchNumber = "DOLO-EXP-PROM",
            ManufacturingDate = new DateOnly(2024, 12, 1),
            ExpiryDate = new DateOnly(2026, 12, 10),
            AvailableQuantity = 150,
            PTR = 22.40m,
            MRP = 31.50m,
            WarehouseId = warehouseId,
            LocationRackBin = "Z1-R04-S01-B01"
        };

        context.Batches.AddRange(
            batch1A, batch1B, batchPanCrit,
            batchAug, batchAugWarn,
            batchInsulin,
            batchDoloSafe, batchDoloProm);

        // 3. Seed Customers (Including valid, inter-state, and CDSCO-expired)
        var apollo = new Customer
        {
            Id = Guid.Parse("7a328a2b-dc74-4b51-8975-d16ba6ec8911"),
            TenantId = tenantId,
            CustomerCode = "CUST-8942",
            CustomerName = "Apollo Pharmacy - Alandur Depot",
            CustomerType = "Retail Pharmacy Chain",
            GstinNumber = "33AABCA1234F1Z8",
            StateCode = "33", // Tamil Nadu (Intra-state)
            DrugLicense20B = "TN/CHE/20B/2024/9912",
            DrugLicense21B = "TN/CHE/21B/2024/9913",
            LicenseExpiryDate = new DateOnly(2028, 12, 31),
            CreditLimit = 150000.00m,
            CurrentOutstandingBalance = 38400.00m,
            Address = "42, Mount Road, Alandur, Chennai - 600016",
            PhoneNumber = "+91 98401 23456"
        };

        var manipal = new Customer
        {
            Id = Guid.Parse("7a328a2b-dc74-4b51-8975-d16ba6ec8922"),
            TenantId = tenantId,
            CustomerCode = "CUST-9012",
            CustomerName = "Manipal Health & Hospitals Pharmacy",
            CustomerType = "Super Specialty Hospital",
            GstinNumber = "29AAACH9876E1Z5",
            StateCode = "29", // Karnataka (Inter-state IGST test)
            DrugLicense20B = "KA/BNG/20B/2023/1029",
            DrugLicense21B = "KA/BNG/21B/2023/1030",
            LicenseExpiryDate = new DateOnly(2029, 6, 30),
            CreditLimit = 500000.00m,
            CurrentOutstandingBalance = 120000.00m,
            Address = "98, HAL Old Airport Road, Bengaluru - 560017",
            PhoneNumber = "+91 99000 88776"
        };

        var medplusExpired = new Customer
        {
            Id = Guid.Parse("7a328a2b-dc74-4b51-8975-d16ba6ec8933"),
            TenantId = tenantId,
            CustomerCode = "CUST-EXP-99",
            CustomerName = "MedPlus Chemist - Anna Nagar West",
            CustomerType = "Retail Pharmacy",
            GstinNumber = "33AACCM5544B1Z3",
            StateCode = "33",
            DrugLicense20B = "TN/CHE/20B/2020/4401",
            DrugLicense21B = "TN/CHE/21B/2020/4402",
            LicenseExpiryDate = new DateOnly(2025, 12, 31), // Expired - triggers CDSCO Form 20B/21B billing rejection
            CreditLimit = 100000.00m,
            CurrentOutstandingBalance = 42000.00m,
            Address = "12, 2nd Avenue, Anna Nagar West, Chennai - 600040",
            PhoneNumber = "+91 94440 11223"
        };

        context.Customers.AddRange(apollo, manipal, medplusExpired);

        // 4. Seed Suppliers
        var sunPharma = new Supplier
        {
            Id = Guid.Parse("8f828a2b-dc74-4b51-8975-d16ba6ec89d8"),
            TenantId = tenantId,
            SupplierCode = "SUP-SUN-01",
            SupplierName = "Sun Pharma Laboratories Ltd",
            GstinNumber = "33AAACS9981E1Z9",
            StateCode = "33",
            DrugLicenseNo = "TN/CHE/20B/0018",
            CurrentPayableBalance = 142500.00m,
            CreditPeriodDays = 30
        };

        var cipla = new Supplier
        {
            Id = Guid.Parse("8f828a2b-dc74-4b51-8975-d16ba6ec89e9"),
            TenantId = tenantId,
            SupplierCode = "SUP-CIPLA-02",
            SupplierName = "Cipla Healthcare Limited",
            GstinNumber = "27AAACC1122D1Z4",
            StateCode = "27",
            DrugLicenseNo = "MH/MUM/20B/8890",
            CurrentPayableBalance = 84500.00m,
            CreditPeriodDays = 45
        };

        context.Suppliers.AddRange(sunPharma, cipla);

        // 5. Seed Schemes
        var schemePan = new Scheme
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            SchemeName = "Buy 10 Get 1 Free",
            SchemeType = SchemeType.VolumetricFree,
            ManufacturerName = "Alkem Laboratories Ltd",
            ProductId = pan40.Id,
            MinOrderQuantityThreshold = 10,
            FreeQuantityUnits = 1,
            ReimbursementRatePerUnit = 42.50m,
            ValidFrom = new DateOnly(2026, 1, 1),
            ValidTo = new DateOnly(2026, 12, 31)
        };

        var schemeAug = new Scheme
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            SchemeName = "Buy 20 Get 2 Free",
            SchemeType = SchemeType.VolumetricFree,
            ManufacturerName = "GlaxoSmithKline Pharmaceuticals",
            ProductId = augmentin.Id,
            MinOrderQuantityThreshold = 20,
            FreeQuantityUnits = 2,
            ReimbursementRatePerUnit = 140.00m,
            ValidFrom = new DateOnly(2026, 1, 1),
            ValidTo = new DateOnly(2026, 12, 31)
        };

        context.Schemes.AddRange(schemePan, schemeAug);

        await context.SaveChangesAsync();
    }
}
