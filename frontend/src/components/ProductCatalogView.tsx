'use client';

import React, { useState } from 'react';
import { SAMPLE_PRODUCTS, ProductItem } from '@/data/mockData';
import {
  Search,
  Plus,
  Filter,
  Package,
  Layers,
  Sparkles,
  Shield,
  Snowflake,
  AlertCircle,
  Tag,
  ArrowUpDown,
} from 'lucide-react';

export default function ProductCatalogView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');

  const filteredProducts = SAMPLE_PRODUCTS.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.includes(searchQuery) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSchedule =
      scheduleFilter === 'all' || p.scheduleClass === scheduleFilter;

    return matchesSearch && matchesSchedule;
  });

  return (
    <div className="flex flex-col gap-5">
      {/* 1. HEADER & ACTIONS */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Master Product Catalog &amp; SKU Directory
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            CDSCO Drugs &amp; Cosmetics classification, Indian GST HSN codes, and cold-chain attributes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Schedule Filter Tabs */}
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 flex text-xs">
            {['all', 'Regular', 'H', 'H1', 'G'].map(sch => (
              <button
                key={sch}
                onClick={() => setScheduleFilter(sch)}
                className={`px-3 py-1 rounded font-semibold transition-all ${
                  scheduleFilter === sch
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {sch === 'all' ? 'All Classes' : `Sch ${sch}`}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add New Medicine
          </button>
        </div>
      </div>

      {/* 2. SEARCH & STATS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Brand Name, Molecule / Generic, HSN Code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 focus:border-cyan-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span>Showing <strong className="text-cyan-700 dark:text-cyan-400">{filteredProducts.length}</strong> of {SAMPLE_PRODUCTS.length} SKUs</span>
          <span>•</span>
          <span>Active Batches: <strong className="text-emerald-700 dark:text-emerald-400">9 Available</strong></span>
        </div>
      </div>

      {/* 3. PRODUCTS DATA TABLE */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[11px] font-bold border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4">Medicine Brand &amp; Generic Molecule</th>
                <th className="py-3 px-3">Manufacturer</th>
                <th className="py-3 px-3">Pack &amp; Form</th>
                <th className="py-3 px-3 text-center">HSN / GST</th>
                <th className="py-3 px-3 text-right">PTR Rate</th>
                <th className="py-3 px-3 text-right">MRP</th>
                <th className="py-3 px-3 text-center">Regulatory Schedule</th>
                <th className="py-3 px-3 text-center">Batches Held</th>
                <th className="py-3 px-3 text-right">Total Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
              {filteredProducts.map(prod => {
                const totalUnits = prod.batches.reduce((sum, b) => sum + b.availableQty, 0);

                return (
                  <tr key={prod.productId} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                    {/* Brand & Molecule */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        {prod.name}
                        {prod.storageCondition.includes('Cold Chain') && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                            <Snowflake className="w-2.5 h-2.5" /> 2-8°C
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 font-normal mt-0.5">
                        {prod.genericName}
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3 px-3 text-slate-800 dark:text-slate-200">
                      {prod.manufacturer}
                    </td>

                    {/* Pack & Form */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-mono">
                      <div>{prod.dosageForm}</div>
                      <div className="text-[10px] text-slate-500">{prod.packSize}</div>
                    </td>

                    {/* HSN & GST */}
                    <td className="py-3 px-3 text-center font-mono">
                      <div className="text-slate-800 dark:text-slate-200">{prod.hsnCode}</div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                        {prod.gstPercentage}% GST
                      </span>
                    </td>

                    {/* PTR Rate */}
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                      ₹{prod.ptr.toFixed(2)}
                    </td>

                    {/* MRP */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400 font-medium">
                      ₹{prod.mrp.toFixed(2)}
                    </td>

                    {/* Schedule Class Badge */}
                    <td className="py-3 px-3 text-center">
                      {prod.scheduleClass === 'H1' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                          Schedule H1
                        </span>
                      ) : prod.scheduleClass === 'H' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                          Schedule H
                        </span>
                      ) : prod.scheduleClass === 'G' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                          Schedule G
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          Regular
                        </span>
                      )}
                    </td>

                    {/* Batches Held */}
                    <td className="py-3 px-3 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                        {prod.batches.length} {prod.batches.length === 1 ? 'Batch' : 'Batches'}
                      </span>
                    </td>

                    {/* Total Available Units */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      {totalUnits} {prod.uom}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
