'use client';

import React, { useState, useEffect } from 'react';
import {
  pharmaApi,
  ApiPayrollRunSummary,
  ApiSalarySlip
} from '@/services/apiClient';
import {
  IndianRupee,
  Calendar,
  CheckCircle2,
  Printer,
  Download,
  DollarSign,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
  FileText,
  CreditCard,
  Briefcase,
  X,
  Send,
  Clock
} from 'lucide-react';

export default function PayrollView() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiPayrollRunSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [activeSlip, setActiveSlip] = useState<ApiSalarySlip | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await pharmaApi.getPayrollSummary(selectedMonth);
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  const handleDisburse = async (slipId: string) => {
    try {
      const res = await pharmaApi.disburseSalary(slipId);
      showToast(`🎉 ${res.message || 'Salary disbursed successfully!'}`);
      loadData();
    } catch (e: any) {
      alert(e.message || 'Failed to disburse salary');
    }
  };

  const handlePrintSlip = () => {
    window.print();
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/30">
              HUMAN CAPITAL & STATUTORY
            </span>
            <span className="text-slate-500 text-xs">PF • ESI • Professional Tax • Form 16 / Salary Slips</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <IndianRupee className="w-7 h-7 text-teal-400" />
            Staff Payroll & Salary Slips
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monthly payroll cycle execution, statutory deductions, bank NEFT disbursement, and printable A4 salary slips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-teal-500"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-sm font-medium flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Staff Roster</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">{summary.totalEmployees}</div>
            <div className="text-xs text-teal-400 mt-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Active Employees
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Gross Payroll</div>
            <div className="text-2xl font-bold text-slate-100 mt-1">₹{summary.totalGrossSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-slate-500 mt-1">Total CTC Accrual</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Net Bank Payout</div>
            <div className="text-2xl font-bold text-emerald-400 mt-1">₹{summary.totalNetDisbursement.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> Direct Bank Transfer
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">PF Statutory Deposit</div>
            <div className="text-2xl font-bold text-blue-400 mt-1">₹{summary.totalPfContribution.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-blue-500/80 mt-1">Employee + Employer (24%)</div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">ESI Health Insurance</div>
            <div className="text-2xl font-bold text-purple-400 mt-1">₹{summary.totalEsiContribution.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-purple-500/80 mt-1">Total ESI Challan (4%)</div>
          </div>
        </div>
      )}

      {/* Salary Slips Table */}
      {summary && (
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden backdrop-blur-sm">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-300">
              Staff Salary Slips: {selectedMonth}
            </div>
            <div className="text-xs text-slate-500">
              Click &quot;View Payslip&quot; to print statutory salary certificate
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-center">Days Worked</th>
                  <th className="py-3 px-4">Gross Earnings</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {summary.slips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100">{slip.employeeName}</div>
                      <div className="text-xs text-slate-500 font-mono">PAN: {slip.panNumber} • UAN: {slip.uanNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300">
                      {slip.roleName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-slate-200 font-bold">{slip.daysWorked}</span>
                      <span className="text-slate-500 text-xs"> / {slip.totalWorkingDays}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      ₹{slip.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-rose-400 font-mono text-xs">
                      -₹{slip.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400 text-base">
                      ₹{slip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        slip.paymentStatus === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {slip.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {slip.paymentStatus}
                      </span>
                      {slip.paymentReference && (
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{slip.paymentReference}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {slip.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleDisburse(slip.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600/80 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1 shadow transition"
                          >
                            <Send className="w-3 h-3" /> Disburse
                          </button>
                        )}
                        <button
                          onClick={() => setActiveSlip(slip)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          View Payslip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Statutory A4 Salary Slip */}
      {activeSlip && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-slate-100 text-sm">
                  Salary Certificate • {activeSlip.employeeName} ({activeSlip.monthYear})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button onClick={() => setActiveSlip(null)} className="text-slate-400 hover:text-slate-200 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Slip Content */}
            <div className="p-6 overflow-y-auto space-y-4 bg-slate-900 text-slate-200 text-xs">
              {/* Company Header */}
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="text-lg font-bold text-white tracking-wide">PHARMAGRID LOGISTICS & HEALTHCARE PVT LTD</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Plot 42, SIDCO Pharmaceutical Complex, Guindy Industrial Estate, Chennai 600032</div>
                <div className="text-[11px] text-slate-400">CDSCO Wholesale Lic: Form 20B/21B-TN-CHN-2024-9982 | GSTIN: 33AAAAA0000A1Z5</div>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-800 text-teal-400 font-bold uppercase tracking-wider text-[11px]">
                  PAYSLIP FOR THE MONTH OF {activeSlip.monthYear.toUpperCase()}
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div><span className="text-slate-500">Employee Name: </span><span className="font-semibold text-white">{activeSlip.employeeName}</span></div>
                <div><span className="text-slate-500">Designation: </span><span className="font-semibold text-white">{activeSlip.roleName}</span></div>
                <div><span className="text-slate-500">PAN Number: </span><span className="font-mono text-slate-300">{activeSlip.panNumber}</span></div>
                <div><span className="text-slate-500">PF UAN: </span><span className="font-mono text-slate-300">{activeSlip.uanNumber}</span></div>
                <div><span className="text-slate-500">Total Working Days: </span><span className="font-semibold">{activeSlip.totalWorkingDays}</span></div>
                <div><span className="text-slate-500">Payable Days: </span><span className="font-semibold text-emerald-400">{activeSlip.daysWorked}</span></div>
                <div><span className="text-slate-500">Payment Status: </span><span className="font-semibold text-emerald-400">{activeSlip.paymentStatus}</span></div>
                <div><span className="text-slate-500">Bank Reference: </span><span className="font-mono text-slate-300">{activeSlip.paymentReference || 'N/A'}</span></div>
              </div>

              {/* Earnings & Deductions Dual Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-950 p-2 font-bold text-slate-300 border-b border-slate-800">
                    EARNINGS (₹)
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Basic Salary:</span><span className="font-mono">₹{activeSlip.basicSalary.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance (HRA):</span><span className="font-mono">₹{activeSlip.hra.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Conveyance Allowance:</span><span className="font-mono">₹{activeSlip.conveyanceAllowance.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Medical Allowance:</span><span className="font-mono">₹{activeSlip.medicalAllowance.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Special Allowance:</span><span className="font-mono">₹{activeSlip.specialAllowance.toFixed(2)}</span></div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                      <span>GROSS EARNINGS:</span>
                      <span className="text-teal-400">₹{activeSlip.grossEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <div className="bg-slate-950 p-2 font-bold text-slate-300 border-b border-slate-800">
                    DEDUCTIONS (₹)
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Provident Fund (PF 12%):</span><span className="font-mono">₹{activeSlip.pfEmployeeDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Employee State Ins (ESI):</span><span className="font-mono">₹{activeSlip.esiEmployeeDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Professional Tax (PT):</span><span className="font-mono">₹{activeSlip.professionalTax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>TDS / Income Tax:</span><span className="font-mono">₹{activeSlip.tdsDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Other Recovery:</span><span className="font-mono">₹0.00</span></div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-white">
                      <span>TOTAL DEDUCTIONS:</span>
                      <span className="text-rose-400">₹{activeSlip.totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">NET DISBURSED SALARY</div>
                  <div className="text-[11px] text-slate-400 italic mt-0.5">{activeSlip.netSalaryInWords}</div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">
                  ₹{activeSlip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-[11px] text-slate-400">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-700 pb-1 font-mono text-slate-500">System Generated</div>
                  <div className="mt-1">Employee Signature</div>
                </div>
                <div className="text-center">
                  <div className="w-44 border-b border-slate-700 pb-1 font-semibold text-slate-300">Selva Kumaran</div>
                  <div className="mt-1">Authorized Signatory (HR / Director)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
