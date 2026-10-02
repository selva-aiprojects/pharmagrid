'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  FileSpreadsheet,
  AlertOctagon,
  ThermometerSnowflake,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Building2,
  Phone,
  FileCheck,
  Calendar,
  Lock,
  Radio,
  FileText
} from 'lucide-react';
import {
  pharmaApi,
  ApiScheduleH1Entry,
  ApiScheduleXLedger,
  ApiBatchRecallTrace,
  ApiColdChainLog
} from '@/services/apiClient';

export default function CdscoRegistersView() {
  const [activeTab, setActiveTab] = useState<'h1' | 'schx' | 'recall' | 'coldchain'>('h1');
  const [loading, setLoading] = useState(false);

  // Data states
  const [h1Entries, setH1Entries] = useState<ApiScheduleH1Entry[]>([]);
  const [h1Query, setH1Query] = useState('');
  const [schXEntries, setSchXEntries] = useState<ApiScheduleXLedger[]>([]);
  const [recallBatch, setRecallBatch] = useState('AUG-AUG625-102');
  const [recallTrace, setRecallTrace] = useState<ApiBatchRecallTrace | null>(null);
  const [recallNoticeIssued, setRecallNoticeIssued] = useState(false);
  const [coldChainLogs, setColdChainLogs] = useState<ApiColdChainLog[]>([]);
  const [newTemp, setNewTemp] = useState('4.4');
  const [newTimeSlot, setNewTimeSlot] = useState('08:00 AM (Morning)');
  const [newStorage, setNewStorage] = useState('Deep Cold Room Unit-A (2-8°C)');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'h1') {
        const data = await pharmaApi.getCdscoScheduleH1(h1Query);
        setH1Entries(data);
      } else if (activeTab === 'schx') {
        const data = await pharmaApi.getCdscoScheduleX();
        setSchXEntries(data);
      } else if (activeTab === 'recall') {
        const data = await pharmaApi.getBatchTraceability(recallBatch);
        setRecallTrace(data);
      } else if (activeTab === 'coldchain') {
        const data = await pharmaApi.getColdChainLogs();
        setColdChainLogs(data);
      }
    } catch (e) {
      console.warn('Error loading CDSCO register data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchH1 = async () => {
    setLoading(true);
    const data = await pharmaApi.getCdscoScheduleH1(h1Query);
    setH1Entries(data);
    setLoading(false);
  };

  const handleTraceBatch = async () => {
    if (!recallBatch.trim()) return;
    setLoading(true);
    const data = await pharmaApi.getBatchTraceability(recallBatch.trim());
    setRecallTrace(data);
    setRecallNoticeIssued(false);
    setLoading(false);
  };

  const handleIssueRecall = async () => {
    if (!recallTrace) return;
    setLoading(true);
    try {
      await pharmaApi.issueRecallNotice({
        batchNumber: recallTrace.batchNumber,
        reasonForRecall: 'CDSCO Central Drug Lab Advisory: Discoloration and assay potency variance reported.',
        authorityOrderReference: 'CDSCO/SZ/RECALL/2026/8941',
        urgencyLevel: 'Class II (High Urgency)'
      });
      setRecallNoticeIssued(true);
      setActionSuccess(`Statutory Recall Notice issued for Batch ${recallTrace.batchNumber}. Automated alerts dispatched to ${recallTrace.impactedPharmacies.length} pharmacies.`);
      setTimeout(() => setActionSuccess(null), 6000);
    } catch (e: any) {
      alert(e.message || 'Recall notice failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddColdChainLog = async () => {
    const tempVal = parseFloat(newTemp);
    if (isNaN(tempVal)) return;
    try {
      await pharmaApi.recordColdChainLog({
        storageUnitName: newStorage,
        timeSlot: newTimeSlot,
        temperatureCelsius: tempVal
      });
      setActionSuccess(`Temperature ${tempVal}°C logged successfully under registered pharmacist supervision.`);
      setTimeout(() => setActionSuccess(null), 5000);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to log temperature');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900 dark:text-slate-100">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                Statutory CDSCO Compliance Registers & Traceability
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Drugs & Cosmetics Act 1940 & Rules 1945 • 21 CFR Part 11 Electronic Inspection Ledgers
              </p>
            </div>
          </div>
        </div>

        {/* STATUTORY REGISTRATION BADGE */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>Form 20B/21B Active (TN-CHE-20B-98102)</span>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" /> Print Statutory Register
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* 2. TAB NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('h1')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'h1'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Schedule H1 Register</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-500 font-bold">Rule 65(9)</span>
        </button>

        <button
          onClick={() => setActiveTab('schx')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'schx'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Schedule X Narcotics Ledger</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-500 font-bold">Strict</span>
        </button>

        <button
          onClick={() => setActiveTab('recall')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'recall'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>24h Batch Recall & Traceability</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/15 text-cyan-500 font-bold">Rapid Alert</span>
        </button>

        <button
          onClick={() => setActiveTab('coldchain')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition border-b-2 cursor-pointer ${
            activeTab === 'coldchain'
              ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-500/5'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ThermometerSnowflake className="w-4 h-4" />
          <span>Cold-Chain Temp Log (2-8°C)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-teal-500/15 text-teal-500 font-bold">Daily AM/PM</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: SCHEDULE H1 STATUTORY REGISTER */}
      {activeTab === 'h1' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111a2e] p-3 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by drug molecule, invoice #, chemist, or doctor..."
                value={h1Query}
                onChange={(e) => setH1Query(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchH1()}
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSearchH1}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition"
              >
                Filter Register
              </button>
              <button
                onClick={() => { setH1Query(''); loadData(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d1322]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#111a2e] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="p-3">Supply Date</th>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Chemist & DL 20B/21B</th>
                  <th className="p-3">Prescribing Doctor (Reg #)</th>
                  <th className="p-3">Medicine & Molecule</th>
                  <th className="p-3">Batch & Expiry</th>
                  <th className="p-3 text-right">Quantity Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {h1Entries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.supplyDate}</td>
                    <td className="p-3 font-mono font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap">{row.invoiceNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">DL: {row.drugLicenseNumber} ({row.customerCity})</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.doctorName}</div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">MCI: {row.doctorRegistrationNumber}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-900 dark:text-white">{row.productName}</div>
                      <div className="text-[11px] text-slate-500">{row.genericName} • {row.packagingUnit}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-mono font-bold text-slate-800 dark:text-slate-200">{row.batchNumber}</div>
                      <div className="text-[11px] text-slate-500">Exp: {row.expiryDate}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {row.quantitySold} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-600 dark:text-slate-400 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong>CDSCO Statutory Compliance Mandate:</strong> Under Rule 65(9) of the Drugs & Cosmetics Rules 1945, wholesale licensees must maintain a dedicated Schedule H1 Register for a minimum of <strong>3 continuous years</strong>. Inspection records must be made available on demand to State Licensing Authorities.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULE X NARCOTICS LEDGER */}
      {activeTab === 'schx' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Lock className="w-5 h-5 shrink-0" />
              <div>
                <strong className="text-sm">CDSCO Schedule X Controlled Substances Vault</strong>
                <p className="text-[11px] opacity-80">Strict two-man authorization enforced. Sales permitted only to hospitals & pharmacies holding Form 20F/21F.</p>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded bg-rose-500 text-white font-semibold text-[11px]">
              Dual Sign-Off Active
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d1322]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#111a2e] text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Narcotic Molecule & Batch</th>
                  <th className="p-3 text-right">Opening Bal</th>
                  <th className="p-3 text-right">Inward Receipts</th>
                  <th className="p-3 text-right">Outward Issues</th>
                  <th className="p-3">Dispensed To (Form 20F/21F)</th>
                  <th className="p-3 text-right">Closing Bal</th>
                  <th className="p-3">Verified Pharmacist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {schXEntries.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition">
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.date}</td>
                    <td className="p-3">
                      <div className="font-semibold text-rose-600 dark:text-rose-400">{row.productName}</div>
                      <div className="text-[11px] font-mono text-slate-500">Batch: {row.batchNumber}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-600 dark:text-slate-300">{row.openingBalance}</td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {row.inwardReceiptQuantity > 0 ? `+${row.inwardReceiptQuantity}` : '—'}
                      {row.inwardSupplierBillNo !== '-' && <div className="text-[10px] text-slate-400">{row.inwardSupplierBillNo}</div>}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      -{row.outwardSoldQuantity}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.outwardChemistName}</div>
                      <div className="text-[11px] font-mono text-slate-400">Lic: {row.chemistLicenseForm20F21F}</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-white/[0.02]">
                      {row.closingBalance}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{row.registeredPharmacistName}</div>
                      <div className="text-[10px] font-mono text-teal-600 dark:text-teal-400">{row.pharmacistRegNo}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: 24-HOUR BATCH RECALL & TRACEABILITY */}
      {activeTab === 'recall' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111a2e] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                  <Radio className="w-4 h-4 animate-pulse" /> 24-Hour Batch Recall Rapid Investigation
                </h3>
                <p className="text-xs text-slate-500">Query complete downstream distribution tree for any pharmaceutical batch code.</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter Batch Number (e.g. AUG-AUG625-102)"
                  value={recallBatch}
                  onChange={(e) => setRecallBatch(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0d1322] text-xs font-mono font-semibold"
                />
                <button
                  onClick={handleTraceBatch}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition"
                >
                  Trace Batch
                </button>
              </div>
            </div>

            {recallTrace && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200 dark:border-white/5 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block text-[10px]">SKU & MOLECULE</span>
                  <strong className="text-sm text-slate-900 dark:text-white block">{recallTrace.productName}</strong>
                  <span className="text-slate-500 text-[11px]">{recallTrace.genericName}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block text-[10px]">MANUFACTURER & DATES</span>
                  <strong className="text-slate-800 dark:text-slate-200 block">{recallTrace.manufacturerName}</strong>
                  <span className="text-slate-500 text-[11px]">MFG: {recallTrace.manufacturingDate} • EXP: {recallTrace.expiryDate}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0d1322] border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400 block text-[10px]">DISTRIBUTION BALANCE</span>
                  <strong className="text-slate-900 dark:text-white block text-sm font-mono">
                    {recallTrace.totalUnitsSupplied} Units Sold / {recallTrace.currentWarehouseStock} in Warehouse
                  </strong>
                  <span className="text-teal-600 dark:text-teal-400 font-mono text-[11px]">Rack: {recallTrace.warehouseRackLocation}</span>
                </div>
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex flex-col justify-between">
                  <div>
                    <span className="text-rose-500 font-bold text-[10px] block uppercase">SEVERITY CLASSIFICATION</span>
                    <strong className="text-rose-600 dark:text-rose-400 text-xs block">{recallTrace.severityLevel}</strong>
                  </div>
                  {!recallNoticeIssued ? (
                    <button
                      onClick={handleIssueRecall}
                      disabled={loading}
                      className="mt-2 w-full py-1.5 rounded bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition shadow-sm cursor-pointer"
                    >
                      🚨 Issue Statutory Recall Notice
                    </button>
                  ) : (
                    <span className="text-emerald-500 font-bold text-xs mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Notice Dispatched to All Retailers
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* IMPACTED RETAIL CHEMISTS LIST */}
          {recallTrace && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d1322]">
              <div className="p-3 bg-slate-50 dark:bg-[#111a2e] border-b border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Impacted Pharmacies & Hospitals Requiring Statutory Recall Intimation ({recallTrace.impactedPharmacies.length})
                </span>
                <span className="text-slate-500 text-[11px]">Sub-24h CDSCO Rapid Notification SLA</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 dark:bg-[#111a2e]/50 text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-white/5">
                  <tr>
                    <th className="p-3">Chemist / Hospital</th>
                    <th className="p-3">Contact Mobile</th>
                    <th className="p-3">Drug License 20B</th>
                    <th className="p-3">Invoice # & Date</th>
                    <th className="p-3 text-right">Units Supplied</th>
                    <th className="p-3 text-center">Recall Notice Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {recallTrace.impactedPharmacies.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-cyan-500" />
                        {c.customerName}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{c.contactPhone}</td>
                      <td className="p-3 font-mono text-slate-500">{c.drugLicense20B}</td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300">
                        {c.invoiceNumber} <span className="text-slate-400 text-[11px]">({c.invoiceDate})</span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{c.quantitySupplied} boxes</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          recallNoticeIssued
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {recallNoticeIssued ? 'Dispatched' : 'Pending Action'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COLD-CHAIN TEMPERATURE LOG (2-8°C) */}
      {activeTab === 'coldchain' && (
        <div className="space-y-4">
          {/* QUICK LOG FORM */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-white/5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <ThermometerSnowflake className="w-4 h-4" /> Record Calibrated Digital Temperature Reading (2°C to 8°C)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cold Storage Unit</label>
                <select
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0d1322] text-xs"
                >
                  <option>Deep Cold Room Unit-A (2-8°C)</option>
                  <option>Transit Chiller Unit-B (2-8°C)</option>
                  <option>Vaccine Deep Freeze Vault (-20°C)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Time Slot</label>
                <select
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0d1322] text-xs"
                >
                  <option>08:00 AM (Morning)</option>
                  <option>08:00 PM (Evening)</option>
                  <option>02:00 PM (Afternoon Audit)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-[#0d1322] text-xs font-mono font-bold"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleAddColdChainLog}
                  className="w-full py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 transition"
                >
                  Record Inspection Log
                </button>
              </div>
            </div>
          </div>

          {/* LOGS TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0d1322]">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#111a2e] text-slate-500 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-200 dark:border-white/5">
                <tr>
                  <th className="p-3">Inspection Date</th>
                  <th className="p-3">Time Slot</th>
                  <th className="p-3">Storage Unit</th>
                  <th className="p-3 text-right">Recorded Temp</th>
                  <th className="p-3 text-center">Safety Threshold (2-8°C)</th>
                  <th className="p-3">Logger Serial #</th>
                  <th className="p-3">Signing Pharmacist</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {coldChainLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{log.logDate}</td>
                    <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{log.timeSlot}</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">{log.storageUnitName}</td>
                    <td className="p-3 text-right font-mono font-bold text-teal-600 dark:text-teal-400 text-sm">
                      {log.recordedTemperatureCelsius}°C
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        log.isWithinSafeThreshold
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {log.isWithinSafeThreshold ? '✅ Optimal (2-8°C)' : '⚠️ Excursion Alert'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{log.calibratedLoggerSerialNumber}</td>
                    <td className="p-3 text-slate-800 dark:text-slate-200">{log.inspectorPharmacistName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
