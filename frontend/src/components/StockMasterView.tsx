'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiStockMasterItem,
  ApiStockMasterBatch,
  ApiStockAdjustment,
  ApiStockMasterSummary
} from '@/services/apiClient';
import SmartPharmaTextArea from '@/components/SmartPharmaTextArea';
import {
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Plus,
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  DollarSign,
  PackageCheck,
  Search,
  X,
  FileText
} from 'lucide-react';

export default function StockMasterView() {
  const [activeTab, setActiveTab] = useState<'master' | 'adjustments'>('master');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiStockMasterSummary | null>(null);
  const [items, setItems] = useState<ApiStockMasterItem[]>([]);
  const [adjustments, setAdjustments] = useState<ApiStockAdjustment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSkuId, setExpandedSkuId] = useState<string | null>(null);

  // New Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjProductId, setAdjProductId] = useState('');
  const [adjBatchNumber, setAdjBatchNumber] = useState('');
  const [adjType, setAdjType] = useState<'Breakage' | 'Leakage' | 'ExpiryQuarantine' | 'PhysicalVariance'>('Breakage');
  const [adjQty, setAdjQty] = useState(10);
  const [adjReason, setAdjReason] = useState('CDSCO-BRK-01 (Carton crushed/damaged during warehouse handling)');
  const [adjNotes, setAdjNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add SKU / Opening Batch Modal
  const [showAddSkuModal, setShowAddSkuModal] = useState(false);
  const [skuFormData, setSkuFormData] = useState({
    brandName: '',
    genericName: '',
    manufacturer: 'Sun Pharmaceutical Industries',
    dosageForm: 'Tablet',
    packSize: '10 Tablets/Strip',
    hsnCode: '30049099',
    scheduleClass: 'H',
    batchNumber: 'BAT-' + Math.floor(1000 + Math.random() * 9000),
    expiryDate: '2028-06-30',
    openingQty: 300,
    ptr: 45.0,
    mrp: 65.0,
    rackLocation: 'Z1-R02-S3',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuFormData.brandName.trim()) {
      showToast('⚠️ Brand Name is required');
      return;
    }
    const openQty = Number(skuFormData.openingQty) || 100;
    const ptr = Number(skuFormData.ptr) || 50;
    const mrp = Number(skuFormData.mrp) || 75;
    const stockVal = openQty * ptr;

    const newBatch: ApiStockMasterBatch = {
      batchId: 'b-' + Date.now(),
      batchNumber: skuFormData.batchNumber || 'BAT-' + Math.floor(1000 + Math.random() * 9000),
      expiryDate: skuFormData.expiryDate || '2028-12-31',
      physicalStock: openQty,
      bookStock: openQty,
      allocatedStock: 0,
      quarantineStock: 0,
      availableStock: openQty,
      purchasePrice: ptr,
      mrp: mrp,
      locationBin: skuFormData.rackLocation || 'Z1-R01-S1',
    };
    const newSku: ApiStockMasterItem = {
      productId: 'prod-' + Date.now(),
      productCode: 'MED-' + (items.length + 101),
      brandName: skuFormData.brandName.trim(),
      genericName: skuFormData.genericName.trim() || skuFormData.brandName.trim(),
      manufacturer: skuFormData.manufacturer,
      category: 'Pharmaceutical Formulation',
      hsnCode: '30049099',
      gstRate: 12,
      totalPhysicalStock: openQty,
      totalBookStock: openQty,
      totalAllocatedStock: 0,
      totalQuarantineStock: 0,
      totalAvailableStock: openQty,
      batchCount: 1,
      storageCondition: 'Ambient (Below 25°C)',
      scheduleClass: 'H',
      reorderLevel: 50,
      stockValue: stockVal,
      batches: [newBatch],
    };
    setItems(prev => [newSku, ...prev]);
    setShowAddSkuModal(false);
    showToast(`✅ Medicine "${newSku.brandName}" registered with initial batch ${newBatch.batchNumber}!`);
    setSummary((s: any) => s ? {
      ...s,
      totalSkusActive: s.totalSkusActive + 1,
      totalPhysicalUnits: s.totalPhysicalUnits + newSku.totalPhysicalStock,
      totalNetAvailableUnits: s.totalNetAvailableUnits + newSku.totalAvailableStock,
      totalInventoryValuation: s.totalInventoryValuation + newSku.stockValue,
    } : null);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [sumRes, itemsRes, adjRes] = await Promise.all([
        pharmaApi.getStockMasterSummary(),
        pharmaApi.getStockMasterItems(),
        pharmaApi.getStockAdjustments()
      ]);
      setSummary(sumRes);
      setItems(itemsRes);
      setAdjustments(adjRes);

      if (itemsRes.length > 0 && !adjProductId) {
        setAdjProductId(itemsRes[0].productId);
        if (itemsRes[0].batches.length > 0) {
          setAdjBatchNumber(itemsRes[0].batches[0].batchNumber);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAdjustment = async () => {
    const sku = items.find(i => i.productId === adjProductId);
    if (!sku) return;

    try {
      await pharmaApi.createStockAdjustment({
        productId: adjProductId,
        productName: sku.brandName,
        batchNumber: adjBatchNumber,
        adjustmentType: adjType,
        quantity: -Math.abs(adjQty),
        reasonCode: adjReason,
        approvedBy: 'Selva Kumaran (Owner/Reg. Pharmacist)',
        notes: adjNotes || 'CDSCO statutory stock adjustment voucher recorded.'
      });

      showToast(`✅ Stock adjustment voucher recorded for ${sku.brandName}!`);
      setShowAdjustModal(false);
      setAdjNotes('');
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to record adjustment');
    }
  };

  const filteredItems = items.filter(i =>
    i.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.productCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30">
              INVENTORY GOVERNANCE
            </span>
            <span className="text-slate-500 text-xs">CDSCO Breakage & Leakage Audit Register</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Boxes className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
            Unified Stock Master & Audit Adjustments
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Consolidated SKU view (Physical vs Book vs Allocated vs Quarantine) and statutory drug inspector breakage write-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500 dark:text-cyan-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddSkuModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Medicine SKU
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            Write-Off Breakage / Leakage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Active SKUs</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalSkus}</div>
            <div className="text-xs text-blue-600 dark:text-cyan-400 mt-1 flex items-center gap-1 font-medium">
              <Boxes className="w-3.5 h-3.5" /> Master Catalog
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Total Batches</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{summary.totalBatches}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Bin Tracked Lots</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Stock Valuation</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{summary.totalValuation.toLocaleString('en-IN')}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 font-medium">Available Asset Value</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Low Stock Warnings</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.lowStockCount}</div>
            <div className="text-xs text-amber-700 dark:text-amber-400/90 mt-1 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" /> Below Reorder Level
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Quarantine Units</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.expiredQuarantineCount}</div>
            <div className="text-xs text-rose-700 dark:text-rose-400/90 mt-1 font-medium">CDSCO Quarantine Bay</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Breakage Loss</div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-300 mt-1">₹{summary.monthlyBreakageLoss.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Audit Discrepancies</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('master')}
          className={`pb-3 px-2 font-semibold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'master'
              ? 'border-blue-600 text-blue-600 dark:border-cyan-500 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Consolidated SKU Stock Master ({filteredItems.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`pb-3 px-2 font-semibold text-sm flex items-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === 'adjustments'
              ? 'border-rose-600 text-rose-600 dark:border-rose-500 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          CDSCO Write-Off & Breakage Register ({adjustments.length})
        </button>
      </div>

      {/* Tab 1: Consolidated Stock Master */}
      {activeTab === 'master' && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search brand, molecule, SKU code, or manufacturer..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Click an SKU row to expand batch-level rack allocations
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Brand & Molecule</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4 text-center">Physical</th>
                  <th className="py-3 px-4 text-center">Allocated</th>
                  <th className="py-3 px-4 text-center">Quarantine</th>
                  <th className="py-3 px-4 text-center">Net Available</th>
                  <th className="py-3 px-4">Stock Valuation</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredItems.map(sku => {
                  const isExpanded = expandedSkuId === sku.productId;
                  const isLow = sku.totalAvailableStock <= sku.reorderLevel;

                  return (
                    <React.Fragment key={sku.productId}>
                      <tr
                        onClick={() => setExpandedSkuId(isExpanded ? null : sku.productId)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition ${isExpanded ? 'bg-blue-50/50 dark:bg-slate-800/40' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-slate-400">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            {sku.brandName}
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {sku.productCode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-sm">{sku.genericName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-400">
                          {sku.manufacturer}
                          <div className="text-[10px] text-slate-500 font-mono">HSN: {sku.hsnCode} • GST: {sku.gstRate}%</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-slate-200">
                          {sku.totalPhysicalStock}
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-700 dark:text-amber-400 font-mono text-xs font-semibold">
                          {sku.totalAllocatedStock > 0 ? `-${sku.totalAllocatedStock}` : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-rose-700 dark:text-rose-400 font-semibold">
                          {sku.totalQuarantineStock > 0 ? `${sku.totalQuarantineStock} (Lock)` : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-black text-blue-700 dark:text-cyan-400 text-base">
                          {sku.totalAvailableStock}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                          ₹{sku.stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          }`}>
                            {isLow ? 'Low Stock' : 'Adequate'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Batch Drilldown */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80 dark:bg-slate-950/80">
                          <td colSpan={9} className="p-4 pl-12 border-b border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <PackageCheck className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
                              Active Warehoused Batches for {sku.brandName} ({sku.batches.length})
                            </div>
                            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                              <table className="w-full text-left text-xs text-slate-800 dark:text-slate-300">
                                <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                                  <tr>
                                    <th className="py-2 px-3">Batch Number</th>
                                    <th className="py-2 px-3">Expiry Date</th>
                                    <th className="py-2 px-3">Bin Location</th>
                                    <th className="py-2 px-3 text-center">Physical</th>
                                    <th className="py-2 px-3 text-center">Quarantine</th>
                                    <th className="py-2 px-3 text-center">Available</th>
                                    <th className="py-2 px-3">PTR</th>
                                    <th className="py-2 px-3">MRP</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                  {sku.batches.map(b => (
                                    <tr key={b.batchId} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                                      <td className="py-2 px-3 font-mono font-bold text-blue-700 dark:text-cyan-300">{b.batchNumber}</td>
                                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                                        {new Date(b.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400">{b.locationBin}</td>
                                      <td className="py-2 px-3 text-center font-medium">{b.physicalStock}</td>
                                      <td className="py-2 px-3 text-center text-rose-700 dark:text-rose-400 font-mono font-semibold">{b.quarantineStock}</td>
                                      <td className="py-2 px-3 text-center font-bold text-emerald-700 dark:text-emerald-400">{b.availableStock}</td>
                                      <td className="py-2 px-3">₹{b.purchasePrice.toFixed(2)}</td>
                                      <td className="py-2 px-3 font-semibold">₹{b.mrp.toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: CDSCO Stock Adjustments */}
      {activeTab === 'adjustments' && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">CDSCO Form 20B Statutory Breakage & Quarantine Register</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Immutable write-off vouchers with reason codes for Drug Inspector audits</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Product & Batch</th>
                  <th className="py-3 px-4">Write-off Type</th>
                  <th className="py-3 px-4 text-center">Quantity</th>
                  <th className="py-3 px-4">Valuation Loss</th>
                  <th className="py-3 px-4">CDSCO Reason Code</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {adjustments.map(adj => (
                  <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400">
                      {adj.adjustmentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{adj.productName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">Batch: {adj.batchNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30">
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-600 dark:text-rose-400 font-mono">
                      {adj.quantity}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-300">
                      ₹{adj.totalValueLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {adj.reasonCode}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                      {adj.approvedBy}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(adj.createdDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Write-Off Breakage / Stock Adjustment */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  CDSCO Stock Adjustment Voucher
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Record breakage, leakage, expiry quarantine, or physical count variance</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Product SKU
                </label>
                <select
                  value={adjProductId}
                  onChange={e => {
                    setAdjProductId(e.target.value);
                    const sku = items.find(i => i.productId === e.target.value);
                    if (sku && sku.batches.length > 0) {
                      setAdjBatchNumber(sku.batches[0].batchNumber);
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
                >
                  {items.map(i => (
                    <option key={i.productId} value={i.productId}>
                      {i.brandName} ({i.productCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={adjBatchNumber}
                    onChange={e => setAdjBatchNumber(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Adjustment Units
                  </label>
                  <input
                    type="number"
                    value={adjQty}
                    onChange={e => setAdjQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Write-off Category
                </label>
                <select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                >
                  <option value="Breakage">Breakage (Physical damage during handling)</option>
                  <option value="Leakage">Leakage (Ampoule/vial seal failure)</option>
                  <option value="ExpiryQuarantine">Expiry Quarantine (Lock for vendor credit claim)</option>
                  <option value="PhysicalVariance">Physical Audit Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Regulatory Reason Code
                </label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              <SmartPharmaTextArea
                label="Auditor / Pharmacist Remarks"
                context="breakage"
                value={adjNotes}
                onChange={setAdjNotes}
                placeholder="e.g. Broken strips verified and quarantined in secure waste container under pharmacist supervision."
                rows={2}
              />
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdjustment}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit CDSCO Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEDICINE SKU & OPENING BATCH */}
      {showAddSkuModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  Add New Medicine SKU &amp; Opening Batch
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Register new pharmaceutical product code and allocate initial physical shelf stock.
                </p>
              </div>
              <button
                onClick={() => setShowAddSkuModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSku} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Medicine Commercial Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Telma 40mg Tablet"
                    value={skuFormData.brandName}
                    onChange={e => setSkuFormData({ ...skuFormData, brandName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Generic Molecule Composition *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Telmisartan 40mg IP"
                    value={skuFormData.genericName}
                    onChange={e => setSkuFormData({ ...skuFormData, genericName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Manufacturing Company
                  </label>
                  <select
                    value={skuFormData.manufacturer}
                    onChange={e => setSkuFormData({ ...skuFormData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  >
                    <option value="Sun Pharmaceutical Industries">Sun Pharmaceutical Industries</option>
                    <option value="Cipla Ltd">Cipla Ltd</option>
                    <option value="Dr. Reddy's Laboratories">Dr. Reddy's Laboratories</option>
                    <option value="GlaxoSmithKline India">GlaxoSmithKline India</option>
                    <option value="Alkem Laboratories">Alkem Laboratories</option>
                    <option value="Glenmark Pharmaceuticals">Glenmark Pharmaceuticals</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CDSCO Schedule</label>
                    <select
                      value={skuFormData.scheduleClass}
                      onChange={e => setSkuFormData({ ...skuFormData, scheduleClass: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                    >
                      <option value="Regular">Regular</option>
                      <option value="H">Schedule H</option>
                      <option value="H1">Schedule H1</option>
                      <option value="X">Schedule X</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">HSN Code</label>
                    <input
                      type="text"
                      value={skuFormData.hsnCode}
                      onChange={e => setSkuFormData({ ...skuFormData, hsnCode: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">PTR Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={skuFormData.ptr}
                      onChange={e => setSkuFormData({ ...skuFormData, ptr: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">MRP Rate (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={skuFormData.mrp}
                      onChange={e => setSkuFormData({ ...skuFormData, mrp: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Batch Information */}
                <div className="md:col-span-2 p-3 bg-blue-50/50 dark:bg-slate-950/60 rounded-xl border border-blue-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Batch No *
                    </label>
                    <input
                      type="text"
                      required
                      value={skuFormData.batchNumber}
                      onChange={e => setSkuFormData({ ...skuFormData, batchNumber: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 font-mono uppercase text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={skuFormData.expiryDate}
                      onChange={e => setSkuFormData({ ...skuFormData, expiryDate: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Opening Units *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={skuFormData.openingQty}
                      onChange={e => setSkuFormData({ ...skuFormData, openingQty: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1 font-semibold">
                      Rack Location
                    </label>
                    <input
                      type="text"
                      required
                      value={skuFormData.rackLocation}
                      onChange={e => setSkuFormData({ ...skuFormData, rackLocation: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded p-1.5 font-mono text-slate-900 dark:text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSkuModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save &amp; Allocate Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
