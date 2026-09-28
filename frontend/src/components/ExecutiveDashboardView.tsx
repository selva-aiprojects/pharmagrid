'use client';

import React, { useState, useEffect } from 'react';
import { pharmaApi, ApiDashboardSummary } from '@/services/apiClient';
import {
  TrendingUp,
  Package,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
  Tag,
  CheckCircle2,
  Truck,
  Boxes,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function ExecutiveDashboardView() {
  const [selectedHorizon, setSelectedHorizon] = useState<'0-30' | '31-60' | '61-90' | 'all'>('all');
  const [summary, setSummary] = useState<ApiDashboardSummary | null>(null);
  const [expiryRadar, setExpiryRadar] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      pharmaApi.getDashboardSummary(),
      pharmaApi.getExpiryHorizons(),
    ]).then(([sum, exp]) => {
      if (sum) setSummary(sum);
      if (exp) setExpiryRadar(exp);
    }).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const crit0to30Val = expiryRadar?.horizons?.critical0To30Days?.assetValue ?? 85000;
  const crit0to30Units = expiryRadar?.horizons?.critical0To30Days?.totalUnits ?? 240;
  const warn31to60Val = expiryRadar?.horizons?.warning31To60Days?.assetValue ?? 195000;
  const warn31to60Units = expiryRadar?.horizons?.warning31To60Days?.totalUnits ?? 620;
  const prom61to90Val = expiryRadar?.horizons?.clearance61To90Days?.assetValue ?? 200000;
  const prom61to90Units = expiryRadar?.horizons?.clearance61To90Days?.totalUnits ?? 890;
  const totalNearExpiry = crit0to30Val + warn31to60Val + prom61to90Val;

  return (
    <div className="flex flex-col gap-6">
      {/* Live sync banner */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Live Depot Sync: <strong className="text-white">{summary?.branchName || 'Main Chennai Depot (TN-33)'}</strong>
          </span>
          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
            .NET 9 Web API
          </span>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-300 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* 1. TOP FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Today's Sales Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              ₹{(summary?.todaysSalesValue ?? 842500).toLocaleString('en-IN')}<span className="text-sm font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-400">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-600/40 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +{summary?.salesGrowthPct ?? 14.2}%
              </span>
              <span className="text-slate-400 font-normal">vs Yesterday (₹7,38,000)</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors" />
        </div>

        {/* Card 2: Inventory Asset Value */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Inventory Asset
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              ₹1.42 Cr
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span className="font-mono text-cyan-300 font-semibold">84,200</span> Units across 2 Warehouses
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10 transition-colors" />
        </div>

        {/* Card 3: Overdue Receivables */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Overdue Receivables
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              ₹12,40,000<span className="text-sm font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                17 Chemists Overdue
              </span>
              <span className="text-slate-400">Max: 48 Days</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors" />
        </div>

        {/* Card 4: Near Expiry Risk Horizon */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Expiry Horizon (90d)
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-rose-400 tracking-tight">
              ₹4,80,000<span className="text-sm font-normal text-slate-400">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <span>Critical Action Needed:</span>
              <span className="text-rose-400 font-bold font-mono">₹85,000 in &lt;30d</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-colors" />
        </div>
      </div>

      {/* 2. EXPIRY RADAR HORIZONS & OPERATIONS DOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4-Tier Expiry Management Matrix */}
        <div className="lg:col-span-2 glass-panel rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                4-Tier Expiry Management Radar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Statutory CDSCO shelf-life classification with automated FEFO locks and return workflows.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setSelectedHorizon('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedHorizon === 'all' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (₹4.8L)
              </button>
              <button
                onClick={() => setSelectedHorizon('0-30')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedHorizon === '0-30' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                0-30d
              </button>
              <button
                onClick={() => setSelectedHorizon('31-60')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedHorizon === '31-60' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                31-60d
              </button>
              <button
                onClick={() => setSelectedHorizon('61-90')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedHorizon === '61-90' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                61-90d
              </button>
            </div>
          </div>

          {/* Visual 4-Tier Horizon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Tier 1: 0-30 Days */}
            <div className="bg-rose-950/30 border border-rose-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    0–30 Days
                  </span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-2">₹85,000</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  <strong>Action:</strong> Automated Quarantine. Stock locked from sales billing.
                </p>
              </div>
              <button className="mt-3 w-full py-1.5 rounded bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold border border-rose-700 transition-colors">
                Quarantine Register
              </button>
            </div>

            {/* Tier 2: 31-60 Days */}
            <div className="bg-amber-950/30 border border-amber-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                    31–60 Days
                  </span>
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-2">₹1,95,000</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  <strong>Action:</strong> FEFO Stop. Return-to-Supplier Debit Proposal prepared.
                </p>
              </div>
              <button className="mt-3 w-full py-1.5 rounded bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-xs font-semibold border border-amber-700 transition-colors">
                Generate Debit Note
              </button>
            </div>

            {/* Tier 3: 61-90 Days */}
            <div className="bg-blue-950/30 border border-blue-600/40 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    61–90 Days
                  </span>
                  <Tag className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-xl font-bold font-mono text-white mt-2">₹2,00,000</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  <strong>Action:</strong> Fast-Track Clearance. B2B promo push at special discount.
                </p>
              </div>
              <button className="mt-3 w-full py-1.5 rounded bg-blue-900/60 hover:bg-blue-800 text-blue-200 text-xs font-semibold border border-blue-700 transition-colors">
                Apply Promo Deal
              </button>
            </div>
          </div>

          {/* Near-Expiry Item List Sample */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden mt-1">
            <div className="bg-slate-50 dark:bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 flex justify-between">
              <span>Batches Nearing Expiry Horizon</span>
              <span className="text-blue-700 dark:text-cyan-400 font-mono font-bold">3 Batches Flagged</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              <div className="p-2.5 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Dolo 650mg Tablet
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Batch: ML-D650-781</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Rack: <span className="font-mono text-slate-700 dark:text-slate-300">Z1-R04-S02-B08</span> | 60 Strips Left
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                    Exp: 2027-04-30
                  </span>
                  <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-0.5">Asset: ₹1,344</div>
                </div>
              </div>

              <div className="p-2.5 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-slate-800/60 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Cefixime 200mg DT
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">Batch: CFX-2024-91</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Rack: <span className="font-mono text-slate-700 dark:text-slate-300">Z2-R01-S03-B02</span> | 40 Boxes Left
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800">
                    Exp: 2026-10-25
                  </span>
                  <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 mt-0.5">Asset: ₹3,400</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Operations Center (Live Picking Queue & Low Stock) */}
        <div className="flex flex-col gap-4">
          {/* Live Warehouse Picking Queue */}
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-400" />
                Live Warehouse Dispatch Queue
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Order #10843
                    <span className="text-[10px] font-normal text-slate-400">Apollo Alandur</span>
                  </div>
                  <div className="text-[11px] text-cyan-400 mt-0.5">Active Picking | Zone B</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Picker: Suresh R.
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Order #10842
                    <span className="text-[10px] font-normal text-slate-400">MedPlus Guindy</span>
                  </div>
                  <div className="text-[11px] text-amber-400 mt-0.5">Verified Route Loaded | Dock 2</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  Van Route #4
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    Order #10841
                    <span className="text-[10px] font-normal text-slate-400">Kauvery Hospital</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Delivered (Digital POD Signed)</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Under-Stocked Reorder Triggers */}
          <div className="glass-panel rounded-xl p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                Under-Stocked Items (Reorder)
              </h3>
              <span className="text-xs font-mono text-amber-400">3 Alerts</span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-bold text-white">Paracetamol 650mg</div>
                  <div className="text-[11px] text-rose-400">12 Strips Left (Reorder: 50)</div>
                </div>
                <button className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[11px] font-semibold transition-colors">
                  Create PO
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-bold text-white">Amoxicillin 500mg</div>
                  <div className="text-[11px] text-rose-400">4 Boxes Left (Reorder: 20)</div>
                </div>
                <button className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[11px] font-semibold transition-colors">
                  Create PO
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-bold text-white">Insulin Glargine 100IU</div>
                  <div className="text-[11px] text-rose-400">2 Vials Left (Reorder: 15)</div>
                </div>
                <button className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[11px] font-semibold transition-colors">
                  Create PO
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
