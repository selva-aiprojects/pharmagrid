'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiStockMasterItem,
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              INVENTORY GOVERNANCE
            </span>
            <span className="text-slate-500 text-xs">CDSCO Breakage & Leakage Audit Register</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Boxes className="w-7 h-7 text-cyan-400" />
            Unified Stock Master & Audit Adjustments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Consolidated SKU view (Physical vs Book vs Allocated vs Quarantine) and statutory drug inspector breakage write-offs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 transition"
          >
            <ShieldAlert className="w-4 h-4" />
            Write-Off Breakage / Leakage
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active SKUs</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalSkus}</div>
            <div className="text-xs text-cyan-400 mt-1 flex items-center gap-1">
              <Boxes className="w-3 h-3" /> Master Catalog
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Batches</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">{summary.totalBatches}</div>
            <div className="text-xs text-slate-500 mt-1">Bin Tracked Lots</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Stock Valuation</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{summary.totalValuation.toLocaleString('en-IN')}</div>
            <div className="text-xs text-emerald-500/80 mt-1">Available Asset Value</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Low Stock Warnings</div>
            <div className="text-2xl font-bold text-amber-400 mt-1">{summary.lowStockCount}</div>
            <div className="text-xs text-amber-500/80 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Below Reorder Level
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Quarantine Units</div>
            <div className="text-2xl font-bold text-rose-400 mt-1">{summary.expiredQuarantineCount}</div>
            <div className="text-xs text-rose-500/80 mt-1">CDSCO Quarantine Bay</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Breakage Loss</div>
            <div className="text-2xl font-bold text-rose-300 mt-1">₹{summary.monthlyBreakageLoss.toLocaleString('en-IN')}</div>
            <div className="text-xs text-slate-500 mt-1">Audit Discrepancies</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('master')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'master'
              ? 'border-cyan-500 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Consolidated SKU Stock Master ({filteredItems.length})
        </button>
        <button
          onClick={() => setActiveTab('adjustments')}
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition ${
            activeTab === 'adjustments'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          CDSCO Write-Off & Breakage Register ({adjustments.length})
        </button>
      </div>

      {/* Tab 1: Consolidated Stock Master */}
      {activeTab === 'master' && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search brand, molecule, SKU code, or manufacturer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="text-xs text-slate-500">
              Click an SKU row to expand batch-level rack allocations
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map(sku => {
                  const isExpanded = expandedSkuId === sku.productId;
                  const isLow = sku.totalAvailableStock <= sku.reorderLevel;

                  return (
                    <React.Fragment key={sku.productId}>
                      <tr
                        onClick={() => setExpandedSkuId(isExpanded ? null : sku.productId)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition ${isExpanded ? 'bg-slate-800/30' : ''}`}
                      >
                        <td className="py-3.5 px-4 text-slate-500">
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-cyan-400" /> : <ChevronRight className="w-4 h-4" />}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            {sku.brandName}
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                              {sku.productCode}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-sm">{sku.genericName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {sku.manufacturer}
                          <div className="text-[10px] text-slate-500 font-mono">HSN: {sku.hsnCode} • GST: {sku.gstRate}%</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-slate-300">
                          {sku.totalPhysicalStock}
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-400 font-mono text-xs">
                          {sku.totalAllocatedStock > 0 ? `-${sku.totalAllocatedStock}` : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-rose-400">
                          {sku.totalQuarantineStock > 0 ? `${sku.totalQuarantineStock} (Lock)` : '0'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-cyan-400 text-base">
                          {sku.totalAvailableStock}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-400">
                          ₹{sku.stockValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isLow
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {isLow ? 'Low Stock' : 'Adequate'}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded Batch Drilldown */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={9} className="p-4 pl-12 border-b border-slate-800">
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <PackageCheck className="w-3.5 h-3.5 text-cyan-400" />
                              Active Warehoused Batches for {sku.brandName} ({sku.batches.length})
                            </div>
                            <div className="border border-slate-800 rounded-xl overflow-hidden">
                              <table className="w-full text-left text-xs text-slate-300">
                                <thead className="bg-slate-900 text-slate-400 uppercase border-b border-slate-800">
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
                                <tbody className="divide-y divide-slate-800/60">
                                  {sku.batches.map(b => (
                                    <tr key={b.batchId} className="hover:bg-slate-900/40">
                                      <td className="py-2 px-3 font-mono font-semibold text-cyan-300">{b.batchNumber}</td>
                                      <td className="py-2 px-3 text-slate-400">
                                        {new Date(b.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="py-2 px-3 font-mono text-slate-400">{b.locationBin}</td>
                                      <td className="py-2 px-3 text-center">{b.physicalStock}</td>
                                      <td className="py-2 px-3 text-center text-rose-400 font-mono">{b.quarantineStock}</td>
                                      <td className="py-2 px-3 text-center font-bold text-emerald-400">{b.availableStock}</td>
                                      <td className="py-2 px-3">₹{b.purchasePrice.toFixed(2)}</td>
                                      <td className="py-2 px-3">₹{b.mrp.toFixed(2)}</td>
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
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">CDSCO Form 20B Statutory Breakage & Quarantine Register</div>
            <div className="text-xs text-slate-500">Immutable write-off vouchers with reason codes for Drug Inspector audits</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60">
                {adjustments.map(adj => (
                  <tr key={adj.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-400">
                      {adj.adjustmentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{adj.productName}</div>
                      <div className="text-xs text-slate-500 font-mono">Batch: {adj.batchNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {adj.adjustmentType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-rose-400 font-mono">
                      {adj.quantity}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-rose-300">
                      ₹{adj.totalValueLoss.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {adj.reasonCode}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {adj.approvedBy}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  CDSCO Stock Adjustment Voucher
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Record breakage, leakage, expiry quarantine, or physical count variance</p>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-rose-500"
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
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={adjBatchNumber}
                    onChange={e => setAdjBatchNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Adjustment Units
                  </label>
                  <input
                    type="number"
                    value={adjQty}
                    onChange={e => setAdjQty(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Write-off Category
                </label>
                <select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="Breakage">Breakage (Physical damage during handling)</option>
                  <option value="Leakage">Leakage (Ampoule/vial seal failure)</option>
                  <option value="ExpiryQuarantine">Expiry Quarantine (Lock for vendor credit claim)</option>
                  <option value="PhysicalVariance">Physical Audit Discrepancy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Regulatory Reason Code
                </label>
                <input
                  type="text"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 text-xs"
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

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAdjustment}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-500/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit CDSCO Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
