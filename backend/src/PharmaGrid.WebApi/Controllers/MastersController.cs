using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class MastersController : ControllerBase
{
    // 1. Manufacturers Master Store
    private static readonly List<ManufacturerMasterDto> ManufacturersStore = new()
    {
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-SUN", "Sun Pharma Laboratories Ltd", "Cardiology, Gastro & Neuro", "100% Credit Note within 60 days of expiry", "+91 98401 11221", "rep.chennai@sunpharma.com", true, 42),
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-CIP", "Cipla Healthcare Distributions", "Respiratory, Anti-infectives & Critical Care", "100% Replacement or Credit Note", "+91 98402 22332", "orders.tn@cipla.com", true, 38),
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-GSK", "GlaxoSmithKline Pharmaceuticals Ltd", "Vaccines, Antibiotics & Derma", "90% Credit Note on breakages", "+91 98403 33443", "gsk.depot@gsk.com", true, 26),
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-ABT", "Abbott Healthcare Pvt Ltd", "Metabolic, Nutrition & Gastroenterology", "Full Credit Note on short expiries", "+91 98404 44554", "supply@abbott.in", true, 31),
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-NOVO", "Novo Nordisk India Pvt Ltd", "Insulins & Diabetes Care (Strict Cold-Chain)", "Replacement only with cold-chain logger data", "+91 98405 55665", "insulin.tn@novonordisk.com", true, 14),
        new ManufacturerMasterDto(Guid.NewGuid(), "MFG-MIC", "Micro Labs Ltd", "Cardiovascular & General Analgesics", "100% Credit Note within 90 days", "+91 98406 66776", "microlabs.chennai@microlabs.in", true, 29)
    };

    // 2. Categories Master Store
    private static readonly List<CategoryMasterDto> CategoriesStore = new()
    {
        new CategoryMasterDto(Guid.NewGuid(), "Anti-Infectives", "Antibiotics, Antifungals & Antivirals", "Schedule H1", "Ambient (< 25°C)", true, 18),
        new CategoryMasterDto(Guid.NewGuid(), "Gastrointestinal", "Proton Pump Inhibitors & Antacids", "Schedule H", "Ambient (< 25°C)", true, 14),
        new CategoryMasterDto(Guid.NewGuid(), "Antidiabetic (Cold Chain)", "Insulins & GLP-1 Analogues", "Schedule G", "Cold Storage (2°C - 8°C)", true, 8),
        new CategoryMasterDto(Guid.NewGuid(), "Cardiovascular & Lipids", "Statins, Beta Blockers & ACE Inhibitors", "Schedule H", "Ambient (< 25°C)", true, 22),
        new CategoryMasterDto(Guid.NewGuid(), "Analgesics & Antipyretics", "Pain relief, NSAIDs & Paracetamol", "OTC / General", "Ambient (< 25°C)", true, 12),
        new CategoryMasterDto(Guid.NewGuid(), "Controlled Psychotropics", "Sedatives & Schedule X Formulations", "Schedule X", "Double-Lock Vault (< 25°C)", true, 4)
    };

    // 3. Warehouse Racks / Bin Locations Store
    private static readonly List<WarehouseRackDto> RacksStore = new()
    {
        new WarehouseRackDto(Guid.NewGuid(), "A-01-02-01", "Zone A - Fast Moving Retail", "Rack A1", "Shelf 02", "Bin 01", "Ambient", 1500, 1100, "In Use"),
        new WarehouseRackDto(Guid.NewGuid(), "A-01-02-02", "Zone A - Fast Moving Retail", "Rack A1", "Shelf 02", "Bin 02", "Ambient", 1500, 800, "In Use"),
        new WarehouseRackDto(Guid.NewGuid(), "B-03-01-04", "Zone B - Antibiotics Bay", "Rack B3", "Shelf 01", "Bin 04", "Ambient", 2000, 600, "In Use"),
        new WarehouseRackDto(Guid.NewGuid(), "C-02-03-01", "Zone C - Bulk Pallets", "Rack C2", "Shelf 03", "Bin 01", "Ambient", 5000, 3400, "In Use"),
        new WarehouseRackDto(Guid.NewGuid(), "FRG-CHAMBER-01", "Cold Room Chamber 1", "Fridge Bay 1", "Shelf 01", "Tray 01", "Cold Chain (2°C - 8°C)", 800, 140, "In Use"),
        new WarehouseRackDto(Guid.NewGuid(), "Q-00-01-01", "Quarantine & Breakage Bay", "Secure Bay Q", "Shelf 01", "Bin 01", "Locked Quarantine", 500, 60, "Audit Locked")
    };

    // 4. Tax Slabs & HSN Store
    private static readonly List<HsnTaxMasterDto> HsnTaxStore = new()
    {
        new HsnTaxMasterDto(Guid.NewGuid(), "30049099", "General medicaments consisting of mixed or unmixed products", 12.0m, 6.0m, 6.0m, 12.0m, "Standard Pharma GST", true),
        new HsnTaxMasterDto(Guid.NewGuid(), "30041010", "Medicaments containing penicillins or derivatives thereof (Ampicillin/Amoxicillin)", 12.0m, 6.0m, 6.0m, 12.0m, "Standard Antibiotic Slab", true),
        new HsnTaxMasterDto(Guid.NewGuid(), "30043110", "Medicaments containing insulin (Recombinant DNA origin)", 5.0m, 2.5m, 2.5m, 5.0m, "Essential Life-Saving Medicine (Concessional)", true),
        new HsnTaxMasterDto(Guid.NewGuid(), "30049060", "Medicaments containing paracetamol formulations", 12.0m, 6.0m, 6.0m, 12.0m, "Analgesic Standard Slab", true),
        new HsnTaxMasterDto(Guid.NewGuid(), "21069099", "Nutraceutical dietary supplements and multivitamins", 18.0m, 9.0m, 9.0m, 18.0m, "Nutraceutical Standard Slab", true)
    };

    // 5. Delivery Routes Store
    private static readonly List<DeliveryRouteDto> RoutesStore = new()
    {
        new DeliveryRouteDto(Guid.NewGuid(), "Route 1: Central & South Loop", "T. Nagar - Saidapet - Guindy - Airport", "TN-09-CB-4821 (Tata Ace)", "K. Ramanathan", "+91 98402 99881", 34, "Twice Daily (Morning/Evening)", 85000.00m),
        new DeliveryRouteDto(Guid.NewGuid(), "Route 2: North Chennai & Port", "Parrys - Royapuram - Washermanpet - Tollgate", "TN-04-AK-7190 (Mahindra Bolero)", "M. Saravanan", "+91 98404 33221", 28, "Daily Morning (9:00 AM)", 120000.00m),
        new DeliveryRouteDto(Guid.NewGuid(), "Route 3: Western Suburbs", "Koyambedu - Porur - Poonamallee Industrial", "TN-12-DE-5544 (Tata 407)", "P. Velmurugan", "+91 98407 77889", 42, "Daily Afternoon (1:30 PM)", 95000.00m),
        new DeliveryRouteDto(Guid.NewGuid(), "Route 4: Hospital Direct Supply", "Apollo Greams Rd - MIOT - Kauvery Hospital", "TN-01-EE-3321 (Temp Controlled)", "S. David", "+91 98409 11002", 12, "Scheduled Emergency 24x7", 350000.00m)
    };

    // Endpoints
    [HttpGet("summary")]
    public IActionResult GetMastersSummary()
    {
        return Ok(new
        {
            totalManufacturers = ManufacturersStore.Count,
            totalCategories = CategoriesStore.Count,
            totalRacks = RacksStore.Count,
            totalHsnCodes = HsnTaxStore.Count,
            totalRoutes = RoutesStore.Count
        });
    }

    [HttpGet("manufacturers")]
    public ActionResult<List<ManufacturerMasterDto>> GetManufacturers() => Ok(ManufacturersStore);

    [HttpPost("manufacturers")]
    public ActionResult<ManufacturerMasterDto> AddManufacturer([FromBody] CreateManufacturerRequest req)
    {
        var item = new ManufacturerMasterDto(Guid.NewGuid(), req.Code, req.Name, req.Divisions, req.ReturnPolicy, req.Phone, req.Email, true, 0);
        ManufacturersStore.Insert(0, item);
        return Created("", item);
    }

    [HttpGet("categories")]
    public ActionResult<List<CategoryMasterDto>> GetCategories() => Ok(CategoriesStore);

    [HttpPost("categories")]
    public ActionResult<CategoryMasterDto> AddCategory([FromBody] CreateCategoryRequest req)
    {
        var item = new CategoryMasterDto(Guid.NewGuid(), req.Name, req.Description, req.ScheduleClass, req.StorageCondition, true, 0);
        CategoriesStore.Insert(0, item);
        return Created("", item);
    }

    [HttpGet("racks")]
    public ActionResult<List<WarehouseRackDto>> GetRacks() => Ok(RacksStore);

    [HttpPost("racks")]
    public ActionResult<WarehouseRackDto> AddRack([FromBody] CreateRackRequest req)
    {
        var item = new WarehouseRackDto(Guid.NewGuid(), req.BinCode, req.Zone, req.Rack, req.Shelf, req.Bin, req.StorageType, req.Capacity, 0, "Available");
        RacksStore.Insert(0, item);
        return Created("", item);
    }

    [HttpGet("hsn-tax")]
    public ActionResult<List<HsnTaxMasterDto>> GetHsnTax() => Ok(HsnTaxStore);

    [HttpGet("routes")]
    public ActionResult<List<DeliveryRouteDto>> GetRoutes() => Ok(RoutesStore);
}

// Records
public record ManufacturerMasterDto(Guid Id, string Code, string Name, string Divisions, string ReturnPolicy, string Phone, string Email, bool IsActive, int SkuCount);
public record CreateManufacturerRequest(string Code, string Name, string Divisions, string ReturnPolicy, string Phone, string Email);

public record CategoryMasterDto(Guid Id, string Name, string Description, string ScheduleClass, string StorageCondition, bool IsActive, int SkuCount);
public record CreateCategoryRequest(string Name, string Description, string ScheduleClass, string StorageCondition);

public record WarehouseRackDto(Guid Id, string BinCode, string Zone, string Rack, string Shelf, string Bin, string StorageType, int Capacity, int Occupied, string Status);
public record CreateRackRequest(string BinCode, string Zone, string Rack, string Shelf, string Bin, string StorageType, int Capacity);

public record HsnTaxMasterDto(Guid Id, string HsnCode, string Description, decimal GstRate, decimal CgstRate, decimal SgstRate, decimal IgstRate, string SlabName, bool IsActive);

public record DeliveryRouteDto(Guid Id, string RouteName, string AreaCoverage, string VehicleAssigned, string DriverName, string DriverPhone, int ChemistCount, string Frequency, decimal TargetCodCollection);
