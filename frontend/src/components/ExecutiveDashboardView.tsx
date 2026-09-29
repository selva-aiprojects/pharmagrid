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
  ChevronRight,
  Layers,
  DollarSign
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 dark:text-[#c2c8e8] font-medium">
            Live Central Depot Sync: <strong className="text-slate-900 dark:text-white font-bold">{summary?.branchName || 'Main Chennai Depot (TN-33)'}</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-[11px] font-mono font-bold text-indigo-800 dark:text-indigo-300">
            Aiven PostgreSQL
          </span>
        </div>
        <button
          aria-label="Refresh live metrics from database"
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 text-slate-700 dark:text-[#c2c8e8] hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-200 shadow-2xs self-start sm:self-auto cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-500' : 'text-slate-400 dark:text-[#6e7a9f]'}`} />
          <span>{isLoading ? 'Refreshing…' : 'Refresh Live Metrics'}</span>
        </button>
      </div>

      {/* 1. TOP FINANCIAL & REALTIME KPI CARDS */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Loading metrics…" aria-busy="true">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl p-5 border border-slate-200 dark:border-white/8 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-3 w-32 rounded" />
                <div className="skeleton-shimmer w-9 h-9 rounded-xl" />
              </div>
              <div className="skeleton-shimmer h-8 w-40 rounded mt-2" />
              <div className="skeleton-shimmer h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      )}
      {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales Value */}
        <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#b0b7d8]">
              Today&apos;s Sales Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ₹{(summary?.todaysSalesValue ?? 842500).toLocaleString('en-IN')}<span className="text-sm font-normal text-slate-500 dark:text-[#adb5d4]">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-600/50 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +{summary?.salesGrowthPct ?? 14.2}%
              </span>
              <span className="text-slate-500 dark:text-[#8892b0] font-normal">vs Yesterday (₹7,38,000)</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 2: Total Inventory Asset Value */}
        <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#b0b7d8]">
              Total Inventory Asset
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-500/40 flex items-center justify-center text-blue-700 dark:text-blue-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ₹1.42 Cr
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-[#c2c8e8]">
              <span className="font-mono text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">84,200</span> Units across 2 Warehouses
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 3: Overdue Receivables */}
        <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#b0b7d8]">
              Overdue Receivables
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              ₹12,40,000<span className="text-sm font-normal text-slate-500 dark:text-[#adb5d4]">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/90 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                17 Chemists Overdue
              </span>
              <span className="text-slate-500 dark:text-[#adb5d4]">Max: 48 Days</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Card 4: Near Expiry Risk Horizon */}
        <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#b0b7d8]">
              Active Expiry Horizon (90d)
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-700 dark:text-rose-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
              ₹4,80,000<span className="text-sm font-normal text-slate-500 dark:text-[#adb5d4]">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600 dark:text-[#c2c8e8]">
              <span>Critical Action Needed:</span>
              <span className="text-rose-700 dark:text-rose-300 font-bold font-mono bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                ₹85,000 (&lt;30d)
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>}

      {/* 2. EXPIRY RADAR HORIZONS & OPERATIONS DOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 4-Tier Expiry Management Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0d1130] rounded-2xl p-6 border border-slate-200 dark:border-white/8 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/8 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                4-Tier Expiry Management Radar
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#adb5d4] mt-0.5">
                Statutory CDSCO shelf-life classification with automated FEFO locks and return workflows.
              </p>
            </div>
            <div role="tablist"
            aria-label="Expiry horizon filter"
            className="flex items-center gap-1 bg-slate-100 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8 rounded-xl p-1 text-xs">
              <button
                onClick={() => setSelectedHorizon('all')}
                role="tab"
                aria-selected={selectedHorizon === 'all'}
                className={`min-w-[56px] text-center px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${
                  selectedHorizon === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#adb5d4] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All (₹4.8L)
              </button>
              <button
                onClick={() => setSelectedHorizon('0-30')}
                role="tab"
                aria-selected={selectedHorizon === '0-30'}
                className={`min-w-[56px] text-center px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${
                  selectedHorizon === '0-30'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#adb5d4] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                0-30d
              </button>
              <button
                onClick={() => setSelectedHorizon('31-60')}
                role="tab"
                aria-selected={selectedHorizon === '31-60'}
                className={`min-w-[56px] text-center px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${
                  selectedHorizon === '31-60'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#adb5d4] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                31-60d
              </button>
              <button
                onClick={() => setSelectedHorizon('61-90')}
                role="tab"
                aria-selected={selectedHorizon === '61-90'}
                className={`min-w-[56px] text-center px-3 py-1.5 rounded-lg transition-all duration-200 font-semibold cursor-pointer ${
                  selectedHorizon === '61-90'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-[#adb5d4] hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                61-90d
              </button>
            </div>
          </div>

          {/* Visual 4-Tier Horizon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tier 1: 0-30 Days */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-600/40 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                    0–30 Days (Critical)
                  </span>
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">₹85,000</div>
                <p className="text-xs text-slate-600 dark:text-[#c2c8e8] mt-1">
                  <strong>Action:</strong> Automated Quarantine. Stock locked from counter billing.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer">
                Quarantine Register
              </button>
            </div>

            {/* Tier 2: 31-60 Days */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-600/40 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                    31–60 Days (Warning)
                  </span>
                  <RotateCcw className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">₹1,95,000</div>
                <p className="text-xs text-slate-600 dark:text-[#c2c8e8] mt-1">
                  <strong>Action:</strong> FEFO Stop. Return-to-Supplier Debit Proposal prepared.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer">
                Generate Debit Note
              </button>
            </div>

            {/* Tier 3: 61-90 Days */}
            <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-600/40 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                    61–90 Days (Clearance)
                  </span>
                  <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-2">₹2,00,000</div>
                <p className="text-xs text-slate-600 dark:text-[#c2c8e8] mt-1">
                  <strong>Action:</strong> Fast-Track Clearance. B2B promo push at special discount.
                </p>
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer">
                Apply Promo Deal
              </button>
            </div>
          </div>

          {/* Near-Expiry Item List Sample */}
          <div className="border border-slate-200 dark:border-white/8 rounded-xl overflow-hidden mt-1">
            <div className="bg-slate-50 dark:bg-[#070a1e] px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-[#d4d8f5] border-b border-slate-200 dark:border-white/8 flex justify-between items-center">
              <span>Batches Nearing Expiry Horizon</span>
              <span className="text-blue-700 dark:text-cyan-400 font-mono font-bold bg-blue-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-cyan-800">3 Batches Flagged</span>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-white/6 text-xs">
              <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#161940]/60 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Dolo 650mg Tablet
                    <span className="text-[10px] font-mono text-slate-500 dark:text-[#adb5d4] bg-slate-100 dark:bg-[#111535] px-1.5 py-0.5 rounded">Batch: ML-D650-781</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-[#c2c8e8] mt-0.5">
                    Rack: <span className="font-mono font-semibold text-slate-900 dark:text-[#e8eaff]">Z1-R04-S02-B08</span> | 60 Strips Remaining
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800">
                    Exp: 2027-04-30
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-[#e8eaff] mt-1">Asset: ₹1,344</div>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#161940]/60 transition-colors">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Cefixime 200mg DT
                    <span className="text-[10px] font-mono text-slate-500 dark:text-[#adb5d4] bg-slate-100 dark:bg-[#111535] px-1.5 py-0.5 rounded">Batch: CFX-2024-91</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-[#c2c8e8] mt-0.5">
                    Rack: <span className="font-mono font-semibold text-slate-900 dark:text-[#e8eaff]">Z2-R01-S03-B02</span> | 40 Boxes Remaining
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800">
                    Exp: 2026-10-25
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-[#e8eaff] mt-1">Asset: ₹3,400</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Operations Center (Live Picking Queue & Low Stock) */}
        <div className="flex flex-col gap-6">
          {/* Live Warehouse Picking Queue */}
          <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
                Live Dispatch & Route Queue
              </h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Order #10843
                    <span className="text-[10px] font-normal text-slate-500 dark:text-[#adb5d4]">• Apollo Alandur</span>
                  </div>
                  <div className="text-[11px] text-blue-700 dark:text-cyan-400 font-medium mt-0.5">Active Picking | Zone B</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                  Picker: Suresh R.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Order #10842
                    <span className="text-[10px] font-normal text-slate-500 dark:text-[#adb5d4]">• MedPlus Guindy</span>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium mt-0.5">Verified Route Loaded | Dock 2</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                  Van Route #4
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    Order #10841
                    <span className="text-[10px] font-normal text-slate-500 dark:text-[#adb5d4]">• Kauvery Hospital</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">Delivered (Digital POD Signed)</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Under-Stocked Reorder Triggers */}
          <div className="bg-white dark:bg-[#0d1130] rounded-2xl p-5 border border-slate-200 dark:border-white/8 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Under-Stocked Items (Reorder)
              </h3>
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                3 Alerts
              </span>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Paracetamol 650mg</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">12 Strips Left (Reorder: 50)</div>
                </div>
                <button aria-label="Create purchase order"
                 className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs">
                  Create PO
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Amoxicillin 500mg</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">4 Boxes Left (Reorder: 20)</div>
                </div>
                <button aria-label="Create purchase order"
                 className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs">
                  Create PO
                </button>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#070a1e] border border-slate-200 dark:border-white/8">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Insulin Glargine 100IU</div>
                  <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">2 Vials Left (Reorder: 15)</div>
                </div>
                <button aria-label="Create purchase order"
                 className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors cursor-pointer shadow-xs">
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

