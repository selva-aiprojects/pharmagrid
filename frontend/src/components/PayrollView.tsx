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
  Clock,
  Plus
} from 'lucide-react';

export default function PayrollView() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ApiPayrollRunSummary | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('September 2026');
  const [activeSlip, setActiveSlip] = useState<ApiSalarySlip | null>(null);
  const [isAddSalaryModalOpen, setIsAddSalaryModalOpen] = useState(false);

  // Form State
  const [salaryForm, setSalaryForm] = useState({
    employeeName: '',
    roleName: 'Warehouse Executive',
    panNumber: 'ABCDE' + Math.floor(1000 + Math.random() * 9000) + 'F',
    uanNumber: '1009' + Math.floor(10000000 + Math.random() * 90000000),
    basicSalary: 28000,
    hra: 11200,
    specialAllowance: 5800,
    pfDeduction: 3360,
    ptTax: 200,
    tdsDeduction: 1200,
  });

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateSalarySlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryForm.employeeName.trim()) {
      showToast('⚠️ Employee Name is required');
      return;
    }

    const basic = Number(salaryForm.basicSalary) || 25000;
    const hra = Number(salaryForm.hra) || 10000;
    const special = Number(salaryForm.specialAllowance) || 5000;
    const gross = basic + hra + special;

    const pf = Number(salaryForm.pfDeduction) || 3000;
    const pt = Number(salaryForm.ptTax) || 200;
    const tds = Number(salaryForm.tdsDeduction) || 1000;
    const deductions = pf + pt + tds;
    const net = gross - deductions;

    const newSlip: ApiSalarySlip = {
      id: 'slip-' + Date.now(),
      employeeId: 'emp-' + Date.now(),
      employeeName: salaryForm.employeeName.trim(),
      roleName: salaryForm.roleName,
      panNumber: salaryForm.panNumber,
      uanNumber: salaryForm.uanNumber,
      monthYear: selectedMonth,
      totalWorkingDays: 30,
      daysWorked: 30,
      lopDays: 0,
      basicSalary: basic,
      hra: hra,
      conveyanceAllowance: 1600,
      medicalAllowance: 1250,
      specialAllowance: special,
      grossEarnings: gross,
      pfEmployeeDeduction: pf,
      esiEmployeeDeduction: 0,
      professionalTax: pt,
      tdsDeduction: tds,
      totalDeductions: deductions,
      netSalary: net,
      netSalaryInWords: `Rupees ${net.toLocaleString('en-IN')} Only`,
      paymentStatus: 'Approved',
      processedDate: new Date().toISOString().split('T')[0],
    };

    setSummary(prev => {
      if (!prev) return null;
      return {
        ...prev,
        totalEmployees: prev.totalEmployees + 1,
        totalGrossSalary: prev.totalGrossSalary + gross,
        totalNetDisbursement: prev.totalNetDisbursement + net,
        totalPfContribution: prev.totalPfContribution + pf,
        totalEsiContribution: prev.totalEsiContribution,
        slips: [newSlip, ...prev.slips],
      };
    });

    setIsAddSalaryModalOpen(false);
    showToast(`✅ Salary slip generated for ${newSlip.employeeName} (Net: ₹${net.toLocaleString('en-IN')})!`);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/90 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
              HUMAN CAPITAL & STATUTORY
            </span>
            <span className="text-slate-500 text-xs">PF • ESI • Professional Tax • Form 16 / Salary Slips</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <IndianRupee className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            Staff Payroll & Salary Slips
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Monthly payroll cycle execution, statutory deductions, bank NEFT disbursement, and printable A4 salary slips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-teal-500"
          >
            <option value="September 2026">September 2026</option>
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
          </select>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-600 dark:text-teal-400' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsAddSalaryModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Salary Record
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Staff Roster</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{summary.totalEmployees}</div>
            <div className="text-xs text-teal-600 dark:text-teal-400 mt-1 flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5" /> Active Employees
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Gross Payroll</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹{summary.totalGrossSalary.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Total CTC Accrual</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Net Bank Payout</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{summary.totalNetDisbursement.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400/90 mt-1 flex items-center gap-1 font-medium">
              <CreditCard className="w-3.5 h-3.5" /> Direct Bank Transfer
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">PF Statutory Deposit</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{summary.totalPfContribution.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-blue-700 dark:text-blue-400/90 mt-1 font-medium">Employee + Employer (24%)</div>
          </div>

          <div className="bg-white dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">ESI Health Insurance</div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">₹{summary.totalEsiContribution.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs text-purple-700 dark:text-purple-400/90 mt-1 font-medium">Total ESI Challan (4%)</div>
          </div>
        </div>
      )}

      {/* Salary Slips Table */}
      {summary && (
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Staff Salary Slips: {selectedMonth}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Click &quot;View Payslip&quot; to print statutory salary certificate
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
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
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {summary.slips.map(slip => (
                  <tr key={slip.id} className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{slip.employeeName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">PAN: {slip.panNumber} • UAN: {slip.uanNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700 dark:text-slate-300">
                      {slip.roleName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-slate-900 dark:text-slate-200 font-bold">{slip.daysWorked}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-xs"> / {slip.totalWorkingDays}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      ₹{slip.grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold">
                      -₹{slip.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 text-base">
                      ₹{slip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        slip.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                          : 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                      }`}>
                        {slip.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {slip.paymentStatus}
                      </span>
                      {slip.paymentReference && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{slip.paymentReference}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {slip.paymentStatus !== 'Paid' && (
                          <button
                            onClick={() => handleDisburse(slip.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition cursor-pointer"
                          >
                            <Send className="w-3 h-3" /> Disburse
                          </button>
                        )}
                        <button
                          onClick={() => setActiveSlip(slip)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  Salary Certificate • {activeSlip.employeeName} ({activeSlip.monthYear})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button onClick={() => setActiveSlip(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable A4 Slip Content */}
            <div className="p-6 overflow-y-auto space-y-4 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs">
              {/* Company Header */}
              <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="text-lg font-bold text-slate-900 dark:text-white tracking-wide">PHARMAGRID LOGISTICS & HEALTHCARE PVT LTD</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Plot 42, SIDCO Pharmaceutical Complex, Guindy Industrial Estate, Chennai 600032</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">CDSCO Wholesale Lic: Form 20B/21B-TN-CHN-2024-9982 | GSTIN: 33AAAAA0000A1Z5</div>
                <div className="mt-2 inline-block px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-400 font-bold uppercase tracking-wider text-[11px] border border-slate-200 dark:border-slate-700">
                  PAYSLIP FOR THE MONTH OF {activeSlip.monthYear.toUpperCase()}
                </div>
              </div>

              {/* Employee Particulars Grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div><span className="text-slate-500 dark:text-slate-400">Employee Name: </span><span className="font-semibold text-slate-900 dark:text-white">{activeSlip.employeeName}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Designation: </span><span className="font-semibold text-slate-900 dark:text-white">{activeSlip.roleName}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">PAN Number: </span><span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{activeSlip.panNumber}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">PF UAN: </span><span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{activeSlip.uanNumber}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Total Working Days: </span><span className="font-semibold text-slate-900 dark:text-slate-100">{activeSlip.totalWorkingDays}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Payable Days: </span><span className="font-bold text-emerald-700 dark:text-emerald-400">{activeSlip.daysWorked}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Payment Status: </span><span className="font-bold text-emerald-700 dark:text-emerald-400">{activeSlip.paymentStatus}</span></div>
                <div><span className="text-slate-500 dark:text-slate-400">Bank Reference: </span><span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{activeSlip.paymentReference || 'N/A'}</span></div>
              </div>

              {/* Earnings & Deductions Dual Table */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="bg-slate-100 dark:bg-slate-950 p-2 font-bold text-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    EARNINGS (₹)
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Basic Salary:</span><span className="font-mono font-medium">₹{activeSlip.basicSalary.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>House Rent Allowance (HRA):</span><span className="font-mono font-medium">₹{activeSlip.hra.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Conveyance Allowance:</span><span className="font-mono font-medium">₹{activeSlip.conveyanceAllowance.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Medical Allowance:</span><span className="font-mono font-medium">₹{activeSlip.medicalAllowance.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Special Allowance:</span><span className="font-mono font-medium">₹{activeSlip.specialAllowance.toFixed(2)}</span></div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>GROSS EARNINGS:</span>
                      <span className="text-teal-700 dark:text-teal-400">₹{activeSlip.grossEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/30">
                  <div className="bg-slate-100 dark:bg-slate-950 p-2 font-bold text-slate-800 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                    DEDUCTIONS (₹)
                  </div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between"><span>Provident Fund (PF 12%):</span><span className="font-mono font-medium">₹{activeSlip.pfEmployeeDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Employee State Ins (ESI):</span><span className="font-mono font-medium">₹{activeSlip.esiEmployeeDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Professional Tax (PT):</span><span className="font-mono font-medium">₹{activeSlip.professionalTax.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>TDS / Income Tax:</span><span className="font-mono font-medium">₹{activeSlip.tdsDeduction.toFixed(2)}</span></div>
                    <div className="flex justify-between text-slate-500"><span>Other Recovery:</span><span className="font-mono">₹0.00</span></div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                      <span>TOTAL DEDUCTIONS:</span>
                      <span className="text-rose-700 dark:text-rose-400">₹{activeSlip.totalDeductions.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
                <div>
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">NET DISBURSED SALARY</div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 italic mt-0.5">{activeSlip.netSalaryInWords}</div>
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                  ₹{activeSlip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-[11px] text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-300 dark:border-slate-700 pb-1 font-mono text-slate-500">System Generated</div>
                  <div className="mt-1 font-medium">Employee Signature</div>
                </div>
                <div className="text-center">
                  <div className="w-44 border-b border-slate-300 dark:border-slate-700 pb-1 font-bold text-slate-800 dark:text-slate-300">Selva Kumaran</div>
                  <div className="mt-1 font-medium">Authorized Signatory (HR / Director)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD SALARY RECORD */}
      {isAddSalaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Add Employee Salary Record ({selectedMonth})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculate gross earnings, statutory EPF/ESI/TDS deductions, and net bank disbursement.
                </p>
              </div>
              <button
                onClick={() => setIsAddSalaryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSalarySlip} className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Staff Member Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh V"
                    value={salaryForm.employeeName}
                    onChange={e => setSalaryForm({ ...salaryForm, employeeName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Designation / Role
                  </label>
                  <select
                    value={salaryForm.roleName}
                    onChange={e => setSalaryForm({ ...salaryForm, roleName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-medium focus:border-teal-500 outline-none"
                  >
                    <option value="Warehouse Executive">Warehouse Executive</option>
                    <option value="Billing Cashier">Billing Cashier</option>
                    <option value="Delivery Van Driver">Delivery Van Driver</option>
                    <option value="Accounts Assistant">Accounts Assistant</option>
                    <option value="Inventory Auditor">Inventory Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    value={salaryForm.panNumber}
                    onChange={e => setSalaryForm({ ...salaryForm, panNumber: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono uppercase focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Basic Salary (₹) *
                  </label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={salaryForm.basicSalary}
                    onChange={e => setSalaryForm({ ...salaryForm, basicSalary: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    House Rent Allowance (HRA) (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={salaryForm.hra}
                    onChange={e => setSalaryForm({ ...salaryForm, hra: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Special / Skill Allowance (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={salaryForm.specialAllowance}
                    onChange={e => setSalaryForm({ ...salaryForm, specialAllowance: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono font-bold focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    EPF Statutory Deduction (12% Basic) (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={salaryForm.pfDeduction}
                    onChange={e => setSalaryForm({ ...salaryForm, pfDeduction: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-rose-700 dark:text-rose-400 font-mono font-bold focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Income Tax (TDS) (₹)
                  </label>
                  <input
                    type="number"
                    step="100"
                    value={salaryForm.tdsDeduction}
                    onChange={e => setSalaryForm({ ...salaryForm, tdsDeduction: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-rose-700 dark:text-rose-400 font-mono font-bold focus:border-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    Professional Tax (PT) (₹)
                  </label>
                  <input
                    type="number"
                    value={salaryForm.ptTax}
                    onChange={e => setSalaryForm({ ...salaryForm, ptTax: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-slate-900 dark:text-white font-mono focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Net Estimated Calculation */}
              <div className="p-3 bg-teal-50/50 dark:bg-slate-950/60 rounded-xl border border-teal-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Estimated Net Bank Disbursement:</span>
                  <div className="font-mono text-slate-500 text-[10px]">
                    Gross: ₹{(salaryForm.basicSalary + salaryForm.hra + salaryForm.specialAllowance).toLocaleString('en-IN')} - Deductions: ₹{(salaryForm.pfDeduction + salaryForm.ptTax + salaryForm.tdsDeduction).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="text-lg font-black text-teal-700 dark:text-teal-400 font-mono">
                  ₹{Math.max(0, (salaryForm.basicSalary + salaryForm.hra + salaryForm.specialAllowance) - (salaryForm.pfDeduction + salaryForm.ptTax + salaryForm.tdsDeduction)).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSalaryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Save &amp; Generate Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
