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
} from 'lucide-react';

export default function WarehouseInventoryView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [liveBatches, setLiveBatches] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);

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
    </div>
  );
}
