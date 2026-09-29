'use client';

import React, { useState, useEffect } from 'react';
import { SAMPLE_PRODUCTS } from '@/data/mockData';
import { pharmaApi, ApiBatch } from '@/services/apiClient';
import {
  Boxes,
  Search,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  Layers,
  Filter,
  RefreshCw,
  Plus,
  X,
  CheckCircle2,
} from 'lucide-react';

export default function WarehouseInventoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [liveBatches, setLiveBatches] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [showAddAllocationModal, setShowAddAllocationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [allocationForm, setAllocationForm] = useState({
    productName: 'Augmentin 625mg Duo Tablet',
    genericName: 'Amoxicillin + Clavulanic Acid 625mg',
    batchNumber: '',
    rackLocation: 'Z1-R02-S03-B04',
    availableQty: 100,
    uom: 'Strip (10 Tab)',
    ptr: 142.50,
    mrp: 204.00,
    manufacturingDate: new Date().toISOString().split('T')[0],
    expiryDate: '2028-06-30',
    storageCondition: 'Ambient (Below 25°C)',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateAllocation = () => {
    if (!allocationForm.batchNumber.trim()) {
      alert('Please enter a valid pharmaceutical Batch Number.');
      return;
    }
    const newBatch = {
      batchId: `batch-${Date.now()}`,
      productId: `prod-${Date.now()}`,
      productName: allocationForm.productName,
      genericName: allocationForm.genericName,
      batchNumber: allocationForm.batchNumber.trim().toUpperCase(),
      manufacturingDate: allocationForm.manufacturingDate,
      expiryDate: allocationForm.expiryDate,
      availableQty: Number(allocationForm.availableQty) || 50,
      uom: allocationForm.uom,
      ptr: Number(allocationForm.ptr) || 100,
      mrp: Number(allocationForm.mrp) || 150,
      rackLocation: allocationForm.rackLocation.trim().toUpperCase(),
      isNearExpiry: false,
      storageCondition: allocationForm.storageCondition,
      daysToExpiry: 450,
    };

    setLiveBatches(prev => [newBatch, ...prev]);
    setIsLive(true);
    setShowAddAllocationModal(false);
    showToast(`✅ Batch ${newBatch.batchNumber} assigned to Rack Bin ${newBatch.rackLocation}!`);
    setAllocationForm({
      productName: 'Augmentin 625mg Duo Tablet',
      genericName: 'Amoxicillin + Clavulanic Acid 625mg',
      batchNumber: '',
      rackLocation: 'Z1-R02-S03-B04',
      availableQty: 100,
      uom: 'Strip (10 Tab)',
      ptr: 142.50,
      mrp: 204.00,
      manufacturingDate: new Date().toISOString().split('T')[0],
      expiryDate: '2028-06-30',
      storageCondition: 'Ambient (Below 25°C)',
    });
  };

  const fetchBatches = () => {
    pharmaApi.getWarehouseBatches().then(batches => {
      if (batches && batches.length > 0) {
        const mapped = batches.map(b => ({
          batchId: b.batchId,
          productId: b.productId,
          productName: b.productName,
          genericName: b.productCode,
          batchNumber: b.batchNumber,
          manufacturingDate: b.manufacturingDate,
          expiryDate: b.expiryDate,
          availableQty: b.availableQuantity,
          ptr: b.ptr,
          mrp: b.mrp,
          rackLocation: b.locationRackBin,
          isNearExpiry: b.daysToExpiry <= 90,
          storageCondition: b.storageCondition,
          daysToExpiry: b.daysToExpiry,
        }));
        setLiveBatches(mapped);
        setIsLive(true);
      }
    }).catch(err => console.warn('Warehouse batch sync fallback:', err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Collect all batches across all products or use live API
  const defaultBatches = SAMPLE_PRODUCTS.flatMap(p =>
    p.batches.map(b => ({
      ...b,
      productName: p.name,
      genericName: p.genericName,
      uom: p.uom,
      hsnCode: p.hsnCode,
      storageCondition: p.storageCondition,
      daysToExpiry: 365,
    }))
  );

  const batchSource = isLive && liveBatches.length > 0 ? liveBatches : defaultBatches;

  const allBatches = batchSource.filter(b =>
    (b.productName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.batchNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.rackLocation || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Physical Inventory Balances &amp; Rack Allocations
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Real-time Zone-Rack-Shelf-Bin tracking with Available, Reserved, Quarantined, and Expired states.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono shadow-2xs">
            Total Batches: <strong className="text-blue-700 dark:text-cyan-400">{allBatches.length}</strong>
          </span>
          <button
            onClick={() => setShowAddAllocationModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Allocate Batch to Bin
          </button>
        </div>
      </div>

      {/* 2. SEARCH & WAREHOUSE FILTER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Batch No, Medicine Name, or Rack Bin (e.g. Z1-R02)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>
      </div>

      {/* 3. BATCH INVENTORY TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300 dark:border-slate-700">
            <tr>
              <th className="py-3 px-4">Medicine &amp; Molecule</th>
              <th className="py-3 px-3">Batch Number</th>
              <th className="py-3 px-3 text-center">MFG Date</th>
              <th className="py-3 px-3 text-center">Expiry Date</th>
              <th className="py-3 px-3">Warehouse Location (Z-R-S-B)</th>
              <th className="py-3 px-3 text-right">PTR Rate</th>
              <th className="py-3 px-3 text-right">Available Qty</th>
              <th className="py-3 px-3 text-right font-bold text-slate-800 dark:text-slate-100">Stock Asset Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
            {allBatches.map(batch => {
              const assetVal = batch.availableQty * batch.ptr;

              return (
                <tr key={batch.batchId} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{batch.productName}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">{batch.genericName}</div>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-slate-900 text-blue-700 dark:text-cyan-300 font-bold border border-blue-200 dark:border-slate-800">
                      {batch.batchNumber}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-600 dark:text-slate-300">
                    {batch.manufacturingDate}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      batch.isNearExpiry
                        ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                    }`}>
                      {batch.expiryDate}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-600 dark:text-cyan-400" />
                      {batch.rackLocation}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-slate-800 dark:text-slate-200">
                    ₹{batch.ptr.toFixed(2)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                    {batch.availableQty} {batch.uom}
                  </td>

                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ₹{assetVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal: Allocate Batch to Rack Bin */}
      {showAddAllocationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  Allocate Batch to Warehouse Rack Bin
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assign physical inventory stock to specific zone, rack, and shelf location
                </p>
              </div>
              <button
                onClick={() => setShowAddAllocationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Medicine / Product Name *
                </label>
                <input
                  type="text"
                  value={allocationForm.productName}
                  onChange={e => setAllocationForm({ ...allocationForm, productName: e.target.value })}
                  placeholder="e.g. Augmentin 625mg Duo Tablet"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={allocationForm.batchNumber}
                    onChange={e => setAllocationForm({ ...allocationForm, batchNumber: e.target.value })}
                    placeholder="e.g. BAT-2026-X99"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Rack Bin *
                  </label>
                  <input
                    type="text"
                    value={allocationForm.rackLocation}
                    onChange={e => setAllocationForm({ ...allocationForm, rackLocation: e.target.value })}
                    placeholder="e.g. Z1-R02-S03-B04"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Available Units Qty
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={allocationForm.availableQty}
                    onChange={e => setAllocationForm({ ...allocationForm, availableQty: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Unit of Measurement (UOM)
                  </label>
                  <input
                    type="text"
                    value={allocationForm.uom}
                    onChange={e => setAllocationForm({ ...allocationForm, uom: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Manufacturing Date
                  </label>
                  <input
                    type="date"
                    value={allocationForm.manufacturingDate}
                    onChange={e => setAllocationForm({ ...allocationForm, manufacturingDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={allocationForm.expiryDate}
                    onChange={e => setAllocationForm({ ...allocationForm, expiryDate: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Storage Protocol
                </label>
                <select
                  value={allocationForm.storageCondition}
                  onChange={e => setAllocationForm({ ...allocationForm, storageCondition: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
                >
                  <option value="Ambient (Below 25°C)">Ambient (Below 25°C)</option>
                  <option value="Cold Chain (2°C - 8°C)">Cold Chain (2°C - 8°C)</option>
                  <option value="Controlled Room Temperature (20°C - 25°C)">Controlled Room Temperature (20°C - 25°C)</option>
                  <option value="Cool Place (8°C - 15°C)">Cool Place (8°C - 15°C)</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddAllocationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateAllocation}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Allocate to Rack Bin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
