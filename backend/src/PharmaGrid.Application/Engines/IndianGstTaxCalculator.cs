namespace PharmaGrid.Application.Engines;

public record GstCalculationResult(
    decimal TaxableAmount,
    decimal CgstPercentage,
    decimal CgstAmount,
    decimal SgstPercentage,
    decimal SgstAmount,
    decimal IgstPercentage,
    decimal IgstAmount,
    decimal NetLineTotal);

public record InvoiceTaxSummary(
    decimal TotalGrossAmount,
    decimal TotalTradeDiscount,
    decimal TotalTaxableAmount,
    decimal TotalCgstAmount,
    decimal TotalSgstAmount,
    decimal TotalIgstAmount,
    decimal RoundOffAmount,
    decimal NetPayableAmount);

public class IndianGstTaxCalculator
{
    public GstCalculationResult CalculateLineTax(
        decimal grossAmount,
        decimal discountPercentage,
        decimal gstPercentage,
        string supplierStateCode,
        string placeOfSupplyStateCode)
    {
        var discountAmount = Math.Round(grossAmount * (discountPercentage / 100m), 2);
        var taxableAmount = Math.Max(0, grossAmount - discountAmount);

        bool isIntraState = string.Equals(supplierStateCode, placeOfSupplyStateCode, StringComparison.OrdinalIgnoreCase);

        decimal cgstPct = 0;
        decimal cgstAmt = 0;
        decimal sgstPct = 0;
        decimal sgstAmt = 0;
        decimal igstPct = 0;
        decimal igstAmt = 0;

        if (isIntraState)
        {
            cgstPct = gstPercentage / 2m;
            sgstPct = gstPercentage / 2m;
            cgstAmt = Math.Round(taxableAmount * (cgstPct / 100m), 2);
            sgstAmt = Math.Round(taxableAmount * (sgstPct / 100m), 2);
        }
        else
        {
            igstPct = gstPercentage;
            igstAmt = Math.Round(taxableAmount * (igstPct / 100m), 2);
        }

        var netTotal = taxableAmount + cgstAmt + sgstAmt + igstAmt;

        return new GstCalculationResult(
            TaxableAmount: taxableAmount,
            CgstPercentage: cgstPct,
            CgstAmount: cgstAmt,
            SgstPercentage: sgstPct,
            SgstAmount: sgstAmt,
            IgstPercentage: igstPct,
            IgstAmount: igstAmt,
            NetLineTotal: netTotal);
    }

    public InvoiceTaxSummary SummarizeInvoice(IEnumerable<GstCalculationResult> lineResults, decimal totalGrossAmount, decimal totalTradeDiscount)
    {
        decimal taxable = 0;
        decimal cgst = 0;
        decimal sgst = 0;
        decimal igst = 0;

        foreach (var line in lineResults)
        {
            taxable += line.TaxableAmount;
            cgst += line.CgstAmount;
            sgst += line.SgstAmount;
            igst += line.IgstAmount;
        }

        decimal rawNet = taxable + cgst + sgst + igst;
        decimal roundedNet = Math.Round(rawNet, 0);
        decimal roundOff = Math.Round(roundedNet - rawNet, 2);

        return new InvoiceTaxSummary(
            TotalGrossAmount: totalGrossAmount,
            TotalTradeDiscount: totalTradeDiscount,
            TotalTaxableAmount: taxable,
            TotalCgstAmount: cgst,
            TotalSgstAmount: sgst,
            TotalIgstAmount: igst,
            RoundOffAmount: roundOff,
            NetPayableAmount: roundedNet);
    }
}
