'use client';

import React from 'react';
import { Printer, Download, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface InvoicePrintData {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceMode: string;
  placeOfSupply: string;
  irnHash?: string;
  customer: {
    name: string;
    code: string;
    gstin: string;
    drugLicense20B: string;
    drugLicense21B: string;
    address: string;
    phoneNumber?: string;
    stateCode: string;
  };
  stockist: {
    legalName: string;
    tradeName: string;
    address: string;
    city: string;
    pincode: string;
    gstin: string;
    pan: string;
    drugLicense20B: string;
    drugLicense21B: string;
    stateCode: string;
    phone: string;
    email: string;
    bankName: string;
    accountNo: string;
    ifsc: string;
    branch: string;
  };
  items: Array<{
    productName: string;
    genericName?: string;
    hsnCode: string;
    batchNumber: string;
    expiryDate: string;
    packSize?: string;
    quantity: number;
    freeQuantity?: number;
    mrp: number;
    ptr: number;
    discountPct: number;
    taxableAmount: number;
    gstPercentage: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    netAmount: number;
  }>;
  totals: {
    grossAmount: number;
    tradeDiscount: number;
    taxableAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    roundOff: number;
    netPayable: number;
  };
}

// Convert numbers to Indian Rupee Words
function numberToIndianWords(num: number): string {
  const rounded = Math.round(num);
  if (rounded === 0) return 'Zero Rupees Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n: number): string {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return teens[n - 10];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + singleDigits[n % 10] : '');
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) res += singleDigits[hundred] + ' Hundred';
    if (rest > 0) res += (res ? ' and ' : '') + convertTwoDigits(rest);
    return res;
  }

  const crore = Math.floor(rounded / 10000000);
  const lakh = Math.floor((rounded % 10000000) / 100000);
  const thousand = Math.floor((rounded % 100000) / 1000);
  const remainder = rounded % 1000;

  let words = '';
  if (crore > 0) words += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' Thousand ';
  if (remainder > 0) words += convertThreeDigits(remainder);

  return 'Rupees ' + words.trim() + ' Only';
}

