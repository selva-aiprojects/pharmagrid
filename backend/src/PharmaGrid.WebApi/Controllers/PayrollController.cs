using Microsoft.AspNetCore.Mvc;
using PharmaGrid.Application.Common;
using PharmaGrid.Application.DTOs;

namespace PharmaGrid.WebApi.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class PayrollController : ControllerBase
{
    private static readonly List<SalarySlipDto> SlipsStore = new()
    {
        new SalarySlipDto(
            Id: Guid.Parse("60000000-0000-0000-0000-000000000001"),
            EmployeeId: Guid.Parse("00000000-0000-0000-0000-000000000001"),
            EmployeeName: "Selva Kumaran",
            RoleName: "Managing Director & Pharmacist",
            PanNumber: "ABCDE1234F",
            UanNumber: "101299887711",
            MonthYear: "September 2026",
            TotalWorkingDays: 26,
            DaysWorked: 26,
            LopDays: 0,
            BasicSalary: 55000.00m,
            Hra: 22000.00m,
            ConveyanceAllowance: 8000.00m,
            MedicalAllowance: 5000.00m,
            SpecialAllowance: 10000.00m,
            GrossEarnings: 100000.00m,
            PfEmployeeDeduction: 1800.00m,
            EsiEmployeeDeduction: 0.00m,
            ProfessionalTax: 208.00m,
            TdsDeduction: 5000.00m,
            TotalDeductions: 7008.00m,
            NetSalary: 92992.00m,
            NetSalaryInWords: "Ninety Two Thousand Nine Hundred and Ninety Two Rupees Only",
            PaymentStatus: "Paid",
            PaymentReference: "NEFT-HDFC-2026092801",
            ProcessedDate: DateTime.UtcNow.AddDays(-2)
        ),
        new SalarySlipDto(
            Id: Guid.Parse("60000000-0000-0000-0000-000000000002"),
            EmployeeId: Guid.Parse("00000000-0000-0000-0000-000000000002"),
            EmployeeName: "Suresh Babu",
            RoleName: "Senior Billing Executive",
            PanNumber: "BKPPB4321A",
            UanNumber: "101299887722",
            MonthYear: "September 2026",
            TotalWorkingDays: 26,
            DaysWorked: 25,
            LopDays: 1,
            BasicSalary: 20000.00m,
            Hra: 8000.00m,
            ConveyanceAllowance: 3000.00m,
            MedicalAllowance: 2000.00m,
            SpecialAllowance: 2000.00m,
            GrossEarnings: 33653.85m,
            PfEmployeeDeduction: 1800.00m,
            EsiEmployeeDeduction: 252.40m,
            ProfessionalTax: 208.00m,
            TdsDeduction: 0.00m,
            TotalDeductions: 2260.40m,
            NetSalary: 31393.45m,
            NetSalaryInWords: "Thirty One Thousand Three Hundred and Ninety Three Rupees Only",
            PaymentStatus: "Paid",
            PaymentReference: "NEFT-HDFC-2026092802",
            ProcessedDate: DateTime.UtcNow.AddDays(-2)
        ),
        new SalarySlipDto(
            Id: Guid.Parse("60000000-0000-0000-0000-000000000003"),
            EmployeeId: Guid.Parse("00000000-0000-0000-0000-000000000003"),
            EmployeeName: "K. Ramanathan",
            RoleName: "Depot Logistics & Delivery In-charge",
            PanNumber: "CRRPK9876C",
            UanNumber: "101299887733",
            MonthYear: "September 2026",
            TotalWorkingDays: 26,
            DaysWorked: 26,
            LopDays: 0,
            BasicSalary: 18000.00m,
            Hra: 7200.00m,
            ConveyanceAllowance: 4000.00m,
            MedicalAllowance: 1500.00m,
            SpecialAllowance: 1300.00m,
            GrossEarnings: 32000.00m,
            PfEmployeeDeduction: 1800.00m,
            EsiEmployeeDeduction: 240.00m,
            ProfessionalTax: 208.00m,
            TdsDeduction: 0.00m,
            TotalDeductions: 2248.00m,
            NetSalary: 29752.00m,
            NetSalaryInWords: "Twenty Nine Thousand Seven Hundred and Fifty Two Rupees Only",
            PaymentStatus: "Paid",
            PaymentReference: "NEFT-HDFC-2026092803",
            ProcessedDate: DateTime.UtcNow.AddDays(-2)
        ),
        new SalarySlipDto(
            Id: Guid.Parse("60000000-0000-0000-0000-000000000004"),
            EmployeeId: Guid.Parse("00000000-0000-0000-0000-000000000004"),
            EmployeeName: "Priya Sundaram",
            RoleName: "Regulatory Pharmacist & QA",
            PanNumber: "DPSPS5544R",
            UanNumber: "101299887744",
            MonthYear: "September 2026",
            TotalWorkingDays: 26,
            DaysWorked: 26,
            LopDays: 0,
            BasicSalary: 25000.00m,
            Hra: 10000.00m,
            ConveyanceAllowance: 3500.00m,
            MedicalAllowance: 2500.00m,
            SpecialAllowance: 4000.00m,
            GrossEarnings: 45000.00m,
            PfEmployeeDeduction: 1800.00m,
            EsiEmployeeDeduction: 0.00m,
            ProfessionalTax: 208.00m,
            TdsDeduction: 1000.00m,
            TotalDeductions: 3008.00m,
            NetSalary: 41992.00m,
            NetSalaryInWords: "Forty One Thousand Nine Hundred and Ninety Two Rupees Only",
            PaymentStatus: "Paid",
            PaymentReference: "NEFT-HDFC-2026092804",
            ProcessedDate: DateTime.UtcNow.AddDays(-2)
        )
    };

