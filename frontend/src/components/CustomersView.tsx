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
  X,
  CheckCircle2,
} from 'lucide-react';

export default function CustomersView() {
  const [customers, setCustomers] = useState<CustomerItem[]>(SAMPLE_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    customerType: 'Retail Chemist',
    gstin: '33AAACP' + Math.floor(1000 + Math.random() * 9000) + 'F1Z1',
    stateCode: '33',
    stateName: 'Tamil Nadu',
    drugLicense20B: 'TN/CHE/20B/' + Math.floor(1000 + Math.random() * 9000),
    drugLicense21B: 'TN/CHE/21B/' + Math.floor(1000 + Math.random() * 9000),
    licenseValidUntil: '2028-12-31',
    creditLimit: 150000,
    address: '',
    phone: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRegisterCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.drugLicense20B.trim()) {
      showToast('⚠️  Please provide Pharmacy Name and Drug License 20B');
      return;
    }

    const newCust: CustomerItem = {
      customerId: 'cust-' + Date.now(),
      code: 'CUST-00' + (customers.length + 1),
      name: formData.name.trim(),
      customerType: formData.customerType,
      gstin: formData.gstin.trim().toUpperCase(),
      stateCode: formData.stateCode,
      stateName: formData.stateName,
      drugLicense20B: formData.drugLicense20B.trim().toUpperCase(),
      drugLicense21B: formData.drugLicense21B.trim().toUpperCase(),
      licenseValidUntil: formData.licenseValidUntil,
      isLicenseValid: true,
      creditLimit: Number(formData.creditLimit) || 100000,
      currentOutstanding: 0,
      overdueBillsCount: 0,
      address: formData.address.trim() || 'Chennai, Tamil Nadu',
    };

    setCustomers(prev => [newCust, ...prev]);
    setIsAddModalOpen(false);
    showToast(`✅ Pharmacy "${newCust.name}" registered successfully with Code ${newCust.code}!`);

    // Reset
    setFormData({
      name: '',
      customerType: 'Retail Chemist',
      gstin: '33AAACP' + Math.floor(1000 + Math.random() * 9000) + 'F1Z1',
      stateCode: '33',
      stateName: 'Tamil Nadu',
      drugLicense20B: 'TN/CHE/20B/' + Math.floor(1000 + Math.random() * 9000),
      drugLicense21B: 'TN/CHE/21B/' + Math.floor(1000 + Math.random() * 9000),
      licenseValidUntil: '2028-12-31',
      creditLimit: 150000,
      address: '',
      phone: '',
    });
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.gstin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.drugLicense20B.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Users className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            Customer Chemist &amp; Hospital Registry
          </h2>
          <p className="text-xs text-slate-600 dark:text-[#adb5d4] mt-0.5">
            CDSCO Drug License Form 20B/21B validation, credit limits, and Indian GST state compliance.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
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
            className="w-full bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 focus:border-blue-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-[#adb5d4] font-mono">
          <span>Showing <strong className="text-blue-700 dark:text-cyan-400">{filteredCustomers.length}</strong> of {customers.length} Accounts</span>
          <span>•</span>
          <span>Total Receivables: <strong className="text-amber-600 dark:text-amber-400 font-bold">₹{customers.reduce((s, c) => s + c.currentOutstanding, 0).toLocaleString('en-IN')}</strong></span>
        </div>
      </div>

      {/* 3. CUSTOMER GRID / CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCustomers.map(cust => {
          const usagePct = Math.min(100, Math.round((cust.currentOutstanding / cust.creditLimit) * 100));

          return (
            <div
              key={cust.customerId}
              className="glass-panel rounded-xl p-5 border border-slate-200 dark:border-white/6 hover:border-blue-400 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between gap-4 shadow-sm"
            >
              <div>
                {/* Top Row: Name, Code & DL Status Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{cust.name}</h3>
                      <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#111535] text-blue-700 dark:text-cyan-300 border border-slate-200 dark:border-white/11 font-medium">
                        {cust.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-[#adb5d4] mt-0.5">{cust.customerType}</div>
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
                  <div className="bg-slate-50 dark:bg-[#070a1e]/60 p-2.5 rounded-lg border border-slate-200 dark:border-white/8">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      Drug License 20B / 21B
                    </span>
                    <span className="font-mono text-slate-800 dark:text-[#d4d8f5] font-semibold">{cust.drugLicense20B}</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#070a1e]/60 p-2.5 rounded-lg border border-slate-200 dark:border-white/8">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      GSTIN &amp; State Code
                    </span>
                    <span className="font-mono text-blue-700 dark:text-cyan-400 font-semibold">
                      {cust.gstin} ({cust.stateCode})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-[#adb5d4] mt-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              {/* Bottom: Credit Utilization Progress Bar */}
              <div className="border-t border-slate-200 dark:border-white/6 pt-3">
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-slate-600 dark:text-[#adb5d4]">Credit Limit Utilization:</span>
                  <span className="font-bold text-slate-900 dark:text-white" suppressHydrationWarning>
                    ₹{cust.currentOutstanding.toLocaleString('en-IN')} / ₹{cust.creditLimit.toLocaleString('en-IN')} ({usagePct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-[#070a1e] rounded-full h-2 overflow-hidden border border-slate-200 dark:border-white/8">
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

      {/* 4. MODAL: REGISTER NEW PHARMACY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0d1130] border border-slate-200 dark:border-white/8 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-[#070a1e] border-b border-slate-200 dark:border-white/8 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
                  Register New Chemist / Hospital Pharmacy
                </h3>
                <p className="text-xs text-slate-500 dark:text-[#adb5d4]">
                  Drug License Form 20B/21B validation, Indian GST compliance, and credit term allocation.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-[#d4d8f5] p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterCustomer} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Pharmacy / Hospital / Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MedPlus Pharmacy Anna Nagar"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Customer Account Type
                  </label>
                  <select
                    value={formData.customerType}
                    onChange={e => setFormData({ ...formData, customerType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  >
                    <option value="Retail Chemist">Retail Chemist (Pharmacy)</option>
                    <option value="Hospital Pharmacy">Hospital / Clinical Inpatient</option>
                    <option value="Polyclinic / Nursing Home">Polyclinic / Nursing Home</option>
                    <option value="Sub-Distributor">Sub-Distributor / Semi-Wholesaler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    GSTIN Number (15 Digits)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 33AAACP9988F1Z1"
                    value={formData.gstin}
                    onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold uppercase focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Drug License Form 20B (Allopathic) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TN/CHE/20B/9012"
                    value={formData.drugLicense20B}
                    onChange={e => setFormData({ ...formData, drugLicense20B: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold uppercase focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Drug License Form 21B (Schedule C/C1)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TN/CHE/21B/9013"
                    value={formData.drugLicense21B}
                    onChange={e => setFormData({ ...formData, drugLicense21B: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold uppercase focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    License Validity Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.licenseValidUntil}
                    onChange={e => setFormData({ ...formData, licenseValidUntil: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Credit Limit Assigned (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-bold font-mono focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-[#c2c8e8] font-semibold mb-1">
                    Delivery Address &amp; Pin Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. No. 42, 2nd Avenue, Anna Nagar, Chennai - 600040"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#070a1e] border border-slate-300 dark:border-white/11 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/8">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/11 text-slate-700 dark:text-[#c2c8e8] hover:bg-slate-100 dark:hover:bg-[#161940] font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save &amp; Register Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

