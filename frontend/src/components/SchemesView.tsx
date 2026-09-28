'use client';

import React from 'react';
import {
  Tag,
  Percent,
  Plus,
  Gift,
  Building,
  CheckCircle2,
  DollarSign,
  ArrowRight,
} from 'lucide-react';

export default function SchemesView() {
  return (
    <div className="flex flex-col gap-5">
      {/* 1. HEADER */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-400" />
            Pharmaceutical Scheme Engine &amp; Rebate Claims
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Volumetric free bonus deals, turnover discounts, and factory-sponsored manufacturer claim ledgers.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors">
          <Plus className="w-3.5 h-3.5" /> Configure New Scheme
        </button>
      </div>

      {/* 2. ACTIVE SCHEMES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scheme 1 */}
        <div className="glass-panel rounded-xl p-4 border border-cyan-500/30 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                Volumetric Bonus (10 + 1)
              </span>
              <Gift className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-bold text-white text-base mt-2">Buy 10 Get 1 Free</h3>
            <p className="text-xs text-slate-300 mt-0.5">Pan 40mg Injection (Alkem Labs)</p>
            <p className="text-[11px] text-slate-400 mt-2">
              For every 10 vials billed, the billing counter auto-allocates 1 bonus free vial without charging customer.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-2.5 flex justify-between text-xs text-slate-400 font-mono">
            <span>Valid Until: 31-Oct-2026</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Scheme 2 */}
        <div className="glass-panel rounded-xl p-4 border border-teal-500/30 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-700">
                Volumetric Bonus (20 + 2)
              </span>
              <Gift className="w-4 h-4 text-teal-400" />
            </div>
            <h3 className="font-bold text-white text-base mt-2">Buy 20 Get 2 Free</h3>
            <p className="text-xs text-slate-300 mt-0.5">Augmentin 625mg Tablet (GSK)</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Seasonal antibiotic monsoon promotion sponsored by GSK India. Free stock deducted from manufacturer quota.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-2.5 flex justify-between text-xs text-slate-400 font-mono">
            <span>Valid Until: 15-Nov-2026</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>

        {/* Scheme 3 */}
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                Turnover Cash Discount
              </span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-white text-base mt-2">5% Wholesale Bulk Off</h3>
            <p className="text-xs text-slate-300 mt-0.5">Dolo 650mg Tablet (Micro Labs)</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Automatically applies 5% discount to taxable base on orders exceeding 50 strips threshold.
            </p>
          </div>
          <div className="border-t border-slate-800 pt-2.5 flex justify-between text-xs text-slate-400 font-mono">
            <span>Valid Until: 31-Dec-2026</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
        </div>
      </div>

      {/* 3. MANUFACTURER REBATE ACCRUAL LEDGER */}
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-white text-sm">Manufacturer Scheme Claim Accruals (Pending Credit Note)</span>
          <span className="font-mono text-cyan-400">Total Accrued: ₹44,200</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 uppercase tracking-wider text-[10px] font-bold border-b border-slate-300 dark:border-slate-700">
              <tr>
                <th className="py-2.5 px-3">Manufacturer</th>
                <th className="py-2.5 px-3">Associated Scheme</th>
                <th className="py-2.5 px-3 text-center">Billed Units</th>
                <th className="py-2.5 px-3 text-center">Free Units Allocated</th>
                <th className="py-2.5 px-3 text-right">Reimbursement Rate</th>
                <th className="py-2.5 px-3 text-right font-bold text-slate-800 dark:text-slate-100">Accrued Claim Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium text-slate-800 dark:text-slate-200">
              <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">Alkem Laboratories</td>
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">Monsoon 10+1 Promo (Pan 40mg)</td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-800 dark:text-slate-200">1,200</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700 dark:text-cyan-400">120 Vials</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">₹42.50</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">₹5,100.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                    Accrued
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">GlaxoSmithKline India</td>
                <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">Seasonal 20+2 Bonus (Augmentin)</td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-800 dark:text-slate-200">2,800</td>
                <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-700 dark:text-cyan-400">280 Strips</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200">₹139.50</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">₹39,060.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                    Accrued
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
