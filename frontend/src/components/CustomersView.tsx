'use client';

import React, { useState } from 'react';
import { SAMPLE_CUSTOMERS, CustomerItem } from '@/data/mockData';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CreditCard,
  MapPin,
  FileText,
  Phone,
  Building,
} from 'lucide-react';

export default function CustomersView() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = SAMPLE_CUSTOMERS.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.drugLicense20B.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {/* 1. HEADER */}
      <div className="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Customer Chemist &amp; Hospital Registry
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            CDSCO Drug License Form 20B/21B validation, credit limits, and Indian GST state compliance.
          </p>
        </div>

        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Register New Pharmacy
        </button>
      </div>

      {/* 2. SEARCH & SUMMARY BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Pharmacy Name, GSTIN, License No or Code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
          <span>Total Receivables Outstanding: <strong className="text-amber-600 dark:text-amber-400 font-bold">₹2,56,700</strong></span>
        </div>
      </div>

      {/* 3. CUSTOMER GRID / CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map(cust => {
          const usagePct = Math.min(100, Math.round((cust.currentOutstanding / cust.creditLimit) * 100));

          return (
            <div
              key={cust.customerId}
              className="glass-panel rounded-xl p-5 border border-slate-200 dark:border-slate-800/80 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 shadow-sm"
            >
              <div>
                {/* Top Row: Name, Code & DL Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{cust.name}</h3>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 font-medium">
                        {cust.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{cust.customerType}</div>
                  </div>

                  {cust.isLicenseValid ? (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-600/40">
                      <ShieldCheck className="w-3.5 h-3.5" /> DL Valid ({cust.licenseValidUntil})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-600/40 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5" /> License Expired ({cust.licenseValidUntil})
                    </span>
                  )}
                </div>

                {/* Middle Info: Drug License, GSTIN & Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      Drug License 20B / 21B
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{cust.drugLicense20B}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      GSTIN &amp; State Code
                    </span>
                    <span className="font-mono text-blue-700 dark:text-cyan-400 font-semibold">
                      {cust.gstin} ({cust.stateCode})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 mt-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              {/* Bottom: Credit Utilization Progress Bar */}
              <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3">
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-600 dark:text-slate-400">Credit Limit Utilization:</span>
                  <span className="font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                    ₹{cust.currentOutstanding.toLocaleString('en-IN')} / ₹{cust.creditLimit.toLocaleString('en-IN')} ({usagePct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      usagePct > 90 ? 'bg-rose-500' : usagePct > 70 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-cyan-500'
                    }`}
                    style={{ width: `${usagePct}%` }}
                  />
                </div>
                {cust.overdueBillsCount > 0 && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {cust.overdueBillsCount} Overdue Bills Pending Payment
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
