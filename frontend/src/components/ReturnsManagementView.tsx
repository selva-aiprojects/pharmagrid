'use client';

import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  AlertOctagon,
  FileText,
  FileCheck,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Download,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  pharmaApi,
  ApiProduct,
  ApiCustomer,
  ApiSupplier,
  ApiSalesReturnCreditNote,
  ApiPurchaseReturnDebitNote
} from '@/services/apiClient';

export default function ReturnsManagementView() {
  const [activeTab, setActiveTab] = useState<'sales-returns' | 'purchase-returns' | 'claims'>('sales-returns');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Data lists
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [salesReturns, setSalesReturns] = useState<ApiSalesReturnCreditNote[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<ApiPurchaseReturnDebitNote[]>([]);

  // New Sales Return Modal / Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c-1');
  const [originalInvoiceNo, setOriginalInvoiceNo] = useState<string>('INV-2026-0812');
  const [returnItems, setReturnItems] = useState([
    {
      productId: 'p-1',
      productName: 'Augmentin 625 Duo Tablet',
      batchNumber: 'AUG-AUG625-102',
      expiryDate: '2026-10-15',
      returnQuantity: 10,
      unitPricePTR: 180.50,
      gstPercentage: 12,
      returnReason: 'EXPIRY_RETURN',
      dispositionTarget: 'Quarantine Expiry Dump (D-01)'
    }
  ]);

  // New Purchase Return Modal / Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('s-1');
  const [supplierBillRef, setSupplierBillRef] = useState<string>('SUP-ALK-9912');
  const [claimCompanyRef, setClaimCompanyRef] = useState<string>('ALK-EXP-CLM-2026');
  const [debitAmount, setDebitAmount] = useState<string>('18500.00');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [custList, suppList, prodList, srList, prList] = await Promise.all([
        pharmaApi.getCustomers(),
        pharmaApi.getSuppliers(),
        pharmaApi.getProducts(),
        pharmaApi.getSalesReturns(),
        pharmaApi.getPurchaseReturns()
      ]);
      setCustomers(custList);
      setSuppliers(suppList);
      setProducts(prodList);
      setSalesReturns(srList);
      setPurchaseReturns(prList);
      if (custList.length > 0) setSelectedCustomerId(custList[0].customerId);
      if (suppList.length > 0) setSelectedSupplierId(suppList[0].supplierId);
    } catch (e) {
      console.error('Error loading returns data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReturnLine = () => {
    setReturnItems([
      ...returnItems,
      {
        productId: 'p-2',
        productName: 'Pan 40mg Tablet',
        batchNumber: 'PAN-40-771',
        expiryDate: '2026-11-20',
        returnQuantity: 5,
        unitPricePTR: 135.00,
        gstPercentage: 12,
        returnReason: 'BREAKAGE_LEAKAGE',
        dispositionTarget: 'Non-Saleable Damaged Rack (D-02)'
      }
    ]);
  };

  const handleRemoveReturnLine = (idx: number) => {
    if (returnItems.length <= 1) return;
    setReturnItems(returnItems.filter((_, i) => i !== idx));
  };

  const calculateSalesReturnTotals = () => {
    let taxable = 0;
    let gst = 0;
    returnItems.forEach(item => {
      const lineTaxable = item.returnQuantity * item.unitPricePTR;
      const lineGst = (lineTaxable * item.gstPercentage) / 100;
      taxable += lineTaxable;
      gst += lineGst;
    });
    return {
      taxable,
      gst,
      total: taxable + gst
    };
  };

  const handleIssueCreditNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const totals = calculateSalesReturnTotals();

    try {
      const payload = {
        customerId: selectedCustomerId,
        originalInvoiceNumber: originalInvoiceNo,
        remarks: 'Customer medicine return processed with automatic stock disposition',
        items: returnItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          quantityReturned: item.returnQuantity,
          unitPricePTR: item.unitPricePTR,
          gstPercentage: item.gstPercentage,
          returnReason: item.returnReason,
          dispositionStatus: item.returnReason === 'GOOD_STOCK' ? 'RestockedToActivePicking' : 'QuarantinedInDumpRack'
        }))
      };

      const result = await pharmaApi.createSalesReturn(payload);
      setSalesReturns([result, ...salesReturns]);
      setActionSuccess(`GST Credit Note ${result.creditNoteNumber} issued for ₹${totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}! Stock quarantine updated.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to issue Credit Note');
    }
  };

  const totals = calculateSalesReturnTotals();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Returns & Claims Management</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                GST Sec 34 Compliant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sales Return Credit Notes with GST reversal • Supplier Purchase Returns • Pharmaceutical Manufacturer Expiry Claims
            </p>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Returns Register
          </button>
          <button
            onClick={() => {
              setActionSuccess('Returns data exported for GST Form GSTR-1 Table 9B Credit/Debit Notes.');
              setTimeout(() => setActionSuccess(null), 3000);
            }}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export GSTR-1 Table 9B
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Customer Sales Returns</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{salesReturns.reduce((acc, c) => acc + c.totalCreditNoteAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {salesReturns.length} active credit notes issued
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Supplier Purchase Returns</span>
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            ₹{purchaseReturns.reduce((acc, c) => acc + c.totalDebitAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Debit notes raised against manufacturers
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Quarantine Expiry Dump</span>
            <AlertOctagon className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-400 tracking-tight">
            62 Units
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Segregated in Dump Rack D-01 awaiting company lift
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Company Claims Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            100%
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1">
            All Alkem & Sun Pharma claims approved
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('sales-returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'sales-returns'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Customer Sales Returns (Credit Notes)
        </button>

        <button
          onClick={() => setActiveTab('purchase-returns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'purchase-returns'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Supplier Purchase Returns (Debit Notes)
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'claims'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          Manufacturer Expiry Claims Tracker
        </button>
      </div>

      {/* TAB 1: SALES RETURN & CREDIT NOTE PUNCH */}
      {activeTab === 'sales-returns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Credit Note Form (Left 8 Cols) */}
            <div className="lg:col-span-8">
              <form onSubmit={handleIssueCreditNote} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">Punch Sales Return (Credit Note Form 53)</h3>
                  </div>
                  <span className="font-mono text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    CN-SERIES-2026
                  </span>
                </div>

                {/* Chemist & Reference Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Chemist Account <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:border-amber-500"
                    >
                      {customers.map((c) => (
                        <option key={c.customerId} value={c.customerId}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Original Sales Invoice Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={originalInvoiceNo}
                      onChange={(e) => setOriginalInvoiceNo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 font-mono focus:border-amber-500"
                      placeholder="e.g. INV-2026-0812"
                    />
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Medicine Line Items to Return
                    </label>
                    <button
                      type="button"
                      onClick={handleAddReturnLine}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Medicine Line
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-medium border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3">Medicine & Batch</th>
                          <th className="py-2.5 px-3">Return Reason</th>
                          <th className="py-2.5 px-3 text-right">Qty</th>
                          <th className="py-2.5 px-3 text-right">PTR (₹)</th>
                          <th className="py-2.5 px-3 text-right">Taxable</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {returnItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="py-2.5 px-3 font-sans">
                              <div className="font-semibold text-white">{item.productName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                Batch: {item.batchNumber} • Exp: {item.expiryDate}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 font-sans">
                              <select
                                value={item.returnReason}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[idx].returnReason = e.target.value;
                                  updated[idx].dispositionTarget =
                                    e.target.value === 'EXPIRY_RETURN'
                                      ? 'Quarantine Expiry Dump (D-01)'
                                      : e.target.value === 'BREAKAGE_LEAKAGE'
                                      ? 'Non-Saleable Damaged Rack (D-02)'
                                      : 'Active Picking Rack (A-01)';
                                  setReturnItems(updated);
                                }}
                                className="bg-slate-950 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-200"
                              >
                                <option value="EXPIRY_RETURN">Expired Stock (Dump)</option>
                                <option value="BREAKAGE_LEAKAGE">Damaged / Broken Foil</option>
                                <option value="GOOD_STOCK">Saleable Good Stock</option>
                              </select>
                              <div className="text-[10px] text-amber-500/80 mt-0.5">
                                → {item.dispositionTarget}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              <input
                                type="number"
                                min={1}
                                value={item.returnQuantity}
                                onChange={(e) => {
                                  const updated = [...returnItems];
                                  updated[idx].returnQuantity = parseInt(e.target.value) || 0;
                                  setReturnItems(updated);
                                }}
                                className="w-16 bg-slate-950 border border-slate-700 text-white text-xs rounded px-2 py-1 text-right"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              ₹{item.unitPricePTR.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                              ₹{(item.returnQuantity * item.unitPricePTR).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-center font-sans">
                              <button
                                type="button"
                                onClick={() => handleRemoveReturnLine(idx)}
                                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 transition-all"
                  >
                    <FileCheck className="w-4 h-4" />
                    Issue GST Credit Note & Move Stock to Quarantine (F8)
                  </button>
                </div>
              </form>
            </div>

            {/* Credit Note Calculation Summary (Right 4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white">Credit Note GST Computation</h3>
                  <p className="text-xs text-slate-400">Tax reversal under GST Rule 53</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Taxable Value (PTR):</span>
                    <span className="font-mono font-semibold text-white">
                      ₹{totals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Reversed CGST (6%):</span>
                    <span className="font-mono text-teal-400">
                      ₹{(totals.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Reversed SGST (6%):</span>
                    <span className="font-mono text-teal-400">
                      ₹{(totals.gst / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="border-t border-slate-800 pt-3 flex justify-between text-sm font-bold">
                    <span className="text-white">Total Credit Value:</span>
                    <span className="font-mono text-amber-400">
                      ₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-950/20 border border-amber-500/20 rounded-xl text-[11px] text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Automatic Ledger Knock-off
                  </div>
                  <p className="text-slate-400">
                    Credit Note will immediately reduce the Chemist's ledger outstanding balance by ₹{totals.total.toFixed(2)}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Credit Notes Register */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Issued Credit Notes Register</h3>
                <p className="text-xs text-slate-400">Full audit history of returns with tax adjustment tracking</p>
              </div>
              <span className="font-mono text-xs text-slate-400">{salesReturns.length} Records</span>
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Credit Note No & Date</th>
                    <th className="py-3 px-4">Chemist Store</th>
                    <th className="py-3 px-4">Orig. Invoice</th>
                    <th className="py-3 px-4 text-right">Taxable</th>
                    <th className="py-3 px-4 text-right">GST Reversed</th>
                    <th className="py-3 px-4 text-right">Total Credit Note</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {salesReturns.map((cn) => (
                    <tr key={cn.creditNoteId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{cn.creditNoteNumber}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{cn.creditNoteDate}</div>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                        {cn.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {cn.originalInvoiceNumber}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300">
                        ₹{cn.subTotalTaxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-teal-400">
                        ₹{cn.totalGstReversed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-400">
                        ₹{cn.totalCreditNoteAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          {cn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => window.print()}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700 inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUPPLIER PURCHASE RETURNS (DEBIT NOTES) */}
      {activeTab === 'purchase-returns' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Debit Note Punch Form */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold text-white">Create Purchase Return Debit Note</h3>
                <p className="text-xs text-slate-400">Return expired / damaged stock back to manufacturer C&F</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Manufacturer / Supplier</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:border-amber-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.supplierName} ({s.supplierCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Inward Supplier Bill Ref</label>
                  <input
                    type="text"
                    value={supplierBillRef}
                    onChange={(e) => setSupplierBillRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Company Claim Ref</label>
                  <input
                    type="text"
                    value={claimCompanyRef}
                    onChange={(e) => setClaimCompanyRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Total Debit Value (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={debitAmount}
                  onChange={(e) => setDebitAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base rounded-xl px-3 py-2.5 focus:border-amber-500"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const newDebit: ApiPurchaseReturnDebitNote = {
                    debitNoteId: `dn-${Date.now()}`,
                    debitNoteNumber: `DN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    debitNoteDate: new Date().toISOString().split('T')[0],
                    supplierId: selectedSupplierId,
                    supplierName: suppliers.find(s => s.supplierId === selectedSupplierId)?.supplierName || 'Alkem Laboratories Ltd',
                    totalDebitAmount: parseFloat(debitAmount) || 18500,
                    manufacturerClaimStatus: 'CLAIM_SUBMITTED',
                    companyClaimReference: claimCompanyRef
                  };
                  setPurchaseReturns([newDebit, ...purchaseReturns]);
                  setActionSuccess(`Purchase Return Debit Note ${newDebit.debitNoteNumber} generated successfully!`);
                  setTimeout(() => setActionSuccess(null), 3500);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Issue Supplier Debit Note
              </button>
            </div>

            {/* Right: Information on Supplier Returns Policy */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <h3 className="text-sm font-semibold text-white">Manufacturer Expiry Return Policies</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard pharma trade terms require expired stock to be claimed within 30 days of expiry date.
                PharmaGrid automatically aggregates near-expiry and expired stock from chemist returns for bulk dispatch to C&F.
              </p>

              <div className="space-y-2 pt-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Alkem Laboratories C&F</div>
                    <div className="text-[11px] text-slate-500">Claim Window: 45 Days • Full PTR Reversal</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">100% Credit</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Cipla Healthcare Ltd</div>
                    <div className="text-[11px] text-slate-500">Claim Window: 30 Days • Monthly Batch Lift</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">100% Credit</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Sun Pharmaceutical Industries</div>
                    <div className="text-[11px] text-slate-500">Claim Window: 60 Days • Field Auditor Verification</div>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold">100% Credit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Debit Notes Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-semibold text-white">Supplier Purchase Debit Notes Register</h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Debit Note No & Date</th>
                    <th className="py-3 px-4">Manufacturer / Supplier</th>
                    <th className="py-3 px-4 text-right">Debit Amount</th>
                    <th className="py-3 px-4">Company Claim Ref</th>
                    <th className="py-3 px-4 text-center">Claim Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {purchaseReturns.map((dn) => (
                    <tr key={dn.debitNoteId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{dn.debitNoteNumber}</div>
                        <div className="text-[10px] text-slate-500 font-sans">{dn.debitNoteDate}</div>
                      </td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200">
                        {dn.supplierName}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-400">
                        ₹{dn.totalDebitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {dn.companyClaimReference || '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                          {dn.manufacturerClaimStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => window.print()}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700 inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CLAIMS TRACKER */}
      {activeTab === 'claims' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white">Manufacturer Expiry & Damage Claims Tracker</h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-end lifecycle monitoring of expired stock claims submitted to pharmaceutical companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Phase 1: Claim Submission</span>
                <span className="text-amber-400 font-bold font-mono">₹18,500</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">Physical stock handed over to company sales representative</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Phase 2: Company Audit Sign-off</span>
                <span className="text-teal-400 font-bold font-mono">₹18,500</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">C&F verified batch barcodes and expiry dates with zero rejection</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Phase 3: Company Credit Settled</span>
                <span className="text-emerald-400 font-bold font-mono">100% Cleared</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full"></div>
              </div>
              <p className="text-[11px] text-slate-500">Amount credited into distributor ledger via Credit Note #ALK-8921</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