    [HttpGet("summary")]
    public ActionResult<PayrollRunSummaryDto> GetSummary([FromQuery] string? month = "September 2026")
    {
        var slips = SlipsStore.Where(s => s.MonthYear.Equals(month, StringComparison.OrdinalIgnoreCase)).ToList();
        if (!slips.Any()) slips = SlipsStore;

        var totalEmp = slips.Count;
        var totalGross = slips.Sum(s => s.GrossEarnings);
        var totalNet = slips.Sum(s => s.NetSalary);
        var totalPf = slips.Sum(s => s.PfEmployeeDeduction) * 2; // Employee + Employer
        var totalEsi = slips.Sum(s => s.EsiEmployeeDeduction * 4.25m); // 0.75% emp + 3.25% emplyr

        return Ok(new PayrollRunSummaryDto(
            MonthYear: month ?? "September 2026",
            TotalEmployees: totalEmp,
            TotalGrossSalary: totalGross,
            TotalNetDisbursement: totalNet,
            TotalPfContribution: totalPf,
            TotalEsiContribution: totalEsi,
            Status: "Completed",
            Slips: slips
        ));
    }

    [HttpGet("slip/{employeeId}")]
    public ActionResult<SalarySlipDto> GetSlip(Guid employeeId, [FromQuery] string? month = "September 2026")
    {
        var slip = SlipsStore.FirstOrDefault(s => s.EmployeeId == employeeId && s.MonthYear.Equals(month, StringComparison.OrdinalIgnoreCase));
        if (slip == null)
            slip = SlipsStore.FirstOrDefault(s => s.EmployeeId == employeeId);

        if (slip == null) return NotFound("Salary slip not found for employee");
        return Ok(slip);
    }

    [HttpPost("process")]
    public ActionResult<PayrollRunSummaryDto> ProcessPayroll([FromBody] ProcessPayrollRequest req)
    {
        return Ok(new PayrollRunSummaryDto(
            MonthYear: req.MonthYear,
            TotalEmployees: SlipsStore.Count,
            TotalGrossSalary: SlipsStore.Sum(s => s.GrossEarnings),
            TotalNetDisbursement: SlipsStore.Sum(s => s.NetSalary),
            TotalPfContribution: SlipsStore.Sum(s => s.PfEmployeeDeduction * 2),
            TotalEsiContribution: SlipsStore.Sum(s => s.EsiEmployeeDeduction * 4.25m),
            Status: "Processed",
            Slips: SlipsStore
        ));
    }

    [HttpPost("disburse/{id}")]
    public IActionResult DisburseSalary(Guid id)
    {
        var slip = SlipsStore.FirstOrDefault(s => s.Id == id);
        if (slip == null) return NotFound();

        var idx = SlipsStore.IndexOf(slip);
        var updated = slip with
        {
            PaymentStatus = "Paid",
            PaymentReference = $"NEFT-HDFC-{DateTime.UtcNow:yyyyMMdd}{new Random().Next(10, 99)}"
        };
        SlipsStore[idx] = updated;

        return Ok(new
        {
            success = true,
            message = $"Salary disbursed to {slip.EmployeeName} via {updated.PaymentReference}",
            slip = updated
        });
    }
}
