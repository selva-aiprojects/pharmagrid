'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiDemandForecastItem,
  ApiDemandForecastSummary
} from '@/services/apiClient';
import {
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShoppingCart,
  Calendar,
  Layers,
  ArrowRight,
  Zap,
  Building,
  Clock,
  Sparkles,
  BarChart3
} from 'lucide-react';

export default function DemandForecastView() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiDemandForecastSummary | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const sumRes = await pharmaApi.getDemandForecastSummary();
      setSummary(sumRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePo = async (item: ApiDemandForecastItem) => {
    setGeneratingId(item.productId);
    try {
      const res = await pharmaApi.generatePoForForecastProduct(item.productId);
      showToast(`ðŸŽ‰ ${res.message || `Automated PO generated for ${item.brandName}`}`);
    } catch (e: any) {
      alert(e.message || 'Failed to generate PO');
    } finally {
      setGeneratingId(null);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0d1130]/90 p-6 rounded-2xl border border-slate-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
              PREDICTIVE AI RADAR
            </span>
            <span className="text-slate-500 dark:text-[#adb5d4] text-xs">30-Day Sales Run Rate • Days of Inventory (DOI)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-[#e8eaff] flex items-center gap-3">
            <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Demand Forecasting & Stockout Radar
          </h1>
          <p className="text-sm text-slate-600 dark:text-[#adb5d4] mt-1">
            Real-time sales velocity monitoring, automated run-out predictions, and 1-click manufacturer PO indents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111535]/80 dark:hover:bg-[#1a1f4a] text-slate-700 dark:text-[#c2c8e8] border border-slate-300 dark:border-white/11 text-sm font-medium flex items-center gap-2 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
            Recalculate Radar
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-[#0d1130]/90 p-4 rounded-xl border border-rose-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
            <div className="text-slate-600 dark:text-[#adb5d4] text-xs font-medium uppercase tracking-wider">Critical Stockouts</div>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-rose-600 dark:text-rose-500 animate-pulse" />
              {summary.criticalStockoutsCount}
            </div>
            <div className="text-xs text-rose-600 dark:text-rose-500/80 mt-1 font-mono">&lt; 3 Days DOI Remaining</div>
          </div>

          <div className="bg-white dark:bg-[#0d1130]/90 p-4 rounded-xl border border-amber-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
            <div className="text-slate-600 dark:text-[#adb5d4] text-xs font-medium uppercase tracking-wider">Low Stock Warnings</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              {summary.lowStockWarningsCount}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-500/80 mt-1 font-mono">3 to 10 Days Buffer</div>
          </div>

          <div className="bg-white dark:bg-[#0d1130]/90 p-4 rounded-xl border border-emerald-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
            <div className="text-slate-600 dark:text-[#adb5d4] text-xs font-medium uppercase tracking-wider">Healthy Inventory</div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{summary.healthyStockCount}</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500/80 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Adequate Buffer (&gt; 15 Days)
            </div>
          </div>

          <div className="bg-white dark:bg-[#0d1130]/90 p-4 rounded-xl border border-cyan-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
            <div className="text-slate-600 dark:text-[#adb5d4] text-xs font-medium uppercase tracking-wider">Avg Days of Inventory</div>
            <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{summary.averageInventoryDays} Days</div>
            <div className="text-xs text-slate-500 dark:text-[#adb5d4] mt-1">Depot Run Rate</div>
          </div>

          <div className="bg-white dark:bg-[#0d1130]/90 p-4 rounded-xl border border-purple-200 dark:border-white/8 shadow-sm backdrop-blur-sm">
            <div className="text-slate-600 dark:text-[#adb5d4] text-xs font-medium uppercase tracking-wider">Recommended Reorders</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">₹{summary.totalRecommendedPoValue.toLocaleString('en-IN')}</div>
            <div className="text-xs text-purple-600 dark:text-purple-500/80 mt-1">Auto-Calculated Indents</div>
          </div>
        </div>
      )}

      {/* Forecast Radar Table */}
      {summary && (
        <div className="bg-white dark:bg-[#0d1130]/90 rounded-2xl border border-slate-200 dark:border-white/8 overflow-hidden shadow-sm backdrop-blur-sm">
          <div className="p-4 border-b border-slate-200 dark:border-white/8 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
            <div className="text-sm font-semibold text-slate-800 dark:text-[#d4d8f5] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Algorithmic SKU Run-Out Horizon & Reorder Triggers
            </div>
            <div className="text-xs text-slate-500 dark:text-[#adb5d4]">
              Sorted by Days of Inventory Remaining (Most urgent first)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-[#c2c8e8]">
              <thead className="bg-slate-50 dark:bg-[#070a1e]/60 text-xs font-semibold text-slate-600 dark:text-[#adb5d4] uppercase tracking-wider border-b border-slate-200 dark:border-white/8">
                <tr>
                  <th className="py-3 px-4">SKU Product</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4 text-center">Available Units</th>
                  <th className="py-3 px-4 text-center">Daily Run Rate</th>
                  <th className="py-3 px-4 text-center">Days Remaining (DOI)</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4">Reorder Recommendation</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {summary.items.map(item => {
                  const isCritical = item.stockoutRisk === 'Critical_Stockout';
                  const isWarning = item.stockoutRisk === 'Low_Stock_Warning';

                  return (
                    <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-[#161940]/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-[#e8eaff] flex items-center gap-2">
                          {item.brandName}
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111535] text-slate-600 dark:text-[#adb5d4] border border-slate-300 dark:border-white/11">
                            {item.productCode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-[#adb5d4]">
                        {item.manufacturer}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-900 dark:text-[#d4d8f5]">
                        {item.currentAvailableStock}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 dark:text-[#adb5d4]">
                        {item.dailySalesRunRate} units/day
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                          <span className={`text-base ${
                            isCritical ? 'text-rose-600 dark:text-rose-400' : isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {item.daysOfInventoryRemaining}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">days</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isCritical
                            ? 'bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 animate-pulse'
                            : isWarning
                            ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isCritical && <AlertOctagon className="w-3 h-3" />}
                          {isWarning && <AlertTriangle className="w-3 h-3" />}
                          {item.stockoutRisk.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-900 dark:text-[#d4d8f5]">
                          Order <span className="text-cyan-600 dark:text-cyan-400 font-bold">{item.recommendedReorderQuantity}</span> units
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#adb5d4]">
                          Est. ₹{item.estimatedPoValue.toLocaleString('en-IN')} • Lead: {item.leadTimeDays}d
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isCritical || isWarning ? (
                          <button
                            onClick={() => handleGeneratePo(item)}
                            disabled={generatingId === item.productId}
                            className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow transition ${
                              isCritical
                                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/20'
                                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20'
                            }`}
                          >
                            <ShoppingCart className={`w-3.5 h-3.5 ${generatingId === item.productId ? 'animate-spin' : ''}`} />
                            1-Click Auto PO
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-[#8892b0] font-mono">Stock Sufficient</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

