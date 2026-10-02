'use client';

import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Receipt,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  Printer,
  Download,
  Send,
  Lock,
  Unlock,
  RotateCcw
} from 'lucide-react';
import {
  pharmaApi,
  ApiCustomer,
  ApiPendingInvoiceKnockoff,
  ApiChemistAgingSummary,
  ApiChemistAgingBucket,
  ApiPaymentReceiptVoucher
} from '@/services/apiClient';

export default function PaymentCollectionsView() {
  const [activeTab, setActiveTab] = useState<'knockoff' | 'aging' | 'history'>('knockoff');
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Customers & Selection
  const [customers, setCustomers] = useState<ApiCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('c-1');
  const [pendingInvoices, setPendingInvoices] = useState<ApiPendingInvoiceKnockoff[]>([]);
  
  // Knockoff Form State
  const [paymentMode, setPaymentMode] = useState<'CHEQUE' | 'CASH' | 'UPI' | 'NEFT'>('CHEQUE');
  const [collectedAmount, setCollectedAmount] = useState<string>('18450');
  const [chequeNo, setChequeNo] = useState<string>('CHQ-892104');
  const [bankName, setBankName] = useState<string>('HDFC Bank Ltd');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('Cleared against September supply invoices');
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>(['inv-1']);

  // Aging Summary
  const [agingSummary, setAgingSummary] = useState<ApiChemistAgingSummary | null>(null);
  const [agingSearchQuery, setAgingSearchQuery] = useState<string>('');
  const [overdueOnlyFilter, setOverdueOnlyFilter] = useState<boolean>(false);

  // Receipts History
  const [receiptHistory, setReceiptHistory] = useState<ApiPaymentReceiptVoucher[]>([
    {
      receiptId: 'rec-1',
      receiptNumber: 'REC-2026-0410',
      receiptDate: '2026-10-01',
      customerId: 'c-1',
      customerName: 'Apollo Pharmacy - T. Nagar',
      customerCode: 'CUST-APO-01',
      amountCollected: 35000.00,
      paymentMode: 'CHEQUE',
      chequeNumber: 'CHQ-481902',
      chequeBankName: 'HDFC Bank',
      status: 'ChequeInClearance',
      customerBalanceAfterReceipt: 15000.00,
      invoicesSettledCount: 2
    },
    {
      receiptId: 'rec-2',
      receiptNumber: 'REC-2026-0408',
      receiptDate: '2026-09-29',
      customerId: 'c-2',
      customerName: 'MedPlus - Anna Nagar West',
      customerCode: 'CUST-MED-02',
      amountCollected: 25000.00,
      paymentMode: 'UPI',
      upiTransactionRef: 'UPI/29481902189/MED',
      status: 'Realized',
      customerBalanceAfterReceipt: 53400.00,
      invoicesSettledCount: 1
    },
    {
      receiptId: 'rec-3',
      receiptNumber: 'REC-2026-0401',
      receiptDate: '2026-09-26',
      customerId: 'c-4',
      customerName: 'Sri Balaji Medicals - Tambaram',
      customerCode: 'CUST-BAL-04',
      amountCollected: 15000.00,
      paymentMode: 'CASH',
      status: 'Realized',
      customerBalanceAfterReceipt: 74000.00,
      invoicesSettledCount: 1
    }
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadPendingInvoices(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [custList, agingData] = await Promise.all([
        pharmaApi.getCustomers(),
        pharmaApi.getAgingAnalysis()
      ]);
      setCustomers(custList);
      setAgingSummary(agingData);
      if (custList.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custList[0].customerId);
      }
    } catch (err) {
      console.error('Error loading collections initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingInvoices = async (custKey: string) => {
    try {
      const list = await pharmaApi.getPendingInvoices(custKey);
      setPendingInvoices(list);
      if (list.length > 0) {
        setSelectedInvoiceIds([list[0].invoiceId]);
        setCollectedAmount(list[0].outstandingBalance.toString());
      } else {
        setSelectedInvoiceIds([]);
        setCollectedAmount('0');
      }
    } catch (e) {
      console.error('Pending invoices load failed:', e);
    }
  };

  const selectedCustomer = customers.find(c => c.customerId === selectedCustomerId) || {
    customerId: 'c-1',
    code: 'CUST-APO-01',
    name: 'Apollo Pharmacy - T. Nagar',
    customerType: 'RetailChemist',
    creditLimit: 150000,
    currentOutstanding: 45000,
    drugLicense20B: 'TN/CHN/20B/89201',
    drugLicense21B: 'TN/CHN/21B/89202',
    isLicenseValid: true
  };

  // Toggle invoice selection for knockoff
  const toggleInvoiceSelect = (invId: string, outstanding: number) => {
    let nextIds: string[];
    if (selectedInvoiceIds.includes(invId)) {
      nextIds = selectedInvoiceIds.filter(id => id !== invId);
    } else {
      nextIds = [...selectedInvoiceIds, invId];
    }
    setSelectedInvoiceIds(nextIds);

    // Recalculate default collected amount based on selected invoices
    const sum = pendingInvoices
      .filter(i => nextIds.includes(i.invoiceId))
      .reduce((acc, curr) => acc + curr.outstandingBalance, 0);
    setCollectedAmount(sum.toString());
  };

  // Auto FIFO Allocation
  const applyFifoKnockoff = () => {
    let budget = parseFloat(collectedAmount) || 0;
    const autoSelected: string[] = [];

    for (const inv of pendingInvoices) {
      if (budget <= 0) break;
      autoSelected.push(inv.invoiceId);
      budget -= inv.outstandingBalance;
    }

    setSelectedInvoiceIds(autoSelected);
    setActionSuccess('FIFO Knockoff Applied: Oldest bills allocated first against collection amount.');
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Submit Receipt Punch
  const handleRecordReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(collectedAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid receipt collection amount');
      return;
    }

    try {
      const payload = {
        customerId: selectedCustomerId,
        amountCollected: amount,
        paymentMode,
        chequeNumber: paymentMode === 'CHEQUE' ? chequeNo : null,
        chequeBankName: paymentMode === 'CHEQUE' ? bankName : null,
        upiTransactionRef: paymentMode === 'UPI' ? transactionRef : null,
        remarks,
        settledInvoiceIds: selectedInvoiceIds
      };

      const result = await pharmaApi.createPaymentReceipt(payload);

      // Add to receipt history
      setReceiptHistory([result, ...receiptHistory]);
      setActionSuccess(`Receipt Voucher ${result.receiptNumber} punched successfully! ₹${amount.toLocaleString('en-IN')} allocated.`);
      setTimeout(() => setActionSuccess(null), 4000);

      // Refresh pending invoices
      loadPendingInvoices(selectedCustomerId);
    } catch (err: any) {
      alert(err.message || 'Failed to record receipt');
    }
  };

  const filteredAging = (agingSummary?.customerAgingList || []).filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(agingSearchQuery.toLowerCase()) ||
                          item.customerCode.toLowerCase().includes(agingSearchQuery.toLowerCase());
    const matchesOverdue = overdueOnlyFilter ? (item.days1To15 + item.days16To30 + item.days31To45 + item.days46To60 + item.daysOver60) > 0 : true;
    return matchesSearch && matchesOverdue;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Banknote className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Chemist Payment Collections & Knockoff</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                AR Sub-Ledger
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bill-by-bill knockoff engine • Multi-mode receipt punching (Cheque/UPI/Cash) • Marg ERP compatible overdue aging matrix
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ledger
          </button>
          <button
            onClick={() => {
              setActionSuccess('AR Collections & Aging exported as Marg ERP-compatible CSV format.');
              setTimeout(() => setActionSuccess(null), 3000);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export Aging Matrix
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Receivables</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ₹{agingSummary ? (agingSummary.totalReceivables).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '12,45,000.00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">18 Chemist Accounts</span> with balances
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Overdue Amount (&gt;21 Days)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            ₹{agingSummary ? (agingSummary.totalOverdueAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '4,85,000.00'}
          </div>
          <div className="text-[11px] text-amber-500/80 mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>{agingSummary?.totalOverdueCustomers || 5} chemists exceeding credit period</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>High Risk (&gt;60 Days Overdue)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 tracking-tight">
            ₹{agingSummary ? (agingSummary.amountOver60Days).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '78,000.00'}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            <span>Automatic billing lockout activated</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cash Discount Policy</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold text-teal-400 tracking-tight">
            2.00%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Prompt settlement within 7 calendar days
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs px-4 py-3 rounded-xl flex items-center gap-3 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('knockoff')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'knockoff'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          Bill-by-Bill Knockoff & Voucher Punch
        </button>

        <button
          onClick={() => setActiveTab('aging')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'aging'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Chemist Overdue Aging Matrix
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Receipt Register & Vouchers Log
        </button>
      </div>

      {/* TAB 1: BILL-BY-BILL KNOCKOFF */}
      {activeTab === 'knockoff' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Chemist Selection & Pending Invoices Knockoff Table */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Select Chemist Account</h3>
                  <p className="text-xs text-slate-400">Fetch outstanding bills for ledger clearance</p>
                </div>
                <div className="w-full sm:w-64">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl px-3 py-2.5 focus:border-emerald-500 focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chemist Ledger Status Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Credit Limit</span>
                  <span className="font-semibold text-slate-200">
                    ₹{((selectedCustomer as any).creditLimit || 150000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Outstanding</span>
                  <span className="font-bold text-amber-400">
                    ₹{((selectedCustomer as any).currentOutstanding || 45000).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Drug License 20B/21B</span>
                  <span className="font-mono text-emerald-400 text-[11px]">
                    {(selectedCustomer as any).drugLicense20B || 'VALID'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Billing Lock Status</span>
                  {(selectedCustomer as any).currentOutstanding > (selectedCustomer as any).creditLimit ? (
                    <span className="inline-flex items-center gap-1 text-rose-400 font-semibold text-[11px]">
                      <Lock className="w-3 h-3" /> BLOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                      <Unlock className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Pending Invoices Header & Quick Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Unpaid Invoices ({pendingInvoices.length})
                  </h4>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                    Select bills to knock off
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyFifoKnockoff}
                  className="px-2.5 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[11px] font-medium rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3 h-3" />
                  Auto FIFO Allocation
                </button>
              </div>

              {/* Invoices List */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 font-medium border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="py-2.5 px-3">Invoice Details</th>
                      <th className="py-2.5 px-3 text-right">Net Value</th>
                      <th className="py-2.5 px-3 text-right">Balance Due</th>
                      <th className="py-2.5 px-3 text-center">Overdue</th>
                      <th className="py-2.5 px-3 text-right">Cash Disc.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {pendingInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500 font-sans">
                          No pending unpaid invoices for this chemist. Outstanding balance is nil.
                        </td>
                      </tr>
                    ) : (
                      pendingInvoices.map((inv) => {
                        const isSelected = selectedInvoiceIds.includes(inv.invoiceId);
                        return (
                          <tr
                            key={inv.invoiceId}
                            onClick={() => toggleInvoiceSelect(inv.invoiceId, inv.outstandingBalance)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-950/30 text-white' : 'hover:bg-slate-800/40 text-slate-300'
                            }`}
                          >
                            <td className="py-2.5 px-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="rounded border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0 bg-slate-900"
                              />
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-200">{inv.invoiceNumber}</div>
                              <div className="text-[10px] text-slate-500 font-sans">{inv.invoiceDate}</div>
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-300">
                              ₹{inv.totalNetPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-amber-400">
                              ₹{inv.outstandingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {inv.daysOverdue > 0 ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400 font-sans font-medium">
                                  {inv.daysOverdue}d late
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 font-sans font-medium">
                                  Within Terms
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right text-teal-400">
                              {inv.promptPaymentDiscountEligible > 0 ? `₹${inv.promptPaymentDiscountEligible.toFixed(2)}` : '—'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Receipt Voucher Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleRecordReceipt} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Punch Receipt Voucher</h3>
                </div>
                <span className="font-mono text-xs text-slate-400">VCH-AUTO</span>
              </div>

              {/* Payment Mode Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Collection Mode</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'CHEQUE', label: 'Cheque', icon: Banknote },
                    { id: 'CASH', label: 'Cash', icon: Banknote },
                    { id: 'UPI', label: 'UPI QR', icon: QrCode },
                    { id: 'NEFT', label: 'NEFT/RTGS', icon: CreditCard }
                  ].map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setPaymentMode(mode.id as any)}
                        className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                          paymentMode === mode.id
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Collected Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Amount Received (₹) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={collectedAmount}
                    onChange={(e) => setCollectedAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-base rounded-xl pl-8 pr-4 py-2.5 focus:border-emerald-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Conditional Mode Fields */}
              {paymentMode === 'CHEQUE' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cheque Number</label>
                    <input
                      type="text"
                      value={chequeNo}
                      onChange={(e) => setChequeNo(e.target.value)}
                      placeholder="e.g. 481902"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. HDFC / SBI"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {(paymentMode === 'UPI' || paymentMode === 'NEFT') && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    {paymentMode === 'UPI' ? 'UPI UTR / Reference ID' : 'Bank UTR Transaction No.'}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="e.g. UTR-2026-9812903"
                    className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:border-emerald-500"
                  />
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Particulars / Narration</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl p-3 focus:border-emerald-500 focus:outline-none"
                  placeholder="Narration recorded in customer ledger..."
                />
              </div>

              {/* Summary Balance Knockoff Impact */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Selected Invoices for Knockoff:</span>
                  <span className="font-semibold text-white">{selectedInvoiceIds.length} bills</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Current Outstanding:</span>
                  <span className="font-mono text-amber-400">
                    ₹{((selectedCustomer as any).currentOutstanding || 45000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Less: Receipt Credit:</span>
                  <span className="font-mono text-emerald-400">
                    - ₹{(parseFloat(collectedAmount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="border-t border-emerald-500/20 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-white">Est. Balance After Receipt:</span>
                  <span className="font-mono text-emerald-300">
                    ₹{Math.max(0, ((selectedCustomer as any).currentOutstanding || 45000) - (parseFloat(collectedAmount) || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Record Receipt & Knock Off Invoices (F10)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: CHEMIST OVERDUE AGING MATRIX */}
      {activeTab === 'aging' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={agingSearchQuery}
                onChange={(e) => setAgingSearchQuery(e.target.value)}
                placeholder="Search chemist name or code..."
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overdueOnlyFilter}
                  onChange={(e) => setOverdueOnlyFilter(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0 bg-slate-950"
                />
                <span>Show Overdue Only</span>
              </label>

              <button
                onClick={() => {
                  setActionSuccess('SMS & WhatsApp overdue payment reminders dispatched to all delinquent chemists.');
                  setTimeout(() => setActionSuccess(null), 3500);
                }}
                className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all"
              >
                <Send className="w-3 h-3" />
                Send Overdue Reminders
              </button>
            </div>
          </div>

          {/* Aging Matrix Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Chemist Store & Code</th>
                    <th className="py-3 px-4 text-right">Total Outstanding</th>
                    <th className="py-3 px-4 text-right text-emerald-400">Current (0-15d)</th>
                    <th className="py-3 px-4 text-right text-teal-400">16-30 Days</th>
                    <th className="py-3 px-4 text-right text-amber-400">31-45 Days</th>
                    <th className="py-3 px-4 text-right text-orange-400">46-60 Days</th>
                    <th className="py-3 px-4 text-right text-rose-400">&gt; 60 Days</th>
                    <th className="py-3 px-4 text-center">Billing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredAging.map((row) => (
                    <tr key={row.customerId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white font-sans">{row.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 font-sans">
                          <span>{row.customerCode}</span>
                          <span>•</span>
                          <span>{row.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">
                        ₹{row.totalOutstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-400">
                        ₹{row.currentNotDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right text-teal-400">
                        {row.days16To30 > 0 ? `₹${row.days16To30.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-amber-400">
                        {row.days31To45 > 0 ? `₹${row.days31To45.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-orange-400">
                        {row.days46To60 > 0 ? `₹${row.days46To60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-rose-400">
                        {row.daysOver60 > 0 ? `₹${row.daysOver60.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {row.isBlockedForBilling ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            <Lock className="w-3 h-3" /> BLOCKED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIPT VOUCHERS LOG */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Payment Receipt Register</h3>
              <p className="text-xs text-slate-400">Audit trail of collections across counter, cheque clearing, and digital bank routes</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{receiptHistory.length} Vouchers</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Voucher No & Date</th>
                  <th className="py-3 px-4">Chemist Store</th>
                  <th className="py-3 px-4 text-right">Amount Cleared</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-center">Bills Settled</th>
                  <th className="py-3 px-4 text-right">Closing Balance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {receiptHistory.map((rec) => (
                  <tr key={rec.receiptId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{rec.receiptNumber}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{rec.receiptDate}</div>
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{rec.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{rec.customerCode}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-400">
                      ₹{rec.amountCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                        {rec.paymentMode} {rec.chequeNumber ? `(${rec.chequeNumber})` : ''}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {rec.invoicesSettledCount} Bills
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300">
                      ₹{rec.customerBalanceAfterReceipt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center font-sans">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] rounded border border-slate-700 inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        Print Voucher
                      </button>
                    </td>
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
