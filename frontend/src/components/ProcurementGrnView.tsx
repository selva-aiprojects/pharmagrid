'use client';

import React, { useState, useEffect } from 'react';
import { pharmaApi, ApiSupplier, ApiProduct } from '@/services/apiClient';
import {
  FileInput,
  CheckCircle2,
  Building,
  Calendar,
  Layers,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  Printer,
  History,
  AlertTriangle,
  Check,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  FileText,
  X,
  Package,
} from 'lucide-react';

interface InwardLineItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  gstPercentage: number;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantityReceived: number;
  freeQuantityReceived: number;
  purchaseRate: number;
  mrp: number;
  putAwayRackLocation: string;
}

export default function ProcurementGrnView() {
  const [activeTab, setActiveTab] = useState<'entry' | 'history'>('entry');
  const [suppliers, setSuppliers] = useState<ApiSupplier[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState('INV-2026-9874');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [warehouseId, setWarehouseId] = useState('b3cf8912-3490-410a-8bf7-df84918e4732');
  const [warehouseName, setWarehouseName] = useState('Main Chennai Depot (Dock #2)');
  const [poNumber, setPoNumber] = useState('PO-2026-0811');

  const [lineItems, setLineItems] = useState<InwardLineItem[]>([
    {
      id: 'item-1',
      productId: '4a42b10a-1123-4c8d-b3b0-2b123d456789',
      productName: 'Pan 40mg Injection',
      hsnCode: '30049099',
      gstPercentage: 12,
      batchNumber: 'AUG-PAN40-102',
      manufacturingDate: '2026-08-01',
      expiryDate: '2028-07-31',
      quantityReceived: 500,
      freeQuantityReceived: 50,
      purchaseRate: 42.50,
      mrp: 75.00,
      putAwayRackLocation: 'Z1-R02-S03-B01',
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [grnResult, setGrnResult] = useState<any | null>(null);
  const [grnHistory, setGrnHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  // New Supplier Modal State
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    code: '',
    gstin: '',
    dlNo: '',
    creditPeriod: 30,
    city: 'Chennai',
    state: 'Tamil Nadu (33)'
  });

  const handleAddSupplier = () => {
    if (!newSupplierForm.name.trim()) {
      alert('Please enter supplier/manufacturer name.');
      return;
    }
    const newSup: ApiSupplier = {
      supplierId: `sup-${Date.now()}`,
      supplierCode: newSupplierForm.code.trim().toUpperCase() || `SUP-${Math.floor(100 + Math.random() * 900)}`,
      supplierName: newSupplierForm.name.trim(),
      gstinNumber: newSupplierForm.gstin.trim().toUpperCase() || '33AAACS9981E1Z9',
      stateCode: '33',
      drugLicenseNo: newSupplierForm.dlNo.trim() || 'TN/CHE/20B/0099',
      currentPayableBalance: 0,
      creditPeriodDays: Number(newSupplierForm.creditPeriod) || 30
    };
    setSuppliers(prev => [newSup, ...prev]);
    setSelectedSupplierId(newSup.supplierId);
    setShowAddSupplierModal(false);
    setNewSupplierForm({
      name: '',
      code: '',
      gstin: '',
      dlNo: '',
      creditPeriod: 30,
      city: 'Chennai',
      state: 'Tamil Nadu (33)'
    });
  };

  // Load suppliers and products on mount
  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const res = await pharmaApi.getSuppliers();
      if (res && res.length > 0) {
        setSuppliers(res);
        if (!selectedSupplierId) {
          setSelectedSupplierId(res[0].supplierId);
        }
      }
    } catch (e) {
      console.warn('Failed to load suppliers:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await pharmaApi.getProducts();
      if (res && res.length > 0) {
        setProducts(res);
      }
    } catch (e) {
      console.warn('Failed to load products:', e);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await pharmaApi.getGrnHistory();
      setGrnHistory(res || []);
    } catch (e) {
      console.warn('Failed to load GRN history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleProductChange = (itemId: string, newProductId: string) => {
    const selectedProd = products.find(p => p.productId === newProductId);
    if (!selectedProd) return;

    setLineItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          productId: selectedProd.productId,
          productName: selectedProd.productName,
          hsnCode: selectedProd.hsnCode || '30049099',
          gstPercentage: selectedProd.gstPercentage || 12,
          purchaseRate: selectedProd.ptr || item.purchaseRate,
          mrp: selectedProd.mrp || item.mrp,
        };
      })
    );
  };

  const handleUpdateItem = (itemId: string, field: keyof InwardLineItem, val: any) => {
    setLineItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, [field]: val } : item))
    );
  };

  const handleAddItem = () => {
    const defaultProd = products[0] || {
      productId: '4a42b10a-2223-4c8d-b3b0-2b123d456789',
      productName: 'Augmentin 625mg Tablet',
      hsnCode: '30041010',
      gstPercentage: 12,
      ptr: 142.50,
      mrp: 204.00,
    };

    const newItem: InwardLineItem = {
      id: `item-${Date.now()}`,
      productId: defaultProd.productId,
      productName: defaultProd.productName,
      hsnCode: defaultProd.hsnCode,
      gstPercentage: defaultProd.gstPercentage,
      batchNumber: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      manufacturingDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantityReceived: 100,
      freeQuantityReceived: 0,
      purchaseRate: defaultProd.ptr || 100,
      mrp: defaultProd.mrp || 150,
      putAwayRackLocation: 'Z1-R01-S02-B01',
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(item => item.id !== itemId));
  };

  const currentSupplier = suppliers.find(s => s.supplierId === selectedSupplierId) || suppliers[0] || {
    supplierId: '8f828a2b-dc74-4b51-8975-d16ba6ec89d8',
    supplierCode: 'SUP-SUN-01',
    supplierName: 'Sun Pharma Laboratories Ltd',
    gstinNumber: '33AAACS9981E1Z9',
    stateCode: '33',
    drugLicenseNo: 'TN/CHE/20B/0018',
    currentPayableBalance: 142500.00,
    creditPeriodDays: 30,
  };

  // Financial Computations
  const totalBilledUnits = lineItems.reduce((acc, item) => acc + (Number(item.quantityReceived) || 0), 0);
  const totalFreeUnits = lineItems.reduce((acc, item) => acc + (Number(item.freeQuantityReceived) || 0), 0);
  const totalUnits = totalBilledUnits + totalFreeUnits;

  const totalGrossAmount = lineItems.reduce((acc, item) => {
    return acc + (Number(item.quantityReceived) || 0) * (Number(item.purchaseRate) || 0);
  }, 0);

  const totalGstAmount = lineItems.reduce((acc, item) => {
    const gross = (Number(item.quantityReceived) || 0) * (Number(item.purchaseRate) || 0);
    return acc + gross * ((Number(item.gstPercentage) || 0) / 100);
  }, 0);

  const netPayable = totalGrossAmount + totalGstAmount;

  // Validation
  const hasExpiryError = lineItems.some(
    item => new Date(item.expiryDate) <= new Date(item.manufacturingDate)
  );

  const handleFinalizeGrn = async () => {
    setErrorMessage(null);
    if (!supplierInvoiceNumber.trim()) {
      setErrorMessage('Supplier Invoice Number is mandatory for statutory GST purchase entries.');
      return;
    }
    if (lineItems.length === 0) {
      setErrorMessage('At least one SKU line item is required.');
      return;
    }
    if (hasExpiryError) {
      setErrorMessage('CDSCO Compliance Violation: Expiry Date must be strictly greater than Manufacturing Date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        supplierId: currentSupplier.supplierId,
        supplierInvoiceNumber: supplierInvoiceNumber.trim(),
        invoiceDate,
        warehouseId,
        lineItems: lineItems.map(item => ({
          productId: item.productId,
          batchNumber: item.batchNumber.trim(),
          manufacturingDate: item.manufacturingDate,
          expiryDate: item.expiryDate,
          quantityReceived: Number(item.quantityReceived),
          freeQuantityReceived: Number(item.freeQuantityReceived),
          purchaseRate: Number(item.purchaseRate),
          mrp: Number(item.mrp),
          hsnCode: item.hsnCode,
          gstPercentage: Number(item.gstPercentage),
          putAwayRackLocation: item.putAwayRackLocation.trim() || 'Z1-R01-S01-B01',
        })),
      };

      const res = await pharmaApi.createGrn(payload);
      setGrnResult(res);
      // Refresh history in background
      loadHistory();
    } catch (e: any) {
      console.warn('GRN Error:', e);
      setErrorMessage(e.message || 'Failed to finalize GRN. Please verify network or database connectivity.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 1. TOP HEADER & NAVIGATION */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileInput className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Inbound Procurement &amp; Goods Receipt Note (GRN)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            CDSCO-compliant batch ingestion, zone-rack put-away indexing &amp; dual GST purchase ledger commitment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('entry')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeTab === 'entry'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              New Inward GRN
            </button>
            <button
              onClick={() => {
                setActiveTab('history');
                loadHistory();
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              Inward History ({grnHistory.length})
            </button>
          </div>

          {activeTab === 'entry' && (
            <button
              onClick={handleFinalizeGrn}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className={`w-4 h-4 ${isSubmitting ? 'animate-spin' : ''}`} />
              {isSubmitting ? 'Posting to Aiven Cloud...' : 'Commit Inward GRN to Batches'}
            </button>
          )}
        </div>
      </div>

      {/* ERROR NOTICE BANNER */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL */}
      {grnResult && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-600/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-emerald-900 dark:text-emerald-100 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-950 dark:text-white flex items-center gap-2">
                <span>Inward GRN Committed Successfully!</span>
                <span className="font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs">
                  {grnResult.grnNumber}
                </span>
              </div>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">
                {grnResult.batchesCreated} batch(es) registered into Aiven Cloud PostgreSQL. Supplier payable balance credited by ₹
                {grnResult.netPayableAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSlipModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-800 dark:text-emerald-100 font-semibold border border-emerald-300 dark:border-emerald-700 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Inward Slip
            </button>
            <button
              onClick={() => {
                setGrnResult(null);
                setSupplierInvoiceNumber(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
            >
              Punch Another GRN
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: NEW INWARD GRN ENTRY */}
      {activeTab === 'entry' && (
        <>
          {/* 2. SUPPLIER & INVOICE METADATA CARD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Supplier Selector */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                  Manufacturer / Supplier
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(true)}
                  className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Vendor
                </button>
              </div>
              <select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                {suppliers.map(s => (
                  <option key={s.supplierId} value={s.supplierId}>
                    {s.supplierName} ({s.supplierCode})
                  </option>
                ))}
              </select>
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>GSTIN: {currentSupplier.gstinNumber}</span>
                <span>DL: {currentSupplier.drugLicenseNo}</span>
              </div>
            </div>

            {/* Supplier Invoice Number & Date */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={supplierInvoiceNumber}
                    onChange={e => setSupplierInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                PO Reference: <span className="font-mono text-slate-700 dark:text-slate-300">{poNumber}</span>
              </div>
            </div>

            {/* Receiving Depot / Storage */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Receiving Depot / Dock
              </label>
              <select
                value={warehouseName}
                onChange={e => setWarehouseName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="Main Chennai Depot (Dock #2)">Main Chennai Depot (Dock #2)</option>
                <option value="Cold Chain Depot 1 (2-8°C)">Cold Chain Depot 1 (2-8°C)</option>
                <option value="Central Buffer Warehouse B">Central Buffer Warehouse B</option>
              </select>
              <div className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                Physical Inward Inspection Ready
              </div>
            </div>

            {/* Payable Summary */}
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 block">
                    Net Payable to Supplier
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-base">
                    ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {currentSupplier.creditPeriodDays}d Credit
                </span>
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
                <span>Taxable: ₹{totalGrossAmount.toFixed(2)}</span>
                <span>GST (ITC): ₹{totalGstAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* 3. MULTI-SKU INWARD TABLE */}
          <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Physical Batch Inspection &amp; Inward Put-Away
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                  {lineItems.length} SKU(s)
                </span>
              </div>

              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-800/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700 text-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Another SKU
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 min-w-[200px]">Product / Molecule</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Batch Number</th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">MFG Date</th>
                    <th className="py-2.5 px-3 text-center min-w-[110px]">EXP Date</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px]">Billed Qty</th>
                    <th className="py-2.5 px-3 text-center min-w-[90px] text-emerald-600 dark:text-emerald-400">
                      Free Bonus
                    </th>
                    <th className="py-2.5 px-3 text-right min-w-[90px]">Purchase Rate</th>
                    <th className="py-2.5 px-3 text-right min-w-[80px]">MRP</th>
                    <th className="py-2.5 px-3 min-w-[130px]">Put-Away Rack</th>
                    <th className="py-2.5 px-3 text-right min-w-[100px]">Line Total</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
                  {lineItems.map((item, idx) => {
                    const lineGross = (Number(item.quantityReceived) || 0) * (Number(item.purchaseRate) || 0);
                    const lineGst = lineGross * ((Number(item.gstPercentage) || 0) / 100);
                    const lineTotal = lineGross + lineGst;
                    const isExpInvalid = new Date(item.expiryDate) <= new Date(item.manufacturingDate);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {/* Product Picker */}
                        <td className="py-2.5 px-3">
                          <select
                            value={item.productId}
                            onChange={e => handleProductChange(item.id, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          >
                            {products.length > 0 ? (
                              products.map(p => (
                                <option key={p.productId} value={p.productId}>
                                  {p.productName} ({p.code})
                                </option>
                              ))
                            ) : (
                              <option value={item.productId}>{item.productName}</option>
                            )}
                          </select>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            HSN: {item.hsnCode} | GST: {item.gstPercentage}%
                          </div>
                        </td>

                        {/* Batch Number */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.batchNumber}
                            onChange={e => handleUpdateItem(item.id, 'batchNumber', e.target.value)}
                            placeholder="e.g. AUG-PAN-102"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-blue-700 dark:text-cyan-300 focus:outline-none focus:border-blue-500 uppercase"
                          />
                        </td>

                        {/* Manufacturing Date */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="date"
                            value={item.manufacturingDate}
                            onChange={e => handleUpdateItem(item.id, 'manufacturingDate', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                          />
                        </td>

                        {/* Expiry Date */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="date"
                            value={item.expiryDate}
                            onChange={e => handleUpdateItem(item.id, 'expiryDate', e.target.value)}
                            className={`w-full bg-slate-50 dark:bg-slate-900 border rounded px-1.5 py-1 text-xs font-mono focus:outline-none ${
                              isExpInvalid
                                ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                                : 'border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400'
                            }`}
                          />
                          {isExpInvalid && (
                            <span className="text-[9px] text-rose-500 font-bold block mt-0.5">EXP &le; MFG!</span>
                          )}
                        </td>

                        {/* Quantity Received */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantityReceived}
                            onChange={e => handleUpdateItem(item.id, 'quantityReceived', e.target.value)}
                            className="w-20 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                          />
                        </td>

                        {/* Free Bonus Quantity */}
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={item.freeQuantityReceived}
                            onChange={e => handleUpdateItem(item.id, 'freeQuantityReceived', e.target.value)}
                            className="w-16 text-center bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded px-2 py-1 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 focus:outline-none focus:border-emerald-500"
                          />
                        </td>

                        {/* Purchase Rate */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1 text-slate-400">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.purchaseRate}
                              onChange={e => handleUpdateItem(item.id, 'purchaseRate', e.target.value)}
                              className="w-20 text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded pl-4 pr-1.5 py-1 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </td>

                        {/* MRP */}
                        <td className="py-2.5 px-3 text-right">
                          <div className="relative">
                            <span className="absolute left-1.5 top-1 text-slate-400">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={item.mrp}
                              onChange={e => handleUpdateItem(item.id, 'mrp', e.target.value)}
                              className="w-20 text-right bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded pl-4 pr-1.5 py-1 text-xs font-mono text-slate-600 dark:text-slate-400 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </td>

                        {/* Location Rack */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={item.putAwayRackLocation}
                            onChange={e => handleUpdateItem(item.id, 'putAwayRackLocation', e.target.value)}
                            placeholder="Z1-R02-S03-B01"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500"
                          />
                        </td>

                        {/* Line Total */}
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          ₹{lineTotal.toFixed(2)}
                        </td>

                        {/* Remove Action */}
                        <td className="py-2.5 px-2 text-center">
                          {lineItems.length > 1 && (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Summary Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <span>
                  Total Billed Units: <strong className="text-slate-900 dark:text-white font-mono">{totalBilledUnits}</strong>
                </span>
                <span>
                  Free Bonus Units: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{totalFreeUnits}</strong>
                </span>
                <span>
                  Total Physical Stock Ingested: <strong className="text-blue-600 dark:text-cyan-400 font-mono">{totalUnits}</strong>
                </span>
              </div>

              <div className="flex items-center gap-4 font-mono">
                <span className="text-slate-600 dark:text-slate-400">
                  Pre-Tax Total: <strong>₹{totalGrossAmount.toFixed(2)}</strong>
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  ITC GST: <strong>₹{totalGstAmount.toFixed(2)}</strong>
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Net Payable: ₹{netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: INWARD GRN AUDIT LEDGER */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Aiven Cloud PostgreSQL Inward Audit History (T_Purchase_Invoices &amp; T_Batches)
            </span>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
              Refresh Ledger
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {grnHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past Inward GRNs found in the cloud ledger. Commit a new inward GRN to see records here.
              </div>
            ) : (
              grnHistory.map((item, idx) => {
                let parsedDetails: any = {};
                try {
                  parsedDetails = JSON.parse(item.details || '{}');
                } catch {
                  parsedDetails = { details: item.details };
                }

                return (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-blue-600 dark:text-cyan-400 text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{item.grnNumber}</span>
                          <span className="px-2 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                            Committed to Cloud
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Supplier: <strong>{parsedDetails.Supplier || 'Pharma Supplier'}</strong> &bull; Batches Inwarded:{' '}
                          <strong className="text-blue-600 dark:text-cyan-300">{parsedDetails.Batches || 1}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-slate-400 block">Ledger Credit</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{Number(parsedDetails.NetPayable || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right text-[11px] font-mono text-slate-400">
                        {new Date(item.timestamp).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. MODAL: GOODS RECEIPT SLIP PREVIEW & PRINT */}
      {showSlipModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Statutory Goods Receipt Note (GRN) Inward Slip
                </h3>
              </div>
              <button
                onClick={() => setShowSlipModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slip Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans text-slate-800 dark:text-slate-200">
              {/* Slip Top Header */}
              <div className="border-b pb-4 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-base text-blue-700 dark:text-blue-400">PHARMAGRID PHARMACEUTICALS</h4>
                  <p className="text-[11px] text-slate-500">Central Pharma Logistics Depot, Chennai &bull; GSTIN: 33AAACS9981E1Z9</p>
                  <p className="text-[11px] text-slate-500">CDSCO License: TN/CHE/20B/0018 &bull; TN/CHE/21B/0019</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-sm bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 px-2.5 py-1 rounded border border-blue-200 dark:border-blue-800">
                    {grnResult?.grnNumber || 'GRN-2026-PENDING'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">Inward Date: {invoiceDate}</p>
                </div>
              </div>

              {/* Vendor & Invoice Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Supplier Name &amp; GSTIN</span>
                  <strong>{currentSupplier.supplierName}</strong>
                  <p className="text-slate-500">GSTIN: {currentSupplier.gstinNumber} | DL: {currentSupplier.drugLicenseNo}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[9px] font-bold block">Supplier Invoice / PO Ref</span>
                  <strong className="font-mono text-blue-600 dark:text-cyan-400">{supplierInvoiceNumber}</strong>
                  <p className="text-slate-500">PO Ref: {poNumber} | Dock: {warehouseName}</p>
                </div>
              </div>

              {/* Inward Batches Table */}
              <table className="w-full text-left border border-slate-200 dark:border-slate-800 rounded">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2">Item Name</th>
                    <th className="p-2">Batch No</th>
                    <th className="p-2 text-center">MFG</th>
                    <th className="p-2 text-center">EXP</th>
                    <th className="p-2 text-center">Billed</th>
                    <th className="p-2 text-center">Free</th>
                    <th className="p-2">Put-Away Rack</th>
                    <th className="p-2 text-right">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {lineItems.map((item, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{item.productName}</td>
                      <td className="p-2 font-mono font-bold text-blue-600 dark:text-cyan-300">{item.batchNumber}</td>
                      <td className="p-2 text-center font-mono">{item.manufacturingDate}</td>
                      <td className="p-2 text-center font-mono text-emerald-600">{item.expiryDate}</td>
                      <td className="p-2 text-center font-mono">{item.quantityReceived}</td>
                      <td className="p-2 text-center font-mono text-blue-600">+{item.freeQuantityReceived}</td>
                      <td className="p-2 font-mono">{item.putAwayRackLocation}</td>
                      <td className="p-2 text-right font-mono">₹{Number(item.purchaseRate).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Verification & CDSCO Signatures */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-center text-[10px] text-slate-500">
                <div className="border-t border-dashed pt-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Warehouse Receiving Executive</p>
                  <p className="font-mono text-[9px]">Dock Verified &bull; Cartons Intact</p>
                </div>
                <div className="border-t border-dashed pt-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">QA Pharmacist (CDSCO)</p>
                  <p className="font-mono text-[9px]">Cold Chain &amp; Expiry Passed</p>
                </div>
                <div className="border-t border-dashed pt-2">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Accounts &amp; Ledger Verification</p>
                  <p className="font-mono text-[9px]">Posted to Purchase Daybook</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                Print Inward Slip (A4)
              </button>
              <button
                onClick={() => setShowSlipModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Supplier / Vendor */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Register Pharmaceutical Supplier / Vendor
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Add licensed manufacturer or C&amp;F distributor for inward GRN purchases
                </p>
              </div>
              <button
                onClick={() => setShowAddSupplierModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Supplier / Company Name *
                </label>
                <input
                  type="text"
                  value={newSupplierForm.name}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                  placeholder="e.g. Cipla Healthcare Ltd / Mankind Pharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Vendor Code
                  </label>
                  <input
                    type="text"
                    value={newSupplierForm.code}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, code: e.target.value })}
                    placeholder="e.g. SUP-CIP-01"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Credit Period (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={newSupplierForm.creditPeriod}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, creditPeriod: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={newSupplierForm.gstin}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, gstin: e.target.value })}
                    placeholder="e.g. 33AAACS9981E1Z9"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Drug License (Form 20B/21B)
                  </label>
                  <input
                    type="text"
                    value={newSupplierForm.dlNo}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, dlNo: e.target.value })}
                    placeholder="e.g. TN/CHE/20B/0099"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Operating City
                  </label>
                  <input
                    type="text"
                    value={newSupplierForm.city}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    State Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={newSupplierForm.state}
                    onChange={e => setNewSupplierForm({ ...newSupplierForm, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSupplierModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSupplier}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Register Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