export default function TaxInvoiceModal({
  data,
  isOpen,
  onClose,
}: {
  data: InvoicePrintData;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const isIntraState = data.customer.stateCode === data.stockist.stateCode;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Top Floating Control Bar - Hidden during print */}
      <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-60 flex items-center gap-2 print:hidden bg-slate-900/90 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold text-xs transition shadow-md"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* A4 INVOICE SHEET CONTAINER */}
      <div
        id="printable-invoice"
        className="w-full max-w-[850px] bg-white text-slate-900 shadow-2xl border border-slate-300 rounded-lg p-6 sm:p-8 my-auto print:my-0 print:p-0 print:border-none print:shadow-none print:rounded-none font-sans text-[11px] leading-tight select-text"
      >
        {/* ============================================================== */}
        {/* 1. HEADER: STOCKIST DETAILS & STATUTORY TAX INVOICE BADGE */}
        {/* ============================================================== */}
        <div className="border-b-2 border-slate-900 pb-3 mb-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-blue-900">
                  {data.stockist.tradeName}
                </span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  Pharma Wholesale
                </span>
              </div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">
                {data.stockist.legalName}
              </div>
              <div className="text-[10px] text-slate-600 mt-1 max-w-md">
                {data.stockist.address}, {data.stockist.city} - {data.stockist.pincode}
              </div>
              <div className="text-[10px] text-slate-600 flex flex-wrap gap-x-3 gap-y-0.5 mt-1 font-mono">
                <span>Phone: <strong className="text-slate-800">{data.stockist.phone}</strong></span>
                <span>Email: <strong className="text-slate-800">{data.stockist.email}</strong></span>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-slate-900 text-white rounded">
                TAX INVOICE (RULE 46)
              </span>
              <span className="text-[10px] font-bold text-slate-600 mt-1">
                ORIGINAL FOR RECIPIENT
              </span>
              <div className="mt-2 text-[10px] font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                GSTIN: <strong className="text-slate-900">{data.stockist.gstin}</strong> (State Code: {data.stockist.stateCode})
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-1">
                PAN: <strong className="text-slate-900">{data.stockist.pan}</strong>
              </div>
            </div>
          </div>

          {/* Statutory Drug License Bar */}
          <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-700 font-mono bg-blue-50/60 px-2.5 py-1 rounded border border-blue-100">
            <span>D.L. No. (Form 20B): <strong className="text-blue-950 font-bold">{data.stockist.drugLicense20B}</strong></span>
            <span>D.L. No. (Form 21B): <strong className="text-blue-950 font-bold">{data.stockist.drugLicense21B}</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> CDSCO Wholesale Compliant
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. INVOICE META & BUYER (PHARMACY) DETAILS */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 gap-4 border border-slate-300 rounded p-3 mb-3 bg-slate-50/50">
          {/* Left: Buyer Details */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">
              Billed To (Retail Pharmacy / Hospital)
            </div>
            <div className="font-bold text-sm text-slate-900">
              {data.customer.name}
            </div>
            <div className="text-[10px] text-slate-700 mt-0.5">
              {data.customer.address || 'Chennai Central, Tamil Nadu'}
            </div>
            <div className="mt-1.5 space-y-0.5 font-mono text-[10px] text-slate-800">
              <div>Customer Code: <strong className="text-slate-900">{data.customer.code}</strong></div>
              <div>GSTIN: <strong className="text-slate-900">{data.customer.gstin || 'Unregistered / B2C'}</strong></div>
              <div>D.L. 20B: <strong className="text-slate-900">{data.customer.drugLicense20B}</strong></div>
              <div>D.L. 21B: <strong className="text-slate-900">{data.customer.drugLicense21B}</strong></div>
            </div>
          </div>

          {/* Right: Invoice Reference Meta */}
          <div className="border-l border-slate-300 pl-4 font-mono text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <strong className="text-sm font-bold text-blue-900">{data.invoiceNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Date:</span>
              <strong>{data.invoiceDate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Mode / Terms:</span>
              <strong className="uppercase px-1.5 py-0.2 bg-blue-100 text-blue-900 rounded">{data.invoiceMode} (21 Days)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Place of Supply:</span>
              <strong>State Code {data.placeOfSupply} ({isIntraState ? 'Intra-State' : 'Inter-State'})</strong>
            </div>
            {data.irnHash && (
              <div className="pt-1 mt-1 border-t border-slate-200">
                <span className="text-[9px] text-slate-500 block">NIC E-Invoice IRN Hash:</span>
                <span className="text-[9px] text-slate-700 break-all select-all">{data.irnHash}</span>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* 3. ITEM LINE MATRIX */}
        {/* ============================================================== */}
        <div className="overflow-x-auto mb-3">
          <table className="w-full border-collapse border border-slate-300 text-[10px]">
            <thead>
              <tr className="bg-slate-800 text-white font-semibold">
                <th className="border border-slate-400 p-1.5 text-center w-6">#</th>
                <th className="border border-slate-400 p-1.5 text-left">Medicine Description & Generic</th>
                <th className="border border-slate-400 p-1.5 text-center w-14">HSN</th>
                <th className="border border-slate-400 p-1.5 text-center w-18">Batch No</th>
                <th className="border border-slate-400 p-1.5 text-center w-14">EXP</th>
                <th className="border border-slate-400 p-1.5 text-right w-10">Qty</th>
                <th className="border border-slate-400 p-1.5 text-right w-10">Free</th>
                <th className="border border-slate-400 p-1.5 text-right w-12">MRP</th>
                <th className="border border-slate-400 p-1.5 text-right w-12">PTR</th>
                <th className="border border-slate-400 p-1.5 text-right w-10">Disc%</th>
                <th className="border border-slate-400 p-1.5 text-right w-14">Taxable</th>
                {isIntraState ? (
                  <>
                    <th className="border border-slate-400 p-1 text-right w-10">CGST</th>
                    <th className="border border-slate-400 p-1 text-right w-10">SGST</th>
                  </>
                ) : (
                  <th className="border border-slate-400 p-1 text-right w-14">IGST</th>
                )}
                <th className="border border-slate-400 p-1.5 text-right w-16">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                  <td className="border border-slate-300 p-1 text-center font-mono">{idx + 1}</td>
                  <td className="border border-slate-300 p-1 font-semibold text-slate-900">
                    <div>{item.productName}</div>
                    {item.genericName && (
                      <div className="text-[9px] font-normal text-slate-500 italic">{item.genericName}</div>
                    )}
                  </td>
                  <td className="border border-slate-300 p-1 text-center font-mono">{item.hsnCode}</td>
                  <td className="border border-slate-300 p-1 text-center font-mono font-bold text-blue-900">{item.batchNumber}</td>
                  <td className="border border-slate-300 p-1 text-center font-mono">{item.expiryDate}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono font-bold">{item.quantity}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono text-emerald-700 font-bold">{item.freeQuantity || 0}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono text-slate-600">₹{item.mrp.toFixed(2)}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono">₹{item.ptr.toFixed(2)}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono">{item.discountPct > 0 ? `${item.discountPct}%` : '-'}</td>
                  <td className="border border-slate-300 p-1 text-right font-mono font-semibold">₹{item.taxableAmount.toFixed(2)}</td>
                  {isIntraState ? (
                    <>
                      <td className="border border-slate-300 p-1 text-right font-mono text-[9px]">
                        ₹{item.cgstAmount.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-1 text-right font-mono text-[9px]">
                        ₹{item.sgstAmount.toFixed(2)}
                      </td>
                    </>
                  ) : (
                    <td className="border border-slate-300 p-1 text-right font-mono text-[9px]">
                      ₹{item.igstAmount.toFixed(2)}
                    </td>
                  )}
                  <td className="border border-slate-300 p-1 text-right font-mono font-bold text-slate-900">
                    ₹{item.netAmount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ============================================================== */}
        {/* 4. TOTALS, GST SUMMARY & BANK DETAILS */}
        {/* ============================================================== */}
        <div className="grid grid-cols-12 gap-3 border border-slate-300 rounded p-3 mb-3 bg-slate-50/40">
          {/* Left: Words, Bank Details & Statutory Terms (7 cols) */}
          <div className="col-span-7 space-y-2 border-r border-slate-300 pr-3">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Amount in Words:</span>
              <span className="font-bold text-xs text-slate-900 block font-serif">
                {numberToIndianWords(data.totals.netPayable)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-700 space-y-0.5">
              <div className="font-bold text-slate-900">Direct Bank Settlement:</div>
              <div>Bank: <strong>{data.stockist.bankName}</strong> | Branch: <strong>{data.stockist.branch}</strong></div>
              <div>Account No: <strong className="text-blue-900">{data.stockist.accountNo}</strong> | IFSC: <strong className="text-blue-900">{data.stockist.ifsc}</strong></div>
            </div>

            <div className="pt-1.5 border-t border-slate-200 text-[9px] text-slate-600 leading-normal">
              <strong>Drug Act Certification:</strong> We hereby certify that the drugs specified in this invoice do not contravene section 18 of the Drugs and Cosmetics Act, 1940. Schedule H/H1 drugs supplied strictly under CDSCO rules.
            </div>
          </div>

          {/* Right: Tax Breakdown & Final Figures (5 cols) */}
          <div className="col-span-5 font-mono text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Gross Value:</span>
              <span className="font-semibold">₹{data.totals.grossAmount.toFixed(2)}</span>
            </div>
            {data.totals.tradeDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Trade & Scheme Disc:</span>
                <span>- ₹{data.totals.tradeDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-200 pt-1 font-semibold">
              <span className="text-slate-700">Taxable Value:</span>
              <span>₹{data.totals.taxableAmount.toFixed(2)}</span>
            </div>

            {isIntraState ? (
              <>
                <div className="flex justify-between text-slate-700">
                  <span>Central GST (CGST 6%):</span>
                  <span>+ ₹{data.totals.cgstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>State GST (SGST 6%):</span>
                  <span>+ ₹{data.totals.sgstAmount.toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-700">
                <span>Integrated GST (IGST 12%):</span>
                <span>+ ₹{data.totals.igstAmount.toFixed(2)}</span>
              </div>
            )}

            {data.totals.roundOff !== 0 && (
              <div className="flex justify-between text-slate-500 text-[9px]">
                <span>Round Off Adjustment:</span>
                <span>{data.totals.roundOff > 0 ? `+ ₹${data.totals.roundOff.toFixed(2)}` : `- ₹${Math.abs(data.totals.roundOff).toFixed(2)}`}</span>
              </div>
            )}

            <div className="border-t-2 border-slate-900 pt-1.5 mt-1.5 flex justify-between items-center text-sm font-black text-slate-950 bg-blue-50/60 p-1.5 rounded">
              <span>NET PAYABLE:</span>
              <span className="text-base font-bold text-blue-900">₹{data.totals.netPayable.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 5. FOOTER & AUTHORIZED SIGNATURE */}
        {/* ============================================================== */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-300 text-[10px]">
          <div className="text-slate-500 max-w-sm">
            <div>Terms & Conditions: Goods once sold will not be accepted back except for verified manufacturer recall. Interest @ 18% p.a. chargeable on overdue bills beyond 21 days credit. Subject to Chennai jurisdiction.</div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-800">
              For {data.stockist.legalName}
            </div>
            <div className="h-12 flex items-center justify-end">
              <span className="text-[10px] font-serif italic text-slate-400 border-b border-dashed border-slate-400 px-4">
                Authorized Signatory
              </span>
            </div>
            <div className="text-[9px] text-slate-500">Computer Generated Invoice</div>
          </div>
        </div>
      </div>
    </div>
  );
}
