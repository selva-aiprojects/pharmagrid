'use client';

import React, { useState } from 'react';
import {
  Tag,
  Percent,
  Plus,
  Gift,
  Building,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  X,
  Calendar,
} from 'lucide-react';

interface SchemeData {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  medicine: string;
  description: string;
  validUntil: string;
  isActive: boolean;
  type: 'volumetric' | 'discount';
}

const INITIAL_SCHEMES: SchemeData[] = [
  {
    id: 'sch-1',
    badge: 'Volumetric Bonus (10 + 1)',
    badgeColor: 'cyan',
    title: 'Buy 10 Get 1 Free',
    medicine: 'Pan 40mg Injection (Alkem Labs)',
    description: 'For every 10 vials billed, the billing counter auto-allocates 1 bonus free vial without charging customer.',
    validUntil: '31-Oct-2026',
    isActive: true,
    type: 'volumetric',
  },
  {
    id: 'sch-2',
    badge: 'Volumetric Bonus (20 + 2)',
    badgeColor: 'teal',
    title: 'Buy 20 Get 2 Free',
    medicine: 'Augmentin 625mg Tablet (GSK)',
    description: 'Seasonal antibiotic monsoon promotion sponsored by GSK India. Free stock deducted from manufacturer quota.',
    validUntil: '15-Nov-2026',
    isActive: true,
    type: 'volumetric',
  },
  {
    id: 'sch-3',
    badge: 'Turnover Cash Discount',
    badgeColor: 'emerald',
    title: '5% Wholesale Bulk Off',
    medicine: 'Dolo 650mg Tablet (Micro Labs)',
    description: 'Automatically applies 5% discount to taxable base on orders exceeding 50 strips threshold.',
    validUntil: '31-Dec-2026',
    isActive: true,
    type: 'discount',
  },
];

export default function SchemesView() {
  const [schemes, setSchemes] = useState<SchemeData[]>(INITIAL_SCHEMES);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    medicine: '',
    manufacturer: 'Sun Pharmaceutical Industries',
    schemeType: 'volumetric' as 'volumetric' | 'discount',
    buyQty: 10,
    freeQty: 1,
    discountPct: 5,
    validUntil: '2026-12-31',
    description: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.medicine.trim()) {
      showToast('⚠️ Please enter Scheme Name and Target Medicine');
      return;
    }

    const isVol = formData.schemeType === 'volumetric';
    const newScheme: SchemeData = {
      id: 'sch-' + Date.now(),
      badge: isVol ? `Volumetric Bonus (${formData.buyQty} + ${formData.freeQty})` : `Turnover Discount (${formData.discountPct}%)`,
      badgeColor: isVol ? 'cyan' : 'emerald',
      title: formData.title.trim(),
      medicine: `${formData.medicine.trim()} (${formData.manufacturer})`,
      description: formData.description.trim() || (isVol
        ? `Buy ${formData.buyQty} units and receive ${formData.freeQty} bonus units free at counter.`
        : `Get ${formData.discountPct}% wholesale turnover discount on invoice threshold.`),
      validUntil: formData.validUntil,
      isActive: true,
      type: formData.schemeType,
    };

    setSchemes(prev => [newScheme, ...prev]);
    setIsAddModalOpen(false);
    showToast(`✅ Scheme "${newScheme.title}" configured and activated!`);

    // Reset
    setFormData({
      title: '',
      medicine: '',
      manufacturer: 'Sun Pharmaceutical Industries',
      schemeType: 'volumetric',
      buyQty: 10,
      freeQty: 1,
      discountPct: 5,
      validUntil: '2026-12-31',
      description: '',
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-60 bg-emerald-950 border border-emerald-500/50 text-emerald-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            Pharmaceutical Scheme Engine &amp; Rebate Claims
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Volumetric free bonus deals, turnover discounts, and factory-sponsored manufacturer claim ledgers.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Configure New Scheme
        </button>
      </div>

      {/* 2. ACTIVE SCHEMES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schemes.map(sch => (
          <div
            key={sch.id}
            className={`glass-panel rounded-xl p-4 border flex flex-col justify-between gap-3 shadow-xs ${
              sch.badgeColor === 'teal'
                ? 'border-teal-200 dark:border-teal-500/30'
                : sch.badgeColor === 'emerald'
                ? 'border-emerald-200 dark:border-emerald-500/30'
                : 'border-cyan-200 dark:border-cyan-500/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  sch.badgeColor === 'teal'
                    ? 'bg-teal-100 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-700'
                    : sch.badgeColor === 'emerald'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700'
                    : 'bg-cyan-100 text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-700'
                }`}>
                  {sch.badge}
                </span>
                {sch.type === 'volumetric' ? (
                  <Gift className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                ) : (
                  <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mt-2">{sch.title}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-medium">{sch.medicine}</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2">
                {sch.description}
              </p>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between text-xs text-slate-600 dark:text-slate-400 font-mono">
              <span>Valid Until: {sch.validUntil}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. MANUFACTURER REBATE ACCRUAL LEDGER */}
      <div className="glass-panel rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-sm">Manufacturer Scheme Claim Accruals (Pending Credit Note)</span>
          <span className="font-mono text-cyan-700 dark:text-cyan-400 font-semibold">Total Accrued: ₹44,200</span>
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

      {/* 4. MODAL: CONFIGURE NEW SCHEME */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  Configure Trade Promotion &amp; Bonus Scheme
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Volumetric free bonus item rules and manufacturer sponsored turnover discount ledgers.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Scheme Campaign Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monsoon Buy 10 Get 1 Free Promo"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Scheme Type
                  </label>
                  <select
                    value={formData.schemeType}
                    onChange={e => setFormData({ ...formData, schemeType: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  >
                    <option value="volumetric">Volumetric Bonus (e.g. 10 + 1)</option>
                    <option value="discount">Turnover Percentage (%) Off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Sponsoring Manufacturer
                  </label>
                  <select
                    value={formData.manufacturer}
                    onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  >
                    <option value="Sun Pharmaceutical Industries">Sun Pharma</option>
                    <option value="GlaxoSmithKline India">GSK India</option>
                    <option value="Alkem Laboratories">Alkem Labs</option>
                    <option value="Cipla Ltd">Cipla Ltd</option>
                    <option value="Micro Labs">Micro Labs</option>
                    <option value="Dr. Reddy's Laboratories">Dr. Reddy's</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Target Medicine / Product Brand *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pan 40mg Injection or Augmentin 625mg"
                  value={formData.medicine}
                  onChange={e => setFormData({ ...formData, medicine: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                />
              </div>

              {formData.schemeType === 'volumetric' ? (
                <div className="p-3 bg-cyan-50/50 dark:bg-slate-950/60 rounded-xl border border-cyan-200 dark:border-slate-800 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Buy Quantity (Paid) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.buyQty}
                      onChange={e => setFormData({ ...formData, buyQty: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-bold font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                      Bonus Quantity (Free Units) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.freeQty}
                      onChange={e => setFormData({ ...formData, freeQty: Number(e.target.value) })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-cyan-700 dark:text-cyan-400 font-bold font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50/50 dark:bg-slate-950/60 rounded-xl border border-emerald-200 dark:border-slate-800">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Invoice Discount Percentage (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="50"
                    step="0.5"
                    value={formData.discountPct}
                    onChange={e => setFormData({ ...formData, discountPct: Number(e.target.value) })}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-emerald-700 dark:text-emerald-400 font-bold font-mono focus:border-emerald-500 outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Validity Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Scheme Terms / Rule Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Applicable on cash & credit"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save &amp; Activate Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
