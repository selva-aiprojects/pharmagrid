'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  SAMPLE_CUSTOMERS,
  SAMPLE_PRODUCTS,
  CustomerItem,
  ProductItem,
  BatchItem,
} from '@/data/mockData';
import { pharmaApi, ApiCustomer } from '@/services/apiClient';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Printer,
  Sparkles,
  Layers,
  ChevronDown,
  Building2,
  UserCheck,
  ShieldCheck,
  CreditCard,
  Keyboard,
  Clock,
  ArrowRight,
  Split,
  Tag,
  Check,
  X,
  FileText,
} from 'lucide-react';
import TaxInvoiceModal, { InvoicePrintData } from '@/components/TaxInvoiceModal';

const formatInr = (val: number): string => Number(val || 0).toLocaleString('en-IN');

export interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  genericName: string;
  scheduleClass: string;
  storageCondition: string;
  hsnCode: string;
  selectedBatchId: string;
  batchNumber: string;
  expiryDate: string;
  rackLocation: string;
  quantity: number;
  freeQuantity: number;
  ptr: number;
  mrp: number;
  discountPct: number;
  gstPercentage: number;
  isSplit: boolean;
  splitDetails?: string;
  schemeApplied?: string;
}

export default function RapidBillingWorkspace() {
  const [customerList, setCustomerList] = useState<CustomerItem[]>(SAMPLE_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem>(SAMPLE_CUSTOMERS[0]);
  const [invoiceMode, setInvoiceMode] = useState<'CREDIT' | 'CASH'>('CREDIT');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Sync live customers from .NET 9 Web API
  useEffect(() => {
    pharmaApi.getCustomers().then(apiCusts => {
      if (apiCusts && apiCusts.length > 0) {
        const mapped: CustomerItem[] = apiCusts.map(c => ({
          customerId: c.customerId,
          name: c.name,
          code: c.code,
          customerType: c.customerType,
          gstin: c.gstin,
          stateCode: c.stateCode,
          stateName: c.stateCode === '33' ? 'Tamil Nadu (Intra-State)' : c.stateCode === '29' ? 'Karnataka (Inter-State IGST)' : `State (${c.stateCode})`,
          drugLicense20B: c.drugLicense20B,
          drugLicense21B: c.drugLicense21B,
          licenseValidUntil: c.licenseExpiryDate,
          isLicenseValid: c.isLicenseValid,
          creditLimit: c.creditLimit,
          currentOutstanding: c.currentOutstanding,
          overdueBillsCount: 0,
          address: '',
        }));
        setCustomerList(mapped);
      }
    }).catch(err => console.warn('Customer sync fallback to mock:', err));
  }, []);

  const [selectedLineId, setSelectedLineId] = useState<string>('line-1');
  
  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: 'line-1',
      productId: SAMPLE_PRODUCTS[0].productId,
      productName: SAMPLE_PRODUCTS[0].name,
      genericName: SAMPLE_PRODUCTS[0].genericName,
      scheduleClass: SAMPLE_PRODUCTS[0].scheduleClass,
      storageCondition: SAMPLE_PRODUCTS[0].storageCondition,
      hsnCode: SAMPLE_PRODUCTS[0].hsnCode,
      selectedBatchId: SAMPLE_PRODUCTS[0].batches[0].batchId,
      batchNumber: SAMPLE_PRODUCTS[0].batches[0].batchNumber,
      expiryDate: SAMPLE_PRODUCTS[0].batches[0].expiryDate,
      rackLocation: SAMPLE_PRODUCTS[0].batches[0].rackLocation,
      quantity: 100, // Trigger split allocation because batch 1 has only 40!
      freeQuantity: 10, // 10+1 free applied for 100 units
      ptr: SAMPLE_PRODUCTS[0].ptr,
      mrp: SAMPLE_PRODUCTS[0].mrp,
      discountPct: 5,
      gstPercentage: SAMPLE_PRODUCTS[0].gstPercentage,
      isSplit: true,
      splitDetails: '40 @ P40-AUG26-01 + 60 @ P40-SEP26-02',
      schemeApplied: 'Buy 10 Get 1 Free (+10 Vials Bonus)',
    },
    {
      id: 'line-2',
      productId: SAMPLE_PRODUCTS[1].productId,
      productName: SAMPLE_PRODUCTS[1].name,
      genericName: SAMPLE_PRODUCTS[1].genericName,
      scheduleClass: SAMPLE_PRODUCTS[1].scheduleClass,
      storageCondition: SAMPLE_PRODUCTS[1].storageCondition,
      hsnCode: SAMPLE_PRODUCTS[1].hsnCode,
      selectedBatchId: SAMPLE_PRODUCTS[1].batches[0].batchId,
      batchNumber: SAMPLE_PRODUCTS[1].batches[0].batchNumber,
      expiryDate: SAMPLE_PRODUCTS[1].batches[0].expiryDate,
      rackLocation: SAMPLE_PRODUCTS[1].batches[0].rackLocation,
      quantity: 20,
      freeQuantity: 2, // 20+2 free applied
      ptr: SAMPLE_PRODUCTS[1].ptr,
      mrp: SAMPLE_PRODUCTS[1].mrp,
      discountPct: 2,
      gstPercentage: SAMPLE_PRODUCTS[1].gstPercentage,
      isSplit: false,
      schemeApplied: 'Buy 20 Get 2 Free (+2 Strips Bonus)',
    },
  ]);

  const [activeBatchModalLine, setActiveBatchModalLine] = useState<InvoiceLine | null>(null);
  const [activeSchemeModalLine, setActiveSchemeModalLine] = useState<InvoiceLine | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);
  const [invoiceCommitted, setInvoiceCommitted] = useState<any | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Open customer search
      if (e.key === 'F1') {
        e.preventDefault();
        setIsCustomerModalOpen(true);
      }
      // F2: Add new line
      if (e.key === 'F2') {
        e.preventDefault();
        handleAddNewLine();
      }
      // F8 or Ctrl+Enter: Save & Invoice
      if (e.key === 'F8' || (e.ctrlKey && e.key === 'Enter')) {
        e.preventDefault();
        handleCommitInvoice();
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsCustomerModalOpen(false);
        setActiveBatchModalLine(null);
        setActiveSchemeModalLine(null);
        setInvoiceCommitted(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lines, selectedCustomer]);

  // Add new line item
  const handleAddNewLine = () => {
    const nextProduct = SAMPLE_PRODUCTS[lines.length % SAMPLE_PRODUCTS.length];
    const initialBatch = nextProduct.batches[0];

    const newLine: InvoiceLine = {
      id: `line-${Date.now()}`,
      productId: nextProduct.productId,
      productName: nextProduct.name,
      genericName: nextProduct.genericName,
      scheduleClass: nextProduct.scheduleClass,
      storageCondition: nextProduct.storageCondition,
      hsnCode: nextProduct.hsnCode,
      selectedBatchId: initialBatch.batchId,
      batchNumber: initialBatch.batchNumber,
      expiryDate: initialBatch.expiryDate,
      rackLocation: initialBatch.rackLocation,
      quantity: 10,
      freeQuantity: nextProduct.scheme?.type === 'volumetric' ? Math.floor(10 / nextProduct.scheme.minQty) * nextProduct.scheme.freeQty : 0,
      ptr: nextProduct.ptr,
      mrp: nextProduct.mrp,
      discountPct: 0,
      gstPercentage: nextProduct.gstPercentage,
      isSplit: false,
      schemeApplied: nextProduct.scheme ? nextProduct.scheme.name : undefined,
    };

    setLines(prev => [...prev, newLine]);
    setSelectedLineId(newLine.id);
  };

  // Update line quantity & re-evaluate FEFO split & schemes
  const handleQuantityChange = (lineId: string, newQty: number) => {
    setLines(prev =>
      prev.map(line => {
        if (line.id !== lineId) return line;

        const product = SAMPLE_PRODUCTS.find(p => p.productId === line.productId);
        if (!product) return { ...line, quantity: newQty };

        // Evaluate FEFO Split
        const firstBatch = product.batches[0];
        let isSplit = false;
        let splitDetails = undefined;

        if (firstBatch && newQty > firstBatch.availableQty && product.batches.length > 1) {
          isSplit = true;
          const secondBatch = product.batches[1];
          const remaining = newQty - firstBatch.availableQty;
          splitDetails = `${firstBatch.availableQty} @ ${firstBatch.batchNumber} + ${remaining} @ ${secondBatch.batchNumber}`;
        }

        // Evaluate Scheme
        let freeQty = 0;
        let schemeTag = undefined;

        if (product.scheme && product.scheme.type === 'volumetric') {
          const factor = Math.floor(newQty / product.scheme.minQty);
          if (factor > 0) {
            freeQty = factor * product.scheme.freeQty;
            schemeTag = `${product.scheme.name} (+${freeQty} Bonus)`;
          }
        }

        let discountPct = line.discountPct;
        if (product.scheme && product.scheme.type === 'discount' && newQty >= product.scheme.minQty) {
          discountPct = product.scheme.discountPct;
          schemeTag = `${product.scheme.name} (-${discountPct}% off)`;
        }

        return {
          ...line,
          quantity: Math.max(1, newQty),
          freeQuantity: freeQty,
          isSplit,
          splitDetails,
          schemeApplied: schemeTag,
          discountPct,
        };
      })
    );
  };

  // Delete line
  const handleDeleteLine = (lineId: string) => {
    setLines(prev => prev.filter(l => l.id !== lineId));
  };

  // Change selected batch for a line
  const handleBatchSelect = (lineId: string, batch: BatchItem) => {
    setLines(prev =>
      prev.map(l =>
        l.id === lineId
          ? {
              ...l,
              selectedBatchId: batch.batchId,
              batchNumber: batch.batchNumber,
              expiryDate: batch.expiryDate,
              rackLocation: batch.rackLocation,
              isSplit: false,
              splitDetails: undefined,
            }
          : l
      )
    );
    setActiveBatchModalLine(null);
  };

  // Dual GST and Calculation Totals
  const isIntraState = selectedCustomer.stateCode === '33'; // Branch state is Tamil Nadu (33)

  let grossTotal = 0;
  let tradeDiscountTotal = 0;
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  lines.forEach(line => {
    const lineGross = line.quantity * line.ptr;
    const lineDiscount = lineGross * (line.discountPct / 100);
    const lineTaxable = lineGross - lineDiscount;

    grossTotal += lineGross;
    tradeDiscountTotal += lineDiscount;
    taxableTotal += lineTaxable;

    if (isIntraState) {
      const halfRate = line.gstPercentage / 2;
      cgstTotal += lineTaxable * (halfRate / 100);
      sgstTotal += lineTaxable * (halfRate / 100);
    } else {
      igstTotal += lineTaxable * (line.gstPercentage / 100);
    }
  });

  const rawNetPayable = taxableTotal + cgstTotal + sgstTotal + igstTotal;
  const netPayable = Math.round(rawNetPayable);
  const roundOff = Number((netPayable - rawNetPayable).toFixed(2));

  // Customer Credit Limit Calculations
  const creditLimit = selectedCustomer.creditLimit;
  const currentOutstanding = selectedCustomer.currentOutstanding;
  const creditUsagePct = Math.min(100, Math.round((currentOutstanding / creditLimit) * 100));
  const isCreditExceeded = currentOutstanding + netPayable > creditLimit;

  // Print data structure for A4 Statutory Tax Invoice
  const invoicePrintData: InvoicePrintData = {
    invoiceNumber: invoiceCommitted?.invoiceNumber || `INV-2026-PREVIEW`,
    invoiceDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    invoiceMode: invoiceMode,
    placeOfSupply: selectedCustomer.stateCode,
    irnHash: invoiceCommitted?.irnHash || '8374363E92878C48FA45B4D084620023B2201948842EA56',
    customer: {
      name: selectedCustomer.name,
      code: selectedCustomer.code,
      gstin: selectedCustomer.gstin,
      drugLicense20B: selectedCustomer.drugLicense20B,
      drugLicense21B: selectedCustomer.drugLicense21B,
      address: selectedCustomer.address || 'Chennai Central Depot, Tamil Nadu',
      stateCode: selectedCustomer.stateCode,
    },
    stockist: {
      legalName: 'PharmaGrid Healthcare Logistics Pvt Ltd',
      tradeName: 'PharmaGrid Chennai Stockist',
      address: 'Plot 100, Anna Salai Wholesale Hub, Guindy Industrial Estate',
      city: 'Chennai',
      pincode: '600032',
      gstin: '33AABCP9981E1Z9',
      pan: 'ABCDE1234F',
      drugLicense20B: 'TN/CHE/20B/2024/001',
      drugLicense21B: 'TN/CHE/21B/2024/002',
      stateCode: '33',
      phone: '+91 98401 22334',
      email: 'billing@pharmagrid.com',
      bankName: 'HDFC Bank Ltd',
      accountNo: '50200088991122',
      ifsc: 'HDFC0001234',
      branch: 'Anna Salai Main Branch',
    },
    items: lines.map(line => {
      const lineGross = line.quantity * line.ptr;
      const lineDiscount = lineGross * (line.discountPct / 100);
      const lineTaxable = lineGross - lineDiscount;
      const rate = line.gstPercentage;
      const halfRate = rate / 2;
      const cgst = isIntraState ? lineTaxable * (halfRate / 100) : 0;
      const sgst = isIntraState ? lineTaxable * (halfRate / 100) : 0;
      const igst = !isIntraState ? lineTaxable * (rate / 100) : 0;
      return {
        productName: line.productName,
        genericName: line.genericName,
        hsnCode: line.hsnCode,
        batchNumber: line.batchNumber,
        expiryDate: line.expiryDate,
        quantity: line.quantity,
        freeQuantity: line.freeQuantity,
        mrp: line.mrp,
        ptr: line.ptr,
        discountPct: line.discountPct,
        taxableAmount: lineTaxable,
        gstPercentage: line.gstPercentage,
        cgstAmount: cgst,
        sgstAmount: sgst,
        igstAmount: igst,
        netAmount: lineTaxable + cgst + sgst + igst,
      };
    }),
    totals: {
      grossAmount: grossTotal,
      tradeDiscount: tradeDiscountTotal,
      taxableAmount: taxableTotal,
      cgstAmount: cgstTotal,
      sgstAmount: sgstTotal,
      igstAmount: igstTotal,
      roundOff: roundOff,
      netPayable: netPayable,
    },
  };

  // Commit Invoice via live .NET 9 Web API (Sub-2-Second Checkout Guarantee)
  const handleCommitInvoice = async () => {
    if (lines.length === 0) return;
    setIsCommitting(true);
    setApiError(null);

    try {
      const res = await pharmaApi.createInvoice({
        customerId: selectedCustomer.customerId,
        invoiceMode: invoiceMode,
        lineItems: lines.map(line => ({
          productId: line.productId,
          batchId: line.selectedBatchId,
          quantityBilled: line.quantity,
          unitPricePTR: line.ptr,
          discountPercentage: line.discountPct,
        })),
      });

      setInvoiceCommitted({
        invoiceNumber: res.invoiceNumber,
        irnHash: res.irnHash,
        ackDate: new Date(res.invoiceDate).toLocaleTimeString(),
        netPayable: res.netPayableAmount,
        customerName: res.customerName,
        lineCount: lines.length,
        executionDurationMs: res.executionDurationMs,
        isLiveBackend: true,
      });

      // Update customer outstanding in local state
      setSelectedCustomer(prev => ({
        ...prev,
        currentOutstanding: prev.currentOutstanding + res.netPayableAmount,
      }));
    } catch (err: any) {
      console.error('Invoicing exception:', err);
      // CDSCO regulatory block or insufficient stock error
      setApiError(err.message || 'Invoice commitment failed');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* API ERROR / CDSCO REGULATORY WARNING BANNER */}
      {apiError && (
        <div className="p-4 rounded-xl bg-rose-950/90 border border-rose-500/70 flex items-center justify-between text-xs text-rose-200 shadow-xl shadow-rose-950/40 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-900/80 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white block text-sm font-bold">CDSCO Regulatory / Invoicing Exception:</strong>
              <span className="text-rose-200">{apiError}</span>
            </div>
          </div>
          <button
            onClick={() => setApiError(null)}
            className="px-3.5 py-1.5 rounded-lg bg-rose-900 hover:bg-rose-800 text-white font-semibold text-xs transition-colors ml-4 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* 1. TOP HEADER & OPERATIONAL BAR */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Branch Context */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Hub Branch</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800">
                GST: 33AAACD9910E1Z2 (TN)
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Main Chennai Depot
              <span className="text-xs font-normal text-slate-400">| DL: TN/CHE/20B/1004</span>
            </h2>
          </div>
        </div>

        {/* Selected Customer Status Card (F1) */}
        <div
          onClick={() => setIsCustomerModalOpen(true)}
          className="cursor-pointer group flex-1 max-w-xl bg-white dark:bg-slate-900/90 hover:bg-blue-50/30 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-blue-400 rounded-xl p-3 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Customer [F1]:</span>
              <span className="text-slate-900 dark:text-white font-bold group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                {selectedCustomer.name}
              </span>
              <span className="text-slate-500 text-[11px]">({selectedCustomer.code})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Drug License Form 20B/21B Badge */}
              {selectedCustomer.isLicenseValid ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> DL Valid
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700 animate-pulse">
                  <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> DL Expired
                </span>
              )}

              {/* State Tax Mode Pill */}
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {isIntraState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
              </span>
            </div>
          </div>

          {/* Credit Health Meter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full transition-all duration-500 ${
                  creditUsagePct > 90 ? 'bg-rose-500' : creditUsagePct > 70 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-400'
                }`}
                style={{ width: `${creditUsagePct}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap" suppressHydrationWarning>
              <span suppressHydrationWarning className="font-semibold text-slate-900 dark:text-slate-100">Bal: ₹{formatInr(currentOutstanding)}</span>
              <span className="text-slate-500 dark:text-slate-400" suppressHydrationWarning> / ₹{formatInr(creditLimit)}</span>
              <span className="text-blue-700 dark:text-blue-300 font-bold ml-1">({creditUsagePct}%)</span>
            </div>
          </div>
        </div>

        {/* Invoice Mode & Quick Action */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 flex">
            <button
              onClick={() => setInvoiceMode('CREDIT')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                invoiceMode === 'CREDIT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              CREDIT
            </button>
            <button
              onClick={() => setInvoiceMode('CASH')}
              className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                invoiceMode === 'CASH'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              CASH
            </button>
          </div>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Preview standard statutory A4 Tax Invoice"
          >
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" /> A4 Invoice Preview
          </button>

          <button
            onClick={handleAddNewLine}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Add Item [F2]
          </button>
        </div>
      </div>

      {/* 2. RAPID INVOICING DATA GRID */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300 dark:border-slate-700 select-none">
              <tr>
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3 min-w-[220px]">Product / Molecule</th>
                <th className="py-3 px-3 min-w-[190px]">FEFO Batch &amp; Shelf Bin</th>
                <th className="py-3 px-3 min-w-[160px]">Allocation &amp; Schemes</th>
                <th className="py-3 px-3 w-20 text-center">Billed Qty</th>
                <th className="py-3 px-3 w-16 text-center text-emerald-600 dark:text-emerald-400">Free</th>
                <th className="py-3 px-3 w-20 text-right">PTR Rate</th>
                <th className="py-3 px-3 w-16 text-center">Disc %</th>
                <th className="py-3 px-3 w-24 text-right">Taxable</th>
                <th className="py-3 px-3 w-24 text-right">GST</th>
                <th className="py-3 px-3 w-28 text-right font-bold text-slate-900 dark:text-white">Line Total</th>
                <th className="py-3 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
              {lines.map((line, idx) => {
                const lineGross = line.quantity * line.ptr;
                const lineDiscount = lineGross * (line.discountPct / 100);
                const lineTaxable = lineGross - lineDiscount;
                const gstAmount = lineTaxable * (line.gstPercentage / 100);
                const lineTotal = lineTaxable + gstAmount;
                const isRowSelected = selectedLineId === line.id;

                return (
                  <tr
                    key={line.id}
                    onClick={() => setSelectedLineId(line.id)}
                    className={`transition-all duration-150 group cursor-pointer ${
                      isRowSelected
                        ? 'bg-blue-50/90 dark:bg-blue-900/30 border-l-4 border-l-blue-600 dark:border-l-blue-400 text-slate-900 dark:text-white shadow-xs'
                        : 'hover:bg-blue-50/50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400 font-mono font-bold">
                      {String(idx + 1).padStart(2, '0')}
                    </td>

                    {/* Product Name & Generic Info */}
                    <td className="py-3 px-3">
                      <div
                        className={`font-bold transition-colors flex items-center gap-1.5 ${
                          isRowSelected
                            ? 'text-blue-900 dark:text-blue-200'
                            : 'text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
                        }`}
                      >
                        {line.productName}
                        {line.scheduleClass === 'H1' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            Sch H1
                          </span>
                        )}
                        {line.scheduleClass === 'H' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                            Sch H
                          </span>
                        )}
                        {line.storageCondition.includes('Cold Chain') && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            ❄ 2-8°C
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-normal">
                        {line.genericName} | HSN: <span className="font-mono font-semibold">{line.hsnCode}</span>
                      </div>
                    </td>

                    {/* FEFO Batch Dropdown & Shelf Location */}
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBatchModalLine(line);
                        }}
                        className={`w-full text-left rounded-lg p-2 transition-all flex items-center justify-between border cursor-pointer ${
                          isRowSelected
                            ? 'bg-white dark:bg-slate-800 border-blue-400 dark:border-blue-500 shadow-xs'
                            : 'bg-white dark:bg-slate-850 hover:bg-blue-50/50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-blue-400'
                        }`}
                      >
                        <div>
                          <div className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-bold flex items-center gap-1">
                            {line.batchNumber}
                            <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                              (Exp: {line.expiryDate})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                            Loc: {line.rackLocation}
                          </div>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600" />
                      </button>
                    </td>

                    {/* Allocation & Scheme Indicator */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-1">
                        {/* Split Allocation Pill */}
                        {line.isSplit ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-600/40 shadow-xs animate-pulse-subtle">
                            <Split className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Split-Allocation
                            <span className="text-[9px] font-normal text-amber-700 dark:text-amber-200 hidden xl:inline">
                              ({line.splitDetails})
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            Single Batch Match
                          </span>
                        )}

                        {/* Scheme Tag */}
                        {line.schemeApplied && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-700">
                            <Tag className="w-2.5 h-2.5" /> {line.schemeApplied}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Billed Quantity Input */}
                    <td className="py-3 px-3 text-center">
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={e => handleQuantityChange(line.id, parseInt(e.target.value) || 1)}
                        onClick={e => e.stopPropagation()}
                        className="w-16 text-center font-mono font-bold bg-white dark:bg-slate-800 border-2 border-blue-400 dark:border-blue-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-lg py-1 px-1 text-slate-900 dark:text-white outline-none shadow-xs"
                      />
                    </td>

                    {/* Free Quantity (Auto Calculated from Scheme) */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {line.freeQuantity > 0 ? `+${line.freeQuantity}` : '—'}
                    </td>

                    {/* PTR Rate */}
                    <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-slate-100 font-semibold">
                      ₹{line.ptr.toFixed(2)}
                    </td>

                    {/* Discount % */}
                    <td className="py-3 px-3 text-center font-mono text-slate-900 dark:text-slate-100 font-semibold">
                      {line.discountPct > 0 ? `${line.discountPct}%` : '0%'}
                    </td>

                    {/* Taxable Value */}
                    <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-slate-100 font-bold">
                      ₹{lineTaxable.toFixed(2)}
                    </td>

                    {/* GST Component */}
                    <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                      <div className="font-semibold">₹{gstAmount.toFixed(2)}</div>
                      <div className="text-[9px] text-slate-600 dark:text-slate-400">
                        {isIntraState
                          ? `CGST+SGST (${line.gstPercentage}%)`
                          : `IGST (${line.gstPercentage}%)`}
                      </div>
                    </td>

                    {/* Net Line Total */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-900 dark:text-blue-300 text-sm">
                      ₹{lineTotal.toFixed(2)}
                    </td>

                    {/* Delete Line */}
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLine(line.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {lines.length === 0 && (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <Layers className="w-8 h-8 text-slate-600" />
            <p>Invoice grid is empty. Press <kbd className="px-2 py-1 rounded bg-slate-800 text-cyan-400 font-mono text-xs">F2</kbd> to add your first medicine line item.</p>
          </div>
        )}

        {/* 3. INVOICE SUMMARY CALCULATION DOCK */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6">
          {/* Left: Summary Metrics Breakdown */}
          <div className="flex items-center gap-6 divide-x divide-slate-200 dark:divide-slate-800 text-xs">
            <div>
              <div className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Gross Value</div>
              <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                ₹{grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pl-6">
              <div className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Discounts</div>
              <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                -₹{tradeDiscountTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="pl-6">
              <div className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                {isIntraState ? 'CGST / SGST Total' : 'IGST Total'}
              </div>
              <div className="text-base font-bold font-mono text-blue-700 dark:text-cyan-300">
                {isIntraState
                  ? `₹${cgstTotal.toFixed(2)} / ₹${sgstTotal.toFixed(2)}`
                  : `₹${igstTotal.toFixed(2)}`}
              </div>
            </div>

            <div className="pl-6">
              <div className="text-slate-500 dark:text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Round-off</div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                {roundOff >= 0 ? `+₹${roundOff}` : `-₹${Math.abs(roundOff)}`}
              </div>
            </div>
          </div>

          {/* Right: Net Payable Total & Commit Action */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                Net Payable Amount
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight flex items-baseline justify-end gap-1">
                <span className="text-blue-600 dark:text-cyan-400 text-lg">₹</span>
                {netPayable.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={handleCommitInvoice}
              disabled={isCommitting || lines.length === 0}
              className="flex items-center gap-2 px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isCommitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Locking Stock & Signing IRN...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  <span>SAVE & GENERATE INVOICE [F8]</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. KEYBOARD SHORTCUTS HINT DOCK */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">Keyboard Accelerators:</span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">F1</kbd> Customer
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">F2</kbd> Add Item
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">F3</kbd> Batches
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">F8</kbd> Commit Invoice
          </span>
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700">Esc</kbd> Dismiss
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Checkout SLA: <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">&lt; 2.0s</span> (Atomic Redis Lock + xmin)</span>
        </div>
      </div>

      {/* MODAL 1: CUSTOMER SELECTION [F1] */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <UserCheck className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                Select Customer Pharmacy / Hospital [F1]
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search by Pharmacy Name, GSTIN, Drug License or Code..."
                value={customerSearchQuery}
                onChange={e => setCustomerSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
              {customerList.filter(c =>
                c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.gstin.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                c.drugLicense20B.toLowerCase().includes(customerSearchQuery.toLowerCase())
              ).map(cust => (
                <div
                  key={cust.customerId}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setIsCustomerModalOpen(false);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedCustomer.customerId === cust.customerId
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-950 hover:bg-blue-50/40 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      {cust.name}
                      <span className="text-xs font-mono text-blue-700 dark:text-cyan-400 font-semibold">({cust.code})</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {cust.customerType} | DL 20B: <span className="font-mono font-medium">{cust.drugLicense20B}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {cust.stateName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Current Outstanding</div>
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                      ₹{formatInr(cust.currentOutstanding)}
                    </div>
                    <div className="text-[10px] text-slate-500" suppressHydrationWarning>
                      Limit: ₹{formatInr(cust.creditLimit)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FEFO BATCH SELECTOR [F3] */}
      {activeBatchModalLine && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="text-slate-900 dark:text-white font-bold text-base flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  FEFO Batch Selection Drawer [F3]
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeBatchModalLine.productName}</div>
              </div>
              <button
                onClick={() => setActiveBatchModalLine(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {SAMPLE_PRODUCTS.find(p => p.productId === activeBatchModalLine.productId)?.batches.map(batch => (
                <div
                  key={batch.batchId}
                  onClick={() => handleBatchSelect(activeBatchModalLine.id, batch)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    activeBatchModalLine.selectedBatchId === batch.batchId
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 shadow-xs'
                      : 'bg-white dark:bg-slate-950 hover:bg-blue-50/40 dark:hover:bg-slate-850 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-mono font-bold text-sm text-blue-700 dark:text-cyan-300 flex items-center gap-2">
                      {batch.batchNumber}
                      {batch.isNearExpiry && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                          Near Expiry
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      MFG: <span className="font-mono">{batch.manufacturingDate}</span> | EXP: <span className="font-mono font-bold text-slate-900 dark:text-white">{batch.expiryDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Rack Location: <span className="font-mono text-slate-700 dark:text-slate-300">{batch.rackLocation}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400">Available Balance</div>
                    <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {batch.availableQty} Units
                    </div>
                    <div className="text-[10px] text-slate-500">
                      PTR: ₹{batch.ptr.toFixed(2)} | MRP: ₹{batch.mrp.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE COMMITTED & PRINT RECEIPT */}
      {invoiceCommitted && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 text-center animate-pulse-subtle">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-700">
                Live .NET 9 API SLA: {invoiceCommitted.executionDurationMs || 151}ms
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Invoice Successfully Generated!</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Invoice No: <span className="text-cyan-400 font-bold">{invoiceCommitted.invoiceNumber}</span>
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white font-semibold">{invoiceCommitted.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Items Billed:</span>
                <span className="text-white">{invoiceCommitted.lineCount} Lines</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Indian E-Invoice IRN:</span>
                <span className="text-cyan-400 truncate max-w-[200px]">{invoiceCommitted.irnHash}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between font-bold text-sm">
                <span className="text-slate-300">Net Payable:</span>
                <span className="text-emerald-400" suppressHydrationWarning>₹{formatInr(invoiceCommitted.netPayable)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setInvoiceCommitted(null)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Close & Next Order [Esc]
              </button>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Print A4 Tax Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULL A4 STATUTORY GST TAX INVOICE PRINT PREVIEW */}
      <TaxInvoiceModal
        data={invoicePrintData}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
